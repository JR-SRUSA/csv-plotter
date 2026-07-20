const path = require('path');

const SAMPLE_FILE = path.join(__dirname, '..', 'sample_data_files', 'logdata.csv');

// Loads the sample CSV and waits for the main plot to have at least one trace.
async function loadSampleFile(page, filePath = SAMPLE_FILE) {
  await page.goto('/index.html');
  await page.setInputFiles('#fileInput', filePath);
  await page.waitForFunction(() => {
    const pd = document.getElementById('plotDiv');
    return pd && Array.isArray(pd.data) && pd.data.length > 0;
  }, { timeout: 20000 });
}

// Selects the given Y channels in the multi-select (by option value) and waits for the
// resulting re-render.
async function selectYChannels(page, channelNames) {
  await page.evaluate((names) => {
    const sel = document.getElementById('ySelect');
    for (const o of sel.options) o.selected = names.includes(o.value);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }, channelNames);
  await page.waitForTimeout(500);
}

// Returns the main plot's xaxis/yaxis pixel geometry (offset + length) relative to the
// page, used to translate fractional plot-area coordinates into real mouse positions.
async function getPlotGeometry(page) {
  const gdRect = await page.evaluate(() => document.getElementById('plotDiv').getBoundingClientRect());
  const axis = await page.evaluate(() => {
    const pd = document.getElementById('plotDiv');
    const xa = pd._fullLayout.xaxis, ya = pd._fullLayout.yaxis;
    return { xo: xa._offset, xl: xa._length, yo: ya._offset, yl: ya._length };
  });
  return {
    left: gdRect.left + axis.xo,
    top: gdRect.top + axis.yo,
    width: axis.xl,
    height: axis.yl,
  };
}

// Drags a box/lasso selection across the main plot, expressed as fractions (0-1) of the
// plot's data area, so the same test works regardless of exact pixel layout.
async function dragSelection(page, geom, fx0, fy0, fx1, fy1) {
  const x0 = geom.left + geom.width * fx0;
  const y0 = geom.top + geom.height * fy0;
  const x1 = geom.left + geom.width * fx1;
  const y1 = geom.top + geom.height * fy1;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  await page.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 5 });
  await page.mouse.move(x1, y1, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(400);
}

async function clickModebarButton(page, title) {
  await page.click(`.modebar-btn[data-title="${title}"]`);
  await page.waitForTimeout(300);
}

async function getTraceModes(page) {
  return page.evaluate(() => document.getElementById('plotDiv').data.map((t) => t.mode));
}

module.exports = {
  SAMPLE_FILE,
  loadSampleFile,
  selectYChannels,
  getPlotGeometry,
  dragSelection,
  clickModebarButton,
  getTraceModes,
};
