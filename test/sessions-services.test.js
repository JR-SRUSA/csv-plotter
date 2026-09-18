const test = require('node:test');
const assert = require('node:assert/strict');
const { Services, Storage, createTestServices } = require('./sessions-loader.js');

// ── UserService ─────────────────────────────────────────────────────────────

test('ensureLocalUser creates a device-local user on first run and reuses it after', async () => {
  const { services } = createTestServices();
  const first = await services.UserService.ensureLocalUser();
  assert.match(first.id, /^user_local_/);
  assert.equal(first.role, 'local');

  const second = await services.UserService.ensureLocalUser();
  assert.equal(second.id, first.id, 'the same author is reused');
  assert.equal((await services.UserService.listUsers()).length, 1, 'no duplicate users');
});

test('setLocalUserName renames the local user, creating one first if needed', async () => {
  const { services } = createTestServices();
  const renamed = await services.UserService.setLocalUserName('Jo Mercer');
  assert.match(renamed.id, /^user_local_/, 'created the local user on first use');
  assert.equal(renamed.name, 'Jo Mercer');

  const again = await services.UserService.setLocalUserName('Jo M.');
  assert.equal(again.id, renamed.id, 'same user, renamed in place');
  assert.equal((await services.UserService.listUsers()).length, 1);

  // Blank input falls back to the original default rather than storing an empty name.
  const blanked = await services.UserService.setLocalUserName('   ');
  assert.equal(blanked.name, 'This device');

  const session = await services.SessionService.createSession({ name: 'FP1' });
  const note = await services.NoteService.createNote({ session_ids: [session.id], content: 'x' });
  await services.UserService.setLocalUserName('Renamed Again');
  assert.equal((await services.NoteService.getNote(note.id)).author_id, renamed.id, 'existing notes keep the same author id');
});

test('ensureLocalUser remembers the current user across a fresh services instance', async () => {
  const kit = createTestServices();
  const first = await kit.services.UserService.ensureLocalUser();

  // Same storage, new services object: simulates a page reload.
  const reloaded = Services.createServices({ storage: kit.storage });
  const after = await reloaded.UserService.ensureLocalUser();
  assert.equal(after.id, first.id);
});

test('migrateLocalUserToCloud reassigns notes and setups, then retires the local user', async () => {
  const { services } = createTestServices();
  const local = await services.UserService.ensureLocalUser();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle' });
  const session = await services.SessionService.createSession({ name: 'FP1' });
  await services.NoteService.createNote({ session_ids: [session.id], content: 'mine' });
  await services.SetupService.createSetup({ vehicle_id: vehicle.id, author_id: local.id, values: { psi: 2 } });

  const result = await services.UserService.migrateLocalUserToCloud(local.id, 'user_cloud_7', {
    cloudUser: { name: 'Alex Cloud' }
  });

  assert.equal(result.counts.notes, 1);
  assert.equal(result.counts.setups, 1);
  const notes = await services.NoteService.listNotes();
  assert.equal(notes[0].author_id, 'user_cloud_7');
  const setups = await services.SetupService.getSetupsByVehicle(vehicle.id);
  assert.equal(setups[0].author_id, 'user_cloud_7');
  assert.equal(await services.UserService.getUser(local.id), undefined, 'local user is gone');
  assert.equal((await services.UserService.getUser('user_cloud_7')).name, 'Alex Cloud');
  assert.equal((await services.UserService.ensureLocalUser()).id, 'user_cloud_7', 'now the current author');
});

test('migrateLocalUserToCloud can keep the local user when asked', async () => {
  const { services } = createTestServices();
  const local = await services.UserService.ensureLocalUser();
  await services.UserService.migrateLocalUserToCloud(local.id, 'user_cloud_8', { keepLocalUser: true });
  assert.ok(await services.UserService.getUser(local.id), 'local user was kept');
});

test('migrateLocalUserToCloud requires both ids', async () => {
  const { services } = createTestServices();
  await assert.rejects(() => services.UserService.migrateLocalUserToCloud('user_local_1', ''), /requires both/);
});

// ── SetupService: append-only versioning ────────────────────────────────────

