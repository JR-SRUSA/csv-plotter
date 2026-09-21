const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile } = require('./helpers');

// Motorcycle/car class, the lean-adjusted RPM (tread radius = tire width / 2), the (?)
// explainer, and RPM & gear simulated for logged data.

const PITT_LAP = path.join(__dirname, '..', 'sample_data_files', 'PiBoSo_R3_PittRace_2026-04-16_11-11-18.csv');
const R3_CURVE = [
  [112.5, 0.03], [1133, 1.4], [4420, 10.35], [6056, 15.08], [7050, 18.91], [7950, 24.13],
  [9000, 30.79], [10879, 33.72], [12337, 32.5], [14175, 32.1], [16162, 31.93]
].map(([rpm, power_kw]) => ({ rpm, power_kw }));
const R3_GEARING = {
  primary_ratio: 3.043, final_ratio: 2.867,
  gear_ratios: [2.571, 1.882, 1.5, 1.25, 1.083, 0.958], tire_size: '140/70R17'
};

async function seed(page) {
  await page.goto('/index.html');
  await page.evaluate(async () => {
    localStorage.clear();
    const drop = (name) => new Promise((resolve) => {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
    await drop('csvPlotterFiles');
    await drop('motorsports_app_v1');
    localStorage.setItem('uiFlag7', '1');
  });
  await page.goto('/index.html');
  await page.waitForFunction(() => !!window.SessionsServices);
  await page.evaluate(async ({ curve, gearing }) => {
    const api = window.SessionsServices.createServices();
    await api.VehicleService.createVehicle({
      type: 'motorcycle', make: 'Yamaha', model: 'R3Tire', mass_kg: 170, cda_m2: 0.3, avg_power_kw: 30,
      power_curve: curve, gearing
    });
    await api.VehicleService.createVehicle({
      type: 'car', make: 'Test', model: 'Coupe', mass_kg: 1200, cda_m2: 0.7, avg_power_kw: 120,
      power_curve: curve, gearing
    });
  }, { curve: R3_CURVE, gearing: R3_GEARING });
  await page.reload();
}

async function pick(page, text) {
  const value = await page.locator('#vehicleSimVehicleSelect option', { hasText: text }).first().getAttribute('value');
  await page.selectOption('#vehicleSimVehicleSelect', value);
}

async function openSim(page) {
  await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
}

async function meanOf(page, col) {
  return page.evaluate((c) => {
    const pd = document.getElementById('plotDiv');
    const t = pd.data.find((tr) => tr.meta && tr.meta.channel === c);
    const ys = t ? Array.from(t.y).filter(Number.isFinite) : [];
    return ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : null;
  }, col);
}

test.describe('simulation tire/lean model and vehicle class', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('motorcycle is the default class; picking a car vehicle switches to car, and the choice is remembered', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await expect(page.locator('input[name="vehicleSimClass"][value="motorcycle"]')).toBeChecked();
    await pick(page, 'Coupe');
    await expect(page.locator('input[name="vehicleSimClass"][value="car"]')).toBeChecked();
    await pick(page, 'R3Tire');
    await expect(page.locator('input[name="vehicleSimClass"][value="motorcycle"]')).toBeChecked();
    await page.locator('input[name="vehicleSimClass"][value="car"]').check();
    await page.reload();
    await expect(page.locator('input[name="vehicleSimClass"][value="car"]')).toBeChecked();
  });

  test('the hint says the RPM is lean-adjusted with the tread radius, and drops that for a car', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3Tire');
    await expect(page.locator('#vehicleSimVehicleHint')).toContainText('lean-adjusted (tread radius 70 mm)');
    await page.locator('input[name="vehicleSimClass"][value="car"]').check();
    await expect(page.locator('#vehicleSimVehicleHint')).not.toContainText('lean-adjusted');
  });

  test('the (?) opens an explanation of the channels and assumptions for the current class', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3Tire');
    await page.locator('#vehicleSimInfoBtn').click();
    const dialog = page.locator('.sim-info-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('About the simulation (motorcycle)');
    await expect(dialog).toContainText('Required Lean Angle');
    await expect(dialog).toContainText('tread crown radius = tire width / 2 (70 mm for this tire)');
    await expect(dialog).toContainText('RPM (sim)');
    await page.locator('.sim-info-dialog .session-modal-close').click();
    await expect(dialog).toHaveCount(0);

    await page.locator('input[name="vehicleSimClass"][value="car"]').check();
    await page.locator('#vehicleSimInfoBtn').click();
    await expect(page.locator('.sim-info-dialog')).toContainText('About the simulation (car)');
    await expect(page.locator('.sim-info-dialog')).toContainText('Car class: no lean channels');
    await expect(page.locator('.sim-info-dialog .sim-info-off')).toHaveCount(2); // the two lean channels
  });

  test('a car simulation has no lean channels', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'Coupe');
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
    const status = await page.locator('#vehicleSimStatus').innerText();
    expect(status).not.toContain('Required Lean Angle');
    expect(status).toContain('Gear');
  });

  test('a motorcycle simulation reports the lean channels', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3Tire');
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
    const status = await page.locator('#vehicleSimStatus').innerText();
    expect(status).toContain('Required Lean Angle');
  });

  test('RPM & Gear for logged data adds channels, with a higher RPM through corners than the car (no lean) setting', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3Tire');
    await page.locator('input[name="vehicleSimClass"][value="motorcycle"]').check();
    await page.locator('#vehicleSimLoggedBtn').click();
    await expect(page.locator('#vehicleSimStatus')).toContainText('Added RPM (sim), Gear (sim), Required Lean Angle, Required Lean Angle Rate to 1 log (RPM lean-adjusted');

    const cols = await page.evaluate(() => Array.from(document.getElementById('ySelect').options).map((o) => o.value));
    expect(cols).toContain('RPM (sim)');
    expect(cols).toContain('Gear (sim)');

    await page.evaluate(() => {
      const sel = document.getElementById('ySelect');
      Array.from(sel.options).forEach((o) => { o.selected = o.value === 'RPM (sim)'; });
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect.poll(() => meanOf(page, 'RPM (sim)')).not.toBeNull();
    const leaned = await meanOf(page, 'RPM (sim)');

    await page.locator('input[name="vehicleSimClass"][value="car"]').check();
    await page.locator('#vehicleSimLoggedBtn').click();
    await expect(page.locator('#vehicleSimStatus')).toContainText('Added RPM (sim), Gear (sim) to 1 log.');
    await page.evaluate(() => {
      const sel = document.getElementById('ySelect');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect.poll(async () => (await meanOf(page, 'RPM (sim)')) < leaned).toBe(true);
  });

  test('logged-data RPM needs a vehicle with an engine (a car has nothing else to add)', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await page.locator('input[name="vehicleSimClass"][value="car"]').check();
    await page.locator('#vehicleSimLoggedBtn').click();
    await expect(page.locator('#vehicleSimStatus')).toContainText('Pick a vehicle');
  });
});

