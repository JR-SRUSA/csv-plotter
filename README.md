GP Bikes CSV Plotter

A small static web app that lets you upload one or more CSV logs and plot channels using Plotly.

Note: `index.html` now references an explicit Plotly CDN version to avoid the deprecated `plotly-latest` warning.

Usage

1. Open `plotter/index.html` in a modern browser (or serve the `plotter/` folder using a static server).
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