test('reviseSetup writes a new record and never mutates the original', async () => {
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle', make: 'Yamaha' });
  const baseline = await services.SetupService.createSetup({
    vehicle_id: vehicle.id, name: 'Baseline', values: { front_psi: 2.1, rear_psi: 1.9 }
  });

  const revised = await services.SetupService.reviseSetup(baseline.id, {
    values: { rear_psi: 1.8 }, name: 'Soft Rear'
  });

  const original = await services.SetupService.getSetup(baseline.id);
  assert.deepEqual(original.values, { front_psi: 2.1, rear_psi: 1.9 }, 'history is immutable');
  assert.equal(original.name, 'Baseline');
  assert.notEqual(revised.id, baseline.id, 'a revision is a new record');
  assert.equal(revised.supersedes_id, baseline.id, 'the chain is traceable');
  assert.deepEqual(revised.values, { front_psi: 2.1, rear_psi: 1.8 }, 'unchanged values carry over');
  assert.equal((await services.SetupService.getSetupsByVehicle(vehicle.id)).length, 2);
});

test('updating a vehicle does not touch its setups', async () => {
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle', make: 'Yamaha' });
  const setup = await services.SetupService.createSetup({ vehicle_id: vehicle.id, values: { psi: 2.1 } });

  await services.VehicleService.updateVehicle(vehicle.id, { model: 'R6', year: 2020 });

  const setups = await services.SetupService.getSetupsByVehicle(vehicle.id);
  assert.equal(setups.length, 1, 'no setup was created or removed');
  assert.equal(setups[0].id, setup.id);
  assert.deepEqual(setups[0].values, { psi: 2.1 });
});

test('getLatestSetup prefers the session-scoped setup, else the newest overall', async () => {
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle' });
  const session = await services.SessionService.createSession({ name: 'FP1' });

  const general = await services.SetupService.createSetup({
    vehicle_id: vehicle.id, values: { psi: 2.0 }, timestamp: '2026-05-01T09:00:00Z'
  });
  const scoped = await services.SetupService.createSetup({
    vehicle_id: vehicle.id, session_id: session.id, values: { psi: 2.2 }, timestamp: '2026-04-01T09:00:00Z'
  });

  assert.equal((await services.SetupService.getLatestSetup(vehicle.id)).id, general.id, 'newest overall');
  assert.equal(
    (await services.SetupService.getLatestSetup(vehicle.id, session.id)).id,
    scoped.id,
    'the session-scoped setup wins even though it is older'
  );
  assert.equal(await services.SetupService.getLatestSetup('vehicle_nope'), null);
});

test('getLatestSetup breaks a timestamp tie using the supersedes_id chain, not array order', async () => {
  // Two revisions can legitimately share a millisecond timestamp (setSessionMass calling
  // reviseSetup twice in a row is the real-world case that first surfaced this). A plain
  // "sort by timestamp desc" is not stable-sort-safe against that -- this pins the fix.
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle' });
  const tiedTimestamp = '2026-05-01T09:00:00.000Z';

  const original = await services.SetupService.createSetup({
    vehicle_id: vehicle.id, values: { mass_kg: 175 }, timestamp: tiedTimestamp
  });
  const revision = await services.SetupService.reviseSetup(original.id, {
    values: { mass_kg: 172 }, timestamp: tiedTimestamp
  });

  const latest = await services.SetupService.getLatestSetup(vehicle.id);
  assert.equal(latest.id, revision.id);
  assert.equal(latest.values.mass_kg, 172);
});

test('reviseSetup rejects an unknown setup id', async () => {
  const { services } = createTestServices();
  await assert.rejects(() => services.SetupService.reviseSetup('setup_nope', {}), /No setup with id/);
});

test('applySetupToFile links the setup that the bike ran for a log', async () => {
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle' });
  const setup = await services.SetupService.createSetup({ vehicle_id: vehicle.id, values: { psi: 2.1 } });
  const file = await services.FileService.storeFile('run.csv', 'Time\n0\n');

  await services.SetupService.applySetupToFile(file.id, setup.id);
  assert.equal((await services.FileService.getFile(file.id)).setup_id, setup.id);
});

// ── Add to session ──────────────────────────────────────────────────────────

