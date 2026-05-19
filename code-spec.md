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
- Y-channel list can expose format-agnostic display names from channel mapping instead of raw source column names.
- When a mapped display channel is selected, each file resolves that selection to its format-specific source column.
- If exactly one lap is selected, each selected Y channel gets its own color.
- If multiple laps are selected, lap coloring is used.
- Each selected Y channel in the main plot gets its own independent Y-axis (shared across files/laps for that channel).
- Default Y-channel selection chooses a single default channel (`Speed`) when available.

5. Unified X-axis mode
- X-axis controls support:
	- Time (Lap Time)
	- Distance (Lap Relative Distance)
	- Channel (dropdown of available numeric input channels)
- The main plot remains lap-split when using Channel X-axis mode.
- Separate XY plot area is removed.

6. Shading
- Optional checkbox toggles lap envelope shading (min/max band) per selected Y channel.
- Shading uses interpolation onto a common union grid.

7. Time Slip
- Time Slip is rendered inside the same Plotly figure as a second subplot row.
- Time Slip appears only when X-axis is Distance.
- Time Slip computes per-lap delta to one fixed fastest selected lap over a common distance grid:
	- interpolate lap time to common distance grid
	- choose the fastest selected lap by overall lap duration as the reference baseline
	- prefer non-crash laps for the reference baseline when available
	- delta = lapTime - referenceLapTime
- Main subplot and Time Slip subplot use native matched X-axis behavior (Plotly axis matching).
- Time Slip subplot height is intentionally short (around 10-15% of figure).
- Time Slip Y-axis supports both positive and negative values.

8. Immediate interaction updates
- Main plot updates on:
	- file checkbox changes
	- lap checkbox changes
	- X-axis radio changes
	- Channel X-axis dropdown changes (when Channel mode is selected)
	- shading checkbox changes
	- Y-select changes
- Plot buttons remain available as optional manual triggers.

9. Lap list UI labels
- Lap selector labels include lap number and lap time:
	- e.g., 1 - 1:23.456
- When a file has 3 or more laps, the first and last laps default to unchecked to omit typical out-lap / in-lap data.

10. Plot toolbar behavior
- Plotly logo is hidden from toolbar/modebar.

11. Map plot and hover linking
- Render a secondary map plot below the main time/distance plot.
- Keep the main plot (including Time Slip when enabled) and map visible together.
- Ensure Time Slip remains visible and is not visually covered by the secondary map panel when enabled.
- Map data source is format-aware:
	- AiM: GPS Latitude vs GPS Longitude (or equivalent latitude/longitude column names)
	- GP Bikes: PosX vs PosY
- Map plot is lap-split and respects selected files/laps.
- Map zoom/pan state persists while changing map alignment offsets (`X Offset`, `Y Offset`) and other non-reset replot actions.
- Map zoom/pan state resets on explicit map purge/reset actions (for example, removing all map data or `Clear All`).
- Hovering the main plot highlights the corresponding sample on the map with a visible marker.
- Hover-linking must fail gracefully when map data is missing for a hovered sample.

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

4. Channel mapping configuration
- Channel mapping can be provided via `channel-map.json`.
- Each mapping entry links one display channel name to per-format source column names:
	- `displayName`
	- `piboso`
	- `aim`
- If `channel-map.json` is unavailable or invalid, the app falls back to a built-in default mapping.

Core Files

- index.html: UI structure and script includes
- style.css: layout/styles
- app.js: parsing, UI state, plotting
- channel-map.json: editable display-to-source channel mapping configuration
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
- Select a single fastest reference lap using overall lap duration.
- Prefer the fastest non-crash selected lap; fall back to the fastest selected lap if needed.
- Interpolate the reference lap across the same distance grid.
- Compute per-lap delta traces against that fixed reference lap.

8. Channel display-name mapping
- Load optional `channel-map.json` at app startup.
- Normalize entries to `{ displayName, piboso, aim }`.
- Build the Y-channel list from mapped display names plus any uncovered raw numeric columns.
- Hide raw format-specific columns from the Y-channel list when they are covered by a mapping entry.
- Resolve selected display names back to the correct source column for each loaded log during plotting and unit lookup.

9. Multi-axis channel mapping
- One main Y-axis per selected channel in the main subplot.
- Additional channel axes overlaid left/right with dynamic margins.
- Time Slip keeps dedicated subplot axis and is not mixed with channel axes.

10. Secondary map plot generation
- Build map traces per selected file/lap using format-aware coordinate column resolution.
- Keep map aspect ratio consistent (`scaleanchor`/`scaleratio`) for track-shape fidelity.
- Preserve user map view (zoom/pan) across redraws by reusing relayout axis ranges and Plotly UI revision semantics.
- Maintain a per-sample row-key lookup so main-plot hover events can locate map coordinates.

