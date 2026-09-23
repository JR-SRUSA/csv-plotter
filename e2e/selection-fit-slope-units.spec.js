// Covers the linear fit's "Slope Units" control: default auto (Y-unit / X-unit, e.g.
// "km/h/s" or "km/h/m") vs. converting the slope to g's for a speed-vs-time selection, so
// a dragged selection's average acceleration/deceleration can be read directly.
const { test, expect } = require('@playwright/test');
const {
  loadSampleFile,
  selectYChannels,
  getPlotGeometry,
  dragSelection,
  clickModebarButton,
} = require('./helpers');

const GRAVITY_MS2 = 9.81;
const KMH_TO_MPS = 1 / 3.6;

async function setXAxisMode(page, mode) {
  await page.locator(`input[name="xaxis"][value="${mode}"]`).check();
}

// Reads the raw (x, y) points Plotly currently has selected for a given channel, straight
// off the trace -- the same data the app's own fit is computed from -- so the test can
// independently recompute the least-squares slope and check the app's "g" conversion
// against it, rather than just eyeballing that some number showed up.
async function selectedPoints(page, channel) {
  return page.evaluate((ch) => {
    const pd = document.getElementById('plotDiv');
    const trace = pd.data.find((t) => t.meta && t.meta.channel === ch);
    if (!trace || !Array.isArray(trace.selectedpoints)) return [];
    return trace.selectedpoints.map((i) => ({ x: trace.x[i], y: trace.y[i] }));
  }, channel);
}

function leastSquaresSlope(points) {
  const n = points.length;
  const meanX = points.reduce((a, p) => a + p.x, 0) / n;
  const meanY = points.reduce((a, p) => a + p.y, 0) / n;
  let sxy = 0, sxx = 0;
  points.forEach((p) => { sxy += (p.x - meanX) * (p.y - meanY); sxx += (p.x - meanX) * (p.x - meanX); });
  return sxy / sxx;
}

test.describe('linear fit: Slope Units control', () => {
  test('is only shown for the Linear fit type, and remembers the chosen setting when hidden/reshown', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);
    await expect(page.locator('#selectionStatsPanel')).toBeVisible();

    const row = page.locator('#selectionFitSlopeUnitsRow');
    await expect(row).toBeVisible();
    await expect(page.locator('#selectionFitSlopeUnitsSelect')).toHaveValue('auto');

    await page.selectOption('#selectionFitSlopeUnitsSelect', 'g');
    await page.selectOption('#selectionFitTypeSelect', 'exponential');
    await page.waitForTimeout(300);
    await expect(row).toBeHidden();

    await page.selectOption('#selectionFitTypeSelect', 'linear');
    await expect(row).toBeVisible();
    await expect(page.locator('#selectionFitSlopeUnitsSelect')).toHaveValue('g');
  });

  test('defaults to auto units built from the Y channel and X-axis units (km/h over distance in m)', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']); // default X axis is Distance (m)
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);

    const group = page.locator('.selection-stats-group').first();
    await expect(group).toContainText('slope:');
    await expect(group).toContainText('km/h/m');
  });

  test('auto units switch to km/h/s once the x-axis is Time', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await setXAxisMode(page, 'time');
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);

    await expect(page.locator('.selection-stats-group').first()).toContainText('km/h/s');
  });

  test('shows the slope in g for a speed-vs-time selection, matching an independent recomputation', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await setXAxisMode(page, 'time');
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);
    await expect(page.locator('#selectionStatsPanel')).toBeVisible();

    await page.selectOption('#selectionFitSlopeUnitsSelect', 'g');
    await page.waitForTimeout(200);

    const group = page.locator('.selection-stats-group').first();
    const text = await group.innerText();
    const match = text.match(/slope:\s*(-?[\d.]+(?:e[+-]?\d+)?)\s*g\b/i);
    expect(match).not.toBeNull();
    const shownG = Number(match[1]);

    const points = await selectedPoints(page, 'Speed');
    expect(points.length).toBeGreaterThan(2);
    const slopeKmhPerS = leastSquaresSlope(points);
    const expectedG = (slopeKmhPerS * KMH_TO_MPS) / GRAVITY_MS2;
    expect(shownG).toBeCloseTo(expectedG, 2);
  });

  // The "g" slope is computed from each selected row's own logged Time (see
  // computeSlopeGravities in app.js), not from whatever's actually plotted on the x-axis --
  // so it works, and gives the very same value, whether the selection was made with
  // Distance or Time on the x-axis.
  test('g still computes correctly with Distance on the x-axis, matching the value shown with Time on the x-axis', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']); // default x-axis: Distance
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);
    await page.selectOption('#selectionFitSlopeUnitsSelect', 'g');
    await page.waitForTimeout(200);

    const group = page.locator('.selection-stats-group').first();
    await expect(group).not.toContainText('needs a speed channel');
    const distanceText = await group.innerText();
    const distanceMatch = distanceText.match(/slope:\s*(-?[\d.]+(?:e[+-]?\d+)?)\s*g\b/i);
    expect(distanceMatch).not.toBeNull();
    const gWithDistanceAxis = Number(distanceMatch[1]);

    // Switching the x-axis re-renders the plot, but the selection (and its fit) survives
    // that (see reapplyCapturedSelection) -- no need to redo the drag.
    await setXAxisMode(page, 'time');
    await page.waitForTimeout(300);
    const timeText = await group.innerText();
    const timeMatch = timeText.match(/slope:\s*(-?[\d.]+(?:e[+-]?\d+)?)\s*g\b/i);
    expect(timeMatch).not.toBeNull();
    const gWithTimeAxis = Number(timeMatch[1]);

    // gWithTimeAxis is itself checked against an independent recomputation in the test
    // above; matching it here confirms the Distance-axis reading is equally correct.
    expect(gWithDistanceAxis).toBeCloseTo(gWithTimeAxis, 3);
  });

  test('falls back to auto units when the Y channel is not a recognized speed unit, whatever the x-axis', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['LatAcc']); // already in "G" -- not a speed unit
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);

    await page.selectOption('#selectionFitSlopeUnitsSelect', 'g');
    await page.waitForTimeout(200);

    await expect(page.locator('.selection-stats-group').first()).toContainText('g needs a speed channel and a logged Time column');
  });

  test('choosing g saves it to localStorage', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await setXAxisMode(page, 'time');
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);

    await page.selectOption('#selectionFitSlopeUnitsSelect', 'g');
    expect(await page.evaluate(() => localStorage.getItem('selectionFitSlopeUnits'))).toBe('g');
  });

  // Mirrors the equivalent "uses last selected fit type from localStorage by default" test
  // for Fit Type: a value saved from a previous visit is picked up on the next load,
  // rather than always starting back at "auto".
  test('uses last selected slope-units setting from localStorage by default', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('selectionFitSlopeUnits', 'g');
    });
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await setXAxisMode(page, 'time');
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);

    await expect(page.locator('#selectionFitSlopeUnitsSelect')).toHaveValue('g');
    // No trailing boundary check on "g": Locator.toContainText() flattens the panel's
    // separate lines together with no separating whitespace (e.g. "...g" immediately
    // followed by "R²: ..."), unlike a real render or .innerText() (see the
    // recomputation test above) -- matching just up to "g" is enough here.
    await expect(page.locator('.selection-stats-group').first()).toContainText(/slope:\s*-?[\d.]+(?:e[+-]?\d+)?\s*g/);
  });
});