test('addFileToSession links both sides and is idempotent', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  const file = await services.FileService.storeFile('run.csv', 'Time\n0\n');

  await services.SessionService.addFileToSession(session.id, file.id);
  await services.SessionService.addFileToSession(session.id, file.id);

  const storedFile = await services.FileService.getFile(file.id);
  const storedSession = await services.SessionService.getSession(session.id);
  assert.deepEqual(storedFile.session_ids, [session.id]);
  assert.deepEqual(storedSession.file_ids, [file.id], 'no duplicate entry from the second call');
});

test('a file can belong to several sessions, and be detached from one', async () => {
  const { services } = createTestServices();
  const a = await services.SessionService.createSession({ name: 'FP1' });
  const b = await services.SessionService.createSession({ name: 'FP2' });
  const file = await services.FileService.storeFile('run.csv', 'Time\n0\n');

  await services.SessionService.addFileToSession(a.id, file.id);
  await services.SessionService.addFileToSession(b.id, file.id);
  assert.equal((await services.FileService.getFile(file.id)).session_ids.length, 2);

  await services.SessionService.removeFileFromSession(a.id, file.id);
  assert.deepEqual((await services.FileService.getFile(file.id)).session_ids, [b.id]);
  assert.deepEqual((await services.SessionService.getSession(a.id)).file_ids, []);
  assert.deepEqual((await services.SessionService.getSession(b.id)).file_ids, [file.id], 'the other side is untouched');
});

test('re-storing a file under the same name keeps its id and session links', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  const file = await services.FileService.storeFile('run.csv', 'Time\n0\n', 'hash1');
  await services.SessionService.addFileToSession(session.id, file.id);

  // Re-opening the same file in the plotter must not orphan it from its session.
  const restored = await services.FileService.storeFile('run.csv', 'Time\n0\n1\n', 'hash2');

  assert.equal(restored.id, file.id, 'the record id is stable');
  assert.deepEqual(restored.session_ids, [session.id], 'session links survive');
  assert.equal(restored.text, 'Time\n0\n1\n', 'contents are refreshed');
  assert.equal(restored.hash, 'hash2');
  assert.equal((await services.FileService.listFiles()).length, 1, 'no duplicate record');
});

test('ingestCSV records column metadata and can attach to a session in one step', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  const record = await services.FileService.ingestCSV(
    'run.csv',
    'Time,Speed\n0,0\n1,10\n',
    { columns: ['Time', 'Speed'], rows: [{}, {}], lapCount: 3 },
    { session_id: session.id }
  );

  assert.deepEqual(record.metadata.columns, ['Time', 'Speed']);
  assert.equal(record.metadata.row_count, 2);
  assert.equal(record.metadata.lap_count, 3);
  assert.deepEqual(record.session_ids, [session.id]);
  assert.deepEqual((await services.SessionService.getSession(session.id)).file_ids, [record.id]);
});

test('listFilesForSession returns only that session\'s files', async () => {
  const { services } = createTestServices();
  const a = await services.SessionService.createSession({ name: 'FP1' });
  const one = await services.FileService.storeFile('one.csv', 'x');
  await services.FileService.storeFile('two.csv', 'y');
  await services.SessionService.addFileToSession(a.id, one.id);

  const files = await services.FileService.listFilesForSession(a.id);
  assert.deepEqual(files.map((f) => f.name), ['one.csv']);
});

test('vehicles and riders attach to a session and can be unlinked', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle' });
  const rider = await services.RiderService.createRider({ name: 'Alex' });

  await services.SessionService.addVehicleToSession(session.id, vehicle.id);
  await services.SessionService.addRiderToSession(session.id, rider.id);
  await services.SessionService.addVehicleToSession(session.id, vehicle.id);

  let stored = await services.SessionService.getSession(session.id);
  assert.deepEqual(stored.vehicle_ids, [vehicle.id]);
  assert.deepEqual(stored.rider_ids, [rider.id]);

  await services.SessionService.removeVehicleFromSession(session.id, vehicle.id);
  stored = await services.SessionService.getSession(session.id);
  assert.deepEqual(stored.vehicle_ids, []);
});

// ── KPIs ────────────────────────────────────────────────────────────────────

