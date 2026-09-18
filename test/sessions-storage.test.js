const test = require('node:test');
const assert = require('node:assert/strict');
const { Model, Storage, createTestServices } = require('./sessions-loader.js');

function newStorage() {
  return Storage.createStorageService({
    backend: Storage.createMemoryBackend(),
    fileStore: Storage.createMemoryFileStore()
  });
}

// ── CRUD ────────────────────────────────────────────────────────────────────

test('initDB writes the schema version into appMetadata', async () => {
  const storage = newStorage();
  await storage.initDB();
  const metadata = await storage.getAppMetadata();
  assert.equal(metadata.schemaVersion, Model.SCHEMA_VERSION);
  assert.ok(metadata.created_at);
});

test('create stores a normalised record and get reads it back', async () => {
  const storage = newStorage();
  const created = await storage.create('vehicles', { type: 'motorcycle', make: 'Yamaha', model: 'R6' });
  const fetched = await storage.get('vehicles', created.id);
  assert.equal(fetched.make, 'Yamaha');
  assert.deepEqual(fetched.tags, []);
});

test('create rejects a record that fails validation', async () => {
  const storage = newStorage();
  await assert.rejects(
    () => storage.create('setups', { values: { psi: 2 } }),
    /vehicle_id/
  );
});

test('update merges a patch, keeps created_at and refreshes updated_at', async () => {
  const storage = newStorage();
  const session = await storage.create('sessions', { name: 'FP1', location: 'Brands' });
  await new Promise((resolve) => setTimeout(resolve, 2));
  const updated = await storage.update('sessions', session.id, { location: 'Cadwell' });
  assert.equal(updated.name, 'FP1', 'untouched fields survive');
  assert.equal(updated.location, 'Cadwell');
  assert.equal(updated.created_at, session.created_at);
  assert.notEqual(updated.updated_at, session.updated_at);
});

test('update cannot rewrite the id and returns null for a missing record', async () => {
  const storage = newStorage();
  const session = await storage.create('sessions', { name: 'FP1' });
  const updated = await storage.update('sessions', session.id, { id: 'session_hijacked' });
  assert.equal(updated.id, session.id);
  assert.equal(await storage.update('sessions', 'session_nope', { name: 'x' }), null);
});

test('delete removes the record', async () => {
  const storage = newStorage();
  const rider = await storage.create('riders', { name: 'Alex' });
  await storage.delete('riders', rider.id);
  assert.equal(await storage.get('riders', rider.id), undefined);
});

test('stored records are copies, so a caller cannot mutate the store by reference', async () => {
  const storage = newStorage();
  const session = await storage.create('sessions', { name: 'FP1', file_ids: ['f1'] });
  session.file_ids.push('f2');
  const reread = await storage.get('sessions', session.id);
  assert.deepEqual(reread.file_ids, ['f1']);
});

// ── Query ───────────────────────────────────────────────────────────────────

test('list filters on scalar and array fields, with array values meaning "any of"', async () => {
  const storage = newStorage();
  await storage.create('notes', { content: 'a', type: 'pre', session_ids: ['s1'] });
  await storage.create('notes', { content: 'b', type: 'post', session_ids: ['s1', 's2'] });
  await storage.create('notes', { content: 'c', type: 'post', session_ids: ['s3'] });

  assert.equal((await storage.list('notes', { where: { type: 'post' } })).length, 2);
  // Scalar expectation against an array field = "contains".
  assert.equal((await storage.list('notes', { where: { session_ids: 's1' } })).length, 2);
  // Array expectation = "any of".
  assert.equal((await storage.list('notes', { where: { session_ids: ['s2', 's3'] } })).length, 2);
  assert.equal((await storage.list('notes', { where: {} })).length, 3);
});

test('list applies free-text search with AND across tokens', async () => {
  const storage = newStorage();
  await storage.create('notes', { content: 'Front end pushing on entry' });
  await storage.create('notes', { content: 'Rear grip improved' });

  const hit = await storage.list('notes', { text: 'front entry', textFields: ['content'] });
  assert.equal(hit.length, 1);
  assert.equal((await storage.list('notes', { text: 'front rear', textFields: ['content'] })).length, 0);
  assert.equal((await storage.list('notes', { text: '' })).length, 2, 'an empty query filters nothing');
});

