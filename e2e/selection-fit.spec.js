// Covers the "select data on the plot to see min/max, best-fit slope and R²" feature
// (GitHub issue #52): the always-visible Box/Lasso Select modebar buttons, the
// selection-fit stats panel + best-fit line, and the panel's drag-to-reposition handle.
const { test, expect } = require('@playwright/test');
const {
  loadSampleFile,
  selectYChannels,
  getPlotGeometry,
  dragSelection,
  clickModebarButton,
  getTraceModes,
} = require('./helpers');

test.describe('Box/Lasso Select modebar buttons', () => {
  test('are visible before any selection is made, with no extra custom button', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);

    const titles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.modebar-btn')).map((b) => b.getAttribute('data-title'))
    );
    expect(titles).toContain('Box Select');
    expect(titles).toContain('Lasso Select');
    // Regression: an earlier version of this feature added a standalone "Select Data"
    // toggle button outside the modebar; selection is now driven entirely by the modebar.
    expect(await page.locator('#selectDataToggleBtn').count()).toBe(0);
  });

  test('do not duplicate once channel traces become selectable (markers added)', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await clickModebarButton(page, 'Box Select');

    const titles = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.modebar-btn')).map((b) => b.getAttribute('data-title'))
    );
    expect(titles.filter((t) => t === 'Box Select')).toHaveLength(1);
    expect(titles.filter((t) => t === 'Lasso Select')).toHaveLength(1);
  });

  test('clicking Box Select enables selectable markers and highlights the button', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);

    expect(await getTraceModes(page)).toEqual(['lines']);

    await clickModebarButton(page, 'Box Select');

    expect(await getTraceModes(page)).toEqual(['lines+markers']);
    const btnClass = await page.locator('.modebar-btn[data-title="Box Select"]').getAttribute('class');
    expect(btnClass).toContain('active');
    expect(await page.evaluate(() => document.getElementById('plotDiv')._fullLayout.dragmode)).toBe('select');
  });

  test('clicking Lasso Select also enables markers, with dragmode "lasso"', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);

    await clickModebarButton(page, 'Lasso Select');

    expect(await getTraceModes(page)).toEqual(['lines+markers']);
    expect(await page.evaluate(() => document.getElementById('plotDiv')._fullLayout.dragmode)).toBe('lasso');
  });

  test('switching to Zoom strips markers back off and clears any selection', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);
    await expect(page.locator('#selectionStatsPanel')).toBeVisible();

    await clickModebarButton(page, 'Zoom');

    expect(await getTraceModes(page)).toEqual(['lines']);
    await expect(page.locator('#selectionStatsPanel')).toBeHidden();
  });
});

test.describe('selection fit stats panel', () => {
  test('shows per-channel min/max, slope and R², and draws a black fit line per axis', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await loadSampleFile(page);
    // Speed and LatAcc render on different y-axes -- exercises independent per-trace fits.
    await selectYChannels(page, ['Speed', 'LatAcc']);
    await clickModebarButton(page, 'Box Select');

    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);

    const panel = page.locator('#selectionStatsPanel');
    await expect(panel).toBeVisible();
    const groups = page.locator('.selection-stats-group');
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toContainText('Speed');
    await expect(groups.nth(0)).toContainText('slope:');
    await expect(groups.nth(0)).toContainText('R²:');
    await expect(groups.nth(1)).toContainText('LatAcc');

    const shapes = await page.evaluate(() => document.getElementById('plotDiv').layout.shapes || []);
    const fitLines = shapes.filter((s) => s.type === 'line' && s.line && s.line.color === 'black');
    expect(fitLines).toHaveLength(2);
    // One fit line per axis (Speed's primary y axis, LatAcc's secondary axis).
    expect(new Set(fitLines.map((s) => s.yref)).size).toBe(2);

    expect(pageErrors).toEqual([]);
  });

  test('closing the panel clears the fit line but leaves select mode active', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);
    await expect(page.locator('#selectionStatsPanel')).toBeVisible();

    await page.click('#selectionStatsClose');

    await expect(page.locator('#selectionStatsPanel')).toBeHidden();
    expect(await getTraceModes(page)).toEqual(['lines+markers']); // still selectable
    const btnClass = await page.locator('.modebar-btn[data-title="Box Select"]').getAttribute('class');
    expect(btnClass).toContain('active');
  });

  test('double-clicking the plot deselects and clears the panel', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);
    await expect(page.locator('#selectionStatsPanel')).toBeVisible();

    await page.mouse.dblclick(geom.left + geom.width / 2, geom.top + geom.height / 2);
    await page.waitForTimeout(400);

    await expect(page.locator('#selectionStatsPanel')).toBeHidden();
  });

  test('can be repositioned by dragging its header', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);
    await clickModebarButton(page, 'Box Select');
    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.05, 0.05, 0.95, 0.95);
    await expect(page.locator('#selectionStatsPanel')).toBeVisible();

    const before = await page.locator('#selectionStatsPanel').boundingBox();
    const header = page.locator('#selectionStatsHeader');
    const headerBox = await header.boundingBox();
    const start = { x: headerBox.x + headerBox.width / 2, y: headerBox.y + headerBox.height / 2 };
    const dx = -150, dy = 250;

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + dx, start.y + dy, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const after = await page.locator('#selectionStatsPanel').boundingBox();
    expect(after.x).toBeCloseTo(before.x + dx, 0);
    expect(after.y).toBeCloseTo(before.y + dy, 0);
  });
});

test.describe('large selections (regression)', () => {
  // A single unsplit/long session can put well over 65,536 points in one trace. An
  // earlier version of this feature used `Math.min(...array)` (spread syntax) to find
  // selection bounds, which throws "Maximum call stack size exceeded" past that count --
  // this reproduces it directly against a synthetic 100k-point trace.
  //
  // Known limitation: enabling the (invisible) selection markers on a trace this large is
  // itself a real, multi-second cost -- Plotly recalculates every point regardless of
  // marker visibility -- so this test waits generously rather than asserting on speed.
  test('a 100k-point selection computes stats without crashing', async ({ page }) => {
    test.setTimeout(90000);
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);

    const N = 100000;
    await page.evaluate((n) => {
      const pd = document.getElementById('plotDiv');
      const x = new Array(n), y = new Array(n);
      for (let i = 0; i < n; i++) { x[i] = i * 0.01; y[i] = Math.sin(i / 500) * 50 + 50; }
      Plotly.restyle(pd, { x: [x], y: [y] }, [0]);
    }, N);
    await page.waitForFunction((n) => document.getElementById('plotDiv').data[0].x.length === n, N);

    await clickModebarButton(page, 'Box Select');
    await page.waitForFunction(
      () => document.getElementById('plotDiv').data[0].mode === 'lines+markers',
      { timeout: 60000 }
    );

    const geom = await getPlotGeometry(page);
    await dragSelection(page, geom, 0.02, 0.02, 0.98, 0.98);

    await expect(page.locator('.selection-stats-group')).toContainText(`n = ${N} pts`);
    expect(pageErrors).toEqual([]);

    // Adjusting the bounds with further drags is the realistic repro for "the panel
    // doesn't update" that surfaced alongside the crash -- each drag should still update.
    await dragSelection(page, geom, 0.1, 0.1, 0.5, 0.5);
    await expect(page.locator('.selection-stats-group')).not.toContainText(`n = ${N} pts`);
    expect(pageErrors).toEqual([]);
  });
});
