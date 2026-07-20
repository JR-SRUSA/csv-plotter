// Covers the dark/light mode toggle in the sidebar: default theme, the toggle button's
// own state, persistence across reloads, and re-theming the Plotly chart (which renders
// into its own SVG and can't pick up CSS variables, so it needs its colors pushed in by
// hand whenever the theme changes).
const { test, expect } = require('@playwright/test');
const { loadSampleFile, selectYChannels } = require('./helpers');

test.describe('dark/light mode toggle', () => {
  test('defaults to light mode with no stored preference', async ({ page }) => {
    await page.goto('/index.html');
    expect(await page.getAttribute('html', 'data-theme')).toBe('light');
    await expect(page.locator('#themeToggleLabel')).toHaveText('Dark Mode');
    expect(await page.locator('#themeToggleBtn').getAttribute('aria-checked')).toBe('false');
  });

  test('clicking the toggle switches to dark mode and updates the button', async ({ page }) => {
    await page.goto('/index.html');

    await page.click('#themeToggleBtn');

    expect(await page.getAttribute('html', 'data-theme')).toBe('dark');
    await expect(page.locator('#themeToggleLabel')).toHaveText('Light Mode');
    expect(await page.locator('#themeToggleBtn').getAttribute('aria-checked')).toBe('true');
    // body has a 150ms background-color transition for a smoother toggle -- wait for it to
    // settle so this doesn't sometimes catch an interpolated in-between color.
    await page.waitForTimeout(250);
    // Actual rendered color, not just the attribute -- confirms the CSS variables resolved.
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe('rgb(15, 21, 32)');
  });

  test('clicking twice returns to light mode', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('#themeToggleBtn');
    await page.click('#themeToggleBtn');
    expect(await page.getAttribute('html', 'data-theme')).toBe('light');
    await expect(page.locator('#themeToggleLabel')).toHaveText('Dark Mode');
  });

  test('persists the chosen theme across a reload, with no flash of the wrong theme', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('#themeToggleBtn');
    expect(await page.evaluate(() => localStorage.getItem('csvPlotterTheme'))).toBe('dark');

    await page.reload();

    // The anti-flash script in <head> sets data-theme synchronously before first paint --
    // asserting immediately after navigation (not after some settle delay) is the point.
    expect(await page.getAttribute('html', 'data-theme')).toBe('dark');
    await expect(page.locator('#themeToggleLabel')).toHaveText('Light Mode');
  });

  test('re-themes the Plotly chart background when toggled', async ({ page }) => {
    await loadSampleFile(page);
    await selectYChannels(page, ['Speed']);

    const bgLight = await page.evaluate(() => document.getElementById('plotDiv')._fullLayout.paper_bgcolor);
    expect(bgLight.toLowerCase()).toBe('#ffffff');

    await page.click('#themeToggleBtn');
    await page.waitForTimeout(300);

    const bgDark = await page.evaluate(() => document.getElementById('plotDiv')._fullLayout.paper_bgcolor);
    expect(bgDark.toLowerCase()).toBe('#1a222c');
  });
});