11. Plot container sizing for combined main + Time Slip + map layout
- When Time Slip is enabled and figure height increases, synchronize the main plot container height with the active Plotly layout height.
- Prevent overlap where lower main-figure regions (including Time Slip) could be obscured by the map panel below.

11. Main-to-map hover synchronization
- Attach Plotly hover/unhover handlers only after the main plot is initialized.
- Use per-point `customdata` row keys on main traces to identify the corresponding map point.
- Render map highlight as a dedicated marker trace that is shown/hidden on hover state changes.
- Guard event binding paths to avoid runtime errors when plot event APIs are not yet available.

Build and Deployment

1. Development/local build
- `npm run build` creates `lib/plotly-custom.min.js`.

2. Production build
- `npm run build:prod` creates:
	- dist/gpbikes-plotter.bundle.min.js
	- dist/gpbikes-plotter.bundle.min.js.gz
	- dist/index.html
	- dist/style.css
	- dist/channel-map.json

3. ESP32 gzip-only build
- `npm run build:esp32` creates gzip-only assets:
	- dist/gpbikes-plotter.bundle.min.js.gz
	- dist/index.html.gz
	- dist/style.css.gz
	- dist/channel-map.json.gz

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
- Secondary map plot visibility and data-source selection (AiM lat/lon, GP Bikes PosX/PosY)
- Main-plot hover highlights corresponding point on map
- No runtime error when hover sync initializes before first plot render

3. Build tests
- Verify `build:prod` output files
- Verify `build:esp32` gzip-only output and size
- Verify gzip-aware server headers for html/js/css

Open Questions / Future Enhancements

1. Optional fixed-step Time Slip grid instead of union-of-samples.
2. Optional smoothing/filtering for noisy channels and Time Slip.
3. Export plotted data/time-slip deltas to CSV.
4. Add axis-title coloring by channel for easier axis-channel matching.

Recent Request-Driven Updates (2026-04-16)

1. Controls panel UX updates
- Added version label in controls panel: `Version 20260416a`.
- Version label is pinned near the bottom of the mobile slide-out controls panel.
- Moved page heading and description text into the controls panel (`controls-intro`).
- Mobile header now primarily serves as hamburger-trigger container.

2. Legend behavior
- Disabled Plotly legend in standard lap/time-distance layout and combined Time Slip layout.

3. Crash-lap logic and Time Slip constraints
- Crash detection includes both:
	- In-lap non-monotonic distance drops (beyond epsilon).
	- Lap total distance significantly short compared to previous laps (threshold ratio currently 0.8).
- Crash laps are excluded from fastest-lap reference selection when a non-crash lap is available.

4. Source/format-specific processing architecture
- Split CSV parsing/lap-processing logic out of `app.js` into `file-processors.js`.
- `app.js` delegates file processing through `window.LogFileProcessors.processCsvRows(...)`.
- Added metadata extraction and routing by `Format` metadata value:
	- `PiBoSo CSV File` -> GP Bikes processor path.
	- `AiM CSV File` -> AiM processor path.
	- Fallback -> generic processor path.

5. Header/channel detection behavior
- Removed dependency on predefined telemetry token list for header detection.
- Header detection is now structure-based and channel-agnostic.
- All available channels from detected header are retained.

6. Beacon-marker-based lap segmentation
- Added lap segmentation by metadata `Beacon Markers` (applies across formats when valid):
	- Below first marker => lap 0.
	- Between marker 1 and marker 2 => lap 1.
	- etc.
- Lap time is computed from beacon boundaries:
	- `lapTime = rowTime - lapStartMarkerTime`.
- Distance-based lap detection remains as fallback when beacon markers are absent/invalid.

7. Lap indexing/color robustness
- Added lap-color helper to support lap 0 and any non-positive/edge lap index safely.
- Updated lap list labels and plot trace color assignments to use robust lap-color mapping.

8. AiM units-row parsing fix
- Improved units-row detection so AiM unit lines (including sparse/blank unit cells) are not treated as data rows.
- Restored numeric-channel discovery for time/distance Y-channel selection (not limited to a few columns).

9. Production build updates
- Production pipeline minifies final combined bundle (not only app source) before output.
- Build pipeline includes `file-processors.js` in production bundle composition.

Recent Request-Driven Updates (2026-04-19)

1. Display-name-based Y-channel mapping
- Added channel display mapping so Y-channel options can show one format-agnostic display name instead of separate PiBoSo / AiM source columns.
- When a mapped display channel is selected, plotting resolves the correct per-format source channel for each loaded file.
- Raw source columns covered by mapping entries are hidden from the Y-channel list.

2. Default Y-channel selection behavior
- Default Y-channel selection now chooses only one default channel: `Speed`.
- If `Speed` is unavailable in the current files, the first available Y-channel is selected as a fallback.
- Existing Y-channel selections are preserved when possible while the Y-channel list is rebuilt.

