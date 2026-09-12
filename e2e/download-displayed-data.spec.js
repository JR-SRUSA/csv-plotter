// Covers the "Download Displayed Data as CSV" button: it re-derives a CSV from whatever
// is currently plotted (see buildDisplayedDataCsv/triggerCsvDownload in app.js) rather than
// re-reading the original file, so this is a real end-to-end check that the browser download
// APIs (Blob/URL.createObjectURL/anchor click) are wired up and produce the expected content.
const { test, expect } = require('@playwright/test');
const { loadSampleFile, selectYChannels } = require('./helpers');

test.describe('download displayed data as CSV', () => {
  test('clicking the button downloads a CSV of the currently plotted channel', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#downloadDisplayedDataBtn'),
    ]);

    expect(download.suggestedFilename()).toMatch(/^displayed-data-.*\.csv$/);

    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const csv = Buffer.concat(chunks).toString('utf8');

    const lines = csv.split(/\r\n/).filter(Boolean);
    const headerLine = lines.find(l => l.startsWith('File,Lap,'));
    expect(headerLine).toBeTruthy();
    expect(headerLine).toContain('Speed');

    // Metadata lines plus header should leave at least one actual data row.
    expect(lines.length).toBeGreaterThan(lines.indexOf(headerLine) + 1);
  });
});
