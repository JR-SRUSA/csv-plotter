const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile, selectYChannels, getPlotGeometry } = require('./helpers');

// Covers: Event as a Session's parent (grouping/sorting), the Add Note icon matching the
// map/graph note markers, editing an existing note/rider/vehicle, per-session vehicle
// mass and rider weight overrides, and a graph-pinned note keeping its position when the
// x-axis switches between Time and Distance.

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

async function createSessionForFirstFile(page, name) {
  await page.locator('.file-add-to-session-btn').first().click();
  await page.fill('#addToSessionNewName', name);
  await page.locator('.session-modal-save').click();
  await expect(page.locator('.session-modal-dialog')).toBeHidden();
  return openPanel(page, 'Sessions');
}

// Accepts the browser's window.prompt with the given value, exactly once.
function acceptNextPrompt(page, value) {
  page.once('dialog', (dialog) => dialog.accept(value));
}

test.describe('sessions: events, editing, variable mass/weight, multi-axis pins', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('the sessions IndexedDB upgrades from v1 to v2 (adding the events store) without disturbing existing data', async ({ page }) => {
    // Seed a v1-shaped database (no `events` store) the way an existing installation
    // would have it.
    await page.goto('/sample_data_files/');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('motorsports_app_v1');
        req.onsuccess = req.onerror = req.onblocked = () => resolve();
      });
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('motorsports_app_v1', 1);
        req.onupgradeneeded = () => {
          const idb = req.result;
          ['users', 'riders', 'vehicles', 'setups', 'sessions', 'notes', 'mediaIndex', 'appMetadata']
            .forEach((store) => idb.createObjectStore(store, { keyPath: 'id' }));
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      await new Promise((resolve, reject) => {
        const tx = db.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').put({
          id: 'session_legacy', name: 'Legacy P1', vehicle_ids: [], rider_ids: [], file_ids: [], note_ids: [],
          created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
        });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    });

    await page.goto('/index.html');
    await page.waitForFunction(() => !!window.SessionsServices);
    const result = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      await api.initDB();
      const session = await api.SessionService.getSession('session_legacy');
      const event = await api.EventService.createEvent({ name: 'New Event After Upgrade' });
      return { keptLegacySession: !!session, legacyName: session && session.name, createdEvent: event.id };
    });
    expect(result.keptLegacySession).toBe(true);
    expect(result.legacyName).toBe('Legacy P1');
    expect(typeof result.createdEvent).toBe('string');

    const dbVersion = await page.evaluate(() => new Promise((resolve) => {
      const req = indexedDB.open('motorsports_app_v1');
      req.onsuccess = () => { resolve(req.result.version); req.result.close(); };
    }));
    expect(dbVersion).toBe(2);
  });

  test('a session can be assigned to an event, and the session picker groups by event', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'P1');
    const panel = page.locator('#sessionsPanelBody');

    const eventSelect = panel.locator('select[aria-label="Event"]');
    await expect(eventSelect).toBeVisible();
    await eventSelect.selectOption('__new_event__');
    acceptNextPrompt(page, 'MotoAmerica VIR 2026');
    await eventSelect.selectOption('__new_event__');

    await expect(panel.locator('.sessions-select optgroup[label="MotoAmerica VIR 2026"]')).toHaveCount(1);
    await expect(eventSelect.locator('option:checked')).toHaveText('MotoAmerica VIR 2026');

    // A second, event-less session groups separately under "No Event". A session
    // already exists now, so the Add to Session modal defaults to it -- explicitly pick
    // "New session..." to get the new-session fields instead of typing into a hidden input.
    await page.setInputFiles('#fileInput', path.join(__dirname, '..', 'sample_data_files', 'logdata_jr.csv'));
    await expect(page.locator('.file-item')).toHaveCount(2);
    await page.locator('.file-add-to-session-btn').nth(1).click();
    await page.locator('#addToSessionSelect').selectOption('__new__');
    await page.fill('#addToSessionNewName', 'Standalone Q1');
    await page.locator('.session-modal-save').click();
    await expect(page.locator('.session-modal-dialog')).toBeHidden();

    await expect(panel.locator('.sessions-select optgroup[label="No Event"]')).toHaveCount(1);
    const groupLabels = await panel.locator('.sessions-select optgroup').evaluateAll((els) => els.map((e) => e.label));
    expect(groupLabels).toEqual(['MotoAmerica VIR 2026', 'No Event']);
  });

  test('clearing a session\'s event moves it back under "No Event"', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'P1');
    const panel = page.locator('#sessionsPanelBody');
    const eventSelect = panel.locator('select[aria-label="Event"]');

    await eventSelect.selectOption('__new_event__');
    acceptNextPrompt(page, 'Round 1');
    await eventSelect.selectOption('__new_event__');
    await expect(eventSelect.locator('option:checked')).toHaveText('Round 1');

    await eventSelect.selectOption('');
    await expect(panel.locator('.sessions-select optgroup[label="No Event"]')).toHaveCount(1);
  });

  test('the Add Note button uses the same SVG icon as the map/graph markers, not an emoji', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Icon Session');
    const panel = page.locator('#sessionsPanelBody');
    await expect(panel.locator('.session-note-save-btn svg')).toHaveCount(1);
    const buttonText = await panel.locator('.session-note-save-btn').innerText();
    expect(buttonText).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    expect(buttonText.trim()).toBe('Add Note');
  });

  test('an existing note can be edited in place', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Edit Note Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-note-input').fill('Original text');
    await panel.locator('.session-note-save-btn').click();
    await expect(panel.locator('.session-note-content')).toContainText('Original text');

    await panel.locator('.session-note-edit').click();
    const editForm = panel.locator('.session-note-editing');
    await expect(editForm).toBeVisible();
    await editForm.locator('.session-note-input').fill('Corrected text');
    await editForm.locator('.session-note-type-select').selectOption('post');
    await editForm.locator('.session-note-save-btn').click();

    await expect(panel.locator('.session-note-content')).toContainText('Corrected text');
    await expect(panel.locator('.session-note-content')).not.toContainText('Original text');
    await expect(panel.locator('.session-note-type')).toHaveText('post');
  });

  test('editing a note can be cancelled without saving changes', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Cancel Edit Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-note-input').fill('Keep me');
    await panel.locator('.session-note-save-btn').click();
    await panel.locator('.session-note-edit').click();
    await panel.locator('.session-note-editing .session-note-input').fill('Should not save');
    await panel.locator('.session-note-cancel-btn').click();

    await expect(panel.locator('.session-note-content')).toContainText('Keep me');
    await expect(panel.locator('.session-note-editing')).toHaveCount(0);
  });

  test('an existing vehicle can be edited via the linked-section pencil button', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Vehicle Edit Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Vehicle' }).click();
    let dialog = page.locator('.session-modal-dialog[aria-label="Add vehicle"]');
    await dialog.locator('input[placeholder="Make (optional)"]').fill('Yamaha');
    await dialog.locator('input[placeholder="Model (optional)"]').fill('R6');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    await panel.locator('.session-linked-edit').first().click();
    dialog = page.locator('.session-modal-dialog[aria-label="Edit vehicle"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('input[placeholder="Model (optional)"]')).toHaveValue('R6');
    await dialog.locator('input[placeholder="Model (optional)"]').fill('R7');
    await dialog.locator('.session-modal-save', { hasText: 'Save Changes' }).click();
    await expect(dialog).toBeHidden();

    await expect(panel.locator('.session-linked-label', { hasText: 'Yamaha R7' })).toBeVisible();
    const vehicles = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return api.VehicleService.listVehicles();
    });
    expect(vehicles.length).toBe(1);
    expect(vehicles[0].model).toBe('R7');
  });

  test('an existing rider can be edited via the linked-section pencil button', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Rider Edit Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Rider' }).click();
    let dialog = page.locator('.session-modal-dialog[aria-label="Add rider"]');
    await dialog.locator('input[placeholder="Name"]').fill('Jo Mercer');
    await dialog.locator('input[placeholder="Weight, kg (optional)"]').fill('68');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    await panel.locator('.session-linked-edit').first().click();
    dialog = page.locator('.session-modal-dialog[aria-label="Edit rider"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('input[placeholder="Weight, kg (optional)"]')).toHaveValue('68');
    await dialog.locator('input[placeholder="Weight, kg (optional)"]').fill('70');
    await dialog.locator('.session-modal-save', { hasText: 'Save Changes' }).click();
    await expect(dialog).toBeHidden();

    const riders = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return api.RiderService.listRiders();
    });
    expect(riders[0].weight_kg).toBe(70);
  });

  test('a vehicle\'s mass can be overridden for one session without changing its baseline', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Mass Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Vehicle' }).click();
    const dialog = page.locator('.session-modal-dialog[aria-label="Add vehicle"]');
    await dialog.locator('input[placeholder="Mass, kg (optional)"]').fill('180');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    const massInput = panel.locator('.session-linked-override-input').first();
    await expect(massInput).toHaveValue('180');
    await massInput.fill('172');
    await massInput.dispatchEvent('change');
    await massInput.blur();
    await expect(panel.locator('.session-linked-override-input').first()).toHaveValue('172');

    const state = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const vehicle = (await api.VehicleService.listVehicles())[0];
      const session = (await api.SessionService.listSessions())[0];
      return {
        baseline: vehicle.mass_kg,
        effective: await api.SetupService.getEffectiveMass(vehicle.id, session.id)
      };
    });
    expect(state.baseline).toBe(180, 'the vehicle\'s own baseline is untouched');
    expect(state.effective.mass_kg).toBe(172);
    expect(state.effective.source).toBe('setup');
  });

  test('a rider\'s weight can be overridden for one session without changing their baseline', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Weight Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-section-add-btn', { hasText: '+ Rider' }).click();
    const dialog = page.locator('.session-modal-dialog[aria-label="Add rider"]');
    await dialog.locator('input[placeholder="Name"]').fill('Jo');
    await dialog.locator('input[placeholder="Weight, kg (optional)"]').fill('68');
    await dialog.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    const weightInput = panel.locator('.session-linked-override-input').first();
    await expect(weightInput).toHaveValue('68');
    await weightInput.fill('71');
    await weightInput.dispatchEvent('change');
    await weightInput.blur();

    const state = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const rider = (await api.RiderService.listRiders())[0];
      const session = (await api.SessionService.listSessions())[0];
      return { baseline: rider.weight_kg, effective: await api.SessionService.getEffectiveRiderWeight(session.id, rider.id) };
    });
    expect(state.baseline).toBe(68);
    expect(state.effective.weight_kg).toBe(71);
    expect(state.effective.source).toBe('override');
  });

  test('a note pinned on Distance keeps its marker position after switching the x-axis to Time', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await createSessionForFirstFile(page, 'Multi-Axis Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Graph' }).click();
    // Arming reads the session list first (an async IndexedDB call) before notePickMode
    // actually flips in app.js -- waiting for .is-armed (only applied once that resolves
    // and the panel re-renders) avoids firing the simulated click while the click is
    // still being treated as a normal hover-link tap instead of a location pick.
    await expect(page.locator('.sessions-pin-btn.is-armed')).toBeVisible();
    await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const trace = pd.data.find((t) => Array.isArray(t.customdata) && t.meta && t.meta.channel === 'Speed');
      const idx = Math.floor(trace.x.length / 2);
      pd.emit('plotly_click', {
        points: [{
          x: trace.x[idx], y: trace.y[idx], customdata: trace.customdata[idx],
          data: trace, fullData: trace, curveNumber: pd.data.indexOf(trace), pointNumber: idx
        }]
      });
    });
    await expect(panel.locator('.session-note-location-chip')).toBeVisible();
    // Both axes should be named in the chip -- captured together regardless of which was active.
    const chipText = await panel.locator('.session-note-location-text').innerText();
    expect(chipText).toMatch(/Time/);
    expect(chipText).toMatch(/Distance/);

    await panel.locator('.session-note-input').fill('Multi-axis pin');
    await panel.locator('.session-note-save-btn').click();

    // Saving triggers an async refresh (NoteService.listNotes -> resolve file_id ->
    // updatePlot) before the marker actually lands in plotDiv.layout.annotations.
    const hasNoteMarker = () => page.evaluate(() => (
      (document.getElementById('plotDiv').layout.annotations || []).some((a) => a._noteId)
    ));
    await expect.poll(hasNoteMarker, { timeout: 10000 }).toBe(true);

    // Switch the main plot to the Time x-axis -- the marker must still be there.
    await page.locator('input[name="xaxis"][value="time"]').check();
    await expect.poll(hasNoteMarker, { timeout: 10000 }).toBe(true);
  });
});