test('list filters by date range, sorts, offsets and limits', async () => {
  const storage = newStorage();
  await storage.create('notes', { content: 'one', timestamp: '2026-01-01T00:00:00Z' });
  await storage.create('notes', { content: 'two', timestamp: '2026-02-01T00:00:00Z' });
  await storage.create('notes', { content: 'three', timestamp: '2026-03-01T00:00:00Z' });

  const ranged = await storage.list('notes', {
    dateRange: { field: 'timestamp', from: '2026-01-15T00:00:00Z', to: '2026-02-15T00:00:00Z' }
  });
  assert.deepEqual(ranged.map((n) => n.content), ['two']);

  const sorted = await storage.list('notes', { sortBy: 'timestamp', sortDir: 'desc' });
  assert.deepEqual(sorted.map((n) => n.content), ['three', 'two', 'one']);

  const paged = await storage.list('notes', { sortBy: 'timestamp', offset: 1, limit: 1 });
  assert.deepEqual(paged.map((n) => n.content), ['two']);
});

test('applyQuery sorts records missing the sort field to the end either way', () => {
  const rows = [{ id: 'a', t: '2' }, { id: 'b' }, { id: 'c', t: '1' }];
  assert.deepEqual(Storage.applyQuery(rows, { sortBy: 't' }).map((r) => r.id), ['c', 'a', 'b']);
  assert.deepEqual(Storage.applyQuery(rows, { sortBy: 't', sortDir: 'desc' }).map((r) => r.id), ['a', 'c', 'b']);
});

// ── Backend selection and fallbacks ─────────────────────────────────────────

test('the localStorage shim round-trips records and survives a write failure', async () => {
  const store = new Map();
  const fakeLocalStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, v); },
    removeItem: (k) => { store.delete(k); }
  };
  const original = global.localStorage;
  global.localStorage = fakeLocalStorage;
  try {
    const backend = Storage.createLocalStorageBackend({ dbName: 'test_db' });
    assert.equal(backend.kind, 'localstorage');
    const storage = Storage.createStorageService({ backend, fileStore: Storage.createMemoryFileStore() });
    const session = await storage.create('sessions', { name: 'Shimmed' });
    assert.equal((await storage.get('sessions', session.id)).name, 'Shimmed');

    // A quota failure must not throw out of the service.
    fakeLocalStorage.setItem = () => { throw new Error('QuotaExceeded'); };
    await storage.create('sessions', { name: 'Dropped' });
    assert.equal((await storage.list('sessions')).length, 1);
  } finally {
    if (original === undefined) delete global.localStorage; else global.localStorage = original;
  }
});

test('createAutoBackend falls back to memory when there is no IndexedDB or localStorage', () => {
  assert.equal(Storage.hasIndexedDb(), false, 'Node has no indexedDB, which is the point here');
  assert.equal(Storage.createAutoBackend().kind, 'memory');
});

// ── File record migration ───────────────────────────────────────────────────

test('migrateFileRecordToUuid re-keys a v2 record while keeping its content', () => {
  const v2Record = {
    name: 'brands-r3.csv',
    text: 'Time,Speed\n0,0\n',
    storedAt: '2026-01-02T03:04:05Z',
    hash: 'deadbeef',
    fileMeta: { track: 'Brands Hatch', rider: 'Alex' },
    importerConfig: { decoder: 'gpbikes' }
  };
  const migrated = Storage.migrateFileRecordToUuid(v2Record);

  assert.match(migrated.id, /^file_[0-9a-f-]{36}$/, 'gains a UUID id');
  assert.equal(migrated.name, 'brands-r3.csv', 'filename is kept as a field');
  assert.equal(migrated.text, v2Record.text, 'contents are preserved');
  assert.equal(migrated.hash, 'deadbeef');
  assert.deepEqual(migrated.fileMeta, v2Record.fileMeta);
  assert.deepEqual(migrated.importerConfig, v2Record.importerConfig, 'importer config survives');
  assert.equal(migrated.filetype, 'csv', 'filetype is derived');
  assert.deepEqual(migrated.session_ids, [], 'gains the session-link field');
  assert.equal(migrated.created_at, v2Record.storedAt);
});

