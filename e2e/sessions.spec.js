const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile, SAMPLE_FILE } = require('./helpers');

// Browser-level tests for the sessions feature. These matter beyond the Node unit tests
// because the real IndexedDB engine, the csvPlotterFiles v2 -> v3 UUID migration, and the
// UI wiring only exist here.

const SECOND_FILE = path.join(__dirname, '..', 'sample_data_files', 'logdata_jr.csv');

// A same-origin page that does NOT load app.js. Storage has to be manipulated from here:
// once index.html has run, app.js holds an open connection to csvPlotterFiles and
// indexedDB.deleteDatabase() blocks on it indefinitely.
const BLANK_SAME_ORIGIN_PAGE = '/sample_data_files/';

// Expands one of the collapsible control sections by its label, since their contents are
// not clickable (or visible to Playwright) while the <details> is shut.
async function openPanel(page, label) {
  const summary = page.locator('summary.collapsible-action-summary', { hasText: label }).first();
  const details = page.locator('details.collapsible-action', { has: summary }).first();
  if (!(await details.evaluate((node) => node.open))) await summary.click();
  return details;
}

// Clears both databases so each test starts from a known state.
async function resetStorage(page) {
  await page.goto(BLANK_SAME_ORIGIN_PAGE);
  await page.evaluate(async () => {
    localStorage.clear();
    const drop = (name) => new Promise((resolve) => {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
    await drop('csvPlotterFiles');
    await drop('motorsports_app_v1');
  });
}

// Seeds a v2-shaped csvPlotterFiles database (store keyed by `name`) so the migration has
// something real to upgrade, exactly as an existing user's browser would have.
async function seedLegacyFileDb(page) {
  await page.goto(BLANK_SAME_ORIGIN_PAGE);
  return page.evaluate(async () => {
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('csvPlotterFiles');
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('csvPlotterFiles', 2);
      req.onupgradeneeded = () => req.result.createObjectStore('files', { keyPath: 'name' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put({
        name: 'legacy-run.csv',
        text: 'Time,Speed\n0,0\n1,12\n',
        storedAt: '2026-01-02T03:04:05.000Z',
        hash: 'cafebabe',
        fileMeta: { track: 'Legacy Park', rider: 'Old Timer', vehicle: 'R3' },
        importerConfig: { decoder: 'standard', channels: { Speed: 'Speed' } }
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
}

function readFileRecords(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const req = indexedDB.open('csvPlotterFiles');
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('files', 'readonly');
      const getAll = tx.objectStore('files').getAll();
      getAll.onsuccess = () => resolve({ version: db.version, records: getAll.result || [] });
      getAll.onerror = () => reject(getAll.error);
    };
    req.onerror = () => reject(req.error);
  }));
}

test.describe('sessions', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('the sessions layer loads and exposes its globals', async ({ page }) => {
    await page.goto('/index.html');
    const globals = await page.evaluate(() => ({
      model: !!window.SessionsModel,
      storage: !!window.SessionsStorage,
      services: !!window.SessionsServices,
      ui: !!window.SessionsUI,
      backend: window.SessionsStorage && window.SessionsStorage.hasIndexedDb()
    }));
    expect(globals).toEqual({ model: true, storage: true, services: true, ui: true, backend: true });
  });

  test('quick plot still works and is not blocked by session handling', async ({ page }) => {
    await loadSampleFile(page);
    // loadSampleFile only resolves once the plot has at least one trace, so reaching here
    // means opening a CSV still plots immediately with no session involved.
    const traces = await page.evaluate(() => document.getElementById('plotDiv').data.length);
    expect(traces).toBeGreaterThan(0);

    const sessions = await page.evaluate(() => window.SessionsServices
      .createServices().SessionService.listSessions());
    expect(sessions).toEqual([]);
  });

  test('migrates a v2 file database to v3 UUID keys, keeping contents and config', async ({ page }) => {
    await seedLegacyFileDb(page);

    // Reloading runs the app, which opens the file DB at v3 and triggers the migration.
    await page.goto('/index.html');
    await page.waitForFunction(() => !!window.SessionsStorage);
    await page.evaluate(() => window.SessionsServices.createServices().initDB());

    const { version, records } = await readFileRecords(page);
    expect(version).toBe(3);
    expect(records).toHaveLength(1);

    const record = records[0];
    expect(record.id).toMatch(/^file_[0-9a-f-]{36}$/);
    expect(record.name).toBe('legacy-run.csv');
    expect(record.text).toBe('Time,Speed\n0,0\n1,12\n');
    expect(record.hash).toBe('cafebabe');
    expect(record.fileMeta.track).toBe('Legacy Park');
    expect(record.importerConfig.decoder).toBe('standard');
    expect(record.session_ids).toEqual([]);
    expect(record.filetype).toBe('csv');
  });

  test('a migrated legacy file still appears in the stored files list', async ({ page }) => {
    await seedLegacyFileDb(page);
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await expect(page.locator('.stored-file-name', { hasText: 'legacy-run.csv' })).toBeVisible();
  });

  test('Add to Session creates a session, attaches the file and shows a badge', async ({ page }) => {
    await loadSampleFile(page);

    await page.locator('.file-add-to-session-btn').first().click();
    const dialog = page.locator('.session-modal-dialog');
    await expect(dialog).toBeVisible();
    // With no sessions yet the modal starts on the create path.
    await expect(page.locator('.session-modal-new-fields')).toBeVisible();

    await page.fill('#addToSessionNewName', 'Brands Hatch FP1');
    await page.fill('#addToSessionNewLocation', 'Brands Hatch');
    await page.fill('#addToSessionTags', 'wet, baseline');
    await page.fill('#addToSessionNote', 'Front pushing on entry');
    await page.locator('.session-modal-save').click();

    await expect(dialog).toBeHidden();

    // The file row now reflects the attachment.
    await expect(page.locator('.file-session-badge', { hasText: 'Brands Hatch FP1' })).toBeVisible();

    const state = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const sessions = await api.SessionService.listSessions();
      const detail = await api.SessionService.getSessionDetail(sessions[0].id);
      return {
        sessionCount: sessions.length,
        name: detail.session.name,
        location: detail.session.location,
        fileCount: detail.files.length,
        fileTags: detail.files[0].tags,
        noteCount: detail.notes.length,
        noteContent: detail.notes[0].content,
        noteAuthorIsLocal: /^user_local_/.test(detail.notes[0].author_id || '')
      };
    });

    expect(state.sessionCount).toBe(1);
    expect(state.name).toBe('Brands Hatch FP1');
    expect(state.location).toBe('Brands Hatch');
    expect(state.fileCount).toBe(1);
    expect(state.fileTags).toEqual(['wet', 'baseline']);
    expect(state.noteCount).toBe(1);
    expect(state.noteContent).toBe('Front pushing on entry');
    expect(state.noteAuthorIsLocal).toBe(true);
  });

  test('a second file attaches to the existing session rather than making a new one', async ({ page }) => {
    await loadSampleFile(page);
    await page.locator('.file-add-to-session-btn').first().click();
    await page.fill('#addToSessionNewName', 'Shared Session');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toBeHidden();

    // Adding more CSVs after the first must keep working.
    await page.setInputFiles('#fileInput', SECOND_FILE);
    await expect(page.locator('.file-item')).toHaveCount(2);

    await page.locator('.file-add-to-session-btn').nth(1).click();
    const select = page.locator('#addToSessionSelect');
    await expect(select).toBeVisible();
    // The existing session is preselected, so saving attaches to it.
    await expect(page.locator('.session-modal-new-fields')).toBeHidden();
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toBeHidden();

    const state = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const sessions = await api.SessionService.listSessions();
      const detail = await api.SessionService.getSessionDetail(sessions[0].id);
      return { sessionCount: sessions.length, files: detail.files.map((f) => f.name).sort() };
    });
    expect(state.sessionCount).toBe(1);
    expect(state.files).toHaveLength(2);
  });

  test('the session panel shows the session and edits KPIs inline', async ({ page }) => {
    await loadSampleFile(page);
    await page.locator('.file-add-to-session-btn').first().click();
    await page.fill('#addToSessionNewName', 'Panel Session');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toBeHidden();

    await openPanel(page, 'Sessions');
    const panel = page.locator('#sessionsPanelBody');
    await expect(panel.locator('#sessionsPanelSelect')).toContainText('Panel Session');
    await expect(panel.locator('.session-section-title', { hasText: 'KPIs' })).toBeVisible();
    await expect(panel.locator('.session-linked-label').first()).toBeVisible();

    await panel.locator('.session-kpi-new-type').fill('best_lap');
    await panel.locator('.session-kpi-new-value').fill('92.55');
    await panel.locator('.session-kpi-add-btn').click();

    await expect(panel.locator('.session-kpi-type', { hasText: 'best_lap' })).toBeVisible();
    const kpis = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const sessions = await api.SessionService.listSessions();
      return api.SessionService.getKPIs(sessions[0].id);
    });
    // Typed as text, stored as a number.
    expect(kpis).toEqual([{ type: 'best_lap', kpi: 92.55 }]);

    await panel.locator('.session-kpi-remove').first().click();
    await expect(panel.locator('.session-kpi-type', { hasText: 'best_lap' })).toHaveCount(0);
  });

  test('the note composer adds a note to the session', async ({ page }) => {
    await loadSampleFile(page);
    await page.locator('.file-add-to-session-btn').first().click();
    await page.fill('#addToSessionNewName', 'Note Session');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toBeHidden();

    await openPanel(page, 'Sessions');
    const panel = page.locator('#sessionsPanelBody');
    await panel.locator('.session-note-input').fill('Rear grip improved on lower pressure');
    await panel.locator('.session-note-type-select').selectOption('post');
    await panel.locator('.session-note-tags-input').fill('rear,grip');
    await panel.locator('.session-note-save-btn').click();

    await expect(panel.locator('.session-note-content', { hasText: 'Rear grip improved' })).toBeVisible();
    const note = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const notes = await api.NoteService.listNotes();
      return { type: notes[0].type, tags: notes[0].tags };
    });
    expect(note.type).toBe('post');
    expect(note.tags).toEqual(['rear', 'grip']);
  });

  test('session state survives a page reload', async ({ page }) => {
    await loadSampleFile(page);
    await page.locator('.file-add-to-session-btn').first().click();
    await page.fill('#addToSessionNewName', 'Persistent Session');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toBeHidden();

    await page.reload();
    await openPanel(page, 'Sessions');
    await expect(page.locator('#sessionsPanelSelect')).toContainText('Persistent Session');

    // Stored files are not re-plotted automatically on load, only on request; once the
    // file is back in the plotter its row shows the session it is still attached to.
    await openPanel(page, 'User');
    await page.locator('#loadAllStoredFilesBtn').click();
    await expect(page.locator('.file-session-badge', { hasText: 'Persistent Session' })).toBeVisible();
  });

  test('a v3 backup round-trips sessions through export and restore', async ({ page }) => {
    await loadSampleFile(page);
    await page.locator('.file-add-to-session-btn').first().click();
    await page.fill('#addToSessionNewName', 'Backup Session');
    await page.fill('#addToSessionNote', 'Note that must survive');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toBeHidden();

    await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const sessions = await api.SessionService.listSessions();
      await api.SessionService.addKPI(sessions[0].id, { type: 'best_lap', kpi: 92.55 });
    });

    // Capture the ZIP the Download All Data button produces.
    await openPanel(page, 'User');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#downloadAllDataBtn').click();
    const download = await downloadPromise;
    const zipPath = path.join(
      require('os').tmpdir(),
      'csv-plotter-sessions-backup-' + Date.now() + '.zip'
    );
    await download.saveAs(zipPath);

    // Wipe everything, then restore from that ZIP.
    await resetStorage(page);
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await page.setInputFiles('#dataBackupFileInput', zipPath);

    await expect(page.locator('#storedFilesStatus')).toContainText(/session\(s\)/, { timeout: 15000 });
    // The restore path reloads the page to reapply settings.
    await page.waitForLoadState('load');
    await page.waitForFunction(() => !!window.SessionsServices);

    const restored = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const sessions = await api.SessionService.listSessions();
      if (!sessions.length) return { sessionCount: 0 };
      const detail = await api.SessionService.getSessionDetail(sessions[0].id);
      return {
        sessionCount: sessions.length,
        name: detail.session.name,
        kpis: detail.session.kpis,
        noteCount: detail.notes.length,
        fileCount: detail.files.length,
        // The restored file must carry its real contents, not just metadata.
        fileHasText: !!(detail.files[0] && detail.files[0].text)
      };
    });

    expect(restored.sessionCount).toBe(1);
    expect(restored.name).toBe('Backup Session');
    expect(restored.kpis).toEqual([{ type: 'best_lap', kpi: 92.55 }]);
    expect(restored.noteCount).toBe(1);
    expect(restored.fileCount).toBe(1);
    expect(restored.fileHasText).toBe(true);
  });

  test('restoring a legacy v2 JSON backup still works', async ({ page }) => {
    await page.goto('/index.html');
    await openPanel(page, 'User');
    // A v1/v2 backup has no `sessions` key; the restore must not choke on its absence.
    const legacyBackup = JSON.stringify({
      app: 'csv-plotter-backup',
      version: 2,
      exportedAt: '2026-01-01T00:00:00.000Z',
      files: [{ name: 'legacy.csv', text: 'Time,Speed\n0,0\n1,5\n', storedAt: '2026-01-01T00:00:00.000Z' }],
      settings: {}
    });
    await page.setInputFiles('#dataBackupFileInput', {
      name: 'csv-plotter-backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(legacyBackup, 'utf8')
    });

    await expect(page.locator('#storedFilesStatus')).toContainText('Restored 1 file(s)', { timeout: 15000 });
    const { records } = await readFileRecords(page);
    expect(records).toHaveLength(1);
    expect(records[0].name).toBe('legacy.csv');
    expect(records[0].id).toMatch(/^file_/);
  });

  test('removing a stored file by its new UUID id works', async ({ page }) => {
    await loadSampleFile(page);
    await openPanel(page, 'User');
    await expect(page.locator('.stored-file-name')).toHaveCount(1);
    // Removal now asks for confirmation first.
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('.stored-file-remove-btn').first().click();
    await expect(page.locator('#storedFilesStatus')).toContainText('Removed');
    await expect(page.locator('.stored-file-name')).toHaveCount(0);
  });
});
