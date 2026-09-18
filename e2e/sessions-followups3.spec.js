const { test, expect } = require('@playwright/test');
const { loadSampleFile, selectYChannels } = require('./helpers');

// Covers a third round of follow-ups: a graph-pinned note's marker reliably reappearing
// after a page reload (not just relying on the one-time startup cache refresh), the map
// note tooltip sizing relative to the map's own width instead of a fixed pixel cap, and
// the Take/Attach Photo buttons being icon-only.

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

async function pinGraphNoteAtMidpoint(page) {
  // Arming reads the session list first (an async IndexedDB call) before notePickMode
  // actually flips in app.js -- waiting for .is-armed avoids firing the simulated click
  // while it's still being treated as a normal hover-link tap instead of a location pick.
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
}

const hasNoteMarker = (page) => page.evaluate(() => (
  (document.getElementById('plotDiv').layout.annotations || []).some((a) => a._noteId)
));

test.describe('sessions: graph note survives reload, map tooltip sizing, icon-only photo buttons', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('a graph-pinned note\'s marker reappears after a page reload and reloading the file', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await createSessionForFirstFile(page, 'Reload Marker Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Graph' }).click();
    await pinGraphNoteAtMidpoint(page);
    await panel.locator('.session-note-input').fill('Should survive a reload');
    await panel.locator('.session-note-save-btn').click();
    await expect.poll(() => hasNoteMarker(page), { timeout: 10000 }).toBe(true);

    await page.reload();
    await page.waitForFunction(() => !!window.SessionsServices);

    await openPanel(page, 'User');
    await page.click('#loadAllStoredFilesBtn');

    // The marker must come back without needing any further nudge (no manual re-select
    // of the Y channel, no re-opening the Sessions panel) -- addProcessedLog's own
    // refreshNoteMarkerCaches call is what's responsible for this now.
    await expect.poll(() => hasNoteMarker(page), { timeout: 10000 }).toBe(true);
  });

  test('a graph-pinned note\'s marker reappears when its file is loaded via Pick Uploaded Data', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await createSessionForFirstFile(page, 'Pick Reload Marker Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Graph' }).click();
    await pinGraphNoteAtMidpoint(page);
    await panel.locator('.session-note-input').fill('Loaded back via Pick Uploaded Data');
    await panel.locator('.session-note-save-btn').click();
    await expect.poll(() => hasNoteMarker(page), { timeout: 10000 }).toBe(true);

    await page.reload();
    await page.waitForFunction(() => !!window.SessionsServices);

    await page.click('#pickUploadedDataBtn');
    await page.click('.pick-uploaded-tab[data-pick-tab="files"]');
    await page.locator('.pick-uploaded-item-load-btn').first().click();

    await expect.poll(() => hasNoteMarker(page), { timeout: 10000 }).toBe(true);
  });

  test('the map note tooltip sizes to a fraction of the map\'s own width, not a fixed pixel cap', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Tooltip Width Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Map' }).click();
    const mapBox = await page.locator('#leafletMapDiv').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
    await expect(panel.locator('.session-note-location-chip')).toBeVisible();
    await panel.locator('.session-note-input').fill('A note long enough that it would previously have wrapped into several narrow, tall lines inside a fixed 220px tooltip box');
    await panel.locator('.session-note-save-btn').click();
    await expect(page.locator('.note-map-marker-icon')).toBeVisible();

    await page.hover('.note-map-marker-icon');
    const tooltip = page.locator('.leaflet-tooltip.note-map-tooltip');
    await expect(tooltip).toBeVisible();

    const widths = await page.evaluate(() => {
      const mapWidth = document.getElementById('leafletMapDiv').clientWidth;
      const tooltipEl = document.querySelector('.leaflet-tooltip.note-map-tooltip');
      return { mapWidth, tooltipMaxWidth: parseFloat(tooltipEl.style.maxWidth) };
    });
    expect(widths.tooltipMaxWidth).toBeGreaterThan(0);
    // ~75% of the map's width, clamped to [160, 420] -- exercised here with a map wide
    // enough that the ratio itself (not a clamp bound) is what's being checked.
    const expected = Math.round(widths.mapWidth * 0.75);
    expect(Math.abs(widths.tooltipMaxWidth - Math.max(160, Math.min(420, expected)))).toBeLessThanOrEqual(1);
  });

  test('Take Photo and Attach Photo are icon-only buttons', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Icon Buttons Session');
    const panel = page.locator('#sessionsPanelBody');

    const takePhoto = panel.locator('.session-note-photo-btn');
    const attachPhoto = panel.locator('.session-note-attach-btn');
    await expect(takePhoto).toBeVisible();
    await expect(attachPhoto).toBeVisible();

    expect((await takePhoto.textContent()).trim()).toBe('');
    expect((await attachPhoto.textContent()).trim()).toBe('');
    await expect(takePhoto.locator('svg')).toHaveCount(1);
    await expect(attachPhoto.locator('svg')).toHaveCount(1);

    // Accessible name still communicates purpose despite no visible text.
    await expect(takePhoto).toHaveAttribute('aria-label', 'Take Photo');
    await expect(attachPhoto).toHaveAttribute('aria-label', 'Attach Photo');
  });
});