test('the file store is bumped to v3 for the UUID re-key', () => {
  assert.equal(Storage.FILE_DB_VERSION, 3);
  assert.equal(Storage.FILE_DB_NAME, 'csvPlotterFiles');
});

test('fileRecordToBundleEntry exports link metadata but never the raw text', () => {
  const entry = Storage.fileRecordToBundleEntry({
    id: 'file_1',
    name: 'run.csv',
    text: 'Time,Speed\n0,0\n',
    storedAt: '2026-01-02T03:04:05Z',
    hash: 'abc',
    fileMeta: { track: 'Brands' },
    importerConfig: { decoder: 'gpbikes' },
    session_ids: ['session_1'],
    vehicle_id: 'vehicle_1',
    tags: ['wet']
  });

  assert.equal(entry.filename, 'run.csv', 'exported under the spec name');
  assert.equal(entry.uploaded_at, '2026-01-02T03:04:05Z');
  assert.deepEqual(entry.session_ids, ['session_1']);
  assert.equal(entry.vehicle_id, 'vehicle_1');
  assert.deepEqual(entry.metadata.fileMeta, { track: 'Brands' });
  assert.equal('text' in entry, false, 'raw log text must not be inlined');
  assert.equal('importerConfig' in entry, false);
});

// ── Export / import ─────────────────────────────────────────────────────────

async function seed() {
  const kit = createTestServices();
  const { services } = kit;
  await services.initDB();
  const user = await services.UserService.ensureLocalUser();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle', make: 'Yamaha', model: 'R6' });
  const rider = await services.RiderService.createRider({ name: 'Alex' });
  const session = await services.SessionService.createSession({
    name: 'Brands FP1', location: 'Brands Hatch', start_time: '2026-05-01T09:00:00Z'
  });
  await services.SessionService.addVehicleToSession(session.id, vehicle.id);
  await services.SessionService.addRiderToSession(session.id, rider.id);
  const setup = await services.SetupService.createSetup({
    vehicle_id: vehicle.id, session_id: session.id, name: 'Baseline', values: { front_psi: 2.1 }
  });
  const file = await services.FileService.storeFile('run1.csv', 'Time,Speed\n0,0\n', 'h1', { track: 'Brands Hatch' });
  await services.SessionService.addFileToSession(session.id, file.id);
  await services.SetupService.applySetupToFile(file.id, setup.id);
  const note = await services.NoteService.createNote({
    session_ids: [session.id], content: 'Front pushing on entry', type: 'post', tags: ['front']
  });
  await services.SessionService.addKPI(session.id, { type: 'best_lap', kpi: 92.55 });
  return Object.assign(kit, { user, vehicle, rider, session, setup, file, note });
}

test('exportAll produces exactly the bundle keys the spec names', async () => {
  const { services } = await seed();
  const bundle = await services.ExportService.exportAll();
  assert.deepEqual(Object.keys(bundle), [
    'schemaVersion', 'exportedAt', 'users', 'riders', 'vehicles', 'setups',
    'sessions', 'notes', 'files', 'mediaIndex', 'appMetadata'
  ]);
  assert.equal(bundle.schemaVersion, Model.SCHEMA_VERSION);
  assert.match(bundle.exportedAt, /^\d{4}-\d{2}-\d{2}T.*Z$/);
  assert.equal(bundle.sessions.length, 1);
  assert.equal(bundle.files.length, 1);
});

test('export/import round-trips into a fresh instance with every reference intact', async () => {
  const source = await seed();
  const bundle = await source.services.ExportService.exportAll();

  const target = createTestServices();
  // The file's contents are stored first, as a real restore does, so the bundle's file
  // links land on a record that actually has the log text.
  await target.services.FileService.storeFile('run1.csv', 'Time,Speed\n0,0\n', 'h1', { track: 'Brands Hatch' });
  const result = await target.services.ExportService.importAll(bundle);

  assert.equal(result.ok, true, result.problems.join('; '));
  assert.deepEqual(result.problems, []);

  const sessions = await target.services.SessionService.listSessions();
  assert.equal(sessions.length, 1);
  const detail = await target.services.SessionService.getSessionDetail(sessions[0].id);
  assert.equal(detail.session.name, 'Brands FP1');
  assert.equal(detail.vehicles.length, 1, 'vehicle link resolved');
  assert.equal(detail.riders.length, 1, 'rider link resolved');
  assert.equal(detail.notes.length, 1, 'note link resolved');
  assert.equal(detail.files.length, 1, 'file link resolved onto the locally stored file');
  assert.equal(detail.files[0].text, 'Time,Speed\n0,0\n', 'local log text is kept, not clobbered');
  assert.deepEqual(detail.session.kpis, [{ type: 'best_lap', kpi: 92.55 }]);

  const setups = await target.services.SetupService.getSetupsByVehicle(detail.vehicles[0].id);
  assert.equal(setups.length, 1);
  assert.equal(setups[0].session_id, detail.session.id, 'setup still points at the session');
});

