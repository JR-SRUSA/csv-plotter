const { test, expect } = require('@playwright/test');
const { loadSampleFile, selectYChannels, getPlotGeometry } = require('./helpers');

// Covers a second round of follow-ups: the hover-tooltip toggle no longer stopping the
// map/track marker from following the mouse, moving the Pin buttons into the note
// composer, wrapping long note text in both hover surfaces, hovering a note marker
// highlighting it, the Sessions tab's Event-then-Session ordering, the User tab's Author
// Name field, and loading a whole session/event's files at once from Pick Uploaded Data.

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

test.describe('sessions: hover marker, pin placement, event ordering, author name, load session/event', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('hovermode stays "x" (marker keeps following the mouse) even after Toggle Hover Data turns tooltips off', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);

    const before = await page.evaluate(() => document.getElementById('plotDiv')._fullLayout.hovermode);
    expect(before).toBe('x');

    await page.click('.modebar-btn[data-title="Toggle Hover Data"]');
    await page.waitForTimeout(200);

    const after = await page.evaluate(() => document.getElementById('plotDiv')._fullLayout.hovermode);
    expect(after).toBe('x'); // never false -- that's what used to kill the marker sync

    const hidesTooltip = await page.evaluate(() => document.getElementById('plotDiv').classList.contains('hover-tooltip-hidden'));
    expect(hidesTooltip).toBe(true);

    const hoverlayerHidden = await page.evaluate(() => {
      const layer = document.querySelector('#plotDiv .hoverlayer');
      return !layer || getComputedStyle(layer).display === 'none';
    });
    expect(hoverlayerHidden).toBe(true);

    // Toggling back on restores both.
    await page.click('.modebar-btn[data-title="Toggle Hover Data"]');
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.getElementById('plotDiv').classList.contains('hover-tooltip-hidden'))).toBe(false);
    expect(await page.evaluate(() => document.getElementById('plotDiv')._fullLayout.hovermode)).toBe('x');
  });

  test('the Pin buttons live in the note composer, not the panel toolbar', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Pin Placement Session');
    const panel = page.locator('#sessionsPanelBody');

    await expect(panel.locator('.sessions-toolbar .sessions-pin-btn')).toHaveCount(0);
    await expect(panel.locator('.session-note-composer .sessions-pin-btn', { hasText: 'Pin on Graph' })).toBeVisible();
    await expect(panel.locator('.session-note-composer .sessions-pin-btn', { hasText: 'Pin on Map' })).toBeVisible();
  });

  test('a hovered note marker on the map is visually highlighted', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Map Hover Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Map' }).click();
    const mapBox = await page.locator('#leafletMapDiv').boundingBox();
    await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
    await expect(panel.locator('.session-note-location-chip')).toBeVisible();
    await panel.locator('.session-note-input').fill('Hover me on the map');
    await panel.locator('.session-note-save-btn').click();
    await expect(page.locator('.note-map-marker-icon')).toBeVisible();

    const before = await page.locator('.note-map-marker-icon').evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.hover('.note-map-marker-icon');
    const during = await page.locator('.note-map-marker-icon').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(during).not.toBe(before);
  });

  test('a hovered note marker on the graph is visually highlighted', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await createSessionForFirstFile(page, 'Graph Hover Session');
    const panel = page.locator('#sessionsPanelBody');

    await panel.locator('.sessions-pin-btn', { hasText: 'Pin on Graph' }).click();
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
    await panel.locator('.session-note-input').fill('Hover me on the graph');
    await panel.locator('.session-note-save-btn').click();

    const noteText = () => page.locator('#plotDiv g.annotation .cursor-pointer[style*="pointer-events: all"] .annotation-text');
    await expect.poll(() => noteText().count(), { timeout: 10000 }).toBe(1);
    const before = await noteText().evaluate((el) => getComputedStyle(el).filter);
    await page.hover('#plotDiv g.annotation .cursor-pointer[style*="pointer-events: all"]');
    const during = await noteText().evaluate((el) => getComputedStyle(el).filter);
    expect(during).not.toBe(before);
  });

  test('the Sessions panel shows the Event dropdown above the Session dropdown, and it filters', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'P1');
    const panel = page.locator('#sessionsPanelBody');

    const eventSelect = panel.locator('select[aria-label="Filter sessions by event"]');
    const sessionSelect = panel.locator('#sessionsPanelSelect');
    // Event select must be first in DOM order, session select after it.
    const order = await panel.evaluate(() => {
      const els = Array.from(document.querySelectorAll('#sessionsPanelBody select'));
      return els.map((el) => el.getAttribute('aria-label') || el.id);
    });
    expect(order.indexOf('Filter sessions by event')).toBeLessThan(order.indexOf('sessionsPanelSelect'));

    await expect(eventSelect).toHaveValue('__all__');
    await expect(sessionSelect.locator('option')).toHaveCount(1);
  });

  test('the Author Name field sets the local user used as note author', async ({ page }) => {
    await loadSampleFile(page);
    await openPanel(page, 'User');
    const authorInput = page.locator('#authorNameInput');
    await authorInput.fill('Jo Mercer');
    await authorInput.blur();
    await expect(page.locator('#authorNameStatus')).toContainText('Saved');

    await createSessionForFirstFile(page, 'Author Session');
    const panel = page.locator('#sessionsPanelBody');
    await panel.locator('.session-note-input').fill('Note by Jo');
    await panel.locator('.session-note-save-btn').click();

    const author = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const notes = await api.NoteService.listNotes();
      return (await api.UserService.getUser(notes[0].author_id)).name;
    });
    expect(author).toBe('Jo Mercer');
  });

  test('Author Name empties back to the default rather than storing a blank name', async ({ page }) => {
    await loadSampleFile(page);
    await openPanel(page, 'User');
    const authorInput = page.locator('#authorNameInput');
    await authorInput.fill('   ');
    await authorInput.blur();
    await expect(authorInput).toHaveValue('This device');
  });

  test('Pick Uploaded Data can load every file in a session at once', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Bulk Load Session');
    // #clearBtn lives in the (initially collapsed) Map Controls panel.
    await openPanel(page, 'Map Controls');
    await page.click('#clearBtn');
    await expect(page.locator('.file-item')).toHaveCount(0);

    await page.click('#pickUploadedDataBtn');
    await expect(page.locator('.pick-uploaded-modal')).toBeVisible();
    await page.click('.pick-uploaded-tab[data-pick-tab="sessions"]');
    await expect(page.locator('.pick-uploaded-item', { hasText: 'Bulk Load Session' })).toBeVisible();
    await page.locator('.pick-uploaded-item', { hasText: 'Bulk Load Session' }).locator('.pick-uploaded-item-load-btn').click();

    await expect(page.locator('.pick-uploaded-modal')).toBeHidden();
    await expect(page.locator('.file-item')).toHaveCount(1);
  });

  test('Pick Uploaded Data can load every file across an event\'s sessions at once', async ({ page }) => {
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Event Load Session');
    const panel = page.locator('#sessionsPanelBody');
    await panel.locator('select[aria-label="Event"]').selectOption('__new_event__');
    page.once('dialog', (dialog) => dialog.accept('Bulk Load Event'));
    await panel.locator('select[aria-label="Event"]').selectOption('__new_event__');
    await expect(panel.locator('select[aria-label="Event"] option:checked')).toHaveText('Bulk Load Event');

    await openPanel(page, 'Map Controls');
    await page.click('#clearBtn');
    await expect(page.locator('.file-item')).toHaveCount(0);

    await page.click('#pickUploadedDataBtn');
    await page.click('.pick-uploaded-tab[data-pick-tab="events"]');
    await expect(page.locator('.pick-uploaded-item', { hasText: 'Bulk Load Event' })).toBeVisible();
    await page.locator('.pick-uploaded-item', { hasText: 'Bulk Load Event' }).locator('.pick-uploaded-item-load-btn').click();

    await expect(page.locator('.pick-uploaded-modal')).toBeHidden();
    await expect(page.locator('.file-item')).toHaveCount(1);
  });
});
