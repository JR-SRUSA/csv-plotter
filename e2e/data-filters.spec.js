// Covers the Data Filters feature (app.js's dataFilters state + Add Filter form), in
// particular a regression: computeDataFilterChannelClassification (shared with the
// color-by-channel legend) treats any channel with few distinct values as "discrete" --
// right for something like Gear or Lap Number, but wrong for a genuinely continuous
// physical channel (e.g. lateral acceleration) that just happens to have coarse
// sensor-resolution quantization. That used to silently hide the Min/Max range fields in
// favor of a "pick individual values" multiselect, with no way to filter such a channel by
// range at all. Fixed by adding a Range/Specific-values toggle for exactly that ambiguous
// case (numeric + few distinct values), defaulting to discrete (unchanged from before) but
// letting the user switch to Range.
const { test, expect } = require('@playwright/test');
const os = require('os');
const fs = require('fs');
const path = require('path');

// AiM-format file with two numeric channels: Speed (smoothly varying, hundreds of distinct
// values -- clearly continuous) and LatAcc (deliberately rounded to 0.1g steps, so it has
// few enough distinct values to trip the same low-cardinality heuristic a coarse real
// sensor would -- the exact scenario this regression covers), plus Lap Number (genuinely
// categorical, to confirm its own default behavior is unchanged).
function buildAimCsv() {
  const lines = [
    'Format,AiM CSV File', 'Session,Test', 'Vehicle,44', 'Racer,TK', 'Championship,Test', 'Comment,',
    'Date,"Tuesday, April 28, 2026"', 'Time,12:51 PM', 'Sample Rate,20', 'Duration,15', 'Segment,Session',
    'Beacon Markers,7.5,15', 'Segment Times,0:07.5,0:07.5', '',
    'Time,GPS Speed,GPS LatAcc,GPS LonAcc', 's,km/h,g,g', ''
  ];
  const n = 600;
  for (let i = 0; i < n; i++) {
    const t = (i * 0.05).toFixed(2);
    const speed = (80 + 60 * Math.sin(i / 20)).toFixed(3);
    const latAcc = (Math.round((0.75 * Math.sin(i / 15)) / 0.1) * 0.1).toFixed(2);
    const lonAcc = (0.2 * Math.cos(i / 25)).toFixed(4);
    lines.push([t, speed, latAcc, lonAcc].join(','));
  }
  return lines.join('\n') + '\n';
}

async function loadAimFixture(page) {
  const filePath = path.join(os.tmpdir(), 'data-filters-aim-fixture.csv');
  fs.writeFileSync(filePath, buildAimCsv());
  await page.goto('/index.html');
  await page.setInputFiles('#fileInput', filePath);
  await page.waitForFunction(() => {
    const pd = document.getElementById('plotDiv');
    return pd && Array.isArray(pd.data) && pd.data.length > 0;
  }, { timeout: 20000 });
}

