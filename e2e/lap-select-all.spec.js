// Covers the per-file "All"/"None" buttons next to each file's lap-list heading
// (renderLapsList in app.js), added so a file with many laps doesn't require unchecking
// each one individually to isolate a single lap.
const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile, selectYChannels } = require('./helpers');

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

  test('clicking None with only one file loaded actually removes its data from the plot (regression)', async ({ page }) => {
    // Regression: isLapSelected() used to treat an *empty* selectedLaps Map as "nothing
    // filtered, show everything" -- indistinguishable from "the lap list hasn't rendered
    // any checkboxes yet" (a legitimate bootstrapping case), so unchecking every lap for
    // the only loaded file (exactly what "None" does) left every lap's data plotting
    // anyway, even though the checkboxes correctly showed as unchecked.
    await loadSampleFile(page, path.join(__dirname, '..', 'sample_data_files', 'JohnWeraPittRace_YamahaR3.csv'));
    await selectYChannels(page, ['Speed']);

    const tracesBefore = await page.evaluate(() => document.getElementById('plotDiv').data.length);
    expect(tracesBefore).toBeGreaterThan(0);

    await page.locator('.file-lap-group').locator('button[data-lap-select-none]').click();
    await page.waitForTimeout(400);

    // Excludes "Min Speed"/"Max Speed" -- the "Shaded area between all laps" envelope
    // traces (now on by default), which always exist independent of which laps are
    // checked, and would otherwise also match this substring filter.
    const speedTracesAfter = await page.evaluate(() => (
      document.getElementById('plotDiv').data.filter((t) => (
        (t.name || '').includes('Speed') && !(t.name || '').startsWith('Min ') && !(t.name || '').startsWith('Max ')
      )).length
    ));
    expect(speedTracesAfter).toBe(0);
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
