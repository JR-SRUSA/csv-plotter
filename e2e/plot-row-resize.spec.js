// Covers the desktop-only drag handles that let the user resize Time Slip
// (positionTimeSlipResizeHandle) and the temperature-profile-plots block
// (positionTempProfileResizeHandle) independently, without growing the overall figure
// height -- both take space from/give space back to the main plot the same way.
const { test, expect } = require('@playwright/test');
const path = require('path');

const PITT_RACE_FILE = path.join(__dirname, '..', 'sample_data_files', 'JohnWeraPittRace_YamahaR3.csv');

// Only the fastest non-in/out lap is checked by default now, and Time Slip (which compares
// laps against each other) needs at least 2 selected laps to render at all -- these tests
// are about the resize handles, not default lap selection, so explicitly check every lap to
// guarantee Time Slip shows up regardless of that default.
async function loadMultiLapFile(page) {
  await page.goto('/index.html');
  await page.setInputFiles('#fileInput', PITT_RACE_FILE);
  await page.waitForFunction(() => {
    const pd = document.getElementById('plotDiv');
    return pd && Array.isArray(pd.data) && pd.data.length > 0;
  }, { timeout: 20000 });
  await page.click('button[data-lap-select-all]');
  await page.waitForTimeout(300);
}

test.describe('Time Slip / temp-profile row resize handles', () => {
  test('dragging the Time Slip handle resizes it and persists across reload', async ({ page }) => {
    await loadMultiLapFile(page);

    const hasTimeSlip = await page.evaluate(() => !!document.getElementById('plotDiv').layout.yaxis2);
    expect(hasTimeSlip).toBe(true);

    const handle = page.locator('.time-slip-resize-handle');
    await expect(handle).toBeVisible();

    const domainBefore = await page.evaluate(() => document.getElementById('plotDiv').layout.yaxis2.domain);
    const box = await handle.boundingBox();

    // Handle sits above Time Slip -- dragging it up grows Time Slip's own domain span.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 60, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(400);

    const domainAfter = await page.evaluate(() => document.getElementById('plotDiv').layout.yaxis2.domain);
    expect(domainAfter[1]).toBeGreaterThan(domainBefore[1]);

    await page.reload();
    await page.setInputFiles('#fileInput', PITT_RACE_FILE);
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data) && pd.data.length > 0;
    }, { timeout: 20000 });
    // Re-uploading is a fresh load -- back to only the fastest lap checked by default, so
    // Time Slip needs a second lap checked again before it exists to check the persisted
    // height against.
    await page.click('button[data-lap-select-all]');
    await page.waitForTimeout(300);
    const domainAfterReload = await page.evaluate(() => document.getElementById('plotDiv').layout.yaxis2.domain);
    expect(domainAfterReload[1]).toBeCloseTo(domainAfter[1], 5);
  });

  test('Time Slip and temp-profile resize handles coexist without overlapping domains', async ({ page }) => {
    await loadMultiLapFile(page);

    await page.click('#addTempProfileBtn');
    await page.fill('.temp-profile-name-input', 'Combined Test');
    await page.selectOption('.temp-profile-channel-list', ['LatAcc', 'LongAcc']);
    await page.click('.temp-profile-modal-dialog .session-modal-save');
    await page.waitForTimeout(500);

    const layoutInfo = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const tempDomain = Object.keys(pd.layout)
        .filter((k) => /^yaxis\d+$/.test(k) && pd.layout[k].type === 'category')
        .map((k) => pd.layout[k].domain)[0];
      return {
        timeSlip: pd.layout.yaxis2.domain,
        temp: tempDomain,
        main: pd.layout.yaxis.domain,
      };
    });

    // Stacked bottom-to-top: Time Slip, then the temp-profile block, then the main plot --
    // each region's bottom should be at or above the previous region's top (no overlap).
    expect(layoutInfo.temp[0]).toBeGreaterThanOrEqual(layoutInfo.timeSlip[1]);
    expect(layoutInfo.main[0]).toBeGreaterThanOrEqual(layoutInfo.temp[1]);

    const tempHandleBox = await page.locator('.temp-profile-resize-handle').boundingBox();
    const timeSlipHandleBox = await page.locator('.time-slip-resize-handle').boundingBox();
    expect(timeSlipHandleBox.y).toBeGreaterThan(tempHandleBox.y);
  });

  test('the Time Slip handle is hidden when Time Slip is not shown', async ({ page }) => {
    await page.goto('/index.html');
    await page.setInputFiles('#fileInput', path.join(__dirname, '..', 'sample_data_files', 'logdata.csv'));
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data) && pd.data.length > 0;
    }, { timeout: 20000 });

    const hasTimeSlip = await page.evaluate(() => !!document.getElementById('plotDiv').layout.yaxis2);
    expect(hasTimeSlip).toBe(false);
    await expect(page.locator('.time-slip-resize-handle')).toHaveCount(0);
  });
});
