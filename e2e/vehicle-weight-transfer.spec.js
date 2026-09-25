// Covers the vehicle editor's optional "Weight Transfer" fields (CG height, CG position,
// wheelbase, center of pressure height) and the Front/Rear Wheel Load (sim) / Axle Load
// (sim) channels they enable, for both the simulated lap and logged data.
const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile, selectYChannels } = require('./helpers');

const PITT_LAP = path.join(__dirname, '..', 'sample_data_files', 'PiBoSo_R3_PittRace_2026-04-16_11-11-18.csv');
const R3_CURVE = [
  [112.5, 0.03], [1133, 1.4], [4420, 10.35], [6056, 15.08], [7050, 18.91], [7950, 24.13],
  [9000, 30.79], [10879, 33.72], [12337, 32.5], [14175, 32.1], [16162, 31.93]
].map(([rpm, power_kw]) => ({ rpm, power_kw }));
const R3_GEARING = {
  primary_ratio: 3.043, final_ratio: 2.867,
  gear_ratios: [2.571, 1.882, 1.5, 1.25, 1.083, 0.958], tire_size: '140/70R17'
};
const MOTO_GEOM = { cg_height_m: 0.6, cg_position_m: 0.75, wheelbase_m: 1.4, cop_height_m: 1.0 };
const CAR_GEOM = { cg_height_m: 0.5, cg_position_m: 1.3, wheelbase_m: 2.6, cop_height_m: 0.5 };

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
  await page.evaluate(async ({ curve, gearing, motoGeom, carGeom }) => {
    const api = window.SessionsServices.createServices();
    await api.VehicleService.createVehicle(Object.assign({
      type: 'motorcycle', make: 'Yamaha', model: 'R3Geom', mass_kg: 170, cda_m2: 0.3, avg_power_kw: 30,
      power_curve: curve, gearing
    }, motoGeom));
    await api.VehicleService.createVehicle(Object.assign({
      type: 'motorcycle', make: 'Yamaha', model: 'R3NoGeom', mass_kg: 170, cda_m2: 0.3, avg_power_kw: 30,
      power_curve: curve, gearing
    }));
    await api.VehicleService.createVehicle(Object.assign({
      type: 'car', make: 'Test', model: 'CoupeGeom', mass_kg: 1200, cda_m2: 0.7, avg_power_kw: 120,
      power_curve: curve, gearing
    }, carGeom));
  }, { curve: R3_CURVE, gearing: R3_GEARING, motoGeom: MOTO_GEOM, carGeom: CAR_GEOM });
  await page.reload();
}

async function pick(page, text) {
  const value = await page.locator('#vehicleSimVehicleSelect option', { hasText: text }).first().getAttribute('value');
  await page.selectOption('#vehicleSimVehicleSelect', value);
}

async function openSim(page) {
  await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
}

// The real loaded file can have a channel of the same name (e.g. its own LongAcc) --
// scoped to the simulated lap's own trace specifically, by name (see
// vehicle-sim-engine.spec.js's equivalent racingLineChannelValues helper), so an
// unrelated real-telemetry trace is never picked up by accident.
async function channelValues(page, ch) {
  return page.evaluate((c) => {
    const pd = document.getElementById('plotDiv');
    const t = pd.data.find((tr) => tr.meta && tr.meta.channel === c && /^(Racing Line|Sim )/.test(tr.name || ''));
    return t ? Array.from(t.y) : null;
  }, ch);
}

test.describe('Vehicle editor: Weight Transfer fields', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('saves and reloads CG height, CG position, wheelbase and center of pressure height', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3Geom');
    await page.locator('#vehicleSimVehicleEditBtn').click();
    const dialog = page.locator('.session-modal-dialog');
    await expect(dialog.locator('input[placeholder="CG height, m"]')).toHaveValue('0.6');
    await expect(dialog.locator('input[placeholder="CG position from front, m"]')).toHaveValue('0.75');
    await expect(dialog.locator('input[placeholder="Wheelbase, m"]')).toHaveValue('1.4');
    await expect(dialog.locator('input[placeholder="Center of pressure height, m"]')).toHaveValue('1');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    const stored = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const [v] = (await api.VehicleService.listVehicles()).filter((x) => x.model === 'R3Geom');
      return v;
    });
    expect(stored.cg_height_m).toBe(0.6);
    expect(stored.cg_position_m).toBe(0.75);
    expect(stored.wheelbase_m).toBe(1.4);
    expect(stored.cop_height_m).toBe(1);
  });

  test('are all optional -- leaving them blank saves a vehicle with no weight-transfer geometry', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await page.locator('#vehicleSimVehicleNewBtn').click();
    const dialog = page.locator('.session-modal-dialog');
    await dialog.locator('input[placeholder^="Make"]').fill('Blank');
    await dialog.locator('input[placeholder^="Model"]').fill('Geom');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();
    const stored = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const [v] = (await api.VehicleService.listVehicles()).filter((x) => x.model === 'Geom');
      return v;
    });
    expect('cg_height_m' in stored).toBe(false);
    expect('wheelbase_m' in stored).toBe(false);
  });
});

