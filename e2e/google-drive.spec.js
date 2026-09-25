// Covers the optional Google Drive integration (User panel "Google Drive" section, plus the
// "Import from Google Drive" button near the local file picker).
//
// google-drive.js's real Client ID/API key are meant to be filled in per-deployment (see
// GOOGLE_DRIVE_SETUP.md) and this checked-out copy may or may not have real ones in it at any
// given time (e.g. while someone's testing locally) -- so every test here substitutes
// google-drive.js entirely with a small in-memory fake (via page.route) that implements the
// same public API app.js's wiring calls against, rather than depending on whatever the real
// file's constants happen to be right now. That also means these tests cover OUR integration
// code (does clicking a button call the right gdrive function with the right arguments, does
// the returned content reach parseFile/restoreFromBackup/importVehiclesRidersFromFile)
// without depending on Google's real OAuth/Picker UI, which can't be driven from CI. A real
// account smoke test is still necessary before shipping changes to google-drive.js itself --
// see GOOGLE_DRIVE_SETUP.md.
const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

async function openPanel(page, label) {
  const summary = page.locator('summary.collapsible-action-summary', { hasText: label }).first();
  const details = page.locator('details.collapsible-action', { has: summary }).first();
  if (!(await details.evaluate((node) => node.open))) await summary.click();
  return details;
}

async function resetStorage(page) {
  await page.goto('/sample_data_files/');
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

// A small AiM-format fixture, same shape as data-filters.spec.js's proven-working format,
// small enough to build inline rather than reading one of the multi-MB sample laps.
function buildAimCsv() {
  const lines = [
    'Format,AiM CSV File', 'Session,Test', 'Vehicle,44', 'Racer,TK', 'Comment,',
    'Date,"Tuesday, April 28, 2026"', 'Time,12:51 PM', 'Sample Rate,20', 'Duration,2', '',
    'Time,GPS Speed', 's,km/h', ''
  ];
  for (let i = 0; i < 40; i++) lines.push([(i * 0.05).toFixed(2), (80 + i).toFixed(1)].join(','));
  return lines.join('\n') + '\n';
}

// Replaces google-drive.js entirely with a scriptable fake exposing the same public API
// surface app.js's wiring calls, plus a window.__gdriveTest control/inspection handle.
const FAKE_GOOGLE_DRIVE_MODULE = `
(() => {
  const state = {
    signedIn: false,
    userInfo: { sub: 'test-sub', email: 'test.driver@example.com', name: 'Test Driver' },
    nextPick: null,
    files: {},
    uploads: []
  };
  window.__gdriveTest = {
    setNextPick(pick) { state.nextPick = pick; },
    setFileContent(id, content) { state.files[id] = content; },
    getUploads() { return state.uploads; }
  };
  function bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  function contentToBlob(content) {
    if (content.bytes) {
      const bin = atob(content.bytes);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: content.mimeType });
    }
    return new Blob([content.text], { type: content.mimeType });
  }
  window.GoogleDriveIntegration = {
    isConfigured: () => true,
    isApiLoaded: () => true,
    isSignedIn: () => state.signedIn,
    signIn: () => { state.signedIn = true; return Promise.resolve(); },
    signOut: () => { state.signedIn = false; return Promise.resolve(); },
    getSignedInUserInfo: () => Promise.resolve(state.signedIn ? state.userInfo : null),
    pickFile: () => {
      if (!state.nextPick) return Promise.reject(new Error('cancelled'));
      return Promise.resolve(state.nextPick);
    },
    downloadFileContent: (fileId) => {
      const content = state.files[fileId];
      if (!content) return Promise.reject(new Error('no fixture content registered for ' + fileId));
      return Promise.resolve(contentToBlob(content));
    },
    uploadOrUpdateFile: ({ name, blob, mimeType }) => blob.arrayBuffer().then((buf) => {
      const base64 = bytesToBase64(new Uint8Array(buf));
      state.uploads.push({ name, mimeType, base64, size: buf.byteLength });
      return { id: 'fake-' + name, name };
    }),
    ensureAppFolder: () => Promise.resolve('fake-folder-id')
  };
})();
`;

async function useFakeGoogleDrive(page) {
  await page.route('**/google-drive.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: FAKE_GOOGLE_DRIVE_MODULE
  }));
}

