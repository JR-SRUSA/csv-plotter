const { test, expect } = require('@playwright/test');
const { loadSampleFile, selectYChannels } = require('./helpers');

// Simulate Vehicle: vehicle/rider pickers (reusing the Sessions editors), mass/CdA taken
// from the combined bike + rider, and an engine-curve + gearing power model that picks the
// best gear at each point and outputs synthetic Gear and RPM channels.

const SHAPED_CURVE = [
  { rpm: 3000, power_kw: 10 }, { rpm: 6000, power_kw: 30 }, { rpm: 9000, power_kw: 52 },
  { rpm: 11000, power_kw: 60 }, { rpm: 12500, power_kw: 55 }
];
const FULL_GEARING = {
  primary_ratio: 1.0, final_ratio: 2.8,
  gear_ratios: [2.5, 1.9, 1.5, 1.25, 1.05, 0.95], wheel_circumference_m: 1.9
};

// The Yamaha R3's real motor curve (sample_data_files/r3_motor.csv: RPM, kW) with its stock
// ratios, on a real Pittsburgh lap (a GP Bikes log of the same bike). A wheel DIAMETER typed
// where the circumference belongs (0.59 instead of ~1.85) is what pinned the simulated bike
// at the top-gear redline for the whole lap.
const path = require('path');
const PITT_LAP = path.join(__dirname, '..', 'sample_data_files', 'PiBoSo_R3_PittRace_2026-04-16_11-11-18.csv');
const R3_CURVE = [
  [112.5, 0.03], [1133, 1.4], [4420, 10.35], [6056, 15.08], [7050, 18.91], [7950, 24.13],
  [9000, 30.79], [10879, 33.72], [12337, 32.5], [14175, 32.1], [16162, 31.93]
].map(([rpm, power_kw]) => ({ rpm, power_kw }));
const R3_GEARING = {
  primary_ratio: 3.043, final_ratio: 2.867,
  gear_ratios: [2.571, 1.882, 1.5, 1.25, 1.083, 0.958], wheel_circumference_m: 1.85
};

// Fresh storage, then a known vehicle/rider set created through the real services (the
// pickers read them on load), then a reload so the app starts with them.
async function seed(page) {
  await page.goto('/sample_data_files/');
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
  await page.evaluate(async ({ curve, gearing, r3Curve, r3Gearing }) => {
    const api = window.SessionsServices.createServices();
    await api.VehicleService.createVehicle({
      type: 'motorcycle', make: 'Test', model: 'Full', mass_kg: 190, cda_m2: 0.3,
      avg_power_kw: 40, power_curve: curve, gearing
    });
    await api.VehicleService.createVehicle({
      type: 'motorcycle', make: 'Test', model: 'NoGears', mass_kg: 180, cda_m2: 0.28,
      avg_power_kw: 35, power_curve: curve
    });
    for (const [model, circumference, shiftMs] of [['R3Good', 1.85], ['R3DiameterTypo', 0.59], ['R3SlowShift', 1.85, 3000]]) {
      await api.VehicleService.createVehicle({
        type: 'motorcycle', make: 'Yamaha', model, mass_kg: 170, cda_m2: 0.3, avg_power_kw: 30,
        power_curve: r3Curve, gearing: Object.assign({}, r3Gearing, { wheel_circumference_m: circumference }, shiftMs ? { shift_time_ms: shiftMs } : {})
      });
    }
    await api.RiderService.createRider({ name: 'Rider One', weight_kg: 75, cda_tucked_m2: 0.1 });
  }, { curve: SHAPED_CURVE, gearing: FULL_GEARING, r3Curve: R3_CURVE, r3Gearing: R3_GEARING });
  await page.reload();
}

async function openSimPanel(page) {
  // The summary's centre is the Simulate button itself, so open the <details> directly.
  await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
}

async function pickVehicle(page, model) {
  const value = await page.locator('#vehicleSimVehicleSelect option', { hasText: model }).first().getAttribute('value');
  await page.selectOption('#vehicleSimVehicleSelect', value);
}

async function simulate(page) {
  await page.locator('#vehicleSimulateBtn').click();
  await expect.poll(
    () => page.locator('#vehicleSimStatus').innerText(),
    { timeout: 90000 }
  ).toMatch(/Simulated lap time:/);
}

