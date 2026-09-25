// Runs the app the way a `scripts/build-production.js --no-vehicle-sim` build does: without
// vehicle-sim.js or racing-line-calculations.js. Both are 404'd via page.route, so this
// exercises the real unbundled app.js with its simHooks left as no-ops -- every place
// app.js used to call straight into the sim (file load, Add to Session, vehicle/rider
// import, the Sessions panel, backup restore) must still work, with no page errors.
// (The build itself also strips the #uiPanel7 markup; here it's still present in the
// served index.html, which is why the easter-egg check below matters: nothing may unhide it.)
const { test, expect } = require('@playwright/test');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { loadSampleFile } = require('./helpers');

const TCX_SAMPLE = path.join(__dirname, '..', 'sample_data_files', 'activity_23878134073_sample.tcx.txt');

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

async function openPanel(page, label) {
  const summary = page.locator('summary.collapsible-action-summary', { hasText: label }).first();
  const details = page.locator('details.collapsible-action', { has: summary }).first();
  if (!(await details.evaluate((node) => node.open))) await summary.click();
  return details;
}

async function waitForPlot(page) {
  await page.waitForFunction(() => {
    const pd = document.getElementById('plotDiv');
    return pd && Array.isArray(pd.data) && pd.data.length > 0;
  }, { timeout: 20000 });
}

test.describe('App without the vehicle sim module (--no-vehicle-sim)', () => {
  let pageErrors;

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await page.route(/\/(vehicle-sim|racing-line-calculations)\.js(\?.*)?$/, (route) => route.fulfill({ status: 404, body: '' }));
    await resetStorage(page);
  });

  test.afterEach(() => {
    expect(pageErrors).toEqual([]);
  });

  test('loads and plots a CSV, and the sim panel stays hidden even via the version-label easter egg', async ({ page }) => {
    await loadSampleFile(page);
    expect(await page.evaluate(() => typeof window.VehicleSim)).toBe('undefined');
    expect(await page.evaluate(() => typeof window.RacingLineCalculations)).toBe('undefined');

    const label = page.locator('#appVersionLabel');
    for (let i = 0; i < 7; i++) await label.click();
    await expect(page.locator('#uiPanel7')).toBeHidden();
  });

  // addGpsDerivedDynamicsChannels is the one non-sim caller of racing-line-calculations.js
  // (whole-lap spline curvature for TCX); without it, it must fall back to its local
  // estimate rather than throw. LongAcc is derived in that same pass, so its presence shows
  // the pass ran to completion. (This sample yields the same channel list with or without
  // the module -- it gets no Curvature channel in either build.)
  test('a Garmin TCX file still loads and gets its GPS-derived channels', async ({ page }) => {
    const tcxPath = path.join(os.tmpdir(), 'no-vehicle-sim-sample-' + Date.now() + '.tcx');
    fs.copyFileSync(TCX_SAMPLE, tcxPath);
    await page.goto('/index.html');
    await page.setInputFiles('#fileInput', tcxPath);
    await waitForPlot(page);
    await expect(page.locator('#ySelect option[value="LongAcc"]')).toHaveCount(1);
  });

  test('Add to Session and the Sessions vehicle editor work, sim-only fields included', async ({ page }) => {
    await loadSampleFile(page);
    await page.locator('.file-add-to-session-btn').first().click();
    await page.fill('#addToSessionNewName', 'No Sim Session');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toBeHidden();

    await openPanel(page, 'Sessions');
    const panel = page.locator('#sessionsPanelBody');
    await panel.locator('.session-section-add-btn', { hasText: '+ Vehicle' }).click();
    const dialog = page.locator('.session-modal-dialog[aria-label="Add vehicle"]');
    await dialog.locator('input[placeholder="Make (optional)"]').fill('Yamaha');
    await dialog.locator('input[placeholder="Model (optional)"]').fill('R3');
    await dialog.locator('input[placeholder="Mass, kg (optional)"]').fill('170');
    await dialog.locator('input[placeholder="Final ratio"]').fill('2.9');
    await dialog.locator('.session-modal-save', { hasText: 'Add Vehicle' }).click();
    await expect(dialog).toBeHidden();
    await expect(panel.locator('.session-linked-label', { hasText: 'Yamaha R3' })).toBeVisible();

    const vehicle = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return (await api.VehicleService.listVehicles())[0];
    });
    expect(vehicle.mass_kg).toBe(170);
    expect(vehicle.gearing.final_ratio).toBe(2.9); // stored even though nothing uses it here
  });

  test('Vehicles & Riders import works without the sim pickers to refresh', async ({ page }) => {
    const jsonPath = path.join(os.tmpdir(), 'no-vehicle-sim-vr-' + Date.now() + '.json');
    fs.writeFileSync(jsonPath, JSON.stringify({
      app: 'csv-plotter-vehicles-riders', version: 1,
      vehicles: [{ type: 'motorcycle', make: 'Yamaha', model: 'R3', mass_kg: 170 }],
      riders: [{ name: 'No Sim Rider', weight_kg: 75 }]
    }));
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await page.setInputFiles('#vehiclesRidersFileInput', jsonPath);
    await expect(page.locator('#vehiclesRidersIoStatus')).toContainText('Imported 1 vehicle and 1 rider as new entries');
  });

  test('Download All Data round-trips through a restore', async ({ page }) => {
    await loadSampleFile(page);
    await openPanel(page, 'User');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#downloadAllDataBtn').click();
    const zipPath = path.join(os.tmpdir(), 'no-vehicle-sim-backup-' + Date.now() + '.zip');
    await (await downloadPromise).saveAs(zipPath);

    await resetStorage(page);
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await page.setInputFiles('#dataBackupFileInput', zipPath);
    await expect(page.locator('#storedFilesStatus')).toContainText(/Restored/, { timeout: 15000 });
    await page.waitForLoadState('load');
    await expect(page.locator('#storedFilesList')).toContainText('logdata.csv');
    // Loaded into the plotter too, whether or not the restore reloaded the page.
    await expect(page.locator('#filesList')).toContainText('logdata.csv', { timeout: 20000 });
  });
});
