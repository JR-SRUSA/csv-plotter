// Covers the Rider editor's optional "Weight Transfer" fields (CG height/position deltas
// for tucked/braking/hang-off, plus hang-off lateral displacement) and their effect on the
// simulated lap's Front/Rear Wheel Load (sim) channels.
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
const GEOM = { cg_height_m: 0.6, cg_position_m: 0.75, wheelbase_m: 1.4 };

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
  await page.evaluate(async ({ curve, gearing, geom }) => {
    const api = window.SessionsServices.createServices();
    await api.VehicleService.createVehicle(Object.assign({
      type: 'motorcycle', make: 'Yamaha', model: 'R3Rider', mass_kg: 170, cda_m2: 0.3, avg_power_kw: 30,
      power_curve: curve, gearing
    }, geom));
  }, { curve: R3_CURVE, gearing: R3_GEARING, geom: GEOM });
  await page.reload();
}

async function openSim(page) {
  await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
}

async function pick(page, selector, text) {
  const value = await page.locator(`${selector} option`, { hasText: text }).first().getAttribute('value');
  await page.selectOption(selector, value);
}

async function channelValues(page, ch) {
  return page.evaluate((c) => {
    const pd = document.getElementById('plotDiv');
    const t = pd.data.find((tr) => tr.meta && tr.meta.channel === c && /^(Racing Line|Sim )/.test(tr.name || ''));
    return t ? Array.from(t.y) : null;
  }, ch);
}

test.describe('Rider editor: Weight Transfer fields', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('saves and reloads the tucked/braking/hang-off CG deltas and hang-off lateral displacement', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await page.locator('#vehicleSimRiderNewBtn').click();
    const dialog = page.locator('.session-modal-dialog');
    await dialog.locator('input[placeholder="Name"]').fill('Posture Rider');
    await dialog.locator('input[placeholder="Tucked ΔCG height, m"]').fill('-0.05');
    await dialog.locator('input[placeholder="Tucked ΔCG position, m"]').fill('0.02');
    await dialog.locator('input[placeholder="Braking ΔCG height, m"]').fill('0.08');
    await dialog.locator('input[placeholder="Braking ΔCG position, m"]').fill('-0.03');
    await dialog.locator('input[placeholder="Hang-off ΔCG height, m"]').fill('-0.12');
    await dialog.locator('input[placeholder="Hang-off ΔCG position, m"]').fill('0.01');
    await dialog.locator('input[placeholder="Hang-off lateral displacement, m"]').fill('0.35');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    const r = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return (await api.RiderService.listRiders())[0];
    });
    expect(r.cg_height_delta_tucked_m).toBe(-0.05);
    expect(r.cg_position_delta_tucked_m).toBe(0.02);
    expect(r.cg_height_delta_braking_m).toBe(0.08);
    expect(r.cg_position_delta_braking_m).toBe(-0.03);
    expect(r.cg_height_delta_hangoff_m).toBe(-0.12);
    expect(r.cg_position_delta_hangoff_m).toBe(0.01);
    expect(r.cg_lateral_hangoff_m).toBe(0.35);

    await page.locator('#vehicleSimRiderEditBtn').click();
    await expect(page.locator('.session-modal-dialog input[placeholder="Braking ΔCG height, m"]')).toHaveValue('0.08');
  });

  test('a rider with a large braking CG-height delta measurably changes Front Wheel Load (sim) during braking', async ({ page }) => {
    test.setTimeout(120000);
    await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      await api.RiderService.createRider({
        name: 'Sits Up Hard', weight_kg: 0, // isolate the geometry effect from added mass
        cg_height_delta_braking_m: 0.3, cg_height_delta_tucked_m: 0
      });
    });
    await page.reload();
    await loadSampleFile(page, PITT_LAP);
    await openSim(page);
    await pick(page, '#vehicleSimVehicleSelect', 'R3Rider');

    // Baseline: no rider.
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
    await selectYChannels(page, ['Front Wheel Load (sim)', 'LongAcc', 'Required Lean Angle']);
    const baselineFront = await channelValues(page, 'Front Wheel Load (sim)');
    const ax = await channelValues(page, 'LongAcc');
    const lean = await channelValues(page, 'Required Lean Angle');

    // With the rider: braking points (ax < 0) should show a bigger front-load swing since
    // the effective CG height is higher there (0.6 + 0.3), same mass and geometry otherwise.
    await pick(page, '#vehicleSimRiderSelect', 'Sits Up Hard');
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(() => page.locator('#vehicleSimStatus').innerText(), { timeout: 90000 }).toMatch(/Saved as/);
    await selectYChannels(page, ['Front Wheel Load (sim)', 'LongAcc', 'Required Lean Angle']);
    const riderFront = await channelValues(page, 'Front Wheel Load (sim)');

    let brakingChecked = 0;
    let acceleratingUnchanged = 0;
    for (let i = 0; i < ax.length; i += 5) {
      if (![baselineFront[i], riderFront[i], ax[i], lean[i]].every(Number.isFinite)) continue;
      // Skip points past the hang-off lean threshold (this rider has no hang-off delta,
      // and heavy trail-braking corners on a real lap can easily be leaned past it too).
      if (Math.abs(lean[i]) > 15) continue;
      const diff = Math.abs(riderFront[i] - baselineFront[i]);
      if (ax[i] < -0.1) {
        // Braking: the rider's braking CG-height delta should shift the load noticeably.
        expect(diff).toBeGreaterThan(0.05);
        brakingChecked++;
      } else if (ax[i] > 0.1) {
        // Accelerating: this rider's tucked delta is 0, so no change from baseline.
        expect(diff).toBeLessThan(1e-6);
        acceleratingUnchanged++;
      }
    }
    expect(brakingChecked).toBeGreaterThan(3);
    expect(acceleratingUnchanged).toBeGreaterThan(3);
  });
});