// Values of a channel on the simulated Racing Line log specifically -- the real sample file
// has a Gear channel of its own, so "does the channel exist" isn't enough. Trace names are
// "<file> -- Lap N -- <channel>".
async function racingLineChannelValues(page, channel) {
  await selectYChannels(page, [channel]);
  return page.evaluate((ch) => {
    const pd = document.getElementById('plotDiv');
    const trace = pd.data.find((t) => t.meta && t.meta.channel === ch && /^(Racing Line|Sim )/.test(t.name || ''));
    return trace ? Array.from(trace.y).filter((v) => Number.isFinite(v)) : null;
  }, channel);
}

test.describe('Simulate Vehicle: vehicle/rider selection and the engine-curve power model', () => {
  test.beforeEach(async ({ page }) => {
    await seed(page);
  });

  test('the pickers list the stored vehicles and riders', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    const vehicles = await page.locator('#vehicleSimVehicleSelect option').allInnerTexts();
    expect(vehicles[0]).toMatch(/Manual/);
    expect(vehicles.join('|')).toContain('Full');
    expect(vehicles.join('|')).toContain('NoGears');
    expect(await page.locator('#vehicleSimRiderSelect option').allInnerTexts()).toContain('Rider One');
  });

  test('picking a vehicle and rider sources mass and CdA from the combined bike + rider', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    const hint = page.locator('#vehicleSimVehicleHint');
    await pickVehicle(page, 'Full');
    await expect(hint).toContainText('190.0 kg');
    await expect(hint).toContainText('CdA 0.30');
    await expect(hint).toContainText('40 kW avg');

    await page.selectOption('#vehicleSimRiderSelect', { label: 'Rider One' });
    await expect(hint).toContainText('265.0 kg'); // 190 + 75
    await expect(hint).toContainText('CdA 0.40'); // 0.30 + 0.10 tucked
  });

  test('with no vehicle picked, a rider alone leaves the generic default mass (nothing to add it to)', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await page.selectOption('#vehicleSimRiderSelect', { label: 'Rider One' });
    await expect(page.locator('#vehicleSimVehicleHint')).toContainText('235.0 kg');
  });

  test('the hint says whether the vehicle can drive the engine-curve model, and what is missing', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    const hint = page.locator('#vehicleSimVehicleHint');
    await pickVehicle(page, 'Full');
    await expect(hint).toContainText('Engine curve + gearing ready');
    await pickVehicle(page, 'NoGears');
    await expect(hint).toContainText('missing');
    await expect(hint).toContainText('gear ratios');
    await page.selectOption('#vehicleSimPowerModel', 'average');
    await expect(hint).toContainText('Average power mode');
  });

  test('engine-curve simulation picks a gear at every point and outputs Gear and RPM channels', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await pickVehicle(page, 'Full');
    await page.selectOption('#vehicleSimRiderSelect', { label: 'Rider One' });
    await simulate(page);
    await expect(page.locator('#vehicleSimStatus')).toContainText('Engine curve + gearing');
    await expect(page.locator('#vehicleSimStatus')).toContainText('Gear (sim), RPM (sim)');

    const gears = await racingLineChannelValues(page, 'Gear (sim)');
    expect(gears).not.toBeNull();
    expect(gears.length).toBeGreaterThan(10);
    gears.forEach((g) => { expect(Number.isInteger(g)).toBe(true); expect(g).toBeGreaterThanOrEqual(1); expect(g).toBeLessThanOrEqual(6); });

    const rpm = await racingLineChannelValues(page, 'RPM (sim)');
    expect(rpm).not.toBeNull();
    // Never above the curve's redline, and always a real engine speed.
    rpm.forEach((r) => { expect(r).toBeGreaterThan(0); expect(r).toBeLessThanOrEqual(12500); });
  });

  test('the hint shows the top-gear redline speed so a wrong wheel size is visible before simulating', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await pickVehicle(page, 'Full');
    await expect(page.locator('#vehicleSimVehicleHint')).toContainText(/redline at \d+ km\/h/);
    await pickVehicle(page, 'R3Good');
    await expect(page.locator('#vehicleSimVehicleHint')).toContainText(/redline at 2[01]\d km\/h/);
    await pickVehicle(page, 'R3DiameterTypo');
    // 16162 rpm / 60 / (3.043 x 0.958 x 2.867) x 0.59 m = 19 m/s = 68 km/h -- a third of the right answer.
    await expect(page.locator('#vehicleSimVehicleHint')).toContainText(/redline at 6\d km\/h/);
  });

  test('the hint spells out the stored wheel size and ratios, and flags an implausible wheel for the vehicle type', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    const hint = page.locator('#vehicleSimVehicleHint');

    await pickVehicle(page, 'R3Good');
    await expect(hint).toContainText('Wheel: 589 mm diameter');
    await expect(hint).toContainText('6 gears, primary 3.043, final 2.867');
    await expect(hint).not.toContainText('unusual wheel size');

    // A 188 mm wheel is obviously wrong for a motorcycle.
    await pickVehicle(page, 'R3DiameterTypo');
    await expect(hint).toContainText('Wheel: 188 mm diameter');
    await expect(hint).toContainText('unusual wheel size for a motorcycle');
    await expect(hint).toContainText('check the tire size');
  });

  test('a diameter typed as the circumference caps the whole lap at the top-gear redline, and is called out', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSimPanel(page);
    await pickVehicle(page, 'R3DiameterTypo');
    await simulate(page);
    const status = page.locator('#vehicleSimStatus');
    await expect(status).toContainText('WARNING: rev-limited in top gear at 6');
    await expect(status).toContainText('final drive and tire size');

    // The reported symptom: pinned at one speed (~68 km/h) in top gear, near redline RPM.
    const speed = await racingLineChannelValues(page, 'Speed');
    expect(Math.max(...speed)).toBeLessThan(70);
    const gears = await racingLineChannelValues(page, 'Gear (sim)');
    expect(gears.filter((g) => g === 6).length / gears.length).toBeGreaterThan(0.5);
    const rpm = await racingLineChannelValues(page, 'RPM (sim)');
    expect(Math.max(...rpm)).toBeGreaterThan(16000);
  });

  test('a long shift time makes the sim hold gears instead of downshifting for every corner', async ({ page }) => {
    test.setTimeout(180000);
    const changes = async (model) => {
      await pickVehicle(page, model);
      await simulate(page);
      const gears = await racingLineChannelValues(page, 'Gear (sim)');
      let n = 0;
      for (let i = 1; i < gears.length; i++) if (gears[i] !== gears[i - 1]) n++;
      return n;
    };
    await loadSampleFile(page, PITT_LAP);
    await openSimPanel(page);
    const instant = await changes('R3Good');
    const slow = await changes('R3SlowShift');
    expect(slow).toBeLessThan(instant);
    await expect(page.locator('#vehicleSimVehicleHint')).toContainText('Shift time 3000 ms');
  });

  test('the same bike with the right wheel size is not rev-limited and lays down a plausible lap', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSimPanel(page);
    await pickVehicle(page, 'R3Good');
    await simulate(page);
    const status = await page.locator('#vehicleSimStatus').innerText();
    expect(status).not.toContain('WARNING');
    const [, mins, secs] = status.match(/Simulated lap time: (\d+):(\d+\.\d+)/);
    const lapSeconds = Number(mins) * 60 + Number(secs);
    expect(lapSeconds).toBeGreaterThan(80);
    expect(lapSeconds).toBeLessThan(260);

    const speed = await racingLineChannelValues(page, 'Speed');
    expect(Math.max(...speed)).toBeGreaterThan(120);
    // Real gear choices: it uses several gears, and never runs past the curve's redline.
    const gears = await racingLineChannelValues(page, 'Gear (sim)');
    expect(new Set(gears).size).toBeGreaterThan(2);
    const rpm = await racingLineChannelValues(page, 'RPM (sim)');
    expect(Math.max(...rpm)).toBeLessThanOrEqual(16163);
  });

  test('a vehicle without gearing falls back to average power and says why (no Gear/RPM channels)', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await pickVehicle(page, 'NoGears');
    await simulate(page);
    await expect(page.locator('#vehicleSimStatus')).toContainText('missing');
    await expect(page.locator('#vehicleSimStatus')).toContainText('used average power instead');
    expect(await racingLineChannelValues(page, 'Gear (sim)')).toBeNull();
    expect(await racingLineChannelValues(page, 'RPM (sim)')).toBeNull();
  });

  test('average power mode simulates without Gear/RPM channels', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await pickVehicle(page, 'Full');
    await page.selectOption('#vehicleSimPowerModel', 'average');
    await simulate(page);
    await expect(page.locator('#vehicleSimStatus')).toContainText('Average power model');
    expect(await racingLineChannelValues(page, 'Gear (sim)')).toBeNull();
    expect(await racingLineChannelValues(page, 'RPM (sim)')).toBeNull();
  });

  test('curve mode with no vehicle chosen explains it needs one', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await simulate(page);
    await expect(page.locator('#vehicleSimStatus')).toContainText('needs a vehicle');
  });

  test('the ✎ and + buttons open the same Sessions vehicle editor, and a new vehicle gets selected', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await expect(page.locator('#vehicleSimVehicleEditBtn')).toBeDisabled();

    await pickVehicle(page, 'Full');
    await page.locator('#vehicleSimVehicleEditBtn').click();
    const dialog = page.locator('.session-modal-dialog');
    await expect(dialog.locator('.session-modal-title')).toHaveText('Edit Vehicle');
    await dialog.locator('.session-modal-cancel').click();

    await page.locator('#vehicleSimVehicleNewBtn').click();
    await expect(page.locator('.session-modal-dialog .session-modal-title')).toHaveText('Add Vehicle');
    await page.locator('.session-modal-dialog input[placeholder^="Make"]').fill('Brand');
    await page.locator('.session-modal-dialog input[placeholder^="Model"]').fill('New');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toHaveCount(0);
    await expect(page.locator('#vehicleSimVehicleSelect option:checked')).toContainText('Brand');
  });

  test('the vehicle editor takes a tire size and shows the diameter in mm', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await page.locator('#vehicleSimVehicleNewBtn').click();
    const dialog = page.locator('.session-modal-dialog');
    const tire = dialog.locator('input[placeholder^="Tire size"]');

    await tire.fill('140/70R17');
    await expect(dialog).toContainText('Overall diameter: 628 mm'); // 2 x 140 x 0.7 + 17 x 25.4
    await tire.fill('190/55ZR17');
    await expect(dialog).toContainText('Overall diameter: 641 mm');
    await tire.fill('nonsense');
    await expect(dialog).toContainText('Unrecognised tire size');
    await dialog.locator('input[placeholder^="Make"]').fill('Bad');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toContainText('Tire size not recognised');
    await expect(dialog).toBeVisible();
  });

  test('a legacy stored circumference shows its diameter in mm when the vehicle is edited again', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await pickVehicle(page, 'Full');
    await page.locator('#vehicleSimVehicleEditBtn').click();
    await expect(page.locator('.session-modal-dialog')).toContainText('Overall diameter: 605 mm'); // 1.9 / pi
  });

  test('the simulated lap includes a Required Lean Angle channel equal to atan(lateral g)', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await openSimPanel(page);
    await pickVehicle(page, 'R3Good');
    await simulate(page);
    await expect(page.locator('#vehicleSimStatus')).toContainText('Required Lean Angle');
    const lean = await racingLineChannelValues(page, 'Required Lean Angle');
    expect(lean.length).toBeGreaterThan(10);
    expect(Math.max(...lean.map(Math.abs))).toBeGreaterThan(20);
    expect(Math.max(...lean.map(Math.abs))).toBeLessThan(65);
  });

  test('the rider editor works from the sim panel too', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await page.locator('#vehicleSimRiderNewBtn').click();
    await expect(page.locator('.session-modal-dialog .session-modal-title')).toHaveText('Add Rider');
    await page.locator('.session-modal-dialog input[placeholder^="Name"]').fill('Second Rider');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('#vehicleSimRiderSelect option:checked')).toHaveText('Second Rider');
  });

  test('the chosen vehicle and rider are remembered across a reload', async ({ page }) => {
    await loadSampleFile(page);
    await openSimPanel(page);
    await pickVehicle(page, 'Full');
    await page.selectOption('#vehicleSimRiderSelect', { label: 'Rider One' });
    await page.reload();
    await expect(page.locator('#vehicleSimVehicleSelect option:checked')).toContainText('Full');
    await expect(page.locator('#vehicleSimRiderSelect option:checked')).toHaveText('Rider One');
  });

  test('on a phone the editor opens above the drawer, not hidden behind it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto('/index.html');
    if (!(await page.evaluate(() => document.body.classList.contains('controls-open')))) {
      await page.locator('#controlsToggle').click();
    }
    await openSimPanel(page);
    await page.locator('#vehicleSimVehicleNewBtn').click();
    const dialog = page.locator('.session-modal-dialog');
    await expect(dialog).toBeVisible();
    const covered = await dialog.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + 30);
      return !el.contains(top);
    });
    expect(covered).toBe(false);
  });

  test('the multi-line power curve field keeps its height once values are entered', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#vehicleSimDetails').evaluate((d) => { d.open = true; });
    await page.locator('#vehicleSimVehicleNewBtn').click();
    const textarea = page.locator('.session-modal-dialog textarea').first();
    const before = (await textarea.boundingBox()).height;
    await textarea.fill('3000, 10\n6000, 30\n9000, 52\n11000, 60\n12500, 55\n13000, 50');
    await expect(page.locator('.vehicle-power-chart')).toBeVisible();
    const after = (await textarea.boundingBox()).height;
    // The chart appearing must not crush it (it used to collapse to a single line).
    expect(after).toBeGreaterThanOrEqual(before - 1);
    expect(after).toBeGreaterThan(40);
  });
});