// Simulates a deployment with no Client ID/API key filled in (or the ESP32 build, where the
// two Google <script> tags are stripped and `google`/`gapi` never exist) -- independent of
// whatever google-drive.js's real constants happen to be in this checked-out copy.
const NOT_CONFIGURED_MODULE = `
(() => {
  const notConfigured = () => Promise.reject(new Error('Google Drive is not configured for this deployment.'));
  window.GoogleDriveIntegration = {
    isConfigured: () => false,
    isApiLoaded: () => false,
    onReady: () => {},
    isSignedIn: () => false,
    signIn: notConfigured,
    signOut: () => Promise.resolve(),
    getSignedInUserInfo: () => Promise.resolve(null),
    pickFile: notConfigured,
    downloadFileContent: notConfigured,
    ensureAppFolder: notConfigured,
    uploadOrUpdateFile: notConfigured
  };
})();
`;

async function useNotConfiguredGoogleDrive(page) {
  await page.route('**/google-drive.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: NOT_CONFIGURED_MODULE
  }));
}

async function connect(page) {
  await openPanel(page, 'User');
  await page.locator('#googleDriveConnectBtn').click();
  await expect(page.locator('#googleDriveStatus')).toContainText('test.driver@example.com');
}

test.describe('Google Drive: disabled by default', () => {
  test('with no Client ID/API key configured, the section stays disabled and shows no action buttons', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await useNotConfiguredGoogleDrive(page);
    await resetStorage(page);
    await page.goto('/index.html');
    await openPanel(page, 'User');

    await expect(page.locator('#googleDriveStatus')).toContainText('Not configured');
    await expect(page.locator('#googleDriveConnectBtn')).toBeHidden();
    await expect(page.locator('#googleDriveDisconnectBtn')).toBeHidden();
    await expect(page.locator('#googleDriveActions')).toBeHidden();
    await expect(page.locator('#googleDriveImportCsvBtn')).toBeHidden();

    expect(pageErrors).toEqual([]);
  });
});

