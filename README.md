GP Bikes CSV Plotter

A small static web app that lets you upload one or more CSV logs and plot channels using Plotly.

Build

1. Install dependencies once with `npm install`.
2. Build the minified custom Plotly bundle with `npm run build`.
3. Build a production distribution with `npm run build:prod`.
4. Build a gzip-only ESP32 distribution with `npm run build:esp32`.
5. Open `index.html` from the workspace root, or serve the root folder with a static server.

`npm run build` writes the browser-ready Plotly bundle to `lib/plotly-custom.min.js`, which is what the root app loads.

`npm run build:prod` creates a distribution folder in `dist/` with:

1. `gpbikes-plotter.bundle.min.js` containing Plotly, Papa Parse, and the app code.
2. `gpbikes-plotter.bundle.min.js.gz` for precompressed distribution.
3. `index.html` wired to the single local bundle.
4. `style.css` copied for the production page.

`npm run build:esp32` creates a gzip-only `dist/` containing:

1. `gpbikes-plotter.bundle.min.js.gz`
2. `index.html.gz`
3. `style.css.gz`

For the gzip-only build to work, your ESP32 server must:

1. Serve `/index.html`, `/style.css`, and `/gpbikes-plotter.bundle.min.js` from the corresponding `.gz` files.
2. Set `Content-Encoding: gzip`.
3. Set the correct `Content-Type`, such as `text/html`, `text/css`, and `application/javascript`.

If the server cannot do that header mapping, you must keep the regular non-gz files.

Testing locally

`python -m http.server` is not enough to test the gzip-only build, because it will not send `Content-Encoding: gzip` for the `.gz` assets.

Use either:

1. `npm run build:esp32`
2. `npm run serve:esp32-test`

That test server serves files from `dist/` and maps requests like `/index.html` to `index.html.gz` with the correct headers.

Testing

Tests are segmented by what they exercise:

1. `test/` — pure calculation/logic unit tests (`npm run test:calculations`, or `npm test`). These run under Node's built-in test runner, either loading a standalone module (`file-processors.js`, `fit-functions.js`) in a `vm` sandbox, or re-implementing an `app.js`-internal function to test in isolation (e.g. `quick-modify.test.js`), since `app.js` itself is a browser-only script full of DOM lookups. The sessions-layer tests (`sessions-model.test.js`, `sessions-storage.test.js`, `sessions-services.test.js`) `require()` those modules and run them against an in-memory storage backend, so the same service code the browser uses is what gets tested; `test/sessions-loader.js` is their shared helper, not a test file.
2. `e2e/` — real browser UI tests (`npm run test:ui`, or the older alias `npm run test:e2e`) using Playwright. These load the actual `index.html`/`app.js` in a real browser and drive it like a user would (clicking buttons, loading sample files, checking rendered output and downloads).

When adding a test, prefer `test/` for anything that's pure data transformation, and `e2e/` for anything that depends on the DOM, events, or browser APIs (downloads, localStorage, Plotly's rendered output).

Usage

1. Open `index.html` in a modern browser (or serve the workspace root using a static server).
2. Click the file picker and select one or more CSV files.
3. Choose X axis: `Time`, `Distance`, or `Channel` (select any available numeric channel from the X-axis dropdown).
4. Select one or more Y channels from the multi-select and click `Plot Selected`.
5. Toggle file visibility or remove files from the list.

Notes

- CSV files should contain headers.
- The app detects common header names like `Time`, `Timestamp`, `Distance`, `lat`, `lon`.
- If `Distance` is absent and `lat`/`lon` are present, distance is computed using the Haversine formula (meters).

Sessions, vehicles, riders and notes

Beyond plotting single logs, the app can file logs against **sessions** — a track day, a
race weekend practice, a test run — together with the vehicles, riders, setups, notes and
KPIs that belong with them.

This is entirely optional. Opening a CSV still plots it immediately and never asks about a
session; attaching one is an explicit action you take later.

How to use it

1. Open a CSV as usual. It plots straight away.
2. On the file's row in the controls panel, click `Add to Session`.
3. Pick an existing session or choose `New session…`, and optionally set a vehicle, rider,
   tags and a quick note. A file can belong to several sessions.
4. Open the `Sessions` panel to see everything attached to a session, edit KPIs inline, and
   add notes. Notes can carry photos, and a single note can be linked to several sessions.

The data model

Normalised and linked by ID — no deep nesting — across these entities:

