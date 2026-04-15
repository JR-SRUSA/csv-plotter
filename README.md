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

Usage

1. Open `index.html` in a modern browser (or serve the workspace root using a static server).
2. Click the file picker and select one or more CSV files.
3. Choose X axis: `Time` (uses Time/Timestamp column if present) or `Distance` (uses Distance column or computes from lat/lon).
4. Select one or more Y channels from the multi-select and click `Plot Selected`.
5. Toggle file visibility or remove files from the list.

Notes

- CSV files should contain headers.
- The app detects common header names like `Time`, `Timestamp`, `Distance`, `lat`, `lon`.
- If `Distance` is absent and `lat`/`lon` are present, distance is computed using the Haversine formula (meters).

Want improvements?

I can add export, smoothing, axis scaling, or presets. Tell me which features you want next.