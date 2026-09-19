const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

// Covers the "Fit Racing Line" simplification: the old manual weight-tuning/corner-nav/
// accept-discard UI is gone entirely, and "Simulate Vehicle" now fits the racing line
// (fixed default weights) and simulates on it in one click. Also covers being able to
// attach the resulting simulated lap to a session, which requires it to be persisted as
// a stored file first since it was never "uploaded" (see persistSyntheticLogForSession).

async function resetStorage(page) {
  await page.goto('/sample_data_files/');
  await page.evaluate(async () => {
    localStorage.clear();
    const drop = (name) => new Promise((resolve) => {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
    await drop('csvPlotterFiles');
    await drop('motorsports_app_v1');
  });
  // "Simulate Vehicle" lives behind a locked panel (7 clicks on the version label) --
  // the flag persists across the same-origin navigation loadSampleFile does next.
  await page.evaluate(() => localStorage.setItem('uiFlag7', '1'));
}

async function openPanel(page, label) {
  const summary = page.locator('summary.collapsible-action-summary', { hasText: label }).first();
  const details = page.locator('details.collapsible-action', { has: summary }).first();
  if (!(await details.evaluate((node) => node.open))) await summary.click();
  return details;
}

test.describe('vehicle simulation: fit-and-simulate in one click, and adding the result to a session', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('the old manual racing-line-fit controls no longer exist', async ({ page }) => {
    await loadSampleFile(page);
    await expect(page.locator('#fitRacingLineBtn')).toHaveCount(0);
    await expect(page.locator('#racingLineWholeCircuitPanel')).toHaveCount(0);
    await expect(page.locator('#racingLineBetaWeight')).toHaveCount(0);
    await expect(page.locator('#racingLineAlphaWeight')).toHaveCount(0);
    await expect(page.locator('#racingLineGammaWeight')).toHaveCount(0);
    await expect(page.locator('#racingLineWholeCircuitAcceptBtn')).toHaveCount(0);
    await expect(page.locator('#racingLineWholeCircuitDiscardBtn')).toHaveCount(0);
    await expect(page.locator('#racingLineWholeCircuitPrevCornerBtn')).toHaveCount(0);
    await expect(page.locator('#racingLineWholeCircuitNextCornerBtn')).toHaveCount(0);
    // "Simulate Vehicle" itself is still there, unaffected.
    await expect(page.locator('#vehicleSimulateBtn')).toBeVisible();
  });

  test('Simulate Vehicle fits the racing line and simulates it in a single click', async ({ page }) => {
    await loadSampleFile(page);
    await openPanel(page, 'Simulate Vehicle');
    await page.locator('#vehicleSimulateBtn').click();

    await expect.poll(
      () => page.locator('#vehicleSimStatus').innerText(),
      { timeout: 15000 }
    ).toMatch(/Simulated lap time:/);

    // A single synthetic "Racing Line -- ..." lap was created (fit + simulate both ran
    // from the one click), with real Speed/LatAcc/LongAcc data on it -- not just the
    // bare PosX/PosY/Curvature/Radius a fit-only step would have produced.
    const racingLineLog = await page.evaluate(() => {
      const win = window;
      // app.js's `logs` array isn't exposed globally, so read it back off the plot's
      // own selectable Y channels / files list instead -- more end-to-end anyway.
      const rows = Array.from(document.querySelectorAll('#filesList .file-item'))
        .map((el) => el.textContent || '');
      return rows.find((t) => t.includes('Racing Line') || t.includes('Sim —'));
    });
    expect(racingLineLog).toBeTruthy();

    const ySelectValues = await page.evaluate(() => Array.from(document.getElementById('ySelect').options).map((o) => o.value));
    expect(ySelectValues).toContain('Speed');
  });

  test('Simulate Vehicle reports a failure state without throwing when there is nothing to fit', async ({ page }) => {
    await page.goto('/sample_data_files/');
    await page.evaluate(async () => {
      localStorage.clear();
      localStorage.setItem('uiFlag7', '1');
    });
    await page.goto('/index.html');
    await openPanel(page, 'Simulate Vehicle');
    await page.locator('#vehicleSimulateBtn').click();
    await expect(page.locator('#vehicleSimStatus')).toHaveText(/Select at least one lap with map data/);
  });

  test('toggling Include Elevation/Altitude Effect re-simulates immediately without clicking Simulate Vehicle again', async ({ page }) => {
    await loadSampleFile(page);
    await openPanel(page, 'Simulate Vehicle');
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(
      () => page.locator('#vehicleSimStatus').innerText(),
      { timeout: 15000 }
    ).toMatch(/Simulated lap time:/);

    // This checkbox sits low enough in the controls sidebar that Playwright's own
    // actionability check never considers it "visible" for a real click/uncheck (a
    // pre-existing layout quirk, reproducible even before ever touching Simulate
    // Vehicle -- unrelated to this feature). Dispatching the change event directly
    // still exercises the real listener in app.js.
    await page.evaluate(() => {
      const cb = document.getElementById('vehicleSimUseElevation');
      cb.checked = false;
      cb.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect.poll(
      () => page.locator('#vehicleSimStatus').innerText(),
      { timeout: 15000 }
    ).toContain('Elevation/altitude effect disabled');
  });

  test('the simulated lap can be attached to a session (it is persisted as a stored file first)', async ({ page }) => {
    await loadSampleFile(page);
    await openPanel(page, 'Simulate Vehicle');
    await page.locator('#vehicleSimulateBtn').click();
    await expect.poll(
      () => page.locator('#vehicleSimStatus').innerText(),
      { timeout: 15000 }
    ).toMatch(/Simulated lap time:/);

    // The racing-line lap gets the same generic "Add to Session" button every file row
    // does -- it's the LAST row (added after the real uploaded file).
    const addButtons = page.locator('.file-add-to-session-btn');
    await expect(addButtons).toHaveCount(2);
    await addButtons.last().click();

    const dialog = page.locator('.session-modal-dialog');
    await expect(dialog).toBeVisible();
    await page.fill('#addToSessionNewName', 'Sim Session');
    await page.locator('.session-modal-save').click();
    await expect(dialog).toBeHidden();

    const state = await page.evaluate(async () => {
      const api = window.SessionsServices.createServices();
      const sessions = await api.SessionService.listSessions();
      const detail = await api.SessionService.getSessionDetail(sessions[0].id);
      return { fileCount: detail.files.length, fileName: detail.files[0].name };
    });
    expect(state.fileCount).toBe(1);
    expect(state.fileName).toContain('Sim —');
  });
});