| Entity | Notes |
| --- | --- |
| `User` | Notes need an author, but there is no login, so first run creates a device-local `user_local_*`. `UserService.migrateLocalUserToCloud` can later reassign everything to a real account. |
| `Rider` | Name, licence, weight, experience, tags. |
| `Vehicle` | The bike/car/kart identity. Never carries setup values itself. |
| `Setup` | **Append-only.** Editing a setup writes a *new* record whose `supersedes_id` points at the old one, so a log that referenced a historical setup keeps reading the values the bike actually ran. |
| `Session` | Name, location, times, KPIs, plus ID lists of its vehicles, riders, files and notes. |
| `Note` | `pre` / `during` / `post`, with `session_ids` as an **array** so one note can span sessions. Optional media. |
| File records | Log files keep living in the `csvPlotterFiles` database — it is the single source of truth for file contents. The session-link fields (`session_ids`, `vehicle_id`, `rider_id`, `setup_id`, `tags`) are extra fields on those same records, so nothing is duplicated and the two cannot drift apart. |
| `MediaEntry` | Photos/video, stored as blobs in IndexedDB or as external URLs. |

Relationships are bidirectional and kept in sync by the services: attaching a file to a
session writes both `file.session_ids` and `session.file_ids`. Deleting a session unlinks
its files and notes but **keeps** them — they are independent artefacts. Deleting a vehicle
does delete its setups, since a setup sheet is meaningless without the bike it describes.

Storage

IndexedDB is the canonical store, in two databases:

1. `motorsports_app_v1` — `users`, `riders`, `vehicles`, `setups`, `sessions`, `notes`,
   `mediaIndex`, `appMetadata`.
2. `csvPlotterFiles` — log file records. At **v3** this store is keyed by a UUID `id` with
   the filename as an ordinary `name` field (it was keyed by `name` up to v2). Existing
   records are migrated automatically on first load, keeping their contents, hash and
   importer config. Re-opening a file under the same name updates that record in place, so
   it never loses the sessions it was attached to.

There is a small `localStorage` fallback shim for browsers without IndexedDB, and an
in-memory backend used by the unit tests. No feature is designed around the fallback.

Export and import

`Download All Data` produces a `csv-plotter-backup` ZIP, now at **version 3**: the
manifest gained a `sessions` key holding the full bundle (`schemaVersion`, `exportedAt`,
`users`, `riders`, `vehicles`, `setups`, `sessions`, `notes`, `files`, `mediaIndex`,
`appMetadata`). Log contents still travel as separate entries in the ZIP rather than being
inlined. Version 1 and 2 backups still restore.

Media is exported as references by default; `exportAll(true)` embeds base64 blobs instead,
which can make a bundle very large.

On import:

1. `schemaVersion` is validated — an incompatible major version is refused.
2. ID collisions generate new IDs and return a `{ oldId: newId }` mapping, with every
   cross-reference rewritten to match.
3. `replaceExisting` wipes local data first; `dryRun` validates and reports without
   writing; `overwriteMatchingIds` reinstates same-ID records instead of duplicating them
   (this is what restoring your own backup uses).
4. `migrateLocalUsers` remaps `user_local_*` to a real account.
5. File links attach to the file you already have, matched by ID then by filename, so a
   bundle imported alongside your existing CSVs does not create textless ghost rows.

`sample_data_files/sessions-export-sample.json` is a complete, importable example bundle
(two sessions, a superseded setup, a note spanning both sessions, KPIs and a media
reference) for manual testing.

Source layout

The sessions feature is four plain browser-global scripts, loaded (and bundled) in
dependency order, with JSDoc typedefs rather than TypeScript since the app has no
transpile step:

1. `sessions-model.js` — entity shapes, ID generation, normalisation, validation.
2. `sessions-storage.js` — StorageService, the IndexedDB/localStorage/memory backends, the
   file-store migration, and export/import.
3. `sessions-services.js` — UserService, RiderService, VehicleService, SetupService,
   SessionService, NoteService, FileService, MediaService, ExportService.
4. `sessions-ui.js` — the Add to Session modal and the Sessions panel.

Note search is a tokenised linear scan (`NoteService.searchNotes`) rather than a persisted
inverted index: at realistic note counts it is far below a frame, it cannot go stale, and
it keeps the ESP32 bundle small.

Camera capture asks for `getUserMedia` only on an explicit `Take Photo` click, and falls
straight back to the file picker if permission is denied or no camera exists.

Not yet built: a dedicated setup-editor UI and a login/claim-local-data prompt. The
services behind both (`SetupService.reviseSetup`, `UserService.migrateLocalUserToCloud`)
are implemented and tested, so they are UI-only work.

Want improvements?

I can add export, smoothing, axis scaling, or presets. Tell me which features you want next.
