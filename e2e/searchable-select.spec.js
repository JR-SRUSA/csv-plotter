// Covers enhanceSelectWithSearch in app.js: the reusable searchable-combobox that replaces
// the plain X-axis channel, plot color axis, map color, and importer source-column <select>s.
// Clicking the visible trigger (or focusing it and typing) opens a floating panel whose text
// filter matches anywhere in an option's label, not just its prefix like the browser's native
// select type-ahead.
const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

test.describe('searchable select', () => {
  test('X axis channel select: substring search, selection, and its own line in the layout', async ({ page }) => {
    await loadSampleFile(page);
    await page.click('input[name=xaxis][value=custom]');
    await page.click('[data-for-select=xCustomSelect]');
    await expect(page.locator('.searchable-select-panel:visible')).toHaveCount(1);

    // "ee" only matches mid-word (Speed, FrontWheel, RearWheel, Steer) -- proves this isn't
    // the browser's native prefix-only type-ahead.
    await page.fill('.searchable-select-panel .searchable-select-input', 'ee');
    const items = page.locator('.searchable-select-panel:visible .searchable-select-item');
    const labels = await items.allTextContents();
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every(l => l.toLowerCase().includes('ee'))).toBe(true);

    const firstLabel = labels[0];
    await items.first().click();
    await expect(page.locator('.searchable-select-panel:visible')).toHaveCount(0);
    const selectedLabel = await page.locator('#xCustomSelect').evaluate(s => s.options[s.selectedIndex].textContent);
    const triggerLabel = await page.locator('[data-for-select=xCustomSelect]').textContent();
    expect(selectedLabel).toBe(firstLabel);
    expect(triggerLabel).toBe(firstLabel);

    // Regression check: the trigger used to be only as wide as the current value (unlike the
    // native select, which sized itself to the widest option), leaving room for "Log Scale" to
    // share its line. It must render on its own line, with Log Scale below it.
    const triggerBox = await page.locator('[data-for-select=xCustomSelect]').boundingBox();
    const logScaleBox = await page.locator('label:has(#logXAxis)').boundingBox();
    expect(logScaleBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height - 1);
  });

  test('color axis select and map color select both open a search panel', async ({ page }) => {
    await loadSampleFile(page);

    await page.click('input[name=colorMode][value=axis]');
    await page.click('[data-for-select=colorAxisSelect]');
    await expect(page.locator('.searchable-select-panel:visible')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.locator('.searchable-select-panel:visible')).toHaveCount(0);

    await page.click('summary:has-text("Map Controls")');
    await page.check('#mapColorEnabled');
    await page.click('[data-for-select=mapColorSelect]');
    await expect(page.locator('.searchable-select-panel:visible')).toHaveCount(1);
    await page.keyboard.type('sp');
    const mapLabels = await page.locator('.searchable-select-panel:visible .searchable-select-item').allTextContents();
    expect(mapLabels.length).toBeGreaterThan(0);
    expect(mapLabels.every(l => l.toLowerCase().includes('sp'))).toBe(true);
    await page.keyboard.press('Enter');
    await expect(page.locator('.searchable-select-panel:visible')).toHaveCount(0);
    const mapTriggerLabel = await page.locator('[data-for-select=mapColorSelect]').textContent();
    expect(mapTriggerLabel.toLowerCase()).toContain('sp');
  });

  test('importer source-column select: search works, and re-rendering the row does not leak panels, and does not close the modal on Escape', async ({ page }) => {
    await loadSampleFile(page);
    await page.click('button[data-importer-customize]');
    await expect(page.locator('#importerEditorModal')).toBeVisible();

    const firstTrigger = page.locator('td:has(select[data-importer-channel]) button.searchable-select-trigger').first();
    await firstTrigger.click();
    await expect(page.locator('.searchable-select-panel:visible')).toHaveCount(1);
    await page.keyboard.type('a');
    const items = page.locator('.searchable-select-panel:visible .searchable-select-item');
    expect(await items.count()).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('.searchable-select-panel:visible')).toHaveCount(0);
    // The importer modal has its own global Escape-to-close handler -- ours must not bubble
    // into it, or closing the search panel would also close the whole editor underneath it.
    await expect(page.locator('#importerEditorModal')).toBeVisible();

    // The importer table fully rebuilds its <select> elements (and re-enhances them) on every
    // change, e.g. toggling a filter checkbox -- confirm that doesn't leak one orphaned
    // floating panel per re-render.
    const panelCountBefore = await page.locator('.searchable-select-panel').count();
    await page.locator('input[data-importer-filter-enabled]').first().click();
    const panelCountAfter = await page.locator('.searchable-select-panel').count();
    expect(panelCountAfter).toBeLessThanOrEqual(panelCountBefore);
  });
});
