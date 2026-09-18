const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

// Covers the map's zoom buttons being replaced with a full-screen toggle (zoom is
// already reachable via mouse wheel / two-finger pinch), and the full-screen FAB that
// lets a note be pinned and written without ever leaving full-screen.

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

test.describe('sessions: map full-screen toggle and the full-screen add-note FAB', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('the zoom in/out buttons are gone, replaced by a full-screen toggle', async ({ page }) => {
    await loadSampleFile(page);
    await expect(page.locator('#leafletMapDiv')).toBeVisible();

    await expect(page.locator('.leaflet-control-zoom')).toHaveCount(0);
    await expect(page.locator('.leaflet-map-fullscreen-btn')).toBeVisible();
  });

  test('the full-screen toggle button requests real browser full-screen on the map, and exiting returns it to normal', async ({ page }) => {
    await loadSampleFile(page);
    const mapDiv = page.locator('#leafletMapDiv');
    await expect(mapDiv).toBeVisible();
    await expect(mapDiv).not.toHaveClass(/map-fullscreen-active/);

    await page.locator('.leaflet-map-fullscreen-btn').click();
    await expect(mapDiv).toHaveClass(/map-fullscreen-active/);
    // Confirms this used the real Fullscreen API (document.fullscreenElement), not just
    // the CSS-only fallback -- the map itself is the element the browser considers
    // full-screen.
    await expect.poll(() => page.evaluate(() => document.fullscreenElement && document.fullscreenElement.id)).toBe('leafletMapDiv');

    // A real Escape keypress resolves to the browser's own native full-screen exit
    // handling (document.exitFullscreen()), which Playwright's synthetic Escape key
    // event doesn't reach directly in this environment -- exiting this way exercises the
    // exact same fullscreenchange codepath the app reacts to either way.
    await page.evaluate(() => document.exitFullscreen());
    await expect(mapDiv).not.toHaveClass(/map-fullscreen-active/);
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  });

  test('falls back to the CSS-only maximize when the real Fullscreen API is unavailable', async ({ page }) => {
    await loadSampleFile(page);
    // Simulates a context that refuses full-screen (e.g. an embedding iframe without
    // allow="fullscreen") by making the request always reject, before the app's own
    // click handler ever runs.
    await page.evaluate(() => {
      Element.prototype.requestFullscreen = () => Promise.reject(new Error('denied'));
    });

    const mapDiv = page.locator('#leafletMapDiv');
    await page.locator('.leaflet-map-fullscreen-btn').click();
    await expect(mapDiv).toHaveClass(/map-fullscreen-active/);
    await expect(mapDiv).not.toHaveClass(/map-fullscreen-native/);
    // The manual scroll-lock is only needed for this fallback path.
    await expect(page.locator('body')).toHaveClass(/map-fullscreen-open/);

    // Real full-screen exit doesn't apply here, so the app's own Escape handling (rather
    // than the browser's native one) is what has to close it back out.
    await page.keyboard.press('Escape');
    await expect(mapDiv).not.toHaveClass(/map-fullscreen-active/);
    await expect(page.locator('body')).not.toHaveClass(/map-fullscreen-open/);
  });

  test('clicking the full-screen toggle a second time also exits full-screen', async ({ page }) => {
    await loadSampleFile(page);
    const mapDiv = page.locator('#leafletMapDiv');
    const btn = page.locator('.leaflet-map-fullscreen-btn');

    await btn.click();
    await expect(mapDiv).toHaveClass(/map-fullscreen-active/);
    await btn.click();
    await expect(mapDiv).not.toHaveClass(/map-fullscreen-active/);
  });

  test('the add-note FAB only appears while the map is full-screen', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'FAB Visibility Session');

    // The FAB element isn't created at all until full-screen is entered for the first time.
    const fab = page.locator('.map-fullscreen-fab');
    await expect(fab).toHaveCount(0);

    await page.locator('.leaflet-map-fullscreen-btn').click();
    await expect(fab).toHaveClass(/is-visible/);

    // See the full-screen toggle test above for why this uses exitFullscreen() directly
    // rather than a simulated Escape keypress.
    await page.evaluate(() => document.exitFullscreen());
    await expect(fab).not.toHaveClass(/is-visible/);
  });

  test('the FAB arms map picking, and clicking a location opens a floating note card (not the panel composer)', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'FAB Note Session');

    await page.locator('.leaflet-map-fullscreen-btn').click();
    const fab = page.locator('.map-fullscreen-fab');
    await expect(fab).toHaveClass(/is-visible/);

    await fab.click();
    await expect(fab).toHaveClass(/is-armed/);

    const mapBox = await page.locator('#leafletMapDiv').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);

    await expect(fab).not.toHaveClass(/is-armed/);
    const card = page.locator('.map-fullscreen-note-card');
    await expect(card).toBeVisible();
    // Still full-screen -- the point of the FAB flow is never having to leave it.
    await expect(page.locator('#leafletMapDiv')).toHaveClass(/map-fullscreen-active/);
    // The panel's own composer location chip should NOT have been populated by this.
    await expect(page.locator('.session-note-location-chip')).toHaveCount(0);

    await card.locator('.map-fullscreen-note-input').fill('Pinned while full-screen');
    await card.locator('.map-fullscreen-note-save').click();

    await expect(card).toHaveCount(0);
    await expect(page.locator('.note-map-marker-icon')).toBeVisible();

    const notes = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return api.NoteService.listNotes();
    });
    expect(notes.length).toBe(1);
    expect(notes[0].content).toBe('Pinned while full-screen');
    expect(notes[0].location.kind).toBe('map');
  });

  test('the full-screen note card has Take Photo / Attach Photo, and an attached photo is saved with the note', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'FAB Photo Session');

    await page.locator('.leaflet-map-fullscreen-btn').click();
    await page.locator('.map-fullscreen-fab').click();
    const mapBox = await page.locator('#leafletMapDiv').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);

    const card = page.locator('.map-fullscreen-note-card');
    await expect(card).toBeVisible();

    const takePhoto = card.locator('.session-note-photo-btn');
    const attachPhoto = card.locator('.session-note-attach-btn');
    await expect(takePhoto).toBeVisible();
    await expect(attachPhoto).toBeVisible();

    await card.locator('input[type="file"]').setInputFiles({
      name: 'fullscreen-photo.png', mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
    });
    await expect(card.locator('.session-note-media-status')).toHaveText('1 photo attached');
    const pendingThumb = card.locator('.session-note-media-thumb');
    await expect(pendingThumb).toHaveCount(1);
    await expect.poll(() => pendingThumb.evaluate((img) => img.src.startsWith('blob:'))).toBe(true);

    await card.locator('.map-fullscreen-note-input').fill('Full-screen note with a photo');
    await card.locator('.map-fullscreen-note-save').click();
    await expect(card).toHaveCount(0);

    const notes = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return api.NoteService.listNotes();
    });
    expect(notes.length).toBe(1);
    expect(notes[0].media.length).toBe(1);
    expect(notes[0].media[0].type).toBe('photo');
  });

  test('Take Photo\'s camera preview is visible while the map is genuinely browser-fullscreen (hosted inside the fullscreened element, not document.body)', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'FAB Camera Fullscreen Session');

    await page.locator('.leaflet-map-fullscreen-btn').click();
    // Confirms this is the real Fullscreen API, not the CSS-only fallback -- only then
    // does "content outside the fullscreened element isn't painted" actually apply, and
    // only then does the capture overlay's host element matter.
    await expect.poll(() => page.evaluate(() => document.fullscreenElement && document.fullscreenElement.id)).toBe('leafletMapDiv');

    await page.locator('.map-fullscreen-fab').click();
    const mapBox = await page.locator('#leafletMapDiv').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
    const card = page.locator('.map-fullscreen-note-card');
    await expect(card).toBeVisible();

    await card.locator('.session-note-photo-btn').click();
    const overlay = page.locator('.session-capture-overlay');
    await expect(overlay).toBeVisible();
    // The actual regression: appended to document.body directly, this overlay would sit
    // outside the fullscreened element's subtree and never be painted at all while
    // fullscreen stays active (not merely behind it in z-order).
    await expect.poll(() => overlay.evaluate((el) => !!el.closest('#leafletMapDiv'))).toBe(true);

    await overlay.locator('.session-capture-btn').click();
    await expect(overlay).toHaveCount(0);
    await expect(card.locator('.session-note-media-status')).toHaveText('1 photo attached');
  });

  test('canceling the floating note card discards it without creating a note', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'FAB Cancel Session');

    await page.locator('.leaflet-map-fullscreen-btn').click();
    await page.locator('.map-fullscreen-fab').click();

    const mapBox = await page.locator('#leafletMapDiv').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);

    const card = page.locator('.map-fullscreen-note-card');
    await expect(card).toBeVisible();
    await card.locator('.map-fullscreen-note-input').fill('Should not be saved');
    await card.locator('.map-fullscreen-note-cancel').click();
    await expect(card).toHaveCount(0);

    const notes = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return api.NoteService.listNotes();
    });
    expect(notes.length).toBe(0);
  });

  test('clicking the FAB again while armed cancels the pick', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'FAB Rearm Session');

    await page.locator('.leaflet-map-fullscreen-btn').click();
    const fab = page.locator('.map-fullscreen-fab');
    await fab.click();
    await expect(fab).toHaveClass(/is-armed/);
    await fab.click();
    await expect(fab).not.toHaveClass(/is-armed/);
  });
});