test('KPI add/update/remove works and keeps one entry per type', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });

  await services.SessionService.addKPI(session.id, { type: 'best_lap', kpi: '92.55' });
  assert.deepEqual(await services.SessionService.getKPIs(session.id), [{ type: 'best_lap', kpi: 92.55 }]);

  await services.SessionService.addKPI(session.id, { type: 'best_lap', kpi: 91.2 });
  assert.deepEqual(
    await services.SessionService.getKPIs(session.id),
    [{ type: 'best_lap', kpi: 91.2 }],
    'adding an existing type replaces rather than appends'
  );

  await services.SessionService.addKPI(session.id, { type: 'avg_speed', kpi: 118 });
  await services.SessionService.updateKPI(session.id, 'avg_speed', 120);
  assert.equal((await services.SessionService.getKPIs(session.id)).length, 2);

  await services.SessionService.removeKPI(session.id, 'best_lap');
  assert.deepEqual(await services.SessionService.getKPIs(session.id), [{ type: 'avg_speed', kpi: 120 }]);
});

test('addKPI rejects a KPI with no type and getKPIs is empty for a new session', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  assert.deepEqual(await services.SessionService.getKPIs(session.id), []);
  await assert.rejects(() => services.SessionService.addKPI(session.id, { type: '  ', kpi: 1 }), /non-empty type/);
});

// ── Notes ───────────────────────────────────────────────────────────────────

test('createNote defaults the author and timestamp, and back-references the session', async () => {
  const { services } = createTestServices();
  const user = await services.UserService.ensureLocalUser();
  const session = await services.SessionService.createSession({ name: 'FP1' });

  const note = await services.NoteService.createNote({ session_ids: [session.id], content: 'Front pushing' });

  assert.equal(note.author_id, user.id);
  assert.ok(note.timestamp);
  assert.equal(note.type, 'during', 'defaults to during');
  assert.deepEqual((await services.SessionService.getSession(session.id)).note_ids, [note.id]);
});

test('a note links to several sessions, and unlinking leaves the others alone', async () => {
  const { services } = createTestServices();
  const a = await services.SessionService.createSession({ name: 'FP1' });
  const b = await services.SessionService.createSession({ name: 'FP2' });
  const c = await services.SessionService.createSession({ name: 'FP3' });

  const note = await services.NoteService.createNote({ session_ids: [a.id], content: 'Track went green' });
  await services.NoteService.linkNoteToSessions(note.id, [b.id, c.id]);

  const linked = await services.NoteService.getNote(note.id);
  assert.deepEqual(linked.session_ids.slice().sort(), [a.id, b.id, c.id].sort());
  assert.deepEqual((await services.SessionService.getSession(b.id)).note_ids, [note.id]);

  await services.NoteService.unlinkNoteFromSession(note.id, b.id);
  assert.equal((await services.NoteService.getNote(note.id)).session_ids.indexOf(b.id), -1);
  assert.deepEqual((await services.SessionService.getSession(b.id)).note_ids, [], 'back-reference cleared');
  assert.deepEqual((await services.SessionService.getSession(c.id)).note_ids, [note.id], 'others untouched');
});

test('updateNote with session_ids syncs both added and removed back-references', async () => {
  const { services } = createTestServices();
  const a = await services.SessionService.createSession({ name: 'FP1' });
  const b = await services.SessionService.createSession({ name: 'FP2' });
  const note = await services.NoteService.createNote({ session_ids: [a.id], content: 'x' });

  await services.NoteService.updateNote(note.id, { session_ids: [b.id] });

  assert.deepEqual((await services.SessionService.getSession(a.id)).note_ids, [], 'removed');
  assert.deepEqual((await services.SessionService.getSession(b.id)).note_ids, [note.id], 'added');
});

test('searchNotes filters by text, author, type, tags and date range', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  await services.NoteService.createNote({
    session_ids: [session.id], content: 'Front end pushing on entry', type: 'post',
    tags: ['front'], timestamp: '2026-05-01T09:00:00Z'
  });
  await services.NoteService.createNote({
    session_ids: [session.id], content: 'Rear grip improved with lower pressure', type: 'pre',
    tags: ['rear'], timestamp: '2026-05-02T09:00:00Z'
  });

  assert.equal((await services.NoteService.searchNotes({ text: 'pushing entry' })).length, 1);
  assert.equal((await services.NoteService.searchNotes({ text: 'pushing grip' })).length, 0, 'AND across tokens');
  assert.equal((await services.NoteService.searchNotes({ text: 'FRONT' })).length, 1, 'case-insensitive');
  assert.equal((await services.NoteService.searchNotes({ type: 'pre' })).length, 1);
  assert.equal((await services.NoteService.searchNotes({ tags: ['rear'] })).length, 1);
  assert.equal((await services.NoteService.searchNotes({ session_id: session.id })).length, 2);
  assert.equal((await services.NoteService.searchNotes({
    dateRange: { field: 'timestamp', from: '2026-05-02T00:00:00Z' }
  })).length, 1);
});

