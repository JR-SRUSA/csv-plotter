const { test, expect } = require('@playwright/test');
const path = require('path');
const { loadSampleFile } = require('./helpers');

const SAMPLE = path.join(__dirname, '..', 'sample_data_files', 'logdata_jr.csv');

// Expands one of the collapsible control sections by its label (same helper other specs use).
async function openPanel(page, label) {
  const summary = page.locator('summary.collapsible-action-summary', { hasText: label }).first();
  const details = page.locator('details.collapsible-action', { has: summary }).first();
  if (!(await details.evaluate((node) => node.open))) await summary.click();
  return details;
}

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
}

// Stubs navigator.storage.persisted/persist/estimate before any page script runs, so
// app.js's own calls to them see fixed, scriptable answers instead of the real (and, in
// a CI/headless browser, unpredictable) implementation.
async function stubStorageApi(page, { persisted, persistResult, usage, missing } = {}) {
  await page.addInitScript(({ persisted, persistResult, usage, missing }) => {
    if (missing) {
      Object.defineProperty(navigator, 'storage', { value: undefined, configurable: true });
      return;
    }
    let isPersisted = !!persisted;
    window.__persistCalls = 0;
    const fake = {
      persisted: () => Promise.resolve(isPersisted),
      persist: () => {
        window.__persistCalls++;
        if (persistResult) isPersisted = true;
        return Promise.resolve(!!persistResult);
      },
      estimate: () => Promise.resolve({ usage: usage == null ? 12345 : usage, quota: 1e9 })
    };
    Object.defineProperty(navigator, 'storage', { value: fake, configurable: true });
  }, { persisted, persistResult, usage, missing });
}

test.describe('Persistent storage request', () => {
  test('already granted: status says so and the button is hidden', async ({ page }) => {
    await resetStorage(page);
    await stubStorageApi(page, { persisted: true });
    await page.goto('/index.html');
    await openPanel(page, 'User');
    const status = page.locator('#storagePersistStatus');
    await expect(status).toContainText('Permanent storage: granted');
    await expect(status).toContainText('12 KB used');
    await expect(page.locator('#requestPersistBtn')).toBeHidden();
  });

  test('not granted: status explains it, the button is visible, and clicking it requests persistence', async ({ page }) => {
    await resetStorage(page);
    await stubStorageApi(page, { persisted: false, persistResult: false });
    await page.goto('/index.html');
    await openPanel(page, 'User');
    const status = page.locator('#storagePersistStatus');
    const btn = page.locator('#requestPersistBtn');
    await expect(status).toContainText('Permanent storage: not granted');
    await expect(status).toContainText('Download All Data');
    await expect(btn).toBeVisible();

    await btn.click();
    await expect(status).toContainText('The browser declined the request');
    expect(await page.evaluate(() => window.__persistCalls)).toBe(1);
    await expect(btn).toBeVisible(); // still not granted
  });

  test('clicking the button when the browser grants it updates the status and hides the button', async ({ page }) => {
    await resetStorage(page);
    await stubStorageApi(page, { persisted: false, persistResult: true });
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await page.locator('#requestPersistBtn').click();
    await expect(page.locator('#storagePersistStatus')).toContainText('Permanent storage: granted');
    await expect(page.locator('#requestPersistBtn')).toBeHidden();
  });

  test('API not supported: says so, and the button stays hidden', async ({ page }) => {
    await resetStorage(page);
    await stubStorageApi(page, { missing: true });
    await page.goto('/index.html');
    await openPanel(page, 'User');
    await expect(page.locator('#storagePersistStatus')).toContainText('not supported in this browser');
    await expect(page.locator('#requestPersistBtn')).toBeHidden();
  });

  test('loading the first file auto-requests persistence once, and does not repeat on reload', async ({ page }) => {
    await resetStorage(page);
    await stubStorageApi(page, { persisted: false, persistResult: false });
    await loadSampleFile(page, SAMPLE);
    await expect.poll(() => page.evaluate(() => window.__persistCalls)).toBe(1);

    expect(await page.evaluate(() => localStorage.getItem('storagePersistAsked'))).toBe('1');

    // addInitScript re-runs on the reload, giving a fresh stub (__persistCalls back to 0);
    // localStorage (and therefore the "already asked" flag) survives the reload, same origin.
    await page.reload();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__persistCalls)).toBe(0);

    // Loading the file again after reload does not trigger a second auto-request.
    await page.setInputFiles('#fileInput', SAMPLE);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__persistCalls)).toBe(0);
  });
});
