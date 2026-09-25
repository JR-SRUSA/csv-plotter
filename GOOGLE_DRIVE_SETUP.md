# Setting up Google Drive access

This app can optionally connect to Google Drive (import CSVs from Drive, back up/restore to
Drive), using the User panel's "Google Drive" section. It's off until you create your own
Google Cloud OAuth Client ID and API key and put them into `google-drive.js`.

Neither value is a secret. This app uses the browser-only OAuth "token" flow, which has no
client-secret step at all (that only exists for server-side/confidential OAuth apps), and the
API key is restricted (HTTP referrer + API restrictions) rather than kept private. Both are safe
to commit to a public repo.

## 1. Create a Google Cloud project

Go to [console.cloud.google.com](https://console.cloud.google.com), create a new project. No
billing account is needed — the Drive API and Picker API are free, with default quotas
(roughly 1 billion queries/day, 12,000/minute) far beyond what a personal or small-team tool
needs.

## 2. Enable the APIs

**APIs & Services → Library** → enable:
- **Google Drive API**
- **Google Picker API**

## 3. Configure the OAuth consent screen

**APIs & Services → OAuth consent screen**:
- User type: **External**.
- Publishing status: leave it in **Testing**. This avoids Google's verification process
  entirely, at the cost of a hard cap of **100 test users**, each added manually below.
- Scopes: add
  - `https://www.googleapis.com/auth/drive.file`
  - `https://www.googleapis.com/auth/userinfo.email`
  - `https://www.googleapis.com/auth/userinfo.profile`
- Test users: add every Google account that should be able to sign in (including your own).
  Testing-mode apps reject anyone not on this list.

**Scaling past 100 users**: switching to "In production" for the `drive.file` scope requires
Google's standard OAuth verification (it's a "sensitive," not "restricted," scope, so this is
free — no paid security assessment). You'll need a hosted privacy policy page and an app
homepage URL, and Google's review can take anywhere from a few days to a couple of weeks. This
is a separate future step, not required to use the app yourself or with a small known group.

## 4. Create an OAuth Client ID

**APIs & Services → Credentials → Create Credentials → OAuth client ID**:
- Application type: **Web application**.
- Authorized JavaScript origins: add every origin you'll use the app from, e.g.:
  - Your GitHub Pages URL (`https://<username>.github.io`)
  - `http://localhost:8000` (or whatever port) for local development — Google explicitly
    allows plain-HTTP `localhost`/`127.0.0.1` as a dev exception
  - A custom domain, if any
- No redirect URI is needed — the token flow this app uses communicates via `postMessage`,
  not a redirect.

(Testing from GitHub Codespaces: the forwarded URL — `https://<codespace-name>-<port>.app.github.dev`
— changes per codespace instance, so prefer `localhost` where you can; add the Codespaces URL
only if you specifically need it, and expect to update it if the codespace is recreated.)

## 5. Create an API key

**APIs & Services → Credentials → Create Credentials → API key**:
- **Application restrictions → HTTP referrers**: list the same origins as step 4.
- **API restrictions → Restrict key**: limit it to "Google Drive API" and "Google Picker API"
  only.

## 6. Wire it into the app

Open [google-drive.js](google-drive.js) and fill in the two constants near the top:

```js
const GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'your-api-key';
```

Then rebuild (`npm run build:prod` for GitHub Pages, or `npm run build:esp32` for the offline
ESP32 target — the Google Drive UI simply stays disabled there since it has no network).

## Forking / self-hosting at a different origin

Repeat steps 3–5 to create your own OAuth Client ID and API key registered against your origin,
then swap the two constants in `google-drive.js` and rebuild. No other code changes are needed.
