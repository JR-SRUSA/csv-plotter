const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile, selectYChannels } = require('./helpers');

// Covers the follow-up requests on top of the base sessions feature: session start/end
// time (independent of note timestamps), pinning a note to a point on the graph or the
// map, the Add Note button's distinct call-to-action styling, and the Add Vehicle / Add
// Rider forms with their physics fields.

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

// Attaches the first loaded file to a brand-new session and leaves the Sessions panel
// open on it, which is the starting point most of these tests need.
async function createSessionForFirstFile(page, name) {
  await page.locator('.file-add-to-session-btn').first().click();
  await page.fill('#addToSessionNewName', name);
  await page.locator('.session-modal-save').click();
  await expect(page.locator('.session-modal-dialog')).toBeHidden();
  return openPanel(page, 'Sessions');
}

test.describe('sessions: notes with a location, CTA styling, add vehicle/rider', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('session start/end time are independent of note timestamps', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Timing Session');
    const panel = page.locator('#sessionsPanelBody');

    const inputs = panel.locator('.session-field-row input[type="datetime-local"]');
    await expect(inputs).toHaveCount(2);
    await inputs.nth(0).fill('2026-04-16T09:00');
    await inputs.nth(0).dispatchEvent('change');
    await inputs.nth(1).fill('2026-04-16T09:20');
    await inputs.nth(1).dispatchEvent('change');

    // Give the composer a note; its own timestamp must not be forced to the session's
    // start/end time -- it's stamped at creation, independently.
    await panel.locator('.session-note-input').fill('Entered well after the session times were set');
    await panel.locator('.session-note-save-btn').click();
    await expect(panel.locator('.session-note-content')).toContainText('Entered well after');

    const state = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const sessions = await api.SessionService.listSessions();
      const notes = await api.NoteService.listNotes();
      return { session: sessions[0], noteTimestamp: notes[0].timestamp };
    });

    expect(state.session.start_time).toMatch(/^2026-04-16T/);
    expect(state.session.end_time).toMatch(/^2026-04-16T/);
    // The note's own timestamp is "now" (test run time), not the session's start/end.
    expect(state.noteTimestamp).not.toBe(state.session.start_time);
    expect(state.noteTimestamp).not.toBe(state.session.end_time);
    expect(new Date(state.noteTimestamp).getFullYear()).toBeGreaterThanOrEqual(2026);
  });

  test('the note composer\'s Add Note button is visually distinct from the icon-only photo buttons', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Styling Session');
    const panel = page.locator('#sessionsPanelBody');

    const styles = await panel.evaluate((body) => {
      const save = body.querySelector('.session-note-save-btn');
      const photo = body.querySelector('.session-note-photo-btn');
      const attach = body.querySelector('.session-note-attach-btn');
      const cs = (el) => getComputedStyle(el);
      return {
        saveWeight: cs(save).fontWeight,
        saveBg: cs(save).backgroundColor,
        photoBg: cs(photo).backgroundColor,
        attachBg: cs(attach).backgroundColor,
        saveText: save.textContent.trim(),
        photoHasIconOnly: photo.querySelector('.icon-btn-glyph') != null && photo.textContent.trim() === '',
        attachHasIconOnly: attach.querySelector('.icon-btn-glyph') != null && attach.textContent.trim() === ''
      };
    });

    expect(styles.saveBg).not.toBe(styles.photoBg);
    expect(styles.saveBg).not.toBe(styles.attachBg);
    expect(styles.saveText).toBe('Add Note'); // the CTA reads as text, unlike the icon-only utility buttons
    expect(styles.photoHasIconOnly).toBe(true);
    expect(styles.attachHasIconOnly).toBe(true);
    expect(Number(styles.saveWeight)).toBeGreaterThanOrEqual(600);
  });

  test('Add Vehicle creates a vehicle with physics fields and attaches it to the session', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Vehicle Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Vehicle' }).click();
    const dialog = page.locator('.session-modal-dialog[aria-label="Add vehicle"]');
    await expect(dialog).toBeVisible();

    await dialog.locator('input[placeholder="Make (optional)"]').fill('Yamaha');
    await dialog.locator('input[placeholder="Model (optional)"]').fill('YZF-R3');
    await dialog.locator('input[placeholder="Mass, kg (optional)"]').fill('180');
    await dialog.locator('input[placeholder="CdA, m² (optional)"]').fill('0.32');
    await dialog.locator('input[placeholder="Average power, kW (optional)"]').fill('35');
    await dialog.locator('input[placeholder="Primary ratio"]').fill('2.1');
    await dialog.locator('input[placeholder="Final ratio"]').fill('2.9');
    await dialog.locator('input[placeholder="Gear ratios, comma separated"]').fill('2.5, 1.8, 1.4');
    await dialog.locator('input[placeholder="Wheel circumference, m"]').fill('1.9');
    await dialog.locator('.session-modal-save', { hasText: 'Add Vehicle' }).click();

    await expect(dialog).toBeHidden();
    await expect(panel.locator('.session-linked-label', { hasText: 'Yamaha YZF-R3' })).toBeVisible();

    const vehicle = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const vehicles = await api.VehicleService.listVehicles();
      return vehicles[0];
    });
    expect(vehicle.mass_kg).toBe(180);
    expect(vehicle.cda_m2).toBe(0.32);
    expect(vehicle.avg_power_kw).toBe(35);
    expect(vehicle.gearing).toEqual({
      primary_ratio: 2.1, final_ratio: 2.9, gear_ratios: [2.5, 1.8, 1.4], wheel_circumference_m: 1.9
    });
  });

  test('Add Vehicle accepts a power curve (kW) instead of an average, and charts it', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Power Curve Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Vehicle' }).click();
    const dialog = page.locator('.session-modal-dialog[aria-label="Add vehicle"]');
    await expect(dialog.locator('.vehicle-power-chart')).toBeHidden();
    await dialog.locator('textarea').fill('3000, 20\n9000, 80');
    await expect(dialog.locator('.vehicle-power-chart')).toBeVisible();
    await expect(dialog.locator('.vehicle-power-chart svg.main-svg').first()).toBeVisible();

    await dialog.locator('.session-modal-save', { hasText: 'Add Vehicle' }).click();
    await expect(dialog).toBeHidden();

    const vehicle = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return (await api.VehicleService.listVehicles())[0];
    });
    expect(vehicle.power_curve).toEqual([{ rpm: 3000, power_kw: 20 }, { rpm: 9000, power_kw: 80 }]);
  });

  test('Add Vehicle accepts a power curve entered as torque (Nm), converted to power_kw', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Torque Curve Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Vehicle' }).click();
    const dialog = page.locator('.session-modal-dialog[aria-label="Add vehicle"]');
    await dialog.locator('.session-modal-radio-row input[type="radio"]').nth(1).check(); // Torque (Nm)
    await dialog.locator('textarea').fill('9549.297, 100');
    await expect(dialog.locator('.vehicle-power-chart')).toBeHidden(); // only 1 point -- not a "curve" yet
    await dialog.locator('textarea').fill('9549.297, 100\n4774.65, 50');
    await expect(dialog.locator('.vehicle-power-chart')).toBeVisible();

    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    const vehicle = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return (await api.VehicleService.listVehicles())[0];
    });
    const point = vehicle.power_curve.find((p) => Math.abs(p.rpm - 9549.297) < 0.01);
    expect(point.torque_nm).toBe(100);
    expect(Math.abs(point.power_kw - 100)).toBeLessThan(0.1);
  });

  test('editing a vehicle with an existing power curve defaults the mode to how it was entered', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Reopen Curve Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Vehicle' }).click();
    let dialog = page.locator('.session-modal-dialog[aria-label="Add vehicle"]');
    await dialog.locator('.session-modal-radio-row input[type="radio"]').nth(1).check();
    await dialog.locator('textarea').fill('9549.297, 100');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    await panel.locator('.session-linked-edit').first().click();
    dialog = page.locator('.session-modal-dialog[aria-label="Edit vehicle"]');
    await expect(dialog.locator('.session-modal-radio-row input[type="radio"]').nth(1)).toBeChecked();
    await expect(dialog.locator('textarea')).toHaveValue('9549.297, 100');
  });

  test('Add Rider creates a rider with additive CdA fields and attaches it to the session', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Rider Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Rider' }).click();
    const dialog = page.locator('.session-modal-dialog[aria-label="Add rider"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.session-modal-hint')).toContainText('ADDED to the vehicle');

    await dialog.locator('input[placeholder="Name"]').fill('Jo Mercer');
    await dialog.locator('input[placeholder="Weight, kg (optional)"]').fill('68');
    await dialog.locator('input[placeholder="Tucked ΔCdA, m²"]').fill('-0.02');
    await dialog.locator('input[placeholder="Braking ΔCdA, m²"]').fill('0.05');
    await dialog.locator('.session-modal-save', { hasText: 'Add Rider' }).click();

    await expect(dialog).toBeHidden();
    await expect(panel.locator('.session-linked-label', { hasText: 'Jo Mercer' })).toBeVisible();

    const rider = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return (await api.RiderService.listRiders())[0];
    });
    expect(rider.weight_kg).toBe(68);
    expect(rider.cda_tucked_m2).toBe(-0.02);
    expect(rider.cda_braking_m2).toBe(0.05);
  });

  test('Add Rider refuses to save without a name', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Rider Validation Session');
    const panel = page.locator('#sessionsPanelBody');
    await panel.locator('.session-section-add-btn', { hasText: '+ Rider' }).click();
    const dialog = page.locator('.session-modal-dialog[aria-label="Add rider"]');
    await dialog.locator('.session-modal-save', { hasText: 'Add Rider' }).click();
    await expect(dialog.locator('.session-modal-status')).toContainText('name');
    await expect(dialog).toBeVisible();
  });

  test('Pin on Graph attaches a location to a note and shows a marker on the plot', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await createSessionForFirstFile(page, 'Graph Pin Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Graph' }).click();
    await expect(panel.locator('.sessions-pin-hint')).toBeVisible();
    await expect(page.locator('.sessions-pin-btn.is-armed')).toBeVisible();

    // Plotly's own mouse hit-testing (Fx.js) doesn't fire plotly_click/plotly_hover from
    // Playwright's synthetic pointer input in this headless setup -- true regardless of
    // this feature (a plain mouse click reproducibly never reaches Plotly's handlers
    // here, confirmed against the pre-existing hover-link code path too). Plotly graph
    // divs are documented EventEmitters (the app's own code calls Plotly.Fx.hover the
    // same way), so this drives the real handler with a point taken from the actual
    // rendered Speed trace, exercising every line of app.js's handling exactly as a
    // genuine click would -- only the browser's own hit-testing step is bypassed.
    await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const trace = pd.data.find((t) => Array.isArray(t.customdata) && t.meta && t.meta.channel === 'Speed');
      const idx = Math.floor(trace.x.length / 2);
      pd.emit('plotly_click', {
        points: [{
          x: trace.x[idx],
          y: trace.y[idx],
          customdata: trace.customdata[idx],
          data: trace,
          fullData: trace,
          curveNumber: pd.data.indexOf(trace),
          pointNumber: idx
        }]
      });
    });

    // The composer should now show a location chip and the pin button should disarm.
    await expect(page.locator('.sessions-pin-btn.is-armed')).toHaveCount(0);
    await expect(panel.locator('.session-note-location-chip')).toBeVisible();
    await expect(panel.locator('.session-note-location-text')).toContainText('📍');

    await panel.locator('.session-note-input').fill('Speed drops here');
    await panel.locator('.session-note-save-btn').click();

    const state = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const notes = await api.NoteService.listNotes();
      return notes[0].location;
    });
    expect(state.kind).toBe('plot');
    expect(state.channel).toBe('Speed');
    expect(typeof state.file_id).toBe('string');
    expect(Number.isFinite(state.x)).toBe(true);
    expect(Number.isFinite(state.value)).toBe(true);

    // The saved note itself shows the pinned location in the panel's notes list, not
    // just transiently in the composer before saving.
    await expect(panel.locator('.session-note .session-note-view-location')).toContainText('📍');

    // A marker annotation for the pinned note should now render on the plot, in the
    // theme's own accent colour rather than a colour emoji.
    const marker = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const anns = (pd.layout && pd.layout.annotations) || [];
      const found = anns.find((a) => a._noteId);
      return found ? { text: found.text, color: found.font && found.font.color } : null;
    });
    expect(marker).not.toBeNull();
    expect(marker.text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u); // no colour emoji
    expect(marker.color).toMatch(/^#[0-9a-f]{6}$/i);

    // Clicking that annotation opens the same read-only note viewer the map marker uses.
    await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const anns = pd.layout.annotations;
      const index = anns.findIndex((a) => a._noteId);
      pd.emit('plotly_clickannotation', { index, annotation: anns[index] });
    });
    await expect(page.locator('.session-note-view-dialog')).toBeVisible();
    await expect(page.locator('.session-note-view-content')).toContainText('Speed drops here');
    await page.locator('.session-note-view-close').click();
  });

  test('clicking Pin on Graph twice cancels it without opening the composer', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await createSessionForFirstFile(page, 'Cancel Pin Session');
    const panel = page.locator('#sessionsPanelBody');

    const pinBtn = panel.locator('.sessions-pin-btn', { hasText: 'Pin on Graph' });
    await pinBtn.click();
    await expect(page.locator('.sessions-pin-btn.is-armed')).toBeVisible();
    await pinBtn.click();
    await expect(page.locator('.sessions-pin-btn.is-armed')).toHaveCount(0);
    await expect(panel.locator('.session-note-location-chip')).toHaveCount(0);
  });

  test('Pin on Map attaches a lat/lon location and a marker appears on the track map', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Map Pin Session');
    const panel = page.locator('#sessionsPanelBody');

    // logdata.csv has GPS data, so the Leaflet map is already in GPS ("geo") mode.
    await expect(page.locator('#leafletMapDiv')).toBeVisible();

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Map' }).click();
    await expect(page.locator('.sessions-pin-btn.is-armed')).toBeVisible();

    // Deliberately the dead center, which is where the rendered track polyline itself
    // usually sits -- exactly where a user pinning a note to a spot ON the track would
    // click. The pick handler listens on 'preclick' rather than 'click' so this is not
    // swallowed by the interactive path layer (see attachNoteMapPickHandler).
    const mapBox = await page.locator('#leafletMapDiv').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);

    await expect(page.locator('.sessions-pin-btn.is-armed')).toHaveCount(0);
    await expect(panel.locator('.session-note-location-chip')).toBeVisible();
    await expect(panel.locator('.session-note-location-text')).toContainText('Map location');

    await panel.locator('.session-note-input').fill('Bump here');
    await panel.locator('.session-note-save-btn').click();

    await expect(page.locator('.note-map-marker-icon')).toBeVisible();

    const location = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const notes = await api.NoteService.listNotes();
      return notes[0].location;
    });
    expect(location.kind).toBe('map');
    expect(Number.isFinite(location.lat)).toBe(true);
    expect(Number.isFinite(location.lon)).toBe(true);

    // The marker is a monochrome SVG glyph (styled via CSS to the app's own accent
    // colour), not a colour emoji.
    await expect(page.locator('.note-map-marker-icon svg')).toHaveCount(1);

    // Clicking the marker opens the read-only note viewer.
    await page.locator('.note-map-marker-icon').click();
    await expect(page.locator('.session-note-view-dialog')).toBeVisible();
    await expect(page.locator('.session-note-view-content')).toContainText('Bump here');
    await page.locator('.session-note-view-close').click();
    await expect(page.locator('.session-note-view-dialog')).toHaveCount(0);
  });

  test('the note type defaults to Pre/During/Post based on the session\'s own start/end time', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Timing Default Session');
    const panel = page.locator('#sessionsPanelBody');
    const typeSelect = panel.locator('.session-note-type-select');

    // No start/end time set at all: falls back to the previous fixed default.
    await expect(typeSelect).toHaveValue('during');

    const startInput = panel.locator('.session-field-row input[type="datetime-local"]').nth(0);
    const endInput = panel.locator('.session-field-row input[type="datetime-local"]').nth(1);

    // A session entirely in the future -> Pre.
    const future = new Date(Date.now() + 24 * 3600 * 1000);
    const past = new Date(Date.now() - 24 * 3600 * 1000);
    const toLocalInput = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    await startInput.fill(toLocalInput(future));
    await startInput.dispatchEvent('change');
    await expect(typeSelect).toHaveValue('pre');

    // A session entirely in the past -> Post.
    await startInput.fill(toLocalInput(new Date(past.getTime() - 3600 * 1000)));
    await startInput.dispatchEvent('change');
    await endInput.fill(toLocalInput(past));
    await endInput.dispatchEvent('change');
    await expect(typeSelect).toHaveValue('post');

    // Now falls inside [start, end] -> During.
    await startInput.fill(toLocalInput(past));
    await startInput.dispatchEvent('change');
    await endInput.fill(toLocalInput(future));
    await endInput.dispatchEvent('change');
    await expect(typeSelect).toHaveValue('during');
  });
});
