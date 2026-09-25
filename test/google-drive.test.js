const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// google-drive.js is a browser IIFE. It only touches `google`/`gapi`/`fetch` inside functions
// that aren't called at load time, so a bare sandbox (plus the couple of Node-provided web
// globals the pure helper under test needs) is enough -- see racing-line-engine.test.js for
// the same pattern.
const sandbox = { window: {}, Blob };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'google-drive.js'), 'utf8'),
  sandbox
);
const gdrive = sandbox.window.GoogleDriveIntegration;

test('module loads inertly with no google/gapi globals present (the offline/ESP32 case)', () => {
  assert.equal(typeof gdrive.isApiLoaded, 'function');
  assert.equal(gdrive.isApiLoaded(), false);
  assert.equal(typeof gdrive.isConfigured(), 'boolean');
});

test('_buildMultipartUploadBody wraps metadata JSON and blob content under one boundary', async () => {
  const boundary = 'csvplotter-test-boundary';
  const metadata = { name: 'csv-plotter-backup.zip', parents: ['folder123'] };
  const blob = new Blob(['zip-bytes-go-here'], { type: 'application/zip' });

  const body = gdrive._buildMultipartUploadBody(metadata, blob, boundary);
  assert.equal(body.type, `multipart/related; boundary=${boundary}`);

  const text = await body.text();
  assert.ok(
    text.includes(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`),
    'includes the metadata part as JSON, after the opening boundary'
  );
  assert.ok(
    text.includes(`--${boundary}\r\nContent-Type: application/zip\r\n\r\nzip-bytes-go-here`),
    'includes the content part with the blob\'s own content-type'
  );
  assert.ok(text.endsWith(`--${boundary}--`), 'ends with the closing boundary');
});

test('_buildMultipartUploadBody falls back to application/octet-stream when the blob has no type', async () => {
  const boundary = 'b2';
  const blob = new Blob(['plain bytes']);
  const body = gdrive._buildMultipartUploadBody({ name: 'x' }, blob, boundary);
  const text = await body.text();
  assert.ok(text.includes('Content-Type: application/octet-stream\r\n\r\nplain bytes'));
});

// ── Token persistence (sessionStorage) ──────────────────────────────────────────────────
// restorePersistedToken() runs once, synchronously, at module load -- so a fresh sandbox per
// case (with sessionStorage pre-seeded before the script runs) exercises it directly, without
// needing a real OAuth flow or a browser at all.
const TOKEN_KEY = 'csvPlotterGoogleDriveToken';

function loadWithSessionStorage(initialData) {
  const store = Object.assign({}, initialData);
  const sessionStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };
  const freshSandbox = { window: {}, Blob, sessionStorage };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, '..', 'google-drive.js'), 'utf8'),
    freshSandbox
  );
  return { gdrive: freshSandbox.window.GoogleDriveIntegration, store };
}

test('a valid persisted token in sessionStorage restores as signed-in on load', () => {
  const { gdrive: restored } = loadWithSessionStorage({
    [TOKEN_KEY]: JSON.stringify({ accessToken: 'tok-123', expiresAt: Date.now() + 60000 })
  });
  assert.equal(restored.isSignedIn(), true);
});

test('an expired persisted token is not restored, and the stale entry is cleared', () => {
  const { gdrive: restored, store } = loadWithSessionStorage({
    [TOKEN_KEY]: JSON.stringify({ accessToken: 'tok-123', expiresAt: Date.now() - 1000 })
  });
  assert.equal(restored.isSignedIn(), false);
  assert.equal(store[TOKEN_KEY], undefined);
});

test('malformed persisted JSON is ignored rather than thrown', () => {
  const { gdrive: restored } = loadWithSessionStorage({ [TOKEN_KEY]: 'not-json{{{' });
  assert.equal(restored.isSignedIn(), false);
});

test('with no persisted token at all, isSignedIn is false', () => {
  const { gdrive: restored } = loadWithSessionStorage({});
  assert.equal(restored.isSignedIn(), false);
});
