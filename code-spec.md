Code Specification

Purpose: Single-page static web plotter for GP Bikes CSV logs. The app uploads one or more logs, parses telemetry, detects laps, and renders lap-based plots with optional lap-envelope shading and a Time Slip subplot (distance-based delta to fastest lap).

Functional Requirements

1. File upload and parsing
- Accept multiple CSV files in one session.
- Handle metadata/preamble rows before the actual header row.
- Detect optional units row immediately after header.
- Parse row data into per-log objects.

2. Column detection and derivation
- Detect Time/Timestamp/Date columns.
- Detect Distance/Odometer columns.
- Detect Latitude/Longitude columns and compute cumulative distance from haversine when Distance is missing.
- Detect numeric channels for plotting.

3. Lap detection and lap fields
- Derive lap boundaries from distance resets/decreases.
- Compute and store per-row:
	- Lap Number
	- Lap Time (seconds since lap start)
	- Lap Relative Distance (meters since lap start)
- Append columns exposed to UI:
	- Lap Time
	- Lap Number

4. Plot behavior
- Plotting is always lap-split (no Plot-by-lap toggle).
- X-axis toggle supports:
	- Time (Lap Time)
	- Distance (Lap Relative Distance)
- Y-channel multi-select plots selected channels over selected files/laps.
- If exactly one lap is selected, each selected Y channel gets its own color.
- If multiple laps are selected, lap coloring is used.
- Each selected Y channel in the main plot gets its own independent Y-axis (shared across files/laps for that channel).

5. XY mode
- XY controls allow plotting arbitrary column X vs arbitrary column Y.
- XY plot remains lap-split as well.
- XY plot updates immediately when dropdown selection changes.

6. Shading
- Optional checkbox toggles lap envelope shading (min/max band) per selected Y channel.
- Shading uses interpolation onto a common union grid.

7. Time Slip
- Time Slip is rendered inside the same Plotly figure as a second subplot row.
- Time Slip appears only when X-axis is Distance.
- Time Slip computes per-lap delta to fastest lap at each distance sample:
	- interpolate lap time to common distance grid
	- fastest = min lap time at each grid sample
	- delta = lapTime - fastest
- Main subplot and Time Slip subplot use native matched X-axis behavior (Plotly axis matching).
- Time Slip subplot height is intentionally short (around 10-15% of figure).

8. Immediate interaction updates
- Main plot updates on:
	- file checkbox changes
	- lap checkbox changes
	- X-axis radio changes
	- shading checkbox changes
	- Y-select changes
- XY plot updates immediately when XY dropdowns change.
- Plot buttons remain available as optional manual triggers.

9. Lap list UI labels
- Lap selector labels include lap number and lap time:
	- e.g., 1 - 1:23.456

10. Plot toolbar behavior
- Plotly logo is hidden from toolbar/modebar.

Non-functional Requirements

1. Responsive layout
- Controls and plot area adapt to smaller screens.

2. Reliability
- No uncaught exceptions for missing/partial columns.
- Graceful handling of empty or sparse lap overlap regions.

3. Performance
- Client-side processing for moderate telemetry logs.
- Use minimized local Plotly bundle for constrained hosts.

Data and Formats

1. CSV assumptions
- Header row may not be row 0.
- Optional units row may appear directly below header.

2. Header detection heuristic
- Header row is selected by matching multiple telemetry-like tokens (time, distance, lat, lon, speed, etc.).

3. Internal per-log fields
- meta._time: numeric seconds
- meta._dist: cumulative distance (meters)
- meta.lapNum
- meta.lapTime
- meta.lapRelDist
- meta.units

Core Files

- index.html: UI structure and script includes
- style.css: layout/styles
- app.js: parsing, UI state, plotting
- scripts/build-plotly-custom.js: local Plotly bundle build for app use
- scripts/build-production.js: production and gzip-only build output
- scripts/serve-dist-gzip.py: gzip-aware local test server
- package.json: build/test scripts
- README.md: setup and usage notes

Key Algorithms and Implementation Details

1. Header and units detection
- Parse with PapaParse in array mode (header:false).
- Detect header row via token-match count.
- Detect units row if next row appears mostly short non-numeric tokens.

2. Time parsing
- Numeric values interpreted as seconds (or converted from ms if unit hints ms).
- Date-like strings parsed to epoch seconds.
- HH:MM:SS(.sss) parsed to seconds.

3. Distance derivation
- Prefer distance column when present.
- Fallback to haversine cumulative distance from lat/lon.

4. Lap detection
- New lap when distance drops significantly or resets near zero after movement.

5. Interpolation
- Binary-search interval + linear interpolation function (`interpAt`) used for shading and Time Slip.

6. Shading envelope
- Build union X grid for each selected channel.
- Interpolate all selected lap series at each grid point.
- Compute min/max traces and fill between them.

7. Time Slip computation
- Build lap series with x=Lap Relative Distance and t=Lap Time.
- Interpolate all laps onto union distance grid.
- Compute fastest baseline per grid point and per-lap delta traces.

8. Multi-axis channel mapping
- One main Y-axis per selected channel in the main subplot.
- Additional channel axes overlaid left/right with dynamic margins.
- Time Slip keeps dedicated subplot axis and is not mixed with channel axes.

Build and Deployment

1. Development/local build
- `npm run build` creates `lib/plotly-custom.min.js`.

2. Production build
- `npm run build:prod` creates:
	- dist/gpbikes-plotter.bundle.min.js
	- dist/gpbikes-plotter.bundle.min.js.gz
	- dist/index.html
	- dist/style.css

3. ESP32 gzip-only build
- `npm run build:esp32` creates gzip-only assets:
	- dist/gpbikes-plotter.bundle.min.js.gz
	- dist/index.html.gz
	- dist/style.css.gz

4. Gzip serving requirement
- For gzip-only hosting, server must map normal file paths to .gz assets and send:
	- Content-Encoding: gzip
	- Correct Content-Type for html/css/js

5. Local gzip-aware testing
- `npm run serve:esp32-test` serves dist with gzip headers for realistic ESP32 behavior testing.

Testing and Validation

1. Parsing tests
- CSV with metadata rows
- CSV with units row
- Missing distance with lat/lon fallback

2. Plot tests
- Multi-file, multi-lap plotting
- Single-lap selected channel color differentiation
- Multi-channel independent Y-axes
- Time Slip visibility only in Distance mode
- Matched X zoom/pan between main subplot and Time Slip subplot

3. Build tests
- Verify `build:prod` output files
- Verify `build:esp32` gzip-only output and size
- Verify gzip-aware server headers for html/js/css

Open Questions / Future Enhancements

1. Optional fixed-step Time Slip grid instead of union-of-samples.
2. Optional smoothing/filtering for noisy channels and Time Slip.
3. Export plotted data/time-slip deltas to CSV.
4. Add axis-title coloring by channel for easier axis-channel matching.