// Covers a bug where the selection stats panel (and FFT panel) could render, and receive
// clicks, behind the Leaflet map: both panels floated at z-index 200, but Leaflet's own CSS
// goes up to z-index 1000 for its controls (e.g. the topright layers-switcher this app adds
// in geo mode) -- and since neither panel nor the map sit inside a stacking context that
// isolates them from each other, whichever one Leaflet draws wins whenever they overlap on
// screen. Fixed by giving both panels z-index 1100, safely above anything Leaflet uses.
const { test, expect } = require('@playwright/test');
const { loadSampleFile, selectYChannels, getPlotGeometry, dragSelection, clickModebarButton } = require('./helpers');

test('both floating panels declare a z-index above Leaflet\'s own maximum (1000)', async ({ page }) => {
  await loadSampleFile(page);
  const zIndexes = await page.evaluate(() => ({
    selectionStats: Number(getComputedStyle(document.getElementById('selectionStatsPanel')).zIndex),
    fft: Number(getComputedStyle(document.getElementById('fftPanel')).zIndex),
  }));
  expect(zIndexes.selectionStats).toBeGreaterThan(1000);
  expect(zIndexes.fft).toBeGreaterThan(1000);
});

test('selection stats panel stays above the map (drag it onto the layers control)', async ({ page }) => {
  await loadSampleFile(page);
  await selectYChannels(page, ['Speed']);

  await expect(page.locator('.leaflet-control-layers')).toBeVisible();

  await clickModebarButton(page, 'Box Select');
  const geom = await getPlotGeometry(page);
  await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);
  await expect(page.locator('#selectionStatsPanel')).toBeVisible();

  // Drag the panel by its header so it's centered directly on top of Leaflet's own
  // topright layers-switcher control (z-index 800, inside a .leaflet-top wrapper at
  // z-index 1000) -- the exact kind of element that used to paint over our panel when it
  // only had z-index 200.
  const controlBox = await page.locator('.leaflet-control-layers').boundingBox();
  const header = page.locator('#selectionStatsHeader');
  const panelBox = await page.locator('#selectionStatsPanel').boundingBox();
  const headerBox = await header.boundingBox();

  const targetX = controlBox.x + controlBox.width / 2;
  const targetY = controlBox.y + controlBox.height / 2;
  const grabX = headerBox.x + headerBox.width / 2;
  const grabY = headerBox.y + headerBox.height / 2;
  // Where the header needs to be dragged to so the panel's own center lands on the control.
  const panelCenterOffsetX = (panelBox.x + panelBox.width / 2) - grabX;
  const panelCenterOffsetY = (panelBox.y + panelBox.height / 2) - grabY;

  await page.mouse.move(grabX, grabY);
  await page.mouse.down();
  await page.mouse.move(targetX - panelCenterOffsetX, targetY - panelCenterOffsetY, { steps: 10 });
  await page.mouse.up();

  const topInfo = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    return { tag: el.tagName, cls: el.className, isPanelOrChild: !!el.closest('#selectionStatsPanel') };
  }, [targetX, targetY]);
  expect(topInfo.isPanelOrChild).toBe(true);

  // And it must still be draggable from there (proves it's also receiving pointer events,
  // not just painted on top) -- drag it back out toward the top-left.
  const movedHeaderBox = await header.boundingBox();
  await page.mouse.move(movedHeaderBox.x + movedHeaderBox.width / 2, movedHeaderBox.y + movedHeaderBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(movedHeaderBox.x - 150, movedHeaderBox.y - 30, { steps: 10 });
  await page.mouse.up();
  const finalBox = await page.locator('#selectionStatsPanel').boundingBox();
  expect(finalBox.x).toBeLessThan(movedHeaderBox.x - 50);
});