3. External channel mapping config
- Moved channel mapping configuration out of `app.js` into `channel-map.json`.
- App loads `channel-map.json` at startup and falls back to built-in defaults if the JSON file is missing or invalid.
- Production build now copies `channel-map.json` into `dist`, including gzip output for gzip-only builds.

4. Lap selection defaults
- When a file has 3 or more laps, the first and last laps default to unchecked to reduce in-lap / out-lap clutter.

5. Time Slip baseline and axis behavior
- Time Slip no longer uses the pointwise minimum across laps as its baseline.
- Time Slip now uses one fixed fastest selected lap, based on overall lap time, as the zero-reference trace across the full lap.
- Fastest non-crash lap is preferred as the baseline when available.
- Time Slip axis range now supports negative deltas so partial-lap gains against the eventual fastest lap are visible.

Recent Request-Driven Updates (2026-05-18)

1. Secondary map panel
- Added a second plot panel below the main figure for track-map visualization.
- Map rendering supports AiM latitude/longitude channels and GP Bikes PosX/PosY channels.

2. Combined visibility behavior
- Updated layout behavior so map display does not hide or replace the Time Slip subplot.
- Main plot and map remain visible together.

3. Time Slip/map overlap prevention
- Main plot container height is synchronized with active Plotly figure height so Time Slip remains visible when enabled.

4. Map zoom persistence during offset edits
- Map zoom/pan view is preserved during offset-triggered map redraws (for example, changing `X Offset`/`Y Offset`).
- Map view resets only on explicit map purge/reset flows.

5. Main-plot to map hover synchronization
- Added main-plot hover linkage that highlights the corresponding sample location on the map.
- Implemented point identity mapping using per-sample keys and Plotly `customdata`.

6. Hover binding robustness
- Fixed runtime error from early hover-handler attachment by binding only after main plot initialization.
- Added guards for environments where plot event methods are not available yet.

Recent Request-Driven Updates (2026-05-18, Alignment and Origin)

1. Lat/Lon -> local XY derivation model
- Added derived local map columns from latitude/longitude:
	- `Map X`
	- `Map Y`
- Derived XY values are anchored to a computed center origin from AiM latitude/longitude data.
- Original unshifted derived XY arrays are retained in per-log metadata (`meta.mapDerivedXY`) for stable re-derivation and fitting.

2. Offset semantics (single-application rule)
- Imported GP Bikes `PosX`/`PosY` data remains unchanged.
- Offset is applied only to derived `Map X`/`Map Y` values.
- Offset is applied once at dataset derivation/update time, not again during plotting.
- Plot traces consume current dataset values directly to avoid double-offset behavior.

3. Auto-fit offset computation
- Added least-squares translation fitting between GP Bikes `PosX`/`PosY` and AiM-derived map XY.
- Fit solves translation-only parameters:
	- `offsetX`
	- `offsetY`
- Fit reports average alignment error (mean absolute point error) and point count.
- Fit uses unshifted base derived XY values (`meta.mapDerivedXY`) so fit quality is not biased by previously applied display offsets.

4. GP Bikes derived latitude/longitude
- Added derived geodetic channels for GP Bikes logs:
	- `Derived Latitude`
	- `Derived Longitude`
- Derived Lat/Lng are computed from GP Bikes `PosX`/`PosY` using inverse local XY transform and the active origin.
- Conversion uses:
	- `localX = PosX - offsetX`
	- `localY = PosY - offsetY`
- Derived columns are exposed to plotting selectors when available.

5. Origin selection and fallback behavior
- Origin priority for GP Bikes derived Lat/Lng:
	1. Auto-fit origin (when fit is available)
	2. AiM-derived center origin (when AiM lat/lon exists)
	3. User-entered manual center (`Center Lat`, `Center Lng`)
- When no fit exists but an AiM or manual origin exists, GP Bikes Derived Lat/Lng are still generated.
- If no origin exists, status text prompts for manual center entry.

6. Center Lat/Lng controls and auto-fill behavior
- Added map alignment inputs:
	- `Center Lat (deg)`
	- `Center Lng (deg)`
- When a center is calculated automatically (fit/AiM origin), inputs auto-populate only if the user has not manually edited center fields.
- Once user edits center fields manually, auto-overwrite of those fields is disabled until session reset (`Clear All`).

7. Map fit status messaging enhancements
- `mapFitInfo` now includes center origin coordinates in addition to existing fit/offset/error text.
- Status retains existing fit/error details and appends center Lat/Lng for transparency.

8. Recompute triggers
- Changing X/Y offset triggers full replot and recomputation of:
	- derived `Map X`/`Map Y`
	- GP Bikes `Derived Latitude`/`Derived Longitude`
- Center origin typically remains fixed during offset edits unless origin source changes.