test('listNotes returns newest first by default', async () => {
  const { services } = createTestServices();
  await services.NoteService.createNote({ content: 'older', timestamp: '2026-05-01T09:00:00Z' });
  await services.NoteService.createNote({ content: 'newer', timestamp: '2026-05-03T09:00:00Z' });
  const notes = await services.NoteService.listNotes();
  assert.deepEqual(notes.map((n) => n.content), ['newer', 'older']);
});

// ── Cascade delete ──────────────────────────────────────────────────────────

test('deleting a session unlinks its files and notes but keeps them', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  const file = await services.FileService.storeFile('run.csv', 'Time\n0\n');
  await services.SessionService.addFileToSession(session.id, file.id);
  const note = await services.NoteService.createNote({ session_ids: [session.id], content: 'note' });

  await services.SessionService.deleteSession(session.id);

  assert.equal(await services.SessionService.getSession(session.id), undefined);
  const keptFile = await services.FileService.getFile(file.id);
  const keptNote = await services.NoteService.getNote(note.id);
  assert.ok(keptFile, 'the log file itself is kept');
  assert.deepEqual(keptFile.session_ids, [], 'but no longer references the session');
  assert.ok(keptNote, 'the note is kept');
  assert.deepEqual(keptNote.session_ids, []);
});

test('deleting a vehicle unlinks it everywhere and deletes the setups it owned', async () => {
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle' });
  const session = await services.SessionService.createSession({ name: 'FP1' });
  await services.SessionService.addVehicleToSession(session.id, vehicle.id);
  const setup = await services.SetupService.createSetup({ vehicle_id: vehicle.id, values: { psi: 2 } });
  const note = await services.NoteService.createNote({ content: 'x', vehicle_id: vehicle.id });
  const file = await services.FileService.storeFile('run.csv', 'x');
  await services.FileService.updateFileLinks(file.id, { vehicle_id: vehicle.id, setup_id: setup.id });

  await services.VehicleService.deleteVehicle(vehicle.id);

  assert.deepEqual((await services.SessionService.getSession(session.id)).vehicle_ids, []);
  assert.equal((await services.NoteService.getNote(note.id)).vehicle_id, null);
  assert.equal((await services.FileService.getFile(file.id)).vehicle_id, undefined);
  // A setup sheet describes a specific bike, so it goes with the bike rather than being
  // left orphaned (vehicle_id is required, so there is no valid "no vehicle" setup).
  assert.equal(await services.storage.get('setups', setup.id), undefined, 'owned setup deleted');
  assert.equal(
    (await services.FileService.getFile(file.id)).setup_id,
    undefined,
    'the deleted setup is also scrubbed off the file that referenced it'
  );
  // Files and notes are independent artefacts and must survive.
  assert.ok(await services.FileService.getFile(file.id));
  assert.ok(await services.NoteService.getNote(note.id));
});

test('deleting a file removes it and unlinks it from its sessions', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  const file = await services.FileService.storeFile('run.csv', 'x');
  await services.SessionService.addFileToSession(session.id, file.id);

  await services.FileService.deleteFile(file.id);

  assert.equal(await services.FileService.getFile(file.id), undefined);
  assert.deepEqual((await services.SessionService.getSession(session.id)).file_ids, []);
});

// ── MediaService, including the camera permission flow ──────────────────────

test('requestCamera reports unavailable when the browser has no mediaDevices', async () => {
  const { services } = createTestServices();
  const result = await services.MediaService.requestCamera();
  assert.deepEqual(result, { ok: false, reason: 'unavailable' });
});

