const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile, selectYChannels } = require('./helpers');

// Every simulation is stored as a file, tagged with the vehicle/rider used, attached to
// the session selected in the Sessions panel, uniquely named, and renamable with notes.

const PITT_LAP = path.join(__dirname, '..', 'sample_data_files', 'PiBoSo_R3_PittRace_2026-04-16_11-11-18.csv');

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
  await page.evaluate(async () => {
    const api = window.SessionsServices.createServices();
    await api.VehicleService.createVehicle({ type: 'motorcycle', make: 'Test', model: 'Bike', mass_kg: 190, cda_m2: 0.3, avg_power_kw: 40 });
    await api.RiderService.createRider({ name: 'Rider One', weight_kg: 75, cda_tucked_m2: 0.1 });
    await api.SessionService.createSession({ name: 'Practice A', start_time: new Date().toISOString() });
  });
  await page.reload();
}

async function simulate(page) {
  const before = await page.locator('#vehicleSimStatus').innerText();
  await page.locator('#vehicleSimulateBtn').click();
  await expect.poll(async () => {
    const t = await page.locator('#vehicleSimStatus').innerText();
    return /Saved as|Could not save/.test(t) && t !== before;
  }, { timeout: 90000 }).toBe(true);
}

async function pickByText(page, selector, text) {
  const value = await page.locator(`${selector} option`, { hasText: text }).first().getAttribute('value');
  await page.selectOption(selector, value);
}

async function storedFiles(page) {
  return page.evaluate(async () => {
    const api = window.SessionsServices.createServices();
    return (await api.FileService.listFiles()).map((f) => ({
      id: f.id, name: f.name, vehicle_id: f.vehicle_id, rider_id: f.rider_id,
      session_ids: f.session_ids, notes: f.metadata && f.metadata.notes, simulated: f.metadata && f.metadata.simulated,
      text: f.text
    }));
  });
}

test.describe('Simulate Vehicle: saving runs', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('a run is stored, tagged with vehicle + rider, and added to the selected session', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
    await pickByText(page, '#vehicleSimVehicleSelect', 'Bike');
    await pickByText(page, '#vehicleSimRiderSelect', 'Rider One');
    await page.evaluate(() => window.SessionsUI.renderPanel());
    await simulate(page);

    const status = await page.locator('#vehicleSimStatus').innerText();
    expect(status).toContain('added to session "Practice A"');
    expect(status).toContain('Required Lean Angle Rate');

    const files = await storedFiles(page);
    const sim = files.find((f) => f.simulated);
    expect(sim).toBeTruthy();
    expect(sim.name).toMatch(/^Sim — .*\.csv$/);
    expect(sim.session_ids.length).toBe(1);
    const ids = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const [v] = await api.VehicleService.listVehicles();
      const [r] = await api.RiderService.listRiders();
      const [s] = await api.SessionService.listSessions();
      const detail = await api.SessionService.getSessionDetail(s.id);
      return { v: v.id, r: r.id, s: s.id, sessionFiles: detail.files.map((f) => f.name) };
    });
    expect(sim.vehicle_id).toBe(ids.v);
    expect(sim.rider_id).toBe(ids.r);
    expect(sim.session_ids).toEqual([ids.s]);
    expect(ids.sessionFiles).toContain(sim.name);
    // The stored CSV has the data, including the new lean channels.
    expect(sim.text.split('\n')[0]).toContain('Required Lean Angle Rate');
    expect(sim.text.split('\n').length).toBeGreaterThan(50);
  });

  test('running again with the same name never overwrites the earlier sim', async ({ page }) => {
    test.setTimeout(180000);
    await loadSampleFile(page, PITT_LAP);
    await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
    await page.fill('#vehicleSimName', 'Baseline');
    await simulate(page);
    await simulate(page);
    const names = (await storedFiles(page)).filter((f) => f.simulated).map((f) => f.name).sort();
    expect(names).toEqual(['Baseline (2).csv', 'Baseline.csv']);
  });

  test('a sim can be renamed and given notes afterwards', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
    await expect(page.locator('#vehicleSimRenameBtn')).toBeDisabled();
    await simulate(page);
    await expect(page.locator('#vehicleSimRenameBtn')).toBeEnabled();

    await page.fill('#vehicleSimName', 'Low grip test');
    await page.fill('#vehicleSimNotes', 'Wet track, 0.7 g limit');
    await page.locator('#vehicleSimRenameBtn').click();
    await expect(page.locator('#vehicleSimStatus')).toContainText('Saved sim as "Low grip test"');

    const files = (await storedFiles(page)).filter((f) => f.simulated);
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('Low grip test.csv');
    expect(files[0].notes).toBe('Wet track, 0.7 g limit');
    // The loaded lap is renamed too.
    await expect(page.locator('#filesList')).toContainText('Low grip test.csv');
  });

  test('the Required Lean Angle Rate channel is plotted alongside the lean angle', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
    await simulate(page);
    await selectYChannels(page, ['Required Lean Angle Rate']);
    const values = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const t = pd.data.find((tr) => tr.meta && tr.meta.channel === 'Required Lean Angle Rate' && /^Sim /.test(tr.name || ''));
      return t ? Array.from(t.y).filter(Number.isFinite) : [];
    });
    expect(values.length).toBeGreaterThan(50);
    expect(Math.max(...values.map(Math.abs))).toBeGreaterThan(5); // deg/s through the corners
  });

  test('a new sim row in the files list is laid out like the other files, not a tall skinny column', async ({ page }) => {
    test.setTimeout(120000);
    await loadSampleFile(page, PITT_LAP);
    await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
    await simulate(page);
    const widths = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('#filesList .file-item'));
      return items.map((el) => {
        const name = el.querySelector('.file-name-wrap');
        return { itemW: el.getBoundingClientRect().width, nameW: name.getBoundingClientRect().width, nameH: name.getBoundingClientRect().height };
      });
    });
    expect(widths.length).toBe(2);
    for (const w of widths) {
      expect(w.nameW).toBeGreaterThan(w.itemW * 0.5);
    }
  });
});

