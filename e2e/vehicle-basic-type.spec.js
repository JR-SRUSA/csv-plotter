// Covers the "Basic" vehicle type (just Mass/CdA/Average Power/Max Lateral/Max
// Longitudinal, no gearing/power curve/weight-transfer geometry), the promotion of Max
// Lateral/Longitudinal to a vehicle-level field for every type, and moving Drivetrain
// Efficiency into the vehicle's Gearing section.
const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

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

async function openSim(page) {
  await page.evaluate(() => {
    document.getElementById('uiPanel7').hidden = false;
    document.getElementById('vehicleSimDetails').open = true;
  });
}

async function pick(page, text) {
  const value = await page.locator('#vehicleSimVehicleSelect option', { hasText: text }).first().getAttribute('value');
  await page.selectOption('#vehicleSimVehicleSelect', value);
}

test.describe('Vehicle editor: Basic type and promoted grip fields', () => {
  test.beforeEach(async ({ page }) => { await resetStorage(page); });

  test('selecting Basic hides Gearing, Power Curve and Weight Transfer; other types show them plus Max Lateral/Longitudinal', async ({ page }) => {
    await loadSampleFile(page);
    await openSim(page);
    await page.locator('#vehicleSimVehicleNewBtn').click();
    const dialog = page.locator('.session-modal-dialog');
    await expect(dialog).toBeVisible();

    // Default type (Motorcycle): everything visible, including the two new grip fields.
    await expect(dialog).toContainText('Gearing (optional)');
    await expect(dialog).toContainText('Weight Transfer (optional)');
    await expect(dialog.locator('input[placeholder="Max lateral grip, g (optional)"]')).toBeVisible();
    await expect(dialog.locator('input[placeholder="Max longitudinal grip, g (optional)"]')).toBeVisible();
    await expect(dialog.locator('input[placeholder="Drivetrain efficiency, % (e.g. 95)"]')).toBeVisible();

    // Text content includes hidden elements, so check visibility, not text presence.
    await page.selectOption('.session-modal-dialog select', 'basic');
    await expect(dialog.getByText('Gearing (optional)')).toBeHidden();
    await expect(dialog.getByText('Weight Transfer (optional)')).toBeHidden();
    await expect(dialog.locator('input[placeholder="Drivetrain efficiency, % (e.g. 95)"]')).toBeHidden();
    // Still visible for every type, Basic included.
    await expect(dialog.locator('input[placeholder="Max lateral grip, g (optional)"]')).toBeVisible();
    await expect(dialog.locator('input[placeholder="Max longitudinal grip, g (optional)"]')).toBeVisible();

    await page.selectOption('.session-modal-dialog select', 'car');
    await expect(dialog).toContainText('Gearing (optional)');
    await expect(dialog).toContainText('Weight Transfer (optional)');
  });

  test('a Basic vehicle saves only the five physics fields, even if gearing/geometry was typed in first', async ({ page }) => {
    await loadSampleFile(page);
    await openSim(page);
    await page.locator('#vehicleSimVehicleNewBtn').click();
    const dialog = page.locator('.session-modal-dialog');

    await dialog.locator('input[placeholder^="Make"]').fill('Generic');
    await dialog.locator('input[placeholder^="Model"]').fill('Basic1');
    await dialog.locator('input[placeholder="Mass, kg (optional)"]').fill('200');
    await dialog.locator('input[placeholder="CdA, m² (optional)"]').fill('0.45');
    await dialog.locator('input[placeholder="Average power, kW (optional)"]').fill('50');
    await dialog.locator('input[placeholder="Max lateral grip, g (optional)"]').fill('1.2');
    await dialog.locator('input[placeholder="Max longitudinal grip, g (optional)"]').fill('0.8');
    // Type gearing/geometry in while still Motorcycle, then switch to Basic before saving.
    await dialog.locator('input[placeholder="Final ratio"]').fill('2.8');
    await dialog.locator('input[placeholder="CG height, m"]').fill('0.6');
    await page.selectOption('.session-modal-dialog select', 'basic');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    const v = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const [vehicle] = (await api.VehicleService.listVehicles()).filter((x) => x.model === 'Basic1');
      return vehicle;
    });
    expect(v.type).toBe('basic');
    expect(v.mass_kg).toBe(200);
    expect(v.cda_m2).toBe(0.45);
    expect(v.avg_power_kw).toBe(50);
    expect(v.max_lat_g).toBe(1.2);
    expect(v.max_long_g).toBe(0.8);
    expect(v.gearing).toBeUndefined();
    expect(v.cg_height_m).toBeUndefined();
    expect(v.power_curve).toBeUndefined();
  });

  test('Max Lateral/Longitudinal and Drivetrain Efficiency save and reload for a non-Basic vehicle', async ({ page }) => {
    await loadSampleFile(page);
    await openSim(page);
    await page.locator('#vehicleSimVehicleNewBtn').click();
    const dialog = page.locator('.session-modal-dialog');
    await dialog.locator('input[placeholder^="Make"]').fill('Test');
    await dialog.locator('input[placeholder^="Model"]').fill('GripTest');
    await dialog.locator('input[placeholder="Max lateral grip, g (optional)"]').fill('1.35');
    await dialog.locator('input[placeholder="Max longitudinal grip, g (optional)"]').fill('0.85');
    await dialog.locator('input[placeholder="Final ratio"]').fill('2.8');
    await dialog.locator('input[placeholder="Drivetrain efficiency, % (e.g. 95)"]').fill('92');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    await pick(page, 'GripTest');
    await page.locator('#vehicleSimVehicleEditBtn').click();
    await expect(page.locator('.session-modal-dialog input[placeholder="Max lateral grip, g (optional)"]')).toHaveValue('1.35');
    await expect(page.locator('.session-modal-dialog input[placeholder="Max longitudinal grip, g (optional)"]')).toHaveValue('0.85');
    await expect(page.locator('.session-modal-dialog input[placeholder="Drivetrain efficiency, % (e.g. 95)"]')).toHaveValue('92');
  });

  test('Simulate Vehicle sources Max Lateral/Longitudinal from a Basic vehicle, with no engine/gearing channels', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/index.html');
    await page.waitForFunction(() => !!window.SessionsServices);
    await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      await api.VehicleService.createVehicle({
        type: 'basic', make: 'Simple', model: 'Bike', mass_kg: 180, cda_m2: 0.35, avg_power_kw: 25,
        max_lat_g: 1.1, max_long_g: 0.65
      });
    });
    await loadSampleFile(page);
    await openSim(page);
    await pick(page, 'Simple Bike');
    const hint = page.locator('#vehicleSimVehicleHint');
    await expect(hint).toContainText('180.0 kg');
    await expect(hint).toContainText('CdA 0.35');
    await expect(hint).toContainText('25 kW avg');
    await expect(hint).toContainText('1.10g lat');
    await expect(hint).toContainText('0.65g long');

    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
    const status = await page.locator('#vehicleSimStatus').innerText();
    expect(status).not.toContain('Gear (sim)');
    expect(status).not.toContain('RPM (sim)');
    expect(status).toContain('Aero Decel (sim)');
  });
});
