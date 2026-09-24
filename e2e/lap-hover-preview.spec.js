// Covers hovering a lap row in the sidebar laps list (renderLapsList's .lap-item hover
// wiring + the isPreviewOnly branch in updatePlot()'s main trace loop): an unchecked lap's
// data temporarily appears on the plot (dashed, dimmed) while hovered, and disappears again
// on mouseleave, without affecting the lap's own checkbox state.
const { test, expect } = require('@playwright/test');
const path = require('path');

const PITT_RACE_FILE = path.join(__dirname, '..', 'sample_data_files', 'JohnWeraPittRace_YamahaR3.csv');

async function loadMultiLapFile(page) {
  await page.goto('/index.html');
  await page.setInputFiles('#fileInput', PITT_RACE_FILE);
  await page.waitForFunction(() => {
    const pd = document.getElementById('plotDiv');
    return pd && Array.isArray(pd.data) && pd.data.length > 0;
  }, { timeout: 20000 });
}

test.describe('Lap hover preview', () => {
  test('hovering an unchecked lap adds a dashed preview trace, unhover removes it', async ({ page }) => {
    await loadMultiLapFile(page);

    const lap0Item = page.locator('.lap-item[data-lap="0"]');
    await expect(lap0Item.locator('input[type=checkbox]')).not.toBeChecked();

    const countBefore = await page.evaluate(() => document.getElementById('plotDiv').data.length);

    await lap0Item.hover();
    await page.waitForTimeout(300);
    const duringHover = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const preview = pd.data.filter((t) => (t.name || '').includes('(preview)'));
      return {
        totalTraces: pd.data.length,
        previewCount: preview.length,
        allDashed: preview.every((t) => t.line && t.line.dash === 'dot'),
        allDimmed: preview.every((t) => t.opacity === 0.55),
        anyHasSelectionMeta: preview.some((t) => t.meta && t.meta.channel),
      };
    });
    expect(duringHover.previewCount).toBeGreaterThan(0);
    expect(duringHover.totalTraces).toBe(countBefore + duringHover.previewCount);
    expect(duringHover.allDashed).toBe(true);
    expect(duringHover.allDimmed).toBe(true);
    // Excluded from the selection-fit stats panel, same as other transient overlay traces.
    expect(duringHover.anyHasSelectionMeta).toBe(false);

    await page.mouse.move(700, 400);
    await page.waitForTimeout(300);
    const afterUnhover = await page.evaluate(() => ({
      totalTraces: document.getElementById('plotDiv').data.length,
      previewCount: document.getElementById('plotDiv').data.filter((t) => (t.name || '').includes('(preview)')).length,
    }));
    expect(afterUnhover.previewCount).toBe(0);
    expect(afterUnhover.totalTraces).toBe(countBefore);

    // Hovering never checks the box -- it's a preview, not a selection.
    await expect(lap0Item.locator('input[type=checkbox]')).not.toBeChecked();
  });

  test('hovering an already-checked lap adds no duplicate preview trace', async ({ page }) => {
    await loadMultiLapFile(page);

    const checkedItem = page.locator('.lap-item').filter({ has: page.locator('input[type=checkbox]:checked') }).first();
    const countBefore = await page.evaluate(() => document.getElementById('plotDiv').data.length);

    await checkedItem.hover();
    await page.waitForTimeout(300);
    const info = await page.evaluate(() => ({
      totalTraces: document.getElementById('plotDiv').data.length,
      previewCount: document.getElementById('plotDiv').data.filter((t) => (t.name || '').includes('(preview)')).length,
    }));
    expect(info.previewCount).toBe(0);
    expect(info.totalTraces).toBe(countBefore);
  });

  test("hovering one file's lap doesn't preview a same-numbered lap in a different file", async ({ page }) => {
    await page.goto('/index.html');
    await page.setInputFiles('#fileInput', [PITT_RACE_FILE, path.join(__dirname, '..', 'sample_data_files', 'logdata.csv')]);
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data) && pd.data.length > 0;
    }, { timeout: 20000 });

    const pittLap0 = page.locator('.file-lap-group', { hasText: 'JohnWeraPittRace_YamahaR3.csv' }).locator('.lap-item[data-lap="0"]');
    await pittLap0.hover();
    await page.waitForTimeout(300);
    const previewNames = await page.evaluate(() => (
      document.getElementById('plotDiv').data.filter((t) => (t.name || '').includes('(preview)')).map((t) => t.name)
    ));
    expect(previewNames.length).toBeGreaterThan(0);
    expect(previewNames.every((n) => n.startsWith('JohnWeraPittRace_YamahaR3.csv'))).toBe(true);
  });
});