test.describe('mobile fixes', () => {
  test.use({ viewport: { width: 390, height: 800 }, hasTouch: true });

  test('the drawer close button draws an X icon', async ({ page }) => {
    await page.goto('/index.html');
    if (!(await page.locator('body.controls-open').count())) await page.locator('#controlsToggle').click();
    const close = page.locator('#controlsClose');
    await expect(close).toBeVisible();
    await expect(close.locator('svg line')).toHaveCount(2);
    const box = await close.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(30);
    await close.click();
    await expect(page.locator('body')).not.toHaveClass(/controls-open/);
  });

  test('tapping a turn in the strip zooms the plot (and map) to that turn', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    if (await page.locator('body.controls-open').count()) await page.locator('#controlsClose').click();
    const target = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const fl = pd._fullLayout;
      const r = pd.getBoundingClientRect();
      const x = r.left + fl.xaxis._offset + fl.xaxis.l2p(1000);
      const paperY = 0.985; // inside CORNER_STRIP_DOMAIN
      const y = r.top + fl._size.t + (1 - paperY) * fl._size.h;
      return { x, y };
    });
    await page.locator('#plotDiv').scrollIntoViewIfNeeded();
    const t2 = await page.evaluate(({ x, y }) => {
      const pd = document.getElementById('plotDiv');
      const fl = pd._fullLayout;
      const r = pd.getBoundingClientRect();
      return { x: r.left + fl.xaxis._offset + fl.xaxis.l2p(1000), y: r.top + fl._size.t + (1 - 0.985) * fl._size.h };
    }, target);
    await page.touchscreen.tap(t2.x, t2.y);
    await expect.poll(() => page.evaluate(() => {
      const r = document.getElementById('plotDiv')._fullLayout.xaxis.range.map(Number);
      return r[1] - r[0];
    })).toBeLessThan(1500);
  });
});