test('requestCamera resolves with the stream when permission is granted', async () => {
  const fakeStream = { getTracks: () => [] };
  const calls = [];
  const storage = Storage.createStorageService({
    backend: Storage.createMemoryBackend(), fileStore: Storage.createMemoryFileStore()
  });
  const original = global.navigator;
  global.navigator = {
    mediaDevices: {
      getUserMedia: (constraints) => { calls.push(constraints); return Promise.resolve(fakeStream); }
    }
  };
  try {
    const services = Services.createServices({ storage });
    const result = await services.MediaService.requestCamera({ video: true });
    assert.equal(result.ok, true);
    assert.equal(result.stream, fakeStream);
    assert.deepEqual(calls, [{ video: true }], 'asks for video only, once');
  } finally {
    if (original === undefined) delete global.navigator; else global.navigator = original;
  }
});

test('requestCamera reports a denial distinctly so the UI can fall back to the file picker', async () => {
  const storage = Storage.createStorageService({
    backend: Storage.createMemoryBackend(), fileStore: Storage.createMemoryFileStore()
  });
  const original = global.navigator;
  try {
    for (const [errName, expected] of [
      ['NotAllowedError', 'denied'],
      ['SecurityError', 'denied'],
      ['NotFoundError', 'unavailable']
    ]) {
      global.navigator = {
        mediaDevices: {
          getUserMedia: () => {
            const err = new Error('nope');
            err.name = errName;
            return Promise.reject(err);
          }
        }
      };
      const services = Services.createServices({ storage });
      const result = await services.MediaService.requestCamera();
      assert.equal(result.ok, false);
      assert.equal(result.reason, expected, errName + ' should map to ' + expected);
    }
  } finally {
    if (original === undefined) delete global.navigator; else global.navigator = original;
  }
});

test('stopCamera stops every track on the stream', () => {
  const { services } = createTestServices();
  const stopped = [];
  const stream = {
    getTracks: () => [
      { stop: () => stopped.push('a') },
      { stop: () => stopped.push('b') }
    ]
  };
  services.MediaService.stopCamera(stream);
  assert.deepEqual(stopped, ['a', 'b']);
  services.MediaService.stopCamera(null); // must not throw
});

test('saveMediaReference registers external media and attaches it to a note', async () => {
  const { services } = createTestServices();
  const session = await services.SessionService.createSession({ name: 'FP1' });
  const note = await services.NoteService.createNote({ session_ids: [session.id], content: 'see photo' });
  const media = await services.MediaService.saveMediaReference('https://example.com/p.jpg', 'p.jpg', 'image/jpeg');

  await services.NoteService.attachMediaToNote(note.id, { id: media.id, type: 'photo', url: media.url });

  const updated = await services.NoteService.getNote(note.id);
  assert.equal(updated.media.length, 1);
  assert.equal(updated.media[0].id, media.id);

  // Deleting the media must not leave the note rendering a dead thumbnail.
  await services.MediaService.deleteMedia(media.id);
  assert.deepEqual((await services.NoteService.getNote(note.id)).media, []);
});

test('saveMediaBlob rejects a missing blob', async () => {
  const { services } = createTestServices();
  await assert.rejects(() => services.MediaService.saveMediaBlob(null, 'x.png'), /needs a blob/);
});

test('getMediaUrl returns the external url when there is no local blob', async () => {
  const { services } = createTestServices();
  const media = await services.MediaService.saveMediaReference('https://example.com/p.jpg', 'p.jpg');
  assert.equal(await services.MediaService.getMediaUrl(media.id), 'https://example.com/p.jpg');
  assert.equal(await services.MediaService.getMediaUrl('media_nope'), null);
});

// ── Session detail / listing ────────────────────────────────────────────────

test('getSessionDetail resolves every attached entity in one call', async () => {
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle', make: 'Yamaha', model: 'R6' });
  const rider = await services.RiderService.createRider({ name: 'Alex' });
  const session = await services.SessionService.createSession({ name: 'FP1' });
  const file = await services.FileService.storeFile('run.csv', 'x');
  await services.SessionService.addVehicleToSession(session.id, vehicle.id);
  await services.SessionService.addRiderToSession(session.id, rider.id);
  await services.SessionService.addFileToSession(session.id, file.id);
  await services.NoteService.createNote({ session_ids: [session.id], content: 'note' });

  const detail = await services.SessionService.getSessionDetail(session.id);
  assert.equal(detail.session.name, 'FP1');
  assert.deepEqual(detail.vehicles.map((v) => v.model), ['R6']);
  assert.deepEqual(detail.riders.map((r) => r.name), ['Alex']);
  assert.deepEqual(detail.files.map((f) => f.name), ['run.csv']);
  assert.equal(detail.notes.length, 1);
  assert.equal(await services.SessionService.getSessionDetail('session_nope'), null);
});

