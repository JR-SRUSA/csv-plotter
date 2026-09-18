const { test, expect } = require('@playwright/test');
const { loadSampleFile } = require('./helpers');

// Mobile-only bugs: the drawer's bottom being unreachable, the full-screen note card
// hiding behind the on-screen keyboard, and only one camera being usable.

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

async function openPanel(page, label) {
  const summary = page.locator('summary.collapsible-action-summary', { hasText: label }).first();
  const details = page.locator('details.collapsible-action', { has: summary }).first();
  if (!(await details.evaluate((node) => node.open))) await summary.click();
  return details;
}

async function createSessionForFirstFile(page, name) {
  await page.locator('.file-add-to-session-btn').first().click();
  await page.fill('#addToSessionNewName', name);
  await page.locator('.session-modal-save').click();
  await expect(page.locator('.session-modal-dialog')).toBeHidden();
  return openPanel(page, 'Sessions');
}

async function openFullscreenNoteCard(page) {
  await page.locator('.leaflet-map-fullscreen-btn').click();
  await page.locator('.map-fullscreen-fab').click();
  const mapBox = await page.locator('#leafletMapDiv').boundingBox();
  await page.mouse.click(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
  const card = page.locator('.map-fullscreen-note-card');
  await expect(card).toBeVisible();
  return card;
}

test.describe('mobile: drawer, keyboard and camera', () => {
  test.beforeEach(async ({ page }) => {
    await resetStorage(page);
  });

  test('the mobile menu drawer sizes to the visible (dynamic) viewport and its bottom is reachable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await loadSampleFile(page);
    await page.locator('#controlsToggle').click();
    const controls = page.locator('#controlsPanel');
    await expect(controls).toBeVisible();

    // The drawer must be exactly the visible height (100dvh), not the larger 100vh that
    // hides its bottom behind mobile browser chrome.
    const sizes = await controls.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      inner: window.innerHeight,
      overflowY: getComputedStyle(el).overflowY
    }));
    expect(Math.abs(sizes.height - sizes.inner)).toBeLessThanOrEqual(1);
    expect(sizes.overflowY).toBe('auto');

    // Scrolling to the end brings the version label (the very last item) fully on screen.
    await controls.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    const label = page.locator('#appVersionLabel');
    const box = await label.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y + box.height).toBeLessThanOrEqual(700);
  });

  test('the full-screen note card lifts above the on-screen keyboard and drops back when it closes', async ({ page }) => {
    // Headless Chromium has no software keyboard, so stand in for visualViewport: the
    // card only cares about height/offsetTop and resize/scroll events.
    await page.addInitScript(() => {
      const fake = new EventTarget();
      fake.height = window.innerHeight;
      fake.offsetTop = 0;
      Object.defineProperty(window, 'visualViewport', { value: fake, configurable: true });
    });
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Keyboard Session');
    const card = await openFullscreenNoteCard(page);

    const bottomBefore = await card.evaluate((el) => parseFloat(el.style.bottom));
    expect(bottomBefore).toBe(92);

    // Keyboard opens and covers the bottom 300px.
    await page.evaluate(() => {
      window.visualViewport.height = window.innerHeight - 300;
      window.visualViewport.dispatchEvent(new Event('resize'));
    });
    await expect.poll(() => card.evaluate((el) => parseFloat(el.style.bottom))).toBe(312);
    // ...and the card's bottom edge is above the keyboard, i.e. still on screen.
    const rect = await card.evaluate((el) => el.getBoundingClientRect().bottom);
    const innerHeight = await page.evaluate(() => window.innerHeight);
    expect(rect).toBeLessThanOrEqual(innerHeight - 300);

    // Keyboard closes.
    await page.evaluate(() => {
      window.visualViewport.height = window.innerHeight;
      window.visualViewport.dispatchEvent(new Event('resize'));
    });
    await expect.poll(() => card.evaluate((el) => parseFloat(el.style.bottom))).toBe(92);
  });

  test('Take Photo asks for the rear camera, and Switch Camera only appears with more than one camera', async ({ page }) => {
    await page.addInitScript(() => {
      window.__cameraRequests = [];
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      // The single fake device honours the default (ideal) request; an "exact" request for
      // a specific facing mode is what Switch Camera sends, which it can't satisfy.
      navigator.mediaDevices.getUserMedia = (constraints) => {
        window.__cameraRequests.push(JSON.parse(JSON.stringify(constraints)));
        const facing = constraints && constraints.video && constraints.video.facingMode;
        return facing && facing.exact
          ? Promise.reject(new DOMException('no such camera', 'OverconstrainedError'))
          : original(constraints);
      };
    });
    await loadSampleFile(page);
    await createSessionForFirstFile(page, 'Camera Session');

    // One camera: no Switch button.
    const card = await openFullscreenNoteCard(page);
    await card.locator('.session-note-photo-btn').click();
    const overlay = page.locator('.session-capture-overlay');
    await expect(overlay).toBeVisible();
    const firstRequest = await page.evaluate(() => window.__cameraRequests[0]);
    expect(firstRequest.video.facingMode).toEqual({ ideal: 'environment' });
    await expect(overlay.locator('.session-capture-switch')).toBeHidden();
    await overlay.locator('.session-capture-cancel').click();
    await expect(overlay).toHaveCount(0);

    // Two cameras reported: Switch appears and asks for the other facing mode.
    await page.evaluate(() => {
      const realEnumerate = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
      navigator.mediaDevices.enumerateDevices = async () => (
        (await realEnumerate()).concat([{ kind: 'videoinput', deviceId: 'rear', label: 'Rear' }])
      );
      window.__cameraRequests.length = 0;
    });
    await card.locator('.session-note-photo-btn').click();
    await expect(overlay).toBeVisible();
    const switchBtn = overlay.locator('.session-capture-switch');
    await expect(switchBtn).toBeVisible();
    await switchBtn.click();
    await expect.poll(() => page.evaluate(() => window.__cameraRequests.length)).toBeGreaterThan(1);
    const switchRequest = await page.evaluate(() => window.__cameraRequests[1]);
    expect(Object.keys(switchRequest.video.facingMode)).toEqual(['exact']);
    // A failed switch (only one real device here) leaves the working preview in place.
    await expect(overlay).toBeVisible();
    await overlay.locator('.session-capture-cancel').click();
  });
});

test.describe('mobile: layout after resizing from desktop', () => {
  test('shrinking from desktop to mobile width does not leave the closed drawer in the page flow', async ({ page }) => {
    // Load at desktop width first: resize-panels.js sets inline position:relative on the
    // sidebar there, and used to leave it behind on the way down to mobile width.
    await loadSampleFile(page);
    await page.setViewportSize({ width: 412, height: 915 });

    const controls = page.locator('#controlsPanel');
    await expect.poll(() => controls.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');

    const tops = await page.evaluate(() => ({
      header: document.querySelector('header').getBoundingClientRect().bottom,
      map: document.getElementById('leafletMapDiv').getBoundingClientRect().top
    }));
    // The map sits right under the header, not below a drawer-sized gap.
    expect(tops.map - tops.header).toBeLessThan(40);

    // Growing back to desktop restores the resizable sidebar.
    await page.setViewportSize({ width: 1400, height: 1000 });
    await expect.poll(() => controls.evaluate((el) => getComputedStyle(el).position)).toBe('relative');
  });
});