test.describe('simulated lap map data and logged-data lean', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('the simulated lap gets Map X / Map Y (and the sim RPM/Gear use the same names as logged data)', async ({ page }) => {
    test.setTimeout(120000);
    for (const file of ['PiBoSo_R3_PittRace_2026-04-16_11-11-18.csv', 'JohnWeraPittRace_YamahaR3.csv']) {
      await loadSampleFile(page, path.join(__dirname, '..', 'sample_data_files', file));
      await openSim(page);
      await pick(page, 'R3Tire');
      await page.locator('#vehicleSimulateBtn').click();
      await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
      const info = await page.evaluate(async () => {
        const api = window.SessionsServices.createServices();
        const sim = (await api.FileService.listFiles()).find((f) => f.metadata && f.metadata.simulated);
        const rows = sim.text.trim().split('\n');
        const header = rows[0].split(',');
        const col = (n) => header.indexOf(n);
        const first = rows[Math.floor(rows.length / 2)].split(',');
        return {
          header,
          mapX: Number(first[col('Map X')]), mapY: Number(first[col('Map Y')]),
          posX: Number(first[col('PosX')]), posY: Number(first[col('PosY')])
        };
      });
      expect(info.header).toContain('Map X');
      expect(info.header).toContain('Map Y');
      expect(info.header).toContain('RPM (sim)');
      expect(info.header).toContain('Gear (sim)');
      // Same frame as the racing line's own X/Y.
      expect(Math.abs(info.mapX - info.posX)).toBeLessThan(0.5);
      expect(Math.abs(info.mapY - info.posY)).toBeLessThan(0.5);
    }
  });

  test('logged-data simulation adds lean angle and its rate from the lateral acceleration', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3Tire');
    await page.locator('#vehicleSimLoggedBtn').click();
    await expect(page.locator('#vehicleSimStatus')).toContainText('Required Lean Angle Rate');
    const check = await page.evaluate(() => {
      const opts = Array.from(document.getElementById('ySelect').options).map((o) => o.value);
      return { hasLean: opts.includes('Required Lean Angle'), hasRate: opts.includes('Required Lean Angle Rate') };
    });
    expect(check.hasLean).toBe(true);
    expect(check.hasRate).toBe(true);
    await page.evaluate(() => {
      const sel = document.getElementById('ySelect');
      Array.from(sel.options).forEach((o) => { o.selected = o.value === 'Required Lean Angle' || o.value === 'LatAcc'; });
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect.poll(() => page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      return pd.data.some((t) => t.meta && t.meta.channel === 'Required Lean Angle');
    })).toBe(true);
    const ok = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const lean = pd.data.find((t) => t.meta && t.meta.channel === 'Required Lean Angle');
      const lat = pd.data.find((t) => t.meta && t.meta.channel === 'LatAcc' && t.name === lean.name.replace('Required Lean Angle', 'LatAcc'));
      if (!lat) return { found: false };
      let worst = 0;
      for (let i = 0; i < lean.y.length; i += 25) {
        if (!Number.isFinite(lean.y[i]) || !Number.isFinite(lat.y[i])) continue;
        worst = Math.max(worst, Math.abs(lean.y[i] - Math.atan(lat.y[i]) * 180 / Math.PI));
      }
      return { found: true, worst };
    });
    if (ok.found) expect(ok.worst).toBeLessThan(0.01);
  });

  test('a motorcycle logged run still gets lean without an engine; a car does not', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await page.locator('#vehicleSimLoggedBtn').click(); // manual, no vehicle
    await expect(page.locator('#vehicleSimStatus')).toContainText('Required Lean Angle');
    await expect(page.locator('#vehicleSimStatus')).toContainText('need a vehicle');
    await page.locator('input[name="vehicleSimClass"][value="car"]').check();
    await page.locator('#vehicleSimLoggedBtn').click();
    await expect(page.locator('#vehicleSimStatus')).toContainText('Pick a vehicle');
  });
});