test('listSessions orders newest first, falling back to created_at without a start_time', async () => {
  const { services } = createTestServices();
  await services.SessionService.createSession({ name: 'Older', start_time: '2026-05-01T09:00:00Z' });
  await services.SessionService.createSession({ name: 'Newer', start_time: '2026-05-05T09:00:00Z' });
  const undated = await services.SessionService.createSession({ name: 'Undated' });

  const sessions = await services.SessionService.listSessions();
  assert.equal(sessions.length, 3);
  assert.ok(sessions.some((s) => s.id === undated.id), 'a session without a start time still appears');
  const dated = sessions.filter((s) => s.start_time).map((s) => s.name);
  assert.deepEqual(dated, ['Newer', 'Older']);
});

test('ExportService.hasData reports whether anything is worth backing up', async () => {
  const { services } = createTestServices();
  assert.equal(await services.ExportService.hasData(), false);
  await services.SessionService.createSession({ name: 'FP1' });
  assert.equal(await services.ExportService.hasData(), true);
});

// ── EventService and Session.event_id ────────────────────────────────────────

test('a session can be created under an event, and event deletion unlinks rather than deletes it', async () => {
  const { services } = createTestServices();
  const event = await services.EventService.createEvent({ name: 'MotoAmerica VIR 2026', location: 'VIR' });
  const session = await services.SessionService.createSession({ name: 'P1', event_id: event.id });
  assert.equal((await services.SessionService.getSession(session.id)).event_id, event.id);

  await services.EventService.deleteEvent(event.id);
  const after = await services.SessionService.getSession(session.id);
  assert.ok(after, 'the session itself is kept');
  assert.equal(after.event_id, undefined, 'but no longer references the deleted event');
});

test('setEvent assigns or clears a session\'s event', async () => {
  const { services } = createTestServices();
  const event = await services.EventService.createEvent({ name: 'Round 1' });
  const session = await services.SessionService.createSession({ name: 'Q1' });
  await services.SessionService.setEvent(session.id, event.id);
  assert.equal((await services.SessionService.getSession(session.id)).event_id, event.id);
  await services.SessionService.setEvent(session.id, null);
  assert.equal((await services.SessionService.getSession(session.id)).event_id, undefined);
});

test('listSessionsGroupedByEvent groups by event (newest first) with unassigned sessions last', async () => {
  const { services } = createTestServices();
  const older = await services.EventService.createEvent({ name: 'Round 1', start_date: '2026-03-01T00:00:00Z' });
  const newer = await services.EventService.createEvent({ name: 'Round 2', start_date: '2026-05-01T00:00:00Z' });
  await services.SessionService.createSession({ name: 'P1', event_id: older.id });
  await services.SessionService.createSession({ name: 'Q1', event_id: newer.id });
  await services.SessionService.createSession({ name: 'Standalone' });

  const groups = await services.SessionService.listSessionsGroupedByEvent();
  assert.deepEqual(groups.map((g) => (g.event ? g.event.name : null)), ['Round 2', 'Round 1', null]);
  assert.deepEqual(groups[2].sessions.map((s) => s.name), ['Standalone']);
});

// ── Variable mass/weight: Setup as the vehicle-mass override, Session for rider weight ──

test('getEffectiveMass falls back to the vehicle baseline until a setup overrides it', async () => {
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle', mass_kg: 180 });
  const session = await services.SessionService.createSession({ name: 'Q1' });

  const baseline = await services.SetupService.getEffectiveMass(vehicle.id, session.id);
  assert.deepEqual(baseline, { mass_kg: 180, source: 'vehicle', setup: null });

  await services.SetupService.setSessionMass(vehicle.id, session.id, 172);
  const overridden = await services.SetupService.getEffectiveMass(vehicle.id, session.id);
  assert.equal(overridden.mass_kg, 172);
  assert.equal(overridden.source, 'setup');

  assert.deepEqual(await services.SetupService.getEffectiveMass('vehicle_nope', session.id), {
    mass_kg: null, source: null, setup: null
  });
});

