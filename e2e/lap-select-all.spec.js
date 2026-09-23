// Covers the per-file "All"/"None" buttons next to each file's lap-list heading
// (renderLapsList in app.js), added so a file with many laps doesn't require unchecking
// each one individually to isolate a single lap.
const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile } = require('./helpers');

test.describe('Lap select all/none', () => {
  test('None unchecks every lap for that file, All re-checks them all', async ({ page }) => {
    await loadSampleFile(page, path.join(__dirname, '..', 'sample_data_files', 'JohnWeraPittRace_YamahaR3.csv'));

    const group = page.locator('.file-lap-group');
    const checkboxes = group.locator('input[type=checkbox]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(1);

    await group.locator('button[data-lap-select-none]').click();
    let checkedCount = await checkboxes.evaluateAll((els) => els.filter((e) => e.checked).length);
    expect(checkedCount).toBe(0);

    await group.locator('button[data-lap-select-all]').click();
    checkedCount = await checkboxes.evaluateAll((els) => els.filter((e) => e.checked).length);
    expect(checkedCount).toBe(count);
  });

  test('is scoped independently per file when multiple files are loaded', async ({ page }) => {
    await page.goto('/index.html');
    await page.setInputFiles('#fileInput', [
      path.join(__dirname, '..', 'sample_data_files', 'JohnWeraPittRace_YamahaR3.csv'),
      path.join(__dirname, '..', 'sample_data_files', 'logdata.csv'),
    ]);
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data) && pd.data.length > 0;
    }, { timeout: 20000 });

    const groups = page.locator('.file-lap-group');
    await expect(groups).toHaveCount(2);

    const pittRaceGroup = page.locator('.file-lap-group', { hasText: 'JohnWeraPittRace_YamahaR3.csv' });
    const logdataGroup = page.locator('.file-lap-group', { hasText: 'logdata.csv' });

    await pittRaceGroup.locator('button[data-lap-select-none]').click();
    const pittChecked = await pittRaceGroup.locator('input[type=checkbox]').evaluateAll((els) => els.filter((e) => e.checked).length);
    const logdataChecked = await logdataGroup.locator('input[type=checkbox]').evaluateAll((els) => els.filter((e) => e.checked).length);
    expect(pittChecked).toBe(0);
    expect(logdataChecked).toBeGreaterThan(0);
  });
});
