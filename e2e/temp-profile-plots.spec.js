// Covers the Temperature Profile Plots feature: the "+ Add" modal (name, searchable
// multi-select channel picker, up/down + Flip Order reordering, colormap/range fields), the
// saved-plot list (enable toggle, edit, delete), gating by X-axis mode (only shown for
// Time/Distance, not Channel), and persistence across a reload.
const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

test.describe('Temperature Profile Plots', () => {
  test('create, reorder, and it renders as a heatmap subplot gated by X-axis mode', async ({ page }) => {
    await loadSampleFile(page);

    await page.click('#addTempProfileBtn');
    const dialog = page.locator('.temp-profile-modal-dialog');
    await expect(dialog).toBeVisible();

    await page.fill('.temp-profile-name-input', 'LF External');
    await page.selectOption('.temp-profile-channel-list', ['CylHeadTemp', 'WaterTemp']);
    await expect(page.locator('.temp-profile-order-item')).toHaveCount(2);

    const firstBefore = await page.locator('.temp-profile-order-item-name').first().textContent();
    await page.click('.temp-profile-flip-btn');
    const firstAfter = await page.locator('.temp-profile-order-item-name').first().textContent();
    expect(firstAfter).not.toBe(firstBefore);

    await page.click('.temp-profile-modal-dialog .session-modal-save');
    await expect(dialog).toHaveCount(0);

    await expect(page.locator('#tempProfilePlotsList .temp-profile-item-name')).toHaveText('LF External');

    // X axis defaults to Distance -- the plot should render as a heatmap trace.
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data) && pd.data.some((t) => t.type === 'heatmap');
    }, { timeout: 5000 });

    // Switch to Channel X-axis mode: temp profile traces disappear, hint appears.
    await page.click('input[name=xaxis][value=custom]');
    await page.waitForTimeout(400);
    const hasHeatmapInChannelMode = await page.evaluate(() => (
      document.getElementById('plotDiv').data.some((t) => t.type === 'heatmap')
    ));
    expect(hasHeatmapInChannelMode).toBe(false);
    await expect(page.locator('#tempProfileHiddenHint')).toBeVisible();

    // Time mode: available again.
    await page.click('input[name=xaxis][value=time]');
    await page.waitForFunction(() => (
      document.getElementById('plotDiv').data.some((t) => t.type === 'heatmap')
    ), { timeout: 5000 });
    await expect(page.locator('#tempProfileHiddenHint')).toBeHidden();

    // Persists across reload.
    await page.reload();
    await page.waitForTimeout(500);
    await expect(page.locator('#tempProfilePlotsList .temp-profile-item-name')).toHaveText('LF External');
  });

  test('custom colormap/range apply to the trace, enable toggle hides it, delete removes it', async ({ page }) => {
    await loadSampleFile(page);

    await page.click('#addTempProfileBtn');
    await page.fill('.temp-profile-name-input', 'RF External');
    await page.selectOption('.temp-profile-channel-list', ['CylHeadTemp', 'WaterTemp']);
    await page.uncheck('.temp-profile-use-default-row input[type=checkbox]');
    await page.selectOption('.temp-profile-colormap-select', 'Viridis');
    await page.fill('.temp-profile-min-input', '50');
    await page.fill('.temp-profile-max-input', '150');
    await page.click('.temp-profile-modal-dialog .session-modal-save');
    await page.waitForTimeout(300);

    const trace = await page.evaluate(() => {
      const t = document.getElementById('plotDiv').data.find((t) => t.type === 'heatmap');
      return t ? { zmin: t.zmin, zmax: t.zmax } : null;
    });
    expect(trace).toEqual({ zmin: 50, zmax: 150 });

    // Disabling via the list checkbox removes the heatmap trace without deleting the config.
    await page.uncheck('.temp-profile-item-enabled');
    await page.waitForTimeout(300);
    const hasHeatmapWhenDisabled = await page.evaluate(() => (
      document.getElementById('plotDiv').data.some((t) => t.type === 'heatmap')
    ));
    expect(hasHeatmapWhenDisabled).toBe(false);
    await expect(page.locator('.temp-profile-item')).toHaveCount(1);

    await page.click('.temp-profile-delete');
    await page.waitForTimeout(200);
    await expect(page.locator('.temp-profile-item')).toHaveCount(0);
  });

  test('editing an existing plot pre-fills its fields, and Cancel discards changes', async ({ page }) => {
    await loadSampleFile(page);

    await page.click('#addTempProfileBtn');
    await page.fill('.temp-profile-name-input', 'RR Internal');
    await page.selectOption('.temp-profile-channel-list', ['CylHeadTemp']);
    await page.click('.temp-profile-modal-dialog .session-modal-save');
    await page.waitForTimeout(300);

    await page.click('.temp-profile-edit');
    const dialog = page.locator('.temp-profile-modal-dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('.temp-profile-name-input')).toHaveValue('RR Internal');
    await expect(dialog.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();

    // Cancel (not Delete -- both share styling, so target by accessible name) discards the
    // edit without touching the saved plot.
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('#tempProfilePlotsList .temp-profile-item-name')).toHaveText('RR Internal');
  });

  test('the shared "Default Colors" editor updates plots that use the plotter default', async ({ page }) => {
    await loadSampleFile(page);

    await page.click('#addTempProfileBtn');
    await page.fill('.temp-profile-name-input', 'LR External');
    await page.selectOption('.temp-profile-channel-list', ['CylHeadTemp']);
    await page.click('.temp-profile-modal-dialog .session-modal-save');
    await page.waitForTimeout(300);

    await page.click('#editTempProfileDefaultsBtn');
    const defaultsDialog = page.locator('[aria-label="Edit plotter default temperature colors"]');
    await expect(defaultsDialog).toBeVisible();
    await defaultsDialog.locator('.temp-profile-min-input').fill('80');
    await defaultsDialog.locator('.temp-profile-max-input').fill('200');
    await defaultsDialog.getByRole('button', { name: 'Save', exact: true }).click();
    await page.waitForTimeout(300);

    const trace = await page.evaluate(() => {
      const t = document.getElementById('plotDiv').data.find((t) => t.type === 'heatmap');
      return t ? { zmin: t.zmin, zmax: t.zmax } : null;
    });
    expect(trace).toEqual({ zmin: 80, zmax: 200 });
  });
});
