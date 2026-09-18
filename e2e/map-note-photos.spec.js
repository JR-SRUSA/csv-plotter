const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

// Covers being able to attach a photo to a note directly from its map-marker popup
// (viewNote), not just from the Sessions panel's own note composer -- the popup
// previously only supported Delete.

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

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64'
);

test.describe('sessions: attaching a photo from a note\'s map-marker popup', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('Take Photo and Attach Photo appear in the map-marker note popup, and attaching persists', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Map Note Photo Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Map' }).click();
    await expect(page.locator('.sessions-pin-btn.is-armed')).toBeVisible();
    const mapBox = await page.locator('#leafletMapDiv').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
    await expect(panel.locator('.session-note-location-chip')).toBeVisible();
    await panel.locator('.session-note-input').fill('Note with a photo added later');
    await panel.locator('.session-note-save-btn').click();
    await expect(page.locator('.note-map-marker-icon')).toBeVisible();

    await page.locator('.note-map-marker-icon').click();
    const dialog = page.locator('.session-note-view-dialog');
    await expect(dialog).toBeVisible();

    const takePhoto = dialog.locator('.session-note-photo-btn');
    const attachPhoto = dialog.locator('.session-note-attach-btn');
    await expect(takePhoto).toBeVisible();
    await expect(attachPhoto).toBeVisible();
    await expect(takePhoto.locator('svg')).toHaveCount(1);
    await expect(attachPhoto.locator('svg')).toHaveCount(1);

    await dialog.locator('input[type="file"]').setInputFiles({
      name: 'test-photo.png', mimeType: 'image/png', buffer: TINY_PNG
    });
    await expect(dialog.locator('.session-note-media-status')).toHaveText('1 photo attached');
    // A real thumbnail, not just the count -- resolved src means MediaService actually
    // produced a usable object URL for it.
    const thumb = dialog.locator('.session-note-media-thumb');
    await expect(thumb).toHaveCount(1);
    await expect.poll(() => thumb.evaluate((img) => img.src.startsWith('blob:'))).toBe(true);

    await dialog.locator('.session-note-view-close').click();
    await expect(dialog).toHaveCount(0);

    // Persisted: reopening the same marker's popup still shows the attachment.
    await page.locator('.note-map-marker-icon').click();
    await expect(page.locator('.session-note-view-dialog .session-note-media-status')).toHaveText('1 photo attached');
    await expect(page.locator('.session-note-view-dialog .session-note-media-thumb')).toHaveCount(1);
    await page.locator('.session-note-view-dialog .session-note-view-close').click();

    // The Sessions panel's own notes list shows the same thumbnail, not just a count.
    await expect(panel.locator('.session-note-media-thumb')).toHaveCount(1);

    const notes = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      return api.NoteService.listNotes();
    });
    expect(notes.length).toBe(1);
    expect(notes[0].media.length).toBe(1);
    expect(notes[0].media[0].type).toBe('photo');
  });

  test('the note composer shows a thumbnail immediately after attaching a photo, before Save', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Composer Photo Preview Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.session-note-attach-btn').click();
    await panel.locator('input[type="file"]').setInputFiles({
      name: 'preview.png', mimeType: 'image/png', buffer: TINY_PNG
    });
    await expect(panel.locator('.session-note-media-status')).toHaveText('1 photo attached');
    const pendingThumb = panel.locator('.session-note-composer .session-note-media-thumb');
    await expect(pendingThumb).toHaveCount(1);
    await expect.poll(() => pendingThumb.evaluate((img) => img.src.startsWith('blob:'))).toBe(true);

    await panel.locator('.session-note-input').fill('Note saved with a pre-attached photo');
    await panel.locator('.session-note-save-btn').click();
    await expect(panel.locator('.session-note-media-thumb')).toHaveCount(1);
  });
});
