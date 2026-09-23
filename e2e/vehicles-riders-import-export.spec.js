// Covers the standalone "Download/Upload Vehicles & Riders" JSON export -- separate from
// the full "Download All Data" backup, which already includes vehicles and riders as part
// of the sessions bundle.
const { test, expect } = require('@playwright/test');
const path = require('path');
const os = require('os');
const fs = require('fs');

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

test.describe('Vehicles & Riders JSON import/export', () => {
  test.beforeEach(async ({ page }) => { await resetStorage(page); });

  test('Download All Data already includes vehicles and riders (the full sessions bundle)', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => !!window.SessionsServices);
    await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      await api.VehicleService.createVehicle({ type: 'motorcycle', make: 'Yamaha', model: 'R3', mass_kg: 170, max_lat_g: 1.1 });
      await api.RiderService.createRider({ name: 'Backup Rider', weight_kg: 75 });
    });
    await openPanel(page, 'User');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#downloadAllDataBtn').click();
    const download = await downloadPromise;
    const zipPath = path.join(os.tmpdir(), 'csv-plotter-full-backup-' + Date.now() + '.zip');
    await download.saveAs(zipPath);

    // Full round trip: wipe everything, restore from that ZIP, and check the vehicle/rider
    // came back -- the same mechanism sessions.spec.js's backup test already exercises for
    // sessions/notes, applied here to confirm vehicles/riders ride along too.
    await resetStorage(page);
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await page.setInputFiles('#dataBackupFileInput', zipPath);
    await expect(page.locator('#storedFilesStatus')).toContainText(/Restored/, { timeout: 15000 });
    // The restore path reloads the page (to reapply settings) when there were any to
    // apply; waitForLoadState resolves immediately either way if no navigation happens.
    await page.waitForLoadState('load');
    await page.waitForFunction(() => !!window.SessionsServices);

    const restored = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return { vehicles: await api.VehicleService.listVehicles(), riders: await api.RiderService.listRiders() };
    });
    expect(restored.vehicles).toHaveLength(1);
    expect(restored.vehicles[0].model).toBe('R3');
    expect(restored.vehicles[0].max_lat_g).toBe(1.1);
    expect(restored.riders).toHaveLength(1);
    expect(restored.riders[0].name).toBe('Backup Rider');
  });

  test('Download Vehicles & Riders exports just the garage, and Upload adds them as new entries', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForFunction(() => !!window.SessionsServices);
    await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      await api.VehicleService.createVehicle({ type: 'motorcycle', make: 'Yamaha', model: 'R3', mass_kg: 170, max_lat_g: 1.2 });
      await api.RiderService.createRider({ name: 'Export Rider', weight_kg: 75, cda_tucked_m2: 0.1 });
    });
    await openPanel(page, 'User');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('#downloadVehiclesRidersBtn').click();
    const download = await downloadPromise;
    await expect(page.locator('#vehiclesRidersIoStatus')).toContainText('Downloaded 1 vehicle and 1 rider');
    const jsonPath = path.join(os.tmpdir(), 'csv-plotter-vehicles-riders-' + Date.now() + '.json');
    await download.saveAs(jsonPath);

    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(parsed.app).toBe('csv-plotter-vehicles-riders');
    expect(parsed.vehicles).toHaveLength(1);
    expect(parsed.riders).toHaveLength(1);
    expect(parsed.vehicles[0].model).toBe('R3');
    expect(parsed.vehicles[0].max_lat_g).toBe(1.2);
    expect(parsed.riders[0].name).toBe('Export Rider');
    // A fresh id is minted on import, so the exported file shouldn't carry the old one.
    expect(parsed.vehicles[0].id).toBeUndefined();

    // Wipe and re-import: the garage comes back as new records (fresh ids).
    await resetStorage(page);
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await page.setInputFiles('#vehiclesRidersFileInput', jsonPath);
    await expect(page.locator('#vehiclesRidersIoStatus')).toContainText('Imported 1 vehicle and 1 rider as new entries');

    const restored = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return { vehicles: await api.VehicleService.listVehicles(), riders: await api.RiderService.listRiders() };
    });
    expect(restored.vehicles).toHaveLength(1);
    expect(restored.vehicles[0].model).toBe('R3');
    expect(restored.vehicles[0].max_lat_g).toBe(1.2);
    expect(restored.riders).toHaveLength(1);
    expect(restored.riders[0].name).toBe('Export Rider');

    // Importing the same file again adds a SECOND copy, rather than merging/overwriting.
    await page.setInputFiles('#vehiclesRidersFileInput', jsonPath);
    await expect(page.locator('#vehiclesRidersIoStatus')).toContainText('Imported 1 vehicle and 1 rider as new entries');
    const afterSecondImport = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return (await api.VehicleService.listVehicles()).length;
    });
    expect(afterSecondImport).toBe(2);
  });

  test('a malformed or unrelated JSON file is rejected with a clear message', async ({ page }) => {
    await page.goto('/index.html');
    await openPanel(page, 'User');

    const badJsonPath = path.join(os.tmpdir(), 'not-json-' + Date.now() + '.json');
    fs.writeFileSync(badJsonPath, 'not actually json {{{');
    await page.setInputFiles('#vehiclesRidersFileInput', badJsonPath);
    await expect(page.locator('#vehiclesRidersIoStatus')).toContainText('not valid JSON');

    const unrelatedPath = path.join(os.tmpdir(), 'unrelated-' + Date.now() + '.json');
    fs.writeFileSync(unrelatedPath, JSON.stringify({ hello: 'world' }));
    await page.setInputFiles('#vehiclesRidersFileInput', unrelatedPath);
    await expect(page.locator('#vehiclesRidersIoStatus')).toContainText("doesn't look like a csv-plotter vehicles/riders export");
  });

  test('Download with nothing saved yet shows a hint instead of an empty file', async ({ page }) => {
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await page.locator('#downloadVehiclesRidersBtn').click();
    await expect(page.locator('#vehiclesRidersIoStatus')).toContainText('No vehicles or riders to download yet');
  });
});