async function selectYChannel(page, value) {
  await page.evaluate((v) => {
    const sel = document.getElementById('ySelect');
    for (const o of sel.options) o.selected = (o.value === v);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
  await page.waitForTimeout(400);
}

test.describe('Data Filters', () => {
  test('a coarsely-quantized numeric channel offers Range as well as Specific values, defaulting to the old discrete behavior', async ({ page }) => {
    await loadAimFixture(page);
    await selectYChannel(page, 'LatAcc');

    await page.click('#addDataFilterBtn');
    await page.selectOption('#dataFilterChannel', 'LatAcc');

    await expect(page.locator('#dataFilterModeToggle')).toBeVisible();
    await expect(page.locator('#dataFilterModeDiscrete')).toBeChecked();
    await expect(page.locator('#dataFilterDiscreteField')).toBeVisible();
    await expect(page.locator('#dataFilterRangeField')).toBeHidden();
  });

  test('switching an ambiguous channel to Range mode actually filters the plotted data by range', async ({ page }) => {
    await loadAimFixture(page);
    await selectYChannel(page, 'LatAcc');

    await page.click('#addDataFilterBtn');
    await page.selectOption('#dataFilterChannel', 'LatAcc');
    await page.check('#dataFilterModeRange');
    await expect(page.locator('#dataFilterRangeField')).toBeVisible();
    await expect(page.locator('#dataFilterDiscreteField')).toBeHidden();

    await page.fill('#dataFilterMin', '-0.3');
    await page.fill('#dataFilterMax', '0.3');
    await page.click('#dataFilterSave');
    await page.waitForTimeout(400);

    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('dataFiltersState') || 'null'));
    expect(saved.filters[0]).toMatchObject({ channel: 'LatAcc', kind: 'range', min: -0.3, max: 0.3 });

    const yRange = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      // Excludes "Min LatAcc"/"Max LatAcc" -- the "Shaded area between all laps" envelope
      // traces (on by default), which sit ahead of the real per-lap traces in pd.data.
      const t = pd.data.find((tr) => (tr.name || '').includes('LatAcc') && !(tr.name || '').startsWith('Min ') && !(tr.name || '').startsWith('Max '));
      const ys = t.y.filter((v) => typeof v === 'number');
      return { min: Math.min(...ys), max: Math.max(...ys) };
    });
    expect(yRange.min).toBeGreaterThanOrEqual(-0.3);
    expect(yRange.max).toBeLessThanOrEqual(0.3);

    // Re-opening for edit must show Range mode (with the saved bounds), not silently
    // fall back to the ambiguous channel's discrete default.
    await page.click('.data-filter-edit');
    await expect(page.locator('#dataFilterRangeField')).toBeVisible();
    await expect(page.locator('#dataFilterMin')).toHaveValue('-0.3');
    await expect(page.locator('#dataFilterMax')).toHaveValue('0.3');
  });

  test('a clearly continuous numeric channel has no mode toggle and stays range-only', async ({ page }) => {
    await loadAimFixture(page);
    await page.click('#addDataFilterBtn');
    await page.selectOption('#dataFilterChannel', 'Speed');

    await expect(page.locator('#dataFilterModeToggle')).toBeHidden();
    await expect(page.locator('#dataFilterRangeField')).toBeVisible();
  });

  test('a genuinely categorical numeric channel (Lap Number) still defaults to Specific values', async ({ page }) => {
    await loadAimFixture(page);
    await page.click('#addDataFilterBtn');
    await page.selectOption('#dataFilterChannel', 'Lap Number');

    await expect(page.locator('#dataFilterDiscreteField')).toBeVisible();
    await expect(page.locator('#dataFilterModeDiscrete')).toBeChecked();
  });

  test('the section dims (but stays interactive) when the master toggle is off, and stays dimmed across reload', async ({ page }) => {
    await loadAimFixture(page);
    await page.click('#addDataFilterBtn');
    await page.selectOption('#dataFilterChannel', 'Speed');
    await page.fill('#dataFilterMin', '100');
    await page.click('#dataFilterSave');
    await page.waitForTimeout(300);

    const opacity = (locator) => locator.evaluate((el) => Number(getComputedStyle(el).opacity));

    expect(await opacity(page.locator('#dataFiltersList'))).toBeCloseTo(1, 1);

    await page.uncheck('#dataFiltersEnabled');
    await page.waitForTimeout(200);
    expect(await opacity(page.locator('#dataFiltersList'))).toBeLessThan(0.6);
    expect(await opacity(page.locator('#addDataFilterBtn'))).toBeLessThan(0.6);
    // The toggle itself (and its label) is the affordance for turning filtering back on --
    // it must not dim along with what it gates, or there's nothing left to draw the eye to.
    expect(await opacity(page.locator('.data-filters-header label'))).toBeCloseTo(1, 1);

    // Still interactive while dimmed.
    const filterCheckbox = page.locator('.data-filter-item-enabled').first();
    await filterCheckbox.click();
    await expect(filterCheckbox).not.toBeChecked();

    await page.reload();
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data);
    }, { timeout: 20000 });
    expect(await opacity(page.locator('#dataFiltersList'))).toBeLessThan(0.6);

    await page.check('#dataFiltersEnabled');
    await page.waitForTimeout(200);
    expect(await opacity(page.locator('#dataFiltersList'))).toBeCloseTo(1, 1);
  });
});
