(() => {
  'use strict';

  // ── Google Drive integration (optional, progressive enhancement) ──────────
  //
  // Loaded on every build, but entirely inert unless:
  //
  //  1. GOOGLE_CLIENT_ID / GOOGLE_API_KEY below are filled in. Both are meant to be
  //     public, not secret: this app uses the browser-only OAuth "token" flow, which has
  //     no client-secret step at all (that only exists for server-side/confidential OAuth
  //     apps), and the API key is restricted in Google Cloud Console (HTTP referrer + API
  //     restrictions) rather than kept secret. Safe to commit both to a public repo. See
  //     GOOGLE_DRIVE_SETUP.md for how to create them. Forking to a different origin means
  //     creating your own Client ID/API key registered to that origin and swapping the two
  //     constants below, then rebuilding -- no other code changes needed.
  //  2. The two live Google scripts (Google Identity Services + the Picker/`gapi` loader,
  //     see index.html's <head>) actually load. They can't be vendored locally like
  //     Plotly/Papa/Leaflet under lib/, because they aren't static libraries: they open a
  //     live channel to Google's own servers to check the real login session and show
  //     Google's real consent UI, so running a copied-in version would still require
  //     phoning home -- Google's terms require loading them live from Google's CDN rather
  //     than mirroring them. On an offline device (e.g. the ESP32 build, which strips these
  //     two <script> tags entirely -- see scripts/build-production.js) they simply never
  //     load and `google`/`gapi` stay undefined; every function below checks for that first
  //     and fails soft instead of throwing.
  //
  // All actual Drive file operations go through plain fetch() against the Drive v3 REST
  // API with a Bearer token, rather than the heavier gapi.client library.

  const GOOGLE_CLIENT_ID = '196715930763-r9um19kj52ivopglbr4dplklo93i80eb.apps.googleusercontent.com'; // e.g. '1234567890-abc123.apps.googleusercontent.com' -- see GOOGLE_DRIVE_SETUP.md
  const GOOGLE_API_KEY = 'AIzaSyDjTi64usJrDA8NU8lAaH6BUxlAn6JGGS4';   // Cloud Console API key, restricted to Drive API + Picker API -- see GOOGLE_DRIVE_SETUP.md
  // The Cloud project number -- always the digits before the first '-' of an OAuth Client
  // ID. Under the narrow drive.file scope, Google only grants the app access to a file the
  // user picks in the Picker if the Picker is told this (setAppId); without it, downloading
  // any file the app didn't create itself fails with a 404.
  const GOOGLE_APP_ID = GOOGLE_CLIENT_ID.split('-')[0];
  const GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');
  const APP_FOLDER_NAME = 'CSV Plotter';
  // sessionStorage, not localStorage: survives a page refresh (the common "reload mid-
  // workflow" case) but clears when the tab/browser closes, and the token is short-lived
  // (~1hr) regardless -- isSignedIn() below still re-checks the stored expiry on every call,
  // so a stale entry from a closed-then-reopened tab can't fake a live connection.
  const SESSION_STORAGE_KEY = 'csvPlotterGoogleDriveToken';

  let tokenClient = null;
  let accessToken = null;
  let tokenExpiresAt = 0;
  let cachedUserInfo = null;
  let cachedFolderId = null;
  let pickerApiLoadPromise = null;
  let apiReadyCallbacks = [];
  let apiReadyPollTimer = null;

  function isConfigured() {
    return !!(GOOGLE_CLIENT_ID && GOOGLE_API_KEY);
  }

  // True once Google's two live scripts have finished loading -- checks for the token-client
  // factory and the gapi loader, not `google.picker` itself, which only exists after
  // gapi.load('picker', ...) has been called (see loadPickerApi below).
  function isApiLoaded() {
    return typeof google !== 'undefined'
      && !!(google.accounts && google.accounts.oauth2 && typeof google.accounts.oauth2.initTokenClient === 'function')
      && typeof gapi !== 'undefined' && typeof gapi.load === 'function';
  }

  // The two <script async defer> tags (see index.html) can finish loading well after this
  // module's own top-level code runs -- on a fast local connection that race is basically
  // never lost, but on a slower mobile connection it often is, which used to leave the app
  // permanently reporting "scripts didn't load" even once they actually had. Callers (app.js)
  // use this instead of checking isApiLoaded() only once, so the UI corrects itself as soon as
  // the scripts are actually ready.
  function onReady(callback) {
    if (isApiLoaded()) { callback(); return; }
    apiReadyCallbacks.push(callback);
    if (!apiReadyPollTimer) {
      const deadline = Date.now() + 15000;
      apiReadyPollTimer = setInterval(() => {
        if (isApiLoaded()) {
          clearInterval(apiReadyPollTimer);
          apiReadyPollTimer = null;
          const callbacks = apiReadyCallbacks;
          apiReadyCallbacks = [];
          callbacks.forEach((cb) => { try { cb(); } catch (e) { /* a listener's own error shouldn't break the others */ } });
        } else if (Date.now() > deadline) {
          clearInterval(apiReadyPollTimer);
          apiReadyPollTimer = null;
          // Left ungathered deliberately: apiReadyCallbacks may still be called later if
          // isApiLoaded() ever becomes true and something else calls onReady() again, but we
          // stop polling after 15s so a truly offline/blocked case doesn't poll forever.
        }
      }, 200);
    }
  }

  function isSignedIn() {
    return !!accessToken && Date.now() < tokenExpiresAt;
  }

  function requireReady() {
    if (!isConfigured()) return 'Google Drive is not configured for this deployment.';
    if (!isApiLoaded()) return "Google Drive isn't available right now (its scripts didn't load -- check your connection).";
    return null;
  }

  function persistToken() {
    try {
      if (accessToken && tokenExpiresAt) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ accessToken, expiresAt: tokenExpiresAt }));
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) { /* private browsing / storage disabled -- fall back to memory-only */ }
  }

  function restorePersistedToken() {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && saved.accessToken && typeof saved.expiresAt === 'number' && Date.now() < saved.expiresAt) {
        accessToken = saved.accessToken;
        tokenExpiresAt = saved.expiresAt;
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) { /* private browsing / storage disabled -- just start signed out */ }
  }

  function resetSession() {
    accessToken = null;
    tokenExpiresAt = 0;
    cachedUserInfo = null;
    cachedFolderId = null;
    persistToken();
  }

  function loadGisTokenClient() {
    if (!tokenClient) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: () => {} // replaced per-call in signIn(), before requestAccessToken() fires it
      });
    }
    return tokenClient;
  }

  function signIn() {
    const err = requireReady();
    if (err) return Promise.reject(new Error(err));
    return new Promise((resolve, reject) => {
      const client = loadGisTokenClient();
      client.callback = (response) => {
        if (!response || response.error) {
          reject(new Error((response && response.error_description) || (response && response.error) || 'Google sign-in failed.'));
          return;
        }
        accessToken = response.access_token;
        tokenExpiresAt = Date.now() + (((response.expires_in || 3600) - 60) * 1000);
        cachedUserInfo = null;
        cachedFolderId = null;
        persistToken();
        resolve();
      };
      client.requestAccessToken();
    });
  }

  function signOut() {
    return new Promise((resolve) => {
      const token = accessToken;
      resetSession();
      if (token && isApiLoaded() && typeof google.accounts.oauth2.revoke === 'function') {
        google.accounts.oauth2.revoke(token, () => resolve());
      } else {
        resolve();
      }
    });
  }

  function driveFetch(url, options) {
    if (!isSignedIn()) return Promise.reject(new Error('Not connected to Google Drive.'));
    const opts = Object.assign({}, options);
    opts.headers = Object.assign({ Authorization: `Bearer ${accessToken}` }, options && options.headers);
    return fetch(url, opts).then((res) => {
      if (!res.ok) {
        return res.text().then((body) => {
          throw new Error(`Google Drive request failed (${res.status}): ${(body || '').slice(0, 200)}`);
        });
      }
      return res;
    });
  }

  function getSignedInUserInfo() {
    if (!isSignedIn()) return Promise.resolve(null);
    if (cachedUserInfo) return Promise.resolve(cachedUserInfo);
    return driveFetch('https://www.googleapis.com/oauth2/v3/userinfo')
      .then((res) => res.json())
      .then((info) => {
        cachedUserInfo = { sub: info.sub, email: info.email, name: info.name, picture: info.picture };
        return cachedUserInfo;
      })
      .catch(() => null);
  }

  // ── Picker ─────────────────────────────────────────────────────────────
  function loadPickerApi() {
    if (!pickerApiLoadPromise) {
      pickerApiLoadPromise = new Promise((resolve, reject) => {
        if (typeof gapi === 'undefined' || typeof gapi.load !== 'function') {
          reject(new Error('Google API loader is unavailable.'));
          return;
        }
        gapi.load('picker', { callback: resolve, onerror: () => reject(new Error('Failed to load the Google Picker.')) });
      });
    }
    return pickerApiLoadPromise;
  }

  function openPicker({ mimeTypes }) {
    return loadPickerApi().then(() => new Promise((resolve, reject) => {
      const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
        .setIncludeFolders(false)
        .setSelectFolderEnabled(false);
      if (Array.isArray(mimeTypes) && mimeTypes.length) view.setMimeTypes(mimeTypes.join(','));
      const builder = new google.picker.PickerBuilder();
      if (/^\d+$/.test(GOOGLE_APP_ID)) builder.setAppId(GOOGLE_APP_ID);
      const picker = builder
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback((data) => {
          if (data.action === google.picker.Action.PICKED) {
            const doc = data.docs && data.docs[0];
            if (doc) { resolve({ id: doc.id, name: doc.name, mimeType: doc.mimeType }); return; }
          }
          if (data.action === google.picker.Action.CANCEL) reject(new Error('cancelled'));
        })
        .build();
      picker.setVisible(true);
    }));
  }

  function pickFile(opts) {
    const err = requireReady();
    if (err) return Promise.reject(new Error(err));
    if (!isSignedIn()) return Promise.reject(new Error('Not connected to Google Drive.'));
    return openPicker(opts || {});
  }

  function downloadFileContent(fileId) {
    return driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`)
      .then((res) => res.blob());
  }

  function createAppFolder() {
    return driveFetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: APP_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
    }).then((res) => res.json()).then((folder) => { cachedFolderId = folder.id; return cachedFolderId; });
  }

  function findAppFolder() {
    const q = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${APP_FOLDER_NAME}' and trashed=false and 'root' in parents`);
    return driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name)`)
      .then((res) => res.json())
      .then((data) => (data.files && data.files.length) ? (cachedFolderId = data.files[0].id) : createAppFolder());
  }

  // Find-or-create a visible "CSV Plotter" folder under My Drive. Cached in memory for the
  // session, but re-verified (not just trusted) before use, in case it was deleted/renamed.
  function ensureAppFolder() {
    if (!cachedFolderId) return findAppFolder();
    return driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cachedFolderId)}?fields=id,trashed`)
      .then((res) => res.json())
      .then((info) => (info && !info.trashed) ? cachedFolderId : findAppFolder())
      .catch(findAppFolder);
  }

  function findFileInFolder(name, folderId) {
    const escapedName = name.replace(/[\\']/g, '\\$&');
    const q = encodeURIComponent(`name='${escapedName}' and '${folderId}' in parents and trashed=false`);
    return driveFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`)
      .then((res) => res.json())
      .then((data) => (data.files && data.files[0]) || null);
  }

  // Pure (no network): builds a multipart/related request body for the Drive upload
  // endpoint out of a metadata object and a content Blob. Kept separate so it can be
  // unit-tested in isolation.
  function buildMultipartUploadBody(metadata, blob, boundary) {
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    const metadataPart = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata);
    const contentType = (blob && blob.type) || 'application/octet-stream';
    const filePartHeader = delimiter + `Content-Type: ${contentType}\r\n\r\n`;
    return new Blob([metadataPart, filePartHeader, blob, closeDelimiter], { type: `multipart/related; boundary=${boundary}` });
  }

  // Finds a same-named file in the app's Drive folder and overwrites its content (PATCH),
  // or creates a new one (POST) -- so repeated backups replace one canonical file rather
  // than piling up like timestamped local downloads do.
  function uploadOrUpdateFile({ name, blob, mimeType }) {
    const err = requireReady();
    if (err) return Promise.reject(new Error(err));
    if (!isSignedIn()) return Promise.reject(new Error('Not connected to Google Drive.'));
    const contentBlob = mimeType && (!blob || blob.type !== mimeType) ? new Blob([blob], { type: mimeType }) : blob;
    return ensureAppFolder().then((folderId) => findFileInFolder(name, folderId).then((existing) => {
      const boundary = `csvplotter-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const metadata = existing ? { name } : { name, parents: [folderId] };
      const body = buildMultipartUploadBody(metadata, contentBlob, boundary);
      const url = existing
        ? `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      return driveFetch(url, {
        method: existing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body
      }).then((res) => res.json()).then((file) => ({ id: file.id, name: file.name }));
    }));
  }

  window.GoogleDriveIntegration = {
    isConfigured,
    isApiLoaded,
    onReady,
    isSignedIn,
    signIn,
    signOut,
    getSignedInUserInfo,
    pickFile,
    downloadFileContent,
    ensureAppFolder,
    uploadOrUpdateFile,
    // Exposed for unit tests only -- not part of the app-facing API.
    _buildMultipartUploadBody: buildMultipartUploadBody
  };

  restorePersistedToken();
})();
