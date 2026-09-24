// Covers temperature-profile-plot layout/decluttering fixes: on mobile, the figure grows to
// fit the main plot at a comfortable size plus each active temp-profile plot at its own
// content-sized height (rather than squeezing everything into a small fixed budget), with
// the page scrolling to reveal it; on both mobile and desktop, the heatmap's colorbar no
// longer repeats the plot's own name (already shown as the Y-axis title) and its hover
// tooltip no longer repeats the channel name (already shown at that row's Y position).
const { test, expect } = require('@playwright/test');
const path = require('path');

const PITT_RACE_FILE = path.join(__dirname, '..', 'sample_data_files', 'JohnWeraPittRace_YamahaR3.csv');

async function loadFile(page) {
  await page.goto('/index.html');
  await page.setInputFiles('#fileInput', PITT_RACE_FILE);
  await page.waitForFunction(() => {
    const pd = document.getElementById('plotDiv');
    return pd && Array.isArray(pd.data) && pd.data.length > 0;
  }, { timeout: 20000 });
}

// `channels` is either an explicit array of channel values, or a number -- meaning "the
// first N available options" -- resolved only after the modal (and its channel list) is
// actually open, since querying '.temp-profile-channel-list option' beforehand (it doesn't
// exist yet) would silently select nothing, fail the form's "select at least one channel"
// validation, and leave the modal open.
async function addTempProfilePlot(page, channels) {
  await page.click('#addTempProfileBtn');
  await page.fill('.temp-profile-name-input', 'Rear External Temp');
  const values = typeof channels === 'number'
    ? await page.locator('.temp-profile-channel-list option').evaluateAll((els, n) => els.slice(0, n).map((e) => e.value), channels)
    : channels;
  await page.selectOption('.temp-profile-channel-list', values);
  await page.click('.temp-profile-modal-dialog .session-modal-save');
  await page.waitForTimeout(600);
}

test.describe('Temperature profile plots: mobile layout + decluttering', () => {
  test('mobile: a many-channel temp profile plot grows the page and becomes scrollable, without squishing the main plot', async ({ page }) => {
    await page.setViewportSize({ width: 440, height: 956 });
    await loadFile(page);

    const mainPlotPxBefore = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      return (pd.layout.yaxis.domain[1] - pd.layout.yaxis.domain[0]) * pd._fullLayout.height;
    });
    // Comfortable, not squished -- matches getFigureHeight's mobile main-plot target.
    expect(mainPlotPxBefore).toBeGreaterThan(250);

    await page.click('#controlsToggle');
    await page.waitForTimeout(300);
    await addTempProfilePlot(page, 16);
    // The drawer locks page scroll while open (body.controls-open{overflow:hidden}) --
    // closing it is what's under test here (the plot area's own scroll), not the drawer's
    // own close-button UX (covered by mobile-fixes.spec.js), so drop the class directly
    // rather than depend on the close button's click/animation timing.
    await page.evaluate(() => document.body.classList.remove('controls-open'));
    await page.waitForTimeout(200);

    const info = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      return {
        canScroll: document.body.scrollHeight > window.innerHeight,
        mainPlotPx: (pd.layout.yaxis.domain[1] - pd.layout.yaxis.domain[0]) * pd._fullLayout.height,
      };
    });
    expect(info.canScroll).toBe(true);
    // The main plot keeps its own comfortable height even with 16 temp-profile rows added --
    // it isn't squeezed to make room for them (that's what the scrolling is for instead).
    expect(info.mainPlotPx).toBeGreaterThan(250);

    const scrollYBefore = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(300);
    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(scrollYAfter).toBeGreaterThan(scrollYBefore);
  });

  test('desktop: adding a temp-profile plot does not change the no-scroll, fixed-total-height layout', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await loadFile(page);
    await addTempProfilePlot(page, ['LatAcc', 'LongAcc', 'Radius']);

    const canScroll = await page.evaluate(() => document.body.scrollHeight > window.innerHeight);
    expect(canScroll).toBe(false);
  });

  test('the colorbar has no title, on both mobile and desktop', async ({ page }) => {
    for (const viewport of [{ width: 440, height: 956 }, { width: 1400, height: 1000 }]) {
      await page.setViewportSize(viewport);
      await loadFile(page);
      if (viewport.width < 981) {
        await page.click('#controlsToggle');
        await page.waitForTimeout(300);
      }
      await addTempProfilePlot(page, ['LatAcc', 'LongAcc', 'Radius']);

      const colorbarTitle = await page.evaluate(() => {
        const pd = document.getElementById('plotDiv');
        const t = pd.data.find((tr) => tr.type === 'heatmap');
        return t.colorbar ? t.colorbar.title : 'NO_COLORBAR';
      });
      expect(colorbarTitle).toBeUndefined();
    }
  });

  test('the Y-axis has no per-channel tick labels, and the hover tooltip does not repeat the channel name', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await loadFile(page);
    await addTempProfilePlot(page, ['LatAcc', 'LongAcc', 'Radius']);

    const info = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const t = pd.data.find((tr) => tr.type === 'heatmap');
      const yAxis = pd.layout[t.yaxis === 'y' ? 'yaxis' : 'yaxis' + t.yaxis.slice(1)];
      return {
        showticklabels: yAxis.showticklabels,
        axisTitle: yAxis.title && yAxis.title.text,
        hovertemplate: t.hovertemplate,
      };
    });
    expect(info.showticklabels).toBe(false);
    expect(info.axisTitle).toBe('Rear External Temp');
    expect(info.hovertemplate).not.toContain('%{y}:');
    expect(info.hovertemplate).toContain('%{z}');
  });
});