test('setSessionMass revises (not replaces) the session\'s setup, keeping full history', async () => {
  const { services } = createTestServices();
  const vehicle = await services.VehicleService.createVehicle({ type: 'motorcycle', mass_kg: 180 });
  const session = await services.SessionService.createSession({ name: 'Q1' });

  const first = await services.SetupService.setSessionMass(vehicle.id, session.id, 175);
  const second = await services.SetupService.setSessionMass(vehicle.id, session.id, 172);

  // Setups are append-only everywhere else in the app (see reviseSetup); a second
  // in-session mass update is no exception -- it revises rather than mutates, so the
  // history for that session has both entries, chained via supersedes_id.
  const setups = await services.SetupService.getSetupsByVehicle(vehicle.id);
  assert.equal(setups.length, 2, 'both the original and the revision are kept');
  assert.equal(second.supersedes_id, first.id);
  assert.equal((await services.SetupService.getSetup(first.id)).values.mass_kg, 175, 'history is immutable');

  // But the EFFECTIVE mass for that session is always the latest revision.
  assert.equal((await services.SetupService.getEffectiveMass(vehicle.id, session.id)).mass_kg, 172);

  // A DIFFERENT session's mass for the same vehicle starts its own chain.
  const otherSession = await services.SessionService.createSession({ name: 'Race1' });
  await services.SetupService.setSessionMass(vehicle.id, otherSession.id, 168);
  assert.equal((await services.SetupService.getSetupsByVehicle(vehicle.id)).length, 3);
  assert.equal((await services.SetupService.getEffectiveMass(vehicle.id, otherSession.id)).mass_kg, 168);
  assert.equal((await services.SetupService.getEffectiveMass(vehicle.id, session.id)).mass_kg, 172, 'unaffected');
});

test('getEffectiveRiderWeight falls back to the rider baseline until a session overrides it', async () => {
  const { services } = createTestServices();
  const rider = await services.RiderService.createRider({ name: 'Jo', weight_kg: 68 });
  const session = await services.SessionService.createSession({ name: 'P1' });
  await services.SessionService.addRiderToSession(session.id, rider.id);

  assert.deepEqual(await services.SessionService.getEffectiveRiderWeight(session.id, rider.id), {
    weight_kg: 68, source: 'rider'
  });

  await services.SessionService.setRiderWeightOverride(session.id, rider.id, 99);
  assert.deepEqual(await services.SessionService.getEffectiveRiderWeight(session.id, rider.id), {
    weight_kg: 99, source: 'override'
  });

  // A DIFFERENT session is unaffected -- the override is per-session, not on the rider.
  const otherSession = await services.SessionService.createSession({ name: 'Q1' });
  await services.SessionService.addRiderToSession(otherSession.id, rider.id);
  assert.deepEqual(await services.SessionService.getEffectiveRiderWeight(otherSession.id, rider.id), {
    weight_kg: 68, source: 'rider'
  });

  await services.SessionService.setRiderWeightOverride(session.id, rider.id, null);
  assert.deepEqual(await services.SessionService.getEffectiveRiderWeight(session.id, rider.id), {
    weight_kg: 68, source: 'rider'
  });
});

test('deleting a rider scrubs both rider_ids AND its weight override on the same session', async () => {
  // Regression test: these are two separate INBOUND_REFERENCES entries pointing at the
  // SAME store (sessions), which used to race -- two concurrent storage.update calls on
  // the same row, each reading before either wrote, so whichever finished last silently
  // discarded the other's change (rider_ids stayed populated after the rider was gone).
  const { services } = createTestServices();
  const rider = await services.RiderService.createRider({ name: 'Jo', weight_kg: 68 });
  const session = await services.SessionService.createSession({ name: 'P1' });
  await services.SessionService.addRiderToSession(session.id, rider.id);
  await services.SessionService.setRiderWeightOverride(session.id, rider.id, 99);

  await services.RiderService.deleteRider(rider.id);

  const after = await services.SessionService.getSession(session.id);
  assert.deepEqual(after.rider_ids, [], 'rider_ids must be scrubbed');
  assert.equal(after.rider_weight_overrides_kg, undefined, 'and the override must be scrubbed too');
});
