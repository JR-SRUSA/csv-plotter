const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

// The "Pick Uploaded Data" list used to have a delete (✕) button right beside Load, which
// was too easy to hit by accident. Deleting a stored file now lives only under User data.

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

test.describe('stored file deletion', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('the Pick Uploaded Data list has Load but no delete button', async ({ page }) => {
    await loadSampleFile(page);
    await page.click('#pickUploadedDataBtn');
    await page.click('.pick-uploaded-tab[data-pick-tab="files"]');

    const items = page.locator('#pickUploadedList .pick-uploaded-item');
    await expect(items).toHaveCount(1);
    await expect(items.first().locator('.pick-uploaded-item-load-btn')).toBeVisible();
    await expect(items.first().locator('button')).toHaveCount(1);
  });

  async function openUserPanel(page) {
    const summary = page.locator('summary.collapsible-action-summary', { hasText: 'User' }).first();
    const details = page.locator('details.collapsible-action', { has: summary }).first();
    if (!(await details.evaluate((node) => node.open))) await summary.click();
  }

  test('the User data list has no Load button (loading lives in Pick Uploaded Data)', async ({ page }) => {
    await loadSampleFile(page);
    await openUserPanel(page);
    const row = page.locator('#storedFilesList .stored-file-row');
    await expect(row).toHaveCount(1);
    await expect(row.locator('button')).toHaveCount(1);
    await expect(row.locator('.stored-file-remove-btn')).toBeVisible();
  });

  test('removing a stored file asks first: cancelling keeps it, accepting deletes it', async ({ page }) => {
    await loadSampleFile(page);
    await openUserPanel(page);
    const remove = page.locator('#storedFilesList .stored-file-remove-btn');
    await expect(remove).toHaveCount(1);

    // Cancel: nothing is deleted, and the dialog names the file and warns about sessions.
    let message = '';
    page.once('dialog', (dialog) => { message = dialog.message(); dialog.dismiss(); });
    await remove.click();
    await expect.poll(() => message).toContain('logdata.csv');
    expect(message).toContain('sessions');
    await expect(page.locator('#storedFilesList .stored-file-remove-btn')).toHaveCount(1);
    await expect(page.locator('#storedFilesStatus')).not.toContainText('Removed');

    // Accept: now it is actually deleted.
    page.once('dialog', (dialog) => dialog.accept());
    await remove.click();
    await expect(page.locator('#storedFilesList .stored-file-remove-btn')).toHaveCount(0);
    await expect(page.locator('#storedFilesStatus')).toContainText('Removed');
  });
});
