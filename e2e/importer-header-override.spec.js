// Covers the "Header Rows" section of the Custom Importer modal (app.js's
// openImporterEditor/renderImporterHeaderOverride): lets a user override which raw row is
// the header/units/first-data row when auto-detection (findHeaderRowIndex in
// file-processors.js) picks the wrong one, with a numbered raw-row preview to help them
// pick correctly.
const { test, expect } = require('@playwright/test');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Deliberately ambiguous: a 3-column table whose units row ("s","km/h","rpm") also looks
// header-shaped to the generic heuristic, so auto-detect locks onto row 3 (the units row)
// as the header instead of row 2 (the real "Time,Speed,RPM" header) -- verified directly
// against file-processors.js. This is a real, if unusual, way auto-detection can go wrong,
// and is exactly what the manual override exists to fix.
const AMBIGUOUS_CSV = [
  'junk,junk,junk',
  'Time,Speed,RPM',
  's,km/h,rpm',
  'extra junk row here,,',
  '0,50,3000',
  '1,60,3500',
  '2,70,4000',
  ''
].join('\n');

async function uploadText(page, text, name) {
  const filePath = path.join(os.tmpdir(), name);
  fs.writeFileSync(filePath, text);
  await page.goto('/index.html');
  await page.setInputFiles('#fileInput', filePath);
  await page.waitForFunction(() => {
    const pd = document.getElementById('plotDiv');
    return pd && Array.isArray(pd.data);
  }, { timeout: 20000 });
}

async function ySelectChannelNames(page) {
  return page.evaluate(() => Array.from(document.getElementById('ySelect').options).map((o) => o.value));
}

test.describe('Custom Importer: manual header row override', () => {
  test('auto-detect picking the wrong header row can be corrected manually, and the Y-channel list updates', async ({ page }) => {
    await uploadText(page, AMBIGUOUS_CSV, 'ambiguous-header.csv');

    // Auto-detect locked onto the units row -- channels are the unit strings, not "Time"/
    // "Speed"/"RPM".
    let channels = await ySelectChannelNames(page);
    expect(channels).not.toContain('Time');
    expect(channels).not.toContain('Speed');

    await page.click('button[data-importer-customize]');
    await expect(page.locator('#importerEditorModal')).toBeVisible();
    await expect(page.locator('#importerHeaderOverrideSection')).toBeVisible();

    // The raw-row preview should show every row of the tiny fixture, numbered from 1.
    const previewRows = page.locator('.importer-row-preview-row');
    await expect(previewRows).toHaveCount(7);
    await expect(previewRows.nth(0)).toContainText('junk');
    await expect(previewRows.nth(1)).toContainText('Time');

    // Switch to manual mode and point it at the real header (row 2) / units (row 3) /
    // first data row (row 5), 1-based as shown in the UI.
    await page.check('#importerHeaderModeManual');
    await expect(page.locator('#importerHeaderOverrideFields')).toBeVisible();
    await page.fill('#importerHeaderRowInput', '2');
    await page.fill('#importerUnitsRowInput', '3');
    await page.fill('#importerDataStartRowInput', '5');

    // Preview highlights should follow the fields live, before saving.
    await expect(previewRows.nth(1)).toHaveClass(/is-header-row/);
    await expect(previewRows.nth(2)).toHaveClass(/is-units-row/);
    await expect(previewRows.nth(4)).toHaveClass(/is-data-row/);

    await page.click('#importerEditorSave');
    await expect(page.locator('#importerEditorModal')).toBeHidden();

    channels = await ySelectChannelNames(page);
    expect(channels).toContain('Time');
    expect(channels).toContain('Speed');
    expect(channels).toContain('RPM');
  });

  test('an invalid manual header row range is rejected with an inline error instead of saving', async ({ page }) => {
    await uploadText(page, AMBIGUOUS_CSV, 'ambiguous-header-invalid.csv');

    await page.click('button[data-importer-customize]');
    await page.check('#importerHeaderModeManual');
    await page.fill('#importerHeaderRowInput', '2');
    // First data row before the header row is invalid.
    await page.fill('#importerDataStartRowInput', '1');

    await page.click('#importerEditorSave');
    await expect(page.locator('#importerEditorModal')).toBeVisible();
    await expect(page.locator('#importerEditorError')).toBeVisible();
    await expect(page.locator('#importerEditorError')).toContainText('data row');
  });

  test('manual header override is remembered (by filename) and reapplied automatically next time the same file is loaded', async ({ page }) => {
    const filePath = path.join(os.tmpdir(), 'ambiguous-header-persist.csv');
    fs.writeFileSync(filePath, AMBIGUOUS_CSV);

    await page.goto('/index.html');
    await page.setInputFiles('#fileInput', filePath);
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data);
    }, { timeout: 20000 });

    await page.click('button[data-importer-customize]');
    await page.check('#importerHeaderModeManual');
    await page.fill('#importerHeaderRowInput', '2');
    await page.fill('#importerUnitsRowInput', '3');
    await page.fill('#importerDataStartRowInput', '5');
    await page.click('#importerEditorSave');
    await expect(page.locator('#importerEditorModal')).toBeHidden();

    let channels = await ySelectChannelNames(page);
    expect(channels).toContain('Time');

    // A fresh page load, then re-uploading the same-named file from scratch (not a saved
    // session) -- the override is keyed by filename in IndexedDB and should reapply itself
    // via applySavedImporterConfigToLog without redoing the modal.
    await page.reload();
    await page.setInputFiles('#fileInput', filePath);
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data);
    }, { timeout: 20000 });
    await page.waitForTimeout(500);

    channels = await ySelectChannelNames(page);
    expect(channels).toContain('Time');
    expect(channels).toContain('Speed');
    expect(channels).toContain('RPM');
  });
});
