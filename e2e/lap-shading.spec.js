// Covers "Shaded area between all laps" (shadeLaps checkbox, the envelope-building block in
// updatePlot()): it's meant to show the full range the rider has been performing in across
// every lap of a file (minus in/out laps, via the shared getInOutLapNumbers), not just an
// envelope of whichever laps currently happen to be checked/plotted -- so a single displayed
// lap can be visually compared against the broader range.
const { test, expect } = require('@playwright/test');
const path = require('path');

test('the shaded envelope spans every lap (minus in/out), independent of which laps are checked', async ({ page }) => {
  await page.goto('/index.html');
  await page.setInputFiles('#fileInput', path.join(__dirname, '..', 'sample_data_files', 'JohnWeraPittRace_YamahaR3.csv'));
  await page.waitForFunction(() => {
    const pd = document.getElementById('plotDiv');
    return pd && Array.isArray(pd.data) && pd.data.length > 0;
  }, { timeout: 20000 });

  await page.click('button[data-lap-select-none]');
  await page.waitForTimeout(200);
  const checkboxes = page.locator('.file-lap-group input[type=checkbox]');
  const totalLaps = await checkboxes.count();
  expect(totalLaps).toBeGreaterThan(3);
  // A middle lap (not the first/last, which are excluded from the envelope as in/out laps).
  await checkboxes.nth(2).check();
  await page.waitForTimeout(300);

  await page.check('#shadeLaps');
  await page.waitForTimeout(500);

  const envelope = await page.evaluate(() => {
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

  // The envelope reflects every non-in/out lap, so it must be at least as wide as (and here,
  // given real corner-speed variance across 6 middle laps, strictly wider than) the single
  // displayed lap -- proving it isn't just re-deriving an envelope from the checked lap(s).
  expect(envelope.envelopeMaxY).toBeGreaterThan(envelope.plottedMaxY);
  expect(envelope.envelopeMinY).toBeLessThan(envelope.plottedMinY);

  // Re-checking every lap must not change the envelope at all (still ignores checked state).
  await page.click('button[data-lap-select-all]');
  await page.waitForTimeout(400);
  const envelopeAfterCheckAll = await page.evaluate(() => {
    const pd = document.getElementById('plotDiv');
    const minTrace = pd.data.find((t) => (t.name || '').startsWith('Min '));
    const maxTrace = pd.data.find((t) => (t.name || '').startsWith('Max '));
    const flat = (arr) => arr.filter((v) => typeof v === 'number');
    return {
      envelopeMinY: Math.min(...flat(minTrace.y)),
      envelopeMaxY: Math.max(...flat(maxTrace.y)),
    };
  });
  expect(envelopeAfterCheckAll.envelopeMinY).toBeCloseTo(envelope.envelopeMinY, 5);
  expect(envelopeAfterCheckAll.envelopeMaxY).toBeCloseTo(envelope.envelopeMaxY, 5);
});