test.describe('Simulated lap: Aero/Slope/Tire Decel and wheel/axle loads', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('a motorcycle with full geometry gets Front/Rear Wheel Load (sim), matching the documented formula', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3Geom');
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
    const status = await page.locator('#vehicleSimStatus').innerText();
    expect(status).toContain('Aero Decel (sim)');
    expect(status).toContain('Tire Longitudinal Grip (sim)');
    expect(status).toContain('Front Wheel Load (sim)');
    expect(status).toContain('Rear Wheel Load (sim)');

    await selectYChannels(page, ['Front Wheel Load (sim)', 'Rear Wheel Load (sim)', 'LongAcc', 'Aero Decel (sim)', 'Required Lean Angle (sim)']);
    const front = await channelValues(page, 'Front Wheel Load (sim)');
    const rear = await channelValues(page, 'Rear Wheel Load (sim)');
    const ax = await channelValues(page, 'LongAcc');
    const aero = await channelValues(page, 'Aero Decel (sim)');
    const lean = await channelValues(page, 'Required Lean Angle (sim)');
    expect(front).not.toBeNull();
    expect(rear).not.toBeNull();

    const { cg_height_m: hCg, cg_position_m: p, wheelbase_m: L, cop_height_m: hCop } = MOTO_GEOM;
    // No rider picked, so the effective mass is just the vehicle's own (see
    // computeEffectiveSimParams -- there's no editable Mass field anymore).
    const mass = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const [v] = (await api.VehicleService.listVehicles()).filter((x) => x.model === 'R3Geom');
      return v.mass_kg;
    });
    const staticFront = mass * (L - p) / L;
    const staticRear = mass * p / L;
    let checked = 0;
    for (let i = 0; i < front.length; i += 23) {
      if (![front[i], rear[i], ax[i], aero[i], lean[i]].every(Number.isFinite)) continue;
      const hCgEff = hCg * Math.cos(Math.abs(lean[i]) * Math.PI / 180);
      const mech = mass * ax[i] * hCgEff / L;
      const aeroTerm = mass * aero[i] * hCop / L;
      const expectedFront = staticFront - mech - aeroTerm;
      const expectedRear = staticRear + mech + aeroTerm;
      expect(Math.abs(front[i] - expectedFront)).toBeLessThan(0.05);
      expect(Math.abs(rear[i] - expectedRear)).toBeLessThan(0.05);
      expect(Math.abs((front[i] + rear[i]) - mass)).toBeLessThan(1e-6); // conserved
      checked++;
    }
    expect(checked).toBeGreaterThan(5);
  });

  test('a car with full geometry gets Front/Rear Axle Load (sim) instead of Wheel Load', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'CoupeGeom');
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
    const status = await page.locator('#vehicleSimStatus').innerText();
    expect(status).toContain('Front Axle Load (sim)');
    expect(status).toContain('Rear Axle Load (sim)');
    expect(status).not.toContain('Wheel Load');
    expect(status).not.toContain('Required Lean Angle (sim)');

    const cols = await page.evaluate(() => Array.from(document.getElementById('ySelect').options).map((o) => o.value));
    expect(cols).toContain('Front Axle Load (sim)');
    expect(cols).toContain('Rear Axle Load (sim)');
  });

  test('a vehicle without weight-transfer geometry gets Aero/Tire Decel but no Load channels', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3NoGeom');
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
    const status = await page.locator('#vehicleSimStatus').innerText();
    expect(status).toContain('Aero Decel (sim)');
    expect(status).not.toContain('Wheel Load');
    expect(status).not.toContain('Axle Load');
    const cols = await page.evaluate(() => Array.from(document.getElementById('ySelect').options).map((o) => o.value));
    expect(cols).not.toContain('Front Wheel Load (sim)');
  });
});

test.describe('Logged data: wheel/axle loads', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('adds Front/Rear Wheel Load (sim) to a real log when the vehicle has full geometry', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3Geom');
    await page.locator('#vehicleSimLoggedBtn').click();
    const status = page.locator('#vehicleSimStatus');
    await expect(status).toContainText('Front Wheel Load (sim)');
    await expect(status).toContainText('Rear Wheel Load (sim)');
    const cols = await page.evaluate(() => Array.from(document.getElementById('ySelect').options).map((o) => o.value));
    expect(cols).toContain('Front Wheel Load (sim)');
    expect(cols).toContain('Rear Wheel Load (sim)');
  });

  test('a vehicle picked but missing geometry gets a note instead of Load channels', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, 'R3NoGeom');
    await page.locator('#vehicleSimLoggedBtn').click();
    const status = page.locator('#vehicleSimStatus');
    await expect(status).toContainText('Wheel/axle loads need CG height, CG position and wheelbase');
    const cols = await page.evaluate(() => Array.from(document.getElementById('ySelect').options).map((o) => o.value));
    expect(cols).not.toContain('Front Wheel Load (sim)');
  });
});