test.describe('Google Drive: connected flows (fake module)', () => {
  test.beforeEach(async ({ page }) => {
    await useFakeGoogleDrive(page);
    await resetStorage(page);
  });

  test('connect shows the signed-in email and reveals actions; disconnect reverts', async ({ page }) => {
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await expect(page.locator('#googleDriveConnectBtn')).toBeVisible();
    await expect(page.locator('#googleDriveActions')).toBeHidden();

    await connect(page);
    await expect(page.locator('#googleDriveActions')).toBeVisible();
    await expect(page.locator('#googleDriveImportCsvBtn')).toBeVisible();
    await expect(page.locator('#googleDriveDisconnectBtn')).toBeVisible();
    await expect(page.locator('#googleDriveConnectBtn')).toBeHidden();

    await page.locator('#googleDriveDisconnectBtn').click();
    await expect(page.locator('#googleDriveStatus')).toContainText('Not connected.');
    await expect(page.locator('#googleDriveActions')).toBeHidden();
    await expect(page.locator('#googleDriveImportCsvBtn')).toBeHidden();
    await expect(page.locator('#googleDriveConnectBtn')).toBeVisible();
  });

  test('Import from Google Drive picks a CSV and loads it into the plotter', async ({ page }) => {
    await page.goto('/index.html');
    await connect(page);

    await page.evaluate((csv) => {
      window.__gdriveTest.setNextPick({ id: 'csv1', name: 'drive-lap.csv' });
      window.__gdriveTest.setFileContent('csv1', { text: csv, mimeType: 'text/csv' });
    }, buildAimCsv());

    await page.locator('#googleDriveImportCsvBtn').click();
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data) && pd.data.length > 0;
    }, { timeout: 20000 });

    await expect(page.locator('#filesList')).toContainText('drive-lap.csv');
  });

  test('Backup All Data to Drive uploads a zip, and Restore Backup from Drive reads it back', async ({ page }) => {
    await loadSampleFile(page);
    await connect(page);
    await page.locator('#googleDriveBackupAllBtn').click();
    await expect(page.locator('#googleDriveActionsStatus')).toContainText('Backed up to Drive.');

    const uploads = await page.evaluate(() => window.__gdriveTest.getUploads());
    const upload = uploads.find((u) => u.name === 'csv-plotter-backup.zip');
    expect(upload).toBeTruthy();
    expect(upload.mimeType).toBe('application/zip');
    expect(upload.size).toBeGreaterThan(0);

    // Round trip: wipe storage, then restore from the exact bytes that were just "uploaded".
    await resetStorage(page);
    await page.goto('/index.html');
    await connect(page);
    await page.evaluate(({ base64, mimeType }) => {
      window.__gdriveTest.setNextPick({ id: 'restore1', name: 'csv-plotter-backup.zip' });
      window.__gdriveTest.setFileContent('restore1', { bytes: base64, mimeType });
    }, { base64: upload.base64, mimeType: upload.mimeType });

    await page.locator('#googleDriveRestoreAllBtn').click();
    await expect(page.locator('#storedFilesStatus')).toContainText(/Restored/, { timeout: 15000 });
    await expect(page.locator('#storedFilesList')).toContainText('logdata.csv');
  });

  test('Backup Vehicles & Riders to Drive uploads JSON, and Restore reads it back as a new entry', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => !!window.SessionsServices);
    await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      await api.VehicleService.createVehicle({ type: 'motorcycle', make: 'Yamaha', model: 'R3', mass_kg: 170, max_lat_g: 1.1 });
    });

    await connect(page);
    await page.locator('#googleDriveBackupVehiclesRidersBtn').click();
    await expect(page.locator('#googleDriveActionsStatus')).toContainText('Backed up to Drive.');

    const uploads = await page.evaluate(() => window.__gdriveTest.getUploads());
    const upload = uploads.find((u) => u.name === 'csv-plotter-vehicles-riders.json');
    expect(upload).toBeTruthy();
    const decoded = Buffer.from(upload.base64, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    expect(parsed.app).toBe('csv-plotter-vehicles-riders');
    expect(parsed.vehicles).toHaveLength(1);
    expect(parsed.vehicles[0].model).toBe('R3');

    await page.evaluate(({ base64, mimeType }) => {
      window.__gdriveTest.setNextPick({ id: 'restore-vr', name: 'csv-plotter-vehicles-riders.json' });
      window.__gdriveTest.setFileContent('restore-vr', { bytes: base64, mimeType });
    }, { base64: upload.base64, mimeType: upload.mimeType });

    await page.locator('#googleDriveRestoreVehiclesRidersBtn').click();
    // importVehiclesRidersFromFile reports through its own existing status line, unchanged --
    // the Drive button is just a different way to hand it a file.
    await expect(page.locator('#vehiclesRidersIoStatus')).toContainText('Imported 1 vehicle');

    const vehicles = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return api.VehicleService.listVehicles();
    });
    expect(vehicles).toHaveLength(2); // the original, plus the one just imported as a new entry
  });

  test('a picker cancellation does not show an error status', async ({ page }) => {
    await page.goto('/index.html');
    await connect(page);
    // No pick was registered, so pickFile() rejects with 'cancelled' -- the handler should
    // swallow that silently rather than surfacing it as an error.
    await page.locator('#googleDriveRestoreAllBtn').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#googleDriveActionsStatus')).not.toHaveClass(/is-error/);
  });
});
