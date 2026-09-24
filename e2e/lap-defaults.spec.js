// Covers the default state of the laps list and "Shaded area between all laps" on a fresh
// file load (renderLapsList's defaultCheckedLap logic + the shadeLaps checkbox's default/
// persistence): only the single fastest non-in/out, non-negative-distance lap is checked by
// default, and "Shaded area" defaults on and persists across reload -- together giving a
// freshly-loaded file's best lap plotted against the full range the rider has run, out of
// the box.
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

function parseLapTimeLabel(label) {
  const m = label.match(/(\d+):(\d+)\.(\d+)/);
  return m ? Number(m[1]) * 60 + Number(m[2]) + Number(m[3]) / 1000 : Infinity;
}

test.describe('Lap list / shading defaults', () => {
  test('only the single fastest non-in/out lap is checked by default', async ({ page }) => {
    await loadMultiLapFile(page);

    const lapInfo = await page.evaluate(() => (
      Array.from(document.querySelectorAll('.lap-item')).map((el) => ({
        lap: el.getAttribute('data-lap'),
        checked: el.querySelector('input[type=checkbox]').checked,
        label: el.querySelector('.lap-label').textContent,
      }))
    ));

    const checkedLaps = lapInfo.filter((l) => l.checked);
    expect(checkedLaps.length).toBe(1);

    // First and last laps by lap number (in/out laps) must never be the default pick.
    expect(checkedLaps[0].lap).not.toBe(lapInfo[0].lap);
    expect(checkedLaps[0].lap).not.toBe(lapInfo[lapInfo.length - 1].lap);

    // The checked lap must actually be the fastest among the non-in/out laps.
    const nonInOut = lapInfo.slice(1, -1);
    const fastest = nonInOut.reduce((best, l) => (parseLapTimeLabel(l.label) < parseLapTimeLabel(best.label) ? l : best));
    expect(checkedLaps[0].lap).toBe(fastest.lap);
  });

  test('"Shaded area between all laps" defaults on and persists across reload', async ({ page }) => {
    await loadMultiLapFile(page);
    await expect(page.locator('#shadeLaps')).toBeChecked();

    await page.uncheck('#shadeLaps');
    await page.waitForTimeout(200);
    await page.reload();
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data);
    }, { timeout: 20000 });
    await expect(page.locator('#shadeLaps')).not.toBeChecked();

    await page.check('#shadeLaps');
    await page.waitForTimeout(200);
    await page.reload();
    await page.waitForFunction(() => {
      const pd = document.getElementById('plotDiv');
      return pd && Array.isArray(pd.data);
    }, { timeout: 20000 });
    await expect(page.locator('#shadeLaps')).toBeChecked();
  });

  test('with the default single-lap selection, the shaded envelope is visibly wider than the plotted lap', async ({ page }) => {
    await loadMultiLapFile(page);
    await page.waitForTimeout(400);

    const info = await page.evaluate(() => {
      const pd = document.getElementById('plotDiv');
      const minTrace = pd.data.find((t) => (t.name || '').startsWith('Min '));
      const maxTrace = pd.data.find((t) => (t.name || '').startsWith('Max '));
      const plottedTrace = pd.data.find((t) => (t.name || '').includes('Lap') && !(t.name || '').startsWith('Min') && !(t.name || '').startsWith('Max'));
      const flat = (arr) => arr.filter((v) => typeof v === 'number');
      return {
        envelopeMinY: minTrace ? Math.min(...flat(minTrace.y)) : null,
        envelopeMaxY: maxTrace ? Math.max(...flat(maxTrace.y)) : null,
        plottedMinY: plottedTrace ? Math.min(...flat(plottedTrace.y)) : null,
        plottedMaxY: plottedTrace ? Math.max(...flat(plottedTrace.y)) : null,
      };
    });
    expect(info.envelopeMaxY).toBeGreaterThan(info.plottedMaxY);
    expect(info.envelopeMinY).toBeLessThan(info.plottedMinY);
  });
});