test('importing the same bundle twice remaps colliding ids and keeps references consistent', async () => {
  const source = await seed();
  const bundle = await source.services.ExportService.exportAll();

  const target = createTestServices();
  await target.services.ExportService.importAll(bundle);
  const second = await target.services.ExportService.importAll(bundle);

  assert.equal(second.ok, true, second.problems.join('; '));
  assert.ok(Object.keys(second.idMap).length > 0, 'collisions should be reported as a mapping');

  const sessions = await target.services.SessionService.listSessions();
  assert.equal(sessions.length, 2, 'the second import is a separate copy');

  const sessionIds = new Set(sessions.map((s) => s.id));
  const vehicleIds = new Set((await target.services.VehicleService.listVehicles()).map((v) => v.id));
  const notes = await target.services.NoteService.listNotes();
  assert.equal(notes.length, 2);
  assert.ok(
    notes.every((n) => n.session_ids.every((id) => sessionIds.has(id))),
    'every remapped note points at a session that exists'
  );
  assert.ok(
    sessions.every((s) => s.vehicle_ids.every((id) => vehicleIds.has(id))),
    'every remapped session points at a vehicle that exists'
  );
});

test('a note pinned to a plot location has its file_id remapped on a colliding re-import', async () => {
  const source = await seed();
  await source.services.NoteService.createNote({
    session_ids: [source.session.id], content: 'Front pushing here', type: 'during',
    location: { kind: 'plot', file_id: source.file.id, x: 812.5, lap: 3, x_axis: 'distance', channel: 'Speed', value: 143.2 }
  });
  const bundle = await source.services.ExportService.exportAll();

  const target = createTestServices();
  await target.services.FileService.storeFile('run1.csv', 'Time,Speed\n0,0\n', 'h1');
  await target.services.ExportService.importAll(bundle); // first import: no collisions yet
  const second = await target.services.ExportService.importAll(bundle); // second: everything collides

  assert.equal(second.ok, true, second.problems.join('; '));
  const notes = (await target.services.NoteService.listNotes()).filter((n) => n.location && n.location.kind === 'plot');
  assert.equal(notes.length, 2);
  const fileIds = new Set((await target.services.FileService.listFiles()).map((f) => f.id));
  assert.ok(
    notes.every((n) => fileIds.has(n.location.file_id)),
    'every note\'s pinned file_id must point at a file that actually exists after remapping'
  );
});

test('overwriteMatchingIds reinstates a backup instead of duplicating it', async () => {
  const source = await seed();
  const bundle = await source.services.ExportService.exportAll();

  const target = createTestServices();
  await target.services.ExportService.importAll(bundle, { overwriteMatchingIds: true });
  const second = await target.services.ExportService.importAll(bundle, { overwriteMatchingIds: true });

  assert.equal(second.ok, true, second.problems.join('; '));
  assert.equal((await target.services.SessionService.listSessions()).length, 1, 'no duplicate sessions');
  assert.equal((await target.services.NoteService.listNotes()).length, 1, 'no duplicate notes');
});

test('replaceExisting wipes local data before importing', async () => {
  const source = await seed();
  const bundle = await source.services.ExportService.exportAll();

  const target = createTestServices();
  await target.services.SessionService.createSession({ name: 'Local session to be replaced' });
  const result = await target.services.ExportService.importAll(bundle, { replaceExisting: true });

  assert.equal(result.ok, true, result.problems.join('; '));
  const sessions = await target.services.SessionService.listSessions();
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].name, 'Brands FP1');
});