test.describe('linked simulated-channel files and the remembered session', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('logged-data channels are saved as a linked file, in the same session, and re-applied on reload', async ({ page }) => {
    await loadSampleFile(page, PITT_LAP);
    // Attach the real log to the session first (as a user would).
    await page.evaluate(() => window.SessionsUI.renderPanel());
    await page.locator('.file-add-to-session-btn').first().click();
    await page.locator('.session-modal-save').click();
    await expect.poll(async () => (await storedFiles(page)).find((f) => !f.simulated && f.session_ids.length === 1)).toBeTruthy();

    await page.evaluate(() => { document.getElementById('vehicleSimDetails').open = true; });
    await page.locator('#vehicleSimLoggedBtn').click(); // motorcycle, no vehicle: lean + Tire/Aero Decel
    await expect(page.locator('#vehicleSimStatus')).toContainText('Saved as linked file');

    const linked = (await storedFiles(page)).find((f) => f.name.endsWith(' - sim channels.csv'));
    expect(linked).toBeTruthy();
    expect(linked.simulated).toBe(true);
    const source = (await storedFiles(page)).find((f) => f.name.startsWith('PiBoSo'));
    expect(linked.session_ids).toEqual(source.session_ids); // same session as its source
    expect(linked.text.split('\n')[0]).toBe('Row,Required Lean Angle,Required Lean Angle Rate,Aero Decel (sim),Tire Longitudinal Grip (sim)');

    // Reload and load the source log again: the channels come back by themselves.
    await page.reload();
    await loadSampleFile(page, PITT_LAP);
    await expect.poll(() => page.evaluate(() => Array.from(document.getElementById('ySelect').options).map((o) => o.value)))
      .toContain('Required Lean Angle');

    // The linked file is not offered as a log to load.
    await page.locator('#pickUploadedDataBtn').click();
    await expect(page.locator('#pickUploadedList')).not.toContainText('sim channels');
  });

  test('the selected session is remembered across a reload', async ({ page }) => {
    await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      await api.SessionService.createSession({ name: 'Practice B', start_time: new Date(Date.now() + 3600e3).toISOString() });
    });
    await page.reload();
    await page.evaluate(() => { document.getElementById('sessionsPanel').open = true; });
    await expect(page.locator('#sessionsPanelSelect')).toBeVisible();
    const other = await page.locator('#sessionsPanelSelect option').evaluateAll((opts) => {
      const cur = document.getElementById('sessionsPanelSelect').value;
      return opts.map((o) => o.value).find((v) => v !== cur);
    });
    await page.selectOption('#sessionsPanelSelect', other);
    await page.reload();
    await page.evaluate(() => { document.getElementById('sessionsPanel').open = true; });
    await expect(page.locator('#sessionsPanelSelect')).toHaveValue(other);
  });
});

test.describe('New Session from the Sessions panel', () => {
  test.beforeEach(async ({ page }) => { await seed(page); });

  test('uses the same session modal as Add to Session (no browser prompt), with vehicle, rider, tags and note', async ({ page }) => {
    let prompted = false;
    page.on('dialog', (d) => { prompted = true; d.dismiss(); });
    await page.evaluate(() => { document.getElementById('sessionsPanel').open = true; });
    await page.locator('.sessions-new-btn').click();

    const dialog = page.locator('.session-modal-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.session-modal-title')).toHaveText('New Session');
    await expect(dialog.locator('.session-modal-save')).toHaveText('Create Session');
    // No files / existing-session picker in create mode; the shared fields are all there.
    await expect(dialog.locator('#addToSessionSelect')).toBeHidden();
    for (const id of ['#addToSessionNewName', '#addToSessionNewLocation', '#addToSessionVehicle', '#addToSessionRider', '#addToSessionTags', '#addToSessionNote']) {
      await expect(dialog.locator(id)).toBeVisible();
    }

    // A name is required.
    await dialog.locator('.session-modal-save').click();
    await expect(dialog.locator('.session-modal-status')).toContainText('name');

    await page.fill('#addToSessionNewName', 'Sunday Race');
    await page.fill('#addToSessionNewLocation', 'Pittsburgh');
    const bike = await page.locator('#addToSessionVehicle option', { hasText: 'Bike' }).getAttribute('value');
    await page.selectOption('#addToSessionVehicle', bike);
    await page.fill('#addToSessionTags', 'race, dry');
    await page.fill('#addToSessionNote', 'Cold morning');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();
    expect(prompted).toBe(false);

    const created = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const sessions = await api.SessionService.listSessions();
      const s = sessions.find((x) => x.name === 'Sunday Race');
      const detail = await api.SessionService.getSessionDetail(s.id);
      return { location: s.location, tags: s.tags, vehicles: detail.vehicles.length, notes: detail.notes.map((n) => n.content) };
    });
    expect(created.location).toBe('Pittsburgh');
    expect(created.tags).toEqual(['race', 'dry']);
    expect(created.vehicles).toBe(1);
    expect(created.notes).toEqual(['Cold morning']);
    await expect(page.locator('#sessionsPanelSelect')).toContainText('Sunday Race');

    // The Add to Session modal still works afterwards (mode is reset).
    await loadSampleFile(page, PITT_LAP);
    await page.locator('.file-add-to-session-btn').first().click();
    await expect(page.locator('.session-modal-dialog .session-modal-title')).toHaveText('Add to Session');
    await expect(page.locator('#addToSessionSelect')).toBeVisible();
  });
});