test('dryRun reports counts without writing anything', async () => {
  const source = await seed();
  const bundle = await source.services.ExportService.exportAll();

  const target = createTestServices();
  const result = await target.services.ExportService.importAll(bundle, { dryRun: true });

  assert.equal(result.ok, true);
  assert.equal(result.dryRun, true);
  assert.equal(result.counts.sessions, 1);
  assert.equal(result.counts.notes, 1);
  assert.equal((await target.services.SessionService.listSessions()).length, 0, 'nothing was written');
});

test('import validates schemaVersion and refuses an incompatible major', async () => {
  const target = createTestServices();

  const noVersion = await target.services.ExportService.importAll({ sessions: [] });
  assert.equal(noVersion.ok, false);
  assert.match(noVersion.problems[0], /schemaVersion/);

  const wrongMajor = await target.services.ExportService.importAll({ schemaVersion: '9.0', sessions: [] });
  assert.equal(wrongMajor.ok, false);
  assert.match(wrongMajor.problems[0], /not compatible/);

  const notAnObject = await target.services.ExportService.importAll(null);
  assert.equal(notAnObject.ok, false);
});

test('import accepts a newer minor version but warns about it', async () => {
  const source = await seed();
  const bundle = await source.services.ExportService.exportAll();
  bundle.schemaVersion = '1.5';

  const target = createTestServices();
  const result = await target.services.ExportService.importAll(bundle);
  assert.equal(result.ok, true, result.problems.join('; '));
  assert.ok(result.warnings.some((w) => /1\.5/.test(w)), 'the version gap should be surfaced');
});

test('migrateLocalUsers reassigns authored notes to the claimed cloud user', async () => {
  const source = await seed();
  const bundle = await source.services.ExportService.exportAll();
  const localUserId = source.user.id;

  const target = createTestServices();
  const result = await target.services.ExportService.importAll(bundle, {
    migrateLocalUsers: { [localUserId]: 'user_cloud_42' }
  });

  assert.equal(result.ok, true, result.problems.join('; '));
  const notes = await target.services.NoteService.listNotes();
  assert.equal(notes[0].author_id, 'user_cloud_42', 'note authorship was claimed');
  const users = await target.services.UserService.listUsers();
  assert.ok(users.some((u) => u.id === 'user_cloud_42'));
  assert.ok(!users.some((u) => u.id === localUserId), 'the local id is gone');
});

test('a bundle referencing an unstored file imports as metadata only, with a warning', async () => {
  const source = await seed();
  const bundle = await source.services.ExportService.exportAll();

  const target = createTestServices();
  const result = await target.services.ExportService.importAll(bundle);

  assert.equal(result.ok, true, result.problems.join('; '));
  assert.ok(
    result.warnings.some((w) => /run1\.csv/.test(w) && /not stored locally/.test(w)),
    'the missing log contents should be called out: ' + JSON.stringify(result.warnings)
  );
  const files = await target.services.FileService.listFiles();
  assert.equal(files.length, 1);
  assert.equal(files[0].text, undefined, 'no log text was invented');
});

test('import reports a validation problem instead of writing a broken record', async () => {
  const target = createTestServices();
  const result = await target.services.ExportService.importAll({
    schemaVersion: Model.SCHEMA_VERSION,
    setups: [{ id: 'setup_1', values: {} }] // no vehicle_id
  });
  assert.equal(result.ok, false);
  assert.match(result.problems.join(' '), /vehicle_id/);
  assert.equal((await target.storage.list('setups')).length, 0);
});

test('media is exported as references by default', async () => {
  const kit = createTestServices();
  await kit.services.initDB();
  await kit.services.MediaService.saveMediaReference('https://example.com/p.jpg', 'p.jpg', 'image/jpeg');
  const bundle = await kit.services.ExportService.exportAll();
  assert.equal(bundle.mediaIndex.length, 1);
  assert.equal(bundle.mediaIndex[0].url, 'https://example.com/p.jpg');
  assert.equal('blob' in bundle.mediaIndex[0], false, 'a stored blob is never inlined by default');
  assert.equal(bundle.appMetadata.exportSettings.includeMediaBlobs, false);
});

test('base64ToBlob returns null rather than throwing where Blob/atob are unavailable', () => {
  assert.equal(Storage.base64ToBlob('!!!not base64!!!', 'image/png'), null);
});
