(() => {
  const fileInput = document.getElementById('fileInput');
  const filesList = document.getElementById('filesList');
  const ySelect = document.getElementById('ySelect');
  const ySelectSearch = document.getElementById('ySelectSearch');
  const plotTypeLinesInput = document.getElementById('plotTypeLines');
  const plotTypeMarkersInput = document.getElementById('plotTypeMarkers');
  const selectedYColors = document.getElementById('selectedYColors');
  const colorAxisSelect = document.getElementById('colorAxisSelect');
  const colorAxisLegendDiv = document.getElementById('colorAxisLegend');
  const binnedPlotEnabledInput = document.getElementById('binnedPlotEnabled');
  const binnedPlotAxisSelect = document.getElementById('binnedPlotAxis');
  const binnedPlotBinWidthInput = document.getElementById('binnedPlotBinWidth');
  const xCustomSelect = document.getElementById('xCustomSelect');
  const logXAxisInput = document.getElementById('logXAxis');
  const logYAxisInput = document.getElementById('logYAxis');
  const showMapInput = document.getElementById('showMap');
  const mapColorEnabledInput = document.getElementById('mapColorEnabled');
  const mapColorSelect = document.getElementById('mapColorSelect');
  const mapDrawModeSelect = document.getElementById('mapDrawMode');
  const mapColorModeSelect = document.getElementById('mapColorMode');
  const showCornersInput = document.getElementById('showCorners');
  const cornerShadeOpacityInput = document.getElementById('cornerShadeOpacity');
  const cornerSwapLRInput = document.getElementById('cornerSwapLR');
  const cornerTrackInfoDiv = document.getElementById('cornerTrackInfo');
  const cornerEditToggleBtn = document.getElementById('cornerEditToggleBtn');
  const cornerEditorPanel = document.getElementById('cornerEditorPanel');
  const cornerEditorList = document.getElementById('cornerEditorList');
  const cornerEditorStatus = document.getElementById('cornerEditorStatus');
  const cornerEditorMergeStraightBtn = document.getElementById('cornerEditorMergeStraight');
  const cornerEditorMergeLeftBtn = document.getElementById('cornerEditorMergeLeft');
  const cornerEditorMergeRightBtn = document.getElementById('cornerEditorMergeRight');
  const cornerEditorResetBtn = document.getElementById('cornerEditorResetBtn');
  const vehicleSimUseElevationInput = document.getElementById('vehicleSimUseElevation');
  const vehicleSimulateBtn = document.getElementById('vehicleSimulateBtn');
  const vehicleSimStatus = document.getElementById('vehicleSimStatus');
  const vehicleSimNameInput = document.getElementById('vehicleSimName');
  const vehicleSimNotesInput = document.getElementById('vehicleSimNotes');
  const vehicleSimRenameBtn = document.getElementById('vehicleSimRenameBtn');
  const vehicleSimClassRadios = Array.from(document.querySelectorAll('input[name="vehicleSimClass"]'));
  const vehicleSimInfoBtn = document.getElementById('vehicleSimInfoBtn');
  const vehicleSimLoggedBtn = document.getElementById('vehicleSimLoggedBtn');
  const vehicleSimVehicleSelect = document.getElementById('vehicleSimVehicleSelect');
  const vehicleSimVehicleEditBtn = document.getElementById('vehicleSimVehicleEditBtn');
  const vehicleSimVehicleNewBtn = document.getElementById('vehicleSimVehicleNewBtn');
  const vehicleSimRiderSelect = document.getElementById('vehicleSimRiderSelect');
  const vehicleSimRiderEditBtn = document.getElementById('vehicleSimRiderEditBtn');
  const vehicleSimRiderNewBtn = document.getElementById('vehicleSimRiderNewBtn');
  const vehicleSimVehicleHint = document.getElementById('vehicleSimVehicleHint');
  const vehicleSimPowerModelSelect = document.getElementById('vehicleSimPowerModel');
  const uiPanel7 = document.getElementById('uiPanel7');
  const appVersionLabel = document.getElementById('appVersionLabel');
  const clearBtn = document.getElementById('clearBtn');
  const downloadDisplayedDataBtn = document.getElementById('downloadDisplayedDataBtn');
  const downloadSettingsBtn = document.getElementById('downloadSettingsBtn');
  const uploadSettingsBtn = document.getElementById('uploadSettingsBtn');
  const settingsFileInput = document.getElementById('settingsFileInput');
  const settingsIoStatus = document.getElementById('settingsIoStatus');
  const downloadVehiclesRidersBtn = document.getElementById('downloadVehiclesRidersBtn');
  const uploadVehiclesRidersBtn = document.getElementById('uploadVehiclesRidersBtn');
  const vehiclesRidersFileInput = document.getElementById('vehiclesRidersFileInput');
  const vehiclesRidersIoStatus = document.getElementById('vehiclesRidersIoStatus');
  const googleDriveConnectBtn = document.getElementById('googleDriveConnectBtn');
  const googleDriveDisconnectBtn = document.getElementById('googleDriveDisconnectBtn');
  const googleDriveStatus = document.getElementById('googleDriveStatus');
  const googleDriveActions = document.getElementById('googleDriveActions');
  const googleDriveActionsStatus = document.getElementById('googleDriveActionsStatus');
  const googleDriveImportCsvBtn = document.getElementById('googleDriveImportCsvBtn');
  const googleDriveBackupAllBtn = document.getElementById('googleDriveBackupAllBtn');
  const googleDriveRestoreAllBtn = document.getElementById('googleDriveRestoreAllBtn');
  const googleDriveBackupVehiclesRidersBtn = document.getElementById('googleDriveBackupVehiclesRidersBtn');
  const googleDriveRestoreVehiclesRidersBtn = document.getElementById('googleDriveRestoreVehiclesRidersBtn');
  const authorNameInput = document.getElementById('authorNameInput');
  const authorNameStatus = document.getElementById('authorNameStatus');
  const storedFilesList = document.getElementById('storedFilesList');
  const loadAllStoredFilesBtn = document.getElementById('loadAllStoredFilesBtn');
  const downloadAllDataBtn = document.getElementById('downloadAllDataBtn');
  const uploadDataBackupBtn = document.getElementById('uploadDataBackupBtn');
  const dataBackupFileInput = document.getElementById('dataBackupFileInput');
  const deleteAllStoredFilesBtn = document.getElementById('deleteAllStoredFilesBtn');
  const storedFilesStatus = document.getElementById('storedFilesStatus');
  const requestPersistBtn = document.getElementById('requestPersistBtn');
  const storagePersistStatus = document.getElementById('storagePersistStatus');
  const pickUploadedDataBtn = document.getElementById('pickUploadedDataBtn');
  const pickUploadedModal = document.getElementById('pickUploadedModal');
  const pickUploadedCloseBtn = document.getElementById('pickUploadedCloseBtn');
  const pickUploadedSortSelect = document.getElementById('pickUploadedSortSelect');
  const pickUploadedSearch = document.getElementById('pickUploadedSearch');
  const pickUploadedList = document.getElementById('pickUploadedList');
  const pickUploadedFileControls = document.getElementById('pickUploadedFileControls');
  const pickUploadedTabButtons = document.querySelectorAll('.pick-uploaded-tab');
  const plotDiv = document.getElementById('plotDiv');
  const mapDiv = document.getElementById('mapDiv');
  const leafletMapDiv = document.getElementById('leafletMapDiv');
  const controlsToggle = document.getElementById('controlsToggle');
  const controlsClose = document.getElementById('controlsClose');
  const controlsBackdrop = document.getElementById('controlsBackdrop');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleLabel = document.getElementById('themeToggleLabel');
  const mapXOffsetInput = document.getElementById('mapXOffset');
  const mapYOffsetInput = document.getElementById('mapYOffset');
  const mapCenterLatInput = document.getElementById('mapCenterLat');
  const mapCenterLonInput = document.getElementById('mapCenterLon');
  const mapFitInfo = document.getElementById('mapFitInfo');
  const mapFitBtn = document.getElementById('mapFitBtn');
  const addMathChannelBtn = document.getElementById('addMathChannelBtn');
  const mathChannelsList = document.getElementById('mathChannelsList');
  const mathChannelForm = document.getElementById('mathChannelForm');
  const mathChName = document.getElementById('mathChName');
  const mathChExpr = document.getElementById('mathChExpr');
  const mathChUnit = document.getElementById('mathChUnit');
  const mathChFilterEnabled = document.getElementById('mathChFilterEnabled');
  const mathChFilterControls = document.getElementById('mathChFilterControls');
  const mathChFilterAxis = document.getElementById('mathChFilterAxis');
  const mathChFilterWindow = document.getElementById('mathChFilterWindow');
  const mathChError = document.getElementById('mathChError');
  const mathChSave = document.getElementById('mathChSave');
  const mathChCancel = document.getElementById('mathChCancel');
  const mathChSuggestions = document.getElementById('mathChSuggestions');
  const mathChPreview = document.getElementById('mathChPreview');
  const addTempProfileBtn = document.getElementById('addTempProfileBtn');
  const editTempProfileDefaultsBtn = document.getElementById('editTempProfileDefaultsBtn');
  const tempProfilePlotsList = document.getElementById('tempProfilePlotsList');
  const tempProfileHiddenHint = document.getElementById('tempProfileHiddenHint');
  const dataFiltersEnabledInput = document.getElementById('dataFiltersEnabled');
  const dataFiltersControls = document.querySelector('.data-filters-controls');
  const addDataFilterBtn = document.getElementById('addDataFilterBtn');
  const dataFiltersList = document.getElementById('dataFiltersList');
  const dataFilterForm = document.getElementById('dataFilterForm');
  const dataFilterChannelSelect = document.getElementById('dataFilterChannel');
  const dataFilterRangeHint = document.getElementById('dataFilterRangeHint');
  const dataFilterModeToggle = document.getElementById('dataFilterModeToggle');
  const dataFilterModeRangeInput = document.getElementById('dataFilterModeRange');
  const dataFilterModeDiscreteInput = document.getElementById('dataFilterModeDiscrete');
  const dataFilterRangeField = document.getElementById('dataFilterRangeField');
  const dataFilterMinInput = document.getElementById('dataFilterMin');
  const dataFilterMaxInput = document.getElementById('dataFilterMax');
  const dataFilterDiscreteField = document.getElementById('dataFilterDiscreteField');
  const dataFilterValuesSelect = document.getElementById('dataFilterValues');
  const dataFilterError = document.getElementById('dataFilterError');
  const dataFilterSaveBtn = document.getElementById('dataFilterSave');
  const dataFilterCancelBtn = document.getElementById('dataFilterCancel');
  const quickModSection = document.getElementById('quickModSection');
  const quickModChannelName = document.getElementById('quickModChannelName');
  const quickModNegate = document.getElementById('quickModNegate');
  const quickModReciprocal = document.getElementById('quickModReciprocal');
  const quickModFilter = document.getElementById('quickModFilter');
  const quickModFilterControls = document.getElementById('quickModFilterControls');
  const quickModFilterWindow = document.getElementById('quickModFilterWindow');
  const quickModFilterAxis = document.getElementById('quickModFilterAxis');
  const quickModCreateBtn = document.getElementById('quickModCreateBtn');
  const importerEditorModal = document.getElementById('importerEditorModal');
  const importerEditorBackdrop = document.getElementById('importerEditorBackdrop');
  const importerEditorCloseBtn = document.getElementById('importerEditorClose');
  const importerEditorCancelBtn = document.getElementById('importerEditorCancel');
  const importerEditorSaveBtn = document.getElementById('importerEditorSave');
  const importerEditorSubtitle = document.getElementById('importerEditorSubtitle');
  const importerHeaderOverrideSection = document.getElementById('importerHeaderOverrideSection');
  const importerHeaderModeAutoInput = document.getElementById('importerHeaderModeAuto');
  const importerHeaderModeManualInput = document.getElementById('importerHeaderModeManual');
  const importerHeaderOverrideFields = document.getElementById('importerHeaderOverrideFields');
  const importerHeaderRowInput = document.getElementById('importerHeaderRowInput');
  const importerUnitsRowInput = document.getElementById('importerUnitsRowInput');
  const importerDataStartRowInput = document.getElementById('importerDataStartRowInput');
  const importerRowPreview = document.getElementById('importerRowPreview');
  const importerEditorDataFreqValue = document.getElementById('importerEditorDataFreqValue');
  const importerEditorDownsampleHzInput = document.getElementById('importerEditorDownsampleHz');
  const importerEditorRows = document.getElementById('importerEditorRows');
  const importerEditorError = document.getElementById('importerEditorError');
  const importerCustomStandardNameInput = document.getElementById('importerCustomStandardName');
  const importerCustomStandardUnitInput = document.getElementById('importerCustomStandardUnit');
  const importerCustomStandardAddBtn = document.getElementById('importerCustomStandardAdd');
  const importerCustomStandardList = document.getElementById('importerCustomStandardList');
  const selectionStatsPanel = document.getElementById('selectionStatsPanel');
  const selectionStatsBody = document.getElementById('selectionStatsBody');
  const selectionStatsClose = document.getElementById('selectionStatsClose');
  const selectionStatsHeader = document.getElementById('selectionStatsHeader');
  const selectionFitTypeSelect = document.getElementById('selectionFitTypeSelect');
  const selectionFitSlopeUnitsRow = document.getElementById('selectionFitSlopeUnitsRow');
  const selectionFitSlopeUnitsSelect = document.getElementById('selectionFitSlopeUnitsSelect');
  const selectionFitEquationRow = document.getElementById('selectionFitEquationRow');
  const selectionFitFormulaRow = document.getElementById('selectionFitFormulaRow');
  const selectionFitFormulaInput = document.getElementById('selectionFitFormulaInput');
  const selectionFitFormulaHint = document.getElementById('selectionFitFormulaHint');
  const selectionFitFormulaError = document.getElementById('selectionFitFormulaError');
  const selectionFftEnabledInput = document.getElementById('selectionFftEnabled');
  const selectionFftHint = document.getElementById('selectionFftHint');
  const fftPanel = document.getElementById('fftPanel');
  const fftPanelHeader = document.getElementById('fftPanelHeader');
  const fftPanelClose = document.getElementById('fftPanelClose');
  const fftClearForcedBtn = document.getElementById('fftClearForcedBtn');
  const fftPlotDiv = document.getElementById('fftPlotDiv');
  // Box/Lasso Select are custom buttons, not Plotly's built-in select2d/lasso2d, because
  // Plotly only auto-shows those when a trace already has markers -- which channel traces
  // don't, until the user asks to select (see setSelectableMarkersEnabled). The built-in
  // ones are explicitly removed so they don't also reappear (duplicated) once markers are
  // added. attr/val make Plotly highlight these exactly like its native dragmode buttons.
  const plotlyConfig = {
    responsive: true,
    displaylogo: false,
    // Lets the user drag a selection-fit annotation's text box (its arrow stays anchored
    // to the fit) out from under overlapping data -- Plotly keys draggability off each
    // annotation's own showarrow: true here for the fit boxes, false for the corner-strip
    // labels, so only the fit boxes end up draggable.
    edits: {annotationTail: true},
    modeBarButtonsToRemove: ['select2d', 'lasso2d'],
    modeBarButtonsToAdd: [
      {
        name: 'boxSelectFit',
        title: 'Box Select',
        icon: Plotly.Icons.selectbox,
        attr: 'dragmode',
        val: 'select',
        click: (gd) => Plotly.relayout(gd, {dragmode: 'select'})
      },
      {
        name: 'lassoSelectFit',
        title: 'Lasso Select',
        icon: Plotly.Icons.lasso,
        attr: 'dragmode',
        val: 'lasso',
        click: (gd) => Plotly.relayout(gd, {dragmode: 'lasso'})
      },
      {
        name: 'clearSelectionFit',
        title: 'Clear Selection & Exit Select Mode',
        icon: Plotly.Icons.eraseshape,
        click: (gd) => {
          clearSelectionFit();
          Plotly.relayout(gd, {selections: [], dragmode: 'zoom'});
        }
      },
      {
        name: 'toggleHoverData',
        title: 'Toggle Hover Data',
        icon: Plotly.Icons.tooltip_basic,
        click: (gd) => {
          // hovermode stays 'x' regardless (see updatePlot) -- Plotly only fires
          // plotly_hover at all while hovermode is truthy, and the map/track marker
          // sync (bindMainPlotHoverSync) depends on that firing even when the user
          // doesn't want the tooltip TEXT showing. So this toggles tooltip visibility
          // via CSS instead of ever setting hovermode to false.
          setHoverTooltipVisible(gd, !hoverEnabled);
        }
      },
      {
        name: 'toggleSelectionFitBoxes',
        title: 'Toggle Fit Boxes',
        icon: Plotly.Icons.drawrect,
        click: (gd) => {
          selectionFitBoxesVisible = !selectionFitBoxesVisible;
          Plotly.relayout(gd, {
            annotations: baseCornerAnnotationsForOverlay
              .concat(selectionFitBoxesVisible ? selectionFitAnnotations : [])
              .concat(notePinAnnotationsForOverlay)
          });
        }
      }
    ]
  };
  const DEFAULT_Y_CHANNEL = 'Speed';
  const HOVER_MARKER_TRACE_NAME = '__hover_marker__';
  const DERIVED_MAP_X_COL = 'Map X';
  const DERIVED_MAP_Y_COL = 'Map Y';
  const DERIVED_LAT_COL = 'Derived Latitude';
  const DERIVED_LON_COL = 'Derived Longitude';
  const COMMON_LAT_ACC_CHANNEL = 'LatAcc';
  const COMMON_LONG_ACC_CHANNEL = 'LongAcc';
  const TOTAL_ACCEL_CALC_CHANNEL = 'Total Acceleration (calc)';
  const TURN_STATE_CALC_CHANNEL = 'Turn State (calc)';
  const TURN_DIRECTION_SIGNED_CALC_CHANNEL = 'Turn Direction Signed (calc)';
  const TURN_LATACC_CENTER_AVG_CALC_CHANNEL = 'LatAcc Center Average (calc)';
  const TURN_CLASSIFICATION_THRESHOLD_G = 0.25;
  const TURN_CLASSIFICATION_CENTER_WINDOW_SEC = 0.6;
  const TURN_FILTER_FALLBACK_RADIUS_SAMPLES = 3;
  const TURN_MIN_SUSTAINED_SEC = 0.35;
  const DEFAULT_MAP_COLOR_CHANNEL_CANDIDATES = ['LongAcc', 'LonAcc', 'GPS LonAcc'];
  const AUTO_MAP_OFFSET_SAMPLE_STEP_M = 10;
  const DEFAULT_GPBIKES_TRACK_MAP_DEFAULTS = [];
  // Light mode keeps a distinct neutral gray (not page-background white) so white points
  // in divergent colormaps stay visible against it. Dark mode can just reuse the page's
  // own dark background -- white is already visible against anything that dark.
  const BLANK_BASEMAP_BACKGROUND_LIGHT = '#d2d6dc';
  const BLANK_BASEMAP_BACKGROUND_DARK = '#0f1520';

  // OpenStreetMap's own standard tile style has no dark variant. CARTO's Dark Matter
  // basemap (still OSM data underneath, just re-styled) is the common free substitute --
  // no API key needed, same as the Esri satellite tiles already used below, just
  // attribution-required. Swapped in for the 'OpenStreetMap' layer via setUrl() whenever
  // it's the active base layer and the app theme changes.
  const OSM_TILE_URL_LIGHT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const OSM_TILE_URL_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const OSM_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Esri's World Imagery tile server has uneven native resolution -- deep zoom over a
  // race track's parking lot or infield often has no source imagery yet. Rather than a
  // 404, it returns this exact placeholder graphic with a normal 200 status (confirmed
  // identical bytes at every out-of-coverage location tested, from a rural track to the
  // middle of the ocean), so Leaflet's own error handling never sees it as a failure.
  // EsriOverzoomTileLayer below fingerprints it by byte size and steps back a zoom level
  // (cropping/scaling the shallower tile to fill the request) instead of showing it.
  // (Deliberately not also hashing the bytes: crypto.subtle needs a secure context --
  // HTTPS or localhost -- and this app also ships as a standalone ESP32 build, typically
  // reached over plain http:// on the local network. The byte length alone is already
  // distinctive enough against real tiles, which run 12-15KB.)
  const ESRI_NO_DATA_TILE_BYTE_LENGTH = 2521;
  const ESRI_OVERZOOM_MIN_ZOOM = 0; // hard floor on how far back the fallback will step

  function isEsriNoDataTile(buffer) {
    return buffer.byteLength === ESRI_NO_DATA_TILE_BYTE_LENGTH;
  }

  // Esri World Imagery layer that "overzooms" past its real coverage: when the tile for
  // the requested zoom is the no-data placeholder, it fetches the same location one zoom
  // level shallower and crops/scales the matching quadrant to fill the tile, repeating
  // until it finds real imagery (or hits ESRI_OVERZOOM_MIN_ZOOM). This is only wired up
  // for the Esri layer -- OSM/CARTO have full global coverage and never hit this gap.
  const EsriOverzoomTileLayer = L.TileLayer.extend({
    createTile: function (coords, done) {
      const tile = document.createElement('img');
      tile.alt = '';
      this._loadBestAvailableTile(tile, coords, coords.z, done);
      return tile;
    },

    _urlForZoom: function (x, y, z) {
      return this._url.replace('{z}', z).replace('{x}', x).replace('{y}', y);
    },

    _loadBestAvailableTile: function (tile, coords, zoom, done) {
      if (zoom < ESRI_OVERZOOM_MIN_ZOOM) {
        done(new Error('No Esri imagery available for this location'), tile);
        return;
      }
      const scaleFactor = Math.pow(2, coords.z - zoom);
      const sourceX = Math.floor(coords.x / scaleFactor);
      const sourceY = Math.floor(coords.y / scaleFactor);
      fetch(this._urlForZoom(sourceX, sourceY, zoom))
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buffer) => {
          if (isEsriNoDataTile(buffer)) {
            this._loadBestAvailableTile(tile, coords, zoom - 1, done);
            return;
          }
          const objectUrl = URL.createObjectURL(new Blob([buffer]));
          if (scaleFactor === 1) {
            tile.onload = () => { URL.revokeObjectURL(objectUrl); done(null, tile); };
            tile.onerror = (err) => { URL.revokeObjectURL(objectUrl); done(err, tile); };
            tile.src = objectUrl;
            return;
          }
          // Requested tile is deeper than the real imagery found -- crop the matching
          // quadrant out of the shallower tile and scale it up to fill this tile's cell.
          const img = new Image();
          img.onload = () => {
            const size = this.getTileSize().x;
            const cropSize = size / scaleFactor;
            const sx = (coords.x % scaleFactor) * cropSize;
            const sy = (coords.y % scaleFactor) * cropSize;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            canvas.getContext('2d').drawImage(img, sx, sy, cropSize, cropSize, 0, 0, size, size);
            URL.revokeObjectURL(objectUrl);
            tile.onload = () => done(null, tile);
            tile.src = canvas.toDataURL('image/jpeg', 0.85);
          };
          img.onerror = (err) => { URL.revokeObjectURL(objectUrl); done(err, tile); };
          img.src = objectUrl;
        })
        .catch((err) => done(err, tile));
    }
  });

  const logs = []; // {id, name, data: [rows], cols: [names], meta: {timeCol, distCol, latCol, lonCol, computedDistance}}

  // Fallback channel mapping if channel-map.json is unavailable.
  // Each entry: { displayName, piboso, aim, motec }
  const DEFAULT_CHANNEL_MAP = [
    { displayName: 'Speed', piboso: 'Speed', aim: 'GPS Speed', motec: 'Ground Speed' },
    { displayName: 'Radius', piboso: 'Radius', aim: 'GPS Radius', motec: 'Radius' },
    { displayName: 'LatAcc', piboso: 'LatAcc', aim: 'GPS LatAcc', motec: 'G Force Lat' },
    { displayName: 'LongAcc', piboso: 'LonAcc', aim: 'GPS LonAcc', motec: 'G Force Long' },
    { displayName: 'Total Acceleration (calc)', piboso: 'Total Acceleration (calc)', aim: 'Total Acceleration (calc)', motec: 'Total Acceleration (calc)' },
    { displayName: 'Altitude', piboso: 'PosY_3D', aim: 'GPS Altitude', motec: 'Altitude' },
    { displayName: 'Slope', piboso: '', aim: 'GPS Slope', motec: 'Slope' },
  ];
  let channelMap = DEFAULT_CHANNEL_MAP.slice();
  let gpbikesTrackMapDefaults = DEFAULT_GPBIKES_TRACK_MAP_DEFAULTS.slice();
  const channelColorOverrides = new Map();
  // channel -> { type: 'own' } | { type: 'peer', channel }. Manual y-axis assignment set
  // via the axis picker in the selected-channels list; absent = auto-group by unit (see
  // resolveAxisGroupKey/groupChannelsByAxis). Session-only, same lifetime as
  // channelColorOverrides above.
  const manualAxisOverrides = new Map();
  // "fileId::lap" -> hex color. Per-file (not just per-lap-number) so two files that
  // happen to share a lap number can still be colored independently; falls back to
  // colorForLap()'s deterministic default wherever no override has been set.
  const lapColorOverrides = new Map();
  // "channel category" -> hex color, assigned stably the same way channelColorOverrides
  // is: first unused COLORS entry, kept forever once assigned, so a category's color doesn't
  // shift when the visible set of categories changes (e.g. a lap filter).
  const colorAxisCategoryColorOverrides = new Map();
  // channel -> Set of category values (numbers or trimmed strings, matching the category's
  // own type) the user has clicked off in the discrete legend. Points in a hidden category
  // are dropped from every trace, across all files/laps/Y channels, until clicked back on.
  const colorAxisHiddenCategoriesByChannel = new Map();
  // A numeric channel is treated as discrete (categorical) rather than continuous when its
  // distinct-value count is small in absolute terms, or small relative to the number of
  // samples (e.g. a Gear or Flag channel sampled at 100k rows but only a handful of values).
  const COLOR_AXIS_DISCRETE_ABS_MAX = 20;
  const COLOR_AXIS_DISCRETE_RATIO_MAX_COUNT = 30;
  const COLOR_AXIS_DISCRETE_RATIO_THRESHOLD = 0.05;
  const mathChannels = []; // { name, expression, unit, smoothing? }
  const dataFilters = []; // { channel, min: number|null, max: number|null, enabled }
  let dataFilterEditIdx = -1; // -1 = add mode, >=0 = editing existing filter

  // Temperature Profile Plots: named groupings of channels (e.g. "LF External") rendered
  // as a heatmap strip (X = time/distance, Y = channel, color = value) between the main
  // plot and Time Slip. See TEMP_COLORMAPS below for the curated colormap stop tables.
  let tempProfilePlots = []; // { id, name, channels: [...ordered display names], enabled,
                             //   useDefaultRange, colormap, min, max, aboveColor, belowColor }
  let tempProfileDefaults = { colormap: 'Jet', min: 100, max: 250, aboveColor: '#FF00FF', belowColor: '#000000' };
  const TEMP_PROFILE_ROWS_HEIGHT_KEY = 'tempProfilePlotsHeightPx';
  const TEMP_PROFILE_ROWS_DEFAULT_HEIGHT_PX = 220;
  const TEMP_PROFILE_ROWS_MIN_HEIGHT_PX = 80;
  const TEMP_PROFILE_MAIN_MIN_HEIGHT_PX = 120;
  let tempProfileRowsHeightPx = TEMP_PROFILE_ROWS_DEFAULT_HEIGHT_PX;
  const TEMP_PROFILE_MULTI_LAP_OPACITY = 0.6;
  let lastIncludeTimeSlipForResize = false; // refreshed each updatePlot(), read by both drag handles below
  let tempProfileResizeHandleEl = null;

  // Mobile has no drag handle (desktop-only, like the temp-profile/Time-Slip resize handles
  // above), so tempProfileRowsHeightPx's draggable-preference approach doesn't apply there --
  // instead each active plot gets a height sized to its own channel count, and the *total*
  // figure height (getFigureHeight) grows to fit rather than squeezing everything into a
  // fixed mobile budget. The page already scrolls normally on mobile (only the >=981px
  // breakpoint pins body/main to the viewport), so a taller figure just becomes scrollable.
  const MOBILE_TEMP_PLOT_ROW_HEIGHT_PX = 26;
  const MOBILE_TEMP_PLOT_MIN_HEIGHT_PX = 70;
  function computeMobileTempPlotsHeightPx(tempPlots) {
    return (tempPlots || []).reduce((sum, p) => {
      const rows = Array.isArray(p.channels) ? p.channels.length : 0;
      return sum + Math.max(MOBILE_TEMP_PLOT_MIN_HEIGHT_PX, rows * MOBILE_TEMP_PLOT_ROW_HEIGHT_PX);
    }, 0);
  }

  // Time Slip's own draggable height, same idea/mechanics as the temp-profile-plots block
  // above -- see ensureTimeSlipResizeHandle/positionTimeSlipResizeHandle near buildLayout.
  const TIME_SLIP_HEIGHT_KEY = 'timeSlipHeightPx';
  const TIME_SLIP_DEFAULT_HEIGHT_PX = 150;
  const TIME_SLIP_MIN_HEIGHT_PX = 80;
  let timeSlipHeightPx = TIME_SLIP_DEFAULT_HEIGHT_PX;
  let timeSlipResizeHandleEl = null;

  // "Shaded area between all laps" (shadeLaps checkbox) -- defaults to checked in the HTML
  // (see index.html); persisted so an explicit choice survives reload.
  const SHADE_LAPS_STORAGE_KEY = 'shadeLapsEnabled';

  // Curated colormap stop tables, extracted verbatim from this app's own bundled
  // plotly.js-cartesian-dist (node_modules/plotly.js-cartesian-dist/plotly-cartesian.js)
  // so the custom under/over-range colorscale built in buildTempProfileColorscale()
  // visually matches Plotly's own named scales.
  const TEMP_COLORMAPS = {
    Jet: [[0,'rgb(0,0,131)'],[0.125,'rgb(0,60,170)'],[0.375,'rgb(5,255,255)'],[0.625,'rgb(255,255,0)'],[0.875,'rgb(250,0,0)'],[1,'rgb(128,0,0)']],
    Rainbow: [[0,'rgb(150,0,90)'],[0.125,'rgb(0,0,200)'],[0.25,'rgb(0,25,255)'],[0.375,'rgb(0,152,255)'],[0.5,'rgb(44,255,150)'],[0.625,'rgb(151,255,0)'],[0.75,'rgb(255,234,0)'],[0.875,'rgb(255,111,0)'],[1,'rgb(255,0,0)']],
    Hot: [[0,'rgb(0,0,0)'],[0.3,'rgb(230,0,0)'],[0.6,'rgb(255,210,0)'],[1,'rgb(255,255,255)']],
    Portland: [[0,'rgb(12,51,131)'],[0.25,'rgb(10,136,186)'],[0.5,'rgb(242,211,56)'],[0.75,'rgb(242,143,56)'],[1,'rgb(217,30,30)']],
    Electric: [[0,'rgb(0,0,0)'],[0.15,'rgb(30,0,100)'],[0.4,'rgb(120,0,100)'],[0.6,'rgb(160,90,0)'],[0.8,'rgb(230,200,0)'],[1,'rgb(255,250,220)']],
    Viridis: [[0,'#440154'],[0.0627,'#48186a'],[0.1255,'#472d7b'],[0.1882,'#424086'],[0.251,'#3b528b'],[0.3137,'#33638d'],[0.3765,'#2c728e'],[0.4392,'#26828e'],[0.502,'#21918c'],[0.5647,'#1fa088'],[0.6275,'#28ae80'],[0.6902,'#3fbc73'],[0.7529,'#5ec962'],[0.8157,'#84d44b'],[0.8784,'#addc30'],[0.9412,'#d8e219'],[1,'#fde725']],
    RdBu: [[0,'rgb(5,10,172)'],[0.35,'rgb(106,137,247)'],[0.5,'rgb(190,190,190)'],[0.6,'rgb(220,170,132)'],[0.7,'rgb(230,145,90)'],[1,'rgb(178,10,28)']]
  };
  const TEMP_COLORMAP_NAMES = ['Jet', 'Rainbow', 'Hot', 'Portland', 'Electric', 'Viridis', 'RdBu'];

  // Hovering a lap row in the sidebar laps list temporarily previews that lap's traces on
  // the plot even when it isn't checked -- cleared on mouseleave. See renderLapsList's
  // .lap-item hover wiring and the isPreviewOnly check in updatePlot()'s main trace loop.
  let hoverPreviewLap = null; // { fileId, lap } | null
  let hoverPreviewTimer = null;

  // Quick modify state
  const QUICK_MOD_PREVIEW_PREFIX = 'Quick Mod: ';
  let quickModPreviewName = null; // name of the current preview channel (or null)
  let quickModState = {
    channel: null,       // base channel being modified
    negate: false,
    reciprocal: false,
    filter: false,
    filterWindow: 0.5,
    filterAxis: 'time'   // 'time' | 'distance' | any other numeric channel name
  };
  let quickModEditorOpen = false;
  let quickModOriginalVisible = true;

  const IMPORTER_FILTER_AXES = ['time', 'distance'];
  const IMPORTER_CUSTOM_STANDARD_CHANNELS_STORAGE_KEY = 'importerCustomStandardChannels';
  const SELECTION_FIT_TYPE_STORAGE_KEY = 'selectionFitType';
  const SELECTION_FIT_FORMULA_STORAGE_KEY = 'selectionFitFormula';
  const SELECTION_FIT_SLOPE_UNITS_STORAGE_KEY = 'selectionFitSlopeUnits';
  const DEFAULT_SELECTION_FIT_TYPE = 'linear';
  const DEFAULT_SELECTION_FIT_SLOPE_UNITS = 'auto'; // 'auto' (Y-unit / X-unit) or 'g' (speed-vs-time only)
  const DEFAULT_SELECTION_FIT_FORMULA = 'p0*sin(p1*t + p2) + p3';
  const SELECTION_FIT_TYPE_OPTIONS = new Set(['linear', 'sinusoidal', 'sineExponential', 'exponential', 'firstOrderResponse', 'secondOrderResponse', 'ellipse', 'formula']);
  const IMPORTER_BUILTIN_STANDARD_CHANNELS = [
    { displayName: 'Time', unit: 's' },
    { displayName: 'Distance', unit: 'm' },
    { displayName: 'Latitude', unit: 'deg' },
    { displayName: 'Longitude', unit: 'deg' },
    { displayName: 'PosX', unit: 'm' },
    { displayName: 'PosY', unit: 'm' }
  ];
  let importerEditorState = {
    isOpen: false,
    logId: null,
    decoderName: '',
    dataFrequencyHz: null,
    downsampleHz: null,
    channels: {},
    filters: {},
    rawRows: null,
    headerOverrideSupported: false,
    headerOverride: null
  };
  let customStandardChannels = [];

  // Shorthand math names available in expressions (e.g. sin, cos, PI instead of Math.sin etc.)
  const MATH_SCOPE = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    asin: Math.asin, acos: Math.acos, atan: Math.atan, atan2: Math.atan2,
    sqrt: Math.sqrt, abs: Math.abs, pow: Math.pow,
    log: Math.log, log2: Math.log2, log10: Math.log10, exp: Math.exp,
    floor: Math.floor, ceil: Math.ceil, round: Math.round,
    min: Math.min, max: Math.max, sign: Math.sign, hypot: Math.hypot,
    PI: Math.PI, E: Math.E,
  };
  const MATH_SCOPE_KEYS = Object.keys(MATH_SCOPE);
  const MATH_SCOPE_VALS = Object.values(MATH_SCOPE);

  const COLORS = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];
  const DASHES = ['solid','dash','dot','dashdot','longdash','longdashdot'];
  const CORNER_STRAIGHT_COLOR = COLORS[2]; // green
  const CORNER_RIGHT_COLOR = COLORS[1]; // orange
  const CORNER_LEFT_COLOR = COLORS[4]; // purple
  const CORNER_TYPE_LABELS = { straight: 'Straight', left: 'Left', right: 'Right' };
  // Corner/straight background trace drawn behind the map's lap lines when "Show
  // corners" is checked -- thickness in track meters (~5-10m) and opacity, both tuned
  // here rather than exposed as UI controls.
  const CORNER_MAP_BACKGROUND_WIDTH_M = 8;
  const CORNER_MAP_BACKGROUND_ALPHA = 0.4;
  const CORNER_STRIP_DOMAIN = [0.96, 1];
  const CORNER_STRIP_GAP = 0.02; // reserved blank space between strip and main plot
  const CURVATURE_SMOOTH_HALF_WINDOW_M = 35;
  const CURVATURE_SMOOTHED_CHANNEL = 'Curvature (Smoothed 35m)';
  const RACING_LINE_DEFAULT_WEIGHTS = {
    alpha: 1.0, // curvature-smoothness weight
    beta: 1.0   // data-fidelity weight
  };
  // Shared straight/left/right -> color mapping for anything that shades by corner type
  // (the corner strip above the main plot, and the map's corner background trace).
  function cornerTypeColor(type) {
    if (type === 'right') return CORNER_RIGHT_COLOR;
    if (type === 'left') return CORNER_LEFT_COLOR;
    return CORNER_STRAIGHT_COLOR;
  }
  let mapHoverLookup = new Map(); // key -> {x, y}
  let mapHoverMarkerVisible = false;
  let isApplyingAutoOffset = false;
  let isApplyingAutoCenter = false;
  let mapOffsetManuallyAdjusted = false;
  let mapCenterManuallyAdjusted = false;
  // Once the user explicitly checks/unchecks "Show Map", stop auto-deciding its
  // state from whether the loaded data has map info -- respect their choice.
  let showMapManuallyToggled = false;
  let lastAppliedShowMapColumn = null; // tracks whether the map grid column was shown last render
  let lastAutoOffsetSignature = '';
  let lastTrackDefaultSignature = '';
  let mapViewState = null;
  let leafletMap = null;
  let leafletLayers = []; // array of layer groups
  let leafletCornerBgLayers = []; // [{layer, refLat}] current corner/straight background polylines, rescaled on zoom
  let leafletCornerBgMode = null; // 'geo' | 'xy' -- which meters->pixels formula applies to leafletCornerBgLayers
  let leafletViewState = null;
  let leafletViewStateUserSet = false;
  let leafletXYViewState = null;
  let leafletXYViewStateUserSet = false;
  let leafletMapMode = null; // 'geo' | 'xy'
  let isApplyingLeafletProgrammaticView = false;
  let leafletHoverLookup = new Map(); // key -> {lat, lon}
  let leafletHoverMarker = null;
  let leafletColorLegendControl = null;
  let leafletOsmLayer = null; // the 'OpenStreetMap' base layer -- its tile URL swaps with the app theme
  let leafletMapColorManualRanges = new Map(); // channel -> {min, max}
  let mapFullscreenActive = false;
  let currentTsTraces = []; // latest timeslip traces for Y-range recomputation on X zoom
  let isSyncingPlotHover = false;
  let lastLinkedHoverKey = null;
  let activeCornerHeadingSegments = []; // clickable corner/straight strip segments for current plot
  let cornerEditMode = false;
  let cornerEditorSegments = null; // in-memory {type,startDist,endDist}[] being edited
  let cornerEditorSelected = new Set(); // selected row indices into cornerEditorSegments, for merging
  let cornerEditorCombineFromIndex = null; // row index pinned as the "combine from" endpoint, or null
  let cornerEditorVenueKey = ''; // normalizeVenueKey() of the venue the editor is currently bound to
  let activeCornerDataForFitting = null;
  let activeCornerReferenceForFitting = null;
  let mainPlotXRange = null; // persisted x-range for main plot, independent of y-channel selection
  let mainPlotXRangeSignature = '';
  let baseCornerShapesForOverlay = []; // corner/straight shading shapes, kept separate so selection fit lines can be layered on top
  let baseCornerAnnotationsForOverlay = []; // corner labels, kept separate so selection fit annotations can be layered on top
  let selectionFitShapes = []; // temporary best-fit line(s) drawn for the current box/lasso selection
  let selectionFitAnnotations = []; // on-plot text mirroring the selection stats panel, so PNG exports carry the same numbers
  // Pinned-note markers ("Pin on Graph"). Always appended LAST in every annotations
  // merge below (after selectionFitAnnotations) so the pre-existing annotation-index
  // math for dragging a selection-fit annotation's tail (see the plotly_relayout
  // handler's `annotations[idx]` regex) keeps working unmodified -- it assumes
  // selectionFitAnnotations are the tail of the array.
  let notePinAnnotationsForOverlay = [];
  // Hides the on-plot colored annotation boxes above (declutters the graph while
  // inspecting a fit) without discarding the fit itself -- selectionFitAnnotations still
  // holds the real content so switching this back on doesn't need a new selection.
  let selectionFitBoxesVisible = true;
  let mainPlotXAxisTitle = ''; // x-axis label of the trace currently rendered, reused by the selection stats panel
  let mainPlotXAxisUnit = ''; // bare unit ('s', 'm', a custom channel's unit, or '') of the same axis -- see getXAxisUnit/getFrequencyUnitLabel
  let selectModeActive = false; // true while the box/lasso select tool is the active drag mode
  let selectionFitType = DEFAULT_SELECTION_FIT_TYPE;
  let selectionFitFormula = DEFAULT_SELECTION_FIT_FORMULA;
  let selectionFitSlopeUnits = DEFAULT_SELECTION_FIT_SLOPE_UNITS;
  let selectionFitLastPoints = [];
  const SELECTION_FFT_ENABLED_STORAGE_KEY = 'selectionFftEnabled';
  let selectionFftEnabled = false;
  // Frequency in cycles per x-axis-unit (only really "Hz" when the x-axis is time -- see
  // getFrequencyUnitLabel), set by clicking a point in the FFT panel.
  let selectionSinFitForcedFreqHz = null;
  // Hover tooltips default off on mobile, where they mostly just get in the way of touch
  // panning; desktop keeps the traditional always-on hover. User's manual toggle (see the
  // modebar button) sticks regardless of later window resizes.
  let hoverEnabled = window.innerWidth > 980;

  // Shows/hides the hover tooltip TEXT without touching layout.hovermode (which stays
  // 'x' always -- see updatePlot) -- Plotly stops firing plotly_hover entirely whenever
  // hovermode is false, and the map/track marker following the mouse depends on that
  // event, so hovermode can't be the thing this toggles. .hoverlayer is Plotly's own SVG
  // group for rendered hover labels; hiding it via CSS leaves hover computation (and the
  // marker sync) running normally.
  function setHoverTooltipVisible(gd, visible) {
    hoverEnabled = visible;
    const target = gd || plotDiv;
    if (target) target.classList.toggle('hover-tooltip-hidden', !visible);
    const btn = document.querySelector('.modebar-btn[data-title="Toggle Hover Data"]');
    if (btn) btn.classList.toggle('is-active', visible);
  }

  // Start/finish-line lap editor state -- lets a log's laps be recomputed from where its
  // GPS track crosses a user-drawn line, instead of trusting the file format's own
  // (sometimes unreliable, e.g. VBOX) lap splitter. Only one file's line can be actively
  // drawn/edited at a time.
  let startFinishEditLogId = null; // id of the log currently being edited, or null
  let startFinishDrawPoints = []; // [{lat,lon}, ...] 0-2 points placed so far this session
  let startFinishDrawMarkers = []; // draggable Leaflet markers for the points above
  let startFinishDrawLine = null; // connecting Leaflet polyline, once both points exist
  let startFinishMapClickHandler = null; // bound fn currently attached to leafletMap's click event
  let startFinishEditStatusMessage = ''; // status/error text shown in the inline editor panel
  // Plotly.relayout({shapes:...}) internally reapplies ("reselects") the current drag
  // selection, synchronously re-emitting plotly_selected/plotly_deselect from inside that
  // same call. Without this guard, our own relayout-in-response-to-selection would trigger
  // itself again recursively.
  let suppressSelectionReentry = false;

  function resizeVisualizations() {
    if (plotDiv && plotDiv.data) {
      Plotly.Plots.resize(plotDiv);
    }
    if (mapDiv && mapDiv.data) {
      Plotly.Plots.resize(mapDiv);
    }
    if (leafletMap) {
      syncLeafletContainerHeight();
      leafletMap.invalidateSize();
    }
  }

  function scheduleVisualizationResize() {
    // Resize now and again after CSS transitions so Plotly/Leaflet fill the new width.
    requestAnimationFrame(resizeVisualizations);
    setTimeout(resizeVisualizations, 120);
    setTimeout(resizeVisualizations, 240);
  }

  function syncLeafletContainerHeight() {
    if (!leafletMapDiv || !mapDiv) return;
    const targetHeight = Math.max(160, Math.round(mapDiv.clientHeight || getMapFigureHeight() || 300));
    leafletMapDiv.style.height = `${targetHeight}px`;
    leafletMapDiv.style.minHeight = `${targetHeight}px`;
  }

  function rowKey(fileId, lap, rowIndex) {
    return `${fileId}|${lap}|${rowIndex}`;
  }

  function showMapHoverMarker(key) {
    if (!mapDiv || !key || !mapHoverLookup.has(key)) {
      clearMapHoverMarker();
      return;
    }
    const point = mapHoverLookup.get(key);
    const lastIndex = (mapDiv.data && mapDiv.data.length > 0) ? mapDiv.data.length - 1 : -1;
    if (lastIndex < 0 || mapDiv.data[lastIndex].name !== HOVER_MARKER_TRACE_NAME) return;

    Plotly.restyle(mapDiv, {
      x: [[point.x]],
      y: [[point.y]],
      visible: true
    }, [lastIndex]);
    mapHoverMarkerVisible = true;
  }

  function clearMapHoverMarker() {
    if (!mapDiv || !mapHoverMarkerVisible) return;
    const lastIndex = (mapDiv.data && mapDiv.data.length > 0) ? mapDiv.data.length - 1 : -1;
    if (lastIndex < 0 || mapDiv.data[lastIndex].name !== HOVER_MARKER_TRACE_NAME) return;
    Plotly.restyle(mapDiv, { x: [[]], y: [[]], visible: false }, [lastIndex]);
    mapHoverMarkerVisible = false;
  }

  function showLeafletHoverMarker(key) {
    if (!leafletMap || !key || !leafletHoverLookup.has(key)) {
      clearLeafletHoverMarker();
      return;
    }

    const point = leafletHoverLookup.get(key);
    if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) {
      clearLeafletHoverMarker();
      return;
    }

    if (!leafletHoverMarker) {
      leafletHoverMarker = L.circleMarker([point.lat, point.lon], {
        radius: 7,
        color: '#111',
        weight: 2,
        fillColor: '#fff',
        fillOpacity: 0.9,
        interactive: false
      }).addTo(leafletMap);
      return;
    }

    leafletHoverMarker.setLatLng([point.lat, point.lon]);
    if (!leafletMap.hasLayer(leafletHoverMarker)) {
      leafletHoverMarker.addTo(leafletMap);
    }
  }

  function clearLeafletHoverMarker() {
    if (!leafletMap || !leafletHoverMarker) return;
    if (leafletMap.hasLayer(leafletHoverMarker)) {
      leafletMap.removeLayer(leafletHoverMarker);
    }
  }

  function bindMapViewStateSync() {
    if (!mapDiv || mapDiv.__viewStateSyncBound) return;
    if (typeof mapDiv.on !== 'function') return;
    mapDiv.__viewStateSyncBound = true;

    mapDiv.on('plotly_relayout', (eventData) => {
      if (!eventData || typeof eventData !== 'object') return;

      if (Object.prototype.hasOwnProperty.call(eventData, 'xaxis.autorange') && eventData['xaxis.autorange']) {
        mapViewState = null;
        return;
      }

      const x0 = Number(eventData['xaxis.range[0]']);
      const x1 = Number(eventData['xaxis.range[1]']);
      const y0 = Number(eventData['yaxis.range[0]']);
      const y1 = Number(eventData['yaxis.range[1]']);

      if (Number.isFinite(x0) && Number.isFinite(x1) && Number.isFinite(y0) && Number.isFinite(y1)) {
        mapViewState = {
          xRange: [x0, x1],
          yRange: [y0, y1]
        };
      }
    });
  }

  function computeTsYRangeForXWindow(x0, x1) {
    // Scan all current timeslip traces and return a padded [min, max] for Y values
    // whose corresponding X falls within [x0, x1]. Returns null if no data found.
    let yMin = null;
    let yMax = null;
    for (const trace of currentTsTraces) {
      const xs = trace.x;
      const ys = trace.y;
      if (!xs || !ys) continue;
      for (let i = 0; i < xs.length; i++) {
        const x = xs[i];
        const y = ys[i];
        if (y == null || !Number.isFinite(y)) continue;
        if (x < x0 || x > x1) continue;
        if (yMin === null || y < yMin) yMin = y;
        if (yMax === null || y > yMax) yMax = y;
      }
    }
    if (yMin === null || yMax === null) return null;
    const span = Math.abs(yMax - yMin);
    const scale = Math.max(Math.abs(yMin), Math.abs(yMax), 1e-6);
    const pad = Math.max(span * 0.1, scale * 0.05, 1e-6);
    return [yMin - pad, yMax + pad];
  }

  function bindMainPlotRelayoutSync() {
    if (!plotDiv || plotDiv.__tsRelayoutBound) return;
    if (typeof plotDiv.on !== 'function') return;
    plotDiv.__tsRelayoutBound = true;
    let _applying = false;

    plotDiv.on('plotly_relayout', (eventData) => {
      if (!eventData) return;

      if (Object.prototype.hasOwnProperty.call(eventData, 'dragmode')) {
        setSelectModeActive(eventData.dragmode === 'select' || eventData.dragmode === 'lasso');
      }

      if (_applying) return;

      // Selection-fit annotation dragged by the user (tail-drag, config.edits.annotationTail
      // -- see plotlyConfig). layout.annotations at render time is
      // baseCornerAnnotationsForOverlay.concat(selectionFitAnnotations), so the eventData
      // index needs offsetting back to selectionFitAnnotations' own indices. Persisted here
      // so the dragged position survives the next unrelated re-render instead of snapping
      // back to its computed default.
      let annotationDragged = false;
      Object.keys(eventData).forEach((key) => {
        const m = key.match(/^annotations\[(\d+)\]\.(ax|ay|x|y)$/);
        if (!m) return;
        annotationDragged = true;
        const idx = Number(m[1]) - baseCornerAnnotationsForOverlay.length;
        if (idx >= 0 && idx < selectionFitAnnotations.length) {
          selectionFitAnnotations[idx][m[2]] = eventData[key];
        }
      });
      if (annotationDragged) return;

      // X axis reset — restore full-data Y range
      if (Object.prototype.hasOwnProperty.call(eventData, 'xaxis.autorange') && eventData['xaxis.autorange']) {
        mainPlotXRange = null;
        resetLeafletMapToFullTrack();

        if (currentTsTraces.length === 0) return;
        let yMin = null, yMax = null;
        for (const trace of currentTsTraces) {
          (trace.y || []).forEach(v => {
            if (v == null || !Number.isFinite(v)) return;
            if (yMin === null || v < yMin) yMin = v;
            if (yMax === null || v > yMax) yMax = v;
          });
        }
        if (yMin !== null && yMax !== null) {
          const pad = Math.max(0.05, Math.abs(yMax - yMin) * 0.1);
          _applying = true;
          Plotly.relayout(plotDiv, {'yaxis2.range': [yMin - pad, yMax + pad]}).then(() => { _applying = false; });
        }
        return;
      }

      // X axis zoomed/panned. Plotly may provide either indexed keys
      // (xaxis.range[0]/[1]) or a single xaxis.range array.
      let x0 = Number(eventData['xaxis.range[0]']);
      let x1 = Number(eventData['xaxis.range[1]']);
      if (!Number.isFinite(x0) || !Number.isFinite(x1)) {
        const packedRange = eventData['xaxis.range'];
        if (Array.isArray(packedRange) && packedRange.length >= 2) {
          x0 = Number(packedRange[0]);
          x1 = Number(packedRange[1]);
        }
      }
      if (!Number.isFinite(x0) || !Number.isFinite(x1)) return;

      mainPlotXRange = x0 <= x1 ? [x0, x1] : [x1, x0];

      if (currentTsTraces.length === 0) return;

      const newRange = computeTsYRangeForXWindow(x0, x1);
      if (!newRange) return;
      _applying = true;
      Plotly.relayout(plotDiv, {'yaxis2.range': newRange}).then(() => { _applying = false; });
    });
  }

  function bindMainPlotHoverSync() {
    if (!plotDiv || plotDiv.__mapHoverSyncBound) return;
    if (typeof plotDiv.on !== 'function') return;
    plotDiv.__mapHoverSyncBound = true;

    // Shows the hover tooltip for a given row key on every subplot at once
    // (main plot + time slip), not just the one the mouse is over. nativePoints
    // is the point list Plotly already computed for the hovered subplot under
    // hovermode='x' (one nearest point per trace there) — kept as-is so every
    // trace on that subplot still appears, then extended with the exact-key
    // match on every other subplot.
    const hoverAllLinkedPointsByKey = (key, nativePoints) => {
      if (!plotDiv || !Array.isArray(plotDiv.data) || !key) return;
      if (lastLinkedHoverKey === key) return;

      const targetPoints = [];
      const subplots = new Set();
      const seen = new Set();

      const addPoint = (curveNumber, pointNumber) => {
        const seenKey = curveNumber + ':' + pointNumber;
        if (seen.has(seenKey)) return;
        seen.add(seenKey);
        targetPoints.push({ curveNumber, pointNumber });
        const trace = plotDiv.data[curveNumber];
        if (trace) subplots.add((trace.xaxis || 'x') + (trace.yaxis || 'y'));
      };

      (nativePoints || []).forEach((p) => {
        if (Number.isInteger(p.curveNumber) && Number.isInteger(p.pointNumber)) {
          addPoint(p.curveNumber, p.pointNumber);
        }
      });

      // Fx.hover defaults its subplot arg to 'xy' when omitted, which makes it
      // look up points on the wrong axes (and crash on c2p) for any other
      // subplot (e.g. the time slip's x2y2) — so every subplot we touch below
      // must end up in `subplots`, passed explicitly to Fx.hover.
      plotDiv.data.forEach((trace, curveNumber) => {
        if (!trace || !Array.isArray(trace.customdata)) return;
        const subplot = (trace.xaxis || 'x') + (trace.yaxis || 'y');
        if (subplots.has(subplot)) return; // already covered by nativePoints above
        const pointNumber = trace.customdata.indexOf(key);
        if (pointNumber >= 0) addPoint(curveNumber, pointNumber);
      });

      if (targetPoints.length === 0) return;

      isSyncingPlotHover = true;
      Plotly.Fx.hover(plotDiv, targetPoints, Array.from(subplots));
      lastLinkedHoverKey = key;
      requestAnimationFrame(() => { isSyncingPlotHover = false; });
    };

    const getPointKey = (point) => {
      if (!point) return null;

      // Plotly may provide per-point customdata directly on the hovered point.
      if (point.customdata != null && point.customdata !== '') {
        return point.customdata;
      }

      const trace = point.fullData || point.data;
      const custom = trace && trace.customdata;
      if (!Array.isArray(custom)) return null;
      return custom[point.pointNumber] || null;
    };

    const handlePointEvent = (eventData, isTap) => {
      const points = (eventData && Array.isArray(eventData.points)) ? eventData.points : [];
      if (points.length === 0) return;

      // With hovermode='x', points[0] is not guaranteed to be a keyed data trace.
      // Prefer the first point carrying a row key so map marker follows mouse motion.
      const point = points.find((candidate) => !!getPointKey(candidate)) || points[0];
      const key = getPointKey(point);
      if (!key) {
        if (!isTap) {
          clearMapHoverMarker();
          clearLeafletHoverMarker();
        }
        return;
      }

      showMapHoverMarker(key);
      showLeafletHoverMarker(key);

      if (isSyncingPlotHover) return;
      hoverAllLinkedPointsByKey(key, points);
    };

    plotDiv.on('plotly_hover', (eventData) => {
      handlePointEvent(eventData, false);
    });

    // A click on one of the pinned-note markers (an annotation, not a data point --
    // see notePinAnnotationsForOverlay) always opens that note, regardless of whether
    // picking is currently armed. Plotly's own event for this is plotly_clickannotation,
    // fired separately from plotly_click below.
    plotDiv.on('plotly_clickannotation', (event) => {
      const clicked = plotDiv.layout && Array.isArray(plotDiv.layout.annotations)
        ? plotDiv.layout.annotations[event.index]
        : null;
      if (clicked && clicked._noteId && window.SessionsUI) window.SessionsUI.viewNote(clicked._noteId);
    });

    // Mobile touch interaction primarily fires click events; keep marker linked on tap.
    plotDiv.on('plotly_click', (eventData) => {
      const points = (eventData && Array.isArray(eventData.points)) ? eventData.points : [];

      if (notePickMode === 'plot') {
        const point = points.find((p) => getPointKey(p)) || points[0];
        handlePlotNotePickClick(point, point ? getPointKey(point) : null);
        return;
      }

      handlePointEvent(eventData, true);
    });

    plotDiv.on('plotly_unhover', () => {
      if (isSyncingPlotHover) return;
      clearMapHoverMarker();
      clearLeafletHoverMarker();
      lastLinkedHoverKey = null;
    });

    plotDiv.on('plotly_doubleclick', () => {
      clearMapHoverMarker();
      clearLeafletHoverMarker();
      lastLinkedHoverKey = null;
      Plotly.Fx.unhover(plotDiv);
      clearSelectionFit();
    });
  }

  // Curve-fitting math (linear/sinusoidal/sine×exponential/exponential/step-response/
  // ellipse/typed-formula/FFT) lives in fit-functions.js as window.FitFunctions -- see
  // buildSelectionFitDetails and updateFftPanel below for its call sites. arrayMinMax
  // stays here since it's also used outside the fitting code (selection ranges, etc.).


  function formatStatValue(v) {
    if (!Number.isFinite(v)) return 'n/a';
    const abs = Math.abs(v);
    if (abs === 0) return '0';
    if (abs >= 1000) return v.toFixed(0);
    if (abs >= 1) return v.toFixed(2);
    if (abs >= 0.01) return v.toFixed(4);
    return v.toExponential(2);
  }

  // Only main channel traces carry meta.channel (see updatePlot) -- overlay traces like
  // shading envelopes or the race-line curvature preview are excluded from selection fitting.
  function groupSelectedPointsByTrace(points) {
    const groups = new Map();
    points.forEach((p) => {
      if (!Number.isInteger(p.curveNumber)) return;
      const trace = plotDiv.data && plotDiv.data[p.curveNumber];
      if (!trace || !trace.meta || !trace.meta.channel) return;
      const x = Number(p.x), y = Number(p.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      let g = groups.get(p.curveNumber);
      if (!g) { g = {trace, xs: [], ys: [], rowKeys: []}; groups.set(p.curveNumber, g); }
      g.xs.push(x); g.ys.push(y);
      // Each trace's customdata carries a rowKey (see rowKey/updatePlot) identifying the
      // exact log row a point came from -- kept alongside x/y so a linear fit can look up
      // that row's own logged Time later (see loggedTimeSecondsForRowKey), regardless of
      // what's actually plotted on the x-axis right now.
      const idx = Number.isInteger(p.pointIndex) ? p.pointIndex : p.pointNumber;
      g.rowKeys.push((Array.isArray(trace.customdata) && Number.isInteger(idx)) ? (trace.customdata[idx] != null ? trace.customdata[idx] : null) : null);
    });
    return groups;
  }

  // Plotly's box/lasso select only picks up points on traces whose mode includes
  // 'markers' -- a pure 'lines' trace (what every channel trace uses normally) reports
  // zero selected points even when the drag box clearly crosses it. Rather than paying
  // the marker rendering cost at all times (expensive on traces with tens of thousands
  // of points), markers are added (invisibly, size/opacity 0) only while the select or
  // lasso tool is the active drag mode, and stripped back off once the user leaves it.
  function setSelectableMarkersEnabled(enabled) {
    if (!plotDiv || !Array.isArray(plotDiv.data)) return;
    const idxs = [];
    plotDiv.data.forEach((t, i) => {
      if (!t || !t.meta || !t.meta.channel) return;
      if (t.type === 'scattergl') return; // color-by-axis traces already render as selectable markers
      idxs.push(i);
    });
    if (idxs.length === 0) return;
    if (enabled) {
      Plotly.restyle(plotDiv, {mode: 'lines+markers', 'marker.size': 0, 'marker.opacity': 0}, idxs);
    } else {
      Plotly.restyle(plotDiv, {mode: 'lines'}, idxs);
    }
  }

  function setSelectModeActive(active) {
    if (active === selectModeActive) return;
    selectModeActive = active;
    setSelectableMarkersEnabled(active);
    if (!active) clearSelectionFit();
  }

  // Spreading a large array into Math.min/max (Math.min(...arr)) blows the call stack
  // once arr has more than ~65k elements, which a single lap's worth of selected points
  // easily exceeds -- so min/max are accumulated in a plain loop instead.
  function arrayMinMax(arr) {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return [min, max];
  }

  function clearSelectionFit() {
    const hadShapes = selectionFitShapes.length > 0;
    selectionFitShapes = [];
    selectionFitAnnotations = [];
    selectionFitLastPoints = [];
    if (selectionFitFormulaError) {
      selectionFitFormulaError.hidden = true;
      selectionFitFormulaError.textContent = '';
    }
    if (selectionStatsPanel) selectionStatsPanel.hidden = true;
    if (fftPanel) fftPanel.hidden = true;
    if (hadShapes && plotDiv && Array.isArray(plotDiv.data) && !suppressSelectionReentry) {
      suppressSelectionReentry = true;
      Plotly.relayout(plotDiv, {
        shapes: baseCornerShapesForOverlay,
        annotations: baseCornerAnnotationsForOverlay.concat(notePinAnnotationsForOverlay)
      }).then(() => { suppressSelectionReentry = false; });
    }
  }

  // Fit line color is black so it stands out clearly against all channel colors.
  function getSelectionFitLineColor() {
    return 'black';
  }

  function setSelectionFitFormulaError(message) {
    if (!selectionFitFormulaError) return;
    if (!message) {
      selectionFitFormulaError.hidden = true;
      selectionFitFormulaError.textContent = '';
      return;
    }
    selectionFitFormulaError.hidden = false;
    selectionFitFormulaError.textContent = message;
  }

  function buildFunctionFitPathShape(xMin, xMax, xaxis, yaxis, predict, fitLineColor, pointCount = 80) {
    pointCount = Math.max(2, Math.round(pointCount));
    const dx = (xMax - xMin) / (pointCount - 1);
    let path = '';
    let drewAny = false;
    for (let i = 0; i < pointCount; i++) {
      const x = xMin + dx * i;
      const y = predict(x);
      if (!Number.isFinite(y)) continue;
      path += `${drewAny ? 'L' : 'M'} ${x},${y} `;
      drewAny = true;
    }
    if (!drewAny) return null;
    return {
      type: 'path',
      path: path.trim(),
      xref: xaxis,
      yref: yaxis,
      line: { color: fitLineColor, width: 2, dash: 'dot' },
      layer: 'above'
    };
  }

  function buildEllipseFitShape(fit, xaxis, yaxis, fitLineColor) {
    const segments = 96;
    let path = '';
    for (let i = 0; i <= segments; i++) {
      const theta = (2 * Math.PI * i) / segments;
      const cu = fit.a * Math.cos(theta);
      const cv = fit.b * Math.sin(theta);
      const x = fit.centerX + cu * Math.cos(fit.angle) - cv * Math.sin(fit.angle);
      const y = fit.centerY + cu * Math.sin(fit.angle) + cv * Math.cos(fit.angle);
      path += `${i === 0 ? 'M' : 'L'} ${x},${y} `;
    }
    return {
      type: 'path',
      path: `${path.trim()} Z`,
      xref: xaxis,
      yref: yaxis,
      line: { color: fitLineColor, width: 2, dash: 'dot' },
      layer: 'above'
    };
  }

  // Recognized speed-unit spellings -> conversion factor to m/s. Matches the equivalent
  // conversions used elsewhere in the app for computed acceleration channels (see the
  // racing-line/vehicle-sim code); kept separate here since this one feeds the *linear
  // fit's* optional "slope in g" display rather than a channel of its own. Returns null
  // for anything not recognized as a speed unit, rather than guessing.
  function speedUnitToMps(unit) {
    const u = String(unit || '').trim().toLowerCase();
    if (!u) return null;
    if (u.includes('km/h') || u === 'kph') return 1 / 3.6;
    if (u.includes('mph')) return 0.44704;
    if (u.includes('m/s') || u.includes('mps')) return 1;
    return null;
  }

  const SELECTION_FIT_GRAVITY_MS2 = 9.81; // matches the g-conversion used elsewhere (e.g. LatAcc/LongAcc)

  // Reverses rowKey(fileId, lap, rowIndex) (see rowKey/updatePlot, which stamps every main
  // channel trace's customdata with these) back to the actual log row. This is how the
  // linear fit's "g" slope option finds a selected point's real logged Time even when the
  // selection was made with something else (e.g. Distance) on the x-axis -- every row has
  // its own Time value whatever's currently plotted.
  function resolveLogRowFromRowKey(key) {
    if (key == null) return null;
    const parts = String(key).split('|');
    if (parts.length < 3) return null;
    const rowIndex = Number(parts[parts.length - 1]);
    const lap = Number(parts[parts.length - 2]);
    if (!Number.isFinite(rowIndex) || !Number.isFinite(lap)) return null;
    const fileId = parts.slice(0, parts.length - 2).join('|');
    const log = logs.find((l) => l.id === fileId);
    if (!log || !Array.isArray(log.data) || rowIndex < 0 || rowIndex >= log.data.length) return null;
    return { log, rowIndex };
  }

  // The row's own logged elapsed time in seconds, independent of the plot's x-axis mode.
  function loggedTimeSecondsForRowKey(key) {
    const ref = resolveLogRowFromRowKey(key);
    if (!ref) return null;
    const timeCol = resolveChannelForLog('Time', ref.log);
    if (!timeCol || !ref.log.cols.includes(timeCol)) return null;
    const unit = (ref.log.meta.units && ref.log.meta.units[timeCol]) || '';
    return parseTimeLikeSeconds(ref.log.data[ref.rowIndex][timeCol], unit);
  }

  // A linear fit's slope is only meaningfully "g's" when Y is a recognized speed -- it's
  // then an average acceleration/deceleration, just re-expressed relative to gravity
  // instead of raw m/s^2. Rather than reusing the already-plotted x (which might be
  // Distance, or any other channel), this looks up each selected point's own logged Time
  // and fits speed vs THAT, so the reading is correct whatever's on the x-axis. Returns
  // null (rather than a misleading number) when Y isn't a speed unit, or fewer than 2 of
  // the selected rows have a resolvable logged Time (e.g. a file with no Time channel).
  function computeSlopeGravities(g, yUnit) {
    const mpsPerUnit = speedUnitToMps(yUnit);
    if (mpsPerUnit == null) return null;
    const times = [];
    const speeds = [];
    g.rowKeys.forEach((key, i) => {
      const t = loggedTimeSecondsForRowKey(key);
      if (t != null && Number.isFinite(t)) { times.push(t); speeds.push(g.ys[i]); }
    });
    if (times.length < 2) return null;
    const fit = window.FitFunctions.computeLinearFit(times, speeds);
    if (!fit) return null;
    return (fit.slope * mpsPerUnit) / SELECTION_FIT_GRAVITY_MS2;
  }

  // "km/h/s" style label for a linear fit's default (auto) slope units -- whichever of
  // Y/X unit is actually known, falling back to the same 'x'/'y' placeholders the other
  // fit types use (see e.g. the sinusoidal φ line) when a unit isn't known at all.
  function buildAutoSlopeUnitLabel(yUnit, xUnit) {
    if (!yUnit && !xUnit) return '';
    return `${yUnit || 'y'}/${xUnit || 'x'}`;
  }

  function buildSelectionFitDetails(fitType, g, xMin, xMax, yMin, yMax, fitLineColor, typedFormulaResult) {
    const detailLines = [];
    const xaxis = g.trace.xaxis || 'x';
    const yaxis = g.trace.yaxis || 'y';
    const out = { detailLines, shape: null };
    if (fitType === 'sinusoidal') {
      const forcedOmega = Number.isFinite(selectionSinFitForcedFreqHz) ? 2 * Math.PI * selectionSinFitForcedFreqHz : null;
      const fit = window.FitFunctions.computeSinusoidalFit(g.xs, g.ys, forcedOmega);
      if (!fit) {
        detailLines.push('sin fit: n/a');
        return out;
      }
      detailLines.push(`A: ${formatStatValue(fit.A)}`);
      detailLines.push(`ω: ${formatStatValue(fit.omega)} (${formatStatValue(fit.omega / (2 * Math.PI))} ${getFrequencyUnitLabel()})${forcedOmega ? ' (forced)' : ''}`);
      detailLines.push(`φ: ${formatStatValue(fit.phi)} (${formatStatValue(-fit.phi / fit.omega)} ${mainPlotXAxisUnit || 'x'})`);
      detailLines.push(`offset: ${formatStatValue(fit.offset)}`);
      detailLines.push(`R²: ${fit.r2 == null ? 'n/a' : fit.r2.toFixed(3)}`);
      out.shape = buildFunctionFitPathShape(xMin, xMax, xaxis, yaxis, fit.predict, fitLineColor, window.FitFunctions.oscillatingFitPointCount(fit.omega, xMin, xMax));
      return out;
    }
    if (fitType === 'sineExponential') {
      const forcedOmega = Number.isFinite(selectionSinFitForcedFreqHz) ? 2 * Math.PI * selectionSinFitForcedFreqHz : null;
      const fit = window.FitFunctions.computeSineExpFit(g.xs, g.ys, forcedOmega);
      if (!fit) {
        detailLines.push('sin×exp fit: n/a');
        return out;
      }
      detailLines.push(`A: ${formatStatValue(fit.A)}`);
      detailLines.push(`ω: ${formatStatValue(fit.omega)} (${formatStatValue(fit.omega / (2 * Math.PI))} ${getFrequencyUnitLabel()})${forcedOmega ? ' (forced)' : ''}`);
      detailLines.push(`φ: ${formatStatValue(fit.phi)} (${formatStatValue(-fit.phi / fit.omega)} ${mainPlotXAxisUnit || 'x'})`);
      detailLines.push(`τ: ${formatStatValue(fit.tau)}`);
      detailLines.push(`offset: ${formatStatValue(fit.offset)}`);
      detailLines.push(`R²: ${fit.r2 == null ? 'n/a' : fit.r2.toFixed(3)}`);
      out.shape = buildFunctionFitPathShape(xMin, xMax, xaxis, yaxis, fit.predict, fitLineColor, window.FitFunctions.oscillatingFitPointCount(fit.omega, xMin, xMax));
      return out;
    }
    if (fitType === 'exponential') {
      const fit = window.FitFunctions.computeExponentialFit(g.xs, g.ys);
      if (!fit) {
        detailLines.push('exp fit: n/a');
        return out;
      }
      detailLines.push(`A: ${formatStatValue(fit.A)}`);
      detailLines.push(`τ: ${formatStatValue(fit.tau)}`);
      detailLines.push(`offset: ${formatStatValue(fit.offset)}`);
      detailLines.push(`R²: ${fit.r2 == null ? 'n/a' : fit.r2.toFixed(3)}`);
      out.shape = buildFunctionFitPathShape(xMin, xMax, xaxis, yaxis, fit.predict, fitLineColor);
      return out;
    }
    if (fitType === 'firstOrderResponse') {
      const fit = window.FitFunctions.computeFirstOrderResponseFit(g.xs, g.ys);
      if (!fit) {
        detailLines.push('1st-order fit: n/a');
        return out;
      }
      detailLines.push(`A: ${formatStatValue(fit.A)}`);
      detailLines.push(`τ: ${formatStatValue(fit.tau)}`);
      detailLines.push(`offset: ${formatStatValue(fit.offset)}`);
      detailLines.push(`x0: ${formatStatValue(fit.x0)}`);
      detailLines.push(`R²: ${fit.r2 == null ? 'n/a' : fit.r2.toFixed(3)}`);
      out.shape = buildFunctionFitPathShape(xMin, xMax, xaxis, yaxis, fit.predict, fitLineColor);
      return out;
    }
    if (fitType === 'secondOrderResponse') {
      const fit = window.FitFunctions.computeSecondOrderResponseFit(g.xs, g.ys);
      if (!fit) {
        detailLines.push('2nd-order fit: n/a');
        return out;
      }
      const dampingLabel = fit.zeta < 1 ? 'underdamped' : (fit.zeta > 1 ? 'overdamped' : 'critically damped');
      detailLines.push(`A: ${formatStatValue(fit.A)}`);
      detailLines.push(`ζ: ${formatStatValue(fit.zeta)} (${dampingLabel})`);
      detailLines.push(`ωn: ${formatStatValue(fit.wn)} (${formatStatValue(fit.wn / (2 * Math.PI))} ${getFrequencyUnitLabel()})`);
      detailLines.push(`offset: ${formatStatValue(fit.offset)}`);
      detailLines.push(`x0: ${formatStatValue(fit.x0)}`);
      detailLines.push(`R²: ${fit.r2 == null ? 'n/a' : fit.r2.toFixed(3)}`);
      out.shape = buildFunctionFitPathShape(xMin, xMax, xaxis, yaxis, fit.predict, fitLineColor, window.FitFunctions.oscillatingFitPointCount(fit.wd, xMin, xMax));
      return out;
    }
    if (fitType === 'ellipse') {
      const fit = window.FitFunctions.computeEllipseFit(g.xs, g.ys);
      if (!fit) {
        detailLines.push('ellipse fit: n/a');
        return out;
      }
      detailLines.push(`center: (${formatStatValue(fit.centerX)}, ${formatStatValue(fit.centerY)})`);
      detailLines.push(`a: ${formatStatValue(fit.a)}`);
      detailLines.push(`b: ${formatStatValue(fit.b)}`);
      detailLines.push(`angle(rad): ${formatStatValue(fit.angle)}`);
      out.shape = buildEllipseFitShape(fit, xaxis, yaxis, fitLineColor);
      return out;
    }
    if (fitType === 'formula') {
      if (typedFormulaResult.error) {
        detailLines.push(`formula: ${typedFormulaResult.error}`);
        return out;
      }
      const fit = typedFormulaResult.fit;
      if (!fit) {
        detailLines.push('formula fit: n/a');
        return out;
      }
      detailLines.push(`f(t) = ${fit.expression}`);
      if (fit.paramNames.length === 0) {
        detailLines.push('params: none');
      } else {
        fit.paramNames.forEach((name, i) => detailLines.push(`${name}: ${formatStatValue(fit.params[i])}`));
      }
      detailLines.push(`R²: ${fit.r2 == null ? 'n/a' : fit.r2.toFixed(3)}`);
      out.shape = buildFunctionFitPathShape(xMin, xMax, xaxis, yaxis, fit.predict, fitLineColor);
      return out;
    }
    const fit = window.FitFunctions.computeLinearFit(g.xs, g.ys);
    if (!fit) {
      detailLines.push('slope: n/a');
      detailLines.push('R²: n/a');
      return out;
    }
    // Default (auto): slope shown in its native Y-unit / X-unit, e.g. "km/h/s" for speed
    // vs time or "km/h/m" for speed vs distance -- whatever the two axes actually are. The
    // "g" option re-fits speed against each point's own logged Time (see
    // computeSlopeGravities), so it works no matter what's plotted on the x-axis -- a
    // selection made with Distance on the x-axis still gets a real average
    // acceleration/deceleration, not just a note saying it can't be done.
    const yUnit = getUnitForChannel(g.trace.meta.channel) || '';
    const xUnit = mainPlotXAxisUnit || '';
    const autoLabel = buildAutoSlopeUnitLabel(yUnit, xUnit);
    const autoSlopeText = `${formatStatValue(fit.slope)}${autoLabel ? ' ' + autoLabel : ''}`;
    if (selectionFitSlopeUnits === 'g') {
      const gValue = computeSlopeGravities(g, yUnit);
      detailLines.push(gValue != null
        ? `slope: ${formatStatValue(gValue)} g`
        : `slope: ${autoSlopeText} (g needs a speed channel and a logged Time column)`);
    } else {
      detailLines.push(`slope: ${autoSlopeText}`);
    }
    detailLines.push(`R²: ${fit.r2.toFixed(3)}`);
    out.shape = {
      type: 'line',
      xref: xaxis,
      yref: yaxis,
      x0: xMin, x1: xMax,
      y0: fit.slope * xMin + fit.intercept,
      y1: fit.slope * xMax + fit.intercept,
      line: { color: fitLineColor, width: 2, dash: 'dot' },
      layer: 'above'
    };
    return out;
  }

  // Populates the floating HTML selection stats panel with one group block per channel.
  function updateSelectionStatsPanel(groupFits) {
    if (!selectionStatsPanel || !selectionStatsBody) return;
    selectionStatsBody.innerHTML = '';
    groupFits.forEach(({g, xMin, xMax, yMin, yMax, detailLines}) => {
      const label = getChannelLabel(g.trace.meta.channel);
      const block = document.createElement('div');
      block.className = 'selection-stats-group';
      const name = document.createElement('div');
      name.className = 'selection-stats-group-name';
      name.textContent = label;
      block.appendChild(name);
      const lines = [
        `n = ${g.xs.length} pts`,
        `${mainPlotXAxisTitle || 'X'}: ${formatStatValue(xMin)} \u2013 ${formatStatValue(xMax)}`,
        `${label}: ${formatStatValue(yMin)} \u2013 ${formatStatValue(yMax)}`
      ].concat(detailLines || []);
      lines.forEach((text) => {
        const row = document.createElement('div');
        row.className = 'selection-stats-group-line';
        row.textContent = text;
        block.appendChild(row);
      });
      selectionStatsBody.appendChild(block);
    });
    selectionStatsPanel.hidden = false;
  }

  // Drag-to-reposition the selection stats panel via its header.
  function bindDraggablePanel(panel, header) {
    if (!panel || !header) return;
    let dragging = false, ox = 0, oy = 0;
    header.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      dragging = true;
      const rect = panel.getBoundingClientRect();
      // Switch to absolute (pixel) positioning anchored to current location.
      panel.style.right = '';
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
      ox = e.clientX - rect.left;
      oy = e.clientY - rect.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      // Clamped so the header can never be dragged fully off-screen -- top never goes
      // negative, and at least a sliver of the panel's width always stays reachable
      // horizontally -- otherwise a panel dragged toward an edge (more likely now that
      // it can grow taller, e.g. an extra fit-options row) can end up with nothing left
      // on screen to grab it back with.
      const minVisiblePx = 40;
      const maxLeft = Math.max(0, window.innerWidth - minVisiblePx);
      const minLeft = minVisiblePx - panel.offsetWidth;
      const left = Math.min(maxLeft, Math.max(minLeft, e.clientX - ox));
      const top = Math.max(0, e.clientY - oy);
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  }
  bindDraggablePanel(selectionStatsPanel, selectionStatsHeader);
  bindDraggablePanel(fftPanel, fftPanelHeader);

  if (selectionStatsClose) {
    selectionStatsClose.addEventListener('click', () => {
      if (selectionStatsPanel) selectionStatsPanel.hidden = true;
    });
  }

  // Renders one magnitude-vs-frequency trace per selected channel group into the
  // floating FFT panel (a separate small Plotly chart below/alongside the main plot).
  function updateFftPanel(groupFits) {
    if (!fftPanel || !fftPlotDiv || !selectionFftEnabled) return;
    const traces = [];
    groupFits.forEach(({ g }) => {
      const fft = window.FitFunctions.computeFft(g.xs, g.ys);
      if (!fft) return;
      const label = getChannelLabel(g.trace.meta.channel);
      const color = (g.trace.meta && g.trace.meta.color) || (g.trace.line && g.trace.line.color) || '#1f77b4';
      traces.push({
        x: fft.freqs, y: fft.mags, type: 'scatter', mode: 'lines',
        name: label, line: { color, width: 1.5 }
      });
    });
    if (traces.length === 0) {
      fftPanel.hidden = true;
      return;
    }
    const theme = getCurrentTheme();
    const fontColor = theme === 'dark' ? '#dde6f2' : '#222';
    const gridColor = theme === 'dark' ? '#3a4556' : '#e0e0e0';
    // A vertical marker showing the frequency the sine fit is currently pinned to
    // (set by clicking a point in this chart) -- only meaningful while fitting sinusoids.
    const isOscillatingFit = selectionFitType === 'sinusoidal' || selectionFitType === 'sineExponential';
    const shapes = (isOscillatingFit && Number.isFinite(selectionSinFitForcedFreqHz))
      ? [{
          type: 'line', xref: 'x', yref: 'paper',
          x0: selectionSinFitForcedFreqHz, x1: selectionSinFitForcedFreqHz, y0: 0, y1: 1,
          line: { color: 'black', width: 1.5, dash: 'dot' }
        }]
      : [];
    fftPanel.hidden = false;
    Plotly.react(fftPlotDiv, traces, {
      margin: { l: 45, r: 10, t: 10, b: 35 },
      showlegend: traces.length > 1,
      legend: { font: { size: 10, color: fontColor }, orientation: 'h', y: -0.3 },
      xaxis: { title: { text: `Frequency (${getFrequencyUnitLabel()})`, font: { size: 11, color: fontColor } }, tickfont: { size: 10, color: fontColor }, gridcolor: gridColor, zerolinecolor: gridColor },
      yaxis: { title: { text: 'Amplitude', font: { size: 11, color: fontColor } }, tickfont: { size: 10, color: fontColor }, gridcolor: gridColor, zerolinecolor: gridColor },
      shapes,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: fontColor }
    }, { responsive: true, displayModeBar: false }).then(bindFftPlotClickHandler);
    if (fftClearForcedBtn) {
      fftClearForcedBtn.hidden = !(isOscillatingFit && Number.isFinite(selectionSinFitForcedFreqHz));
    }
  }

  function clearFftPanel() {
    if (fftPanel) fftPanel.hidden = true;
  }

  // Clicking a point in the FFT chart pins the sine fit to that exact frequency instead
  // of letting it auto-search -- handy once you've spotted the real oscillation's peak.
  // Bound lazily (after the first Plotly.react call) since Plotly only attaches `.on` to
  // the div once it has actually rendered a plot into it.
  function bindFftPlotClickHandler() {
    if (!fftPlotDiv || fftPlotDiv.__fftClickBound || typeof fftPlotDiv.on !== 'function') return;
    fftPlotDiv.__fftClickBound = true;
    fftPlotDiv.on('plotly_click', (eventData) => {
      if (!eventData || !Array.isArray(eventData.points) || eventData.points.length === 0) return;
      const freq = Number(eventData.points[0].x);
      if (!Number.isFinite(freq) || freq <= 0) return;
      selectionSinFitForcedFreqHz = freq;
      if (selectionFitType !== 'sinusoidal' && selectionFitType !== 'sineExponential') {
        selectionFitType = 'sinusoidal';
        syncSelectionFitControlsUi();
        try { localStorage.setItem(SELECTION_FIT_TYPE_STORAGE_KEY, selectionFitType); } catch {}
      }
      if (selectionFitLastPoints.length > 0) applySelectionFit(selectionFitLastPoints);
    });
  }

  if (fftClearForcedBtn) {
    fftClearForcedBtn.addEventListener('click', () => {
      selectionSinFitForcedFreqHz = null;
      fftClearForcedBtn.hidden = true;
      if (selectionFitLastPoints.length > 0) applySelectionFit(selectionFitLastPoints);
    });
  }

  if (fftPanelClose) {
    fftPanelClose.addEventListener('click', () => { if (fftPanel) fftPanel.hidden = true; });
  }

  if (selectionFftEnabledInput) {
    try { selectionFftEnabled = localStorage.getItem(SELECTION_FFT_ENABLED_STORAGE_KEY) === '1'; } catch {}
    selectionFftEnabledInput.checked = selectionFftEnabled;
    if (selectionFftHint) selectionFftHint.hidden = !selectionFftEnabled;
    selectionFftEnabledInput.addEventListener('change', () => {
      selectionFftEnabled = !!selectionFftEnabledInput.checked;
      try { localStorage.setItem(SELECTION_FFT_ENABLED_STORAGE_KEY, selectionFftEnabled ? '1' : '0'); } catch {}
      if (selectionFftHint) selectionFftHint.hidden = !selectionFftEnabled;
      if (!selectionFftEnabled) {
        clearFftPanel();
      } else if (selectionFitLastPoints.length > 0) {
        applySelectionFit(selectionFitLastPoints);
      }
    });
  }

  function normalizeSelectionFitType(value) {
    return SELECTION_FIT_TYPE_OPTIONS.has(value) ? value : DEFAULT_SELECTION_FIT_TYPE;
  }

  // Static equation text shown below the Fit Type dropdown, using the same variable
  // names as the per-channel stats lines below it (A, ω, φ, offset, etc.).
  const SELECTION_FIT_EQUATIONS = {
    linear: 'y = slope · x + intercept',
    sinusoidal: 'y = A · sin(ω · x + φ) + offset',
    sineExponential: 'y = A · e^(τ · x) · sin(ω · x + φ) + offset',
    exponential: 'y = A · e^(τ · x) + offset',
    firstOrderResponse: 'y = A · (1 − e^(−(x − x0) / τ)) + offset   [x0 = selection start]',
    secondOrderResponse: 'y = A · (1 − e^(−ζωn(x−x0))·(cos(ωd(x−x0)) + (ζωn/ωd)·sin(ωd(x−x0)))) + offset   [x0 = selection start, ωd = ωn·√|1−ζ²|]',
    ellipse: '(x,y) on ellipse: center (cx,cy), semi-axes a, b, rotation angle',
    formula: '' // the typed formula itself is shown per-channel below
  };

  function syncSelectionFitControlsUi() {
    const isFormula = selectionFitType === 'formula';
    if (selectionFitTypeSelect) selectionFitTypeSelect.value = selectionFitType;
    if (selectionFitEquationRow) selectionFitEquationRow.textContent = SELECTION_FIT_EQUATIONS[selectionFitType] || '';
    if (selectionFitSlopeUnitsRow) selectionFitSlopeUnitsRow.hidden = selectionFitType !== 'linear';
    if (selectionFitSlopeUnitsSelect) selectionFitSlopeUnitsSelect.value = selectionFitSlopeUnits;
    if (selectionFitFormulaRow) selectionFitFormulaRow.hidden = !isFormula;
    if (selectionFitFormulaHint) selectionFitFormulaHint.hidden = !isFormula;
    if (selectionFitFormulaInput && !selectionFitFormulaInput.value) {
      selectionFitFormulaInput.value = selectionFitFormula || DEFAULT_SELECTION_FIT_FORMULA;
    }
    if (!isFormula) setSelectionFitFormulaError('');
  }

  (() => {
    try {
      const savedType = localStorage.getItem(SELECTION_FIT_TYPE_STORAGE_KEY);
      selectionFitType = normalizeSelectionFitType(savedType);
    } catch {}
    try {
      const savedFormula = localStorage.getItem(SELECTION_FIT_FORMULA_STORAGE_KEY);
      if (typeof savedFormula === 'string' && savedFormula.trim()) selectionFitFormula = savedFormula;
    } catch {}
    try {
      const savedSlopeUnits = localStorage.getItem(SELECTION_FIT_SLOPE_UNITS_STORAGE_KEY);
      if (savedSlopeUnits === 'g' || savedSlopeUnits === 'auto') selectionFitSlopeUnits = savedSlopeUnits;
    } catch {}
    if (selectionFitFormulaInput) selectionFitFormulaInput.value = selectionFitFormula;
    syncSelectionFitControlsUi();
    if (selectionFitTypeSelect) {
      selectionFitTypeSelect.addEventListener('change', () => {
        selectionFitType = normalizeSelectionFitType(selectionFitTypeSelect.value);
        if (selectionFitType !== 'sinusoidal' && selectionFitType !== 'sineExponential') selectionSinFitForcedFreqHz = null;
        syncSelectionFitControlsUi();
        try { localStorage.setItem(SELECTION_FIT_TYPE_STORAGE_KEY, selectionFitType); } catch {}
        if (selectionFitLastPoints.length > 0) applySelectionFit(selectionFitLastPoints);
      });
    }
    if (selectionFitSlopeUnitsSelect) {
      selectionFitSlopeUnitsSelect.addEventListener('change', () => {
        selectionFitSlopeUnits = selectionFitSlopeUnitsSelect.value === 'g' ? 'g' : 'auto';
        try { localStorage.setItem(SELECTION_FIT_SLOPE_UNITS_STORAGE_KEY, selectionFitSlopeUnits); } catch {}
        if (selectionFitLastPoints.length > 0) applySelectionFit(selectionFitLastPoints);
      });
    }
    if (selectionFitFormulaInput) {
      let pendingApply = null;
      const onFormulaChange = () => {
        selectionFitFormula = selectionFitFormulaInput.value || '';
        try { localStorage.setItem(SELECTION_FIT_FORMULA_STORAGE_KEY, selectionFitFormula); } catch {}
        if (selectionFitType === 'formula' && selectionFitLastPoints.length > 0) applySelectionFit(selectionFitLastPoints);
      };
      selectionFitFormulaInput.addEventListener('change', onFormulaChange);
      selectionFitFormulaInput.addEventListener('input', () => {
        if (pendingApply) clearTimeout(pendingApply);
        pendingApply = setTimeout(onFormulaChange, 250);
      });
    }
  })();

  // Builds the on-plot stats box for one fit -- a real Plotly annotation (not HTML) so it
  // survives into a PNG export via Plotly.downloadImage. stackIndex offsets each
  // simultaneous fit (multiple Y channels selected at once) further from the selection
  // box's corner, so they start out legible instead of stacked directly on each other;
  // the user can still drag any of them further (config.edits.annotationTail).
  function buildSelectionFitAnnotation(g, detailLines, xMin, xMax, yMin, yMax, xaxis, yaxis, stackIndex) {
    const theme = getCurrentTheme();
    const color = (g.trace.meta && g.trace.meta.color) || (g.trace.line && g.trace.line.color) || '#000';
    const label = getChannelLabel(g.trace.meta.channel);
    const name = g.trace.name || label;
    const text = [
      `<b>${escapeHtml(name)}</b>`,
      `n = ${g.xs.length} pts`,
      `${escapeHtml(mainPlotXAxisTitle || 'X')}: ${formatStatValue(xMin)} – ${formatStatValue(xMax)}`,
      `${escapeHtml(label)}: ${formatStatValue(yMin)} – ${formatStatValue(yMax)}`
    ];
    (detailLines || []).forEach((line) => text.push(escapeHtml(line)));
    // Anchored to the selection box's top-right corner (not a point on the fit line
    // itself), then pushed further up-and-right in pixel space -- so the label sits
    // outside the selected data instead of covering it.
    return {
      x: xMax, y: yMax,
      xref: xaxis, yref: yaxis,
      text: text.join('<br>'),
      showarrow: true,
      arrowhead: 2, arrowsize: 1, arrowwidth: 1, arrowcolor: color,
      ax: 50, ay: -50 - stackIndex * 95,
      align: 'left',
      font: {size: 10, color: theme === 'dark' ? '#e8eef7' : '#0b2545'},
      bgcolor: theme === 'dark' ? 'rgba(26,34,44,0.92)' : 'rgba(255,255,255,0.92)',
      bordercolor: color,
      borderwidth: 1,
      borderpad: 4
    };
  }

  // Captures which point indices are currently selected in each channel trace, keyed by
  // channel name (not curveNumber -- trace order can shift when the Y-channel list
  // changes). updatePlot() rebuilds every trace from scratch on *any* change (a new
  // x-axis mode, a Y channel added/removed, etc.), which drops Plotly's own selection
  // state and would otherwise silently clear the selection-fit stats/overlay; pairing
  // this with reapplyCapturedSelection lets the selection (and its fit) survive a replot
  // instead, recomputed against whatever the new plot actually shows.
  function captureCurrentTraceSelection() {
    if (!plotDiv || !Array.isArray(plotDiv.data)) return null;
    const byChannel = new Map();
    plotDiv.data.forEach((t) => {
      if (!t || !t.meta || !t.meta.channel) return;
      if (!Array.isArray(t.selectedpoints) || t.selectedpoints.length === 0) return;
      byChannel.set(t.meta.channel, t.selectedpoints.slice());
    });
    return byChannel.size > 0 ? byChannel : null;
  }

  // Re-applies a selection captured by captureCurrentTraceSelection() to the freshly
  // rebuilt plotDiv.data: restyles each matching trace's selectedpoints (so its markers
  // stay highlighted) and recomputes the selection-fit stats/overlay from the new x/y
  // values at those same indices -- the whole point being that the fit numbers (and the
  // FFT/frequency units, which follow whatever's on the x-axis) come out matching the new
  // x-axis, not the stale one the selection was originally made on.
  function reapplyCapturedSelection(byChannel) {
    if (!byChannel || !plotDiv || !Array.isArray(plotDiv.data)) return;
    const restyleIdx = [];
    const restyleVals = [];
    const points = [];
    plotDiv.data.forEach((t, curveNumber) => {
      if (!t || !t.meta || !t.meta.channel) return;
      const idxs = byChannel.get(t.meta.channel);
      if (!idxs || idxs.length === 0) return;
      const validIdxs = idxs.filter((i) => Number.isInteger(i) && i >= 0 && i < t.x.length && i < t.y.length);
      if (validIdxs.length === 0) return;
      restyleIdx.push(curveNumber);
      restyleVals.push(validIdxs);
      validIdxs.forEach((i) => points.push({ curveNumber, pointIndex: i, x: t.x[i], y: t.y[i] }));
    });
    if (points.length === 0) {
      // Every previously-selected channel is gone from the plot now (e.g. it was
      // deselected from the Y list) -- nothing to carry forward, so drop the stale
      // stats/overlay instead of leaving them showing a channel that's no longer plotted.
      clearSelectionFit();
      return;
    }
    if (restyleIdx.length > 0) Plotly.restyle(plotDiv, { selectedpoints: restyleVals }, restyleIdx);
    applySelectionFit(points);
  }

  function applySelectionFit(points) {
    const groups = groupSelectedPointsByTrace(points);
    selectionFitLastPoints = Array.isArray(points) ? points.slice() : [];
    const shapes = [];
    const annotations = [];
    const validGroups = [];
    const groupFits = [];
    const fitLineColor = getSelectionFitLineColor();
    const activeFitType = normalizeSelectionFitType(selectionFitType);
    const typedFormulaResultByGroup = (activeFitType === 'formula')
      ? (g) => window.FitFunctions.computeTypedFormulaFit(g.xs, g.ys, selectionFitFormula, MATH_SCOPE_KEYS, MATH_SCOPE_VALS)
      : () => ({ fit: null, error: null });
    let stackIndex = 0;
    groups.forEach((g) => {
      if (g.xs.length < 2) return;
      validGroups.push(g);
      const [xMin, xMax] = arrayMinMax(g.xs);
      const [yMin, yMax] = arrayMinMax(g.ys);
      const fitDetails = buildSelectionFitDetails(activeFitType, g, xMin, xMax, yMin, yMax, fitLineColor, typedFormulaResultByGroup(g));
      groupFits.push({ g, xMin, xMax, yMin, yMax, detailLines: fitDetails.detailLines });
      if (!fitDetails.shape) return;
      const xaxis = g.trace.xaxis || 'x';
      const yaxis = g.trace.yaxis || 'y';
      shapes.push(fitDetails.shape);
      annotations.push(buildSelectionFitAnnotation(g, fitDetails.detailLines, xMin, xMax, yMin, yMax, xaxis, yaxis, stackIndex));
      stackIndex += 1;
    });
    if (validGroups.length === 0) {
      clearSelectionFit();
      return;
    }
    setSelectionFitFormulaError(activeFitType === 'formula' && groupFits.length > 0 && /^formula: /.test(groupFits[0].detailLines[0] || '')
      ? (groupFits[0].detailLines[0] || '').slice('formula: '.length)
      : '');
    updateSelectionStatsPanel(groupFits);
    updateFftPanel(groupFits);
    selectionFitShapes = shapes;
    selectionFitAnnotations = annotations;
    if (suppressSelectionReentry) return;
    suppressSelectionReentry = true;
    Plotly.relayout(plotDiv, {
      shapes: baseCornerShapesForOverlay.concat(selectionFitShapes),
      annotations: baseCornerAnnotationsForOverlay
        .concat(selectionFitBoxesVisible ? selectionFitAnnotations : [])
        .concat(notePinAnnotationsForOverlay)
    }).then(() => { suppressSelectionReentry = false; });
  }

  function bindMainPlotSelectionSync() {
    if (!plotDiv || plotDiv.__selectionSyncBound) return;
    if (typeof plotDiv.on !== 'function') return;
    plotDiv.__selectionSyncBound = true;

    plotDiv.on('plotly_selected', (eventData) => {
      if (suppressSelectionReentry) return;
      if (!eventData || !Array.isArray(eventData.points) || eventData.points.length === 0) {
        clearSelectionFit();
        return;
      }
      applySelectionFit(eventData.points);
    });

    plotDiv.on('plotly_deselect', () => {
      if (suppressSelectionReentry) return;
      clearSelectionFit();
    });
  }

  function zoomToCornerHeadingSegment(segment) {
    if (!plotDiv || !segment) return;
    const startDist = Number(segment.startDist);
    const endDist = Number(segment.endDist);
    if (!Number.isFinite(startDist) || !Number.isFinite(endDist) || endDist <= startDist) return;

    const width = endDist - startDist;
    const pad = Math.max(3, width * 0.1);
    const x0 = Math.max(0, startDist - pad);
    const x1 = endDist + pad;
    mainPlotXRange = [x0, x1];

    const relayoutUpdate = {
      'xaxis.range': [x0, x1]
    };

    const mainAxisRanges = computeMainYAxisRangesForXWindow(x0, x1);
    mainAxisRanges.forEach((range, axisRef) => {
      const axisKey = axisRef === 'y' ? 'yaxis.range' : `yaxis${axisRef.slice(1)}.range`;
      relayoutUpdate[axisKey] = range;
    });

    const timeSlipRange = computeTsYRangeForXWindow(x0, x1);
    if (timeSlipRange) {
      relayoutUpdate['yaxis2.range'] = timeSlipRange;
    }

    Plotly.relayout(plotDiv, relayoutUpdate);
    zoomLeafletMapToDistanceWindow(x0, x1);
  }

  function zoomLeafletMapToDistanceWindow(startDist, endDist) {
    if (!leafletMap || !window.L || !Number.isFinite(startDist) || !Number.isFinite(endDist)) return;
    if (!leafletMapMode || (leafletMapMode !== 'geo' && leafletMapMode !== 'xy')) return;

    const selFiles = getSelectedFiles();
    const selectedLaps = getSelectedLaps();
    if (!Array.isArray(selFiles) || selFiles.length === 0) return;

    let bounds = null;

    selFiles.forEach((log) => {
      if (!log || !log.meta || !Array.isArray(log.meta.lapNum) || !Array.isArray(log.meta.lapRelDist)) return;

      const latLonSource = leafletMapMode === 'geo' ? getLeafletLatLonSource(log) : null;
      const mapSource = leafletMapMode === 'xy' ? getMapSourceForLog(log) : null;
      if (leafletMapMode === 'geo' && !latLonSource) return;
      if (leafletMapMode === 'xy' && !mapSource) return;

      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a, b) => a - b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;

        const maskIdx = log.meta.lapNum
          .map((n, i) => n === lap ? i : -1)
          .filter(i => i >= 0);

        maskIdx.forEach((rowIdx) => {
          const dist = Number(log.meta.lapRelDist[rowIdx]);
          if (!Number.isFinite(dist) || dist < startDist || dist > endDist) return;

          const lat = leafletMapMode === 'geo' ? latLonSource.latAt(rowIdx) : mapSource.yAt(rowIdx);
          const lon = leafletMapMode === 'geo' ? latLonSource.lonAt(rowIdx) : mapSource.xAt(rowIdx);
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

          if (!bounds) {
            bounds = L.latLngBounds([lat, lon], [lat, lon]);
          } else {
            bounds.extend([lat, lon]);
          }
        });
      });
    });

    if (!bounds || !bounds.isValid()) return;

    leafletMap.fitBounds(bounds, {
      padding: [35, 35],
      maxZoom: 19,
      animate: true
    });

    const center = leafletMap.getCenter();
    const zoom = leafletMap.getZoom();
    if (!center || !Number.isFinite(center.lat) || !Number.isFinite(center.lng) || !Number.isFinite(zoom)) return;

    if (leafletMapMode === 'xy') {
      leafletXYViewState = { center: [center.lat, center.lng], zoom };
      leafletXYViewStateUserSet = true;
    } else {
      leafletViewState = { center: [center.lat, center.lng], zoom };
      leafletViewStateUserSet = true;
    }
  }

  // Clears any saved/manual map pan-zoom so the next render re-fits the map to the
  // whole track, mirroring the main plot's x-axis reset (double-click / Home button).
  function resetLeafletMapToFullTrack() {
    if (!leafletMap || !leafletMapMode) return;
    leafletViewState = null;
    leafletViewStateUserSet = false;
    leafletXYViewState = null;
    leafletXYViewStateUserSet = false;
    updateLeafletMap(getSelectedFiles(), getSelectedLaps(), leafletMapMode);
  }

  function computeMainYAxisRangesForXWindow(x0, x1) {
    const rangesByAxis = new Map();
    if (!plotDiv || !Array.isArray(plotDiv.data)) return rangesByAxis;

    plotDiv.data.forEach((trace) => {
      if (!trace || trace.visible === false) return;
      const xAxisRef = trace.xaxis || 'x';
      const yAxisRef = trace.yaxis || 'y';
      if (xAxisRef !== 'x') return; // only main subplot traces
      if (yAxisRef === 'y2') return; // time slip axis handled separately

      const xs = Array.isArray(trace.x) ? trace.x : null;
      const ys = Array.isArray(trace.y) ? trace.y : null;
      if (!xs || !ys || xs.length === 0 || ys.length === 0) return;

      let minY = null;
      let maxY = null;
      const n = Math.min(xs.length, ys.length);
      for (let i = 0; i < n; i++) {
        const x = Number(xs[i]);
        const y = Number(ys[i]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
        if (x < x0 || x > x1) continue;
        if (minY === null || y < minY) minY = y;
        if (maxY === null || y > maxY) maxY = y;
      }

      if (minY === null || maxY === null) return;

      if (!rangesByAxis.has(yAxisRef)) {
        rangesByAxis.set(yAxisRef, { min: minY, max: maxY });
        return;
      }

      const existing = rangesByAxis.get(yAxisRef);
      existing.min = Math.min(existing.min, minY);
      existing.max = Math.max(existing.max, maxY);
    });

    const paddedRanges = new Map();
    rangesByAxis.forEach((value, axisRef) => {
      const span = Math.abs(value.max - value.min);
      // Scale the padding floor to the values' own magnitude instead of a fixed 0.05 --
      // a fixed floor swamps small-scale channels like Curvature (1/m, often < 0.05
      // total) and pushes the axis well past the visible data on both ends.
      const scale = Math.max(Math.abs(value.min), Math.abs(value.max), 1e-6);
      const pad = Math.max(span * 0.1, scale * 0.05, 1e-6);
      // Don't let padding push the axis negative for channels whose data never was --
      // radius/curvature/speed-like quantities that are physically non-negative.
      const lower = value.min >= 0 ? Math.max(0, value.min - pad) : (value.min - pad);
      paddedRanges.set(axisRef, [lower, value.max + pad]);
    });

    return paddedRanges;
  }

  function findCornerHeadingSegmentAtDistance(distance) {
    const x = Number(distance);
    if (!Number.isFinite(x) || !Array.isArray(activeCornerHeadingSegments) || activeCornerHeadingSegments.length === 0) {
      return null;
    }

    return activeCornerHeadingSegments.find((segment) => {
      const startDist = Number(segment.startDist);
      const endDist = Number(segment.endDist);
      if (!Number.isFinite(startDist) || !Number.isFinite(endDist)) return false;
      return x >= startDist && x <= endDist;
    }) || null;
  }

  function bindCornerStripZoom() {
    if (!plotDiv || plotDiv.__cornerStripZoomBound) return;
    if (typeof plotDiv.on !== 'function') return;
    plotDiv.__cornerStripZoomBound = true;

    // Clicking the color strip at the top zooms X and fits Y for that segment.
    // Touch: Plotly's drag layer cancels the browser's synthesized click on a tap (so the
    // click listener below never fires on a phone). A short, mostly stationary
    // pointerdown/pointerup pair is treated as a tap instead; the click that follows a
    // mouse/pen tap is ignored so a segment is never zoomed to twice.
    let tapStart = null;
    let lastTapHandledAt = 0;
    plotDiv.addEventListener('pointerdown', (event) => {
      tapStart = { x: event.clientX, y: event.clientY, t: Date.now(), id: event.pointerId };
    });
    plotDiv.addEventListener('pointerup', (event) => {
      const start = tapStart;
      tapStart = null;
      if (!start || start.id !== event.pointerId) return;
      if (Date.now() - start.t > 600) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
      if (handleCornerStripPoint(event.clientX, event.clientY)) lastTapHandledAt = Date.now();
    });
    plotDiv.addEventListener('click', (event) => {
      if (Date.now() - lastTapHandledAt < 700) return;
      handleCornerStripPoint(event.clientX, event.clientY);
    });

    function handleCornerStripPoint(clientX, clientY) {
      if (!Array.isArray(activeCornerHeadingSegments) || activeCornerHeadingSegments.length === 0) return false;
      const fullLayout = plotDiv._fullLayout;
      if (!fullLayout || !fullLayout.xaxis || !fullLayout._size) return false;

      const bounds = plotDiv.getBoundingClientRect();
      const size = fullLayout._size;
      const pxFromLeft = clientX - bounds.left;
      const pxFromTop = clientY - bounds.top;
      const plotX0 = size.l;
      const plotX1 = size.l + size.w;
      const plotY0 = size.t;
      const plotY1 = size.t + size.h;

      if (pxFromLeft < plotX0 || pxFromLeft > plotX1 || pxFromTop < plotY0 || pxFromTop > plotY1) return false;

      const paperY = 1 - ((pxFromTop - plotY0) / size.h);
      if (paperY < CORNER_STRIP_DOMAIN[0] || paperY > CORNER_STRIP_DOMAIN[1]) return false;

      const xPixels = pxFromLeft - fullLayout.xaxis._offset;
      const xValue = Number(fullLayout.xaxis.p2l(xPixels));
      if (!Number.isFinite(xValue)) return false;

      const segment = findCornerHeadingSegmentAtDistance(xValue);
      if (!segment) return false;
      zoomToCornerHeadingSegment(segment);
      return true;
    }
  }

  function colorForLap(lap) {
    const n = Number.isFinite(lap) ? Math.floor(lap) : 0;
    const idx = ((n % COLORS.length) + COLORS.length) % COLORS.length;
    return COLORS[idx];
  }

  function lapColorKey(fileId, lap) {
    return `${fileId}::${lap}`;
  }

  function getLapColor(fileId, lap) {
    const key = lapColorKey(fileId, lap);
    return normalizeHexColor(lapColorOverrides.has(key) ? lapColorOverrides.get(key) : colorForLap(lap));
  }

  function setLapColor(fileId, lap, color) {
    lapColorOverrides.set(lapColorKey(fileId, lap), normalizeHexColor(color));
  }

  function getLineDashForFileIndex(fileIdx) {
    return DASHES[fileIdx % DASHES.length];
  }

  function getSvgDashArray(dash) {
    if (dash === 'dash') return '10 6';
    if (dash === 'dot') return '2 4';
    if (dash === 'dashdot') return '10 4 2 4';
    if (dash === 'longdash') return '14 6';
    if (dash === 'longdashdot') return '14 4 2 4';
    return '';
  }

  function normalizeHexColor(color) {
    return /^#[0-9a-f]{6}$/i.test(String(color)) ? String(color) : COLORS[0];
  }

  function syncSelectedChannelColors(selectedChannels) {
    const activeColors = new Set();
    selectedChannels.forEach((channel) => {
      if (!channelColorOverrides.has(channel)) return;
      activeColors.add(channelColorOverrides.get(channel));
    });
    selectedChannels.forEach((channel, index) => {
      if (channelColorOverrides.has(channel)) return;
      let color = COLORS.find((candidate) => !activeColors.has(candidate));
      if (!color) color = COLORS[index % COLORS.length];
      channelColorOverrides.set(channel, color);
      activeColors.add(color);
    });
  }

  function getChannelColor(channel) {
    return normalizeHexColor(channelColorOverrides.get(channel));
  }

  // Kept in sync by hand with the CSS custom properties in style.css (--bg-surface,
  // --text-primary, --border-dashed, --border for each theme) -- Plotly renders its own
  // axes/background into an SVG, so it can't pick up CSS variables directly and needs
  // its own template pushed in whenever the theme changes.
  const PLOTLY_THEME_TEMPLATES = {
    light: {
      layout: {
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#ffffff',
        font: {color: '#0b2545'},
        xaxis: {gridcolor: '#e7edf5', linecolor: '#cbd6e2', zerolinecolor: '#cbd6e2'},
        yaxis: {gridcolor: '#e7edf5', linecolor: '#cbd6e2', zerolinecolor: '#cbd6e2'},
        // Explicit instead of Plotly's auto-contrast-from-paper_bgcolor default -- that
        // computation doesn't reliably re-run on a template-only relayout (see
        // getPlotlyThemeTemplate), so icons could keep the other theme's colors, including
        // on hover, until some unrelated full redraw happened to recompute them.
        modebar: {bgcolor: 'rgba(255,255,255,0.9)', color: '#5b7590', activecolor: '#0b2545'}
      }
    },
    dark: {
      layout: {
        paper_bgcolor: '#1a222c',
        plot_bgcolor: '#1a222c',
        font: {color: '#e8eef7'},
        xaxis: {gridcolor: '#29323d', linecolor: '#34424f', zerolinecolor: '#3a4652'},
        yaxis: {gridcolor: '#29323d', linecolor: '#34424f', zerolinecolor: '#3a4652'},
        modebar: {bgcolor: 'rgba(26,34,44,0.9)', color: '#9fb0c3', activecolor: '#e8eef7'}
      }
    }
  };

  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  // Plotly's `layout.template` applies its xaxis/yaxis entries as defaults to every
  // matching axis on the plot (xaxis2, yaxis3, ...), so this alone re-themes a plot with
  // any number of dynamically-added channel axes without enumerating them by hand.
  function getPlotlyThemeTemplate() {
    return PLOTLY_THEME_TEMPLATES[getCurrentTheme()];
  }

  // Same accent used for the pinned-note map marker and elsewhere in the sessions UI
  // (badges, active buttons, the note-type pill) -- --accent-active-text's literal
  // values, since a Plotly annotation's font.color needs an actual color, not a CSS
  // custom property reference.
  function getNoteMarkerAccentColor() {
    return getCurrentTheme() === 'dark' ? '#cfe0f8' : '#12386b';
  }

  function getBlankBasemapBackground() {
    return getCurrentTheme() === 'dark' ? BLANK_BASEMAP_BACKGROUND_DARK : BLANK_BASEMAP_BACKGROUND_LIGHT;
  }

  function getOsmTileUrl() {
    return getCurrentTheme() === 'dark' ? OSM_TILE_URL_DARK : OSM_TILE_URL_LIGHT;
  }

  function applyTheme(theme, opts) {
    const options = opts || {};
    const resolved = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', resolved);

    if (options.persist !== false) {
      try { localStorage.setItem('csvPlotterTheme', resolved); } catch (e) { /* private browsing, etc. */ }
    }

    if (themeToggleBtn) {
      const isDark = resolved === 'dark';
      themeToggleBtn.setAttribute('aria-checked', isDark ? 'true' : 'false');
      themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      if (themeToggleLabel) themeToggleLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }

    if (options.rerenderPlots !== false) {
      const template = getPlotlyThemeTemplate();
      if (plotDiv && Array.isArray(plotDiv.data) && plotDiv.data.length > 0) {
        // Pinned-note markers' font.color is baked in at build time (a template can't
        // reach into individual annotation fields), so without this they'd keep the
        // outgoing theme's colour until the next full updatePlot() render.
        if (notePinAnnotationsForOverlay.length) {
          notePinAnnotationsForOverlay = notePinAnnotationsForOverlay.map((a) => Object.assign({}, a, {
            font: Object.assign({}, a.font, { color: getNoteMarkerAccentColor() })
          }));
          Plotly.relayout(plotDiv, {
            template,
            annotations: baseCornerAnnotationsForOverlay
              .concat(selectionFitBoxesVisible ? selectionFitAnnotations : [])
              .concat(notePinAnnotationsForOverlay)
          });
        } else {
          Plotly.relayout(plotDiv, {template});
        }
      }
      if (mapDiv && Array.isArray(mapDiv.data) && mapDiv.data.length > 0) {
        Plotly.relayout(mapDiv, {template});
      }
      if (leafletMapDiv) leafletMapDiv.style.background = getBlankBasemapBackground();
      // Updated unconditionally (not just while it's the visible layer) so switching to
      // OpenStreetMap later, after a theme change made while Satellite was active, still
      // shows the right variant instead of a stale one from whenever it was created.
      // Satellite imagery isn't touched -- it's just photos, no meaningful "dark mode".
      if (leafletOsmLayer) leafletOsmLayer.setUrl(getOsmTileUrl());
    }
  }

  function initThemeToggle() {
    // The inline anti-flash script in <head> already set data-theme before this ran --
    // this just syncs the button's own label/aria state to it (the switch's slide and
    // icon-dimming animation is pure CSS, driven directly off data-theme), without touching the
    // still-empty plots or re-writing the localStorage value that was just read from.
    applyTheme(getCurrentTheme(), {persist: false, rerenderPlots: false});
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        applyTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
      });
    }
  }

  function setControlsOpen(isOpen) {
    const isMobile = window.innerWidth <= 980;
    if (isMobile) {
      document.body.classList.toggle('controls-open', isOpen);
      if (controlsBackdrop) controlsBackdrop.hidden = !isOpen;
    } else {
      // Desktop: sidebar is visible by default; 'sidebar-collapsed' hides it.
      document.body.classList.toggle('sidebar-collapsed', !isOpen);
      if (controlsBackdrop) controlsBackdrop.hidden = true;
    }
    if (controlsToggle) controlsToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (logs.length > 0) {
      scheduleVisualizationResize();
    }
  }

  // Mobile auto-opens controls on first load; desktop starts with sidebar visible.
  if (window.innerWidth <= 980 && logs.length === 0) {
    setControlsOpen(true);
  }

  if (controlsToggle) {
    controlsToggle.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 980;
      if (isMobile) {
        setControlsOpen(!document.body.classList.contains('controls-open'));
      } else {
        // Toggle: collapsed -> open, open -> collapse
        setControlsOpen(document.body.classList.contains('sidebar-collapsed'));
      }
    });
  }

  if (controlsClose) controlsClose.addEventListener('click', () => setControlsOpen(false));
  if (controlsBackdrop) controlsBackdrop.addEventListener('click', () => setControlsOpen(false));
  initThemeToggle();

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && importerEditorState.isOpen) {
      closeImporterEditor();
      return;
    }
    if (ev.key === 'Escape' && document.body.classList.contains('controls-open')) {
      setControlsOpen(false);
    }
  });

  window.addEventListener('resize', () => {
    // Clean up class state when the viewport crosses the mobile/desktop breakpoint.
    if (window.innerWidth > 980) {
      document.body.classList.remove('controls-open');
      if (controlsBackdrop) controlsBackdrop.hidden = true;
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
    if (logs.length > 0) updatePlot();
  });

  function idForName(name) {
    return name.replace(/[^a-z0-9]+/ig, '_') + '_' + Math.random().toString(36).slice(2,8);
  }

  function resolveDecoderName(meta, forcedDecoderName = '') {
    if (forcedDecoderName) return forcedDecoderName;
    const decoderValue = (meta && typeof meta.decoder === 'string') ? meta.decoder.trim() : '';
    if (decoderValue) return decoderValue;

    const sourceValue = (meta && typeof meta.source === 'string') ? meta.source.trim() : '';
    if (!sourceValue) return '';

    const availableDecoders = (window.LogFileProcessors && window.LogFileProcessors.AVAILABLE_DECODERS)
      ? window.LogFileProcessors.AVAILABLE_DECODERS
      : [];
    const sourceLower = sourceValue.toLowerCase();
    const matched = availableDecoders.find((decoder) => {
      const name = decoder && typeof decoder.name === 'string' ? decoder.name.toLowerCase() : '';
      const label = decoder && typeof decoder.label === 'string' ? decoder.label.toLowerCase() : '';
      return name === sourceLower || label === sourceLower;
    });
    return matched ? matched.name : '';
  }

  function getDecoderMappingColumnKey(decoderName) {
    if (decoderName === 'GP Bikes') return 'piboso';
    if (decoderName === 'AiM') return 'aim';
    if (decoderName === 'MoTeC') return 'motec';
    return 'displayName';
  }

  function getCustomImporterTargetColumn(displayName, decoderName) {
    const mapping = getChannelMap().find(m => m.displayName === displayName);
    if (!mapping) return displayName;
    const key = getDecoderMappingColumnKey(decoderName);
    if (key === 'motec') return mapping.motec || mapping.displayName || mapping.piboso || displayName;
    return mapping[key] || mapping.displayName || mapping.piboso || displayName;
  }

  function normalizeCustomStandardChannelsConfig(config) {
    if (!Array.isArray(config)) return [];
    const seen = new Set();
    const normalized = [];
    config.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const displayName = String(entry.displayName == null ? '' : entry.displayName).trim();
      const unit = String(entry.unit == null ? '' : entry.unit).trim();
      if (!displayName) return;
      const key = displayName.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      normalized.push({ displayName, unit, isUserDefined: true });
    });
    return normalized;
  }

  function loadCustomStandardChannels() {
    try {
      const parsed = JSON.parse(localStorage.getItem(IMPORTER_CUSTOM_STANDARD_CHANNELS_STORAGE_KEY) || '[]');
      return normalizeCustomStandardChannelsConfig(parsed);
    } catch {
      return [];
    }
  }

  function saveCustomStandardChannels() {
    try {
      const payload = customStandardChannels.map((entry) => ({
        displayName: entry.displayName,
        unit: entry.unit || ''
      }));
      localStorage.setItem(IMPORTER_CUSTOM_STANDARD_CHANNELS_STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }

  function getImporterStandardChannels() {
    const seen = new Set();
    const standards = [];
    const add = (entry) => {
      if (!entry || typeof entry !== 'object') return;
      const displayName = String(entry.displayName == null ? '' : entry.displayName).trim();
      if (!displayName) return;
      const key = displayName.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      standards.push({
        displayName,
        unit: String(entry.unit == null ? '' : entry.unit).trim(),
        isUserDefined: !!entry.isUserDefined
      });
    };

    IMPORTER_BUILTIN_STANDARD_CHANNELS.forEach(add);
    getChannelMap().forEach((mapping) => add({ displayName: mapping.displayName, unit: '' }));
    customStandardChannels.forEach(add);
    return standards;
  }

  function getImporterStandardChannelByName(displayName) {
    const key = String(displayName == null ? '' : displayName).trim().toLowerCase();
    if (!key) return null;
    return getImporterStandardChannels().find((entry) => entry.displayName.toLowerCase() === key) || null;
  }

  function normalizeCustomImporterConfig(config) {
    if (!config || typeof config !== 'object' || Array.isArray(config)) return null;
    const decoder = String(config.decoder == null ? '' : config.decoder).trim();
    if (!decoder) return null;

    const channels = {};
    if (config.channels && typeof config.channels === 'object' && !Array.isArray(config.channels)) {
      Object.keys(config.channels).forEach((standardChannel) => {
        const source = String(config.channels[standardChannel] == null ? '' : config.channels[standardChannel]).trim();
        if (source) channels[standardChannel] = source;
      });
    }

    const filters = {};
    if (config.filters && typeof config.filters === 'object' && !Array.isArray(config.filters)) {
      Object.keys(config.filters).forEach((standardChannel) => {
        const raw = config.filters[standardChannel];
        if (!raw || typeof raw !== 'object') return;
        const axis = IMPORTER_FILTER_AXES.includes(raw.axis) ? raw.axis : 'time';
        const window = Number(raw.window);
        filters[standardChannel] = {
          enabled: !!raw.enabled,
          axis,
          window: Number.isFinite(window) && window > 0 ? window : 0
        };
      });
    }

    const downsampleHz = Number(config.downsampleHz);

    // Optional manual header-row override (bypasses auto-detection of the header/units/
    // first-data row when parsing this file) -- all 0-based row indices into the parsed
    // rows array. Left null when not in manual mode; file-processors.js's own
    // normalizeManualHeaderOverride re-validates these against the actual row count at
    // parse time, so a stale value here (e.g. the file's content changed) can't misbehave.
    const headerRowIndex = Number(config.headerRowIndex);
    const dataStartRowIndex = Number(config.dataStartRowIndex);
    const unitsRowIndexRaw = Number(config.unitsRowIndex);
    const hasManualHeader = Number.isInteger(headerRowIndex) && headerRowIndex >= 0
      && Number.isInteger(dataStartRowIndex) && dataStartRowIndex > headerRowIndex;

    return {
      decoder,
      channels,
      filters,
      downsampleHz: Number.isFinite(downsampleHz) && downsampleHz > 0 ? downsampleHz : null,
      headerRowIndex: hasManualHeader ? headerRowIndex : null,
      unitsRowIndex: hasManualHeader && Number.isInteger(unitsRowIndexRaw) ? unitsRowIndexRaw : null,
      dataStartRowIndex: hasManualHeader ? dataStartRowIndex : null
    };
  }

  function estimateFrequencyHzFromAxisValues(values) {
    if (!Array.isArray(values) || values.length < 3) return null;
    const dts = [];
    for (let i = 1; i < values.length; i++) {
      const prev = Number(values[i - 1]);
      const next = Number(values[i]);
      if (!Number.isFinite(prev) || !Number.isFinite(next)) continue;
      const dt = next - prev;
      if (dt > 0) dts.push(dt);
    }
    if (dts.length < 2) return null;
    dts.sort((a, b) => a - b);
    const mid = Math.floor(dts.length / 2);
    const medianDt = (dts.length % 2 === 0) ? ((dts[mid - 1] + dts[mid]) / 2) : dts[mid];
    if (!Number.isFinite(medianDt) || medianDt <= 0) return null;
    const hz = 1 / medianDt;
    return Number.isFinite(hz) && hz > 0 ? hz : null;
  }

  function timeUnitScaleToSeconds(unit) {
    const u = String(unit == null ? '' : unit).trim().toLowerCase();
    if (!u) return 1;
    if (u === 's' || u === 'sec' || u === 'secs' || u === 'second' || u === 'seconds') return 1;
    if (u === 'ms' || u === 'msec' || u === 'millisecond' || u === 'milliseconds') return 0.001;
    if (u === 'us' || u === 'usec' || u === 'microsecond' || u === 'microseconds') return 0.000001;
    if (u === 'min' || u === 'mins' || u === 'minute' || u === 'minutes') return 60;
    if (u === 'h' || u === 'hr' || u === 'hrs' || u === 'hour' || u === 'hours') return 3600;
    return 1;
  }

  function parseTimeLikeSeconds(value, unitHint = '') {
    const scale = timeUnitScaleToSeconds(unitHint);
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric * scale;
    if (typeof value !== 'string') return null;

    const raw = value.trim();
    if (!raw) return null;

    const normalized = raw.replace(',', '.');
    const normalizedNumeric = Number(normalized);
    if (Number.isFinite(normalizedNumeric)) return normalizedNumeric * scale;

    const parsedEpochMs = Date.parse(normalized);
    if (!Number.isNaN(parsedEpochMs)) return parsedEpochMs / 1000;

    // Supports mm:ss(.sss) and hh:mm:ss(.sss), with optional leading sign.
    if (!/^-?\d+(?::\d{1,2}){1,2}(?:\.\d+)?$/.test(normalized)) return null;
    const sign = normalized.startsWith('-') ? -1 : 1;
    const token = sign < 0 ? normalized.slice(1) : normalized;
    const parts = token.split(':');
    let seconds = 0;
    for (let i = 0; i < parts.length; i++) {
      const n = Number(parts[parts.length - 1 - i]);
      if (!Number.isFinite(n)) return null;
      seconds += n * Math.pow(60, i);
    }
    return sign * seconds;
  }

  function getImporterEditorTimeAxisValues(log, state = importerEditorState) {
    if (!log) return null;
    const chosenTimeCol = state && state.channels ? String(state.channels.Time || '').trim() : '';
    if (chosenTimeCol && Array.isArray(log.cols) && log.cols.includes(chosenTimeCol)) {
      const unit = log.meta && log.meta.units ? log.meta.units[chosenTimeCol] : '';
      return log.data.map((row) => {
        const n = parseTimeLikeSeconds(row[chosenTimeCol], unit);
        return Number.isFinite(n) ? n : null;
      });
    }
    const timeCol = log.meta && log.meta.timeCol;
    if (timeCol && Array.isArray(log.cols) && log.cols.includes(timeCol)) {
      const unit = log.meta && log.meta.units ? log.meta.units[timeCol] : '';
      return log.data.map((row) => {
        const n = parseTimeLikeSeconds(row[timeCol], unit);
        return Number.isFinite(n) ? n : null;
      });
    }
    return (log.meta && Array.isArray(log.meta._time)) ? log.meta._time : null;
  }

  function updateImporterEditorFrequencyInfo() {
    const log = logs.find((entry) => entry.id === importerEditorState.logId);
    const axisValues = getImporterEditorTimeAxisValues(log, importerEditorState);
    const hz = estimateFrequencyHzFromAxisValues(axisValues);
    importerEditorState.dataFrequencyHz = Number.isFinite(hz) ? hz : null;
    if (importerEditorDataFreqValue) {
      importerEditorDataFreqValue.textContent = Number.isFinite(hz) ? `${hz.toFixed(2)} Hz` : 'n/a';
    }
  }

  function buildNaturalCubicSpline(xs, ys) {
    const n = xs.length;
    if (n < 3) return null;

    const a = ys.slice();
    const b = new Array(n - 1).fill(0);
    const c = new Array(n).fill(0);
    const d = new Array(n - 1).fill(0);
    const h = new Array(n - 1).fill(0);

    for (let i = 0; i < n - 1; i++) {
      h[i] = xs[i + 1] - xs[i];
      if (h[i] <= 0) return null;
    }

    const alpha = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++) {
      alpha[i] = (3 / h[i]) * (a[i + 1] - a[i]) - (3 / h[i - 1]) * (a[i] - a[i - 1]);
    }

    const l = new Array(n).fill(0);
    const mu = new Array(n).fill(0);
    const z = new Array(n).fill(0);
    l[0] = 1;
    for (let i = 1; i < n - 1; i++) {
      l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
      if (Math.abs(l[i]) <= 1e-12) return null;
      mu[i] = h[i] / l[i];
      z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
    }
    l[n - 1] = 1;
    c[n - 1] = 0;

    for (let j = n - 2; j >= 0; j--) {
      c[j] = z[j] - mu[j] * c[j + 1];
      b[j] = (a[j + 1] - a[j]) / h[j] - (h[j] * (c[j + 1] + 2 * c[j])) / 3;
      d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
    }

    return { x: xs, a, b, c, d };
  }

  function evaluateNaturalCubicSpline(spline, xq) {
    const xs = spline.x;
    const n = xs.length;
    if (xq <= xs[0]) return spline.a[0];
    if (xq >= xs[n - 1]) return spline.a[n - 1];

    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (xs[mid] <= xq) lo = mid;
      else hi = mid;
    }

    const dx = xq - xs[lo];
    return spline.a[lo] + spline.b[lo] * dx + spline.c[lo] * dx * dx + spline.d[lo] * dx * dx * dx;
  }

  function evaluateLinear(xs, ys, xq) {
    const n = xs.length;
    if (n === 0) return null;
    if (n === 1) return ys[0];
    if (xq <= xs[0]) return ys[0];
    if (xq >= xs[n - 1]) return ys[n - 1];

    let lo = 0;
    let hi = n - 1;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (xs[mid] <= xq) lo = mid;
      else hi = mid;
    }

    const x0 = xs[lo], x1 = xs[hi], y0 = ys[lo], y1 = ys[hi];
    if (!Number.isFinite(x0) || !Number.isFinite(x1) || x1 === x0) return y0;
    const ratio = (xq - x0) / (x1 - x0);
    return y0 + (y1 - y0) * ratio;
  }

  function resampleProcessedByFrequency(processed, targetHz) {
    const hz = Number(targetHz);
    if (!Number.isFinite(hz) || hz <= 0) return;
    if (!processed || !Array.isArray(processed.data) || !processed.meta || processed.data.length < 3) return;

    const originalData = processed.data.slice();
    const originalCols = Array.isArray(processed.cols) ? processed.cols.slice() : [];
    const originalLapNum = Array.isArray(processed.meta.lapNum) && processed.meta.lapNum.length === originalData.length
      ? processed.meta.lapNum.slice()
      : null;
    const originalLapTime = Array.isArray(processed.meta.lapTime) && processed.meta.lapTime.length === originalData.length
      ? processed.meta.lapTime.slice()
      : null;
    const originalLapRelDist = Array.isArray(processed.meta.lapRelDist) && processed.meta.lapRelDist.length === originalData.length
      ? processed.meta.lapRelDist.slice()
      : null;

    const timeCol = processed.meta.timeCol;
    let axisValues = null;
    if (timeCol && Array.isArray(processed.cols) && processed.cols.includes(timeCol)) {
      const unit = (processed.meta && processed.meta.units && processed.meta.units[timeCol]) || (processed.units && processed.units[timeCol]) || '';
      axisValues = processed.data.map((row) => {
        const n = parseTimeLikeSeconds(row[timeCol], unit);
        return Number.isFinite(n) ? n : null;
      });
    } else if (Array.isArray(processed.meta._time)) {
      axisValues = processed.meta._time;
    }
    if (!Array.isArray(axisValues) || axisValues.length !== processed.data.length) return;

    const finiteTime = axisValues.filter((v) => Number.isFinite(Number(v))).map(Number);
    if (finiteTime.length < 2) return;
    const tStart = finiteTime[0];
    const tEnd = finiteTime[finiteTime.length - 1];
    if (!(tEnd > tStart)) return;

    const sourceHz = estimateFrequencyHzFromAxisValues(axisValues);
    if (Number.isFinite(sourceHz)) {
      const ratioDiff = Math.abs(hz - sourceHz) / sourceHz;
      if (ratioDiff < 0.02) return;
    }
    processed.meta.importResampleHz = hz;
    processed.meta.importUpsampled = Number.isFinite(sourceHz) ? hz > sourceHz : null;
    processed.meta.importResampleMethod = 'b-spline';

    const step = 1 / hz;
    const grid = [];
    for (let t = tStart; t <= tEnd + step * 0.5; t += step) {
      grid.push(Number(t.toFixed(6)));
    }
    if (grid.length < 2) return;

    const cols = originalCols.slice();
    const units = (processed.units && typeof processed.units === 'object') ? processed.units : {};
    const newRows = grid.map((t) => ({ [timeCol]: t }));

    cols.forEach((col) => {
      if (col === timeCol) return;
      const xs = [];
      const ys = [];
      for (let i = 0; i < processed.data.length; i++) {
        const tx = Number(axisValues[i]);
        const vy = Number(processed.data[i][col]);
        if (!Number.isFinite(tx) || !Number.isFinite(vy)) continue;
        const last = xs.length - 1;
        if (last >= 0 && Math.abs(xs[last] - tx) <= 1e-9) {
          ys[last] = vy;
        } else {
          xs.push(tx);
          ys.push(vy);
        }
      }
      if (xs.length === 0) return;

      const spline = buildNaturalCubicSpline(xs, ys);
      for (let i = 0; i < grid.length; i++) {
        const xq = grid[i];
        const yq = spline ? evaluateNaturalCubicSpline(spline, xq) : evaluateLinear(xs, ys, xq);
        newRows[i][col] = Number.isFinite(yq) ? yq : null;
      }
    });

    processed.data.splice(0, processed.data.length, ...newRows);
    if (timeCol) units[timeCol] = 's';
    processed.units = units;
    processed.meta._time = grid;
    if (processed.meta.timeCol) processed.meta.timeCol = timeCol;

    const distCol = processed.meta && processed.meta.distCol;
    if (distCol && cols.includes(distCol)) {
      processed.meta._dist = processed.data.map((row) => {
        const n = Number(row[distCol]);
        return Number.isFinite(n) ? n : null;
      });
    }

    if (originalLapNum && originalLapTime && Array.isArray(axisValues)) {
      const lapStartTimeByLap = new Map();
      const lapStartDistByLap = new Map();
      const lapStartIndexByLap = new Map();
      for (let i = 0; i < originalLapNum.length; i++) {
        const lap = originalLapNum[i];
        const t = Number(axisValues[i]);
        if (Number.isFinite(t) && !lapStartTimeByLap.has(lap)) {
          lapStartTimeByLap.set(lap, t);
          lapStartIndexByLap.set(lap, i);
        }
        if (originalLapRelDist && Number.isFinite(Number(originalLapRelDist[i])) && !lapStartDistByLap.has(lap)) {
          lapStartDistByLap.set(lap, Number(originalLapRelDist[i]));
        }
      }

      const newLapNum = new Array(grid.length).fill(1);
      const newLapTime = new Array(grid.length).fill(null);
      const newLapRelDist = Array.isArray(processed.meta._dist) ? new Array(grid.length).fill(null) : null;
      const sortedTimes = grid.slice();
      const sortedOriginal = axisValues.map((t, i) => ({ t: Number(t), lap: originalLapNum[i] }))
        .filter((entry) => Number.isFinite(entry.t))
        .sort((a, b) => a.t - b.t);

      const findLapAtTime = (t) => {
        let lo = 0;
        let hi = sortedOriginal.length - 1;
        if (sortedOriginal.length === 0) return 1;
        if (t <= sortedOriginal[0].t) return sortedOriginal[0].lap;
        if (t >= sortedOriginal[hi].t) return sortedOriginal[hi].lap;
        while (hi - lo > 1) {
          const mid = Math.floor((lo + hi) / 2);
          if (sortedOriginal[mid].t <= t) lo = mid;
          else hi = mid;
        }
        return sortedOriginal[lo].lap;
      };

      for (let i = 0; i < sortedTimes.length; i++) {
        const t = Number(sortedTimes[i]);
        if (!Number.isFinite(t)) continue;
        const lap = findLapAtTime(t);
        newLapNum[i] = lap;
        const startT = lapStartTimeByLap.get(lap);
        if (Number.isFinite(startT)) newLapTime[i] = Math.max(0, t - startT);
        if (newLapRelDist && distCol && processed.cols.includes(distCol)) {
          const dist = Number(processed.data[i][distCol]);
          const startD = lapStartDistByLap.get(lap);
          if (Number.isFinite(dist) && Number.isFinite(startD)) newLapRelDist[i] = dist - startD;
        }
      }

      processed.meta.lapNum = newLapNum;
      processed.meta.lapTime = newLapTime;
      if (newLapRelDist) processed.meta.lapRelDist = newLapRelDist;
      const maxLap = Math.max(...newLapNum);
      processed.meta.lapDurations = Array.from({ length: maxLap }, (_, idx) => {
        const lap = idx + 1;
        const values = newLapTime.filter((v, i) => newLapNum[i] === lap && Number.isFinite(v));
        return values.length > 0 ? Math.max(...values) : null;
      });
    }

    Object.keys(processed.meta).forEach((key) => {
      if (key === '_time' || key === '_dist' || key === 'lapNum' || key === 'lapTime' || key === 'lapRelDist' || key === 'lapDurations') return;
      const value = processed.meta[key];
      if (Array.isArray(value)) delete processed.meta[key];
    });
  }

  function getCustomImporterConfigForLog(log, decoderName) {
    const normalized = normalizeCustomImporterConfig(log && log.meta ? log.meta.customImporter : null);
    if (!normalized) return null;
    return normalized.decoder === decoderName ? normalized : null;
  }

  function setImporterEditorError(message) {
    if (!importerEditorError) return;
    const text = String(message || '').trim();
    importerEditorError.textContent = text;
    importerEditorError.hidden = !text;
  }

  // Decoders whose parsing pipeline doesn't go through header-row-index detection at all
  // (VBOX uses bracket-sectioned markers; ScanMyTesla's real-world files are sparse
  // long-format logs handled by a dedicated pipeline that never reaches the header-index
  // fallback) -- the manual header-override UI would be a dead control for these.
  const HEADER_OVERRIDE_UNSUPPORTED_DECODERS = ['VBOX', 'ScanMyTesla'];

  function buildDefaultImporterEditorState(log, decoderName) {
    const existing = getCustomImporterConfigForLog(log, decoderName);
    const baseCols = Array.isArray(log && log.meta && log.meta.baseCols)
      ? log.meta.baseCols
      : (Array.isArray(log && log.cols) ? log.cols.slice() : []);
    const allowedCols = new Set(baseCols);
    const channels = {};
    const filters = {};

    const rawRows = getCsvRawRowsForLog(log);
    const headerOverrideSupported = Array.isArray(rawRows) && rawRows.length > 0
      && !HEADER_OVERRIDE_UNSUPPORTED_DECODERS.includes(decoderName);
    const hasSavedManualHeader = !!(existing && Number.isInteger(existing.headerRowIndex) && Number.isInteger(existing.dataStartRowIndex));
    let headerOverride = null;
    if (headerOverrideSupported) {
      const LP = window.LogFileProcessors;
      const auto = (typeof LP.describeAutoHeaderDetection === 'function') ? LP.describeAutoHeaderDetection(rawRows, decoderName) : null;
      headerOverride = {
        enabled: hasSavedManualHeader,
        headerRowIndex: hasSavedManualHeader ? existing.headerRowIndex : (auto ? auto.headerRowIndex : 0),
        unitsRowIndex: hasSavedManualHeader ? existing.unitsRowIndex : (auto ? auto.unitsRowIndex : null),
        dataStartRowIndex: hasSavedManualHeader ? existing.dataStartRowIndex : (auto ? auto.dataStartRowIndex : 1)
      };
    }

    getImporterStandardChannels().forEach((standardDef) => {
      const standard = standardDef.displayName;
      const existingSource = existing && existing.channels ? existing.channels[standard] : '';
      const targetCol = getCustomImporterTargetColumn(standard, decoderName);

      if (existingSource && allowedCols.has(existingSource)) {
        channels[standard] = existingSource;
      } else if (allowedCols.has(targetCol)) {
        channels[standard] = targetCol;
      } else {
        channels[standard] = '';
      }

      const existingFilter = existing && existing.filters ? existing.filters[standard] : null;
      filters[standard] = {
        enabled: !!(existingFilter && existingFilter.enabled),
        axis: existingFilter && IMPORTER_FILTER_AXES.includes(existingFilter.axis) ? existingFilter.axis : 'time',
        window: existingFilter && Number.isFinite(Number(existingFilter.window)) && Number(existingFilter.window) > 0
          ? Number(existingFilter.window)
          : 0.5
      };
    });

    return {
      isOpen: true,
      logId: log ? log.id : null,
      decoderName,
      dataFrequencyHz: null,
      downsampleHz: existing && Number.isFinite(Number(existing.downsampleHz)) && Number(existing.downsampleHz) > 0
        ? Number(existing.downsampleHz)
        : (decoderName === 'Garmin TCX' ? 10 : null),
      channels,
      filters,
      rawRows,
      headerOverrideSupported,
      headerOverride
    };
  }

  const IMPORTER_ROW_PREVIEW_MAX_ROWS = 60;
  const IMPORTER_ROW_PREVIEW_MAX_CELLS = 8;

  function formatImporterPreviewRow(row) {
    if (!Array.isArray(row)) return '';
    const cells = row.slice(0, IMPORTER_ROW_PREVIEW_MAX_CELLS);
    const text = cells.map((c) => (c == null ? '' : String(c).trim())).filter((c) => c !== '').join(', ');
    return text + (row.length > IMPORTER_ROW_PREVIEW_MAX_CELLS ? ', …' : '');
  }

  // Refreshes the whole "Header Rows" section (toggle state, number inputs, preview) from
  // importerEditorState.headerOverride -- called on modal open and whenever the toggle or
  // number inputs change.
  function renderImporterHeaderOverride() {
    if (!importerHeaderOverrideSection) return;
    const state = importerEditorState;
    const supported = !!state.headerOverrideSupported;
    importerHeaderOverrideSection.hidden = !supported;
    if (!supported || !state.headerOverride) return;

    const override = state.headerOverride;
    if (importerHeaderModeAutoInput) importerHeaderModeAutoInput.checked = !override.enabled;
    if (importerHeaderModeManualInput) importerHeaderModeManualInput.checked = !!override.enabled;
    if (importerHeaderOverrideFields) importerHeaderOverrideFields.hidden = !override.enabled;

    if (importerHeaderRowInput) {
      importerHeaderRowInput.value = Number.isInteger(override.headerRowIndex) ? String(override.headerRowIndex + 1) : '';
    }
    if (importerUnitsRowInput) {
      importerUnitsRowInput.value = Number.isInteger(override.unitsRowIndex) ? String(override.unitsRowIndex + 1) : '';
    }
    if (importerDataStartRowInput) {
      importerDataStartRowInput.value = Number.isInteger(override.dataStartRowIndex) ? String(override.dataStartRowIndex + 1) : '';
    }

    renderImporterRowPreview();
  }

  function renderImporterRowPreview() {
    if (!importerRowPreview) return;
    const state = importerEditorState;
    const rows = Array.isArray(state.rawRows) ? state.rawRows : [];
    const override = state.headerOverride || {};
    const total = rows.length;
    const shown = Math.min(total, IMPORTER_ROW_PREVIEW_MAX_ROWS);

    let html = '';
    for (let i = 0; i < shown; i++) {
      let cls = 'importer-row-preview-row';
      if (i === override.headerRowIndex) cls += ' is-header-row';
      else if (i === override.unitsRowIndex) cls += ' is-units-row';
      else if (i === override.dataStartRowIndex) cls += ' is-data-row';
      html += `<div class="${cls}" role="listitem"><span class="importer-row-preview-num">${i + 1}</span><span class="importer-row-preview-text">${escapeHtml(formatImporterPreviewRow(rows[i]))}</span></div>`;
    }
    if (total > shown) {
      const remaining = total - shown;
      html += `<div class="importer-row-preview-more">&hellip;${remaining} more row${remaining === 1 ? '' : 's'} not shown</div>`;
    }
    importerRowPreview.innerHTML = html;
  }

  // Returns a user-facing error message if the current manual header-override fields are
  // invalid, or '' if they're fine (or manual mode isn't active). Row numbers here are
  // 1-based (as shown in the UI); headerOverride itself stores 0-based indices.
  function getImporterHeaderOverrideError() {
    const state = importerEditorState;
    const override = state.headerOverride;
    if (!state.headerOverrideSupported || !override || !override.enabled) return '';

    const rowCount = Array.isArray(state.rawRows) ? state.rawRows.length : 0;
    const header = override.headerRowIndex;
    const units = override.unitsRowIndex;
    const dataStart = override.dataStartRowIndex;

    if (!Number.isInteger(header) || header < 0 || header >= rowCount) {
      return `Header row must be between 1 and ${rowCount}.`;
    }
    if (!Number.isInteger(dataStart) || dataStart <= header || dataStart > rowCount) {
      return `First data row must be after the header row (${header + 1}) and no more than ${rowCount}.`;
    }
    if (units != null && (!Number.isInteger(units) || units <= header || units >= dataStart)) {
      return `Units row must be between the header row (${header + 1}) and the first data row (${dataStart + 1}).`;
    }
    return '';
  }

  function renderImporterEditorRows() {
    if (!importerEditorRows) return;
    const log = logs.find((entry) => entry.id === importerEditorState.logId);
    const baseCols = Array.isArray(log && log.meta && log.meta.baseCols)
      ? log.meta.baseCols.slice()
      : (Array.isArray(log && log.cols) ? log.cols.slice() : []);

    const colOptions = ['<option value="">(none)</option>']
      .concat(baseCols.map((col) => `<option value="${escapeHtml(col)}">${escapeHtml(col)}</option>`));

    const rowsHtml = getImporterStandardChannels().map((standardDef) => {
      const standard = standardDef.displayName;
      const selectedSource = importerEditorState.channels[standard] || '';
      const filter = importerEditorState.filters[standard] || { enabled: false, axis: 'time', window: 0.5 };
      const filterEnabled = !!filter.enabled;
      const filterAxis = IMPORTER_FILTER_AXES.includes(filter.axis) ? filter.axis : 'time';
      const filterWindow = Number.isFinite(Number(filter.window)) ? Number(filter.window) : 0.5;
      const unitSuffix = standardDef.unit ? ` [${standardDef.unit}]` : '';
      return ''
        + '<tr>'
        + `<td>${escapeHtml(standard)}${escapeHtml(unitSuffix)}</td>`
        + `<td><select data-importer-channel="${escapeHtml(standard)}">${colOptions.join('')}</select></td>`
        + `<td><label><input type="checkbox" data-importer-filter-enabled="${escapeHtml(standard)}"${filterEnabled ? ' checked' : ''} /> On</label></td>`
        + `<td><select data-importer-filter-axis="${escapeHtml(standard)}"${filterEnabled ? '' : ' disabled'}><option value="time"${filterAxis === 'time' ? ' selected' : ''}>Time</option><option value="distance"${filterAxis === 'distance' ? ' selected' : ''}>Distance</option></select></td>`
        + `<td><input type="number" min="0.01" step="0.1" data-importer-filter-window="${escapeHtml(standard)}" value="${Number(filterWindow).toFixed(2)}"${filterEnabled ? '' : ' disabled'} /></td>`
        + '</tr>';
    }).join('');

    importerEditorRows.querySelectorAll('select[data-importer-channel]').forEach(detachSearchablePanel);
    importerEditorRows.innerHTML = rowsHtml;
    const channelSelects = importerEditorRows.querySelectorAll('select[data-importer-channel]');
    channelSelects.forEach((select) => {
      const standard = select.getAttribute('data-importer-channel');
      if (!standard) return;
      select.value = importerEditorState.channels[standard] || '';
      enhanceSelectWithSearch(select);
    });
  }

  function renderImporterCustomStandardList() {
    if (!importerCustomStandardList) return;
    if (!Array.isArray(customStandardChannels) || customStandardChannels.length === 0) {
      importerCustomStandardList.innerHTML = '<div class="importer-custom-standard-empty">No custom standard channels yet.</div>';
      return;
    }

    importerCustomStandardList.innerHTML = customStandardChannels.map((entry) => {
      const unitLabel = entry.unit ? ` [${entry.unit}]` : '';
      return ''
        + '<div class="importer-custom-standard-item">'
        + `<span>${escapeHtml(entry.displayName)}${escapeHtml(unitLabel)}</span>`
        + `<button type="button" data-importer-custom-remove="${escapeHtml(entry.displayName)}" aria-label="Remove ${escapeHtml(entry.displayName)}">Remove</button>`
        + '</div>';
    }).join('');
  }

  function addUserDefinedStandardChannel(displayName, unit) {
    const normalizedName = String(displayName == null ? '' : displayName).trim();
    const normalizedUnit = String(unit == null ? '' : unit).trim();
    if (!normalizedName) return { ok: false, message: 'Enter a standard channel name.' };

    const alreadyExists = getImporterStandardChannels().some((entry) => (
      entry.displayName.toLowerCase() === normalizedName.toLowerCase()
    ));
    if (alreadyExists) return { ok: false, message: 'That standard channel already exists.' };

    customStandardChannels.push({ displayName: normalizedName, unit: normalizedUnit, isUserDefined: true });
    customStandardChannels = normalizeCustomStandardChannelsConfig(customStandardChannels);
    saveCustomStandardChannels();
    renderImporterCustomStandardList();
    renderImporterEditorRows();
    return { ok: true };
  }

  function removeUserDefinedStandardChannel(displayName) {
    const key = String(displayName == null ? '' : displayName).trim().toLowerCase();
    if (!key) return;
    const before = customStandardChannels.length;
    customStandardChannels = customStandardChannels.filter((entry) => entry.displayName.toLowerCase() !== key);
    if (customStandardChannels.length === before) return;

    if (importerEditorState.channels && typeof importerEditorState.channels === 'object') {
      Object.keys(importerEditorState.channels).forEach((name) => {
        if (name.toLowerCase() === key) delete importerEditorState.channels[name];
      });
    }
    if (importerEditorState.filters && typeof importerEditorState.filters === 'object') {
      Object.keys(importerEditorState.filters).forEach((name) => {
        if (name.toLowerCase() === key) delete importerEditorState.filters[name];
      });
    }

    saveCustomStandardChannels();
    renderImporterCustomStandardList();
    renderImporterEditorRows();
  }

  function openImporterEditor(logId) {
    const log = logs.find((entry) => entry.id === logId);
    if (!log) return;
    const decoderName = resolveDecoderName(log.meta) || ((log.meta && log.meta.source) ? log.meta.source : 'Generic');
    importerEditorState = buildDefaultImporterEditorState(log, decoderName);
    setImporterEditorError('');
    if (importerEditorSubtitle) {
      importerEditorSubtitle.textContent = `${log.name} · ${decoderName}`;
    }
    renderImporterCustomStandardList();
    if (importerCustomStandardNameInput) importerCustomStandardNameInput.value = '';
    if (importerCustomStandardUnitInput) importerCustomStandardUnitInput.value = '';
    if (importerEditorDownsampleHzInput) {
      importerEditorDownsampleHzInput.value = Number.isFinite(importerEditorState.downsampleHz)
        ? importerEditorState.downsampleHz.toFixed(2)
        : '';
    }
    updateImporterEditorFrequencyInfo();
    renderImporterEditorRows();
    renderImporterHeaderOverride();
    if (importerEditorModal) importerEditorModal.hidden = false;
  }

  function closeImporterEditor() {
    importerEditorState = {
      isOpen: false,
      logId: null,
      decoderName: '',
      dataFrequencyHz: null,
      downsampleHz: null,
      channels: {},
      filters: {},
      rawRows: null,
      headerOverrideSupported: false,
      headerOverride: null
    };
    if (importerEditorModal) importerEditorModal.hidden = true;
    setImporterEditorError('');
  }

  function applyCustomImporterConfigToProcessed(processed, decoderName, customImporterConfig) {
    const config = normalizeCustomImporterConfig(customImporterConfig);
    if (!config || config.decoder !== decoderName) return;
    if (!processed || !Array.isArray(processed.data) || !Array.isArray(processed.cols) || !processed.meta) return;

    const units = (processed.units && typeof processed.units === 'object') ? processed.units : {};
    const resolveAxisValues = (axis) => {
      if (axis === 'distance') {
        const col = processed.meta && processed.meta.distCol;
        if (col && processed.cols.includes(col)) {
          return processed.data.map((row) => {
            const v = Number(row[col]);
            return Number.isFinite(v) ? v : null;
          });
        }
        return Array.isArray(processed.meta._dist) ? processed.meta._dist : null;
      }
      const col = processed.meta && processed.meta.timeCol;
      if (col && processed.cols.includes(col)) {
        const unit = (processed.meta && processed.meta.units && processed.meta.units[col]) || (processed.units && processed.units[col]) || '';
        return processed.data.map((row) => {
          const v = parseTimeLikeSeconds(row[col], unit);
          return Number.isFinite(v) ? v : null;
        });
      }
      return Array.isArray(processed.meta._time) ? processed.meta._time : null;
    };

    getImporterStandardChannels().forEach((standardDef) => {
      const standard = standardDef.displayName;
      const sourceCol = config.channels[standard];
      if (!sourceCol || !processed.cols.includes(sourceCol)) return;

      const targetCol = getCustomImporterTargetColumn(standard, decoderName);
      if (!targetCol) return;
      const filter = config.filters && config.filters[standard] ? config.filters[standard] : null;

      if (filter && filter.enabled && Number.isFinite(Number(filter.window)) && Number(filter.window) > 0) {
        const axisValues = resolveAxisValues(filter.axis) || resolveAxisValues('time');
        const sourceVals = processed.data.map((row) => {
          const v = Number(row[sourceCol]);
          return Number.isFinite(v) ? v : null;
        });
        const smoothed = computeWindowedAverage(sourceVals, axisValues, Number(filter.window));
        processed.data.forEach((row, i) => {
          const smoothVal = smoothed[i];
          row[targetCol] = smoothVal !== null && Number.isFinite(smoothVal) ? smoothVal : row[sourceCol];
        });
      } else {
        processed.data.forEach((row) => { row[targetCol] = row[sourceCol]; });
      }

      if (!processed.cols.includes(targetCol)) processed.cols.push(targetCol);

      if (standardDef.unit) {
        if (standard !== 'Time' || !units[sourceCol]) units[targetCol] = standardDef.unit;
      } else if (!units[targetCol] && units[sourceCol]) {
        units[targetCol] = units[sourceCol];
      }

      if (standard === 'Time') {
        processed.meta.timeCol = targetCol;
        const timeUnit = units[targetCol] || units[sourceCol] || '';
        processed.meta._time = processed.data.map((row) => {
          const n = parseTimeLikeSeconds(row[targetCol], timeUnit);
          return Number.isFinite(n) ? n : null;
        });
      } else if (standard === 'Distance') {
        processed.meta.distCol = targetCol;
        processed.meta._dist = processed.data.map((row) => {
          const n = Number(row[targetCol]);
          return Number.isFinite(n) ? n : null;
        });
      } else if (standard === 'Latitude') {
        processed.meta.latCol = targetCol;
      } else if (standard === 'Longitude') {
        processed.meta.lonCol = targetCol;
      }
    });

    if (Number.isFinite(config.downsampleHz) && config.downsampleHz > 0) {
      resampleProcessedByFrequency(processed, config.downsampleHz);
    }
    processed.meta.importDownsampleHz = Number.isFinite(config.downsampleHz) && config.downsampleHz > 0
      ? config.downsampleHz
      : null;

    processed.units = units;
    if (!processed.meta.units || typeof processed.meta.units !== 'object') processed.meta.units = {};
    Object.keys(units).forEach((k) => { processed.meta.units[k] = units[k]; });
  }

  function buildLogRecord(id, name, processed, rawRows, forcedDecoderName = '', customImporterConfig = null) {
    const data = processed.data;
    const cols = [...processed.cols];
    const units = processed.units && typeof processed.units === 'object' ? processed.units : {};
    const meta = processed.meta || {};
    meta.units = meta.units && typeof meta.units === 'object' ? meta.units : units;

    const decoderName = resolveDecoderName(meta, forcedDecoderName);
    if (decoderName) {
      meta.decoder = decoderName;
      // Use the selected decoder as source so mapped channel names resolve correctly.
      meta.source = decoderName;
    }

    meta.baseCols = cols.slice();

    const normalizedCustomImporter = normalizeCustomImporterConfig(customImporterConfig);
    if (normalizedCustomImporter && normalizedCustomImporter.decoder === decoderName) {
      applyCustomImporterConfigToProcessed({ data, cols, units, meta }, decoderName, normalizedCustomImporter);
      meta.customImporter = normalizedCustomImporter;
    } else {
      delete meta.customImporter;
    }

    const defaultImportResampleHz = decoderName === 'Garmin TCX' ? 10 : null;
    const configuredImportResampleHz = normalizedCustomImporter && Number.isFinite(Number(normalizedCustomImporter.downsampleHz)) && Number(normalizedCustomImporter.downsampleHz) > 0
      ? Number(normalizedCustomImporter.downsampleHz)
      : null;
    const importResampleHz = configuredImportResampleHz || defaultImportResampleHz;
    if (Number.isFinite(importResampleHz) && importResampleHz > 0) {
      resampleProcessedByFrequency({ data, cols, units, meta }, importResampleHz);
      meta.importDownsampleHz = importResampleHz;
    }

    const lapNum = (Array.isArray(meta.lapNum) && meta.lapNum.length === data.length)
      ? meta.lapNum
      : data.map(() => 1);

    const recomputeLapTimeFromTimeCol = () => {
      const timeCol = meta.timeCol;
      if (!timeCol || !cols.includes(timeCol)) return null;
      const timeUnit = meta.units && meta.units[timeCol] ? meta.units[timeCol] : '';
      if (!Array.isArray(lapNum) || lapNum.length !== data.length) return null;
      const firstTimeByLap = new Map();
      const computed = new Array(data.length).fill(null);
      for (let i = 0; i < data.length; i++) {
        const lap = lapNum[i];
        const raw = parseTimeLikeSeconds(data[i] && data[i][timeCol], timeUnit);
        if (!Number.isFinite(raw)) continue;
        if (!firstTimeByLap.has(lap)) firstTimeByLap.set(lap, raw);
        let lapT = raw - firstTimeByLap.get(lap);
        if (!Number.isFinite(lapT) || lapT < 0) {
          firstTimeByLap.set(lap, raw);
          lapT = 0;
        }
        computed[i] = lapT;
      }
      const hasAnyFinite = computed.some((v) => Number.isFinite(v));
      return hasAnyFinite ? computed : null;
    };

    const recomputedLapTime = recomputeLapTimeFromTimeCol();
    const lapTime = (Array.isArray(recomputedLapTime) && recomputedLapTime.length === data.length)
      ? recomputedLapTime
      : ((Array.isArray(meta.lapTime) && meta.lapTime.length === data.length)
        ? meta.lapTime
        : data.map((_, i) => i));

    meta.lapNum = lapNum;
    meta.lapTime = lapTime;

    deriveAndExposeMapXY(data, cols, meta);
    addGpsDerivedDynamicsChannels(data, cols, meta);
    addCalculatedCommonChannels(data, cols, meta);
    addCurvatureChannel(data, cols, meta);
    applyAllMathChannelsToLog({ data, cols, meta });

    // expose lap columns in data rows and cols list
    if (!cols.includes('Lap Time')) cols.push('Lap Time');
    if (!cols.includes('Lap Number')) cols.push('Lap Number');
    data.forEach((r, i) => { r['Lap Time'] = lapTime[i]; r['Lap Number'] = lapNum[i]; });

    // record units for new columns
    meta.units['Lap Time'] = 's';
    meta.units['Lap Number'] = '';

    return { id, name, data, cols, meta, rawRows };
  }

  function setDecoderError(fileItem, message) {
    if (!fileItem) return;
    let errorEl = fileItem.querySelector('.file-decoder-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'file-decoder-error';
      errorEl.style.color = 'var(--danger-text)';
      errorEl.style.fontSize = '0.8em';
      errorEl.style.marginTop = '4px';
      fileItem.appendChild(errorEl);
    }
    const text = String(message || '').trim();
    errorEl.textContent = text;
    errorEl.hidden = !text;
  }

  // Pulls the plain [][] rows array out of a log's rawRows (which can be a bare array
  // for older records, or {kind:'csvRows', rows:[...]} for newer ones), or null when
  // this log's raw input isn't row-shaped (XML-based formats).
  function getCsvRawRowsForLog(log) {
    const rawInput = log && log.rawRows;
    if (Array.isArray(rawInput)) return rawInput;
    if (rawInput && rawInput.kind === 'csvRows' && Array.isArray(rawInput.rows)) return rawInput.rows;
    return null;
  }

  function reprocessLogWithDecoder(logId, decoderName, customImporterConfig = null) {
    const logIdx = logs.findIndex(l => l.id === logId);
    if (logIdx < 0) return false;

    const log = logs[logIdx];
    const LP = window.LogFileProcessors;
    if (!LP) {
      console.error('Decoder reprocess unavailable for log:', log && log.name ? log.name : logId);
      return false;
    }

    let processed, builtRecord;
    try {
      const rawInput = log.rawRows;
      const rawRows = getCsvRawRowsForLog(log);

      if (rawRows) {
        if (typeof LP.processCsvRowsWithDecoder !== 'function') {
          console.error('CSV decoder reprocess unavailable for log:', log.name);
          return false;
        }
        const manualHeader = (customImporterConfig && Number.isInteger(customImporterConfig.headerRowIndex)
          && Number.isInteger(customImporterConfig.dataStartRowIndex))
          ? {
              headerRowIndex: customImporterConfig.headerRowIndex,
              unitsRowIndex: customImporterConfig.unitsRowIndex,
              dataStartRowIndex: customImporterConfig.dataStartRowIndex
            }
          : null;
        processed = LP.processCsvRowsWithDecoder(rawRows, decoderName, { manualHeader });
      } else if (rawInput && rawInput.kind === 'tcxXml' && typeof LP.parseGarminTcxXml === 'function') {
        processed = LP.parseGarminTcxXml(rawInput.text || '');
      } else if (rawInput && rawInput.kind === 'resXml' && typeof LP.processVIGradeResXml === 'function') {
        processed = LP.processVIGradeResXml(rawInput.text || '');
      } else {
        console.error('Decoder reprocess unavailable for log:', log.name);
        return false;
      }

      if (!processed || !Array.isArray(processed.data) || !Array.isArray(processed.cols)) {
        console.error('Decoder reprocess returned invalid data for log:', log.name, 'decoder:', decoderName);
        return false;
      }
      builtRecord = buildLogRecord(log.id, log.name, processed, log.rawRows, decoderName, customImporterConfig);
    } catch (err) {
      console.error('Decoder reprocess threw an error for log:', log.name, 'decoder:', decoderName, err);
      return false;
    }

    // Decoding succeeded once we reach here. logs[logIdx] is only reassigned now, so a
    // failure past this point is a rendering-pipeline problem, not a decode failure -- it
    // shouldn't be reported as "could not reprocess" or cause handleDecoderSelectionChange
    // to revert the dropdown back to the previous decoder while the underlying log data has
    // in fact already switched to the new one.
    logs[logIdx] = builtRecord;
    try {
      populateYSelect();
      populateXCustomSelect();
      populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
      renderLapsList();
      updatePlot();
    } catch (err) {
      console.error('Rendering failed after reprocessing log with decoder:', log.name, 'decoder:', decoderName, err);
    }
    return true;
  }

  function handleDecoderSelectionChange(selectEl, fileId, decoderName) {
    if (!selectEl || !fileId || !decoderName) return;
    const fileItem = selectEl.closest('.file-item');
    const log = logs.find((entry) => entry.id === fileId);
    const previousDecoder = resolveDecoderName(log && log.meta) || '';
    const customImporterConfig = getCustomImporterConfigForLog(log, decoderName);

    setDecoderError(fileItem, '');
    const ok = reprocessLogWithDecoder(fileId, decoderName, customImporterConfig);
    if (ok) {
      setDecoderError(fileItem, '');
      return;
    }

    // Revert UI selection when decode fails so the dropdown reflects active data.
    if (previousDecoder) {
      selectEl.value = previousDecoder;
    }
    setDecoderError(fileItem, 'Could not reprocess this CSV with the selected decoder. See console for details.');
  }

  // Shared tail end of file ingestion: wraps a processed {data,cols,units,meta} result into
  // a log record and wires it into the UI. rawInput is either:
  //   { kind:'csvRows', rows:[...] } for delimited files
  //   { kind:'resXml', text:'...' } for VIGrade RES XML
  //   { kind:'tcxXml', text:'...' } for Garmin TCX XML
  // or null for synthetic/runtime-generated logs.
  function addProcessedLog(file, processed, rawInput) {
    if (!processed || !Array.isArray(processed.data) || !Array.isArray(processed.cols)) {
      console.error('Failed to process file:', file.name);
      return;
    }

    const id = idForName(file.name);
    const newLog = buildLogRecord(id, file.name, processed, rawInput);
    const savedStartFinishLine = getStartFinishLineForLog(newLog);
    if (savedStartFinishLine) {
      applyStartFinishLineToLog(newLog, { p1: savedStartFinishLine.p1, p2: savedStartFinishLine.p2 });
    }
    logs.push(newLog);
    renderFilesList();
    populateYSelect();
    populateXCustomSelect();
    populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
    renderLapsList();
    updatePlot();
    // Any simulated channels saved for this file are restored once its importer config (which
    // can rebuild the rows) has been applied.
    applySavedImporterConfigToLog(file.name, newLog.id).then(() => applyLinkedSimChannels(newLog.id));
    // Re-checks for graph-pinned notes belonging to this (or any) newly-loaded file,
    // rather than relying solely on the one-time startup call -- if that first call
    // ever missed for any reason (a slow/cold IndexedDB open, say), a note's marker
    // could otherwise stay missing for the rest of the page's life with no other
    // trigger to retry it. Cheap (a couple of IndexedDB reads) and safe to call
    // whenever a file shows up, which is exactly when a marker becomes relevant.
    if (typeof refreshNoteMarkerCaches === 'function') refreshNoteMarkerCaches();
  }

  // If this file has a custom importer config (channel mapping, filters, downsample rate)
  // persisted alongside it in IndexedDB from a previous session, reapply it automatically
  // so reloading a stored file doesn't require redoing the mapping every time.
  function applySavedImporterConfigToLog(fileName, logId) {
    return getFileEntryByName(fileName).then((entry) => {
      const saved = entry && entry.importerConfig;
      if (!saved || !saved.decoder) return;
      if (reprocessLogWithDecoder(logId, saved.decoder, saved)) renderFilesList();
    }).catch(() => {});
  }

  function parseFile(file, skipStore = false) {
    const processors = window.LogFileProcessors;

    // Shared helper: store a file in IndexedDB after computing hash and checking for
    // duplicate content (same hash as an existing entry with a different name).
    function storeWithHashCheck(name, text, extraMeta) {
      const hash = computeFileHash(text);
      const fileMeta = Object.assign(extractCsvFileMetadata(text), extraMeta || {});
      findDuplicateByHash(hash).then((dup) => {
        if (dup && dup.name !== name) {
          setStoredFilesStatus(
            `"${name}" appears identical to the already-stored "${dup.name}" (same content hash). Both have been stored.`
          );
        }
        storeFileInDB(name, text, hash, fileMeta);
      });
    }

    // Garmin TCX files are XML activity exports with explicit Lap/Trackpoint nodes.
    if (/\.tcx$/i.test(file.name || '')) {
      if (typeof file.text !== 'function' || !processors || typeof processors.parseGarminTcxXml !== 'function') {
        console.error('Missing LogFileProcessors.parseGarminTcxXml; cannot parse file:', file.name);
        return;
      }
      file.text().then((text) => {
        const processed = processors.parseGarminTcxXml(text);
        addProcessedLog(file, processed, { kind: 'tcxXml', text });
        if (!skipStore) storeWithHashCheck(file.name, text);
      }, () => {
        console.error('Failed to read .tcx file:', file.name);
      });
      return;
    }

    // VIGrade .res files are XML (VI-CarRealTime/xrf schema) simulation results, not
    // delimited text -- they need their own reader instead of PapaParse tokenization.
    if (/\.res$/i.test(file.name || '')) {
      if (typeof file.text !== 'function' || !processors || typeof processors.processVIGradeResXml !== 'function') {
        console.error('Missing LogFileProcessors.processVIGradeResXml; cannot parse file:', file.name);
        return;
      }
      file.text().then((text) => {
        const processed = processors.processVIGradeResXml(text);
        addProcessedLog(file, processed, { kind: 'resXml', text });
        if (!skipStore) storeWithHashCheck(file.name, text);
      }, () => {
        console.error('Failed to read .res file:', file.name);
      });
      return;
    }

    // Set by whichever branch below actually runs, before `complete` fires -- lets
    // processCsvRows() know whether this file was tab-delimited (see isTsvFormat in
    // file-processors.js) without re-sniffing already-tokenized rows itself.
    let detectedDelimiter = 'auto';
    const parseConfig = {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        if (!window.LogFileProcessors || typeof window.LogFileProcessors.processCsvRows !== 'function') {
          console.error('Missing LogFileProcessors.processCsvRows; cannot parse file:', file.name);
          return;
        }

        const processed = window.LogFileProcessors.processCsvRows(rows, { delimiter: detectedDelimiter });
        addProcessedLog(file, processed, { kind: 'csvRows', rows });
      }
    };

    // PapaParse's own delimiter guessing covers comma/semicolon/pipe already, but
    // content-sniffing a short or metadata-heavy tab file can be less reliable than
    // just checking for tab characters directly, so that case is sniffed up front.
    // Falls back to handing PapaParse the raw File directly (its normal auto-detect) if
    // the browser lacks file.text() or the processors module isn't loaded yet.
    const forceTsv = /\.dat$/i.test(file.name || '');
    if (typeof file.text === 'function' && processors && typeof processors.detectFieldDelimiter === 'function') {
      // Two-argument .then(onFulfilled, onRejected) rather than .then(onFulfilled).catch(...):
      // onFulfilled below runs Papa.parse synchronously, whose `complete` callback drives all
      // downstream rendering (buildLogRecord, updatePlot, etc.). With .catch() chained after,
      // any exception thrown anywhere in that rendering chain -- not just a failed file.text()
      // read -- would be swallowed and misread as "reading failed", triggering the raw-File
      // fallback below and silently re-parsing (and re-adding) the same file a second time.
      // The two-argument form only invokes onRejected for a genuine file.text() rejection.
      file.text().then((text) => {
        // .dat logs are treated as tab-delimited outright rather than sniffed -- they're
        // never a comma CSV in practice, and content-sniffing a short or metadata-heavy
        // file can be less reliable than just knowing from the extension.
        if (!skipStore) storeWithHashCheck(file.name, text);
        const delimiter = forceTsv ? 'tab' : processors.detectFieldDelimiter(text);
        detectedDelimiter = delimiter;
        if (delimiter === 'tab') {
          Papa.parse(text, Object.assign({}, parseConfig, { delimiter: '\t' }));
        } else {
          Papa.parse(text, parseConfig);
        }
      }, () => {
        Papa.parse(file, parseConfig);
      });
    } else {
      Papa.parse(file, parseConfig);
    }
  }

  // Sessions row. Attaching is entirely opt-in: plotting a CSV never creates or
  // requires a session, this button just lets the user file it against one later.
  // Shared between a synthetic log's minimal row and a real file's fuller row.
  function appendSessionRow(el, log) {
    if (!(sessionsApi && window.SessionsUI)) return;
    const sessionRow = document.createElement('div');
    sessionRow.className = 'file-session-row';

    const addToSessionBtn = document.createElement('button');
    addToSessionBtn.type = 'button';
    addToSessionBtn.className = 'file-add-to-session-btn';
    addToSessionBtn.textContent = 'Add to Session';
    addToSessionBtn.title = `Attach ${log.name} to a session`;
    addToSessionBtn.addEventListener('click', () => {
      // A synthetic log (e.g. a simulated racing line) was never "uploaded", so it has
      // to be persisted as a stored file first -- a real log already was, back at load
      // time -- otherwise openAddToSession can't find it by name to attach.
      const ready = (log.meta && log.meta.synthetic)
        ? persistSyntheticLogForSession(log)
        : Promise.resolve();
      ready.then(() => window.SessionsUI.openAddToSession([{ name: log.name }]));
    });
    sessionRow.appendChild(addToSessionBtn);

    // Shows which sessions this file already belongs to, so the row reflects state
    // rather than just offering an action.
    const sessionBadges = document.createElement('span');
    sessionBadges.className = 'file-session-badges';
    sessionRow.appendChild(sessionBadges);
    renderFileSessionBadges(log.name, sessionBadges);

    el.appendChild(sessionRow);
  }

  function renderFilesList() {
    filesList.innerHTML = '';
    logs.forEach((log, fileIdx) => {
      const el = document.createElement('div');
      el.className = 'file-item';
      el.dataset.id = log.id;
      const dash = getLineDashForFileIndex(fileIdx);
      const dashArray = getSvgDashArray(dash);
      const label = document.createElement('label');
      label.className = 'file-toggle';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.id = log.id;
      checkbox.checked = true;
      const nameWrap = document.createElement('span');
      nameWrap.className = 'file-name-wrap';
      const name = document.createElement('strong');
      name.textContent = log.name;
      const linePreview = document.createElement('span');
      linePreview.className = 'file-line-preview';
      linePreview.title = `Line type: ${dash}`;
      linePreview.innerHTML = `<svg viewBox="0 0 44 8" aria-hidden="true" focusable="false"><line x1="1" y1="4" x2="43" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"${dashArray ? ` stroke-dasharray="${dashArray}"` : ''}></line></svg>`;
      nameWrap.appendChild(name);
      nameWrap.appendChild(linePreview);
      if (log.meta && log.meta.importUpsampled) {
        const upsampleBadge = document.createElement('span');
        upsampleBadge.className = 'file-upsampled-indicator';
        upsampleBadge.textContent = '⚠ 10 Hz';
        upsampleBadge.title = 'Upsampled to 10 Hz with B-splines';
        nameWrap.appendChild(upsampleBadge);
      }
      label.appendChild(checkbox);
      label.appendChild(nameWrap);

      if (log.meta && log.meta.synthetic) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.setAttribute('data-remove', log.id);
        removeBtn.className = 'file-synthetic-remove-btn';
        el.appendChild(label);
        el.appendChild(removeBtn);
        appendSessionRow(el, log);
        filesList.appendChild(el);
        return;
      }

      const decoderName = resolveDecoderName(log.meta) || ((log.meta && log.meta.source) ? log.meta.source : 'Unknown');
      const decoderRow = document.createElement('div');
      decoderRow.className = 'file-decoder-row';

      const decoderSelector = document.createElement('div');
      decoderSelector.className = 'file-decoder-selector';
      decoderSelector.hidden = false;

      const availableDecoders = (window.LogFileProcessors && window.LogFileProcessors.AVAILABLE_DECODERS)
        ? window.LogFileProcessors.AVAILABLE_DECODERS
        : [];
      const decoderSelect = document.createElement('select');
      decoderSelect.className = 'file-decoder-select';
      decoderSelect.dataset.id = log.id;
      availableDecoders.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.name;
        opt.textContent = d.label;
        if (d.name === decoderName || d.label === decoderName) opt.selected = true;
        decoderSelect.appendChild(opt);
      });

      decoderSelector.appendChild(decoderSelect);
      const importerCustomizeBtn = document.createElement('button');
      importerCustomizeBtn.type = 'button';
      importerCustomizeBtn.className = 'file-decoder-edit file-importer-customize-btn';
      importerCustomizeBtn.setAttribute('data-importer-customize', log.id);
      importerCustomizeBtn.setAttribute('aria-label', `Customize importer mapping for ${log.name}`);
      importerCustomizeBtn.setAttribute('title', 'Customize importer mapping and pre-processing filters');
      importerCustomizeBtn.textContent = '✎';
      decoderSelector.appendChild(importerCustomizeBtn);

      const hasCustomImporter = !!getCustomImporterConfigForLog(log, decoderName);
      if (hasCustomImporter) {
        const customIndicator = document.createElement('span');
        customIndicator.className = 'file-decoder-custom-indicator';
        customIndicator.textContent = 'Custom importer';
        decoderSelector.appendChild(customIndicator);
      }
      decoderRow.appendChild(decoderSelector);

      el.appendChild(label);
      el.appendChild(decoderRow);

      const startFinishRow = document.createElement('div');
      startFinishRow.className = 'file-startfinish-row';

      const isEditingThis = startFinishEditLogId === log.id;
      const startFinishEditBtn = document.createElement('button');
      startFinishEditBtn.type = 'button';
      startFinishEditBtn.className = 'file-startfinish-edit-btn';
      startFinishEditBtn.dataset.startfinishEdit = log.id;
      startFinishEditBtn.textContent = isEditingThis ? 'Close' : 'Edit Start/Finish';
      if (isEditingThis) startFinishEditBtn.classList.add('is-active');
      startFinishRow.appendChild(startFinishEditBtn);

      const savedStartFinishLine = getStartFinishLineForLog(log);
      if (savedStartFinishLine && !isEditingThis) {
        const badge = document.createElement('span');
        badge.className = 'file-startfinish-badge';
        badge.textContent = 'Custom start/finish line';
        startFinishRow.appendChild(badge);

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'file-startfinish-clear-btn';
        clearBtn.dataset.startfinishClear = log.id;
        clearBtn.textContent = 'Clear Line';
        startFinishRow.appendChild(clearBtn);
      }

      el.appendChild(startFinishRow);

      appendSessionRow(el, log);

      if (isEditingThis) {
        const editorPanel = document.createElement('div');
        editorPanel.className = 'file-startfinish-editor';

        const status = document.createElement('div');
        status.className = 'file-startfinish-status';
        status.textContent = startFinishEditStatusMessage || (
          startFinishDrawPoints.length === 0
            ? 'Click a point on the map where the start/finish line begins.'
            : startFinishDrawPoints.length === 1
              ? 'Click the second point to complete the line.'
              : 'Drag either point on the map to adjust, then Apply.'
        );
        editorPanel.appendChild(status);

        const btnRow = document.createElement('div');
        btnRow.className = 'file-startfinish-editor-btns';

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'file-startfinish-apply-btn';
        applyBtn.dataset.startfinishApply = log.id;
        applyBtn.textContent = 'Apply';
        applyBtn.disabled = startFinishDrawPoints.length !== 2;
        btnRow.appendChild(applyBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'file-startfinish-cancel-btn';
        cancelBtn.dataset.startfinishCancel = log.id;
        cancelBtn.textContent = 'Cancel';
        btnRow.appendChild(cancelBtn);

        editorPanel.appendChild(btnRow);
        el.appendChild(editorPanel);
      }

      filesList.appendChild(el);
    });
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  // Computes a forward/backward windowed average for an array of values.
  // values: array of numeric values (NaN/null treated as missing)
  // axisValues: array of time or distance values (same length)
  // halfWindow: half-window size in axis units
  // Returns an array of smoothed values (same length as values).
  function computeWindowedAverage(values, axisValues, halfWindow) {
    const n = values.length;
    const result = new Array(n).fill(null);
    if (n === 0 || !(halfWindow > 0)) return result;

    // Check if axisValues is usable and monotonically increasing
    const hasAxis = Array.isArray(axisValues) && axisValues.length === n &&
      axisValues.some(v => Number.isFinite(v));
    let isMonotonic = true;
    if (hasAxis) {
      for (let i = 1; i < n; i++) {
        if (!Number.isFinite(axisValues[i - 1]) || !Number.isFinite(axisValues[i])) continue;
        if (axisValues[i] < axisValues[i - 1]) { isMonotonic = false; break; }
      }
    }

    for (let i = 0; i < n; i++) {
      const raw = values[i];
      if (raw === null || raw === undefined) { result[i] = null; continue; }
      const center = Number(raw);
      if (!Number.isFinite(center)) { result[i] = null; continue; }
      if (!hasAxis) { result[i] = center; continue; }
      const cx = axisValues[i];
      if (!Number.isFinite(cx)) { result[i] = center; continue; }

      let weightedSum = 0;
      let weightTotal = 0;

      const accumulate = (j) => {
        const rv = values[j];
        if (rv === null || rv === undefined) return false;
        const v = Number(rv);
        const xj = axisValues[j];
        if (!Number.isFinite(v) || !Number.isFinite(xj)) return false;
        const dt = Math.abs(xj - cx);
        if (dt > halfWindow) return true; // outside window — stop searching in this direction
        const w = 1 - (dt / halfWindow);
        if (w <= 0) return false;
        weightedSum += v * w;
        weightTotal += w;
        return false;
      };

      if (isMonotonic) {
        accumulate(i);
        for (let j = i - 1; j >= 0; j--) { if (accumulate(j)) break; }
        for (let j = i + 1; j < n; j++) { if (accumulate(j)) break; }
      } else {
        for (let j = 0; j < n; j++) accumulate(j);
      }

      result[i] = weightTotal > 0 ? (weightedSum / weightTotal) : center;
    }
    return result;
  }

  // 'time'/'distance' are special-cased to this log's own detected time/distance columns
  // (so the filter still works even if this log's real column isn't literally named that);
  // any other value is treated as a channel name and resolved the normal way. Falls back to
  // time if the chosen channel doesn't exist in this particular log (e.g. a math channel's
  // filter axis was set from a different file's channel list).
  function resolveSmoothingAxisColumn(axisChannel, log) {
    if (axisChannel === 'distance') return log.meta && log.meta.distCol;
    if (!axisChannel || axisChannel === 'time') return log.meta && log.meta.timeCol;
    const resolved = resolveChannelForLog(axisChannel, log);
    if (resolved && log.cols.includes(resolved)) return resolved;
    return log.meta && log.meta.timeCol;
  }

  function applyMathChannelToLog(mc, log) {
    const { name, expression, unit, smoothing } = mc;
    const refs = [];
    const safe = expression.replace(/\{([^}]+)\}/g, (_, chName) => {
      let idx = refs.indexOf(chName);
      if (idx < 0) { idx = refs.length; refs.push(chName); }
      return `__v${idx}__`;
    });
    let fn;
    try {
      fn = new Function(...refs.map((_, i) => `__v${i}__`), ...MATH_SCOPE_KEYS, `"use strict"; return (${safe});`);
    } catch { return; }
    // Resolve display names (e.g. "Speed") to the format-specific column name for this log
    const resolvedRefs = refs.map(ch => resolveChannelForLog(ch, log));

    // If smoothing is requested, pre-compute windowed averages for all referenced channels
    let smoothedArrays = null;
    if (smoothing && smoothing.window > 0) {
      const axisCol = resolveSmoothingAxisColumn(smoothing.axisChannel, log);
      const axisValues = axisCol ? log.data.map(row => Number(row[axisCol])) : null;
      const halfWindow = smoothing.window;
      smoothedArrays = resolvedRefs.map(col => {
        const vals = log.data.map(row => { const v = Number(row[col]); return Number.isFinite(v) ? v : NaN; });
        return computeWindowedAverage(vals, axisValues, halfWindow);
      });
    }

    if (!log.cols.includes(name)) log.cols.push(name);
    log.data.forEach((row, rowIdx) => {
      let vals;
      if (smoothedArrays) {
        vals = smoothedArrays.map((arr, i) => {
          const v = arr[rowIdx];
          return (v !== null && Number.isFinite(v)) ? v : NaN;
        });
      } else {
        vals = resolvedRefs.map(col => { const v = Number(row[col]); return Number.isFinite(v) ? v : NaN; });
      }
      try {
        const result = fn(...vals, ...MATH_SCOPE_VALS);
        row[name] = Number.isFinite(result) ? result : null;
      } catch { row[name] = null; }
    });
    if (!log.meta.units) log.meta.units = {};
    log.meta.units[name] = unit || '';
  }

  function applyAllMathChannelsToLog(log) {
    mathChannels.forEach(mc => applyMathChannelToLog(mc, log));
  }

  // --- Quick Modify helpers ---

  function hasQuickModActive() {
    return quickModState.negate || quickModState.reciprocal || quickModState.filter;
  }

  // Build the math expression (algebraic part) for the current quick mod state.
  function buildQuickModExpression(channel) {
    const ref = `{${channel}}`;
    if (quickModState.negate && quickModState.reciprocal) return `-1 / ${ref}`;
    if (quickModState.negate) return `${ref} * -1`;
    if (quickModState.reciprocal) return `1 / ${ref}`;
    return ref;
  }

  // Build a smoothing descriptor from the current quick mod state (or null).
  function buildQuickModSmoothing() {
    if (!quickModState.filter) return null;
    const w = parseFloat(quickModFilterWindow ? quickModFilterWindow.value : quickModState.filterWindow);
    const axisChannel = quickModFilterAxis ? quickModFilterAxis.value : quickModState.filterAxis;
    const halfWindow = Number.isFinite(w) && w > 0 ? w : 0.5;
    return { window: halfWindow, axisChannel: axisChannel || 'time' };
  }

  function resetQuickModToggles() {
    quickModState.negate = false;
    quickModState.reciprocal = false;
    quickModState.filter = false;
    quickModOriginalVisible = true;
    if (quickModNegate) quickModNegate.checked = false;
    if (quickModReciprocal) quickModReciprocal.checked = false;
    if (quickModFilter) quickModFilter.checked = false;
    if (quickModFilterControls) quickModFilterControls.hidden = true;
    if (quickModCreateBtn) quickModCreateBtn.disabled = true;
  }

  function clearQuickModSelectionState() {
    const oldPreviewName = quickModPreviewName;
    removeQuickModPreviewFromLogs();
    quickModState.channel = null;
    quickModEditorOpen = false;
    resetQuickModToggles();
    if (oldPreviewName && ySelect) {
      const selections = new Set(Array.from(ySelect.selectedOptions).map(o => o.value));
      selections.delete(oldPreviewName);
      populateYSelectWithSelections(selections);
    }
  }

  function shouldHideOriginalQuickModChannel(channel, selectedChannels) {
    if (!channel || channel !== quickModState.channel) return false;
    if (quickModOriginalVisible) return false;
    if (!quickModPreviewName || !hasQuickModActive()) return false;
    return Array.isArray(selectedChannels) && selectedChannels.includes(quickModPreviewName);
  }

  // Remove the current quick mod preview channel from all logs.
  function removeQuickModPreviewFromLogs() {
    if (!quickModPreviewName) return;
    const name = quickModPreviewName;
    logs.forEach(log => {
      const ci = log.cols.indexOf(name);
      if (ci >= 0) log.cols.splice(ci, 1);
      log.data.forEach(row => { delete row[name]; });
      if (log.meta && log.meta.units) delete log.meta.units[name];
    });
    quickModPreviewName = null;
  }

  // Apply the current quick mod state as a preview channel to all logs.
  function applyQuickModPreviewToLogs() {
    const channel = quickModState.channel;
    if (!channel || !hasQuickModActive()) return;
    const previewName = QUICK_MOD_PREVIEW_PREFIX + channel;
    const mc = {
      name: previewName,
      expression: buildQuickModExpression(channel),
      unit: getUnitForChannel(channel),
      smoothing: buildQuickModSmoothing()
    };
    logs.forEach(log => applyMathChannelToLog(mc, log));
    quickModPreviewName = previewName;
  }

  // Refresh the quick mod preview: remove old, apply new, update Y selection, replot.
  function updateQuickModPreview() {
    const oldPreviewName = quickModPreviewName;
    removeQuickModPreviewFromLogs();

    if (quickModState.channel && hasQuickModActive()) {
      applyQuickModPreviewToLogs();
    } else {
      quickModOriginalVisible = true;
    }

    // Repopulate Y select; preserve existing selections and manage preview channel
    const currentSelections = new Set(Array.from(ySelect.selectedOptions).map(o => o.value));
    // Remove old preview from selection set
    if (oldPreviewName) currentSelections.delete(oldPreviewName);
    // Add new preview to selection set
    if (quickModPreviewName) currentSelections.add(quickModPreviewName);

    populateYSelectWithSelections(currentSelections);
    renderSelectedChannelColorControls();
    updatePlot();
  }


  // Builds the full, unfiltered list of {value, label} entries available for Y Channels
  // (mapped display names first, then uncovered raw columns sorted) -- shared by
  // populateYSelect and populateYSelectWithSelections so the two stay in sync.
  function buildYSelectOptionEntries() {
    const numericCols = new Set();
    logs.forEach(l => {
      l.cols.forEach(col => {
        const sample = l.data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '');
        if (sample) {
          const val = sample[col];
          if (typeof val === 'number') numericCols.add(col);
          else if (!isNaN(Number(val))) numericCols.add(col);
        }
      });
    });

    const coveredRawCols = new Set();
    const activeMappings = [];
    getChannelMap().forEach(mapping => {
      let hasMatch = false;
      logs.forEach(log => {
        const col = resolveChannelForLog(mapping.displayName, log);
        if (col && numericCols.has(col)) { coveredRawCols.add(col); hasMatch = true; }
      });
      if (hasMatch) activeMappings.push(mapping);
    });

    const mappedEntries = activeMappings.map(m => {
      const unit = getUnitForChannel(m.displayName);
      const label = unit ? `${m.displayName} [${unit}]` : m.displayName;
      return { value: m.displayName, label };
    });
    const rawEntries = Array.from(numericCols).filter(c => !coveredRawCols.has(c)).sort().map(c => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const isMathCh = mathChannels.some(mc => mc.name === c);
      const isPreview = c === quickModPreviewName;
      const suffix = isPreview ? ' (preview)' : (isMathCh ? ' (math)' : '');
      const label = unit ? `${c} [${unit}]${suffix}` : `${c}${suffix}`;
      return { value: c, label };
    });
    return mappedEntries.concat(rawEntries);
  }

  // Renders `entries` into #ySelect as <option>s, filtered by the live search box -- but
  // any entry whose value is in `keepSelections` is always kept, so narrowing the search
  // never hides (or drops the selection of) a channel the user already picked.
  function renderYSelectOptions(entries, keepSelections) {
    const term = (ySelectSearch && ySelectSearch.value || '').trim().toLowerCase();
    const filtered = term
      ? entries.filter(e => keepSelections.has(e.value) || e.label.toLowerCase().includes(term))
      : entries;
    ySelect.innerHTML = filtered.map(e => `<option value="${escapeHtml(e.value)}">${escapeHtml(e.label)}</option>`).join('');
  }

  function populateYSelectWithSelections(targetSelections) {
    const entries = buildYSelectOptionEntries();
    renderYSelectOptions(entries, targetSelections);

    const opts = Array.from(ySelect.options);
    const valid = new Set(Array.from(targetSelections).filter(v => opts.some(o => o.value === v)));
    if (valid.size > 0) {
      opts.forEach(o => { o.selected = valid.has(o.value); });
    } else {
      const defaultOpt = opts.find(o => o.value === DEFAULT_Y_CHANNEL)
        || opts.find(o => o.value.toLowerCase() === DEFAULT_Y_CHANNEL.toLowerCase());
      if (defaultOpt) defaultOpt.selected = true;
      else if (opts.length > 0) opts[0].selected = true;
    }
  }

  // Show/hide and populate the quick modify section.
  function renderQuickModSection() {
    if (!quickModSection) return;
    const selectedChannels = getSelectedY();
    const baseChannels = selectedChannels.filter(c => c !== quickModPreviewName);
    if (baseChannels.length === 0) {
      quickModSection.hidden = true;
      clearQuickModSelectionState();
      return;
    }

    if (!quickModState.channel || !baseChannels.includes(quickModState.channel)) {
      const fallbackChannel = baseChannels[0];
      if (quickModState.channel !== fallbackChannel) {
        clearQuickModSelectionState();
      }
      quickModState.channel = fallbackChannel;
    }

    quickModSection.hidden = !quickModEditorOpen;
    if (quickModSection.hidden) return;

    if (quickModChannelName) {
      quickModChannelName.textContent = quickModState.channel ? getChannelLabel(quickModState.channel) : 'None';
    }
    if (quickModNegate) quickModNegate.checked = !!quickModState.negate;
    if (quickModReciprocal) quickModReciprocal.checked = !!quickModState.reciprocal;
    if (quickModFilter) quickModFilter.checked = !!quickModState.filter;
    if (quickModFilterControls) quickModFilterControls.hidden = !quickModState.filter;
    if (quickModFilterAxis) {
      populateAxisChannelSelect(quickModFilterAxis);
      quickModFilterAxis.value = quickModState.filterAxis || 'time';
    }
    if (quickModFilterWindow) quickModFilterWindow.value = quickModState.filterWindow;
    if (quickModCreateBtn) {
      quickModCreateBtn.disabled = !hasQuickModActive();
    }
  }

  let mathChEditIdx = -1; // -1 = add mode, >=0 = editing existing channel

  function describeSmoothingAxis(axisChannel) {
    if (!axisChannel || axisChannel === 'time') return 'Time [s]';
    if (axisChannel === 'distance') return 'Distance [m]';
    return getChannelLabel(axisChannel);
  }

  function renderMathChannelsList() {
    if (!mathChannelsList) return;
    mathChannelsList.innerHTML = mathChannels.map((mc, i) => {
      const smoothLabel = mc.smoothing && mc.smoothing.window > 0
        ? ` <span class="math-ch-smooth-info">[filter ±${mc.smoothing.window} on ${escapeHtml(describeSmoothingAxis(mc.smoothing.axisChannel))}]</span>`
        : '';
      return `<div class="math-ch-item">` +
        `<span class="math-ch-name">${escapeHtml(mc.name)}</span>` +
        `<span class="math-ch-expr">${escapeHtml(mc.expression)}${smoothLabel}</span>` +
        `<button type="button" class="math-ch-edit" data-idx="${i}" aria-label="Edit ${escapeHtml(mc.name)}">✎</button>` +
        `<button type="button" class="math-ch-delete" data-idx="${i}" aria-label="Delete ${escapeHtml(mc.name)}">✕</button>` +
        `</div>`;
    }).join('');
  }

  function formatDataFilterRange(f) {
    const label = getChannelLabel(f.channel);
    if (f.kind === 'discrete') {
      const shown = (f.values || []).slice(0, 6).map(v => String(v)).join(', ');
      const more = f.values && f.values.length > 6 ? `, +${f.values.length - 6} more` : '';
      return `${label} in {${shown}${more}}`;
    }
    if (f.min !== null && f.max !== null) return `${label}: ${f.min} – ${f.max}`;
    if (f.min !== null) return `${label} ≥ ${f.min}`;
    if (f.max !== null) return `${label} ≤ ${f.max}`;
    return label;
  }

  function renderDataFiltersList() {
    if (!dataFiltersList) return;
    dataFiltersList.innerHTML = dataFilters.map((f, i) => (
      `<div class="data-filter-item${f.enabled ? '' : ' is-disabled'}">` +
      `<input type="checkbox" class="data-filter-item-enabled" data-idx="${i}" ${f.enabled ? 'checked' : ''} aria-label="Enable filter on ${escapeHtml(f.channel)}" />` +
      `<span class="data-filter-desc">${escapeHtml(formatDataFilterRange(f))}</span>` +
      `<button type="button" class="data-filter-edit" data-idx="${i}" aria-label="Edit filter on ${escapeHtml(f.channel)}">✎</button>` +
      `<button type="button" class="data-filter-delete" data-idx="${i}" aria-label="Delete filter on ${escapeHtml(f.channel)}">✕</button>` +
      `</div>`
    )).join('');
  }

  function formatTempProfileSummary(p) {
    const chLabel = `${p.channels.length} channel${p.channels.length === 1 ? '' : 's'}`;
    if (p.useDefaultRange) return `${chLabel} · ${tempProfileDefaults.colormap} · default range`;
    return `${chLabel} · ${p.colormap} · ${p.min}–${p.max}`;
  }

  function renderTempProfilePlotsList() {
    if (!tempProfilePlotsList) return;
    tempProfilePlotsList.innerHTML = tempProfilePlots.map((p, i) => (
      `<div class="temp-profile-item${p.enabled ? '' : ' is-disabled'}">` +
      `<input type="checkbox" class="temp-profile-item-enabled" data-idx="${i}" ${p.enabled ? 'checked' : ''} aria-label="Show ${escapeHtml(p.name)}" />` +
      `<span class="temp-profile-item-name">${escapeHtml(p.name)}</span>` +
      `<span class="temp-profile-item-summary">${escapeHtml(formatTempProfileSummary(p))}</span>` +
      `<button type="button" class="temp-profile-edit" data-idx="${i}" aria-label="Edit ${escapeHtml(p.name)}">✎</button>` +
      `<button type="button" class="temp-profile-delete" data-idx="${i}" aria-label="Delete ${escapeHtml(p.name)}">✕</button>` +
      `</div>`
    )).join('');
  }

  // Shared by updatePlot()'s trace masking and the binned-plot overlay's data-filter-aware
  // binning -- both need "which rows currently pass the active data filters," just applied
  // to different things (which points get plotted vs. which rows contribute to a bin mean).
  function getEnabledDataFilters() {
    const masterEnabled = !!(dataFiltersEnabledInput && dataFiltersEnabledInput.checked);
    return masterEnabled ? dataFilters.filter(f => f.enabled) : [];
  }

  // Dims the filter list/form/Add button (but leaves them fully interactive) whenever the
  // master "Data Filters:" checkbox is off, so a filter that's individually checked but
  // silently having no effect (the master toggle gates all of them) is visually obvious
  // instead of an easy-to-miss unchecked checkbox sitting next to a bunch of checked ones.
  function syncDataFiltersEnabledVisual() {
    if (!dataFiltersControls) return;
    const masterEnabled = !!(dataFiltersEnabledInput && dataFiltersEnabledInput.checked);
    dataFiltersControls.classList.toggle('is-filters-disabled', !masterEnabled);
  }

  // Resolves each filter's channel against this specific log once, dropping any filter
  // whose channel doesn't exist here -- a filter only constrains files that have the
  // channel it names, same as the color axis and math channel resolution elsewhere.
  function resolveDataFiltersForLog(log, enabledFilters) {
    return enabledFilters
      .map((f) => ({
        kind: f.kind === 'discrete' ? 'discrete' : 'range',
        min: f.min, max: f.max,
        valueSet: f.kind === 'discrete' ? new Set(f.values) : null,
        allNumeric: f.allNumeric,
        resolvedCol: resolveChannelForLog(f.channel, log)
      }))
      .filter((f) => f.resolvedCol && log.cols.includes(f.resolvedCol));
  }

  function rowPassesDataFilters(log, rowIdx, resolvedFilters) {
    return resolvedFilters.every((f) => {
      const raw = log.data[rowIdx][f.resolvedCol];
      if (f.kind === 'discrete') {
        if (raw === null || raw === undefined || raw === '') return false;
        const normalized = f.allNumeric ? Number(raw) : String(raw).trim();
        return f.valueSet.has(normalized);
      }
      const v = Number(raw);
      if (!Number.isFinite(v)) return false;
      if (f.min !== null && v < f.min) return false;
      if (f.max !== null && v > f.max) return false;
      return true;
    });
  }

  function applyRowFiltersToMask(log, maskIdx, resolvedDataFilters) {
    return maskIdx.filter((i) => {
      if (resolvedDataFilters.length > 0 && !rowPassesDataFilters(log, i, resolvedDataFilters)) return false;
      return true;
    });
  }

  // Aggregates every currently displayed row -- lap-selected, data-filter-passing --
  // across ALL currently selected files into one set of bins per Y channel, giving a
  // single point per bin (the mean of everything that landed there). This is deliberately
  // NOT a per-row math channel: it produces a shorter series than the raw data, which is
  // exactly the point -- collapsing something like a hysteresis loop (two Y values for the
  // same X) into one clean curve, drawn as an extra overlay trace rather than stored as data.
  function computeBinnedOverlayTraces(selFiles, selectedLaps, ycols, axisChannel, binWidth, channelToRef) {
    if (!axisChannel || !(binWidth > 0) || ycols.length === 0) return [];
    ycols.forEach(y => bins.set(y, new Map()));

    selFiles.forEach((log) => {
      const axisResolvedCol = resolveChannelForLog(axisChannel, log);
      const activeFilters = resolveDataFiltersForLog(log, enabledFilters);
      const lapNumArr = log.meta.lapNum || [];
      const resolvedYCols = ycols.map(y => resolveChannelForLog(y, log));

      log.data.forEach((row, i) => {
        maskIdx = applyRowFiltersToMask(log, maskIdx, activeDataFilters);
        if (activeFilters.length > 0 && !rowPassesDataFilters(log, i, activeFilters)) return;
        const x = Number(row[axisResolvedCol]);
        if (!Number.isFinite(x)) return;
        const binKey = Math.round(x / binWidth);

        ycols.forEach((y, yi) => {
          const resolvedY = resolvedYCols[yi];
          if (!resolvedY || !log.cols.includes(resolvedY)) return;
          const v = Number(row[resolvedY]);
          if (!Number.isFinite(v)) return;
          const map = bins.get(y);
          let entry = map.get(binKey);
          if (!entry) { entry = { xSum: 0, ySum: 0, count: 0 }; map.set(binKey, entry); }
          entry.xSum += x;
          entry.ySum += v;
          entry.count += 1;
        });
      });
    });

    const traces = [];
    ycols.forEach((y) => {
      const map = bins.get(y);
      if (!map || map.size === 0) return;
      const points = Array.from(map.values())
        .map(e => ({ x: e.xSum / e.count, y: e.ySum / e.count }))
        .sort((a, b) => a.x - b.x);
      const color = getChannelColor(y);
      traces.push({
        x: points.map(p => p.x),
        y: points.map(p => p.y),
        yaxis: (channelToRef && channelToRef.get(y)) || 'y',
        name: `${getChannelLabel(y)} (binned)`,
        mode: 'lines+markers',
        line: { color, width: 3 },
        marker: { color, size: 6, symbol: 'diamond', line: { color: '#fff', width: 1 } },
        hovertemplate: buildHoverTemplate(getChannelLabel(axisChannel), `${getChannelLabel(y)} (binned)`)
      });
    });
    return traces;
  }

  // Classifies a filter channel the exact same way the color axis does (classifyColorAxisValues),
  // using every value of that channel across all loaded files (not just the currently
  // selected/visible ones) -- the form should offer the same discrete/continuous split
  // regardless of which files happen to be checked while the filter is being edited.
  function computeDataFilterChannelClassification(channel) {
    if (!channel) return null;
    const rawValues = [];
    logs.forEach((log) => {
      const resolvedCol = resolveChannelForLog(channel, log);
      if (!resolvedCol || !log.cols.includes(resolvedCol)) return;
      log.data.forEach((row) => {
        const v = row[resolvedCol];
        if (v !== null && v !== undefined && v !== '') rawValues.push(v);
      });
    });
    return classifyColorAxisValues(rawValues);
  }

  function formatDataFilterHintNumber(n) {
    return String(Math.round(n * 1000) / 1000);
  }

  function populateDataFilterValuesSelect(classification) {
    if (!dataFilterValuesSelect) return;
    dataFilterValuesSelect.innerHTML = classification.categories.map((cat) => (
      `<option value="${escapeHtml(String(cat))}">${escapeHtml(String(cat))}</option>`
    )).join('');
  }

  // The classification computed for the currently-selected filter channel -- set by
  // updateDataFilterFormForChannel, read by handleDataFilterModeToggleChange and the Save
  // handler so they don't need to recompute it.
  let dataFilterFormClassification = null;

  function applyDataFilterModeVisibility(isDiscreteMode) {
    if (dataFilterRangeField) dataFilterRangeField.hidden = isDiscreteMode;
    if (dataFilterDiscreteField) dataFilterDiscreteField.hidden = !isDiscreteMode;
  }

  // Reacts to the user flipping the Range/Specific-values toggle (only shown for numeric
  // channels whose distinct-value count is low enough that classification defaults to
  // "discrete" -- see updateDataFilterFormForChannel). Doesn't touch the toggle's own
  // checked state; only re-renders which fields are visible for whatever it's now set to.
  function handleDataFilterModeToggleChange() {
    if (!dataFilterModeToggle || dataFilterModeToggle.hidden) return;
    const isDiscreteMode = !!(dataFilterModeDiscreteInput && dataFilterModeDiscreteInput.checked);
    applyDataFilterModeVisibility(isDiscreteMode);
    if (isDiscreteMode && dataFilterFormClassification) populateDataFilterValuesSelect(dataFilterFormClassification);
  }

  // Single entry point for reacting to a channel pick in the filter form: reclassifies the
  // channel, swaps between the range fields and the discrete multiselect, and updates the
  // hint line. Called on channel change and whenever the form is opened (add or edit).
  //
  // classifyColorAxisValues (shared with the color-by-channel legend) treats any channel
  // with few distinct values as "discrete" -- the right call for a legend grouping Gear or
  // Lap Number, but wrong for a genuinely continuous physical channel (Speed, lateral
  // acceleration) that just happens to have coarse sensor-resolution quantization: forcing
  // it into a "pick individual values" multiselect instead of Min/Max silently breaks what
  // most users expect a numeric filter to do. Range filtering only makes sense for numeric
  // data in the first place (rowPassesDataFilters' range branch does Number(raw), which
  // would filter out every row of a text channel) -- so: non-numeric channels stay
  // discrete-only exactly as before, numeric-and-clearly-continuous channels stay
  // range-only exactly as before, and only the ambiguous case (numeric but few distinct
  // values) gets a toggle so the user can choose instead of having it decided for them.
  function updateDataFilterFormForChannel() {
    const channel = dataFilterChannelSelect ? dataFilterChannelSelect.value : '';
    const classification = channel ? computeDataFilterChannelClassification(channel) : null;
    dataFilterFormClassification = classification;

    const isNumeric = !!(classification && classification.allNumeric);
    const classifiedDiscrete = !!(classification && classification.kind === 'discrete');
    const ambiguous = isNumeric && classifiedDiscrete;

    if (dataFilterModeToggle) dataFilterModeToggle.hidden = !ambiguous;
    if (ambiguous) {
      if (dataFilterModeRangeInput) dataFilterModeRangeInput.checked = false;
      if (dataFilterModeDiscreteInput) dataFilterModeDiscreteInput.checked = true;
    }

    const isDiscreteMode = classifiedDiscrete; // toggle (when shown) starts on this same default
    applyDataFilterModeVisibility(isDiscreteMode);
    if (isDiscreteMode && classification) populateDataFilterValuesSelect(classification);

    if (!dataFilterRangeHint) return;
    if (classifiedDiscrete) {
      const n = classification.categories.length;
      dataFilterRangeHint.textContent = ambiguous
        ? `${n} distinct value${n === 1 ? '' : 's'} — filter by range or specific values above.`
        : `Discrete channel — ${n} distinct value${n === 1 ? '' : 's'}`;
    } else if (classification) {
      dataFilterRangeHint.textContent =
        `Data range: ${formatDataFilterHintNumber(classification.min)} – ${formatDataFilterHintNumber(classification.max)}`;
    } else {
      dataFilterRangeHint.textContent = '';
    }
  }

  let mathChActiveSuggIdx = -1;

  function getMathChAvailableChannels() {
    const names = new Set();
    getChannelMap().forEach(m => names.add(m.displayName));
    logs.forEach(log => {
      log.cols.forEach(col => {
        const sample = log.data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '');
        if (sample) { const v = sample[col]; if (typeof v === 'number' || !isNaN(Number(v))) names.add(col); }
      });
    });
    mathChannels.forEach(mc => names.add(mc.name));
    return Array.from(names).sort();
  }

  function hideMathChSuggestions() {
    if (mathChSuggestions) mathChSuggestions.hidden = true;
    mathChActiveSuggIdx = -1;
  }

  function applyMathChSuggestion(channelName) {
    if (!mathChExpr || !mathChSuggestions) return;
    const openBrace = Number(mathChSuggestions.dataset.openBrace);
    const cursorPos = Number(mathChSuggestions.dataset.cursor);
    const val = mathChExpr.value;
    const newVal = val.slice(0, openBrace) + '{' + channelName + '}' + val.slice(cursorPos);
    mathChExpr.value = newVal;
    const newPos = openBrace + channelName.length + 2;
    mathChExpr.setSelectionRange(newPos, newPos);
    hideMathChSuggestions();
    mathChExpr.focus();
  }

  // Returns { valid, sampleValue, error }
  function testMathChannelExpression(expression) {
    const refs = [];
    const safe = expression.replace(/\{([^}]+)\}/g, (_, chName) => {
      let idx = refs.indexOf(chName);
      if (idx < 0) { idx = refs.length; refs.push(chName); }
      return `__v${idx}__`;
    });
    let fn;
    try {
      fn = new Function(...refs.map((_, i) => `__v${i}__`), ...MATH_SCOPE_KEYS, `"use strict"; return (${safe});`);
    } catch (e) {
      return { valid: false, sampleValue: null, error: `Syntax error: ${e.message}` };
    }
    if (logs.length === 0) return { valid: true, sampleValue: null, error: null };
    for (const log of logs) {
      const resolvedRefs = refs.map(ch => resolveChannelForLog(ch, log));
      for (const row of log.data) {
        const vals = resolvedRefs.map(col => { const v = Number(row[col]); return Number.isFinite(v) ? v : NaN; });
        try {
          const result = fn(...vals, ...MATH_SCOPE_VALS);
          if (Number.isFinite(result)) return { valid: true, sampleValue: result, error: null };
        } catch {}
      }
    }
    return { valid: false, sampleValue: null, error: 'No valid values — check that channel names match loaded data' };
  }

  function getChannelMap() {
    return Array.isArray(channelMap) ? channelMap : [];
  }

  function normalizeChannelMapConfig(config) {
    if (!Array.isArray(config)) return null;
    const normalized = config
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const displayName = entry.displayName == null ? '' : String(entry.displayName).trim();
        const piboso = entry.piboso == null ? '' : String(entry.piboso).trim();
        const aim = entry.aim == null ? '' : String(entry.aim).trim();
        const motec = entry.motec == null ? '' : String(entry.motec).trim();
        if (!displayName) return null;
        return { displayName, piboso, aim, motec };
      })
      .filter(Boolean);
    return normalized.length > 0 ? normalized : null;
  }

  function normalizeTrackMapDefaultsConfig(config) {
    if (!Array.isArray(config)) return null;
    const normalized = config
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const venue = entry.venue == null ? '' : String(entry.venue).trim();
        const latitude = Number(entry.latitude);
        const longitude = Number(entry.longitude);
        const xOffset = Number(entry.xOffset);
        const yOffset = Number(entry.yOffset);
        if (!venue) return null;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        if (!Number.isFinite(xOffset) || !Number.isFinite(yOffset)) return null;
        return { venue, latitude, longitude, xOffset, yOffset };
      })
      .filter(Boolean);
    return normalized.length > 0 ? normalized : null;
  }

  async function loadChannelMapConfig() {
    try {
      const response = await fetch('channel-map.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      const normalized = normalizeChannelMapConfig(config);
      if (!normalized) throw new Error('Invalid channel-map.json format');
      channelMap = normalized;
      if (logs.length > 0) {
        populateYSelect();
        populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
        updatePlot();
      }
    } catch (err) {
      console.warn('Using built-in channel map fallback:', err.message);
      channelMap = DEFAULT_CHANNEL_MAP.slice();
    }
  }

  function getLogVenue(log) {
    if (!log || !log.meta || !log.meta.metadata) return '';
    const metadata = log.meta.metadata;
    return metadata.venue == null ? '' : String(metadata.venue).trim();
  }

  function normalizeVenueKey(value) {
    return String(value == null ? '' : value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function findTrackMapDefaultsForVenue(venue) {
    const venueKey = normalizeVenueKey(venue);
    if (!venueKey) return null;
    return gpbikesTrackMapDefaults.find(entry => normalizeVenueKey(entry.venue) === venueKey) || null;
  }

  function getSelectedGpBikesTrackDefaults(selFiles) {
    const candidates = Array.isArray(selFiles) && selFiles.length > 0 ? selFiles : logs;
    for (const log of candidates) {
      const fmt = (log && log.meta && log.meta.format) ? log.meta.format : '';
      if (!window.LogFileProcessors || !window.LogFileProcessors.isGPBikesFormat(fmt)) continue;
      const venue = getLogVenue(log);
      const matched = findTrackMapDefaultsForVenue(venue);
      if (matched) {
        return {
          ...matched,
          signature: `${normalizeVenueKey(matched.venue)}|${matched.latitude}|${matched.longitude}|${matched.xOffset}|${matched.yOffset}`,
          venue
        };
      }
    }
    return null;
  }

  async function loadTrackMapDefaultsConfig() {
    try {
      const response = await fetch('static/gpbikes-track-map-defaults.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      const normalized = normalizeTrackMapDefaultsConfig(config);
      if (!normalized) throw new Error('Invalid gpbikes-track-map-defaults.json format');
      gpbikesTrackMapDefaults = normalized;
      if (logs.length > 0) updatePlot();
    } catch (err) {
      console.warn('Using built-in GP Bikes track map defaults fallback:', err.message);
      gpbikesTrackMapDefaults = DEFAULT_GPBIKES_TRACK_MAP_DEFAULTS.slice();
    }
  }

  function populateYSelect() {
    const previousSelections = new Set(Array.from(ySelect.selectedOptions).map(o => o.value));
    const entries = buildYSelectOptionEntries();
    renderYSelectOptions(entries, previousSelections);

    const opts = Array.from(ySelect.options);
    const validPreviousSelections = new Set(Array.from(previousSelections).filter(value => opts.some(o => o.value === value)));
    if (validPreviousSelections.size > 0) {
      opts.forEach(o => { o.selected = validPreviousSelections.has(o.value); });
    } else {
      const defaultOpt = opts.find(o => o.value === DEFAULT_Y_CHANNEL)
        || opts.find(o => o.value.toLowerCase() === DEFAULT_Y_CHANNEL.toLowerCase());
      if (defaultOpt) {
        defaultOpt.selected = true;
      } else if (opts.length > 0) {
        opts[0].selected = true;
      }
    }
    renderSelectedChannelColorControls();
  }

  function getNumericColumns() {
    const numericCols = new Set();
    logs.forEach((log) => {
      log.cols.forEach((col) => {
        if (col === 'Lap Time' || col === 'Lap Number') return;
        const sample = log.data.find((row) => row[col] !== null && row[col] !== undefined && row[col] !== '');
        if (!sample) return;
        const value = sample[col];
        if (typeof value === 'number' || !isNaN(Number(value))) {
          numericCols.add(col);
        }
      });
    });
    return Array.from(numericCols).sort();
  }

  function populateNumericChannelSelect(selectEl, previousValue, preferredValues) {
    if (!selectEl) return;
    const columns = getNumericColumns();
    const makeOpt = (col) => {
      let unit = '';
      for (const log of logs) {
        if (log.meta && log.meta.units && log.meta.units[col]) {
          unit = log.meta.units[col];
          break;
        }
      }
      const label = unit ? `${col} [${unit}]` : col;
      return `<option value="${escapeHtml(col)}">${escapeHtml(label)}</option>`;
    };

    selectEl.innerHTML = columns.map(makeOpt).join('');

    if (columns.some((col) => col === previousValue)) {
      selectEl.value = previousValue;
      return;
    }

    const preferred = (Array.isArray(preferredValues) ? preferredValues : [])
      .map((candidate) => columns.find((col) => col.toLowerCase() === String(candidate).toLowerCase()))
      .find(Boolean);
    if (preferred) {
      selectEl.value = preferred;
    } else if (columns.length > 0) {
      selectEl.value = columns[0];
    }
  }

  // Turns a plain single-select <select> into a searchable combobox: clicking it (or typing while
  // it has focus) opens a small floating panel with a text filter, matching any part of the option
  // label rather than the browser's built-in type-ahead (which only matches from the start of the
  // text). The native <select> stays the source of truth for value/disabled/options, so all the
  // existing `select.value = x`, `select.innerHTML = ...`, `select.disabled = true` and `change`
  // listener code elsewhere keeps working unchanged -- this only replaces how the dropdown opens.
  // Safe to call more than once on the same element (e.g. on a row rebuilt from scratch).
  // Companion to enhanceSelectWithSearch: removes a select's floating search panel from
  // <body> before the select itself is thrown away (e.g. an innerHTML re-render), so repeated
  // re-renders of the same row don't leak one orphaned panel div per render.
  function detachSearchablePanel(selectEl) {
    if (selectEl && selectEl._searchablePanel) {
      selectEl._searchablePanel.remove();
      selectEl._searchablePanel = null;
    }
  }

  function enhanceSelectWithSearch(selectEl) {
    if (!selectEl || selectEl.dataset.searchEnhanced) return;
    selectEl.dataset.searchEnhanced = '1';

    // Modern browsers don't let script cancel a <select>'s own native popup (mousedown
    // preventDefault used to work for this years ago but no longer does in Chromium/Firefox),
    // so the select can't stay the visible/clickable control. Instead we hide it -- it stays
    // the source of truth for value/disabled/options, so `select.value = x`, `select.innerHTML
    // = ...`, `select.disabled = true` and `change` listeners elsewhere keep working unchanged
    // -- and put a lookalike <button> in its place that opens our own filtered panel.
    const wrap = document.createElement('span');
    wrap.className = 'searchable-select-wrap';
    if (selectEl.id) wrap.setAttribute('data-wrap-for', selectEl.id);
    selectEl.parentNode.insertBefore(wrap, selectEl);
    wrap.appendChild(selectEl);
    selectEl.classList.add('searchable-select-native');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'searchable-select-trigger';
    if (selectEl.id) trigger.setAttribute('data-for-select', selectEl.id);
    wrap.appendChild(trigger);

    const panel = document.createElement('div');
    panel.className = 'searchable-select-panel';
    panel.hidden = true;
    panel.innerHTML = '<input type="text" class="searchable-select-input" placeholder="Search..." autocomplete="off" />'
      + '<div class="searchable-select-list"></div>';
    document.body.appendChild(panel);
    // Tracked so callers that rebuild a <select> from scratch (e.g. the importer table's
    // innerHTML re-render) can remove the orphaned panel via detachSearchablePanel() below --
    // otherwise it's left behind in <body> forever since it isn't a child of the select.
    selectEl._searchablePanel = panel;
    const searchInput = panel.querySelector('.searchable-select-input');
    const list = panel.querySelector('.searchable-select-list');

    let filtered = [];
    let activeIdx = -1;

    function syncTrigger() {
      const opt = selectEl.options[selectEl.selectedIndex];
      trigger.textContent = opt ? opt.textContent : '';
      trigger.disabled = selectEl.disabled;
    }
    // The trigger's label needs to track the real select's value however it changes: our own
    // commit() below dispatches 'change', and other code re-populating the select's <option>s
    // (which is how the app applies a restored/default value after rebuilding the list) is
    // caught by observing childList; a 'disabled' toggle elsewhere is caught via attributes.
    selectEl.addEventListener('change', syncTrigger);
    new MutationObserver(syncTrigger).observe(selectEl, { childList: true, attributes: true, attributeFilter: ['disabled'] });
    syncTrigger();

    function reposition() {
      const r = trigger.getBoundingClientRect();
      const width = Math.round(Math.max(r.width, 160));
      let left = Math.round(r.left);
      if (left + width > window.innerWidth - 4) left = Math.max(4, window.innerWidth - width - 4);
      panel.style.width = `${width}px`;
      panel.style.left = `${left}px`;
      const spaceBelow = window.innerHeight - r.bottom;
      if (spaceBelow < 160 && r.top > spaceBelow) {
        panel.style.top = '';
        panel.style.bottom = `${Math.round(window.innerHeight - r.top + 2)}px`;
      } else {
        panel.style.bottom = '';
        panel.style.top = `${Math.round(r.bottom + 2)}px`;
      }
    }

    function updateActive() {
      const items = list.querySelectorAll('.searchable-select-item');
      items.forEach((el, i) => el.classList.toggle('active', i === activeIdx));
      if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
    }

    function renderList(term) {
      const t = term.trim().toLowerCase();
      const all = Array.from(selectEl.options).map((o, i) => ({ index: i, value: o.value, label: o.textContent }));
      filtered = t ? all.filter(o => o.label.toLowerCase().includes(t)) : all;
      list.innerHTML = filtered.length
        ? filtered.map((o, i) => `<div class="searchable-select-item${o.value === selectEl.value ? ' is-current' : ''}" data-i="${i}">${escapeHtml(o.label)}</div>`).join('')
        : '<div class="searchable-select-empty">No matches</div>';
      activeIdx = filtered.findIndex(o => o.value === selectEl.value);
      if (activeIdx < 0 && filtered.length) activeIdx = 0;
      updateActive();
    }

    function onDocMouseDown(ev) {
      if (panel.contains(ev.target) || trigger.contains(ev.target)) return;
      closePanel();
    }

    function openPanel(seed) {
      if (selectEl.disabled) return;
      reposition();
      panel.hidden = false;
      searchInput.value = seed || '';
      renderList(searchInput.value);
      searchInput.focus();
      searchInput.select();
      document.addEventListener('mousedown', onDocMouseDown, true);
      window.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);
    }

    function closePanel() {
      panel.hidden = true;
      document.removeEventListener('mousedown', onDocMouseDown, true);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    }

    function commit(i) {
      const item = filtered[i];
      if (!item) return;
      selectEl.value = item.value;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      closePanel();
      trigger.focus();
    }

    trigger.addEventListener('click', () => {
      if (panel.hidden) openPanel(''); else closePanel();
    });

    // Lets typing while the trigger has focus (e.g. tabbed to via keyboard) jump straight into
    // a substring search, the same way typing on a native closed select jumps to a prefix match.
    trigger.addEventListener('keydown', (ev) => {
      if (selectEl.disabled || !panel.hidden) return;
      if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        ev.preventDefault();
        openPanel(ev.key);
      } else if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        openPanel('');
      }
    });

    searchInput.addEventListener('input', () => renderList(searchInput.value));

    searchInput.addEventListener('keydown', (ev) => {
      // Stopped from bubbling for every key this panel itself handles -- otherwise e.g. Escape
      // (meant to just close this search dropdown) would also reach the global document-level
      // keydown handler and close a containing modal like the importer editor, or ArrowUp/Down
      // would reach whatever else is listening for those on the page.
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        ev.stopPropagation();
        activeIdx = Math.min(activeIdx + 1, filtered.length - 1);
        updateActive();
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        ev.stopPropagation();
        activeIdx = Math.max(activeIdx - 1, 0);
        updateActive();
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
        commit(activeIdx);
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopPropagation();
        closePanel();
        trigger.focus();
      } else if (ev.key === 'Tab') {
        closePanel();
      }
    });

    list.addEventListener('mousedown', (ev) => {
      const item = ev.target.closest('.searchable-select-item');
      if (!item) return;
      ev.preventDefault();
      commit(Number(item.dataset.i));
    });
  }

  function populateMapColorSelect() {
    const previousValue = mapColorSelect ? mapColorSelect.value : '';
    const numericCols = new Set();
    logs.forEach(l => {
      l.cols.forEach(col => {
        const sample = l.data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '');
        if (sample) {
          const val = sample[col];
          if (typeof val === 'number') numericCols.add(col);
          else if (!isNaN(Number(val))) numericCols.add(col);
        }
      });
    });

    const coveredRawCols = new Set();
    const activeMappings = [];
    getChannelMap().forEach(mapping => {
      let hasMatch = false;
      logs.forEach(log => {
        const col = resolveChannelForLog(mapping.displayName, log);
        if (col && numericCols.has(col)) {
          coveredRawCols.add(col);
          hasMatch = true;
        }
      });
      if (hasMatch) activeMappings.push(mapping);
    });

    const mappedOptions = activeMappings.map(m => {
      const unit = getUnitForChannel(m.displayName);
      const label = unit ? `${m.displayName} [${unit}]` : m.displayName;
      return `<option value="${escapeHtml(m.displayName)}">${escapeHtml(label)}</option>`;
    });
    const rawOptions = Array.from(numericCols).filter(c => !coveredRawCols.has(c)).sort().map(c => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const label = unit ? `${c} [${unit}]` : c;
      return `<option value="${escapeHtml(c)}">${escapeHtml(label)}</option>`;
    });
    mapColorSelect.innerHTML = mappedOptions.concat(rawOptions).join('');

    if (previousValue && Array.from(mapColorSelect.options).some(o => o.value === previousValue)) {
      mapColorSelect.value = previousValue;
    } else {
      const preferred = DEFAULT_MAP_COLOR_CHANNEL_CANDIDATES
        .map((candidate) => Array.from(mapColorSelect.options).find((o) => o.value.toLowerCase() === candidate.toLowerCase()))
        .find(Boolean);
      if (preferred) {
        mapColorSelect.value = preferred.value;
      } else if (mapColorSelect.options.length > 0) {
        mapColorSelect.value = mapColorSelect.options[0].value;
      }
    }
  }

  function populateColorAxisSelect() {
    if (!colorAxisSelect) return;
    const previousValue = colorAxisSelect.value;
    const numericCols = new Set();
    logs.forEach(l => {
      l.cols.forEach(col => {
        const sample = l.data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '');
        if (sample) {
          const val = sample[col];
          if (typeof val === 'number') numericCols.add(col);
          else if (!isNaN(Number(val))) numericCols.add(col);
        }
      });
    });

    const coveredRawCols = new Set();
    const activeMappings = [];
    getChannelMap().forEach(mapping => {
      let hasMatch = false;
      logs.forEach(log => {
        const col = resolveChannelForLog(mapping.displayName, log);
        if (col && numericCols.has(col)) {
          coveredRawCols.add(col);
          hasMatch = true;
        }
      });
      if (hasMatch) activeMappings.push(mapping);
    });

    const mappedOptions = activeMappings.map(m => {
      const unit = getUnitForChannel(m.displayName);
      const label = unit ? `${m.displayName} [${unit}]` : m.displayName;
      return `<option value="${escapeHtml(m.displayName)}">${escapeHtml(label)}</option>`;
    });
    const rawOptions = Array.from(numericCols).filter(c => !coveredRawCols.has(c)).sort().map(c => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const label = unit ? `${c} [${unit}]` : c;
      return `<option value="${escapeHtml(c)}">${escapeHtml(label)}</option>`;
    });
    colorAxisSelect.innerHTML = mappedOptions.concat(rawOptions).join('');

    if (previousValue && Array.from(colorAxisSelect.options).some(o => o.value === previousValue)) {
      colorAxisSelect.value = previousValue;
    } else if (colorAxisSelect.options.length > 0) {
      colorAxisSelect.value = colorAxisSelect.options[0].value;
    }
  }

  function populateDataFilterChannelSelect() {
    if (!dataFilterChannelSelect) return;
    const previousValue = dataFilterChannelSelect.value;
    const numericCols = new Set();
    logs.forEach(l => {
      l.cols.forEach(col => {
        const sample = l.data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '');
        if (sample) {
          const val = sample[col];
          if (typeof val === 'number') numericCols.add(col);
          else if (!isNaN(Number(val))) numericCols.add(col);
        }
      });
    });

    const coveredRawCols = new Set();
    const activeMappings = [];
    getChannelMap().forEach(mapping => {
      let hasMatch = false;
      logs.forEach(log => {
        const col = resolveChannelForLog(mapping.displayName, log);
        if (col && numericCols.has(col)) {
          coveredRawCols.add(col);
          hasMatch = true;
        }
      });
      if (hasMatch) activeMappings.push(mapping);
    });

    const mappedOptions = activeMappings.map(m => {
      const unit = getUnitForChannel(m.displayName);
      const label = unit ? `${m.displayName} [${unit}]` : m.displayName;
      return `<option value="${escapeHtml(m.displayName)}">${escapeHtml(label)}</option>`;
    });
    const rawOptions = Array.from(numericCols).filter(c => !coveredRawCols.has(c)).sort().map(c => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const label = unit ? `${c} [${unit}]` : c;
      return `<option value="${escapeHtml(c)}">${escapeHtml(label)}</option>`;
    });
    dataFilterChannelSelect.innerHTML = mappedOptions.concat(rawOptions).join('');

    if (previousValue && Array.from(dataFilterChannelSelect.options).some(o => o.value === previousValue)) {
      dataFilterChannelSelect.value = previousValue;
    } else if (dataFilterChannelSelect.options.length > 0) {
      dataFilterChannelSelect.value = dataFilterChannelSelect.options[0].value;
    }
  }

  // Shared by the Quick Modify and Math Channel forward/back filter controls: both let the
  // user pick what to window the average against, defaulting to Time/Distance (which map to
  // this log's own detected time/distance columns) but allowing any other numeric channel.
  function populateAxisChannelSelect(selectEl) {
    if (!selectEl) return;
    const previousValue = selectEl.value;
    const numericCols = new Set();
    logs.forEach(l => {
      l.cols.forEach(col => {
        const sample = l.data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '');
        if (sample) {
          const val = sample[col];
          if (typeof val === 'number') numericCols.add(col);
          else if (!isNaN(Number(val))) numericCols.add(col);
        }
      });
    });

    const coveredRawCols = new Set();
    const activeMappings = [];
    getChannelMap().forEach(mapping => {
      let hasMatch = false;
      logs.forEach(log => {
        const col = resolveChannelForLog(mapping.displayName, log);
        if (col && numericCols.has(col)) {
          coveredRawCols.add(col);
          hasMatch = true;
        }
      });
      if (hasMatch) activeMappings.push(mapping);
    });

    const mappedOptions = activeMappings.map(m => {
      const unit = getUnitForChannel(m.displayName);
      const label = unit ? `${m.displayName} [${unit}]` : m.displayName;
      return `<option value="${escapeHtml(m.displayName)}">${escapeHtml(label)}</option>`;
    });
    const rawOptions = Array.from(numericCols).filter(c => !coveredRawCols.has(c)).sort().map(c => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const label = unit ? `${c} [${unit}]` : c;
      return `<option value="${escapeHtml(c)}">${escapeHtml(label)}</option>`;
    });

    const builtins = '<option value="time">Time [s]</option><option value="distance">Distance [m]</option>';
    selectEl.innerHTML = builtins + mappedOptions.concat(rawOptions).join('');

    if (previousValue && Array.from(selectEl.options).some(o => o.value === previousValue)) {
      selectEl.value = previousValue;
    } else {
      selectEl.value = 'time';
    }
  }

  function populateXCustomSelect() {
    const previousValue = xCustomSelect ? xCustomSelect.value : '';
    const numericCols = new Set();
    logs.forEach(l => {
      l.cols.forEach(col => {
        const sample = l.data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '');
        if (sample) {
          const val = sample[col];
          if (typeof val === 'number') numericCols.add(col);
          else if (!isNaN(Number(val))) numericCols.add(col);
        }
      });
    });

    const coveredRawCols = new Set();
    const activeMappings = [];
    getChannelMap().forEach(mapping => {
      let hasMatch = false;
      logs.forEach(log => {
        const col = resolveChannelForLog(mapping.displayName, log);
        if (col && numericCols.has(col)) {
          coveredRawCols.add(col);
          hasMatch = true;
        }
      });
      if (hasMatch) activeMappings.push(mapping);
    });

    const mappedOptions = activeMappings.map(m => {
      const unit = getUnitForChannel(m.displayName);
      const label = unit ? `${m.displayName} [${unit}]` : m.displayName;
      return `<option value="${escapeHtml(m.displayName)}">${escapeHtml(label)}</option>`;
    });
    const rawOptions = Array.from(numericCols).filter(c => !coveredRawCols.has(c)).sort().map(c => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const label = unit ? `${c} [${unit}]` : c;
      return `<option value="${escapeHtml(c)}">${escapeHtml(label)}</option>`;
    });
    xCustomSelect.innerHTML = mappedOptions.concat(rawOptions).join('');

    if (previousValue && Array.from(xCustomSelect.options).some(o => o.value === previousValue)) {
      xCustomSelect.value = previousValue;
    } else if (xCustomSelect.options.length > 0) {
      xCustomSelect.value = xCustomSelect.options[0].value;
    }
  }

  // Returns the duration of a given lap number for a log. For AiM/GP Bikes
  // logs with beacon markers, this is the exact difference between the
  // relevant beacon times (meta.lapDurations), not an approximation based on
  // the nearest logged sample. Falls back to the largest observed per-row
  // "Lap Time" value, which is the best available estimate for logs without
  // beacon markers (laps inferred from distance).
  function getLapDuration(meta, lapNum) {
    if (!meta) return null;
    if (Array.isArray(meta.lapDurations) && Number.isFinite(meta.lapDurations[lapNum])) {
      return meta.lapDurations[lapNum];
    }
    let max = null;
    (meta.lapNum || []).forEach((n, i) => {
      if (n !== lapNum) return;
      const lt = meta.lapTime && meta.lapTime[i];
      if (lt == null || isNaN(lt)) return;
      if (max == null || lt > max) max = lt;
    });
    return max;
  }

  // Laps containing a negative lapRelDist sample -- typically time spent in the pits
  // (or otherwise off the lap's normal path) rather than a real hot lap. Surfaced so
  // renderLapsList can default those laps unchecked without hiding them outright.
  function getLapsWithNegativeDistance(meta) {
    const result = new Set();
    const lapNum = meta && meta.lapNum;
    const lapRelDist = meta && meta.lapRelDist;
    if (!Array.isArray(lapNum) || !Array.isArray(lapRelDist)) return result;
    for (let i = 0; i < lapNum.length; i++) {
      const d = lapRelDist[i];
      if (Number.isFinite(d) && d < 0) result.add(lapNum[i]);
    }
    return result;
  }

  // First and last lap (by lap number) of a file are conventionally the out-lap and
  // in-lap -- unchecked by default in the lap list (renderLapsList) and always excluded
  // from the "Shaded area between all laps" envelope (below), since neither is a
  // representative racing lap. Only applied once there are >=3 laps so a 1-2 lap file isn't
  // left with nothing to show. sortedLapNums must already be sorted ascending.
  function getInOutLapNumbers(sortedLapNums) {
    if (!Array.isArray(sortedLapNums) || sortedLapNums.length < 3) return new Set();
    return new Set([sortedLapNums[0], sortedLapNums[sortedLapNums.length - 1]]);
  }

  function renderLapsList() {
    const container = document.getElementById('lapsList');
    if (!container) return;
    // collect lap numbers across selected files
    const sel = getSelectedFiles();
    const lapSet = new Set();
    const lapDurations = new Map();
    sel.forEach(l => {
      if (l.meta && l.meta.lapNum) {
        l.meta.lapNum.forEach(n => lapSet.add(n));
        Array.from(new Set(l.meta.lapNum)).forEach(lap => {
          const duration = getLapDuration(l.meta, lap);
          if (duration == null || isNaN(duration)) return;
          // If multiple files are selected, show the best observed lap time for each lap number.
          if (!lapDurations.has(lap) || duration < lapDurations.get(lap)) {
            lapDurations.set(lap, duration);
          }
        });
      }
    });
    const laps = Array.from(lapSet).sort((a,b)=>a-b);
    if (laps.length === 0) { container.innerHTML = ''; return; }

    function formatLapTime(seconds) {
      if (seconds == null || !isFinite(seconds)) return '--:--.---';
      const totalMs = Math.max(0, Math.round(seconds * 1000));
      const mins = Math.floor(totalMs / 60000);
      const secs = Math.floor((totalMs % 60000) / 1000);
      const ms = totalMs % 1000;
      return `${mins}:${String(secs).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
    }

    // render per-file headings with laps grouped under each file
    const sel2 = getSelectedFiles();
    const html = ['<strong>Laps:</strong>'];
    sel2.forEach(log => {
      const fileLaps = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      if (fileLaps.length === 0) return;
      html.push(
        `<div class="file-lap-group">` +
        `<div class="file-lap-heading">` +
        `<span class="file-lap-heading-name">${escapeHtml(log.name)}</span>` +
        `<span class="file-lap-select-actions">` +
        `<button type="button" class="lap-select-all-btn" data-lap-select-all="${log.id}">All</button>` +
        `<button type="button" class="lap-select-none-btn" data-lap-select-none="${log.id}">None</button>` +
        `</span>` +
        `</div><div class="laps-col">`
      );
      const negativeDistLaps = getLapsWithNegativeDistance(log.meta);
      const inOutLapNums = getInOutLapNumbers(fileLaps);
      // Only the single fastest eligible lap (excluding in/out laps and any lap with
      // negative distance, e.g. a pit-lane pass) is checked by default -- everything else
      // starts unchecked, so a freshly-loaded file opens on just its best representative
      // lap instead of every lap at once. Falls back to the first eligible lap if none
      // have a usable duration, so something is still shown by default when possible.
      let defaultCheckedLap = null;
      let fastestDuration = Infinity;
      fileLaps.forEach((n) => {
        if (inOutLapNums.has(n) || negativeDistLaps.has(n)) return;
        const dur = getLapDuration(log.meta, n);
        if (Number.isFinite(dur) && dur < fastestDuration) {
          fastestDuration = dur;
          defaultCheckedLap = n;
        } else if (defaultCheckedLap === null) {
          defaultCheckedLap = n;
        }
      });
      fileLaps.forEach((n) => {
        const color = getLapColor(log.id, n);
        const dur = getLapDuration(log.meta, n);
        const lapLabel = `${n} - ${formatLapTime(dur)}`;
        const hasNegativeDistance = negativeDistLaps.has(n);
        const checkedAttr = (n === defaultCheckedLap) ? ' checked' : '';
        const warningBadge = hasNegativeDistance
          ? ` <span class="lap-warning" title="Contains negative lap distance (e.g. a pit-lane pass) -- unchecked by default">⚠</span>`
          : '';
        html.push(
          `<div class="lap-item" data-id="${log.id}" data-lap="${n}">` +
          `<label class="lap-toggle"><input type="checkbox" data-id="${log.id}" data-lap="${n}"${checkedAttr} style="accent-color:${color};" /> <span class="lap-label" style="color:${color}">${lapLabel}</span>${warningBadge}</label>` +
          `<input type="color" class="lap-color-input" data-id="${log.id}" data-lap="${n}" value="${color}" aria-label="Color for lap ${n} (${escapeHtml(log.name)})" />` +
          `</div>`
        );
      });
      html.push('</div></div>');
    });
    container.innerHTML = html.join('');
  }

  function getSelectedLaps() {
    // Returns Map<fileId, Set<lapNum>> so per-file lap visibility is independent.
    const checks = document.querySelectorAll('#lapsList input[type=checkbox]');
    const result = new Map();
    checks.forEach(ch => {
      if (!ch.checked) return;
      const fileId = ch.getAttribute('data-id');
      const lap = Number(ch.getAttribute('data-lap'));
      if (!result.has(fileId)) result.set(fileId, new Set());
      result.get(fileId).add(lap);
    });
    // isLapSelected's "nothing rendered yet, don't filter" fallback needs to tell an empty
    // Map apart from "the lap list hasn't rendered any checkboxes at all" -- an empty Map
    // alone is ambiguous between those two (e.g. the user deliberately unchecked every lap
    // via the per-file "None" button, which must still filter everything out).
    result.hadAnyCheckboxes = checks.length > 0;
    return result;
  }

  function isLapSelected(selectedLaps, fileId, lap) {
    if (!selectedLaps.hadAnyCheckboxes) return true; // lap list not rendered yet -- nothing filtered
    const fileLaps = selectedLaps.get(fileId);
    return fileLaps ? fileLaps.has(lap) : false;
  }

  function getSelectedFiles() {
    const checks = filesList.querySelectorAll('input[type=checkbox]');
    const ids = [];
    checks.forEach(ch => { if (ch.checked) ids.push(ch.dataset.id); });
    return logs.filter(l => ids.includes(l.id));
  }

  function getSelectedY() {
    return Array.from(ySelect.selectedOptions).map(o=>o.value);
  }

  function getChannelLabel(channel) {
    const unit = getUnitForChannel(channel);
    return (unit != null && unit !== '') ? `${channel} [${unit}]` : channel;
  }

  // Builds the "Axis:" radio row for one channel's entry in the selected-channels list,
  // letting the user pin it to an existing y-axis (or its own new one) instead of the
  // default of auto-grouping by unit. Only meaningful with 2+ channels selected -- with
  // just one there's nothing to line it up against, so the caller skips this entirely.
  function buildAxisPickerRow(channel, groups, channelToRef) {
    const row = document.createElement('div');
    row.className = 'selected-y-axis-row';
    const rowLabel = document.createElement('span');
    rowLabel.className = 'selected-y-axis-label';
    rowLabel.textContent = 'Axis:';
    row.appendChild(rowLabel);

    const override = manualAxisOverrides.get(channel);
    const myAxisRef = channelToRef.get(channel);
    const myGroup = groups.find((g) => g.axisRef === myAxisRef);
    let selectedValue = 'auto';
    if (override && override.type === 'own' && myGroup && myGroup.channels.length === 1 && myGroup.channels[0] === channel) {
      selectedValue = 'own';
    } else if (override && override.type === 'peer' && myGroup) {
      selectedValue = `peer:${myGroup.channels[0]}`;
    }

    const addOption = (value, text, title) => {
      const optLabel = document.createElement('label');
      if (title) optLabel.title = title;
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `selected-y-axis-${channel}`;
      radio.value = value;
      radio.checked = value === selectedValue;
      radio.setAttribute('data-axis-picker', channel);
      const optText = document.createElement('span');
      optText.textContent = text;
      optLabel.appendChild(radio);
      optLabel.appendChild(optText);
      row.appendChild(optLabel);
    };

    addOption('auto', 'Auto', 'Group onto an axis automatically, by unit');
    groups.forEach((group, idx) => {
      const repChannel = group.channels[0];
      const titleText = group.unit ? `${group.channels.join(' / ')} [${group.unit}]` : group.channels.join(' / ');
      addOption(`peer:${repChannel}`, `Y${idx + 1}`, `Plot on the same axis as ${titleText}`);
    });
    addOption('own', '+', 'Give this channel its own new axis');
    return row;
  }

  function renderSelectedChannelColorControls() {
    if (!selectedYColors) return;
    renderQuickModSection();
    const selectedChannels = getSelectedY();
    syncSelectedChannelColors(selectedChannels);
    selectedYColors.innerHTML = '';
    const { groups: axisGroups, channelToRef: axisChannelToRef } = groupChannelsByAxis(selectedChannels);
    selectedChannels.forEach((channel) => {
      const color = getChannelColor(channel);
      const item = document.createElement('div');
      item.className = 'selected-y-color-item';
      const input = document.createElement('input');
      input.type = 'color';
      input.value = color;
      input.setAttribute('data-channel', channel);
      input.setAttribute('aria-label', `Color for ${getChannelLabel(channel)}`);
      const text = document.createElement('span');
      text.textContent = getChannelLabel(channel);
      text.style.color = color;
      const actions = document.createElement('div');
      actions.className = 'selected-y-channel-actions';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'selected-y-action-btn quick-mod-edit-btn';
      editBtn.textContent = '✎';
      editBtn.setAttribute('data-quick-mod-edit', channel);
      editBtn.setAttribute('aria-label', `Quick modify ${getChannelLabel(channel)}`);
      editBtn.setAttribute('title', `Quick modify ${getChannelLabel(channel)}`);
      const editActive = quickModEditorOpen && quickModState.channel === channel;
      editBtn.setAttribute('aria-pressed', editActive ? 'true' : 'false');
      if (editActive) editBtn.classList.add('is-active');

      const originalVisible = !shouldHideOriginalQuickModChannel(channel, selectedChannels);
      const previewActive = quickModState.channel === channel && !!quickModPreviewName && hasQuickModActive();
      const visibilityBtn = document.createElement('button');
      visibilityBtn.type = 'button';
      visibilityBtn.className = 'selected-y-action-btn quick-mod-visibility-btn';
      visibilityBtn.textContent = originalVisible ? '👁' : '🚫';
      visibilityBtn.setAttribute('data-quick-mod-visibility', channel);
      visibilityBtn.setAttribute('aria-label', originalVisible ? `Hide original ${getChannelLabel(channel)}` : `Show original ${getChannelLabel(channel)}`);
      visibilityBtn.setAttribute('title', originalVisible ? `Hide original ${getChannelLabel(channel)}` : `Show original ${getChannelLabel(channel)}`);
      visibilityBtn.disabled = !previewActive;

      item.appendChild(input);
      item.appendChild(text);
      actions.appendChild(editBtn);
      actions.appendChild(visibilityBtn);
      item.appendChild(actions);
      if (selectedChannels.length > 1) {
        item.appendChild(buildAxisPickerRow(channel, axisGroups, axisChannelToRef));
      }
      selectedYColors.appendChild(item);
    });
  }

  // Resolve a Y channel value (which may be a CHANNEL_MAP displayName) to
  // the actual column name present in the given log, based on its file format.
  function resolveChannelForLog(yValue, log) {
    const mapping = getChannelMap().find(m => m.displayName === yValue);
    if (!mapping) return yValue; // raw column name, use as-is
    const LP = window.LogFileProcessors;
    const fmt = (log.meta && log.meta.format) ? log.meta.format : '';
    if (LP && LP.isGPBikesFormat(fmt)) return mapping.piboso;
    if (LP && LP.isAiMFormat(fmt)) return mapping.aim;
    if (LP && LP.isMoTeCFormat(fmt)) return mapping.motec || mapping.displayName || mapping.piboso;
    // Standard/unknown: fall back to displayName then piboso
    return mapping.displayName || mapping.piboso;
  }

  const CURVATURE_FROM_LATACC_MIN_SPEED_MPS = 2; // guards the |a_lat|/v^2 blowup as v -> 0 (parked/pit-lane rows)

  // Adds a general "Curvature" channel to any log that has a resolvable Radius column
  // (Curvature = 1/Radius), so it can be plotted like any other channel, plus a
  // precomputed "Curvature (Smoothed 35m)" channel using the same forward/backward
  // windowed-average technique (and the same 35m half-window) the whole-circuit
  // racing-line fit uses internally to find each corner's apex -- so that exact signal
  // is directly plottable rather than only reproducible by hand via Quick Modify.
  //
  // Falls back to deriving curvature from logged LatAcc/Speed (curvature = |a_lat| / v^2,
  // the standard circular-motion identity: radius = v^2 / a_lat) when no native Radius
  // channel is present -- e.g. some GP Bikes exports omit it. This gives a raw-data
  // curvature signal that can be directly compared against a fitted racing line's own
  // (spline-derived) Curvature channel, which otherwise has nothing logged to check
  // against. LatAcc/Speed are assumed to be in this app's standard vendor units for a
  // mapped channel (g, km/h) -- the same assumption every other calc channel here makes.
  function addCurvatureChannel(data, cols, meta) {
    if (!Array.isArray(data) || !Array.isArray(cols) || !meta) return;
    const mappingContext = { meta };
    const radiusCol = resolveChannelForLog('Radius', mappingContext);
    const hasRadius = !!radiusCol && cols.includes(radiusCol);

    const latAccCol = resolveChannelForLog(COMMON_LAT_ACC_CHANNEL, mappingContext);
    const speedCol = resolveChannelForLog('Speed', mappingContext);
    const hasLatAccSpeed = !hasRadius && latAccCol && cols.includes(latAccCol) && speedCol && cols.includes(speedCol);

    if (!hasRadius && !hasLatAccSpeed) return;
    if (!cols.includes('Curvature')) cols.push('Curvature');

    if (hasRadius) {
      data.forEach((row) => {
        const radius = Number(row[radiusCol]);
        row['Curvature'] = (Number.isFinite(radius) && radius > 0) ? (1 / radius) : null;
      });
    } else {
      data.forEach((row) => {
        const latAccG = Number(row[latAccCol]);
        const speedKmh = Number(row[speedCol]);
        const speedMps = speedKmh / 3.6;
        row['Curvature'] = (Number.isFinite(latAccG) && Number.isFinite(speedMps) && speedMps >= CURVATURE_FROM_LATACC_MIN_SPEED_MPS)
          ? Math.abs(latAccG) * 9.81 / (speedMps * speedMps)
          : null;
      });
    }
    if (!meta.units || typeof meta.units !== 'object') meta.units = {};
    meta.units['Curvature'] = '1/m';

    if (Array.isArray(meta.lapNum) && Array.isArray(meta.lapRelDist) && meta.lapNum.length === data.length) {
      if (!cols.includes(CURVATURE_SMOOTHED_CHANNEL)) cols.push(CURVATURE_SMOOTHED_CHANNEL);
      const smoothedArr = new Array(data.length).fill(null);
      const lapGroups = new Map();
      meta.lapNum.forEach((lapN, i) => {
        if (!lapGroups.has(lapN)) lapGroups.set(lapN, []);
        lapGroups.get(lapN).push(i);
      });
      // Smooth per-lap: lapRelDist resets to 0 at each lap boundary, so smoothing
      // across the full row array would blend unrelated laps at similar in-lap distances.
      lapGroups.forEach((rowIndices) => {
        const curvatureSub = rowIndices.map((i) => data[i]['Curvature']);
        const distSub = rowIndices.map((i) => Number(meta.lapRelDist[i]));
        const smoothedSub = computeWindowedAverage(curvatureSub, distSub, CURVATURE_SMOOTH_HALF_WINDOW_M);
        rowIndices.forEach((i, idx) => { smoothedArr[i] = smoothedSub[idx]; });
      });
      data.forEach((row, i) => { row[CURVATURE_SMOOTHED_CHANNEL] = smoothedArr[i]; });
      meta.units[CURVATURE_SMOOTHED_CHANNEL] = '1/m';
    }
  }

  function addGpsDerivedDynamicsChannels(data, cols, meta) {
    if (!Array.isArray(data) || !Array.isArray(cols) || !meta) return;
    if (!cols.includes(DERIVED_MAP_X_COL) || !cols.includes(DERIVED_MAP_Y_COL)) return;

    const mappingContext = { meta };
    const useIsoVehicleLatAxis = meta && meta.format === 'Garmin TCX';
    const speedCol = resolveChannelForLog('Speed', mappingContext);
    const timeCol = meta.timeCol;
    const speedUnit = meta.units && speedCol ? (meta.units[speedCol] || '') : '';
    const calc = getRacingLineCalculationsApi();

    const signedCurvatureFromPoints = (prev, curr, next) => {
      if (!prev || !curr || !next) return null;
      const a = Math.hypot(curr.x - prev.x, curr.y - prev.y);
      const b = Math.hypot(next.x - curr.x, next.y - curr.y);
      const c = Math.hypot(next.x - prev.x, next.y - prev.y);
      if (!(a > 1e-6 && b > 1e-6 && c > 1e-6)) return null;
      const twiceArea = (curr.x - prev.x) * (next.y - prev.y) - (curr.y - prev.y) * (next.x - prev.x);
      const curvature = twiceArea / (a * b * c);
      return Number.isFinite(curvature) ? curvature : null;
    };

    // Garmin TCX gets a whole-lap periodic spline fit first, then we sample that smooth
    // curve for curvature so the result is driven by the lap as a whole rather than raw
    // neighboring points. If the fit cannot be built, we fall back to the local estimate.
    const buildWholeLapCurvatureValues = () => {
      if (!calc || meta.format !== 'Garmin TCX') return null;
      if (typeof calc.buildWholeCircuitFit !== 'function' || typeof calc.evalPeriodicBSpline !== 'function') return null;
      if (!Array.isArray(meta.lapNum) || !Array.isArray(meta.lapRelDist) || meta.lapNum.length !== data.length) return null;

      const mapSource = getMapSourceForLog({ data, cols, meta });
      if (!mapSource || typeof mapSource.xAt !== 'function' || typeof mapSource.yAt !== 'function') return null;

      const lapGroups = new Map();
      for (let i = 0; i < data.length; i++) {
        const lap = Number(meta.lapNum[i]);
        const dist = Number(meta.lapRelDist[i]);
        const x = Number(mapSource.xAt(i));
        const y = Number(mapSource.yAt(i));
        if (!Number.isFinite(lap) || !Number.isFinite(dist) || !Number.isFinite(x) || !Number.isFinite(y)) continue;
        if (!lapGroups.has(lap)) lapGroups.set(lap, []);
        lapGroups.get(lap).push({ index: i, dist });
      }
      if (lapGroups.size === 0) return null;

      const fitWeights = { alpha: RACING_LINE_DEFAULT_WEIGHTS.alpha, beta: RACING_LINE_DEFAULT_WEIGHTS.beta };
      const fitOptions = {};
      const deps = { getMapSourceForLog };
      const constants = { defaultWeights: RACING_LINE_DEFAULT_WEIGHTS };
      const values = new Array(data.length).fill(null);

      lapGroups.forEach((rows, lap) => {
        if (rows.length < 20) return;
        const fit = calc.buildWholeCircuitFit({ data, cols, meta }, lap, fitWeights, fitOptions, deps, constants);
        if (!fit || !fit.control || !Number.isFinite(fit.control.period)) return;

        const period = fit.control.period;
        const delta = Math.max(1, Math.min(3, period / Math.max(200, rows.length)));
        rows.forEach(({ index, dist }) => {
          const prev = calc.evalPeriodicBSpline(fit.control, dist - delta);
          const curr = calc.evalPeriodicBSpline(fit.control, dist);
          const next = calc.evalPeriodicBSpline(fit.control, dist + delta);
          const curvature = signedCurvatureFromPoints(prev, curr, next);
          if (Number.isFinite(curvature)) values[index] = curvature;
        });
      });

      return values.some(Number.isFinite) ? values : null;
    };

    const toMps = (speedVal) => {
      const v = Number(speedVal);
      if (!Number.isFinite(v)) return null;
      const unit = String(speedUnit || '').toLowerCase();
      if (unit.includes('km/h') || unit === 'kph') return v / 3.6;
      if (unit.includes('mph')) return v * 0.44704;
      if (unit.includes('m/s') || unit.includes('mps')) return v;
      // Default to m/s for unknown speed units.
      return v;
    };

    const curvatureVals = new Array(data.length).fill(null);
    const latAccVals = new Array(data.length).fill(null);
    const longAccVals = new Array(data.length).fill(null);

    const wholeLapCurvatureVals = buildWholeLapCurvatureValues();
    if (wholeLapCurvatureVals) {
      for (let i = 0; i < curvatureVals.length; i++) {
        if (Number.isFinite(wholeLapCurvatureVals[i])) curvatureVals[i] = wholeLapCurvatureVals[i];
      }
    }

    for (let i = 1; i < data.length - 1; i++) {
      if (Number.isFinite(curvatureVals[i])) continue;
      const x0 = Number(data[i - 1][DERIVED_MAP_X_COL]);
      const y0 = Number(data[i - 1][DERIVED_MAP_Y_COL]);
      const x1 = Number(data[i][DERIVED_MAP_X_COL]);
      const y1 = Number(data[i][DERIVED_MAP_Y_COL]);
      const x2 = Number(data[i + 1][DERIVED_MAP_X_COL]);
      const y2 = Number(data[i + 1][DERIVED_MAP_Y_COL]);
      if (![x0, y0, x1, y1, x2, y2].every(Number.isFinite)) continue;

      const a = Math.hypot(x1 - x0, y1 - y0);
      const b = Math.hypot(x2 - x1, y2 - y1);
      const c = Math.hypot(x2 - x0, y2 - y0);
      if (!(a > 1e-6 && b > 1e-6 && c > 1e-6)) continue;
      const twiceArea = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
      const curvature = twiceArea / (a * b * c);
      curvatureVals[i] = Number.isFinite(curvature) ? curvature : null;
    }

    if (data.length > 1) {
      if (!Number.isFinite(curvatureVals[0])) curvatureVals[0] = curvatureVals[1];
      if (!Number.isFinite(curvatureVals[data.length - 1])) curvatureVals[data.length - 1] = curvatureVals[data.length - 2];
    }

    if (speedCol && cols.includes(speedCol)) {
      for (let i = 0; i < data.length; i++) {
        const vMps = toMps(data[i][speedCol]);
        const k = curvatureVals[i];
        if (!Number.isFinite(vMps) || !Number.isFinite(k)) continue;
        const latAcc = (vMps * vMps * k) / 9.81;
        // ISO vehicle axis uses +Y to the left. For Garmin-derived GPS dynamics,
        // enforce that convention explicitly (left turn = positive lateral accel).
        latAccVals[i] = useIsoVehicleLatAxis ? -latAcc : latAcc;
      }
    }

    if (speedCol && cols.includes(speedCol) && timeCol && cols.includes(timeCol)) {
      for (let i = 1; i < data.length - 1; i++) {
        const tPrev = parseTimeLikeSeconds(data[i - 1][timeCol], meta.units ? (meta.units[timeCol] || '') : '');
        const tNext = parseTimeLikeSeconds(data[i + 1][timeCol], meta.units ? (meta.units[timeCol] || '') : '');
        const vPrev = toMps(data[i - 1][speedCol]);
        const vNext = toMps(data[i + 1][speedCol]);
        if (![tPrev, tNext, vPrev, vNext].every(Number.isFinite)) continue;
        const dt = tNext - tPrev;
        if (!(dt > 1e-6)) continue;
        longAccVals[i] = ((vNext - vPrev) / dt) / 9.81;
      }
      if (data.length > 1) {
        longAccVals[0] = longAccVals[1];
        longAccVals[data.length - 1] = longAccVals[data.length - 2];
      }
    }

    const hasCurvature = cols.includes('Curvature') && data.some((row) => Number.isFinite(Number(row['Curvature'])));
    const hasLatAcc = cols.includes(COMMON_LAT_ACC_CHANNEL) && data.some((row) => Number.isFinite(Number(row[COMMON_LAT_ACC_CHANNEL])));
    const hasLongAcc = cols.includes(COMMON_LONG_ACC_CHANNEL) && data.some((row) => Number.isFinite(Number(row[COMMON_LONG_ACC_CHANNEL])));

    if (!hasCurvature && curvatureVals.some(Number.isFinite)) {
      if (!cols.includes('Curvature')) cols.push('Curvature');
      data.forEach((row, i) => { row['Curvature'] = Number.isFinite(curvatureVals[i]) ? curvatureVals[i] : null; });
      if (!meta.units || typeof meta.units !== 'object') meta.units = {};
      meta.units['Curvature'] = '1/m';
    }

    if (!hasLatAcc && latAccVals.some(Number.isFinite)) {
      if (!cols.includes(COMMON_LAT_ACC_CHANNEL)) cols.push(COMMON_LAT_ACC_CHANNEL);
      data.forEach((row, i) => { row[COMMON_LAT_ACC_CHANNEL] = Number.isFinite(latAccVals[i]) ? latAccVals[i] : null; });
      if (!meta.units || typeof meta.units !== 'object') meta.units = {};
      meta.units[COMMON_LAT_ACC_CHANNEL] = 'g';
      if (useIsoVehicleLatAxis) {
        meta.latAccPositiveDirection = 'left';
      }
    }

    if (!hasLongAcc && longAccVals.some(Number.isFinite)) {
      if (!cols.includes(COMMON_LONG_ACC_CHANNEL)) cols.push(COMMON_LONG_ACC_CHANNEL);
      data.forEach((row, i) => { row[COMMON_LONG_ACC_CHANNEL] = Number.isFinite(longAccVals[i]) ? longAccVals[i] : null; });
      if (!meta.units || typeof meta.units !== 'object') meta.units = {};
      meta.units[COMMON_LONG_ACC_CHANNEL] = 'g';
    }
  }

  function addCalculatedCommonChannels(data, cols, meta) {
    if (!Array.isArray(data) || !Array.isArray(cols) || !meta) return;

    const mappingContext = { meta };
    const latAccCol = resolveChannelForLog(COMMON_LAT_ACC_CHANNEL, mappingContext);
    const longAccCol = resolveChannelForLog(COMMON_LONG_ACC_CHANNEL, mappingContext);
    if (!latAccCol) return;
    const LP = window.LogFileProcessors;

    if (longAccCol && LP && typeof LP.addTotalAccelerationCalculatedChannel === 'function') {
      LP.addTotalAccelerationCalculatedChannel({ data, cols, units: meta.units || {}, meta }, latAccCol, longAccCol);
    } else if (longAccCol && cols.includes(latAccCol) && cols.includes(longAccCol)) {
      if (!cols.includes(TOTAL_ACCEL_CALC_CHANNEL)) cols.push(TOTAL_ACCEL_CALC_CHANNEL);
      data.forEach((row) => {
        const latAcc = Number(row[latAccCol]);
        const longAcc = Number(row[longAccCol]);
        row[TOTAL_ACCEL_CALC_CHANNEL] = (Number.isFinite(latAcc) && Number.isFinite(longAcc))
          ? Math.sqrt((latAcc * latAcc) + (longAcc * longAcc))
          : null;
      });
      if (!meta.units || typeof meta.units !== 'object') meta.units = {};
      meta.units[TOTAL_ACCEL_CALC_CHANNEL] = 'g';
    }

    if (!cols.includes(latAccCol)) return;

    const halfWindowSec = Math.max(0, Number(TURN_CLASSIFICATION_CENTER_WINDOW_SEC) / 2);
    const thresholdG = Math.max(0, Number(TURN_CLASSIFICATION_THRESHOLD_G));
    const timeCol = meta.timeCol;
    const hasFiniteTime = timeCol && data.some((row) => Number.isFinite(Number(row[timeCol])));
    const latValues = data.map((row) => Number(row && row[latAccCol]));
    const timeValues = hasFiniteTime ? data.map((row) => Number(row && row[timeCol])) : null;
    let isMonotonicTime = true;
    if (timeValues) {
      for (let i = 1; i < timeValues.length; i++) {
        if (!Number.isFinite(timeValues[i - 1]) || !Number.isFinite(timeValues[i])) continue;
        if (timeValues[i] < timeValues[i - 1]) {
          isMonotonicTime = false;
          break;
        }
      }
    }

    const getFilteredLatAcc = (index) => {
      const centerLat = latValues[index];
      if (!Number.isFinite(centerLat)) return null;

      if (!hasFiniteTime || halfWindowSec <= 0) {
        let weightedSum = 0;
        let weightTotal = 0;
        for (let j = Math.max(0, index - TURN_FILTER_FALLBACK_RADIUS_SAMPLES); j <= Math.min(data.length - 1, index + TURN_FILTER_FALLBACK_RADIUS_SAMPLES); j++) {
          const sample = latValues[j];
          if (!Number.isFinite(sample)) continue;
          const dist = Math.abs(j - index);
          const w = (TURN_FILTER_FALLBACK_RADIUS_SAMPLES + 1) - dist;
          if (w <= 0) continue;
          weightedSum += sample * w;
          weightTotal += w;
        }
        return weightTotal > 0 ? (weightedSum / weightTotal) : centerLat;
      }

      const centerTime = timeValues[index];
      if (!Number.isFinite(centerTime)) return centerLat;

      let weightedSum = 0;
      let weightTotal = 0;

      const accumulateSample = (j) => {
        const sample = latValues[j];
        const tj = timeValues[j];
        if (!Number.isFinite(sample) || !Number.isFinite(tj)) return false;
        const dt = Math.abs(tj - centerTime);
        if (dt > halfWindowSec) return true;
        const w = 1 - (dt / halfWindowSec);
        if (w <= 0) return false;
        weightedSum += sample * w;
        weightTotal += w;
        return false;
      };

      if (isMonotonicTime) {
        accumulateSample(index);

        for (let j = index - 1; j >= 0; j--) {
          if (accumulateSample(j)) break;
        }

        for (let j = index + 1; j < data.length; j++) {
          if (accumulateSample(j)) break;
        }
      } else {
        for (let j = 0; j < data.length; j++) {
          const sample = latValues[j];
          const tj = timeValues[j];
          if (!Number.isFinite(sample) || !Number.isFinite(tj)) continue;
          const dt = Math.abs(tj - centerTime);
          if (dt > halfWindowSec) continue;
          const w = 1 - (dt / halfWindowSec);
          if (w <= 0) continue;
          weightedSum += sample * w;
          weightTotal += w;
        }
      }

      return weightTotal > 0 ? (weightedSum / weightTotal) : centerLat;
    };

    // Debounces the raw on/off turn signal so a state change only "sticks" once it has held
    // continuously for at least minSustainedSec; a flip that reverts before then is ignored,
    // which both drops brief blips and bridges brief dropouts within an ongoing turn.
    const applyMinSustainedTurnState = (rawStates, canUseTime, minSustainedSec) => {
      const n = rawStates.length;
      const result = new Array(n);
      if (n === 0) return result;
      if (!canUseTime || !(minSustainedSec > 0)) {
        for (let i = 0; i < n; i++) result[i] = rawStates[i];
        return result;
      }

      let stableState = rawStates[0];
      let i = 0;
      while (i < n) {
        const segValue = rawStates[i];
        let j = i;
        while (j + 1 < n && rawStates[j + 1] === segValue) j++;

        if (segValue !== stableState) {
          const segStartTime = timeValues[i];
          const segEndTime = (j + 1 < n) ? timeValues[j + 1] : timeValues[j];
          const duration = (Number.isFinite(segStartTime) && Number.isFinite(segEndTime))
            ? (segEndTime - segStartTime)
            : 0;
          if (duration >= minSustainedSec) stableState = segValue;
        }
        for (let k = i; k <= j; k++) result[k] = stableState;

        i = j + 1;
      }

      return result;
    };

    if (!cols.includes(TURN_LATACC_CENTER_AVG_CALC_CHANNEL)) cols.push(TURN_LATACC_CENTER_AVG_CALC_CHANNEL);
    if (!cols.includes(TURN_STATE_CALC_CHANNEL)) cols.push(TURN_STATE_CALC_CHANNEL);
    if (!cols.includes(TURN_DIRECTION_SIGNED_CALC_CHANNEL)) cols.push(TURN_DIRECTION_SIGNED_CALC_CHANNEL);

    const minSustainedSec = Math.max(0, Number(TURN_MIN_SUSTAINED_SEC));
    const filteredLatAccValues = data.map((row, index) => getFilteredLatAcc(index));
    const rawTurnStates = filteredLatAccValues.map((filteredLatAcc) => (
      Number.isFinite(filteredLatAcc) && Math.abs(filteredLatAcc) >= thresholdG
    ));
    const stableTurnStates = applyMinSustainedTurnState(
      rawTurnStates,
      hasFiniteTime && isMonotonicTime,
      minSustainedSec
    );

    data.forEach((row, index) => {
      const filteredLatAcc = filteredLatAccValues[index];
      row[TURN_LATACC_CENTER_AVG_CALC_CHANNEL] = Number.isFinite(filteredLatAcc) ? filteredLatAcc : null;
      if (!Number.isFinite(filteredLatAcc)) {
        row[TURN_STATE_CALC_CHANNEL] = 0;
        row[TURN_DIRECTION_SIGNED_CALC_CHANNEL] = 0;
        return;
      }

      const isTurning = stableTurnStates[index];
      row[TURN_STATE_CALC_CHANNEL] = isTurning ? 1 : 0;
      row[TURN_DIRECTION_SIGNED_CALC_CHANNEL] = isTurning ? (filteredLatAcc >= 0 ? 1 : -1) : 0;
    });

    if (!meta.units || typeof meta.units !== 'object') meta.units = {};
    meta.units[TURN_LATACC_CENTER_AVG_CALC_CHANNEL] = 'g';
    meta.units[TURN_STATE_CALC_CHANNEL] = '';
    meta.units[TURN_DIRECTION_SIGNED_CALC_CHANNEL] = '';
  }

  // Walks one lap's Turn State/Direction (calc) channels in distance order and collapses
  // consecutive rows into straight/left/right segments. Corners are treated as a track
  // property, so this runs once against a single reference lap rather than per displayed lap.
  function computeCornerSegments(log, lap, swapLeftRight) {
    if (!log || !log.meta || !Array.isArray(log.meta.lapNum) || !Array.isArray(log.meta.lapRelDist)) return null;
    if (!Array.isArray(log.cols) || !log.cols.includes(TURN_STATE_CALC_CHANNEL) || !log.cols.includes(TURN_DIRECTION_SIGNED_CALC_CHANNEL)) return null;

    const maskIdx = log.meta.lapNum.map((n, i) => n === lap ? i : -1).filter(i => i >= 0);
    if (maskIdx.length < 2) return null;

    const rows = maskIdx
      .map(i => ({
        dist: Number(log.meta.lapRelDist[i]),
        isTurning: Number(log.data[i][TURN_STATE_CALC_CHANNEL]) === 1,
        dirSign: Number(log.data[i][TURN_DIRECTION_SIGNED_CALC_CHANNEL]) || 0
      }))
      .filter(r => Number.isFinite(r.dist))
      .sort((a, b) => a.dist - b.dist);
    if (rows.length < 2) return null;

    const positiveMeansRight = !log.meta || log.meta.latAccPositiveDirection !== 'left';
    const typeForRow = (r) => {
      if (!r.isTurning || r.dirSign === 0) return 'straight';
      const isRightBySign = positiveMeansRight ? (r.dirSign > 0) : (r.dirSign < 0);
      const isRight = swapLeftRight ? !isRightBySign : isRightBySign;
      return isRight ? 'right' : 'left';
    };

    const segments = [];
    let segType = typeForRow(rows[0]);
    let segStart = rows[0].dist;
    for (let i = 1; i < rows.length; i++) {
      const t = typeForRow(rows[i]);
      if (t !== segType) {
        segments.push({ startDist: segStart, endDist: rows[i].dist, type: segType });
        segType = t;
        segStart = rows[i].dist;
      }
    }
    segments.push({ startDist: segStart, endDist: rows[rows.length - 1].dist, type: segType });
    renumberCornerSegments(segments);

    return { segments, trackLength: rows[rows.length - 1].dist };
  }

  // Assigns sequential corner/straight numbers to a segments array (mutates in place,
  // matching the numbering computeCornerSegments produces) and returns it.
  function renumberCornerSegments(segments) {
    let cornerNum = 0;
    let straightNum = 0;
    segments.forEach(seg => {
      if (seg.type === 'left' || seg.type === 'right') {
        cornerNum += 1;
        seg.number = cornerNum;
        delete seg.straightNumber;
      } else {
        straightNum += 1;
        seg.straightNumber = straightNum;
        delete seg.number;
      }
    });
    return segments;
  }

  // Wraps a raw {type,startDist,endDist,label?,nickname?}[] (e.g. from manual corner
  // edits) into the same {segments, trackLength} shape computeCornerSegments returns,
  // with default sequential numbers assigned (label/nickname, if set, override the
  // default number for display -- see cornerSegmentDisplayNumber()).
  function buildCornerDataFromSegments(segments, trackLength) {
    const cloned = segments.map(s => ({
      type: s.type, startDist: s.startDist, endDist: s.endDist,
      label: s.label || '', nickname: s.nickname || ''
    }));
    renumberCornerSegments(cloned);
    return { segments: cloned, trackLength };
  }

  // Clips a saved override's segments to the live reference lap's trackLength (and
  // stretches the last segment to reach it), so small lap-to-lap distance variation
  // doesn't leave a gap or overhang at the end of the corner strip.
  function clampSegmentsToTrackLength(segments, trackLength) {
    if (!Array.isArray(segments) || segments.length === 0 || !Number.isFinite(trackLength) || trackLength <= 0) {
      return [];
    }
    const clipped = [];
    segments.forEach(seg => {
      const start = Math.max(0, Number(seg.startDist));
      const end = Math.min(trackLength, Number(seg.endDist));
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;
      clipped.push({ type: seg.type, startDist: start, endDist: end, label: seg.label || '', nickname: seg.nickname || '' });
    });
    if (clipped.length === 0) return [];
    clipped[0].startDist = 0;
    clipped[clipped.length - 1].endDist = trackLength;
    return clipped;
  }

  // The number/id shown for a segment: the user's manual renumber ("label"), if set,
  // otherwise the auto-assigned sequential default (per-type via renumberCornerSegments).
  function cornerSegmentDisplayNumber(seg) {
    const custom = seg.label != null ? String(seg.label).trim() : '';
    if (custom !== '') return custom;
    return String(seg.type === 'straight' ? seg.straightNumber : seg.number);
  }

  // Extracts the leading integer from a number/label like "6" or "6a" -> 6, or null if
  // it doesn't start with a digit (used to compute a renumber cascade's shift amount).
  function parseLeadingSegmentNumber(value) {
    const match = /^(\d+)/.exec(String(value == null ? '' : value).trim());
    return match ? parseInt(match[1], 10) : null;
  }

  // Compact "T3"/"S2" form used in the narrow corner strip on the main plot.
  function formatCornerSegmentShortLabel(seg) {
    return (seg.type === 'straight' ? 'S' : 'T') + cornerSegmentDisplayNumber(seg);
  }

  // Fuller "T3 (Left)"/"S2" form used in the corner editor list.
  function formatCornerSegmentFullLabel(seg) {
    const num = cornerSegmentDisplayNumber(seg);
    if (seg.type === 'straight') return `S${num}`;
    return `T${num} (${CORNER_TYPE_LABELS[seg.type]})`;
  }

  function getRacingLineCalculationsApi() {
    return (typeof window !== 'undefined' && window.RacingLineCalculations)
      ? window.RacingLineCalculations
      : null;
  }

  // Builds a synthetic single-lap "log" from a whole-circuit fit so it can flow through
  // all the existing files-list / laps-list / map / Y-channel machinery unchanged. The
  // racing line's own Curvature/Radius are sampled directly (analytically) from the
  // fitted spline -- not smoothed -- per the "don't smooth the race line's curvature
  // when plotting" requirement; only the *fitting* step used smoothed curvature.
  function buildRacingLineSyntheticLog(preview) {
    const calc = getRacingLineCalculationsApi();
    const { fit, referenceLog, referenceLap } = preview;
    const sampled = fit.sampled;
    const n = sampled.length;
    const data = new Array(n);
    const lapNum = new Array(n).fill(1);
    const lapTime = new Array(n);
    const lapRelDist = new Array(n);

    for (let i = 0; i < n; i++) {
      const pt = sampled[i];
      const radius = calc.computePeriodicBSplineRadiusAtT(fit.control, pt.dist);
      const curvature = (Number.isFinite(radius) && radius > 0) ? (1 / radius) : 0;
      data[i] = {
        PosX: pt.x,
        PosY: pt.y,
        Curvature: curvature,
        Radius: Number.isFinite(radius) ? radius : null,
        'Lap Time': null,
        'Lap Number': 1
      };
      lapTime[i] = null;
      lapRelDist[i] = pt.dist;
    }

    const venueSource = referenceLog ? (getLogVenue(referenceLog) || referenceLog.name) : 'Track';
    const stamp = Date.now();
    return {
      id: `racing-line-${stamp}`,
      name: `Racing Line — ${venueSource}`,
      data,
      cols: ['PosX', 'PosY', 'Curvature', 'Radius', 'Lap Time', 'Lap Number'],
      meta: {
        lapNum,
        lapTime,
        lapRelDist,
        units: { Curvature: '1/m', Radius: 'm', 'Lap Time': 's', 'Lap Number': '' },
        format: '',
        synthetic: true,
        racingLine: true,
        sourceLogId: referenceLog ? referenceLog.id : null,
        sourceLap: referenceLap,
        // Retained so a vehicle simulation can be (re-)run later against the exact
        // analytic curve, rather than re-estimating curvature from the flattened rows.
        splineControl: fit.control,
        // lapRelDist above is in the fit's own local (0..period) frame; add this back to
        // translate a sample's dist into the source log's original lapRelDist frame, e.g.
        // to look up track grade (Altitude/Slope) from the source log at that position.
        sourceBaseDist: fit.baseDist
      },
      rawRows: null
    };
  }

  // ── Simulate Vehicle: vehicle + rider selection ───────────────────────────
  // The vehicle and rider come from the same stored records the Sessions panel uses (and
  // are edited with the same popovers -- see SessionsUI.openVehicleEditor/openRiderEditor).
  // Picking them fills mass/CdA/average power below from the combined bike + rider; those
  // fields stay editable as overrides, and the vehicle's power curve + gearing feed the
  // engine-curve power model. Session-specific mass/weight overrides don't apply here --
  // there is no session in this context, so the base vehicle/rider values are used.
  const SIM_SELECTION_KEY = 'vehicleSimSelection';
  let simVehicles = [];
  let simRiders = [];
  let simListsLoaded = false;

  function loadSimSelection() {
    try {
      const saved = JSON.parse(localStorage.getItem(SIM_SELECTION_KEY) || '{}');
      return { vehicleId: saved.vehicleId || '', riderId: saved.riderId || '', vehicleClass: saved.vehicleClass === 'car' ? 'car' : 'motorcycle' };
    } catch (e) { return { vehicleId: '', riderId: '', vehicleClass: 'motorcycle' }; }
  }

  function saveSimSelection() {
    try {
      localStorage.setItem(SIM_SELECTION_KEY, JSON.stringify({
        vehicleId: vehicleSimVehicleSelect ? vehicleSimVehicleSelect.value : '',
        riderId: vehicleSimRiderSelect ? vehicleSimRiderSelect.value : '',
        vehicleClass: getSimClass()
      }));
    } catch (e) { /* storage unavailable -- selection just won't persist */ }
  }

  // Motorcycle (default) or car. Motorcycles lean, so they get the required lean angle
  // channels and the lean-adjusted rolling radius; cars get neither.
  function getSimClass() {
    const checked = vehicleSimClassRadios.find((r) => r.checked);
    return checked && checked.value === 'car' ? 'car' : 'motorcycle';
  }

  function setSimClass(value) {
    vehicleSimClassRadios.forEach((r) => { r.checked = r.value === value; });
  }

  function selectedSimVehicle() {
    const id = vehicleSimVehicleSelect ? vehicleSimVehicleSelect.value : '';
    return simVehicles.find((v) => v.id === id) || null;
  }

  function selectedSimRider() {
    const id = vehicleSimRiderSelect ? vehicleSimRiderSelect.value : '';
    return simRiders.find((r) => r.id === id) || null;
  }

  function describeSimVehicle(v) {
    const internals = window.SessionsUI && window.SessionsUI._internals;
    if (internals && typeof internals.describeVehicle === 'function') return internals.describeVehicle(v);
    return [v.make, v.model].filter(Boolean).join(' ') || v.type || 'Vehicle';
  }

  function fillSimSelect(select, records, describe, emptyLabel, selectedId) {
    select.innerHTML = '';
    const none = document.createElement('option');
    none.value = '';
    none.textContent = emptyLabel;
    select.appendChild(none);
    records.forEach((rec) => {
      const opt = document.createElement('option');
      opt.value = rec.id;
      opt.textContent = describe(rec);
      select.appendChild(opt);
    });
    select.value = records.some((r) => r.id === selectedId) ? selectedId : '';
  }

  // Generic fallbacks when no vehicle is picked -- previously the default values typed
  // into the (now removed) Simulate panel fields.
  const SIM_DEFAULT_PARAMS = { maxLatG: 1.0, maxLongG: 0.7, powerKw: 32, cda: 0.5, massKg: 235, efficiencyPct: 95 };

  // The single source of truth for the numbers a simulation run actually uses: from the
  // selected vehicle (+ rider, for mass and CdA) when one is picked, else the generic
  // defaults above. Mass and CdA used to be editable Simulate panel fields the vehicle
  // picker filled in; they're vehicle/rider properties now, so there's nothing left to
  // fill in or override here. Rider CdA is the *tucked* delta (the position held for most
  // of a lap's time, i.e. accelerating on straights); the rider's braking/cornering deltas
  // would need a per-phase drag model the point-mass sim doesn't have.
  function computeEffectiveSimParams() {
    const v = selectedSimVehicle();
    const r = selectedSimRider();
    const massKg = (v && v.mass_kg > 0)
      ? v.mass_kg + (r && r.weight_kg > 0 ? r.weight_kg : 0)
      : SIM_DEFAULT_PARAMS.massKg;
    const tucked = r && Number.isFinite(r.cda_tucked_m2) ? r.cda_tucked_m2 : 0;
    const cda = (v && v.cda_m2 > 0) ? Math.max(0.01, v.cda_m2 + tucked) : SIM_DEFAULT_PARAMS.cda;
    const powerKw = (v && v.avg_power_kw > 0) ? v.avg_power_kw : SIM_DEFAULT_PARAMS.powerKw;
    const maxLatG = (v && v.max_lat_g > 0) ? v.max_lat_g : SIM_DEFAULT_PARAMS.maxLatG;
    const maxLongG = (v && v.max_long_g > 0) ? v.max_long_g : SIM_DEFAULT_PARAMS.maxLongG;
    const effRaw = v && v.gearing && Number(v.gearing.efficiency_pct);
    const efficiencyPct = effRaw > 0 ? effRaw : SIM_DEFAULT_PARAMS.efficiencyPct;
    return { massKg, cda, powerKw, maxLatG, maxLongG, efficiencyPct };
  }

  function simTreadRadiusM(gearing) {
    if (getSimClass() !== 'motorcycle') return 0;
    const model = window.SessionsModel;
    const tire = model && gearing && gearing.tire_size ? model.parseTireSize(gearing.tire_size) : null;
    return tire ? tire.width_mm / 2000 : 0;
  }

  function getSimEngine() {
    const v = selectedSimVehicle();
    if (!v) return null;
    const effPct = computeEffectiveSimParams().efficiencyPct;
    const engine = {
      powerCurve: Array.isArray(v.power_curve) ? v.power_curve : [],
      gearing: v.gearing || {},
      efficiency: Number.isFinite(effPct) ? Math.min(1, Math.max(0.5, effPct / 100)) : 0.95
    };
    // The tread's crown radius is estimated as half the tire width, so it needs a tire size
    // (a bare circumference has no width). Motorcycles only.
    const tread = simTreadRadiusM(engine.gearing);
    if (tread) engine.treadRadiusM = tread;
    return engine;
  }

  // Typical overall wheel diameters (mm) by vehicle type, for a sanity check on the stored
  // wheel size. Only types with a narrow, well-known range are checked -- karts and
  // "other" vary too much to second-guess.
  const SIM_WHEEL_DIAMETER_RANGE_MM = { motorcycle: [400, 750], car: [500, 900] };

  // Spells out the gearing numbers actually stored for the vehicle (so a wrong one is
  // visible without opening the editor) and flags a wheel size outside the usual range
  // for that type of vehicle.
  function describeSimGearing(vehicle, gearing) {
    const model = window.SessionsModel;
    const diameterMm = model && typeof model.wheelDiameterMm === 'function'
      ? model.wheelDiameterMm(gearing)
      : (Number(gearing.wheel_circumference_m) / Math.PI) * 1000;
    const ratios = (gearing.gear_ratios || []).map(Number).filter((r) => r > 0);
    let text = `Wheel: ${gearing.tire_size ? gearing.tire_size + ', ' : ''}${Math.round(diameterMm)} mm diameter. `
      + `${ratios.length} gears, primary ${Number(gearing.primary_ratio) > 0 ? Number(gearing.primary_ratio) : 1}, `
      + `final ${Number(gearing.final_ratio)}.`
      + (Number(gearing.shift_time_ms) > 0 ? ` Shift time ${Number(gearing.shift_time_ms)} ms.` : '');
    const range = SIM_WHEEL_DIAMETER_RANGE_MM[vehicle && vehicle.type];
    if (range && (diameterMm < range[0] || diameterMm > range[1])) {
      text += ` That is an unusual wheel size for a ${vehicle.type} (expected roughly ${range[0]}-${range[1]} mm `
        + 'across) -- check the tire size.';
    }
    return text;
  }

  // One line summarizing the numbers a run will actually use -- mass, CdA, power/engine,
  // grip limits -- since there's no longer an editable field showing them directly.
  function describeEffectiveSimParams(v) {
    const p = computeEffectiveSimParams();
    const source = v ? 'from ' + describeSimVehicle(v) + (selectedSimRider() ? ' + rider' : '') : 'generic defaults (no vehicle picked)';
    return `Using ${p.massKg.toFixed(1)} kg, CdA ${p.cda.toFixed(2)} m², ${p.powerKw.toFixed(0)} kW avg, `
      + `${p.maxLatG.toFixed(2)}g lat / ${p.maxLongG.toFixed(2)}g long -- ${source}.`;
  }

  function updateSimSelectionState() {
    const v = selectedSimVehicle();
    const r = selectedSimRider();
    if (vehicleSimVehicleEditBtn) vehicleSimVehicleEditBtn.disabled = !v;
    if (vehicleSimRiderEditBtn) vehicleSimRiderEditBtn.disabled = !r;

    if (!vehicleSimVehicleHint) return;
    const calc = getRacingLineCalculationsApi();
    const wantsCurve = !vehicleSimPowerModelSelect || vehicleSimPowerModelSelect.value === 'curve';
    const paramsLine = describeEffectiveSimParams(v);
    if (!v) {
      vehicleSimVehicleHint.textContent = 'Pick a vehicle (and rider) for its own mass/CdA/power/grip and engine curve. ' + paramsLine;
    } else if (!wantsCurve) {
      vehicleSimVehicleHint.textContent = 'Average power mode: one flat power figure, faster to simulate. ' + paramsLine;
    } else {
      const problems = calc && typeof calc.describeEngineProblems === 'function'
        ? calc.describeEngineProblems(getSimEngine())
        : [];
      if (problems.length) {
        vehicleSimVehicleHint.textContent = `This vehicle is missing ${problems.join(', ')}, so average power will be used. `
          + `Use ✎ to add it. ${paramsLine}`;
      } else {
        // Showing the top-gear redline speed up front makes a wrong wheel size or ratio
        // obvious before simulating (it is the ceiling the bike can never exceed).
        const engine = getSimEngine();
        const model = calc.buildEngineModel(engine);
        const redline = model ? ` Top gear hits the redline at ${(model.maxGearSpeed * 3.6).toFixed(0)} km/h.` : '';
        const tread = simTreadRadiusM(engine.gearing);
        const leanNote = getSimClass() !== 'motorcycle' ? ''
          : (tread ? ` RPM is lean-adjusted (tread radius ${Math.round(tread * 1000)} mm).`
            : ' No tire size, so RPM is not lean-adjusted.');
        vehicleSimVehicleHint.textContent = 'Engine curve + gearing ready: the best gear is picked at every point on track. '
          + describeSimGearing(v, engine.gearing) + redline + leanNote + ' ' + paramsLine;
      }
    }
  }

  // Reloads the vehicle/rider lists from storage, keeping the current selection (or, on
  // the first load, the last one used). `prefer` selects a just-saved record.
  function refreshVehicleSimLists(prefer) {
    if (!sessionsApi || !vehicleSimVehicleSelect || !vehicleSimRiderSelect) return Promise.resolve();
    const saved = loadSimSelection();
    const wantVehicle = (prefer && prefer.vehicleId)
      || (simListsLoaded ? vehicleSimVehicleSelect.value : saved.vehicleId);
    const wantRider = (prefer && prefer.riderId)
      || (simListsLoaded ? vehicleSimRiderSelect.value : saved.riderId);
    return Promise.all([
      sessionsApi.VehicleService.listVehicles(),
      sessionsApi.RiderService.listRiders()
    ]).then(([vehicles, riders]) => {
      simVehicles = vehicles || [];
      simRiders = riders || [];
      fillSimSelect(vehicleSimVehicleSelect, simVehicles, describeSimVehicle, 'Manual (no vehicle)', wantVehicle);
      fillSimSelect(vehicleSimRiderSelect, simRiders, (r) => r.name || 'Rider', 'No rider', wantRider);
      simListsLoaded = true;
      saveSimSelection();
      updateSimSelectionState();
    }).catch(() => {});
  }

  function getVehicleSimParams() {
    const effective = computeEffectiveSimParams();
    const params = {
      maxLatG: effective.maxLatG,
      maxLongG: effective.maxLongG,
      powerKw: effective.powerKw,
      cda: effective.cda,
      massKg: effective.massKg
    };
    if (vehicleSimPowerModelSelect && vehicleSimPowerModelSelect.value === 'curve') {
      const engine = getSimEngine();
      if (engine) params.engine = engine;
    }
    const geom = getVehicleWeightTransferGeom(selectedSimVehicle(), params.massKg, selectedSimRider());
    if (geom) params.geom = geom;
    return params;
  }

  function formatSimLapTime(seconds) {
    if (!Number.isFinite(seconds)) return '--:--.---';
    const totalMs = Math.max(0, Math.round(seconds * 1000));
    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = totalMs % 1000;
    return `${mins}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }

  const GRADE_SMOOTH_HALF_WINDOW_M = 20;

  // Builds a signed slope-angle-in-degrees array parallel to `sampled` (positive =
  // uphill in the direction of increasing dist), for the vehicle simulation's grade
  // term. Prefers a logged Slope channel (e.g. AiM's "GPS Slope", already an angle)
  // over deriving it from Altitude, since differentiating raw GPS altitude is far
  // noisier than a purpose-built slope channel. Falls back to Altitude if Slope isn't
  // present, using the same "several-meter chord baseline" idea used elsewhere in this
  // app to keep a discrete estimate from a noisy sensor from swamping the real signal --
  // here via a fixed *sample* radius rather than a distance search, since log rows are
  // usually close to evenly time-spaced. Returns null if neither channel is available,
  // so the caller can fall back to a flat-track simulation.
  // A channel-map "Standard Name" only counts as available when: the map resolves it to
  // a real column name for this log's format (vendors that don't have the channel are
  // mapped to '' in channel-map.json, e.g. PiBoSo/GP Bikes has no Slope channel), that
  // column is actually present in this log's cols, AND at least one row in the lap has a
  // finite value in it -- a column can be present in the header but blank for an entire
  // session (e.g. no GPS lock). Checking only the resolved name's truthiness or only
  // cols.includes(...) would silently accept either failure mode; this is the same
  // "resolve, then verify real data backs it" rule populateYSelect uses to decide
  // whether a Standard Name is actually selectable.
  function resolveAvailableChannel(displayName, log, lapRows) {
    const col = resolveChannelForLog(displayName, log);
    if (!col || !log.cols.includes(col)) return null;
    const hasData = lapRows.some((i) => Number.isFinite(Number(log.data[i][col])));
    return hasData ? col : null;
  }

  function buildGradeDegForSampled(referenceLog, referenceLap, sourceBaseDist, sampled) {
    if (!referenceLog || !referenceLog.meta || !Array.isArray(referenceLog.meta.lapNum) || !Array.isArray(referenceLog.meta.lapRelDist)) return null;
    const meta = referenceLog.meta;
    const lapRowIndices = [];
    for (let i = 0; i < meta.lapNum.length; i++) {
      if (meta.lapNum[i] === referenceLap) lapRowIndices.push(i);
    }
    if (lapRowIndices.length < 10) return null;

    const slopeCol = resolveAvailableChannel('Slope', referenceLog, lapRowIndices);
    const altCol = slopeCol ? null : resolveAvailableChannel('Altitude', referenceLog, lapRowIndices);
    const hasSlope = !!slopeCol;
    const hasAlt = !!altCol;
    if (!hasSlope && !hasAlt) return null;

    const rows = [];
    for (const i of lapRowIndices) {
      const d = Number(meta.lapRelDist[i]);
      if (!Number.isFinite(d)) continue;
      const row = { dist: d };
      if (hasSlope) row.slopeDeg = Number(referenceLog.data[i][slopeCol]);
      if (hasAlt) row.altitude = Number(referenceLog.data[i][altCol]);
      rows.push(row);
    }
    if (rows.length < 10) return null;
    rows.sort((a, b) => a.dist - b.dist);

    let rawSeries;
    if (hasSlope) {
      rawSeries = rows.map((r) => Number.isFinite(r.slopeDeg) ? r.slopeDeg : 0);
    } else {
      rawSeries = rows.map((r, i) => {
        const lo = Math.max(0, i - 3), hi = Math.min(rows.length - 1, i + 3);
        const dAlt = rows[hi].altitude - rows[lo].altitude;
        const dDist = rows[hi].dist - rows[lo].dist;
        if (!(dDist > 0.5) || !Number.isFinite(dAlt)) return 0;
        return Math.atan2(dAlt, dDist) * 180 / Math.PI;
      });
    }

    const distArr = rows.map((r) => r.dist);
    const smoothed = computeWindowedAverage(rawSeries, distArr, GRADE_SMOOTH_HALF_WINDOW_M);

    return sampled.map((pt) => {
      const targetDist = pt.dist + sourceBaseDist;
      const v = interpAt(distArr, smoothed, targetDist);
      return Number.isFinite(v) ? v : 0;
    });
  }

  // Fits a whole-circuit racing line (fixed default weights -- no manual tuning UI
  // anymore) to the currently selected lap, builds it into a synthetic single-lap "log"
  // (replacing any previous one), and immediately runs the quasi-steady-state vehicle
  // simulation on it. One button now does what used to be three steps (Fit Racing Line
  // -> Accept & Add as Lap -> Simulate Vehicle). Written under the same channel names
  // real telemetry uses (Speed, LatAcc, LongAcc -- resolved via resolveChannelForLog so
  // they line up correctly regardless of log format) rather than a separate "(Sim)" set,
  // so the simulated lap plots, colors, and channel-selects exactly like any other lap
  // and can be directly overlaid against a real one. Total Acceleration (calc) then
  // comes for free from the existing LatAcc/LongAcc-driven calculation shared with real
  // logs. Re-runnable any time the vehicle parameters change -- fitting is fast enough
  // that there's no need to cache/reuse the previous fit.
  function simulateVehicle(rerun) {
    const calc = getRacingLineCalculationsApi();
    if (!calc || typeof calc.buildWholeCircuitFit !== 'function' || typeof calc.simulateVehicleSpeed !== 'function' || typeof calc.samplePeriodicBSpline !== 'function') {
      if (vehicleSimStatus) vehicleSimStatus.textContent = 'Vehicle simulation is unavailable (calculations module not loaded).';
      return;
    }

    const ref = getReferenceLapForCorners(getSelectedFiles(), getSelectedLaps());
    if (!ref) {
      if (vehicleSimStatus) vehicleSimStatus.textContent = 'Select at least one lap with map data, then simulate.';
      return;
    }

    const fit = calc.buildWholeCircuitFit(
      ref.log,
      ref.lap,
      RACING_LINE_DEFAULT_WEIGHTS,
      {},
      { resolveChannelForLog, computeWindowedAverage, getMapSourceForLog },
      { defaultWeights: RACING_LINE_DEFAULT_WEIGHTS }
    );
    if (!fit) {
      if (vehicleSimStatus) vehicleSimStatus.textContent = 'Could not fit a racing line to the selected lap (not enough logged map/radius data).';
      return;
    }

    const log = buildRacingLineSyntheticLog({ fit, referenceLog: ref.log, referenceLap: ref.lap });
    const existingIdx = logs.findIndex(l => l.meta && l.meta.racingLine);
    if (existingIdx >= 0) logs.splice(existingIdx, 1, log);
    else logs.push(log);

    const n = log.data.length;
    const sampled = calc.samplePeriodicBSpline(log.meta.splineControl, n);
    const params = getVehicleSimParams();

    // Engine-curve mode needs a vehicle with a power curve AND gearing (ratios + wheel
    // circumference). If it isn't complete, say so and simulate with average power rather
    // than silently doing something different from what was asked.
    let powerModelNote = '';
    if (vehicleSimPowerModelSelect && vehicleSimPowerModelSelect.value === 'curve') {
      const problems = params.engine ? calc.describeEngineProblems(params.engine) : [];
      if (!params.engine) {
        powerModelNote = ' Engine-curve mode needs a vehicle -- pick one above; used average power instead.';
      } else if (problems.length) {
        delete params.engine;
        powerModelNote = ` The selected vehicle is missing ${problems.join(', ')}; used average power instead.`;
      }
    }

    const referenceLog = log.meta.sourceLogId ? logs.find(l => l.id === log.meta.sourceLogId) : null;
    const useElevation = !vehicleSimUseElevationInput || vehicleSimUseElevationInput.checked;
    const gradeDeg = useElevation
      ? buildGradeDegForSampled(referenceLog, log.meta.sourceLap, log.meta.sourceBaseDist, sampled)
      : null;

    const result = calc.simulateVehicleSpeed(log.meta.splineControl, sampled, params, gradeDeg);
    if (result) {
      const speedCol = resolveChannelForLog('Speed', log);
      const latAccCol = resolveChannelForLog(COMMON_LAT_ACC_CHANNEL, log);
      const longAccCol = resolveChannelForLog(COMMON_LONG_ACC_CHANNEL, log);
      [speedCol, latAccCol, longAccCol].forEach((col) => { if (!log.cols.includes(col)) log.cols.push(col); });
      for (let i = 0; i < n; i++) {
        log.data[i][speedCol] = result.speed[i] * 3.6; // m/s -> km/h
        log.data[i][longAccCol] = result.ax[i] / 9.81; // m/s^2 -> g
        log.data[i][latAccCol] = result.ay[i] / 9.81;
        log.data[i]['Lap Time'] = result.time[i];
        log.meta.lapTime[i] = result.time[i];
      }
      // result.time[] deliberately excludes the final closing segment back to the
      // start/finish line (see simulateVehicleSpeed's own doc comment), so the per-row
      // max that getLapDuration() falls back to would under-report the lap by that last
      // segment. Recording the true total here keeps the laps-list time in sync with the
      // one shown below the Simulate Vehicle button. This synthetic log always has a
      // single lap numbered 1.
      if (!Array.isArray(log.meta.lapDurations)) log.meta.lapDurations = [];
      log.meta.lapDurations[1] = result.lapTime;
      if (!log.meta.units || typeof log.meta.units !== 'object') log.meta.units = {};
      log.meta.units[speedCol] = 'km/h';
      log.meta.units[latAccCol] = 'g';
      log.meta.units[longAccCol] = 'g';

      // Engine-curve mode also yields which gear (and the engine RPM it implies) the
      // best-gear rule would use at every point -- written as ordinary channels.
      const extraChannels = [];
      // Required lean angle = atan(lateral accel [g]), signed like the lateral accel.
      const isMoto = getSimClass() === 'motorcycle';
      if (isMoto && result.leanDeg) {
        if (!log.cols.includes('Required Lean Angle')) log.cols.push('Required Lean Angle');
        for (let i = 0; i < n; i++) log.data[i]['Required Lean Angle'] = result.leanDeg[i];
        log.meta.units['Required Lean Angle'] = 'deg';
        extraChannels.push('Required Lean Angle');
      }
      if (isMoto && result.leanRateDegS) {
        if (!log.cols.includes('Required Lean Angle Rate')) log.cols.push('Required Lean Angle Rate');
        for (let i = 0; i < n; i++) log.data[i]['Required Lean Angle Rate'] = result.leanRateDegS[i];
        log.meta.units['Required Lean Angle Rate'] = 'deg/s';
        extraChannels.push('Required Lean Angle Rate');
      }
      if (result.gear && result.rpm) {
        [SIM_GEAR_COL, SIM_RPM_COL].forEach((col) => { if (!log.cols.includes(col)) log.cols.push(col); });
        for (let i = 0; i < n; i++) {
          log.data[i][SIM_GEAR_COL] = result.gear[i];
          log.data[i][SIM_RPM_COL] = Math.round(result.rpm[i]);
        }
        log.meta.units[SIM_GEAR_COL] = '';
        log.meta.units[SIM_RPM_COL] = 'rpm';
        extraChannels.push(SIM_GEAR_COL, SIM_RPM_COL);
      }

      // Aero/Slope/Tire breakdown of the simulated lap's own LongAcc, and the wheel/axle
      // loads that (plus the vehicle's weight-transfer geometry, if given) implies -- same
      // channel names and units as the logged-data path, so a simulated and a real lap
      // overlay directly on these too.
      const putChannel = (col, unit, values) => {
        if (!log.cols.includes(col)) log.cols.push(col);
        log.meta.units[col] = unit;
        for (let i = 0; i < n; i++) log.data[i][col] = values[i];
        extraChannels.push(col);
      };
      if (result.aeroDecelG) {
        putChannel(SIM_AERO_COL, 'g', result.aeroDecelG);
        putChannel(SIM_TIRE_COL, 'g', result.tireAccelG);
        if (result.hasSlopeDecel) putChannel(SIM_SLOPE_COL, 'g', result.slopeDecelG);
      }
      if (result.wheelLoads) {
        putChannel(frontLoadColName(isMoto), 'kg', result.wheelLoads.frontKg);
        putChannel(rearLoadColName(isMoto), 'kg', result.wheelLoads.rearKg);
      }
      addCalculatedCommonChannels(log.data, log.cols, log.meta);

      if (vehicleSimStatus) {
        const gradeNote = !useElevation
          ? ' Elevation/altitude effect disabled -- simulated as flat.'
          : (result.usedGrade ? ' Track grade (Slope/Altitude) factored in.' : ' No Slope/Altitude data found on the source lap -- simulated as flat.');
        let modelNote = result.usedEngineModel
          ? ' Engine curve + gearing (best gear at each point).'
          : (powerModelNote || ' Average power model.');
        // Pinned against the redline in top gear for a large part of the lap: the bike's
        // gearing or wheel size is the limit, not the track -- almost always a data-entry
        // problem (final drive/ratios, or a wheel diameter typed as a circumference).
        if (result.usedEngineModel && result.revLimitedFraction > 0.2) {
          modelNote += ` WARNING: rev-limited in top gear at ${(result.redlineSpeed * 3.6).toFixed(0)} km/h for `
            + `${Math.round(result.revLimitedFraction * 100)}% of the lap -- check the vehicle's gear ratios, `
            + 'final drive and tire size.';
        }
        vehicleSimStatus.textContent = `Simulated lap time: ${formatSimLapTime(result.lapTime)} `
          + `(power/drag top speed ${(result.topSpeedFromPower * 3.6).toFixed(0)} km/h).${modelNote}${gradeNote} `
          + `${[speedCol, latAccCol, longAccCol].concat(extraChannels).join(', ')} added to the racing line lap.`;
      }
    } else if (vehicleSimStatus) {
      vehicleSimStatus.textContent = 'Racing line fitted, but the vehicle simulation failed on it.';
    }

    renderFilesList();
    populateYSelect();
    populateXCustomSelect();
    populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
    renderLapsList();
    updatePlot();
    if (result) ensureSimMapXY(log);
    if (result) saveSimulation(log, !!rerun);
  }

  // ── Simulate Vehicle: what is computed, and on what assumptions ───────────
  function openSimInfoModal() {
    const moto = getSimClass() === 'motorcycle';
    const curve = !vehicleSimPowerModelSelect || vehicleSimPowerModelSelect.value === 'curve';
    const vehicleForInfo = selectedSimVehicle();
    const engine = curve ? getSimEngine() : null;
    const calc = getRacingLineCalculationsApi();
    const engineReady = !!(engine && calc && calc.describeEngineProblems(engine).length === 0);
    const tread = engine ? simTreadRadiusM(engine.gearing) : 0;
    const geomForInfo = getVehicleWeightTransferGeom(vehicleForInfo, 1);
    const loadsReady = !!(geomForInfo && geomForInfo.cgHeightM > 0 && geomForInfo.cgPositionM > 0 && geomForInfo.wheelbaseM > 0);
    const aeroLoadReady = loadsReady && geomForInfo.copHeightM > 0;
    const loadLabel = (moto ? 'Wheel' : 'Axle') + ' Load (sim)';

    const channel = (on, name, text) => '<li class="' + (on ? '' : 'sim-info-off') + '"><strong>' + name + '</strong>'
      + (on ? '' : ' (not computed with the current settings)') + ' -- ' + text + '</li>';
    const html = [
      '<h4>Channels the simulation writes (on the simulated lap)</h4><ul>',
      channel(true, 'Speed', 'the fastest speed the grip, power and drag limits allow at each point (forward/backward pass over the racing line).'),
      channel(true, 'LatAcc / LongAcc', "lateral and longitudinal acceleration in g, derived from that speed profile and the line's curvature."),
      channel(true, 'Lap Time', 'elapsed time from the start/finish line.'),
      channel(moto, 'Required Lean Angle', 'arctan(lateral g), in degrees, signed like LatAcc. It is the lean of the bike + rider centre of mass.'),
      channel(moto, 'Required Lean Angle Rate', 'how fast that lean has to change, deg/s.'),
      channel(engineReady, 'Gear (sim)', 'the gear giving the most wheel power at that speed (subject to the shift-time rule below).'),
      channel(engineReady, 'RPM (sim)', 'engine RPM in that gear from road speed, gearing and tire size' + (moto ? ', corrected for lean.' : '.')),
      channel(true, 'Aero Decel (sim)', 'the deceleration aerodynamic drag alone causes at that speed, from Mass and CdA -- always positive.'),
      channel(true, 'Slope Decel (sim)', "gravity's own share, from the source lap's track grade -- 0 on a flat track or with the elevation option off."),
      channel(true, 'Tire Longitudinal Grip (sim)', 'LongAcc with Aero and Slope Decel added back in: the net grip the tires alone are using, positive (driving) or negative (braking).'),
      channel(loadsReady, 'Front/Rear ' + loadLabel, 'longitudinal weight transfer (plus an aero pitching share, if CoP height is set) applied to the static split, in kg -- see Assumptions.'),
      '</ul>',
      '<h4>Logged data</h4><ul>',
      "<li><strong>RPM (sim)</strong>, <strong>Gear (sim)</strong>" + (moto ? ', <strong>Required Lean Angle</strong>, <strong>Required Lean Angle Rate</strong>' : '') + ", <strong>Aero Decel (sim)</strong>, <strong>Slope Decel (sim)</strong>, <strong>Tire Longitudinal Grip (sim)</strong> and <strong>Front/Rear " + loadLabel + "</strong> can be added to real laps with <em>Simulate RPM, Gear, Lean &amp; Decel for Logged Data</em>, computed from the logged Speed, LongAcc" + (moto ? ' and LatAcc' : '') + " -- each one only where it applies, so e.g. Aero/Tire Decel (Speed + LongAcc + a Mass/CdA) are added even with no vehicle picked, or on a car, while the Load channels need a vehicle with the Weight Transfer fields filled in. They use the same channel names as the simulated lap so the two overlay, and never overwrite the log's own channels. If the log is a stored file, they're also saved as a small linked file (same sessions/vehicle/rider) and re-applied automatically next time it's loaded.</li>",
      '</ul>',
      '<h4>Assumptions</h4><ul>',
      "<li>Mass, CdA, Average Power and Max Lateral/Longitudinal grip all come from the picked vehicle (mass and CdA add the rider's own weight and tucked-position CdA delta when a rider is picked too). With no vehicle picked, generic defaults are used instead (1.0g / 0.7g / 32 kW / 0.5 m² / 235 kg). A \"Basic\" vehicle carries just these five and nothing else -- no gearing, power curve or weight-transfer geometry.</li>",
      '<li>Grip is a friction circle: Max Lateral / Max Longitudinal (g) set the envelope; all speeds are limited by it, by power and by air drag (CdA, mass, drivetrain efficiency).</li>',
      "<li>Tire Longitudinal Grip = LongAcc + Aero Decel + Slope Decel -- adding drag (and grade, if included) back into the measured/simulated LongAcc recovers the tires' own net contribution, in EITHER direction: positive means net driving grip, negative means net braking grip. This is why a hard stop can measure noticeably more deceleration than the vehicle's actual tire/brake limit at high speed -- aero drag (and an uphill grade) are real and stack on top of it, but aren't limited by tire grip. On logged data, grade reads the log's own Slope channel directly (no smoothing); an Altitude-only log is treated as flat.</li>",
      "<li>Engine-curve mode: wheel power is the engine curve at the RPM the gear implies, times drivetrain efficiency (set on the vehicle's Gearing section, default 95%). Below the curve's first RPM the clutch slips (torque held). Above the last RPM (redline) there is no drive.</li>",
      '<li>Shift time (vehicle gearing): a downshift is only made if the time it gains beats two shifts of lost drive (down + back up); upshifts are instant.</li>',
      '<li>Tire size gives the overall wheel diameter (nominal, unloaded -- no growth or squash). Overall diameter = 2 x width x aspect + rim.</li>',
      moto
        ? "<li>Lean and RPM: leaned over, the bike rolls on the tire's side, so the rolling radius is (R - r) + r cos(lean), with r the tread crown radius = tire width / 2"
          + (tread ? ' (' + Math.round(tread * 1000) + ' mm for this tire)' : ' (needs a tire size on the vehicle -- without one RPM is not lean-adjusted)')
          + '. Less radius = more RPM at the same speed. The lean used is the <em>required</em> lean angle above; the frame\'s own lean is not modelled.</li>'
        : '<li>Car class: no lean channels and no lean correction.</li>',
      '<li>Track grade from the source lap (Slope/Altitude) is included when the elevation option is on; otherwise the track is flat.</li>',
      "<li>Rider weight-transfer position (Rider editor's \"Weight Transfer\" fields, all optional): a rider's saved CG height/position deltas are added to the vehicle's own CG height/position, picked automatically at each point -- hanging off past 15&deg; of lean, otherwise braking (LongAcc &lt; 0) or tucked. A rider's hang-off lateral displacement is stored but not used in any calculation yet (this app only computes front/rear or left/right axle totals, not a left/right split).</li>",
      "<li>Weight transfer (Vehicle editor's \"Weight Transfer\" fields, all optional): Front/Rear " + loadLabel + " = the static split (from CG position, measured from the front axle, over wheelbase) minus/plus two shares -- Mass x LongAcc x CG height / wheelbase (accelerating shifts load to the rear, braking to the front), and, only when Center of Pressure height is also set, Mass x Aero Decel x CoP height / wheelbase (drag pitches the nose up, squatting the rear, more so the further CoP sits from CG height -- the two exactly cancel if they're equal)."
        + (moto ? " For a leaning motorcycle, the CG's effective height shrinks with lean like an inverted pendulum (height x cos(lean)), so the weight-transfer share shrinks the same way; rider hang-off is not modelled." : '')
        + (loadsReady ? (aeroLoadReady ? ' Ready for this vehicle, including the aero share.' : ' Ready for this vehicle (no Center of Pressure height set, so no aero share).') : ' This vehicle is missing CG height, CG position and/or wheelbase, so no Load channels are produced yet.')
        + '</li>',
      '</ul>'
    ].join('');

    const overlay = document.createElement('div');
    overlay.className = 'session-modal';
    const close = () => overlay.remove();
    const backdrop = document.createElement('div');
    backdrop.className = 'session-modal-backdrop';
    backdrop.addEventListener('click', close);
    const dialog = document.createElement('div');
    dialog.className = 'session-modal-dialog sim-info-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'About the simulation');
    const header = document.createElement('div');
    header.className = 'session-modal-header';
    const title = document.createElement('h3');
    title.className = 'session-modal-title';
    title.textContent = 'About the simulation (' + (moto ? 'motorcycle' : 'car') + ')';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'session-modal-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', close);
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = document.createElement('div');
    body.className = 'sim-info-body';
    body.innerHTML = html;
    dialog.appendChild(header);
    dialog.appendChild(body);
    overlay.appendChild(backdrop);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }

  // ── Temperature Profile Plots: Add/Edit modal + shared color-field builder ────────────

  // Builds the colormap/min/max/above-below-color field group shared by the per-plot Add/Edit
  // modal (withDefaultToggle:true, adds a "use plotter default" checkbox that shows/hides the
  // rest) and the Default-Colors modal (withDefaultToggle:false, the fields ARE the default).
  function buildTempProfileColorFields(initial, withDefaultToggle) {
    const wrap = document.createElement('div');

    let useDefaultCheckbox = null;
    if (withDefaultToggle) {
      const row = document.createElement('label');
      row.className = 'temp-profile-use-default-row';
      useDefaultCheckbox = document.createElement('input');
      useDefaultCheckbox.type = 'checkbox';
      useDefaultCheckbox.checked = initial.useDefaultRange !== false;
      row.appendChild(useDefaultCheckbox);
      row.appendChild(document.createTextNode(' Use plotter default colormap/range'));
      wrap.appendChild(row);
    }

    const fieldsRow = document.createElement('div');
    fieldsRow.className = 'session-modal-new-fields temp-profile-color-row';

    const colormapSelect = document.createElement('select');
    colormapSelect.className = 'session-modal-select temp-profile-colormap-select';
    TEMP_COLORMAP_NAMES.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      colormapSelect.appendChild(opt);
    });
    colormapSelect.value = TEMP_COLORMAP_NAMES.includes(initial.colormap) ? initial.colormap : 'Jet';

    const minInput = document.createElement('input');
    minInput.type = 'number'; minInput.step = 'any'; minInput.className = 'session-modal-input temp-profile-min-input';
    minInput.placeholder = 'Min'; minInput.value = Number.isFinite(initial.min) ? initial.min : '';

    const maxInput = document.createElement('input');
    maxInput.type = 'number'; maxInput.step = 'any'; maxInput.className = 'session-modal-input temp-profile-max-input';
    maxInput.placeholder = 'Max'; maxInput.value = Number.isFinite(initial.max) ? initial.max : '';

    const belowColorInput = document.createElement('input');
    belowColorInput.type = 'color';
    belowColorInput.className = 'temp-profile-below-color-input';
    belowColorInput.value = initial.belowColor || '#000000';
    belowColorInput.title = 'Below-min color';

    const aboveColorInput = document.createElement('input');
    aboveColorInput.type = 'color';
    aboveColorInput.className = 'temp-profile-above-color-input';
    aboveColorInput.value = initial.aboveColor || '#ff00ff';
    aboveColorInput.title = 'Above-max color';

    const makeField = (labelText, control) => {
      const label = document.createElement('label');
      label.className = 'temp-profile-color-field';
      label.appendChild(document.createTextNode(labelText));
      label.appendChild(control);
      return label;
    };
    fieldsRow.appendChild(makeField('Colormap', colormapSelect));
    fieldsRow.appendChild(makeField('Min', minInput));
    fieldsRow.appendChild(makeField('Max', maxInput));
    fieldsRow.appendChild(makeField('Below Min', belowColorInput));
    fieldsRow.appendChild(makeField('Above Max', aboveColorInput));
    wrap.appendChild(fieldsRow);

    // Live preview of the actual effective colorscale (base colormap gradient plus the
    // below-min/above-max edge colors), built via the same buildTempProfileColorscale()
    // used to color the real heatmap traces, so this always matches what gets plotted.
    const previewRow = document.createElement('div');
    previewRow.className = 'temp-profile-colormap-preview-row';
    const previewMinLabel = document.createElement('span');
    previewMinLabel.className = 'temp-profile-colormap-preview-label';
    const previewBar = document.createElement('div');
    previewBar.className = 'temp-profile-colormap-preview-bar';
    const previewMaxLabel = document.createElement('span');
    previewMaxLabel.className = 'temp-profile-colormap-preview-label';
    previewRow.appendChild(previewMinLabel);
    previewRow.appendChild(previewBar);
    previewRow.appendChild(previewMaxLabel);
    wrap.appendChild(previewRow);

    function updatePreview() {
      const stops = buildTempProfileColorscale(colormapSelect.value, aboveColorInput.value, belowColorInput.value);
      previewBar.style.background = `linear-gradient(to right, ${stops.map(([pos, color]) => `${color} ${(pos * 100).toFixed(2)}%`).join(', ')})`;
      previewMinLabel.textContent = minInput.value !== '' ? minInput.value : 'Min';
      previewMaxLabel.textContent = maxInput.value !== '' ? maxInput.value : 'Max';
    }
    updatePreview();
    colormapSelect.addEventListener('change', updatePreview);
    belowColorInput.addEventListener('input', updatePreview);
    aboveColorInput.addEventListener('input', updatePreview);
    minInput.addEventListener('input', updatePreview);
    maxInput.addEventListener('input', updatePreview);

    const note = document.createElement('div');
    note.className = 'session-modal-hint';
    note.textContent = 'Uses the shared plotter default -- edit it via the "Default Colors" button.';
    if (withDefaultToggle) wrap.appendChild(note);

    function syncVisibility() {
      if (!withDefaultToggle) return;
      const useDefault = useDefaultCheckbox.checked;
      fieldsRow.hidden = useDefault;
      previewRow.hidden = useDefault;
      note.hidden = !useDefault;
    }
    if (withDefaultToggle) {
      useDefaultCheckbox.addEventListener('change', syncVisibility);
      syncVisibility();
    }

    return {
      container: wrap,
      getValue() {
        return {
          useDefaultRange: withDefaultToggle ? !!useDefaultCheckbox.checked : true,
          colormap: colormapSelect.value,
          min: parseFloat(minInput.value),
          max: parseFloat(maxInput.value),
          aboveColor: aboveColorInput.value,
          belowColor: belowColorInput.value
        };
      }
    };
  }

  // Builds the channel picker: a text-filtered <select multiple> (the same searchable
  // multi-select pattern the main Y-channel picker already uses -- #ySelectSearch +
  // #ySelect, via buildYSelectOptionEntries/renderYSelectOptions) plus a separate ordered
  // list below it, since a native <select multiple> has no user-controlled display order.
  function buildTempProfileChannelPicker(initialChannels) {
    const container = document.createElement('div');
    container.className = 'temp-profile-channel-picker';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'session-modal-input y-select-search';
    searchInput.placeholder = 'Search channels...';
    searchInput.autocomplete = 'off';

    const select = document.createElement('select');
    select.multiple = true;
    select.size = 6;
    select.className = 'session-modal-select temp-profile-channel-list';

    const orderHeader = document.createElement('div');
    orderHeader.className = 'temp-profile-order-header';
    const flipBtn = document.createElement('button');
    flipBtn.type = 'button';
    flipBtn.className = 'temp-profile-flip-btn';
    flipBtn.textContent = 'Flip Order';
    orderHeader.appendChild(flipBtn);

    const orderList = document.createElement('div');
    orderList.className = 'temp-profile-order-list';

    let order = (initialChannels || []).slice();
    const allEntries = buildYSelectOptionEntries();
    const labelByValue = new Map(allEntries.map((e) => [e.value, e.label]));

    function renderSelect() {
      const term = searchInput.value.trim().toLowerCase();
      const selectedSet = new Set(order);
      const filtered = term
        ? allEntries.filter((e) => selectedSet.has(e.value) || e.label.toLowerCase().includes(term))
        : allEntries;
      select.innerHTML = filtered.map((e) => (
        `<option value="${escapeHtml(e.value)}"${selectedSet.has(e.value) ? ' selected' : ''}>${escapeHtml(e.label)}</option>`
      )).join('');
    }

    function renderOrderList() {
      orderList.innerHTML = order.map((ch, i) => (
        `<div class="temp-profile-order-item">` +
        `<span class="temp-profile-order-item-name">${escapeHtml(labelByValue.get(ch) || ch)}</span>` +
        `<button type="button" class="temp-profile-order-btn" data-action="up" data-idx="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">▲</button>` +
        `<button type="button" class="temp-profile-order-btn" data-action="down" data-idx="${i}" ${i === order.length - 1 ? 'disabled' : ''} aria-label="Move down">▼</button>` +
        `<button type="button" class="temp-profile-order-btn" data-action="remove" data-idx="${i}" aria-label="Remove">✕</button>` +
        `</div>`
      )).join('');
    }

    function renderAll() { renderSelect(); renderOrderList(); }

    searchInput.addEventListener('input', renderSelect);

    select.addEventListener('change', () => {
      const renderedValues = new Set(Array.from(select.options).map((o) => o.value));
      const selectedNow = new Set(Array.from(select.selectedOptions).map((o) => o.value));
      order = order.filter((ch) => !renderedValues.has(ch) || selectedNow.has(ch));
      Array.from(select.options).forEach((o) => {
        if (o.selected && !order.includes(o.value)) order.push(o.value);
      });
      renderAll();
    });

    orderList.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.temp-profile-order-btn');
      if (!btn) return;
      const idx = Number(btn.dataset.idx);
      const action = btn.dataset.action;
      if (action === 'up' && idx > 0) {
        [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
      } else if (action === 'down' && idx < order.length - 1) {
        [order[idx + 1], order[idx]] = [order[idx], order[idx + 1]];
      } else if (action === 'remove') {
        order.splice(idx, 1);
      }
      renderAll();
    });

    flipBtn.addEventListener('click', () => {
      order.reverse();
      renderAll();
    });

    renderAll();
    container.appendChild(searchInput);
    container.appendChild(select);
    container.appendChild(orderHeader);
    container.appendChild(orderList);

    return { container, getOrder: () => order.slice() };
  }

  function buildTempProfileModalShell(titleText, ariaLabel) {
    const overlay = document.createElement('div');
    overlay.className = 'session-modal';
    const close = () => overlay.remove();
    const backdrop = document.createElement('div');
    backdrop.className = 'session-modal-backdrop';
    backdrop.addEventListener('click', close);

    const dialog = document.createElement('div');
    dialog.className = 'session-modal-dialog temp-profile-modal-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', ariaLabel);

    const header = document.createElement('div');
    header.className = 'session-modal-header';
    const title = document.createElement('h3');
    title.className = 'session-modal-title';
    title.textContent = titleText;
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'session-modal-close';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', close);
    header.appendChild(title);
    header.appendChild(closeBtn);
    dialog.appendChild(header);

    overlay.appendChild(backdrop);
    overlay.appendChild(dialog);
    return { overlay, dialog, close };
  }

  function openTempProfilePlotModal(existingPlot) {
    const isEdit = !!existingPlot;
    const p = existingPlot || {
      name: '', channels: [], enabled: true, useDefaultRange: true,
      colormap: tempProfileDefaults.colormap, min: tempProfileDefaults.min, max: tempProfileDefaults.max,
      aboveColor: tempProfileDefaults.aboveColor, belowColor: tempProfileDefaults.belowColor
    };

    const shell = buildTempProfileModalShell(
      isEdit ? 'Edit Temperature Profile Plot' : 'Add Temperature Profile Plot',
      isEdit ? 'Edit temperature profile plot' : 'Add temperature profile plot'
    );
    const { dialog, close } = shell;

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'session-modal-input temp-profile-name-input';
    nameInput.placeholder = 'Plot name, e.g. LF External';
    nameInput.value = p.name || '';

    const picker = buildTempProfileChannelPicker(p.channels);
    const colorFields = buildTempProfileColorFields(p, true);

    const statusEl = document.createElement('div');
    statusEl.className = 'session-modal-status';
    function showError(msg) {
      statusEl.textContent = msg;
      statusEl.classList.add('is-error');
    }

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'session-modal-save';
    saveBtn.textContent = isEdit ? 'Save Changes' : 'Add Plot';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'session-modal-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', close);

    const actions = document.createElement('div');
    actions.className = 'session-modal-actions';
    if (isEdit) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'session-modal-cancel';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        const idx = tempProfilePlots.findIndex((x) => x.id === existingPlot.id);
        if (idx >= 0) tempProfilePlots.splice(idx, 1);
        saveTempProfilePlots();
        renderTempProfilePlotsList();
        updatePlot();
        close();
      });
      actions.appendChild(deleteBtn);
    }
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    saveBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) return showError('Name is required.');
      const dup = tempProfilePlots.some((x) => x.name.toLowerCase() === name.toLowerCase() && (!isEdit || x.id !== existingPlot.id));
      if (dup) return showError(`"${name}" already exists.`);
      const order = picker.getOrder();
      if (order.length === 0) return showError('Select at least one channel.');
      const colorVal = colorFields.getValue();
      if (!colorVal.useDefaultRange && (!Number.isFinite(colorVal.min) || !Number.isFinite(colorVal.max) || colorVal.min >= colorVal.max)) {
        return showError('Min must be less than Max.');
      }
      const plotData = {
        id: isEdit ? existingPlot.id : `temp-profile-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        name,
        channels: order,
        enabled: isEdit ? existingPlot.enabled : true,
        useDefaultRange: colorVal.useDefaultRange,
        colormap: colorVal.colormap,
        min: Number.isFinite(colorVal.min) ? colorVal.min : tempProfileDefaults.min,
        max: Number.isFinite(colorVal.max) ? colorVal.max : tempProfileDefaults.max,
        aboveColor: colorVal.aboveColor,
        belowColor: colorVal.belowColor
      };
      if (isEdit) {
        const idx = tempProfilePlots.findIndex((x) => x.id === existingPlot.id);
        if (idx >= 0) tempProfilePlots[idx] = plotData;
      } else {
        tempProfilePlots.push(plotData);
      }
      saveTempProfilePlots();
      renderTempProfilePlotsList();
      updatePlot();
      close();
    });

    const nameLabel = document.createElement('label');
    nameLabel.className = 'session-modal-label';
    nameLabel.textContent = 'Name';
    const channelsLabel = document.createElement('label');
    channelsLabel.className = 'session-modal-label';
    channelsLabel.textContent = 'Channels';
    const colorsLabel = document.createElement('label');
    colorsLabel.className = 'session-modal-label';
    colorsLabel.textContent = 'Color Settings';

    dialog.appendChild(nameLabel);
    dialog.appendChild(nameInput);
    dialog.appendChild(channelsLabel);
    dialog.appendChild(picker.container);
    dialog.appendChild(colorsLabel);
    dialog.appendChild(colorFields.container);
    dialog.appendChild(statusEl);
    dialog.appendChild(actions);

    document.body.appendChild(shell.overlay);
    nameInput.focus();
  }

  function openTempProfileDefaultsModal() {
    const shell = buildTempProfileModalShell('Plotter Default Colors', 'Edit plotter default temperature colors');
    const { dialog, close } = shell;

    const hint = document.createElement('div');
    hint.className = 'session-modal-hint';
    hint.textContent = 'Used by any temperature profile plot with "Use plotter default colormap/range" checked.';

    const colorFields = buildTempProfileColorFields(tempProfileDefaults, false);

    const statusEl = document.createElement('div');
    statusEl.className = 'session-modal-status';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'session-modal-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const val = colorFields.getValue();
      if (!Number.isFinite(val.min) || !Number.isFinite(val.max) || val.min >= val.max) {
        statusEl.textContent = 'Min must be less than Max.';
        statusEl.classList.add('is-error');
        return;
      }
      tempProfileDefaults = { colormap: val.colormap, min: val.min, max: val.max, aboveColor: val.aboveColor, belowColor: val.belowColor };
      saveTempProfileDefaults();
      renderTempProfilePlotsList();
      updatePlot();
      close();
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'session-modal-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', close);

    const actions = document.createElement('div');
    actions.className = 'session-modal-actions';
    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    dialog.appendChild(hint);
    dialog.appendChild(colorFields.container);
    dialog.appendChild(statusEl);
    dialog.appendChild(actions);

    document.body.appendChild(shell.overlay);
  }

  // Map X / Map Y on the simulated lap, like the GPS logs have. Normally they come from the
  // same X/Y <-> Lat/Lng code the real logs use (see updateGpBikesDerivedLatLon: PosX/PosY ->
  // Derived Latitude/Longitude, then buildDerivedXY back to Map X/Y, which then follow the
  // map offsets). If no map origin could be resolved that never ran, so the racing line's own
  // X/Y -- already in the map's frame -- are used directly.
  function ensureSimMapXY(log) {
    if (!log || log.cols.includes(DERIVED_MAP_X_COL)) return;
    const nativeCols = getNativeXYCols(log);
    if (!nativeCols) return;
    [DERIVED_MAP_X_COL, DERIVED_MAP_Y_COL].forEach((c) => { if (!log.cols.includes(c)) log.cols.push(c); });
    log.meta.units[DERIVED_MAP_X_COL] = 'm';
    log.meta.units[DERIVED_MAP_Y_COL] = 'm';
    log.data.forEach((row) => {
      row[DERIVED_MAP_X_COL] = row[nativeCols.xCol];
      row[DERIVED_MAP_Y_COL] = row[nativeCols.yCol];
    });
    populateYSelect();
    populateXCustomSelect();
  }

  // The same channel names on a simulated lap and on logged data, so they overlay directly.
  const SIM_RPM_COL = 'RPM (sim)';
  const SIM_GEAR_COL = 'Gear (sim)';
  const SIM_LEAN_COL = 'Required Lean Angle';
  const SIM_LEAN_RATE_COL = 'Required Lean Angle Rate';
  const SIM_AERO_COL = 'Aero Decel (sim)';
  const SIM_SLOPE_COL = 'Slope Decel (sim)';
  const SIM_TIRE_COL = 'Tire Longitudinal Grip (sim)';
  // Motorcycles get per-wheel loads; four-wheel vehicles get per-axle loads (same physics,
  // just the terminology racers actually use for each).
  function frontLoadColName(moto) { return moto ? 'Front Wheel Load (sim)' : 'Front Axle Load (sim)'; }
  function rearLoadColName(moto) { return moto ? 'Rear Wheel Load (sim)' : 'Rear Axle Load (sim)'; }

  // The vehicle's weight-transfer geometry (see the Vehicle editor's "Weight Transfer"
  // fields), or null if no vehicle is selected -- computeWheelLoads itself tolerates any
  // of these being missing/invalid and simply returns null, so callers just pass this
  // straight through.
  function getVehicleWeightTransferGeom(vehicle, massKg, rider) {
    if (!vehicle) return null;
    return {
      massKg,
      cgHeightM: vehicle.cg_height_m,
      cgPositionM: vehicle.cg_position_m,
      wheelbaseM: vehicle.wheelbase_m,
      copHeightM: vehicle.cop_height_m,
      // Consumed directly by simulateVehicleSpeed (via computeRiderCgDeltas); the logged-
      // data path builds the same per-sample deltas itself (see simulateRpmGearForLoggedData).
      rider: rider || null
    };
  }

  // ── Simulated channels for logged data: saved as a linked file ────────────
  // The derived channels only exist in the loaded log, so they are also written to a second
  // stored file (one per source log, same sessions/vehicle/rider) that is re-applied whenever
  // the source log is loaded again. It is keyed to the source by name and by row, and is
  // skipped by every "load a stored file" path since it is not a log itself.
  const SIM_CHANNEL_UNITS = {
    'RPM (sim)': 'rpm', 'Gear (sim)': '', 'Required Lean Angle': 'deg', 'Required Lean Angle Rate': 'deg/s',
    'Aero Decel (sim)': 'g', 'Slope Decel (sim)': 'g', 'Tire Longitudinal Grip (sim)': 'g',
    'Front Wheel Load (sim)': 'kg', 'Rear Wheel Load (sim)': 'kg',
    'Front Axle Load (sim)': 'kg', 'Rear Axle Load (sim)': 'kg'
  };

  function simChannelsFileName(sourceName) {
    return String(sourceName) + ' - sim channels.csv';
  }

  function isSimChannelsRecord(record) {
    return !!(record && record.metadata && record.metadata.sim_channels_for);
  }

  function saveLoggedSimChannels(log, cols, vehicle, rider, settings) {
    if (!sessionsApi || !sessionsFiles || !cols.length) return Promise.resolve(null);
    return sessionsFiles.getFileByName(log.name).then((source) => {
      if (!source) return null; // the source was never stored, so there is nothing to link to
      const header = ['Row'].concat(cols);
      const lines = [header.map(csvEscapeValue).join(',')];
      log.data.forEach((row, i) => {
        lines.push([i].concat(cols.map((c) => row[c])).map(csvEscapeValue).join(','));
      });
      const text = lines.join('\n');
      const name = simChannelsFileName(log.name);
      return sessionsFiles.storeFile(name, text, computeFileHash(text), {}).then((record) => sessionsFiles.updateFileLinks(record.id, {
        vehicle_id: vehicle ? vehicle.id : '',
        rider_id: rider ? rider.id : '',
        metadata: Object.assign({}, record.metadata, {
          simulated: true,
          sim_channels_for: source.id,
          source_name: log.name,
          settings
        })
      })).then((record) => Promise.all((source.session_ids || []).map(
        (sessionId) => sessionsApi.SessionService.addFileToSession(sessionId, record.id)
      )).then(() => record));
    }).then((record) => {
      if (record) { renderStoredFilesList(); renderPickerList(); if (window.SessionsUI) window.SessionsUI.renderPanel(); }
      return record;
    });
  }

  // Re-applies a saved simulated-channels file to a freshly loaded log, if the rows line up.
  function applyLinkedSimChannels(logId) {
    if (!sessionsFiles) return Promise.resolve();
    const log = logs.find((l) => l.id === logId);
    if (!log || (log.meta && log.meta.synthetic)) return Promise.resolve();
    return sessionsFiles.getFileByName(simChannelsFileName(log.name)).then((record) => {
      if (!record || !record.text || !isSimChannelsRecord(record)) return;
      const parsed = Papa.parse(record.text, { header: true, dynamicTyping: true, skipEmptyLines: true });
      const rows = parsed.data || [];
      if (rows.length !== log.data.length) {
        console.warn('Saved simulated channels for ' + log.name + ' do not match its rows; not applied.');
        return;
      }
      const cols = (parsed.meta.fields || []).filter((c) => c !== 'Row');
      if (!log.meta.units || typeof log.meta.units !== 'object') log.meta.units = {};
      cols.forEach((c) => {
        if (!log.cols.includes(c)) log.cols.push(c);
        log.meta.units[c] = SIM_CHANNEL_UNITS[c] != null ? SIM_CHANNEL_UNITS[c] : '';
        rows.forEach((r, i) => { log.data[i][c] = (r[c] === '' || r[c] === undefined) ? null : r[c]; });
      });
      populateYSelect();
      populateXCustomSelect();
      populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect();
      updatePlot();
    }).catch(() => {});
  }

  // Raw per-row logged Slope (when the format has one and it actually carries data), for
  // the Tire/Aero Decel channels below -- no smoothing, since this is a direct row-by-row
  // decomposition rather than a curve fit (compare buildGradeDegForSampled, which smooths
  // for exactly that reason). A log with only Altitude (no Slope) is treated as flat --
  // differentiating raw altitude is the noisy path buildGradeDegForSampled exists to avoid,
  // not worth redoing for this simpler feature.
  function resolveGradeDegSeriesForLog(log) {
    const allRows = log.data.map((_, i) => i);
    const slopeCol = resolveAvailableChannel('Slope', log, allRows);
    if (!slopeCol) return null;
    return log.data.map((row) => { const v = Number(row[slopeCol]); return Number.isFinite(v) ? v : 0; });
  }

  // Adds RPM (sim) / Gear (sim) / lean / Tire & Aero Decel to the selected real
  // (non-simulated) logs from their speed and lateral/longitudinal acceleration, with the
  // chosen vehicle's gearing, tire and mass/CdA. Each of these is independent: a car with
  // no vehicle picked still gets Tire/Aero Decel from the generic default Mass/CdA (see
  // computeEffectiveSimParams), a motorcycle still gets lean from lateral g alone, and
  // RPM/Gear need a full engine.
  function simulateRpmGearForLoggedData() {
    const say = (text) => { if (vehicleSimStatus) vehicleSimStatus.textContent = text; };
    const calc = getRacingLineCalculationsApi();
    const moto = getSimClass() === 'motorcycle';
    const engine = getSimEngine();
    const problems = engine ? calc.describeEngineProblems(engine) : ['a vehicle'];
    const targets = getSelectedFiles().filter((l) => !(l.meta && l.meta.synthetic));
    if (!targets.length) { say('Load a real log and select it first.'); return; }

    const effective = computeEffectiveSimParams();
    const ctx = { massKg: effective.massKg, cda: effective.cda };
    let done = 0;
    const added = new Set();
    const processed = [];
    targets.forEach((log) => {
      const speedCol = resolveChannelForLog('Speed', log);
      if (!speedCol || !log.cols.includes(speedCol)) return;
      const unit = String((log.meta.units && log.meta.units[speedCol]) || '').toLowerCase();
      const toMs = /mph/.test(unit) ? 0.44704 : (/m\/s/.test(unit) ? 1 : 1 / 3.6);
      const speedMs = log.data.map((row) => { const v = Number(row[speedCol]); return Number.isFinite(v) ? v * toMs : NaN; });
      let lat = null;
      if (moto) {
        const latCol = resolveChannelForLog(COMMON_LAT_ACC_CHANNEL, log);
        if (latCol && log.cols.includes(latCol)) {
          const latUnit = String((log.meta.units && log.meta.units[latCol]) || '').toLowerCase();
          const toG = /m\/s/.test(latUnit) ? 1 / 9.81 : 1;
          lat = log.data.map((row) => { const a = Number(row[latCol]); return Number.isFinite(a) ? a * toG : NaN; });
        }
      }
      if (!log.meta.units || typeof log.meta.units !== 'object') log.meta.units = {};
      const put = (col, unit, values) => {
        if (!log.cols.includes(col)) log.cols.push(col);
        log.meta.units[col] = unit;
        log.data.forEach((row, i) => { row[col] = values[i]; });
        added.add(col);
      };
      let did = false;
      const logCols = [];
      let leanDegArr = null; // shared with the wheel-load block below, motorcycle only
      if (!problems.length) {
        const res = calc.computeEngineRpmGear(engine, speedMs, lat, ctx);
        if (res) {
          put(SIM_RPM_COL, 'rpm', res.rpm.map((r) => (r == null ? null : Math.round(r))));
          put(SIM_GEAR_COL, '', res.gear);
          logCols.push(SIM_RPM_COL, SIM_GEAR_COL);
          did = true;
        }
      }
      if (moto && lat) {
        // Time within the lap (falls back to a Time column) for the rate of change.
        const lapTime = Array.isArray(log.meta.lapTime) ? log.meta.lapTime.map(Number) : null;
        const timeCol = resolveChannelForLog('Time', log);
        const timeS = lapTime && lapTime.every(Number.isFinite)
          ? lapTime
          : (timeCol && log.cols.includes(timeCol) ? log.data.map((row) => Number(row[timeCol])) : null);
        const leanRes = calc.computeLeanFromLatAcc(lat, timeS, log.meta.lapNum);
        if (leanRes) {
          leanDegArr = leanRes.leanDeg;
          put(SIM_LEAN_COL, 'deg', leanRes.leanDeg);
          put(SIM_LEAN_RATE_COL, 'deg/s', leanRes.leanRateDegS);
          logCols.push(SIM_LEAN_COL, SIM_LEAN_RATE_COL);
          did = true;
        }
      }
      // Aero/Slope/Tire decomposition only needs Speed, LongAcc and a mass/CdA -- no engine
      // or gearing, so this runs for a car or a motorcycle, with or without a vehicle
      // picked (the Mass/CdA fields always have a value, vehicle-filled or typed). Grade
      // only factors in when "Include Elevation/Altitude Effect" is on and the log has a
      // logged Slope channel; otherwise the track is treated as flat, same as the sim.
      const longCol = resolveChannelForLog(COMMON_LONG_ACC_CHANNEL, log);
      if (longCol && log.cols.includes(longCol)) {
        const longUnit = String((log.meta.units && log.meta.units[longCol]) || '').toLowerCase();
        const toG2 = /m\/s/.test(longUnit) ? 1 / 9.81 : 1;
        const longG = log.data.map((row) => { const a = Number(row[longCol]); return Number.isFinite(a) ? a * toG2 : NaN; });
        const useElevation = !vehicleSimUseElevationInput || vehicleSimUseElevationInput.checked;
        const gradeDeg = useElevation ? resolveGradeDegSeriesForLog(log) : null;
        const decomposed = calc.computeTireAeroDecel(speedMs, longG, { massKg: ctx.massKg, cda: ctx.cda, gradeDeg });
        if (decomposed) {
          put(SIM_AERO_COL, 'g', decomposed.aeroDecelG);
          put(SIM_TIRE_COL, 'g', decomposed.tireAccelG);
          logCols.push(SIM_AERO_COL, SIM_TIRE_COL);
          if (decomposed.hasGrade) {
            put(SIM_SLOPE_COL, 'g', decomposed.slopeDecelG);
            logCols.push(SIM_SLOPE_COL);
          }
          did = true;

          // Front/Rear wheel or axle loads: needs the vehicle's weight-transfer geometry
          // (CG height/position, wheelbase -- CoP height only adds the aero term on top),
          // so unlike Aero/Tire/Slope Decel this does need a vehicle picked.
          const geom = getVehicleWeightTransferGeom(selectedSimVehicle(), ctx.massKg);
          let loads = null;
          if (geom) {
            const riderCg = calc.computeRiderCgDeltas(longG, moto ? leanDegArr : null, selectedSimRider());
            const geomWithRider = riderCg
              ? Object.assign({}, geom, { cgHeightDeltaM: riderCg.heightDeltaM, cgPositionDeltaM: riderCg.positionDeltaM })
              : geom;
            loads = calc.computeWheelLoads(longG, decomposed.aeroDecelG, moto ? leanDegArr : null, geomWithRider);
          }
          if (loads) {
            const frontCol = frontLoadColName(moto);
            const rearCol = rearLoadColName(moto);
            put(frontCol, 'kg', loads.frontKg);
            put(rearCol, 'kg', loads.rearKg);
            logCols.push(frontCol, rearCol);
          }
        }
      }
      if (did) { done++; processed.push({ log, cols: logCols }); }
    });
    if (!done) { say('None of the selected logs has the Speed / LongAcc / LatAcc channels needed.'); return; }
    const loadsAdded = Array.from(added).some((c) => / Load \(sim\)$/.test(c));
    say('Added ' + Array.from(added).join(', ') + ' to ' + done + ' log' + (done === 1 ? '' : 's')
      + (moto && engine && engine.treadRadiusM && !problems.length ? ' (RPM lean-adjusted from lateral g).' : '.')
      + (problems.length ? ' RPM and gear need a vehicle with a power curve and gearing.' : '')
      + (selectedSimVehicle() && !loadsAdded ? ' Wheel/axle loads need CG height, CG position and wheelbase on the vehicle.' : ''));
    const settings = {
      vehicleClass: moto ? 'motorcycle' : 'car',
      treadRadiusM: engine && engine.treadRadiusM ? engine.treadRadiusM : null,
      massKg: ctx.massKg,
      cda: ctx.cda
    };
    Promise.all(processed.map((p) => saveLoggedSimChannels(p.log, p.cols, selectedSimVehicle(), selectedSimRider(), settings)))
      .then((records) => {
        const saved = records.filter(Boolean).length;
        if (saved && vehicleSimStatus) {
          vehicleSimStatus.textContent += ' Saved as linked file' + (saved === 1 ? '' : 's') + ' (re-applied when the log is loaded again).';
        }
      })
      .catch((err) => console.error('Could not save the simulated channels:', err));
    populateYSelect();
    populateXCustomSelect();
    populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect();
    updatePlot();
  }

  // ── Simulate Vehicle: saving each run ─────────────────────────────────────
  // Every run is stored as a file (so it survives a reload and shows up under "Pick
  // Uploaded Data"), tagged with the vehicle and rider it used, and attached to the
  // session currently selected in the Sessions panel, if there is one. Stored files are
  // keyed by name, so every run needs a unique name or it would silently overwrite the
  // previous sim -- a name clash gets " (2)", " (3)"... The user can rename a sim and
  // add notes afterwards (Save Name & Notes), which update the stored record in place.
  let lastSim = null; // { logId, fileId, name } of the most recent run

  function simFileName(text) {
    const t = String(text || '').trim().replace(/\s+/g, ' ');
    return /\.csv$/i.test(t) ? t : `${t}.csv`;
  }

  function simDisplayName(fileName) {
    return String(fileName || '').replace(/\.csv$/i, '');
  }

  function defaultSimName(log, vehicle) {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}${pad(d.getMinutes())}`;
    const track = String(log.name || '').replace(/^Racing Line\s*—\s*/, '').replace(/\.csv$/i, '');
    return ['Sim', track, vehicle ? describeSimVehicle(vehicle) : '', stamp].filter(Boolean).join(' — ');
  }

  // `ownName` is the sim's own current stored name (re-running or renaming in place),
  // which doesn't count as a clash.
  function uniqueSimFileName(base, ownName) {
    return getAllFilesFromDB().then((entries) => {
      const taken = new Set(entries.map((e) => e.name));
      logs.forEach((l) => { if (!(l.meta && l.meta.racingLine)) taken.add(l.name); });
      if (ownName) taken.delete(ownName);
      if (!taken.has(base)) return base;
      const stem = base.replace(/\.csv$/i, '');
      for (let n = 2; ; n++) {
        const candidate = `${stem} (${n}).csv`;
        if (!taken.has(candidate)) return candidate;
      }
    });
  }

  function refreshAfterSimRename() {
    renderFilesList();
    renderLapsList();
    renderStoredFilesList();
    renderPickerList();
    updatePlot();
    if (window.SessionsUI) window.SessionsUI.renderPanel();
  }

  function saveSimulation(log, rerun) {
    if (!sessionsFiles) return Promise.resolve();
    const vehicle = selectedSimVehicle();
    const rider = selectedSimRider();
    const own = rerun && lastSim ? lastSim.name : null;
    const typed = vehicleSimNameInput ? vehicleSimNameInput.value.trim() : '';
    const desired = own || simFileName(typed || defaultSimName(log, vehicle));
    const notes = vehicleSimNotesInput ? vehicleSimNotesInput.value.trim() : '';
    let sessionName = '';

    return uniqueSimFileName(desired, own).then((name) => {
      log.name = name;
      const text = buildCsvTextForLog(log);
      return sessionsFiles.storeFile(name, text, computeFileHash(text), extractCsvFileMetadata(text));
    }).then((record) => sessionsFiles.updateFileLinks(record.id, {
      vehicle_id: vehicle ? vehicle.id : '',
      rider_id: rider ? rider.id : '',
      metadata: Object.assign({}, record.metadata, { simulated: true, notes })
    })).then((record) => {
      lastSim = { logId: log.id, fileId: record.id, name: record.name };
      if (vehicleSimRenameBtn) vehicleSimRenameBtn.disabled = false;
      const sessionId = window.SessionsUI && window.SessionsUI.getSelectedSessionId
        ? window.SessionsUI.getSelectedSessionId() : null;
      if (!sessionId) return record;
      return sessionsApi.SessionService.getSession(sessionId).then((session) => {
        if (!session) return record;
        sessionName = session.name;
        return sessionsApi.SessionService.addFileToSession(session.id, record.id).then(() => record);
      });
    }).then((record) => {
      if (vehicleSimStatus) {
        vehicleSimStatus.textContent += ` Saved as "${simDisplayName(record.name)}"`
          + (sessionName ? ` and added to session "${sessionName}".` : '.');
      }
      refreshAfterSimRename();
    }).catch((err) => {
      console.error('Could not save the simulation:', err);
      if (vehicleSimStatus) vehicleSimStatus.textContent += ' (Could not save this sim to storage.)';
    });
  }

  // Renames the most recent sim and stores its notes.
  function saveSimDetails() {
    if (!lastSim || !sessionsFiles) return;
    const typed = vehicleSimNameInput ? vehicleSimNameInput.value.trim() : '';
    const notes = vehicleSimNotesInput ? vehicleSimNotesInput.value.trim() : '';
    const desired = typed ? simFileName(typed) : lastSim.name;
    uniqueSimFileName(desired, lastSim.name).then((name) => sessionsFiles.getFile(lastSim.fileId).then((record) => {
      if (!record) throw new Error('The stored sim file no longer exists.');
      return sessionsFiles.updateFileLinks(record.id, {
        name,
        metadata: Object.assign({}, record.metadata, { simulated: true, notes })
      });
    })).then((record) => {
      const log = logs.find((l) => l.id === lastSim.logId);
      if (log) log.name = record.name;
      lastSim.name = record.name;
      if (vehicleSimNameInput) vehicleSimNameInput.value = simDisplayName(record.name);
      if (vehicleSimStatus) vehicleSimStatus.textContent = `Saved sim as "${simDisplayName(record.name)}".`;
      refreshAfterSimRename();
    }).catch((err) => {
      console.error('Could not rename the simulation:', err);
      if (vehicleSimStatus) vehicleSimStatus.textContent = 'Could not save the sim name/notes.';
    });
  }
  if (vehicleSimRenameBtn) vehicleSimRenameBtn.addEventListener('click', saveSimDetails);

  // Serializes a log's own data/cols (not whatever the UI currently has selected) into
  // CSV text, so a synthetic in-memory log (like the simulated racing line) can be
  // persisted as a stored file and attached to a session the same way any uploaded CSV
  // would be.
  function buildCsvTextForLog(log) {
    const cols = Array.isArray(log.cols) ? log.cols.slice() : [];
    // A synthetic log's own distance lives in meta.lapRelDist, not as a data column
    // (the app reads it straight off meta for its own "Distance" X-axis mode). Without
    // an explicit Distance column here, re-importing this CSV has nothing matching
    // file-processors.js's distance-column detection, so it falls back to using the
    // row index as "distance" -- a completely different scale from real meters. Adding
    // it here makes a round trip through Stored Files/a session come back correct.
    const distArr = log.meta && Array.isArray(log.meta.lapRelDist) ? log.meta.lapRelDist : null;
    const hasDistanceCol = cols.some((c) => /dist|distance|odometer/i.test(c));
    if (!hasDistanceCol && distArr) cols.push('Distance');
    const lines = [cols.map(csvEscapeValue).join(',')];
    log.data.forEach((row, i) => {
      lines.push(cols.map((c) => {
        const value = (c === 'Distance' && !hasDistanceCol && distArr) ? distArr[i] : row[c];
        return csvEscapeValue(value);
      }).join(','));
    });
    return lines.join('\n');
  }

  // Persists a synthetic in-memory log (e.g. the simulated racing line) as a stored
  // file, upserted by name the same way a real upload is -- it was never "uploaded", so
  // it has to be stored before a session can reference it (see FileService.storeFile /
  // storeFileInDB), unlike a real log which was already stored back at load time.
  function persistSyntheticLogForSession(log) {
    const text = buildCsvTextForLog(log);
    return storeFileInDB(log.name, text, computeFileHash(text), extractCsvFileMetadata(text));
  }

  // Linear interpolation over a sorted X array.
  function interpAt(xArr, yArr, x) {
    if (!xArr || xArr.length === 0) return null;
    if (x <= xArr[0]) return (yArr[0] != null ? yArr[0] : null);
    if (x >= xArr[xArr.length-1]) return (yArr[yArr.length-1] != null ? yArr[yArr.length-1] : null);

    let lo = 0, hi = xArr.length - 1;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi)/2);
      if (xArr[mid] <= x) lo = mid; else hi = mid;
    }

    const x0 = xArr[lo], x1 = xArr[hi];
    const y0 = yArr[lo], y1 = yArr[hi];
    if (y0 == null || y1 == null) return null;
    if (x1 === x0) return y0;
    const t = (x - x0) / (x1 - x0);
    return y0 + t * (y1 - y0);
  }

  function nearestIndexAtX(xArr, x) {
    if (!Array.isArray(xArr) || xArr.length === 0) return -1;
    if (x <= xArr[0]) return 0;
    if (x >= xArr[xArr.length - 1]) return xArr.length - 1;

    let lo = 0;
    let hi = xArr.length - 1;
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (xArr[mid] <= x) lo = mid;
      else hi = mid;
    }

    return (Math.abs(x - xArr[lo]) <= Math.abs(xArr[hi] - x)) ? lo : hi;
  }

  function buildTimeSlipTraces(selFiles, selectedLaps, xMode) {
    // Time slip is defined only against distance while split by lap.
    if (xMode !== 'distance') {
      return {traces: [], nonCrashMaxDelta: null, nonCrashMinDelta: null, allMaxDelta: null, allMinDelta: null};
    }

    const lapSeries = [];
    const enabledFilters = getEnabledDataFilters();
    selFiles.forEach((log, fileIdx) => {
      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        if (!Array.isArray(log.meta.lapRelDist)) return;
        const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
        const activeFilters = resolveDataFiltersForLog(log, enabledFilters);
        const filteredMaskIdx = applyRowFiltersToMask(log, maskIdx, activeFilters);
        const xArr = getXSeriesForMode(log, filteredMaskIdx, xMode, '');
        if (!xArr || xArr.length <= 1) return;
        const tArr = filteredMaskIdx.map(i => log.meta.lapTime[i]);
          const isCrashLap = !!(log.meta && log.meta.crashLapSet && log.meta.crashLapSet.has(lap));
          const keys = filteredMaskIdx.map(i => rowKey(log.id, lap, i));
          lapSeries.push({file: log.name, fileId: log.id, lap, x: xArr, t: tArr, keys, isCrashLap, fileIdx});
      });
    });

    if (lapSeries.length < 2) {
      return {traces: [], nonCrashMaxDelta: null, nonCrashMinDelta: null, allMaxDelta: null, allMinDelta: null};
    }

    const xSet = new Set();
    lapSeries.forEach(s => s.x.forEach(v => xSet.add(v)));
    const grid = Array.from(xSet).sort((a,b)=>a-b);
    if (grid.length < 2) {
      return {traces: [], nonCrashMaxDelta: null, nonCrashMinDelta: null, allMaxDelta: null, allMinDelta: null};
    }

    const getLapDuration = (series) => {
      for (let i = series.t.length - 1; i >= 0; i--) {
        const value = series.t[i];
        if (value != null && !isNaN(value)) return value;
      }
      return null;
    };

    const candidateIndices = lapSeries.map((s, i) => (!s.isCrashLap ? i : -1)).filter(i => i >= 0);
    const refIndices = candidateIndices.length > 0
      ? candidateIndices
      : lapSeries.map((_, i) => i);
    if (refIndices.length === 0) {
      return {traces: [], nonCrashMaxDelta: null, nonCrashMinDelta: null, allMaxDelta: null, allMinDelta: null};
    }

    let referenceIndex = null;
    let referenceDuration = null;
    refIndices.forEach((index) => {
      const duration = getLapDuration(lapSeries[index]);
      if (duration == null) return;
      if (referenceDuration == null || duration < referenceDuration) {
        referenceDuration = duration;
        referenceIndex = index;
      }
    });
    if (referenceIndex == null) {
      return {traces: [], nonCrashMaxDelta: null, nonCrashMinDelta: null, allMaxDelta: null, allMinDelta: null};
    }

    const timeAt = lapSeries.map(s => grid.map(g => interpAt(s.x, s.t, g)));
    const referenceTimes = grid.map(g => interpAt(lapSeries[referenceIndex].x, lapSeries[referenceIndex].t, g));

    const tsTraces = [];
    let nonCrashMaxDelta = null;
    let nonCrashMinDelta = null;
    let allMaxDelta = null;
    let allMinDelta = null;
    for (let si = 0; si < lapSeries.length; si++) {
      const s = lapSeries[si];
      const deltas = timeAt[si].map((v, gi) => (v == null || referenceTimes[gi] == null) ? null : (v - referenceTimes[gi]));
      if (deltas.every(v => v == null || isNaN(v))) continue;
      const validDeltas = deltas.filter(v => v != null && !isNaN(v));
      if (validDeltas.length > 0) {
        const [traceMin, traceMax] = arrayMinMax(validDeltas);
        if (allMaxDelta == null || traceMax > allMaxDelta) allMaxDelta = traceMax;
        if (allMinDelta == null || traceMin < allMinDelta) allMinDelta = traceMin;
        if (!s.isCrashLap && (nonCrashMaxDelta == null || traceMax > nonCrashMaxDelta)) {
          nonCrashMaxDelta = traceMax;
        }
        if (!s.isCrashLap && (nonCrashMinDelta == null || traceMin < nonCrashMinDelta)) {
          nonCrashMinDelta = traceMin;
        }
      }
      const color = getLapColor(s.fileId, s.lap);
      const dash = getLineDashForFileIndex(s.fileIdx);
      const keyGrid = grid.map((g) => {
        const idx = nearestIndexAtX(s.x, g);
        return idx >= 0 && s.keys ? s.keys[idx] : null;
      });
      tsTraces.push({
        x: grid,
        y: deltas,
        customdata: keyGrid,
        xaxis:'x2',
        yaxis:'y2',
        name: `${s.file} — Lap ${s.lap}`,
        mode:'lines',
        line:{color, dash},
        hovertemplate: 'Lap Distance (m): %{x:.3f}<br>Time Slip (s): %{y:.3f}<extra></extra>'
      });
    }

    return {traces: tsTraces, nonCrashMaxDelta, nonCrashMinDelta, allMaxDelta, allMinDelta};
  }

  function getUnitForChannel(channel) {
    // channel may be a CHANNEL_MAP displayName; resolve per log
    for (const l of logs) {
      const col = resolveChannelForLog(channel, l);
      if (l.meta && l.meta.units && l.meta.units[col] != null) return l.meta.units[col];
    }
    return null;
  }

  // Resolves the axis-grouping key for a channel: a manual override (set via the axis
  // picker in the selected-channels list) wins over the default of grouping by unit.
  // 'peer' overrides chain to whatever axis the target channel currently resolves to, so
  // picking "same as X" keeps working even if X later gets its own override changed; the
  // visited-set guards against a user creating a mutual peer cycle (A -> B -> A), which
  // falls back to giving the channel its own axis rather than looping forever.
  function resolveAxisGroupKey(channel, visited) {
    visited = visited || new Set();
    if (visited.has(channel)) return `own:${channel}`;
    visited.add(channel);
    const override = manualAxisOverrides.get(channel);
    if (override && override.type === 'own') return `own:${channel}`;
    if (override && override.type === 'peer' && override.channel && override.channel !== channel) {
      return resolveAxisGroupKey(override.channel, visited);
    }
    const unit = getUnitForChannel(channel);
    return (unit != null && unit !== '') ? `unit:${unit}` : `own:${channel}`;
  }

  // Groups the given Y channels into the y-axes they'll be plotted on, in plot order.
  // The first channel always anchors the primary axis ('y'); every later channel either
  // joins an existing group (same resolved axis key -- by default same unit, or a manual
  // "plot on the same axis as X" override) or gets a new axis (y3, y4, ... -- y2 is
  // reserved for the time-slip subplot). Shared by the plot's layout builder and by the
  // per-channel axis-picker UI, so both always agree on what "Y1", "Y2", ... mean.
  function groupChannelsByAxis(ycols) {
    const groups = [];
    const keyToGroup = new Map();
    const channelToRef = new Map();
    let extraAxisCount = 0;
    (ycols || []).forEach((channel, i) => {
      const groupKey = resolveAxisGroupKey(channel);
      const unit = getUnitForChannel(channel);
      const existing = keyToGroup.get(groupKey);
      if (existing) {
        existing.channels.push(channel);
        if (unit != null && unit !== '') existing.unit = unit;
        channelToRef.set(channel, existing.axisRef);
        return;
      }
      const axisRef = i === 0 ? 'y' : `y${(++extraAxisCount) + 2}`;
      const group = { axisRef, groupKey, channels: [channel], unit: (unit != null && unit !== '') ? unit : null };
      groups.push(group);
      keyToGroup.set(groupKey, group);
      channelToRef.set(channel, axisRef);
    });
    return { groups, channelToRef };
  }

  function buildChannelAxisConfig(ycols, mainDomain, logY) {
    const mobile = window.innerWidth <= 980;
    const titleObject = (text) => ({ text, standoff: 8 });
    const formatAxisTitle = (channels, unit) => {
      const channelTitle = channels.join(' / ');
      if (channelTitle && unit) return `${channelTitle} [${unit}]`;
      if (channelTitle) return channelTitle;
      if (unit) return `[${unit}]`;
      return 'Value';
    };

    const baseMarginLeft = mobile ? 48 : 80;
    const baseMarginRight = mobile ? 22 : 80;

    if (!ycols || ycols.length === 0) {
      const axisLayout = {yaxis: {title:titleObject('Value'), domain: mainDomain, automargin:true}};
      if (logY) axisLayout.yaxis.type = 'log';
      return {channelToRef: new Map(), axisLayout, marginLeft: baseMarginLeft, marginRight: baseMarginRight};
    }

    const { groups, channelToRef } = groupChannelsByAxis(ycols);
    const axisLayout = {
      yaxis: {title: titleObject(formatAxisTitle(groups[0].channels, groups[0].unit)), domain: mainDomain, automargin:true}
    };
    if (logY) axisLayout.yaxis.type = 'log';

    // Additional overlaid Y axes (skip y2, reserved for time slip subplot)
    let leftExtraCount = 0;
    let rightExtraCount = 0;

    for (let gi = 1; gi < groups.length; gi++) {
      const group = groups[gi];
      const axisKey = `yaxis${group.axisRef.slice(1)}`;
      const side = (gi % 2 === 1) ? 'right' : 'left';

      let position;
      if (side === 'right') {
        position = Math.max(0.62, 1 - rightExtraCount * 0.06);
        rightExtraCount += 1;
      } else {
        leftExtraCount += 1;
        position = Math.min(0.38, leftExtraCount * 0.06);
      }

      axisLayout[axisKey] = {
        title: titleObject(formatAxisTitle(group.channels, group.unit)),
        domain: mainDomain,
        overlaying: 'y',
        anchor: 'free',
        side,
        position,
        automargin: true
      };
      if (logY) axisLayout[axisKey].type = 'log';
    }

    const marginStep = mobile ? 18 : 40;
    const marginLeft = Math.min(baseMarginLeft + leftExtraCount * marginStep, mobile ? 130 : 260);
    const marginRight = Math.min(baseMarginRight + rightExtraCount * marginStep, mobile ? 110 : 260);
    return {channelToRef, axisLayout, marginLeft, marginRight};
  }

  function getFigureHeight(includeTimeSlip, tempPlots) {
    const mobile = window.innerWidth <= 980;
    if (!mobile) {
      const viewportHeight = Math.max(600, window.innerHeight || 900);
      const plotTop = (plotDiv && typeof plotDiv.getBoundingClientRect === 'function')
        ? Math.max(0, Math.round(plotDiv.getBoundingClientRect().top))
        : 220;
      const available = viewportHeight - plotTop - 16;
      const fallback = Math.round(viewportHeight * (includeTimeSlip ? 0.78 : 0.72));
      const target = (Number.isFinite(available) && available > 320) ? available : fallback;
      const minHeight = includeTimeSlip ? 520 : 420;
      const maxHeight = Math.round(viewportHeight * 0.9);
      return Math.max(minHeight, Math.min(target, maxHeight));
    }
    // Mobile targets: main plot ~50dvh -- a comfortable, non-squished height, since the
    // page scrolls on mobile (only the >=981px breakpoint pins body/main to a fixed
    // viewport-bound "everything visible, no scroll" layout; that design stays as-is on
    // desktop). Time Slip and any active temp-profile plots (no drag handle on mobile to
    // trade space with) each add their own height on top of the main plot's, rather than
    // all three splitting one small fixed budget -- see computeMobileTempPlotsHeightPx.
    const main = Math.max(280, Math.round(window.innerHeight * 0.5));
    const timeSlip = includeTimeSlip ? Math.max(160, Math.round(window.innerHeight * 0.25)) : 0;
    const tempPlotsHeight = computeMobileTempPlotsHeightPx(tempPlots);
    return main + timeSlip + tempPlotsHeight;
  }

  function getMapFigureHeight() {
    const mobile = window.innerWidth <= 980;
    if (mobile) return Math.max(200, Math.round(window.innerHeight * 0.33));
    const desktopPlotHeight = Math.round(plotDiv && plotDiv.clientHeight ? plotDiv.clientHeight : 0);
    return Math.max(300, desktopPlotHeight || 640);
  }

  function getMapOffsets() {
    const xOffset = Number(mapXOffsetInput && mapXOffsetInput.value);
    const yOffset = Number(mapYOffsetInput && mapYOffsetInput.value);
    return {
      x: Number.isFinite(xOffset) ? xOffset : 0,
      y: Number.isFinite(yOffset) ? yOffset : 0
    };
  }

  function getManualMapOrigin() {
    const latRaw = mapCenterLatInput ? String(mapCenterLatInput.value).trim() : '';
    const lonRaw = mapCenterLonInput ? String(mapCenterLonInput.value).trim() : '';
    if (!latRaw || !lonRaw) return null;
    const lat = Number(latRaw);
    const lon = Number(lonRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { originLat: lat, originLon: lon };
  }

  function runLeafletProgrammaticView(updateFn) {
    if (!leafletMap || typeof updateFn !== 'function') return;

    isApplyingLeafletProgrammaticView = true;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      isApplyingLeafletProgrammaticView = false;
    };

    leafletMap.once('moveend', release);
    leafletMap.once('zoomend', release);
    updateFn();
    setTimeout(release, 300);
  }

  function setMapOffsetInputs(x, y) {
    if (!mapXOffsetInput || !mapYOffsetInput) return;
    isApplyingAutoOffset = true;
    mapXOffsetInput.value = Number.isFinite(x) ? x.toFixed(3) : '0';
    mapYOffsetInput.value = Number.isFinite(y) ? y.toFixed(3) : '0';
    isApplyingAutoOffset = false;
  }

  function setMapCenterInputsIfAuto(origin) {
    if (!mapCenterLatInput || !mapCenterLonInput) return;
    if (!origin || !Number.isFinite(origin.originLat) || !Number.isFinite(origin.originLon)) return;
    if (mapCenterManuallyAdjusted) return;
    isApplyingAutoCenter = true;
    mapCenterLatInput.value = origin.originLat.toFixed(6);
    mapCenterLonInput.value = origin.originLon.toFixed(6);
    isApplyingAutoCenter = false;
  }

  function applyTrackMapDefaults(trackDefaults) {
    if (!trackDefaults) return false;

    const shouldApplyOffsets = !mapOffsetManuallyAdjusted || lastTrackDefaultSignature !== trackDefaults.signature;
    if (shouldApplyOffsets) {
      setMapOffsetInputs(trackDefaults.xOffset, trackDefaults.yOffset);
      mapOffsetManuallyAdjusted = false;
      lastAutoOffsetSignature = `preset:${trackDefaults.signature}`;
      lastTrackDefaultSignature = trackDefaults.signature;
    }

    setMapCenterInputsIfAuto({
      originLat: trackDefaults.latitude,
      originLon: trackDefaults.longitude
    });

    return shouldApplyOffsets || !mapCenterManuallyAdjusted;
  }

  function buildCenterInfoSuffix(origin) {
    if (!origin || !Number.isFinite(origin.originLat) || !Number.isFinite(origin.originLon)) return '';
    return ` | Center Lat/Lng ${origin.originLat.toFixed(6)}, ${origin.originLon.toFixed(6)}`;
  }

  function updateMapFitInfo(text) {
    if (!mapFitInfo) return;
    mapFitInfo.textContent = text || '';
  }

  function getNativeXYCols(log) {
    const cols = Array.isArray(log.cols) ? log.cols : [];
    const xCol = findColumnIgnoreCase(cols, ['PosX']);
    const yCol = findColumnIgnoreCase(cols, ['PosY']);
    if (!xCol || !yCol) return null;
    return { xCol, yCol };
  }

  function getRowIndicesForLap(log, lap, selectedLaps) {
    if (!isLapSelected(selectedLaps, log.id, lap)) return [];
    return (log.meta.lapNum || []).map((n, i) => n === lap ? i : -1).filter(i => i >= 0);
  }

  function collectPointSeries(log, indices, getterX, getterY) {
    const points = [];
    indices.forEach((idx) => {
      const x = Number(getterX(idx));
      const y = Number(getterY(idx));
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      points.push({ x, y });
    });
    return points;
  }

  function buildLapAlignedPairs(posPts, mapPts) {
    const n = Math.min(posPts.length, mapPts.length);
    if (n < 2) return [];
    if (n === 2) {
      return [
        { posX: posPts[0].x, posY: posPts[0].y, mapX: mapPts[0].x, mapY: mapPts[0].y },
        { posX: posPts[1].x, posY: posPts[1].y, mapX: mapPts[1].x, mapY: mapPts[1].y }
      ];
    }

    const pairs = [];
    for (let k = 0; k < n; k++) {
      const posIdx = Math.floor((k * (posPts.length - 1)) / (n - 1));
      const mapIdx = Math.floor((k * (mapPts.length - 1)) / (n - 1));
      const p = posPts[posIdx];
      const m = mapPts[mapIdx];
      pairs.push({ posX: p.x, posY: p.y, mapX: m.x, mapY: m.y });
    }
    return pairs;
  }

  function normalizeDistancePointSeries(points) {
    if (!Array.isArray(points)) return [];
    const normalized = [];
    points.forEach((point) => {
      if (!point) return;
      const distance = Number(point.distance);
      const x = Number(point.x);
      const y = Number(point.y);
      if (!Number.isFinite(distance) || !Number.isFinite(x) || !Number.isFinite(y)) return;

      const nextPoint = { distance, x, y };
      if (normalized.length === 0) {
        normalized.push(nextPoint);
        return;
      }

      const lastPoint = normalized[normalized.length - 1];
      if (distance < lastPoint.distance) return;
      if (Math.abs(distance - lastPoint.distance) <= 1e-6) {
        normalized[normalized.length - 1] = nextPoint;
        return;
      }

      normalized.push(nextPoint);
    });
    return normalized;
  }

  function interpolateDistancePointSeries(points, targetDistance) {
    if (!Array.isArray(points) || points.length < 2) return null;
    const target = Number(targetDistance);
    if (!Number.isFinite(target)) return null;

    const first = points[0];
    const last = points[points.length - 1];
    if (target < first.distance || target > last.distance) return null;

    let low = 0;
    let high = points.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midPoint = points[mid];
      if (Math.abs(midPoint.distance - target) <= 1e-6) {
        return { distance: target, x: midPoint.x, y: midPoint.y };
      }
      if (midPoint.distance < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const rightIndex = Math.min(points.length - 1, Math.max(1, low));
    const leftPoint = points[rightIndex - 1];
    const rightPoint = points[rightIndex];
    const span = rightPoint.distance - leftPoint.distance;
    if (!Number.isFinite(span) || span <= 0) {
      return { distance: target, x: leftPoint.x, y: leftPoint.y };
    }

    const ratio = (target - leftPoint.distance) / span;
    return {
      distance: target,
      x: leftPoint.x + (rightPoint.x - leftPoint.x) * ratio,
      y: leftPoint.y + (rightPoint.y - leftPoint.y) * ratio
    };
  }

  function buildDistanceAlignedPairs(posPts, mapPts, sampleStepMeters = AUTO_MAP_OFFSET_SAMPLE_STEP_M) {
    const posSeries = normalizeDistancePointSeries(posPts);
    const mapSeries = normalizeDistancePointSeries(mapPts);
    if (posSeries.length < 2 || mapSeries.length < 2) return [];

    const overlapStart = Math.max(posSeries[0].distance, mapSeries[0].distance);
    const overlapEnd = Math.min(posSeries[posSeries.length - 1].distance, mapSeries[mapSeries.length - 1].distance);
    if (!Number.isFinite(overlapStart) || !Number.isFinite(overlapEnd) || overlapEnd <= overlapStart) return [];

    const step = Number.isFinite(sampleStepMeters) && sampleStepMeters > 0 ? sampleStepMeters : AUTO_MAP_OFFSET_SAMPLE_STEP_M;
    const sampleDistances = [];
    for (let distance = overlapStart; distance <= overlapEnd; distance += step) {
      sampleDistances.push(distance);
    }
    if (sampleDistances.length === 0 || Math.abs(sampleDistances[0] - overlapStart) > 1e-6) {
      sampleDistances.unshift(overlapStart);
    }
    if (Math.abs(sampleDistances[sampleDistances.length - 1] - overlapEnd) > 1e-6) {
      sampleDistances.push(overlapEnd);
    }

    const pairs = [];
    sampleDistances.forEach((distance) => {
      const posPoint = interpolateDistancePointSeries(posSeries, distance);
      const mapPoint = interpolateDistancePointSeries(mapSeries, distance);
      if (!posPoint || !mapPoint) return;
      pairs.push({ posX: posPoint.x, posY: posPoint.y, mapX: mapPoint.x, mapY: mapPoint.y });
    });

    return pairs.length >= 2 ? pairs : [];
  }

  function getDerivedMapLogs(selFiles) {
    return selFiles.filter(l => Array.isArray(l.cols) && l.cols.includes(DERIVED_MAP_X_COL) && l.cols.includes(DERIVED_MAP_Y_COL) && !(l.meta && l.meta.racingLine));
  }

  function getNativeXYLogs(selFiles) {
    return selFiles.filter(l => !!getNativeXYCols(l));
  }

  function computeAutoMapOffsetFit(selFiles, selectedLaps, sampleStepMeters = AUTO_MAP_OFFSET_SAMPLE_STEP_M) {
    if (!window.MapCoordinateUtils || typeof window.MapCoordinateUtils.fitTranslationLeastSquares !== 'function') return null;

    const mapLogs = getDerivedMapLogs(selFiles);
    const posLogs = getNativeXYLogs(selFiles);
    if (mapLogs.length === 0 || posLogs.length === 0) return null;

    let best = null;

    posLogs.forEach((posLog) => {
      const posCols = getNativeXYCols(posLog);
      if (!posCols) return;

      mapLogs.forEach((mapLog) => {
        const posLapSet = new Set(posLog.meta.lapNum || []);
        const mapLapSet = new Set(mapLog.meta.lapNum || []);
        const sharedLaps = Array.from(posLapSet).filter(l => mapLapSet.has(l)).sort((a, b) => a - b);
        if (sharedLaps.length === 0) return;

        const allPairs = [];
        let usedDistanceSampling = false;
        sharedLaps.forEach((lap) => {
          const posIdx = getRowIndicesForLap(posLog, lap, selectedLaps);
          const mapIdx = getRowIndicesForLap(mapLog, lap, selectedLaps);
          if (posIdx.length < 2 || mapIdx.length < 2) return;

          const posPts = collectPointSeries(posLog, posIdx, i => posLog.data[i][posCols.xCol], i => posLog.data[i][posCols.yCol]);
          const mapBaseX = mapLog.meta && mapLog.meta.mapDerivedXY && Array.isArray(mapLog.meta.mapDerivedXY.x)
            ? mapLog.meta.mapDerivedXY.x
            : null;
          const mapBaseY = mapLog.meta && mapLog.meta.mapDerivedXY && Array.isArray(mapLog.meta.mapDerivedXY.y)
            ? mapLog.meta.mapDerivedXY.y
            : null;
          const mapPts = collectPointSeries(
            mapLog,
            mapIdx,
            i => mapBaseX ? mapBaseX[i] : mapLog.data[i][DERIVED_MAP_X_COL],
            i => mapBaseY ? mapBaseY[i] : mapLog.data[i][DERIVED_MAP_Y_COL]
          );
          const posDistances = posLog.meta && Array.isArray(posLog.meta.lapRelDist) ? posLog.meta.lapRelDist : null;
          const mapDistances = mapLog.meta && Array.isArray(mapLog.meta.lapRelDist) ? mapLog.meta.lapRelDist : null;

          if (posDistances && mapDistances) {
            const posDistancePts = posIdx.map(i => ({
              distance: Number(posDistances[i]),
              x: Number(posLog.data[i][posCols.xCol]),
              y: Number(posLog.data[i][posCols.yCol])
            }));
            const mapDistancePts = mapIdx.map(i => ({
              distance: Number(mapDistances[i]),
              x: Number(mapBaseX ? mapBaseX[i] : mapLog.data[i][DERIVED_MAP_X_COL]),
              y: Number(mapBaseY ? mapBaseY[i] : mapLog.data[i][DERIVED_MAP_Y_COL])
            }));
            const distancePairs = buildDistanceAlignedPairs(posDistancePts, mapDistancePts, sampleStepMeters);
            if (distancePairs.length >= 2) {
              allPairs.push(...distancePairs);
              usedDistanceSampling = true;
              return;
            }
            allPairs.push(...buildLapAlignedPairs(posPts, mapPts));
          } else {
            allPairs.push(...buildLapAlignedPairs(posPts, mapPts));
          }
        });

        const fit = window.MapCoordinateUtils.fitTranslationLeastSquares(allPairs);
        if (!fit || !Number.isFinite(fit.offsetX) || !Number.isFinite(fit.offsetY) || fit.pairCount < 2) return;

        const candidate = {
          ...fit,
          posLog,
          mapLog,
          originLat: mapLog.meta && mapLog.meta.mapDerivedXY ? mapLog.meta.mapDerivedXY.originLat : null,
          originLon: mapLog.meta && mapLog.meta.mapDerivedXY ? mapLog.meta.mapDerivedXY.originLon : null,
          lapCount: sharedLaps.length,
          sampleStepMeters: usedDistanceSampling ? sampleStepMeters : null,
          fitMode: usedDistanceSampling ? 'distance' : 'lap'
        };

        if (!best) {
          best = candidate;
          return;
        }
        if (candidate.pairCount > best.pairCount) {
          best = candidate;
          return;
        }
        if (candidate.pairCount === best.pairCount && Number.isFinite(candidate.meanAbsError) && Number.isFinite(best.meanAbsError) && candidate.meanAbsError < best.meanAbsError) {
          best = candidate;
        }
      });
    });

    return best;
  }

  function updateGpBikesDerivedLatLon(offsets, origin) {
    if (!window.MapCoordinateUtils || typeof window.MapCoordinateUtils.localXYToLatLonMeters !== 'function') return false;
    if (!origin || !Number.isFinite(origin.originLat) || !Number.isFinite(origin.originLon)) return false;

    let addedCols = false;
    logs.forEach((log) => {
      const nativeCols = getNativeXYCols(log);
      if (!nativeCols) return;

      if (!log.cols.includes(DERIVED_LAT_COL)) {
        log.cols.push(DERIVED_LAT_COL);
        addedCols = true;
      }
      if (!log.cols.includes(DERIVED_LON_COL)) {
        log.cols.push(DERIVED_LON_COL);
        addedCols = true;
      }
      if (!log.meta.units || typeof log.meta.units !== 'object') log.meta.units = {};
      log.meta.units[DERIVED_LAT_COL] = 'deg';
      log.meta.units[DERIVED_LON_COL] = 'deg';

      log.data.forEach((row) => {
        const posX = Number(row[nativeCols.xCol]);
        const posY = Number(row[nativeCols.yCol]);
        if (!Number.isFinite(posX) || !Number.isFinite(posY)) {
          row[DERIVED_LAT_COL] = null;
          row[DERIVED_LON_COL] = null;
          return;
        }

        const localX = posX - offsets.x;
        const localY = posY - offsets.y;
        const ll = window.MapCoordinateUtils.localXYToLatLonMeters(localX, localY, origin.originLat, origin.originLon);
        row[DERIVED_LAT_COL] = ll ? ll.lat : null;
        row[DERIVED_LON_COL] = ll ? ll.lon : null;
      });

      // A simulated lap only has racing-line X/Y; give it Map X/Y the way GPS logs get them:
      // lat/lng -> local meters about the same origin, then the current map offsets.
      if (log.meta && log.meta.racingLine && typeof window.MapCoordinateUtils.buildDerivedXY === 'function') {
        const base = window.MapCoordinateUtils.buildDerivedXY(
          log.data.map((r) => r[DERIVED_LAT_COL]),
          log.data.map((r) => r[DERIVED_LON_COL]),
          origin
        );
        if (base) {
          log.meta.mapDerivedXY = base;
          [DERIVED_MAP_X_COL, DERIVED_MAP_Y_COL].forEach((c) => {
            if (!log.cols.includes(c)) { log.cols.push(c); addedCols = true; }
          });
          log.meta.units[DERIVED_MAP_X_COL] = 'm';
          log.meta.units[DERIVED_MAP_Y_COL] = 'm';
          log.data.forEach((row, i) => {
            const x0 = Number(base.x[i]);
            const y0 = Number(base.y[i]);
            row[DERIVED_MAP_X_COL] = Number.isFinite(x0) ? x0 + offsets.x : null;
            row[DERIVED_MAP_Y_COL] = Number.isFinite(y0) ? y0 + offsets.y : null;
          });
        }
      }
    });

    return addedCols;
  }

  function getFirstDerivedMapOrigin(selFiles) {
    const candidates = Array.isArray(selFiles) && selFiles.length > 0 ? selFiles : logs;
    for (const log of candidates) {
      const origin = log && log.meta && !log.meta.racingLine && log.meta.mapDerivedXY;
      if (!origin) continue;
      if (Number.isFinite(origin.originLat) && Number.isFinite(origin.originLon)) {
        return { originLat: origin.originLat, originLon: origin.originLon };
      }
    }
    return null;
  }

  function maybeAutoFitOffsets(selFiles, selectedLaps) {
    const trackDefaults = getSelectedGpBikesTrackDefaults(selFiles);

    // Apply JSON track defaults (center + offsets) when a venue match is found.
    if (trackDefaults) {
      applyTrackMapDefaults(trackDefaults);
    }

    // Auto-populate center from AiM-derived GPS origin when there are no JSON
    // defaults and the user has not manually entered a center value.
    const aimOrigin = getFirstDerivedMapOrigin(selFiles);
    if (!trackDefaults && aimOrigin) {
      setMapCenterInputsIfAuto(aimOrigin);
    }

    // Resolve the best available origin for deriving GPBikes lat/lon.
    const presetOrigin = trackDefaults
      ? { originLat: trackDefaults.latitude, originLon: trackDefaults.longitude }
      : null;
    const resolvedOrigin = getManualMapOrigin() || presetOrigin || aimOrigin;

    if (resolvedOrigin) {
      const addedCols = updateGpBikesDerivedLatLon(getMapOffsets(), resolvedOrigin);
      if (addedCols) {
        populateYSelect();
        populateXCustomSelect();
      }
    }

    // Status line — never says "auto fit"; tells the user what is active.
    const offsets = getMapOffsets();
    const centerSuffix = resolvedOrigin ? buildCenterInfoSuffix(resolvedOrigin) : '';
    if (trackDefaults) {
      updateMapFitInfo(`Track defaults: "${trackDefaults.venue}"${centerSuffix} | Offset X=${offsets.x.toFixed(3)} m, Y=${offsets.y.toFixed(3)} m`);
    } else if (resolvedOrigin) {
      const originLabel = aimOrigin ? 'AiM GPS origin' : 'manual entry';
      updateMapFitInfo(`Center from ${originLabel}${centerSuffix} | Offset X=${offsets.x.toFixed(3)} m, Y=${offsets.y.toFixed(3)} m — click "Fit X,Y to Lat/Lng" to auto-compute offsets.`);
    } else {
      updateMapFitInfo('Enter Center Lat/Lng (or load a file with GPS data), then click "Fit X,Y to Lat/Lng".');
    }
  }

  function runManualFit() {
    const selFiles = getSelectedFiles();
    const selectedLaps = getSelectedLaps();
    const fit = computeAutoMapOffsetFit(selFiles, selectedLaps, AUTO_MAP_OFFSET_SAMPLE_STEP_M);

    if (!fit) {
      updateMapFitInfo('Fit failed: load both a GPS/Lat-Lng file and a GPBikes PosX/PosY file, then try again.');
      return;
    }

    setMapOffsetInputs(fit.offsetX, fit.offsetY);
    mapOffsetManuallyAdjusted = false;
    lastAutoOffsetSignature = `manual:${fit.posLog.id}|${fit.mapLog.id}|${fit.pairCount}`;
    lastTrackDefaultSignature = '';

    const fitOrigin = { originLat: fit.originLat, originLon: fit.originLon };
    setMapCenterInputsIfAuto(fitOrigin);

    const addedCols = updateGpBikesDerivedLatLon(getMapOffsets(), fitOrigin);
    if (addedCols) {
      populateYSelect();
      populateXCustomSelect();
    }

    applyOffsetsToDerivedMapXY(getMapOffsets());

    const fitErr = Number.isFinite(fit.meanAbsError) ? fit.meanAbsError.toFixed(3) : 'n/a';
    const centerSuffix = buildCenterInfoSuffix(fitOrigin);
    const fitDetail = fit.fitMode === 'distance' && Number.isFinite(fit.sampleStepMeters)
      ? `${fit.pairCount} samples @ ${fit.sampleStepMeters} m`
      : `${fit.pairCount} lap-aligned pairs`;
    updateMapFitInfo(`Fit: X=${fit.offsetX.toFixed(3)} m, Y=${fit.offsetY.toFixed(3)} m | Avg error ${fitErr} m (${fitDetail})${centerSuffix}`);

    updatePlot();
  }

  function findColumnIgnoreCase(cols, candidates) {
    if (!Array.isArray(cols) || !Array.isArray(candidates)) return null;
    const lowered = new Map(cols.map(col => [String(col).trim().toLowerCase(), col]));
    for (const candidate of candidates) {
      const hit = lowered.get(String(candidate).trim().toLowerCase());
      if (hit) return hit;
    }
    return null;
  }

  function findLatLonColumns(cols, meta) {
    const lat = (meta && meta.latCol) || findColumnIgnoreCase(cols, ['GPS Latitude', 'Latitude', 'Lat']);
    const lon = (meta && meta.lonCol) || findColumnIgnoreCase(cols, ['GPS Longitude', 'Longitude', 'Lon', 'Lng']);
    if (!lat || !lon) return null;
    return { latCol: lat, lonCol: lon };
  }

  function deriveAndExposeMapXY(data, cols, meta) {
    if (!window.MapCoordinateUtils || !Array.isArray(data) || !Array.isArray(cols) || !meta) return false;

    const latLonCols = findLatLonColumns(cols, meta);
    if (!latLonCols) return false;

    const latSeries = data.map(r => r[latLonCols.latCol]);
    const lonSeries = data.map(r => r[latLonCols.lonCol]);
    const derivedXY = window.MapCoordinateUtils.buildDerivedXY(latSeries, lonSeries);
    if (!derivedXY) return false;

    meta.latCol = latLonCols.latCol;
    meta.lonCol = latLonCols.lonCol;
    meta.mapDerivedXY = derivedXY;

    if (!cols.includes(DERIVED_MAP_X_COL)) cols.push(DERIVED_MAP_X_COL);
    if (!cols.includes(DERIVED_MAP_Y_COL)) cols.push(DERIVED_MAP_Y_COL);
    data.forEach((row, i) => {
      row[DERIVED_MAP_X_COL] = derivedXY.x[i];
      row[DERIVED_MAP_Y_COL] = derivedXY.y[i];
    });
    if (!meta.units || typeof meta.units !== 'object') meta.units = {};
    meta.units[DERIVED_MAP_X_COL] = 'm';
    meta.units[DERIVED_MAP_Y_COL] = 'm';
    return true;
  }

  function applyOffsetsToDerivedMapXY(offsets) {
    logs.forEach((log) => {
      if (!log || !log.meta || !log.meta.mapDerivedXY) return;
      const baseX = Array.isArray(log.meta.mapDerivedXY.x) ? log.meta.mapDerivedXY.x : null;
      const baseY = Array.isArray(log.meta.mapDerivedXY.y) ? log.meta.mapDerivedXY.y : null;
      if (!baseX || !baseY) return;

      if (!log.cols.includes(DERIVED_MAP_X_COL)) log.cols.push(DERIVED_MAP_X_COL);
      if (!log.cols.includes(DERIVED_MAP_Y_COL)) log.cols.push(DERIVED_MAP_Y_COL);
      if (!log.meta.units || typeof log.meta.units !== 'object') log.meta.units = {};
      log.meta.units[DERIVED_MAP_X_COL] = 'm';
      log.meta.units[DERIVED_MAP_Y_COL] = 'm';

      for (let i = 0; i < log.data.length; i++) {
        const x0 = Number(baseX[i]);
        const y0 = Number(baseY[i]);
        log.data[i][DERIVED_MAP_X_COL] = Number.isFinite(x0) ? x0 + offsets.x : null;
        log.data[i][DERIVED_MAP_Y_COL] = Number.isFinite(y0) ? y0 + offsets.y : null;
      }
    });
  }

  function getMapSourceForLog(log) {
    const cols = Array.isArray(log.cols) ? log.cols : [];
    const LP = window.LogFileProcessors;
    const fmt = (log.meta && log.meta.format) ? log.meta.format : '';

    if (LP && LP.isGPBikesFormat(fmt)) {
      const posX = findColumnIgnoreCase(cols, ['PosX']);
      const posY = findColumnIgnoreCase(cols, ['PosY']);
      if (posX && posY) {
        return {
          type: 'native-xy',
          xAt: (index) => Number(log.data[index][posX]),
          yAt: (index) => Number(log.data[index][posY]),
          axisXTitle: 'Map X (m)',
          axisYTitle: 'Map Y (m)',
          hoverXTitle: posX,
          hoverYTitle: posY
        };
      }
    }

    if (cols.includes(DERIVED_MAP_X_COL) && cols.includes(DERIVED_MAP_Y_COL)) {
      return {
        type: 'derived-latlon',
        xAt: (index) => Number(log.data[index][DERIVED_MAP_X_COL]),
        yAt: (index) => Number(log.data[index][DERIVED_MAP_Y_COL]),
        axisXTitle: 'Map X (m)',
        axisYTitle: 'Map Y (m)',
        hoverXTitle: DERIVED_MAP_X_COL,
        hoverYTitle: DERIVED_MAP_Y_COL
      };
    }

    if (log.meta && log.meta.mapDerivedXY && Array.isArray(log.meta.mapDerivedXY.x) && Array.isArray(log.meta.mapDerivedXY.y)) {
      return {
        type: 'derived-latlon',
        xAt: (index) => log.meta.mapDerivedXY.x[index],
        yAt: (index) => log.meta.mapDerivedXY.y[index],
        axisXTitle: 'Map X (m)',
        axisYTitle: 'Map Y (m)',
        hoverXTitle: 'Map X (m)',
        hoverYTitle: 'Map Y (m)'
      };
    }

    if (deriveAndExposeMapXY(log.data, cols, log.meta)) {
      return {
        type: 'derived-latlon',
        xAt: (index) => Number(log.data[index][DERIVED_MAP_X_COL]),
        yAt: (index) => Number(log.data[index][DERIVED_MAP_Y_COL]),
        axisXTitle: 'Map X (m)',
        axisYTitle: 'Map Y (m)',
        hoverXTitle: DERIVED_MAP_X_COL,
        hoverYTitle: DERIVED_MAP_Y_COL
      };
    }

    const posX = findColumnIgnoreCase(cols, ['PosX']);
    const posY = findColumnIgnoreCase(cols, ['PosY']);
    if (posX && posY) {
      return {
        type: 'native-xy',
        xAt: (index) => Number(log.data[index][posX]),
        yAt: (index) => Number(log.data[index][posY]),
        axisXTitle: 'Map X (m)',
        axisYTitle: 'Map Y (m)',
        hoverXTitle: posX,
        hoverYTitle: posY
      };
    }

    return null;
  }

  function updateMapPlot(selFiles, selectedLaps) {
    if (!mapDiv) return;
    const mapColorEnabled = !!(mapColorEnabledInput && mapColorEnabledInput.checked);
    const mapColorChannel = mapColorSelect ? mapColorSelect.value : '';
    const mapColorMode = mapColorModeSelect ? mapColorModeSelect.value : 'continuous';
    const traces = [];
    const pendingTraces = [];
    const nextHoverLookup = new Map();
    let axisTitles = { x: 'Map X (m)', y: 'Map Y (m)' };
    let mapColorMin = Infinity;
    let mapColorMax = -Infinity;

    selFiles.forEach((log, fileIdx) => {
      const mapSource = getMapSourceForLog(log);
      if (!mapSource) return;
      axisTitles = { x: mapSource.axisXTitle, y: mapSource.axisYTitle };
      const mapColorCol = mapColorEnabled && mapColorChannel ? resolveChannelForLog(mapColorChannel, log) : '';
      const canColorByChannel = !!(mapColorEnabled && mapColorCol && log.cols.includes(mapColorCol));

      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        const maskIdx = log.meta.lapNum.map((n, i) => n === lap ? i : -1).filter(i => i >= 0);
        const xArr = [];
        const yArr = [];
        const keyArr = [];
        const colorArr = [];
        maskIdx.forEach((i) => {
          const xRaw = mapSource.xAt(i);
          const yRaw = mapSource.yAt(i);
          if (!Number.isFinite(xRaw) || !Number.isFinite(yRaw)) return;
          if (canColorByChannel) {
            const colorValue = Number(log.data[i][mapColorCol]);
            if (!Number.isFinite(colorValue)) return;
            colorArr.push(colorValue);
            if (colorValue < mapColorMin) mapColorMin = colorValue;
            if (colorValue > mapColorMax) mapColorMax = colorValue;
          }
          const x = xRaw;
          const y = yRaw;
          const key = rowKey(log.id, lap, i);
          xArr.push(x);
          yArr.push(y);
          keyArr.push(key);
          nextHoverLookup.set(key, { x, y });
        });
        if (xArr.length < 2) return;

        const color = getLapColor(log.id, lap);
        const dash = DASHES[fileIdx % DASHES.length];
        pendingTraces.push({
          x: xArr,
          y: yArr,
          colorArr: canColorByChannel ? colorArr : null,
          mode: 'lines',
          customdata: keyArr,
          name: `${log.name} — Lap ${lap}`,
          line: { color, dash },
          hovertemplate: `${log.name}<br>Lap ${lap}<br>${mapSource.hoverXTitle}: %{x}<br>${mapSource.hoverYTitle}: %{y}<extra></extra>`
        });
      });
    });

    const manualRange = mapColorEnabled && mapColorChannel
      ? leafletMapColorManualRanges.get(mapColorChannel)
      : null;
    const normalizedManualRange = manualRange
      ? normalizeManualMapColorBounds(Number(manualRange.min), Number(manualRange.max))
      : null;
    const effectiveColorMin = normalizedManualRange ? normalizedManualRange.min : mapColorMin;
    const effectiveColorMax = normalizedManualRange ? normalizedManualRange.max : mapColorMax;
    const mapColorScaleConfig = mapColorEnabled
      ? getMapColorScaleConfig(effectiveColorMin, effectiveColorMax, mapColorMode)
      : null;

    let mapColorTraceUsed = false;
    pendingTraces.forEach((entry) => {
      const trace = {
        x: entry.x,
        y: entry.y,
        customdata: entry.customdata,
        name: entry.name,
        line: entry.line,
        hovertemplate: entry.hovertemplate,
        mode: entry.mode
      };

      if (mapColorEnabled && mapColorScaleConfig && Array.isArray(entry.colorArr) && entry.colorArr.length === entry.x.length && entry.colorArr.length > 0) {
        trace.mode = 'lines+markers';
        trace.marker = {
          size: 6,
          color: entry.colorArr,
          colorscale: mapColorScaleConfig.colorscale,
          cmin: mapColorScaleConfig.cmin,
          cmax: mapColorScaleConfig.cmax,
          showscale: !mapColorTraceUsed,
          colorbar: !mapColorTraceUsed ? { title: { text: mapColorChannel || 'Map Color' } } : undefined
        };
        mapColorTraceUsed = true;
      }

      traces.push(trace);
    });

    if (traces.length === 0) {
      mapHoverLookup = new Map();
      mapHoverMarkerVisible = false;
      mapViewState = null;
      Plotly.purge(mapDiv);
      return;
    }

    traces.push({
      x: [],
      y: [],
      mode: 'markers',
      name: HOVER_MARKER_TRACE_NAME,
      showlegend: false,
      hoverinfo: 'skip',
      marker: {
        color: '#111',
        size: 12,
        symbol: 'circle-open',
        line: { color: '#111', width: 2 }
      },
      visible: false
    });

    const isMobile = window.innerWidth <= 980;
    const mapLayout = {
      margin: { t: 30, l: isMobile ? 52 : 60, r: isMobile ? 10 : 20, b: 55 },
      xaxis: { title: (axisTitles && axisTitles.x) || 'Map X (m)', automargin: true },
      yaxis: {
        title: (axisTitles && axisTitles.y) || 'Map Y (m)',
        automargin: true,
        scaleanchor: 'x',
        scaleratio: 1
      },
      showlegend: false,
      height: getMapFigureHeight(),
      uirevision: 'map-view-state'
    };

    if (mapViewState && Array.isArray(mapViewState.xRange) && Array.isArray(mapViewState.yRange)) {
      mapLayout.xaxis.range = mapViewState.xRange.slice();
      mapLayout.yaxis.range = mapViewState.yRange.slice();
      mapLayout.xaxis.autorange = false;
      mapLayout.yaxis.autorange = false;
    }

    mapLayout.template = getPlotlyThemeTemplate();
    Plotly.react(mapDiv, traces, mapLayout, plotlyConfig);
    bindMapViewStateSync();
    mapHoverLookup = nextHoverLookup;
    mapHoverMarkerVisible = false;
  }

  function initLeafletMap(mode) {
    if (!leafletMapDiv) return;

    // Recreate the map if switching between geo and XY modes.
    if (leafletMap && leafletMapMode !== mode) {
      leafletMap.remove();
      leafletMap = null;
      leafletLayers = [];
      leafletHoverMarker = null;
      leafletOsmLayer = null;
    }

    if (leafletMap && leafletMapMode === mode) return;

    syncLeafletContainerHeight();

    // Used by the blank basemap so white values in divergent colormaps remain visible.
    leafletMapDiv.style.background = getBlankBasemapBackground();

    if (mode === 'xy') {
      leafletMap = L.map(leafletMapDiv, {
        crs: L.CRS.Simple,
        zoomSnap: 0,
        zoomDelta: 0.5,
        minZoom: -6,
        zoomControl: false
      }).setView([0, 0], 0);
    } else {
      // Geo mode with map tiles.
      leafletMap = L.map(leafletMapDiv, { zoomControl: false }).setView([40.0, -75.0], 10);

      // maxZoom is higher than Esri's own native resolution -- EsriOverzoomTileLayer
      // handles the gap by cropping/scaling the deepest real imagery it can find rather
      // than showing Esri's "not yet available" placeholder tile.
      const satelliteLayer = new EsriOverzoomTileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DigitalGlobe, Earthstar Geographics',
          maxZoom: 22
        }
      ).addTo(leafletMap);

      leafletOsmLayer = L.tileLayer(
        getOsmTileUrl(),
        {
          attribution: OSM_TILE_ATTRIBUTION,
          maxZoom: 19
        }
      );

      const blankLayer = L.layerGroup();
      L.control.layers(
        {
          'Satellite': satelliteLayer,
          'OpenStreetMap': leafletOsmLayer,
          'Blank (gray)': blankLayer
        },
        {},
        { position: 'topright' }
      ).addTo(leafletMap);
    }

    // Zoom is already reachable via mouse wheel / two-finger pinch, so the +/- buttons
    // are replaced with a full-screen toggle in the same corner instead.
    buildFullscreenControl().addTo(leafletMap);

    leafletMap.on('moveend zoomend', () => {
      if (isApplyingLeafletProgrammaticView) return;
      const center = leafletMap.getCenter();
      const zoom = leafletMap.getZoom();
      if (!center || !Number.isFinite(center.lat) || !Number.isFinite(center.lng) || !Number.isFinite(zoom)) return;
      if (leafletMapMode === 'xy') {
        leafletXYViewState = {
          center: [center.lat, center.lng],
          zoom
        };
        leafletXYViewStateUserSet = true;
      } else {
        leafletViewState = {
          center: [center.lat, center.lng],
          zoom
        };
        leafletViewStateUserSet = true;
      }
    });

    leafletMapMode = mode;

    // Ensure the map computes tile layout after the element has final dimensions.
    requestAnimationFrame(() => leafletMap.invalidateSize());
  }

  // ── Map full-screen mode + floating "add note" FAB ───────────────────────
  // The map's own +/- zoom buttons (removed above -- mouse wheel / two-finger pinch
  // already zoom) are replaced with a full-screen toggle. While full-screen, a floating
  // action button arms "pin a note on the map" -- the Sessions panel itself is hidden
  // behind the full-screen map, so picking a location opens a small floating note card
  // on top of the map instead of the panel's own composer (see openFullscreenNoteCard
  // and SessionsUI.quickCreateNoteAtLocation).

  const FULLSCREEN_ENTER_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
  const FULLSCREEN_EXIT_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>';

  let leafletFullscreenBtn = null;
  let mapFullscreenFab = null;
  let mapFullscreenNoteCard = null;
  let fabNotePickArmed = false;
  let mapFullscreenIsNative = false; // true once the browser's own Fullscreen API is active

  function nativeFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  // document.exitFullscreen/webkitExitFullscreen and requestFullscreen/webkitRequestFullscreen
  // cover current evergreen browsers plus Safari, which still needs the -webkit- prefix.
  function requestNativeFullscreen(target) {
    const request = target.requestFullscreen || target.webkitRequestFullscreen;
    if (!request) return Promise.reject(new Error('Fullscreen API not supported'));
    return Promise.resolve(request.call(target));
  }

  function exitNativeFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit) return Promise.resolve();
    return Promise.resolve(exit.call(document));
  }

  ['fullscreenchange', 'webkitfullscreenchange'].forEach((evtName) => {
    document.addEventListener(evtName, () => {
      const fsEl = nativeFullscreenElement();
      if (fsEl === leafletMapDiv) {
        applyMapFullscreenState(true, true);
      } else if (mapFullscreenIsNative) {
        // Native full-screen just ended -- Esc, the browser's own exit control, or
        // another tab entering full-screen all land here, not just our own button.
        applyMapFullscreenState(false, false);
      }
    });
  });

  function buildFullscreenControl() {
    // Same corner the zoom buttons used to occupy. The attribution strip at the bottom
    // can span nearly the map's full width at its default (fairly narrow) size, so this
    // control gets an extra top margin (see .leaflet-map-fullscreen-control in
    // style.css) lifting it clear of that strip instead of overlapping it.
    const control = L.control({ position: 'bottomleft' });
    control.onAdd = function () {
      // A <div class="leaflet-control leaflet-bar"> containing an <a> matches Leaflet's
      // own zoom/layers control markup exactly (including the leaflet-control class,
      // which is what actually re-enables pointer-events over the otherwise
      // pointer-events:none corner container -- omitting it left the button unclickable,
      // with clicks falling through to whatever was underneath). This also picks up the
      // dark-mode-aware .leaflet-bar overrides already in style.css for free.
      const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar leaflet-map-fullscreen-control');
      const btn = L.DomUtil.create('a', 'leaflet-map-fullscreen-btn', container);
      btn.href = '#';
      btn.title = mapFullscreenActive ? 'Exit full-screen map' : 'Full-screen map';
      btn.setAttribute('aria-label', 'Toggle full-screen map');
      btn.innerHTML = mapFullscreenActive ? FULLSCREEN_EXIT_ICON_SVG : FULLSCREEN_ENTER_ICON_SVG;
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(btn, 'click', (e) => {
        L.DomEvent.preventDefault(e);
        setMapFullscreen(!mapFullscreenActive);
      });
      leafletFullscreenBtn = btn;
      return container;
    };
    return control;
  }

  // The single source of truth for full-screen UI state, reached either directly (the
  // CSS-only fallback, when the real Fullscreen API is unavailable or refuses the
  // request) or reactively from the fullscreenchange listener above (the real API,
  // including when the browser itself ends full-screen via Esc or its own exit control).
  function applyMapFullscreenState(active, isNative) {
    mapFullscreenActive = active;
    mapFullscreenIsNative = !!isNative;
    if (leafletMapDiv) {
      leafletMapDiv.classList.toggle('map-fullscreen-active', active);
      leafletMapDiv.classList.toggle('map-fullscreen-native', active && mapFullscreenIsNative);
    }
    // Real full-screen already isolates the page (nothing else is visible or scrollable
    // regardless), so the body scroll-lock is only needed for the CSS-only fallback.
    document.body.classList.toggle('map-fullscreen-open', active && !mapFullscreenIsNative);
    if (leafletFullscreenBtn) {
      leafletFullscreenBtn.innerHTML = active ? FULLSCREEN_EXIT_ICON_SVG : FULLSCREEN_ENTER_ICON_SVG;
      leafletFullscreenBtn.title = active ? 'Exit full-screen map' : 'Full-screen map';
    }
    if (!active) {
      disarmFabNotePick();
      closeFullscreenNoteCard();
    }
    updateFullscreenFab();
    // The container's size changes with the state above; Leaflet needs to recompute
    // tile layout once that reflow/transition has actually happened.
    requestAnimationFrame(() => { if (leafletMap) leafletMap.invalidateSize(); });
  }

  function setMapFullscreen(active) {
    if (active) {
      requestNativeFullscreen(leafletMapDiv).catch(() => {
        // Not supported (or refused -- e.g. an embedding iframe without
        // allow="fullscreen"): fall back to the CSS-only "maximize" overlay so the
        // feature still basically works instead of silently doing nothing.
        applyMapFullscreenState(true, false);
      });
      // The success path is handled by the fullscreenchange listener above, not here,
      // so this stays correct even if the browser is slow to actually transition.
    } else if (mapFullscreenIsNative) {
      exitNativeFullscreen();
    } else {
      applyMapFullscreenState(false, false);
    }
  }

  // Only needed for the CSS-only fallback -- real full-screen already exits on Esc by
  // itself and reports it through the fullscreenchange listener above.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mapFullscreenActive && !mapFullscreenIsNative) setMapFullscreen(false);
  });

  function ensureFullscreenFab() {
    if (mapFullscreenFab || !leafletMapDiv) return mapFullscreenFab;
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'map-fullscreen-fab';
    fab.title = 'Add a note here';
    fab.setAttribute('aria-label', 'Add a note on the map');
    // Same glyph as the map/graph note markers and the Sessions panel's Add Note button.
    fab.innerHTML = (window.SessionsModel && window.SessionsModel.NOTE_ICON_SVG) || '';
    // The FAB lives inside #leafletMapDiv (so it stays fixed to the map in full-screen),
    // but that means a click on it also bubbles up into Leaflet's own click handling on
    // the map container -- without this, arming the pick and having Leaflet treat that
    // very same click as the map location pick would happen in the same tick, using the
    // FAB's own screen position as the "picked" spot.
    L.DomEvent.disableClickPropagation(fab);
    fab.addEventListener('click', () => {
      if (fabNotePickArmed) disarmFabNotePick();
      else armFabNotePick();
    });
    leafletMapDiv.appendChild(fab);
    mapFullscreenFab = fab;
    return fab;
  }

  function updateFullscreenFab() {
    const fab = ensureFullscreenFab();
    if (!fab) return;
    fab.classList.toggle('is-visible', mapFullscreenActive);
    fab.classList.toggle('is-armed', fabNotePickArmed);
    fab.title = fabNotePickArmed ? 'Click a spot on the map… (click again to cancel)' : 'Add a note here';
  }

  function armFabNotePick() {
    if (!leafletMap || leafletMapMode !== 'geo') {
      window.alert('Switch the map to GPS/Lat-Lon mode (not the X/Y overlay) to pin a note by location.');
      return;
    }
    closeFullscreenNoteCard();
    fabNotePickArmed = true;
    notePickPurpose = 'fab';
    setNotePickMode('map');
    updateFullscreenFab();
  }

  function disarmFabNotePick() {
    if (!fabNotePickArmed) return;
    fabNotePickArmed = false;
    if (notePickPurpose === 'fab') setNotePickMode(null);
    updateFullscreenFab();
  }

  // Object URLs for the fullscreen note card's own pending (not-yet-saved) photo
  // thumbnails -- built straight from the local blob, not MediaService, since the photo
  // isn't persisted to mediaIndex until the note itself is saved. Revoked whenever the
  // card closes (Save, Cancel, or picking a new location) so they don't leak.
  let fullscreenNoteCardObjectUrls = [];
  let fullscreenNoteCardViewportCleanup = null;

  // On mobile, the on-screen keyboard shrinks only the *visual* viewport; position:fixed
  // elements stay anchored to the (unchanged) layout viewport, so a card sitting near the
  // bottom ends up behind the keyboard. This lifts the card by however much of the bottom
  // edge the keyboard is covering, and keeps it in sync as the keyboard opens/closes.
  function keepCardAboveKeyboard(card, baseBottomPx) {
    const vv = window.visualViewport;
    if (!vv) return null;
    const update = () => {
      const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      card.style.bottom = `${covered > 0 ? covered + 12 : baseBottomPx}px`;
      // Never let a tall card (photos + textarea) extend above the visible area.
      card.style.maxHeight = `${Math.max(120, vv.height - 24)}px`;
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }

  function openFullscreenNoteCard(location) {
    closeFullscreenNoteCard();
    const card = document.createElement('div');
    card.className = 'map-fullscreen-note-card';

    const textarea = document.createElement('textarea');
    textarea.className = 'map-fullscreen-note-input';
    textarea.rows = 3;
    textarea.placeholder = 'Add a note…';

    const mediaThumbs = document.createElement('div');
    mediaThumbs.className = 'session-note-media-thumbs';

    const mediaStatus = document.createElement('span');
    mediaStatus.className = 'session-note-media-status';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.hidden = true;

    // Media picked before the note exists (there's nothing to attach it to yet) is held
    // here and attached on Save, same pattern as the Sessions panel's own composer.
    let pendingMedia = [];

    function addPendingMedia(blob, filename) {
      if (!sessionsApi || !sessionsApi.MediaService) return Promise.resolve();
      return sessionsApi.MediaService.saveMediaBlob(blob, filename, blob.type).then((entry) => {
        pendingMedia.push({ id: entry.id, type: 'photo', filename: entry.filename, mimeType: entry.mimeType });
        const url = URL.createObjectURL(blob);
        fullscreenNoteCardObjectUrls.push(url);
        const img = document.createElement('img');
        img.className = 'session-note-media-thumb';
        img.src = url;
        img.alt = filename || 'Photo';
        img.addEventListener('click', () => window.open(url, '_blank'));
        mediaThumbs.appendChild(img);
        mediaStatus.textContent = pendingMedia.length + (pendingMedia.length === 1 ? ' photo attached' : ' photos attached');
      });
    }

    fileInput.addEventListener('change', () => {
      const picked = fileInput.files && fileInput.files[0];
      fileInput.value = '';
      if (picked) addPendingMedia(picked, picked.name);
    });

    // Same "session-note-photo-btn"/"session-note-attach-btn" markup and classes the
    // panel's own note composer uses (icon wrapped in .icon-btn-glyph), so these pick up
    // identical styling for free instead of a parallel "map-fullscreen-note-*" copy.
    const photoModel = window.SessionsModel;
    function buildFullscreenPhotoIconButton(className, title, svg, onclick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = className;
      btn.title = title;
      btn.setAttribute('aria-label', title);
      const glyph = document.createElement('span');
      glyph.className = 'icon-btn-glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.innerHTML = svg || '';
      btn.appendChild(glyph);
      btn.addEventListener('click', onclick);
      return btn;
    }

    const takePhotoBtn = buildFullscreenPhotoIconButton('session-note-photo-btn', 'Take Photo', photoModel && photoModel.CAMERA_ICON_SVG, () => {
      if (!sessionsApi || !sessionsApi.MediaService || !window.SessionsUI) return;
      mediaStatus.textContent = 'Requesting camera…';
      sessionsApi.MediaService.requestCamera().then((result) => {
        if (!result.ok) {
          mediaStatus.textContent = result.reason === 'denied'
            ? 'Camera blocked — pick a file instead.'
            : 'No camera available — pick a file instead.';
          fileInput.click();
          return null;
        }
        // While the browser's real Fullscreen API is active on the map, only that
        // element's own subtree is ever painted -- hosting the capture preview inside
        // it (rather than its default document.body) is what makes it actually visible
        // instead of silently invisible until fullscreen exits.
        const captureContainer = mapFullscreenIsNative ? leafletMapDiv : undefined;
        return window.SessionsUI.captureFromStream(result.stream, captureContainer).then((blob) => {
          sessionsApi.MediaService.stopCamera(result.stream);
          if (blob) return addPendingMedia(blob, 'capture.png');
          mediaStatus.textContent = 'Capture cancelled.';
          return null;
        });
      });
    });

    const attachPhotoBtn = buildFullscreenPhotoIconButton('session-note-attach-btn', 'Attach Photo', photoModel && photoModel.PAPERCLIP_ICON_SVG, () => fileInput.click());

    const photoActions = document.createElement('div');
    photoActions.className = 'session-note-composer-row session-note-photo-actions';
    photoActions.appendChild(takePhotoBtn);
    photoActions.appendChild(attachPhotoBtn);
    photoActions.appendChild(mediaStatus);

    const actions = document.createElement('div');
    actions.className = 'map-fullscreen-note-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'map-fullscreen-note-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => closeFullscreenNoteCard());

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'map-fullscreen-note-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      const content = textarea.value.trim();
      if (!content && !pendingMedia.length) { closeFullscreenNoteCard(); return; }
      saveBtn.disabled = true;
      if (!window.SessionsUI) { closeFullscreenNoteCard(); return; }
      window.SessionsUI.quickCreateNoteAtLocation(location, content, pendingMedia).then(() => {
        closeFullscreenNoteCard();
      }).catch((err) => {
        closeFullscreenNoteCard();
        window.alert((err && err.message) || 'Could not save note.');
      });
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    card.appendChild(textarea);
    card.appendChild(mediaThumbs);
    card.appendChild(photoActions);
    card.appendChild(fileInput);
    card.appendChild(actions);
    // Same reasoning as the FAB above: this card lives inside #leafletMapDiv, so clicks
    // and drags inside it (typing, selecting text, hitting Save/Cancel) must not bubble
    // into Leaflet's own map click/drag handling.
    L.DomEvent.disableClickPropagation(card);
    L.DomEvent.disableScrollPropagation(card);
    leafletMapDiv.appendChild(card);
    mapFullscreenNoteCard = card;
    fullscreenNoteCardViewportCleanup = keepCardAboveKeyboard(card, 92);
    textarea.focus();
  }

  function closeFullscreenNoteCard() {
    if (fullscreenNoteCardViewportCleanup) {
      fullscreenNoteCardViewportCleanup();
      fullscreenNoteCardViewportCleanup = null;
    }
    fullscreenNoteCardObjectUrls.forEach((url) => { try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ } });
    fullscreenNoteCardObjectUrls = [];
    if (mapFullscreenNoteCard) { mapFullscreenNoteCard.remove(); mapFullscreenNoteCard = null; }
  }

  function mapPlotlyDashToLeaflet(dash) {
    switch (dash) {
      case 'dash': return '10 6';
      case 'dot': return '2 6';
      case 'dashdot': return '10 6 2 6';
      case 'longdash': return '16 8';
      case 'longdashdot': return '16 8 2 8';
      case 'solid':
      default:
        return null;
    }
  }

  function getMapColorScaleConfig(mapColorMin, mapColorMax, mapColorMode) {
    if (!Number.isFinite(mapColorMin) || !Number.isFinite(mapColorMax)) return null;

    let markerCmin = mapColorMin;
    let markerCmax = mapColorMax;
    let markerColorscale = 'Viridis';

    if (mapColorMode === 'divergent') {
      markerColorscale = 'RedGreen';
      if (mapColorMin < 0 && mapColorMax > 0) {
        const zeroPos = (0 - markerCmin) / (markerCmax - markerCmin);
        // Keep the neutral center intentionally narrow so red/green variation is more visible.
        // Example: centerFraction=0.20 approximates a 40/20/40 split.
        const centerFraction = 0.10;
        const halfCenter = centerFraction * 0.5;
        const centerStart = Math.max(0, zeroPos - halfCenter);
        const centerEnd = Math.min(1, zeroPos + halfCenter);
        const edgeEps = 1e-4;
        const MIN_COLOR = '#b2182b',
          MIN_MID_COLOR = '#d98c95',
          MAX_MID_COLOR = '#8dcca8',
          MAX_COLOR = '#1a9850',
          NEUTRAL_COLOR = '#f7f7f7';
        markerColorscale = [
          [0, MIN_COLOR],
          [Math.max(0, centerStart - edgeEps), MIN_MID_COLOR],
          [centerStart, NEUTRAL_COLOR],
          [centerEnd, NEUTRAL_COLOR],
          [Math.min(1, centerEnd + edgeEps), MAX_MID_COLOR],
          [1, MAX_COLOR]
        ];
      }
    }

    if (markerCmin === markerCmax) {
      markerCmax = markerCmin + 1;
    }

    return {
      cmin: markerCmin,
      cmax: markerCmax,
      colorscale: markerColorscale
    };
  }

  // Builds a Plotly-compatible [pos, color] colorscale stop array for a temperature profile
  // plot's heatmap: the real gradient (from TEMP_COLORMAPS) is compressed into the middle of
  // the [0,1] position range, with a hard color step to belowColor at 0 and aboveColor at 1.
  // Plotly heatmaps have no native "out of range" color -- zmin/zmax just clamp values to the
  // gradient's own end color -- so this reproduces distinct under/over colors via extra edge
  // stops, the same technique getMapColorScaleConfig uses above for its divergent colorscale.
  function buildTempProfileColorscale(colormapName, aboveColor, belowColor) {
    const base = TEMP_COLORMAPS[colormapName] || TEMP_COLORMAPS.Jet;
    const innerStart = 0.03;
    const innerEnd = 0.97;
    const edgeEps = 1e-4;
    const stops = [
      [0, belowColor],
      [Math.max(0, innerStart - edgeEps), belowColor]
    ];
    base.forEach(([pos, color]) => {
      stops.push([innerStart + pos * (innerEnd - innerStart), color]);
    });
    stops.push([Math.min(1, innerEnd + edgeEps), aboveColor]);
    stops.push([1, aboveColor]);
    return stops;
  }

  // Resolves a temp-profile plot's effective color config, following the shared "plotter
  // default" when the plot has useDefaultRange set (so editing the default retroactively
  // updates every plot using it).
  function getEffectiveTempProfileColorConfig(p) {
    return p.useDefaultRange
      ? tempProfileDefaults
      : { colormap: p.colormap, min: p.min, max: p.max, aboveColor: p.aboveColor, belowColor: p.belowColor };
  }

  // Temperature profile plots are only available for Time/Distance X-axis (not Channel/
  // "custom" mode), matching how buildTimeSlipTraces gates Time Slip to xMode==='distance'.
  function getActiveTempProfilePlots(xMode) {
    if (xMode !== 'time' && xMode !== 'distance') return [];
    return tempProfilePlots.filter((p) => p.enabled && p.channels.length > 0);
  }

  // Classifies a channel's plotted values as 'discrete' (categorical -- a fixed color per
  // distinct value) or 'continuous' (a Viridis gradient). Non-numeric values (e.g. a text
  // LABEL column) are always discrete, since a colorscale has no meaning for them. Numeric
  // values are discrete when there are few distinct values outright, or few relative to the
  // sample count -- see COLOR_AXIS_DISCRETE_* above for the exact thresholds.
  function classifyColorAxisValues(rawValues) {
    const total = rawValues.length;
    if (total === 0) return null;

    const allNumeric = rawValues.every((v) => Number.isFinite(Number(v)));
    const distinctSet = new Set(rawValues.map((v) => (allNumeric ? Number(v) : String(v).trim())));
    const distinctCount = distinctSet.size;

    const isDiscrete = !allNumeric
      || distinctCount <= COLOR_AXIS_DISCRETE_ABS_MAX
      || (distinctCount <= COLOR_AXIS_DISCRETE_RATIO_MAX_COUNT && (distinctCount / total) <= COLOR_AXIS_DISCRETE_RATIO_THRESHOLD);

    if (isDiscrete) {
      const categories = Array.from(distinctSet).sort((a, b) => (
        (typeof a === 'number' && typeof b === 'number') ? (a - b) : String(a).localeCompare(String(b))
      ));
      return { kind: 'discrete', categories, allNumeric };
    }

    let min = Infinity, max = -Infinity;
    rawValues.forEach((v) => {
      const n = Number(v);
      if (n < min) min = n;
      if (n > max) max = n;
    });
    return { kind: 'continuous', min, max };
  }

  // The single source of truth for turning a raw color-channel cell value into the type
  // (number or trimmed string) that categories/hidden-set membership are keyed by --
  // classifyColorAxisValues, the legend, and the trace filter all have to agree on this.
  function normalizeColorAxisCategory(context, rawValue) {
    return context.allNumeric ? Number(rawValue) : String(rawValue).trim();
  }

  function isColorAxisCategoryHidden(channel, category) {
    const hiddenSet = colorAxisHiddenCategoriesByChannel.get(channel);
    return !!hiddenSet && hiddenSet.has(category);
  }

  function toggleColorAxisCategoryHidden(channel, category) {
    let hiddenSet = colorAxisHiddenCategoriesByChannel.get(channel);
    if (!hiddenSet) {
      hiddenSet = new Set();
      colorAxisHiddenCategoriesByChannel.set(channel, hiddenSet);
    }
    if (hiddenSet.has(category)) hiddenSet.delete(category);
    else hiddenSet.add(category);
  }

  // Gathers every value of `colorAxisChannel` that will actually be plotted (same
  // file/lap selection the main trace loop uses) and classifies it once, up front, so
  // every trace shares one consistent color mapping (same cmin/cmax, or the same
  // category->color assignment) rather than each trace scaling itself independently.
  function computeColorAxisContext(selFiles, selectedLaps, colorAxisChannel) {
    if (!colorAxisChannel) return null;
    const rawValues = [];
    selFiles.forEach((log) => {
      const resolvedCol = resolveChannelForLog(colorAxisChannel, log);
      if (!resolvedCol || !log.cols.includes(resolvedCol)) return;
      log.data.forEach((row, i) => {
        if (!isLapSelected(selectedLaps, log.id, log.meta.lapNum[i])) return;
        const v = row[resolvedCol];
        if (v !== null && v !== undefined && v !== '') rawValues.push(v);
      });
    });
    const classification = classifyColorAxisValues(rawValues);
    if (!classification) return null;
    if (classification.kind === 'continuous') {
      classification.scaleConfig = getMapColorScaleConfig(classification.min, classification.max, 'continuous');
    }
    return classification;
  }

  // Assigns each category a color the first time it's seen, then keeps that assignment
  // for as long as the app is open -- so switching laps/files in and out doesn't repaint
  // categories that are still visible (mirrors syncSelectedChannelColors/getChannelColor).
  function getColorAxisCategoryColor(channel, category) {
    const key = `${channel}::${category}`;
    if (colorAxisCategoryColorOverrides.has(key)) return colorAxisCategoryColorOverrides.get(key);
    const prefix = `${channel}::`;
    const usedForChannel = new Set();
    colorAxisCategoryColorOverrides.forEach((color, k) => {
      if (k.startsWith(prefix)) usedForChannel.add(color);
    });
    let color = COLORS.find((candidate) => !usedForChannel.has(candidate));
    if (!color) color = COLORS[usedForChannel.size % COLORS.length];
    colorAxisCategoryColorOverrides.set(key, color);
    return color;
  }

  // Plotly won't auto-legend a single array-colored trace, so discrete mode gets its own
  // small legend of category swatches; continuous mode relies on Plotly's own colorbar
  // (added directly on the first colored trace) so this just hides the discrete legend.
  function renderColorAxisLegend(channel, context) {
    if (!colorAxisLegendDiv) return;
    if (!context || context.kind !== 'discrete') {
      colorAxisLegendDiv.innerHTML = '';
      colorAxisLegendDiv.hidden = true;
      return;
    }
    const label = getChannelLabel(channel);
    const items = context.categories.map((cat) => {
      const color = getColorAxisCategoryColor(channel, cat);
      const hidden = isColorAxisCategoryHidden(channel, cat);
      const cls = hidden ? 'color-axis-legend-item is-hidden' : 'color-axis-legend-item';
      return `<button type="button" class="${cls}" data-color-axis-category="${escapeHtml(String(cat))}" data-color-axis-numeric="${context.allNumeric ? '1' : '0'}" aria-pressed="${hidden ? 'false' : 'true'}">`
        + `<span class="color-axis-legend-swatch" style="background:${escapeHtml(color)}"></span>${escapeHtml(String(cat))}</button>`;
    }).join('');
    colorAxisLegendDiv.innerHTML = `<strong>${escapeHtml(label)}:</strong> ${items}`;
    colorAxisLegendDiv.dataset.channel = channel;
    colorAxisLegendDiv.hidden = false;
  }

  // Applies the shared classification from computeColorAxisContext to one trace: switches
  // it to marker mode (a single 'lines' trace can't vary color along its length) and either
  // a continuous colorscale or a flat per-category color per point.
  function applyColorAxisToTrace(trace, colorRawArr, context, channel, showScale) {
    trace.mode = 'markers';
    trace.type = 'scattergl';
    trace.text = colorRawArr.map((v) => (v === null || v === undefined || v === '') ? '' : String(v));

    if (context.kind === 'continuous' && context.scaleConfig) {
      trace.marker = {
        color: colorRawArr.map((v) => { const n = Number(v); return Number.isFinite(n) ? n : null; }),
        colorscale: context.scaleConfig.colorscale,
        cmin: context.scaleConfig.cmin,
        cmax: context.scaleConfig.cmax,
        size: 5,
        showscale: showScale,
        colorbar: showScale ? { title: { text: getChannelLabel(channel) } } : undefined
      };
    } else {
      trace.marker = {
        color: colorRawArr.map((v) => {
          if (v === null || v === undefined || v === '') return '#999999';
          return getColorAxisCategoryColor(channel, normalizeColorAxisCategory(context, v));
        }),
        size: 5
      };
    }
  }

  function lerpColorRgb(rgbA, rgbB, t) {
    const clamped = Math.max(0, Math.min(1, t));
    const r = Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * clamped);
    const g = Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * clamped);
    const b = Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * clamped);
    return [r, g, b];
  }

  function colorRgbToHex(rgb) {
    const r = Math.max(0, Math.min(255, Math.round(rgb[0])));
    const g = Math.max(0, Math.min(255, Math.round(rgb[1])));
    const b = Math.max(0, Math.min(255, Math.round(rgb[2])));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  function normalizeLeafletColorScaleStops(colorscale) {
    if (Array.isArray(colorscale)) {
      const stops = colorscale
        .map((entry) => {
          if (!Array.isArray(entry) || entry.length < 2) return null;
          const pos = Number(entry[0]);
          const color = String(entry[1] || '').trim();
          if (!Number.isFinite(pos) || !color) return null;
          return [Math.max(0, Math.min(1, pos)), color];
        })
        .filter(Boolean)
        .sort((a, b) => a[0] - b[0]);
      if (stops.length > 0) return stops;
    }

    if (String(colorscale).toLowerCase() === 'rdbu') {
      return [
        [0, '#2166ac'],
        [0.5, '#f7f7f7'],
        [1, '#b2182b']
      ];
    }

    if (String(colorscale).toLowerCase() === 'redgreen') {
      return [
        [0, '#b2182b'],
        [0.5, '#f7f7f7'],
        [1, '#1a9850']
      ];
    }

    return [
      [0, '#440154'],
      [0.25, '#3b528b'],
      [0.5, '#21918c'],
      [0.75, '#5ec962'],
      [1, '#fde725']
    ];
  }

  function parseHexColorToRgb(color) {
    const s = String(color || '').trim();
    const hex = s.startsWith('#') ? s.slice(1) : s;
    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }

  function getLeafletColorForValue(value, scaleConfig) {
    const v = Number(value);
    if (!Number.isFinite(v) || !scaleConfig) return null;

    const cmin = Number(scaleConfig.cmin);
    const cmax = Number(scaleConfig.cmax);
    if (!Number.isFinite(cmin) || !Number.isFinite(cmax) || cmax <= cmin) return null;

    const t = (v - cmin) / (cmax - cmin);
    const clamped = Math.max(0, Math.min(1, t));

    const stops = normalizeLeafletColorScaleStops(scaleConfig.colorscale)
      .map(([pos, color]) => [pos, parseHexColorToRgb(color)])
      .filter((entry) => Array.isArray(entry[1]));

    if (stops.length === 0) return null;
    if (stops.length === 1) return colorRgbToHex(stops[0][1]);
    if (clamped <= stops[0][0]) return colorRgbToHex(stops[0][1]);
    if (clamped >= stops[stops.length - 1][0]) return colorRgbToHex(stops[stops.length - 1][1]);

    for (let i = 1; i < stops.length; i++) {
      const left = stops[i - 1];
      const right = stops[i];
      if (clamped >= left[0] && clamped <= right[0]) {
        const span = Math.max(1e-9, right[0] - left[0]);
        const localT = (clamped - left[0]) / span;
        return colorRgbToHex(lerpColorRgb(left[1], right[1], localT));
      }
    }

    return colorRgbToHex(stops[stops.length - 1][1]);
  }

  function removeLeafletColorLegend() {
    if (!leafletMap || !leafletColorLegendControl) return;
    leafletMap.removeControl(leafletColorLegendControl);
    leafletColorLegendControl = null;
  }

  function normalizeManualMapColorBounds(min, max) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
    return { min, max };
  }

  function updateLeafletColorLegend(channelName, scaleConfig, autoScaleConfig, mapColorMode) {
    if (!leafletMap || !scaleConfig || !Number.isFinite(scaleConfig.cmin) || !Number.isFinite(scaleConfig.cmax)) {
      removeLeafletColorLegend();
      return;
    }

    removeLeafletColorLegend();

    const sampleCount = 16;
    const sampleColors = [];
    for (let i = 0; i < sampleCount; i++) {
      const t = i / (sampleCount - 1);
      const value = scaleConfig.cmin + (scaleConfig.cmax - scaleConfig.cmin) * t;
      sampleColors.push(getLeafletColorForValue(value, scaleConfig) || '#888888');
    }

    const control = L.control({ position: 'topleft' });
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-map-color-legend');
      const gradient = `linear-gradient(to right, ${sampleColors.join(',')})`;
      div.style.background = 'var(--panel-bg-translucent)';
      div.style.border = '1px solid var(--border)';
      div.style.borderRadius = '6px';
      div.style.padding = '6px 8px';
      div.style.font = '12px/1.2 sans-serif';
      div.style.boxShadow = '0 1px 4px var(--shadow-md)';
      div.style.minWidth = '150px';
      div.style.cursor = 'pointer';
      div.style.color = 'var(--text-primary)';

      const currentMin = Number(scaleConfig.cmin);
      const currentMax = Number(scaleConfig.cmax);
      const autoMin = Number(autoScaleConfig && autoScaleConfig.cmin);
      const autoMax = Number(autoScaleConfig && autoScaleConfig.cmax);
      const hasAutoRange = Number.isFinite(autoMin) && Number.isFinite(autoMax);
      const isManualRange = hasAutoRange && (Math.abs(currentMin - autoMin) > 1e-9 || Math.abs(currentMax - autoMax) > 1e-9);
      const showZeroLabel = mapColorMode === 'divergent' && currentMin < 0 && currentMax > 0;
      const zeroPct = showZeroLabel
        ? Math.max(4, Math.min(96, ((0 - currentMin) / (currentMax - currentMin)) * 100))
        : null;
      const rangeLabelsHtml = showZeroLabel
        ? [
            '<div style="position:relative;display:flex;justify-content:space-between;margin-top:3px;color:var(--text-secondary);">',
            `<span>${currentMin.toFixed(2)}</span>`,
            `<span>${currentMax.toFixed(2)}</span>`,
            `<span style="position:absolute;left:${zeroPct.toFixed(2)}%;transform:translateX(-50%);font-weight:600;">0</span>`,
            '</div>'
          ].join('')
        : [
            '<div style="display:flex;justify-content:space-between;margin-top:3px;color:var(--text-secondary);">',
            `<span>${currentMin.toFixed(2)}</span>`,
            `<span>${currentMax.toFixed(2)}</span>`,
            '</div>'
          ].join('');

      div.innerHTML = [
        `<div style="margin-bottom:4px;font-weight:600;color:var(--text-primary);">${escapeHtml(channelName || 'Map Color')}</div>`,
        `<div style="height:10px;border-radius:3px;border:1px solid var(--border);background:${gradient};"></div>`,
        rangeLabelsHtml,
        `<div style="margin-top:4px;color:var(--text-muted);">${isManualRange ? 'Manual bounds active' : 'Auto bounds active'} (click to edit)</div>`,
        '<div class="leaflet-map-color-range-editor" style="display:none;margin-top:6px;border-top:1px solid var(--border-dashed);padding-top:6px;">',
        '<div style="display:flex;gap:6px;align-items:center;">',
        `<label style="display:flex;align-items:center;gap:4px;color:var(--text-primary);">Min <input type="number" step="any" class="leaflet-map-color-min" value="${currentMin.toFixed(6)}" style="width:74px;padding:2px 4px;font-size:12px;background:var(--bg-surface);color:var(--text-primary);border:1px solid var(--border);"></label>`,
        `<label style="display:flex;align-items:center;gap:4px;color:var(--text-primary);">Max <input type="number" step="any" class="leaflet-map-color-max" value="${currentMax.toFixed(6)}" style="width:74px;padding:2px 4px;font-size:12px;background:var(--bg-surface);color:var(--text-primary);border:1px solid var(--border);"></label>`,
        '</div>',
        '<div style="display:flex;gap:6px;margin-top:6px;">',
        '<button type="button" class="leaflet-map-color-apply" style="padding:2px 8px;font-size:12px;">Apply</button>',
        '<button type="button" class="leaflet-map-color-auto" style="padding:2px 8px;font-size:12px;">Auto</button>',
        '</div>',
        '<div class="leaflet-map-color-error" style="display:none;color:var(--danger-text);margin-top:5px;"></div>',
        '</div>'
      ].join('');

      const editor = div.querySelector('.leaflet-map-color-range-editor');
      const minInput = div.querySelector('.leaflet-map-color-min');
      const maxInput = div.querySelector('.leaflet-map-color-max');
      const applyBtn = div.querySelector('.leaflet-map-color-apply');
      const autoBtn = div.querySelector('.leaflet-map-color-auto');
      const errorEl = div.querySelector('.leaflet-map-color-error');

      const showError = (message) => {
        if (!errorEl) return;
        if (!message) {
          errorEl.style.display = 'none';
          errorEl.textContent = '';
          return;
        }
        errorEl.style.display = 'block';
        errorEl.textContent = message;
      };

      div.addEventListener('click', (ev) => {
        if (!editor) return;
        const target = ev.target;
        const isEditorElement = target && target.closest && target.closest('.leaflet-map-color-range-editor');
        if (isEditorElement) return;
        editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
      });

      if (applyBtn && minInput && maxInput) {
        applyBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const min = Number(minInput.value);
          const max = Number(maxInput.value);
          if (!Number.isFinite(min) || !Number.isFinite(max)) {
            showError('Bounds must be numeric.');
            return;
          }
          if (max <= min) {
            showError('Max must be greater than Min.');
            return;
          }

          const normalizedBounds = normalizeManualMapColorBounds(min, max);
          if (!normalizedBounds) {
            showError('Bounds are invalid.');
            return;
          }

          showError('');
          leafletMapColorManualRanges.set(channelName, normalizedBounds);
          minInput.value = normalizedBounds.min.toFixed(6);
          maxInput.value = normalizedBounds.max.toFixed(6);
          updatePlot();
        });
      }

      if (autoBtn) {
        autoBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          leafletMapColorManualRanges.delete(channelName);
          showError('');
          updatePlot();
        });
      }

      L.DomEvent.disableClickPropagation(div);
      return div;
    };

    control.addTo(leafletMap);
    leafletColorLegendControl = control;
  }

  // Plain Number(v) turns a missing/scrubbed value (null, e.g. a filtered-out GPS 0,0
  // pre-lock sample) into 0 -- silently reintroducing the very bad point that was nulled
  // out. NaN propagates correctly through every Number.isFinite check downstream instead.
  function numberOrNaN(v) {
    return v == null ? NaN : Number(v);
  }

  function getLeafletLatLonSource(log) {
    if (!log || !Array.isArray(log.cols)) return null;

    if (log.cols.includes(DERIVED_LAT_COL) && log.cols.includes(DERIVED_LON_COL)) {
      return {
        latAt: (index) => numberOrNaN(log.data[index][DERIVED_LAT_COL]),
        lonAt: (index) => numberOrNaN(log.data[index][DERIVED_LON_COL]),
        source: 'derived'
      };
    }

    const cols = findLatLonColumns(log.cols, log.meta);
    if (!cols) return null;

    return {
      latAt: (index) => numberOrNaN(log.data[index][cols.latCol]),
      lonAt: (index) => numberOrNaN(log.data[index][cols.lonCol]),
      source: 'native'
    };
  }

  function hasRenderableLeafletMapData(selFiles, selectedLaps) {
    if (!Array.isArray(selFiles) || selFiles.length === 0) return false;

    for (const log of selFiles) {
      const latLonSource = getLeafletLatLonSource(log);
      if (!latLonSource) continue;

      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a, b) => a - b);
      for (const lap of lapNums) {
        if (!isLapSelected(selectedLaps, log.id, lap)) continue;

        const maskIdx = log.meta.lapNum.map((n, i) => n === lap ? i : -1).filter(i => i >= 0);
        let validPoints = 0;
        for (const i of maskIdx) {
          const lat = latLonSource.latAt(i);
          const lon = latLonSource.lonAt(i);
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            validPoints += 1;
            if (validPoints >= 2) return true;
          }
        }
      }
    }

    return false;
  }

  function hasRenderableXYMapData(selFiles, selectedLaps) {
    if (!Array.isArray(selFiles) || selFiles.length === 0) return false;

    for (const log of selFiles) {
      const mapSource = getMapSourceForLog(log);
      if (!mapSource) continue;

      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a, b) => a - b);
      for (const lap of lapNums) {
        if (!isLapSelected(selectedLaps, log.id, lap)) continue;

        const maskIdx = log.meta.lapNum.map((n, i) => n === lap ? i : -1).filter(i => i >= 0);
        let validPoints = 0;
        for (const i of maskIdx) {
          const x = mapSource.xAt(i);
          const y = mapSource.yAt(i);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            validPoints += 1;
            if (validPoints >= 2) return true;
          }
        }
      }
    }

    return false;
  }

  // Defaults the "Show Map" checkbox to whether the currently loaded data actually
  // has renderable map info, unless the user has already made an explicit choice.
  function syncShowMapDefault(hasAnyMapData) {
    if (showMapInput && !showMapManuallyToggled) showMapInput.checked = hasAnyMapData;
  }

  // Gives the plot's grid column back to the plot itself when no map is being shown,
  // rather than leaving an empty reserved column in its place.
  function applyMapColumnLayout(showingMap) {
    const plotSection = document.querySelector('.plot');
    if (plotSection) plotSection.classList.toggle('no-map-column', !showingMap);
    // Desktop drag-resize (resize-panels.js) sets an inline grid-template-columns that
    // outranks the CSS class above, so it must be told directly and synchronously —
    // before Leaflet measures the map container a few lines below this call.
    if (typeof window.__csvPlotterSetMapVisible === 'function') {
      window.__csvPlotterSetMapVisible(showingMap);
    }
  }

  function setMapDisplayMode(mode) {
    const mapsContainer = document.querySelector('.maps-container');
    if (mapsContainer) {
      mapsContainer.style.display = mode === 'none' ? 'none' : 'block';
    }

    if (mapDiv) {
      mapDiv.style.display = 'none';
    }

    if (leafletMapDiv) {
      leafletMapDiv.style.display = mode === 'none' ? 'none' : 'block';
    }
  }

  function clearXYMapPlot() {
    if (!mapDiv) return;
    mapHoverLookup = new Map();
    mapHoverMarkerVisible = false;
    mapViewState = null;
    Plotly.purge(mapDiv);
  }

  function clearLeafletMapPlot() {
    leafletHoverLookup = new Map();
    clearLeafletHoverMarker();
    removeLeafletColorLegend();
    leafletViewState = null;
    leafletViewStateUserSet = false;
    leafletXYViewState = null;
    leafletXYViewStateUserSet = false;
    if (leafletMap) {
      leafletLayers.forEach(layer => leafletMap.removeLayer(layer));
      leafletLayers = [];
    }
    leafletCornerBgLayers = [];
  }

  // Web Mercator meters-per-pixel at zoom 0, equator (the standard constant tile
  // providers are built around); scales by 1/2^zoom and by cos(latitude) elsewhere.
  const WEB_MERCATOR_ZOOM0_METERS_PER_PIXEL = 156543.03392;

  // Converts a real-world track distance (meters) into the Leaflet polyline `weight`
  // (pixels) that currently represents it, so the corner background trace reads as a
  // constant physical width on the ground rather than a constant pixel width. 'xy' mode
  // uses CRS.Simple, where 1 data unit (meter) is already 2^zoom pixels; 'geo' mode uses
  // the standard Web Mercator meters-per-pixel formula at the reference latitude.
  function metersToLeafletWeight(meters, mode, zoom, refLat) {
    const MIN_WEIGHT_PX = 1.5;
    if (!Number.isFinite(zoom)) return meters;
    if (mode === 'xy') {
      return Math.max(MIN_WEIGHT_PX, meters * Math.pow(2, zoom));
    }
    const lat = Number.isFinite(refLat) ? refLat : 0;
    const metersPerPixel = WEB_MERCATOR_ZOOM0_METERS_PER_PIXEL * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
    if (!Number.isFinite(metersPerPixel) || metersPerPixel <= 0) return meters;
    return Math.max(MIN_WEIGHT_PX, meters / metersPerPixel);
  }

  // Re-applies the corner background trace's pixel weight after a zoom change, so its
  // ~5-10m real-world width stays correct rather than the fixed pixel width Leaflet
  // would otherwise keep across zoom levels.
  function refreshCornerBackgroundWeights() {
    if (!leafletMap || leafletCornerBgLayers.length === 0) return;
    const zoom = leafletMap.getZoom();
    leafletCornerBgLayers.forEach(({ layer, refLat }) => {
      layer.setStyle({ weight: metersToLeafletWeight(CORNER_MAP_BACKGROUND_WIDTH_M, leafletCornerBgMode, zoom, refLat) });
    });
  }

  // Builds one polyline-worth of points per corner/straight segment along the reference
  // lap used for corner detection -- a single line (not one per selected lap) so the
  // background trace's alpha doesn't stack up where laps overlap. Consecutive segments
  // share their boundary point so the colored chain has no visible gaps.
  function buildLeafletCornerBackgroundSegments(cornerData, cornerRef, mode) {
    if (!cornerData || !Array.isArray(cornerData.segments) || cornerData.segments.length === 0 || !cornerRef) return [];
    const { log, lap } = cornerRef;
    if (!Array.isArray(log.meta.lapNum) || !Array.isArray(log.meta.lapRelDist)) return [];

    const latLonSource = mode === 'geo' ? getLeafletLatLonSource(log) : null;
    const mapSource = mode === 'xy' ? getMapSourceForLog(log) : null;
    if (mode === 'geo' && !latLonSource) return [];
    if (mode === 'xy' && !mapSource) return [];

    const maskIdx = log.meta.lapNum.map((n, i) => n === lap ? i : -1).filter(i => i >= 0);
    const points = [];
    maskIdx.forEach((i) => {
      const dist = Number(log.meta.lapRelDist[i]);
      const lat = mode === 'geo' ? latLonSource.latAt(i) : mapSource.yAt(i);
      const lon = mode === 'geo' ? latLonSource.lonAt(i) : mapSource.xAt(i);
      if (Number.isFinite(dist) && Number.isFinite(lat) && Number.isFinite(lon)) {
        points.push({ dist, latlng: [lat, lon] });
      }
    });
    if (points.length < 2) return [];
    points.sort((a, b) => a.dist - b.dist);

    const result = [];
    let pointIdx = 0;
    let prevPoint = null;
    cornerData.segments.forEach((seg) => {
      const segPoints = prevPoint ? [prevPoint] : [];
      while (pointIdx < points.length && points[pointIdx].dist <= seg.endDist) {
        if (points[pointIdx].dist >= seg.startDist) segPoints.push(points[pointIdx]);
        pointIdx += 1;
      }
      if (segPoints.length >= 2) {
        result.push({
          color: cornerTypeColor(seg.type),
          latlngs: segPoints.map(p => p.latlng),
          refLat: segPoints[0].latlng[0]
        });
      }
      if (segPoints.length > 0) prevPoint = segPoints[segPoints.length - 1];
    });
    return result;
  }

  function updateLeafletMap(selFiles, selectedLaps, mode) {
    if (!leafletMapDiv || !window.L) return;
    syncLeafletContainerHeight();

    initLeafletMap(mode);

    if (!leafletMap.__cornerBgZoomBound) {
      leafletMap.__cornerBgZoomBound = true;
      leafletMap.on('zoomend', refreshCornerBackgroundWeights);
    }

    // Clear existing layers
    leafletLayers.forEach(layer => leafletMap.removeLayer(layer));
    leafletLayers = [];
    leafletCornerBgLayers = [];
    leafletCornerBgMode = mode;
    const nextLeafletHoverLookup = new Map();
    const mapColorEnabled = !!(mapColorEnabledInput && mapColorEnabledInput.checked);
    const mapColorChannel = mapColorSelect ? mapColorSelect.value : '';
    const mapDrawMode = mapDrawModeSelect ? mapDrawModeSelect.value : 'lines';
    const mapColorMode = mapColorModeSelect ? mapColorModeSelect.value : 'continuous';
    let mapColorMin = Infinity;
    let mapColorMax = -Infinity;

    if (mapColorEnabled && mapColorChannel) {
      selFiles.forEach((log) => {
        const mapColorCol = resolveChannelForLog(mapColorChannel, log);
        if (!mapColorCol || !log.cols.includes(mapColorCol)) return;
        log.data.forEach((row) => {
          const v = Number(row[mapColorCol]);
          if (!Number.isFinite(v)) return;
          if (v < mapColorMin) mapColorMin = v;
          if (v > mapColorMax) mapColorMax = v;
        });
      });
    }

    const mapColorScaleConfig = mapColorEnabled
      ? getMapColorScaleConfig(mapColorMin, mapColorMax, mapColorMode)
      : null;
    const manualRange = mapColorEnabled && mapColorChannel
      ? leafletMapColorManualRanges.get(mapColorChannel)
      : null;
    const normalizedManualRange = manualRange
      ? normalizeManualMapColorBounds(Number(manualRange.min), Number(manualRange.max))
      : null;
    const effectiveColorMin = normalizedManualRange ? normalizedManualRange.min : mapColorMin;
    const effectiveColorMax = normalizedManualRange ? normalizedManualRange.max : mapColorMax;
    const effectiveMapColorScaleConfig = mapColorEnabled
      ? getMapColorScaleConfig(effectiveColorMin, effectiveColorMax, mapColorMode)
      : null;
    
    let bounds = null;

    // Corner/straight background trace, added first so it renders behind every lap's
    // line -- see resolveCornerDataForRender/buildLeafletCornerBackgroundSegments.
    if (showCornersInput && showCornersInput.checked) {
      const resolvedCorners = resolveCornerDataForRender(selFiles, selectedLaps);
      const bgSegments = buildLeafletCornerBackgroundSegments(resolvedCorners.cornerData, resolvedCorners.cornerRef, mode);
      const initialZoom = leafletMap.getZoom();
      bgSegments.forEach((seg) => {
        const layer = L.polyline(seg.latlngs, {
          color: seg.color,
          weight: metersToLeafletWeight(CORNER_MAP_BACKGROUND_WIDTH_M, mode, initialZoom, seg.refLat),
          opacity: CORNER_MAP_BACKGROUND_ALPHA,
          lineCap: 'butt',
          lineJoin: 'miter',
          interactive: false
        }).addTo(leafletMap);
        leafletLayers.push(layer);
        leafletCornerBgLayers.push({ layer, refLat: seg.refLat });
      });
    }

    selFiles.forEach((log, fileIdx) => {
      const latLonSource = mode === 'geo' ? getLeafletLatLonSource(log) : null;
      const mapSource = mode === 'xy' ? getMapSourceForLog(log) : null;
      const mapColorCol = mapColorEnabled && mapColorChannel ? resolveChannelForLog(mapColorChannel, log) : '';
      const canColorByChannel = !!(mapColorEnabled && effectiveMapColorScaleConfig && mapColorCol && log.cols.includes(mapColorCol));
      if (mode === 'geo' && !latLonSource) return;
      if (mode === 'xy' && !mapSource) return;
      
      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        
        const maskIdx = log.meta.lapNum.map((n, i) => n === lap ? i : -1).filter(i => i >= 0);
        const latlngs = [];
        const colorValues = [];
        
        maskIdx.forEach((i) => {
          const lat = mode === 'geo' ? latLonSource.latAt(i) : mapSource.yAt(i);
          const lon = mode === 'geo' ? latLonSource.lonAt(i) : mapSource.xAt(i);
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            latlngs.push([lat, lon]);
            colorValues.push(canColorByChannel ? Number(log.data[i][mapColorCol]) : null);
            nextLeafletHoverLookup.set(rowKey(log.id, lap, i), { lat, lon });
            if (!bounds) {
              bounds = L.latLngBounds([lat, lon], [lat, lon]);
            } else {
              bounds.extend([lat, lon]);
            }
          }
        });
        
        if (latlngs.length >= 1) {
          const color = getLapColor(log.id, lap);
          const dash = DASHES[fileIdx % DASHES.length];
          if (mapDrawMode === 'scatter') {
            for (let pi = 0; pi < latlngs.length; pi++) {
              const pointColor = canColorByChannel
                ? (getLeafletColorForValue(colorValues[pi], effectiveMapColorScaleConfig) || color)
                : color;
              const point = L.circleMarker(latlngs[pi], {
                radius: 2.5,
                color: pointColor,
                weight: 0,
                fillColor: pointColor,
                fillOpacity: 0.95,
                opacity: 0.95
              }).addTo(leafletMap);
              leafletLayers.push(point);
            }
          } else if (latlngs.length >= 2) {
            if (canColorByChannel) {
              const dashArray = mapPlotlyDashToLeaflet(dash);
              for (let si = 0; si < latlngs.length - 1; si++) {
                const segmentColor = getLeafletColorForValue(colorValues[si], effectiveMapColorScaleConfig) || color;
                const segment = L.polyline([latlngs[si], latlngs[si + 1]], {
                  color: segmentColor,
                  dashArray,
                  weight: 2,
                  opacity: 0.85
                }).addTo(leafletMap);
                leafletLayers.push(segment);
              }
            } else {
              const polyline = L.polyline(latlngs, {
                color: color,
                dashArray: mapPlotlyDashToLeaflet(dash),
                weight: 2,
                opacity: 0.7
              }).addTo(leafletMap);
              leafletLayers.push(polyline);
            }
          }
          
          // Add lap label at start
          const label = L.circleMarker(latlngs[0], {
            radius: 4,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).bindPopup(`${log.name} - Lap ${lap} (${mode === 'geo' ? (latLonSource.source === 'derived' ? 'GPBikes derived' : 'GPS') : 'X/Y meters'})`).addTo(leafletMap);
          
          leafletLayers.push(label);
        }
      });
    });
    
    // Fit map to bounds if we have data
    if (bounds && bounds.isValid()) {
      runLeafletProgrammaticView(() => {
        const savedView = mode === 'geo' ? leafletViewState : leafletXYViewState;
        const savedViewUserSet = mode === 'geo' ? leafletViewStateUserSet : leafletXYViewStateUserSet;
        if (savedViewUserSet && savedView && Array.isArray(savedView.center) && Number.isFinite(savedView.zoom)) {
          leafletMap.setView(savedView.center, savedView.zoom, { animate: false });
        } else {
          leafletMap.fitBounds(bounds, { padding: [50, 50] });
        }
      });
    }
    // fitBounds/setView above may have changed zoom -- rescale the corner background
    // trace's pixel weight now so it reflects its real-world width at the final zoom.
    refreshCornerBackgroundWeights();

    leafletHoverLookup = nextLeafletHoverLookup;
    clearLeafletHoverMarker();
    updateLeafletColorLegend(mapColorEnabled ? mapColorChannel : '', effectiveMapColorScaleConfig, mapColorScaleConfig, mapColorMode);
    renderMapNoteMarkers();

    requestAnimationFrame(() => leafletMap.invalidateSize());
  }

  // Creates (once) the desktop-only drag handle that lets the user resize the shared
  // temperature-profile-plots height budget (tempProfileRowsHeightPx). Mirrors the drag
  // interaction resize-panels.js already uses for the sidebar/maps/plot-height handles, but
  // lives here since only app.js knows Plotly's own computed subplot domains. Dragging is
  // throttled to one full updatePlot() per animation frame rather than hand-rolling a partial
  // Plotly.relayout, so the drag can never drift out of sync with buildLayout's own domain math
  // (which also has to reshuffle the main plot's channel-axis domains, not just yaxis).
  function ensureTempProfileResizeHandle() {
    if (tempProfileResizeHandleEl) return tempProfileResizeHandleEl;
    if (!plotDiv) return null;
    const handle = document.createElement('div');
    handle.className = 'temp-profile-resize-handle';
    handle.title = 'Drag to resize temperature profile plots';
    handle.hidden = true;
    plotDiv.appendChild(handle);

    let dragStartY = 0;
    let dragStartHeightPx = 0;
    let rafPending = false;

    function scheduleUpdate() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => { rafPending = false; updatePlot(); });
    }

    function onMove(ev) {
      const dy = ev.clientY - dragStartY;
      const totalHeight = getFigureHeight(lastIncludeTimeSlipForResize);
      const maxAllowedPx = Math.max(TEMP_PROFILE_ROWS_MIN_HEIGHT_PX, totalHeight - TEMP_PROFILE_MAIN_MIN_HEIGHT_PX);
      // Handle sits above the temp-profile block: dragging down grows the main plot and
      // shrinks the block.
      tempProfileRowsHeightPx = Math.min(Math.max(dragStartHeightPx - dy, TEMP_PROFILE_ROWS_MIN_HEIGHT_PX), maxAllowedPx);
      scheduleUpdate();
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      handle.classList.remove('is-dragging');
      document.body.style.cursor = '';
      saveTempProfileRowsHeight();
    }
    handle.addEventListener('mousedown', (ev) => {
      if (ev.button !== 0) return;
      ev.preventDefault();
      dragStartY = ev.clientY;
      dragStartHeightPx = tempProfileRowsHeightPx;
      handle.classList.add('is-dragging');
      document.body.style.cursor = 'row-resize';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    tempProfileResizeHandleEl = handle;
    return handle;
  }

  // Positions the handle at the pixel row where the main plot's domain meets the
  // temp-profile block's domain, read from Plotly's own resolved _fullLayout (post-render,
  // so automargin-adjusted margins are accounted for) rather than the nominal layout object
  // passed into Plotly.react -- domain *fractions* are respected as given, but automargin can
  // grow the actual top/bottom margins beyond the hint buildLayout supplied.
  function positionTempProfileResizeHandle(tempBlockDomain, hasTempPlots) {
    const mobile = window.innerWidth <= 980;
    if (!hasTempPlots || mobile || !tempBlockDomain || !plotDiv) {
      if (tempProfileResizeHandleEl) tempProfileResizeHandleEl.hidden = true;
      return;
    }
    const handle = ensureTempProfileResizeHandle();
    if (!handle) return;
    plotDiv.style.position = plotDiv.style.position || 'relative';
    const fullLayout = plotDiv._fullLayout;
    if (!fullLayout || !Number.isFinite(fullLayout.height)) { handle.hidden = true; return; }
    const marginT = (fullLayout.margin && Number.isFinite(fullLayout.margin.t)) ? fullLayout.margin.t : 30;
    const marginB = (fullLayout.margin && Number.isFinite(fullLayout.margin.b)) ? fullLayout.margin.b : 80;
    const plotAreaHeight = Math.max(0, fullLayout.height - marginT - marginB);
    const topPx = marginT + (1 - tempBlockDomain[1]) * plotAreaHeight;
    handle.hidden = false;
    handle.style.top = `${Math.round(topPx)}px`;
  }

  // Same idea as ensureTempProfileResizeHandle above, for Time Slip's own height
  // (timeSlipHeightPx) instead of the temp-profile block's.
  function ensureTimeSlipResizeHandle() {
    if (timeSlipResizeHandleEl) return timeSlipResizeHandleEl;
    if (!plotDiv) return null;
    const handle = document.createElement('div');
    handle.className = 'time-slip-resize-handle';
    handle.title = 'Drag to resize Time Slip';
    handle.hidden = true;
    plotDiv.appendChild(handle);

    let dragStartY = 0;
    let dragStartHeightPx = 0;
    let rafPending = false;

    function scheduleUpdate() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => { rafPending = false; updatePlot(); });
    }

    function onMove(ev) {
      const dy = ev.clientY - dragStartY;
      const totalHeight = getFigureHeight(lastIncludeTimeSlipForResize);
      // The temp-profile block (if active) also draws from totalHeight -- reserve its
      // current preference (clamped to its own floor) on top of the main plot's floor so
      // dragging Time Slip larger can't squeeze the temp block below its own minimum.
      const otherReserved = tempProfilePlots.some((p) => p.enabled && p.channels.length > 0)
        ? Math.min(Math.max(tempProfileRowsHeightPx, TEMP_PROFILE_ROWS_MIN_HEIGHT_PX), totalHeight)
        : 0;
      const maxAllowedPx = Math.max(TIME_SLIP_MIN_HEIGHT_PX, totalHeight - TEMP_PROFILE_MAIN_MIN_HEIGHT_PX - otherReserved);
      // Handle sits above Time Slip: dragging down grows the main plot and shrinks Time Slip.
      timeSlipHeightPx = Math.min(Math.max(dragStartHeightPx - dy, TIME_SLIP_MIN_HEIGHT_PX), maxAllowedPx);
      scheduleUpdate();
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      handle.classList.remove('is-dragging');
      document.body.style.cursor = '';
      saveTimeSlipHeight();
    }
    handle.addEventListener('mousedown', (ev) => {
      if (ev.button !== 0) return;
      ev.preventDefault();
      dragStartY = ev.clientY;
      dragStartHeightPx = timeSlipHeightPx;
      handle.classList.add('is-dragging');
      document.body.style.cursor = 'row-resize';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    timeSlipResizeHandleEl = handle;
    return handle;
  }

  // Positions the handle at the pixel row where the main plot's (or the temp-profile
  // block's, when active) domain meets Time Slip's domain -- same technique as
  // positionTempProfileResizeHandle above.
  function positionTimeSlipResizeHandle(timeSlipDomain, includeTimeSlip) {
    const mobile = window.innerWidth <= 980;
    if (!includeTimeSlip || mobile || !timeSlipDomain || !plotDiv) {
      if (timeSlipResizeHandleEl) timeSlipResizeHandleEl.hidden = true;
      return;
    }
    const handle = ensureTimeSlipResizeHandle();
    if (!handle) return;
    plotDiv.style.position = plotDiv.style.position || 'relative';
    const fullLayout = plotDiv._fullLayout;
    if (!fullLayout || !Number.isFinite(fullLayout.height)) { handle.hidden = true; return; }
    const marginT = (fullLayout.margin && Number.isFinite(fullLayout.margin.t)) ? fullLayout.margin.t : 30;
    const marginB = (fullLayout.margin && Number.isFinite(fullLayout.margin.b)) ? fullLayout.margin.b : 80;
    const plotAreaHeight = Math.max(0, fullLayout.height - marginT - marginB);
    const topPx = marginT + (1 - timeSlipDomain[1]) * plotAreaHeight;
    handle.hidden = false;
    handle.style.top = `${Math.round(topPx)}px`;
  }

  // activeTempPlots (optional): the temperature profile plots currently active (see
  // getActiveTempProfilePlots). Each gets its own xaxisN/yaxisN pair, stacked directly above
  // Time Slip's domain (or above 0 if there's no Time Slip) -- only the main plot's domain
  // bottom moves up to make room. The whole temp block shares one height budget
  // (tempProfileRowsHeightPx, user-draggable -- see positionTempProfileResizeHandle), split
  // evenly across however many plots are active. Time Slip's own height (timeSlipHeightPx,
  // desktop only -- see positionTimeSlipResizeHandle) is likewise user-draggable, taking
  // space from/giving space back to the main plot the same way.
  function buildLayout(mainXTitle, ycols, includeTimeSlip, showCornerStrip, logX, logY, activeTempPlots) {
    const mobile = window.innerWidth <= 980;
    const mainDomainTop = showCornerStrip ? (CORNER_STRIP_DOMAIN[0] - CORNER_STRIP_GAP) : 1;
    const tempPlots = activeTempPlots || [];
    const multiRow = includeTimeSlip || tempPlots.length > 0;
    const totalHeight = getFigureHeight(includeTimeSlip, tempPlots);
    const hasTempPlots = tempPlots.length > 0;

    let mainDomainBottom = 0;
    let timeSlipDomain = null;
    if (includeTimeSlip) {
      if (mobile) {
        mainDomainBottom = 0.48;
        timeSlipDomain = [0, 0.43];
      } else {
        // Reserve the temp-profile block's current preference (clamped to its own floor) on
        // top of the main plot's floor, so Time Slip can't be dragged large enough to squeeze
        // the temp block below its own minimum -- tempBlockDomain's own max calc below does
        // the same in reverse, using this block's *actual* resolved fraction (computed first).
        const otherReserved = hasTempPlots
          ? Math.min(Math.max(tempProfileRowsHeightPx, TEMP_PROFILE_ROWS_MIN_HEIGHT_PX), totalHeight)
          : 0;
        const maxAllowedPx = Math.max(TIME_SLIP_MIN_HEIGHT_PX, totalHeight - TEMP_PROFILE_MAIN_MIN_HEIGHT_PX - otherReserved);
        const clampedPx = Math.min(Math.max(timeSlipHeightPx, TIME_SLIP_MIN_HEIGHT_PX), maxAllowedPx);
        const timeSlipFraction = totalHeight > 0 ? clampedPx / totalHeight : 0;
        timeSlipDomain = [0, timeSlipFraction];
        // Small fixed gap for Time Slip's own x-axis tick labels, matching the historical
        // 0.23 - 0.20 = 0.03 spacing this replaces.
        mainDomainBottom = timeSlipFraction + 0.03;
      }
    }

    let tempBlockDomain = null;
    if (hasTempPlots) {
      // Mobile: no drag handle, so there's no "preference" to clamp -- getFigureHeight
      // already grew totalHeight by exactly this many px (computeMobileTempPlotsHeightPx),
      // so the fraction just divides back out to that same content-sized pixel height.
      // Desktop: clamp the user's draggable preference against the space left after Time
      // Slip, same as before.
      const tempBlockPx = mobile
        ? computeMobileTempPlotsHeightPx(tempPlots)
        : (() => {
          const otherReserved = timeSlipDomain ? timeSlipDomain[1] * totalHeight : 0;
          const maxAllowedPx = Math.max(TEMP_PROFILE_ROWS_MIN_HEIGHT_PX, totalHeight - TEMP_PROFILE_MAIN_MIN_HEIGHT_PX - otherReserved);
          return Math.min(Math.max(tempProfileRowsHeightPx, TEMP_PROFILE_ROWS_MIN_HEIGHT_PX), maxAllowedPx);
        })();
      const tempBlockFraction = totalHeight > 0 ? tempBlockPx / totalHeight : 0;
      const tempBlockBottom = mainDomainBottom;
      const tempBlockTop = Math.min(mainDomainTop - 0.02, tempBlockBottom + tempBlockFraction);
      tempBlockDomain = [tempBlockBottom, Math.max(tempBlockBottom, tempBlockTop)];
      mainDomainBottom = tempBlockDomain[1];
    }

    const mainDomain = [mainDomainBottom, mainDomainTop];
    const axisCfg = buildChannelAxisConfig(ycols, mainDomain, logY);

    if (!multiRow) {
      const layout = {
        margin:{t:30},
        xaxis:{title:{text: mainXTitle, standoff: 8}, automargin:true, type: logX ? 'log' : 'linear'},
        showlegend:false,
        height: totalHeight
      };
      layout.margin.l = axisCfg.marginLeft;
      layout.margin.r = axisCfg.marginRight;
      Object.assign(layout, axisCfg.axisLayout);
      return {layout, channelToRef: axisCfg.channelToRef, mainDomainTop, tempAxisMap: new Map(), tempBlockDomain: null, timeSlipDomain: null};
    }

    const layout = {
      margin:{t:30},
      xaxis:{title:{text: mainXTitle, standoff: 8}, domain:[0,1], anchor:'y', type: logX ? 'log' : 'linear'},
      showlegend:false,
      height: totalHeight
    };
    if (includeTimeSlip) {
      layout.xaxis2 = {title:{text: ''}, domain:[0,1], anchor:'y2', matches:'x', showticklabels:false, type: logX ? 'log' : 'linear'};
      layout.yaxis2 = {title:{text: 'Time Slip (s)', standoff: 8}, domain: timeSlipDomain};
    }

    // yaxis2/xaxis2 are always reserved for Time Slip (see groupChannelsByAxis), so temp
    // profile axes start after both that and whatever channel axes the Y-channel selection
    // already needs (distinct-unit channels get their own yaxis3, yaxis4, ... -- see
    // buildChannelAxisConfig above).
    const tempAxisMap = new Map(); // plot.id -> { xaxis: 'x3', yaxis: 'y3', domain: [bottom, top] }
    if (tempPlots.length > 0) {
      const { groups } = groupChannelsByAxis(ycols);
      let maxAxisIndex = 1;
      groups.forEach((g, gi) => {
        const n = gi === 0 ? 1 : (gi + 2);
        if (n > maxAxisIndex) maxAxisIndex = n;
      });
      const axisStart = Math.max(maxAxisIndex, 2) + 1;
      const rowHeight = (tempBlockDomain[1] - tempBlockDomain[0]) / tempPlots.length;
      tempPlots.forEach((p, i) => {
        const axisIdx = axisStart + i;
        const rowTop = tempBlockDomain[1] - i * rowHeight;
        const rowBottom = rowTop - rowHeight;
        const xKey = `xaxis${axisIdx}`;
        const yKey = `yaxis${axisIdx}`;
        layout[xKey] = {domain:[0,1], anchor: `y${axisIdx}`, matches:'x', showticklabels:false, type: logX ? 'log' : 'linear'};
        // categoryarray[0] renders at the bottom of a categorical y-axis, so reverse the
        // configured order (first configured channel = top of the strip, reading order).
        // Per-channel tick labels are hidden -- the axis title (the plot's own group name,
        // e.g. "Rear External") already identifies what the strip is; categoryarray still
        // controls each channel's row position even with its label not drawn.
        layout[yKey] = {
          type:'category', categoryorder:'array', categoryarray: p.channels.slice().reverse(),
          domain: [rowBottom, rowTop], title:{text: p.name, standoff: 4}, automargin:true,
          showticklabels: false
        };
        tempAxisMap.set(p.id, {xaxis: `x${axisIdx}`, yaxis: `y${axisIdx}`, domain: [rowBottom, rowTop]});
      });
    }

    layout.margin.l = axisCfg.marginLeft;
    layout.margin.r = axisCfg.marginRight + (tempPlots.length > 0 ? 60 : 0);
    Object.assign(layout, axisCfg.axisLayout);
    return {layout, channelToRef: axisCfg.channelToRef, mainDomainTop, tempAxisMap, tempBlockDomain, timeSlipDomain};
  }

  // Plotly's built-in autorange breaks catastrophically (producing a range spanning
  // hundreds of decades) when a log-type axis has any shape/annotation anchored to it
  // via xref/yref -- e.g. this app's corner strip (xref:'x') or a selection linear-fit
  // (xref/yref of the fitted trace's axis). Computing the range ourselves from the actual
  // plotted values sidesteps that Plotly bug entirely.
  function computeLogAxisRange(values) {
    let lo = null, hi = null;
    for (const v of values) {
      if (typeof v !== 'number' || !isFinite(v) || v <= 0) continue;
      if (lo === null || v < lo) lo = v;
      if (hi === null || v > hi) hi = v;
    }
    if (lo === null) return null;
    const logLo = Math.log10(lo);
    const logHi = Math.log10(hi);
    const pad = (logHi - logLo) * 0.05 || 0.3;
    return [logLo - pad, logHi + pad];
  }

  function applyLogAxisRanges(layout, traces, tsPreview, logX, logY) {
    if (logX && !layout.xaxis.range) {
      const xs = [];
      traces.concat(tsPreview).forEach(t => (t.x || []).forEach(v => xs.push(v)));
      const range = computeLogAxisRange(xs);
      if (range) {
        layout.xaxis.range = range;
        layout.xaxis.autorange = false;
        if (layout.xaxis2) {
          layout.xaxis2.range = range.slice();
          layout.xaxis2.autorange = false;
        }
      }
    }
    if (logY) {
      const byAxis = new Map();
      traces.forEach(t => {
        const axisRef = t.yaxis || 'y';
        if (!byAxis.has(axisRef)) byAxis.set(axisRef, []);
        (t.y || []).forEach(v => byAxis.get(axisRef).push(v));
      });
      byAxis.forEach((ys, axisRef) => {
        const axisKey = axisRef === 'y' ? 'yaxis' : `yaxis${axisRef.slice(1)}`;
        if (!layout[axisKey]) return;
        const range = computeLogAxisRange(ys);
        if (range) {
          layout[axisKey].range = range;
          layout[axisKey].autorange = false;
        }
      });
    }
  }

  function getXSeriesForMode(log, maskIdx, xMode, customXCol) {
    if (xMode === 'distance') {
      if (!log.meta.lapRelDist) return null;
      return maskIdx.map(i => log.meta.lapRelDist[i]);
    }
    if (xMode === 'time') {
      return maskIdx.map(i => log.meta.lapTime[i]);
    }
    if (!customXCol) return null;
    const resolvedCol = resolveChannelForLog(customXCol, log);
    if (!resolvedCol || !log.cols.includes(resolvedCol)) return null;
    return maskIdx.map(i => log.data[i][resolvedCol]);
  }

  function getXAxisTitle(xMode, customXCol) {
    if (xMode === 'distance') return 'Lap Distance (m)';
    if (xMode === 'time') return 'Lap Time (s)';
    if (!customXCol) return 'X Axis';
    const unit = getUnitForChannel(customXCol);
    return (unit != null && unit !== '') ? `${customXCol} [${unit}]` : customXCol;
  }

  // Bare unit of whatever's currently on the x-axis -- 's' for time, 'm' for distance, or a
  // custom channel's own unit (possibly none). Selection-fit frequency/rate values (FFT,
  // sinusoidal omega, phi-as-offset) are always computed against this axis, not against
  // time specifically, so their display units (see getFrequencyUnitLabel below) have to
  // track it too instead of assuming "Hz"/"s".
  function getXAxisUnit(xMode, customXCol) {
    if (xMode === 'distance') return 'm';
    if (xMode === 'time') return 's';
    if (!customXCol) return '';
    const unit = getUnitForChannel(customXCol);
    return (unit != null && unit !== '') ? unit : '';
  }

  // Display label for a rate/frequency measured in cycles per x-axis-unit: the familiar
  // "Hz" when the x-axis is time (seconds), "1/<unit>" (e.g. "1/m") otherwise, or "cycles"
  // when the x-axis has no known unit at all (e.g. a dimensionless custom channel).
  function getFrequencyUnitLabel() {
    if (mainPlotXAxisUnit === 's') return 'Hz';
    if (mainPlotXAxisUnit) return `1/${mainPlotXAxisUnit}`;
    return 'cycles';
  }

  function csvEscapeValue(value) {
    const s = value === null || value === undefined ? '' : String(value);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function describeActiveDataFiltersForMetadata() {
    const enabledFilters = getEnabledDataFilters();
    if (enabledFilters.length === 0) return 'None';
    return enabledFilters.map(f => formatDataFilterRange(f)).join('; ');
  }

  // "#"-prefixed lines are a common lightweight convention for metadata at the top of a CSV
  // export (not meant to be parsed as a data row) -- source file(s) and active data filters
  // apply to every export; extraLines lets a specific export (e.g. the binned plot) add its
  // own additional context (bin axis/width) before the blank "#" separator and the real header.
  function buildCsvMetadataLines(selFiles, extraLines) {
    const lines = [
      `# Source file(s): ${selFiles.map(l => l.name).join(', ') || 'None'}`,
      `# Data filters: ${describeActiveDataFiltersForMetadata()}`
    ];
    (extraLines || []).forEach((line) => lines.push(`# ${line}`));
    lines.push('#');
    return lines;
  }

  // Rebuilds exactly what's currently plotted -- same file/lap selection, same data filters,
  // same X mode, same selected Y channels -- as a CSV, one row per row that's actually
  // visible in the main plot right now (File, Lap, X, one column per selected Y channel).
  function buildDisplayedDataCsv() {
    const selFiles = getSelectedFiles();
    const selectedLaps = getSelectedLaps();
    const selectedYChannels = getSelectedY();
    const ycols = selectedYChannels.filter(channel => !shouldHideOriginalQuickModChannel(channel, selectedYChannels));
    const xMode = document.querySelector('input[name=xaxis]:checked').value;
    const customXCol = xCustomSelect ? xCustomSelect.value : '';
    const xLabel = getXAxisTitle(xMode, customXCol);
    const enabledFilters = getEnabledDataFilters();

    const header = ['File', 'Lap', xLabel, ...ycols.map(y => getChannelLabel(y))];
    const lines = buildCsvMetadataLines(selFiles);
    lines.push(header.map(csvEscapeValue).join(','));

    selFiles.forEach((log) => {
      const activeFilters = resolveDataFiltersForLog(log, enabledFilters);
      const resolvedYCols = ycols.map(y => resolveChannelForLog(y, log));
      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a, b) => a - b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        let maskIdx = log.meta.lapNum.map((n, i) => n === lap ? i : -1).filter(i => i >= 0);
        maskIdx = applyRowFiltersToMask(log, maskIdx, activeFilters);
        const xArr = getXSeriesForMode(log, maskIdx, xMode, customXCol);
        if (!xArr) return;
        maskIdx.forEach((rowIdx, k) => {
          const row = [log.name, lap, xArr[k]];
          resolvedYCols.forEach((resolvedCol) => {
            const v = (resolvedCol && log.cols.includes(resolvedCol)) ? log.data[rowIdx][resolvedCol] : '';
            row.push(v === null || v === undefined ? '' : v);
          });
          lines.push(row.map(csvEscapeValue).join(','));
        });
      });
    });

    return lines.join('\r\n');
  }

  function triggerCsvDownload(csv, filenamePrefix) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadDisplayedDataCsv() {
    triggerCsvDownload(buildDisplayedDataCsv(), 'displayed-data');
  }

  // Rebuilds the Binned Plot overlay's own points (see computeBinnedOverlayTraces) as a CSV:
  // one row per bin, a single shared X column (the mean of every in-scope row's axis value in
  // that bin, regardless of which Y channels it had), and one value column per selected Y
  // channel -- null/missing for a channel with no data in that particular bin. A shared X
  // column (rather than each channel's own slightly-different bin mean, which is what the
  // plotted trace uses) is what makes a single flat table possible when multiple channels
  // are selected.
  function buildBinnedPlotCsv() {
    const selFiles = getSelectedFiles();
    const selectedLaps = getSelectedLaps();
    const selectedYChannels = getSelectedY();
    const ycols = selectedYChannels.filter(channel => !shouldHideOriginalQuickModChannel(channel, selectedYChannels));
    const axisChannel = binnedPlotAxisSelect ? binnedPlotAxisSelect.value : '';
    const binWidth = binnedPlotBinWidthInput ? parseFloat(binnedPlotBinWidthInput.value) : NaN;
    if (!axisChannel || !Number.isFinite(binWidth) || binWidth <= 0 || ycols.length === 0) return null;

    const enabledFilters = getEnabledDataFilters();
    const bins = new Map();

    selFiles.forEach((log) => {
      const axisResolvedCol = resolveChannelForLog(axisChannel, log);
      if (!axisResolvedCol || !log.cols.includes(axisResolvedCol)) return;
      const activeFilters = resolveDataFiltersForLog(log, enabledFilters);
      const lapNumArr = log.meta.lapNum || [];
      const resolvedYCols = ycols.map(y => resolveChannelForLog(y, log));

      log.data.forEach((row, i) => {
        if (!isLapSelected(selectedLaps, log.id, lapNumArr[i])) return;
        if (activeFilters.length > 0 && !rowPassesDataFilters(log, i, activeFilters)) return;
        const x = Number(row[axisResolvedCol]);
        if (!Number.isFinite(x)) return;
        const binKey = Math.round(x / binWidth);
        let bin = bins.get(binKey);
        if (!bin) { bin = { xSum: 0, xCount: 0, values: new Map() }; bins.set(binKey, bin); }
        bin.xSum += x;
        bin.xCount += 1;

        ycols.forEach((y, yi) => {
          const resolvedY = resolvedYCols[yi];
          if (!resolvedY || !log.cols.includes(resolvedY)) return;
          const v = Number(row[resolvedY]);
          if (!Number.isFinite(v)) return;
          let entry = bin.values.get(y);
          if (!entry) { entry = { sum: 0, count: 0 }; bin.values.set(y, entry); }
          entry.sum += v;
          entry.count += 1;
        });
      });
    });

    if (bins.size === 0) return null;

    const header = [getChannelLabel(axisChannel), ...ycols.map(y => `${getChannelLabel(y)} (binned)`)];
    const lines = buildCsvMetadataLines(selFiles, [
      `Bin axis: ${getChannelLabel(axisChannel)}`,
      `Bin width: ${binWidth}`
    ]);
    lines.push(header.map(csvEscapeValue).join(','));

    Array.from(bins.keys()).sort((a, b) => a - b).forEach((binKey) => {
      const bin = bins.get(binKey);
      const row = [bin.xSum / bin.xCount];
      ycols.forEach((y) => {
        const entry = bin.values.get(y);
        row.push(entry ? entry.sum / entry.count : '');
      });
      lines.push(row.map(csvEscapeValue).join(','));
    });

    return lines.join('\r\n');
  }

  function downloadBinnedPlotDataCsv() {
    const csv = buildBinnedPlotCsv();
    if (!csv) return;
    triggerCsvDownload(csv, 'binned-plot');
  }

  function downloadBinnedPlotDataCsv() {
    const csv = buildBinnedPlotCsv();
    if (!csv) return;
    triggerCsvDownload(csv, 'binned-plot');
  }

  function buildHoverTemplate(xLabel, yLabel, colorLabel) {
    const base = `${escapeHtml(xLabel)}: %{x:.3f}<br>${escapeHtml(yLabel)}: %{y:.3f}`;
    if (colorLabel) {
      // %{text} carries the color channel's raw value per point (see applyColorAxisToTrace) --
      // customdata is already used elsewhere for hover-sync row lookups, so it can't double
      // as this.
      return `${base}<br>${escapeHtml(colorLabel)}: %{text}<extra></extra>`;
    }
    return `${base}<extra></extra>`;
  }

  function findNearestRowIndexByLapDistance(log, lap, targetDist) {
    if (!log || !log.meta || !Array.isArray(log.meta.lapNum) || !Array.isArray(log.meta.lapRelDist)) return -1;
    const target = Number(targetDist);
    if (!Number.isFinite(target)) return -1;

    let bestIdx = -1;
    let bestAbs = Infinity;
    for (let i = 0; i < log.meta.lapNum.length; i++) {
      if (log.meta.lapNum[i] !== lap) continue;
      const d = Number(log.meta.lapRelDist[i]);
      if (!Number.isFinite(d)) continue;
      const abs = Math.abs(d - target);
      if (abs < bestAbs) {
        bestAbs = abs;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function buildSortedNumericSeries(xArr, yArr) {
    const pairs = [];
    for (let i = 0; i < xArr.length; i++) {
      const x = Number(xArr[i]);
      const y = Number(yArr[i]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      pairs.push({ x, y });
    }
    pairs.sort((a, b) => a.x - b.x);
    return {
      x: pairs.map(p => p.x),
      y: pairs.map(p => p.y)
    };
  }

  // Picks the reference (log, lap) used to auto-detect corners: among all currently
  // selected laps, the one that covers the greatest lap distance. Corners are a track
  // property, so we deliberately compute from a single lap rather than per displayed lap;
  // using the longest-distance lap (rather than just the lowest lap number) keeps a short
  // partial out/in lap from being picked when in/out-lap exclusion doesn't apply (e.g. logs
  // with fewer than 3 laps, where nothing gets auto-unchecked).
  function getReferenceLapForCorners(selFiles, selectedLaps) {
    let best = null;
    let bestSpan = -Infinity;
    selFiles.forEach(log => {
      if (!Array.isArray(log.meta.lapNum) || !Array.isArray(log.meta.lapRelDist)) return;
      const lapNums = Array.from(new Set(log.meta.lapNum));
      lapNums.forEach(lap => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        const dists = log.meta.lapNum
          .map((n, i) => n === lap ? Number(log.meta.lapRelDist[i]) : NaN)
          .filter(Number.isFinite);
        if (dists.length < 2) return;
        const [distMin, distMax] = arrayMinMax(dists);
        const span = distMax - distMin;
        if (span > bestSpan) {
          bestSpan = span;
          best = { log, lap };
        }
      });
    });
    return best;
  }

  // Resolves the corner/straight segmentation to render for the current file/lap
  // selection -- reference lap, auto-detected segments, any manual venue override, and
  // any in-progress corner-editor preview. Shared by the main plot's corner strip and
  // the map's corner background trace so both agree on the same segmentation.
  function resolveCornerDataForRender(selFiles, selectedLaps) {
    const cornerRef = getReferenceLapForCorners(selFiles, selectedLaps);
    if (!cornerRef) return { cornerData: null, cornerRef: null, cornerVenueKeyForRender: '' };

    const swapLeftRight = !!(cornerSwapLRInput && cornerSwapLRInput.checked);
    const autoData = computeCornerSegments(cornerRef.log, cornerRef.lap, swapLeftRight);
    const venue = getLogVenue(cornerRef.log);
    const cornerVenueKeyForRender = normalizeVenueKey(venue);

    let cornerData;
    if (cornerEditMode && cornerEditorSegments && cornerEditorVenueKey === cornerVenueKeyForRender) {
      cornerData = buildCornerDataFromSegments(cornerEditorSegments, autoData ? autoData.trackLength : 0);
    } else {
      const override = getCornerOverrideForVenue(venue);
      if (override) {
        const trackLength = autoData ? autoData.trackLength : override.trackLength;
        cornerData = buildCornerDataFromSegments(clampSegmentsToTrackLength(override.segments, trackLength), trackLength);
      } else {
        cornerData = autoData;
      }
    }
    return { cornerData, cornerRef, cornerVenueKeyForRender };
  }

  function buildCornerShapesAndAnnotations(cornerData, mainDomainTop, shadeOpacityPct) {
    const shapes = [];
    const annotations = [];
    const clickTargets = [];
    if (!cornerData || !Array.isArray(cornerData.segments)) return { shapes, annotations, clickTargets };

    const colorForType = (type) => {
      if (type === 'right') return CORNER_RIGHT_COLOR;
      if (type === 'left') return CORNER_LEFT_COLOR;
      return CORNER_STRAIGHT_COLOR;
    };
    const shadeOpacity = Math.max(0, Math.min(100, Number(shadeOpacityPct))) / 100;

    cornerData.segments.forEach(seg => {
      const color = colorForType(seg.type);

      // Strip block (always drawn, straights included).
      shapes.push({
        type: 'rect', xref: 'x', yref: 'paper',
        x0: seg.startDist, x1: seg.endDist,
        y0: CORNER_STRIP_DOMAIN[0], y1: CORNER_STRIP_DOMAIN[1],
        fillcolor: color, opacity: 1, line: { width: 0.5, color: '#fff' }, layer: 'above'
      });

      const cx = (seg.startDist + seg.endDist) / 2;
      const stripSpan = CORNER_STRIP_DOMAIN[1] - CORNER_STRIP_DOMAIN[0];
      // Two fixed rows shared by every segment, so T1/T2/S1/... line up across the whole
      // strip regardless of which segments happen to have a nickname: the nickname row
      // is simply left blank (annotation omitted) when there isn't one.
      // Symmetric about the strip's vertical center (0.5) so the pair reads as centered
      // rather than pinned toward either edge.
      const NICKNAME_ROW_Y = CORNER_STRIP_DOMAIN[0] + stripSpan * 0.64;
      const NUMBER_ROW_Y = CORNER_STRIP_DOMAIN[0] + stripSpan * 0.36;

      if (seg.nickname) {
        annotations.push({
          x: cx, xref: 'x',
          y: NICKNAME_ROW_Y, yref: 'paper',
          text: seg.nickname,
          showarrow: false,
          font: { color: '#fff', size: 8 }
        });
      }
      annotations.push({
        x: cx, xref: 'x',
        y: NUMBER_ROW_Y, yref: 'paper',
        text: formatCornerSegmentShortLabel(seg),
        showarrow: false,
        font: { color: '#fff', size: 10 }
      });
      clickTargets.push({
        type: seg.type,
        number: seg.number,
        straightNumber: seg.straightNumber,
        label: formatCornerSegmentFullLabel(seg),
        nickname: seg.nickname || '',
        startDist: seg.startDist,
        endDist: seg.endDist
      });

      // Faint full-height shading over corner zones only.
      if (seg.type === 'left' || seg.type === 'right') {
        shapes.push({
          type: 'rect', xref: 'x', yref: 'paper',
          x0: seg.startDist, x1: seg.endDist,
          y0: 0, y1: mainDomainTop,
          fillcolor: color, opacity: shadeOpacity, line: { width: 0 }, layer: 'below'
        });
      }
    });

    return { shapes, annotations, clickTargets };
  }

  function computeCornerTotals(cornerData) {
    const totals = { straightLength: 0, leftLength: 0, rightLength: 0, cornerLength: 0, cornerCount: 0 };
    if (!cornerData || !Array.isArray(cornerData.segments)) return totals;
    cornerData.segments.forEach(seg => {
      const len = Math.max(0, seg.endDist - seg.startDist);
      if (seg.type === 'left') { totals.leftLength += len; totals.cornerCount += 1; }
      else if (seg.type === 'right') { totals.rightLength += len; totals.cornerCount += 1; }
      else totals.straightLength += len;
    });
    totals.cornerLength = totals.leftLength + totals.rightLength;
    return totals;
  }

  function formatCornerSummary(venue, cornerData, totals) {
    const trackLength = cornerData.trackLength;
    const pct = (v) => trackLength > 0 ? Math.round((v / trackLength) * 100) : 0;
    const venueLabel = venue || 'Track';
    return `${venueLabel} — ${trackLength.toFixed(0)/1000} km total | `
      + `Straights ${totals.straightLength.toFixed(0)} m (${pct(totals.straightLength)}%) | `
      + `Left ${totals.leftLength.toFixed(0)} m (${pct(totals.leftLength)}%) | `
      + `Right ${totals.rightLength.toFixed(0)} m (${pct(totals.rightLength)}%) | `
      + `Corners ${totals.cornerLength.toFixed(0)} m (${pct(totals.cornerLength)}%), ${totals.cornerCount} total`;
  }

  const TRACK_CORNER_METADATA_STORAGE_KEY = 'trackCornerMetadata';
  let lastSavedCornerMetadataSignature = '';

  function loadTrackCornerMetadataStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(TRACK_CORNER_METADATA_STORAGE_KEY) || '{}');
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch {
      return {};
    }
  }

  // Persists the auto-detected corner marks + summary totals for a venue to localStorage,
  // keyed by normalized venue name, so per-track corner data accumulates across sessions.
  function saveCornerMetadataForVenue(venue, cornerData, totals) {
    const venueKey = normalizeVenueKey(venue);
    if (!venueKey || !cornerData) return;

    const entry = {
      venue,
      trackLength: cornerData.trackLength,
      segments: cornerData.segments.map(s => ({ number: s.number || null, type: s.type, startDist: s.startDist, endDist: s.endDist })),
      totals,
      savedAt: new Date().toISOString()
    };

    const signature = venueKey + '|' + JSON.stringify(entry.segments);
    if (signature === lastSavedCornerMetadataSignature) return;
    lastSavedCornerMetadataSignature = signature;

    const store = loadTrackCornerMetadataStore();
    store[venueKey] = entry;
    try { localStorage.setItem(TRACK_CORNER_METADATA_STORAGE_KEY, JSON.stringify(store)); } catch {}
  }

  // Manual corner-boundary overrides made in the corner editor -- unlike the write-only
  // snapshot above, this store IS read back (see updatePlot()) and takes priority over
  // auto-detection for a venue once the user has edited its corners.
  const TRACK_CORNER_OVERRIDES_STORAGE_KEY = 'trackCornerOverrides';

  function loadTrackCornerOverridesStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(TRACK_CORNER_OVERRIDES_STORAGE_KEY) || '{}');
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch {
      return {};
    }
  }

  function getCornerOverrideForVenue(venue) {
    const venueKey = normalizeVenueKey(venue);
    if (!venueKey) return null;
    const entry = loadTrackCornerOverridesStore()[venueKey];
    if (!entry || !Array.isArray(entry.segments) || entry.segments.length === 0) return null;
    return entry;
  }

  function setCornerOverrideForVenue(venue, segments, trackLength) {
    const venueKey = normalizeVenueKey(venue);
    if (!venueKey || !Array.isArray(segments) || segments.length === 0) return;
    const store = loadTrackCornerOverridesStore();
    store[venueKey] = {
      venue,
      trackLength,
      segments: segments.map(s => ({ type: s.type, startDist: s.startDist, endDist: s.endDist, label: s.label || '', nickname: s.nickname || '' })),
      savedAt: new Date().toISOString()
    };
    try { localStorage.setItem(TRACK_CORNER_OVERRIDES_STORAGE_KEY, JSON.stringify(store)); } catch {}
  }

  function clearCornerOverrideForVenue(venue) {
    const venueKey = normalizeVenueKey(venue);
    if (!venueKey) return;
    const store = loadTrackCornerOverridesStore();
    if (!(venueKey in store)) return;
    delete store[venueKey];
    try { localStorage.setItem(TRACK_CORNER_OVERRIDES_STORAGE_KEY, JSON.stringify(store)); } catch {}
  }

  // A drawn start/finish line is stored keyed by venue when the log's metadata has one --
  // shared automatically by every log from that track, same as the corner overrides above
  // -- falling back to the filename when it doesn't (e.g. VBOX logs carry no venue
  // metadata at all), scoped to just that one file in that case.
  const START_FINISH_LINE_STORAGE_KEY = 'startFinishLineOverrides';

  function getStartFinishLineKey(log) {
    const venueKey = normalizeVenueKey(getLogVenue(log));
    if (venueKey) return `venue:${venueKey}`;
    const nameKey = String((log && log.name) || '').trim().toLowerCase();
    return nameKey ? `file:${nameKey}` : '';
  }

  function getStartFinishLineLabel(log) {
    const venue = getLogVenue(log);
    return venue || (log && log.name) || '';
  }

  function loadStartFinishLineStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(START_FINISH_LINE_STORAGE_KEY) || '{}');
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch {
      return {};
    }
  }

  function getStartFinishLineForLog(log) {
    const key = getStartFinishLineKey(log);
    if (!key) return null;
    const entry = loadStartFinishLineStore()[key];
    if (!entry || !entry.p1 || !entry.p2) return null;
    return entry;
  }

  function setStartFinishLineForLog(log, p1, p2) {
    const key = getStartFinishLineKey(log);
    if (!key) return;
    const store = loadStartFinishLineStore();
    store[key] = { label: getStartFinishLineLabel(log), p1, p2, savedAt: new Date().toISOString() };
    try { localStorage.setItem(START_FINISH_LINE_STORAGE_KEY, JSON.stringify(store)); } catch {}
  }

  function clearStartFinishLineForKey(key) {
    if (!key) return;
    const store = loadStartFinishLineStore();
    if (!(key in store)) return;
    delete store[key];
    try { localStorage.setItem(START_FINISH_LINE_STORAGE_KEY, JSON.stringify(store)); } catch {}
  }

  // Segment-crossing test done directly in raw lat/lon degrees -- whether two segments
  // cross, and the fraction along each at the crossing point, are both invariant under any
  // linear (even anisotropic) coordinate scaling, so no projection to meters is needed just
  // to find where the vehicle's path crosses the drawn line.
  function segmentCrossingFraction(p1, p2, a, b) {
    const d1x = p2.lon - p1.lon, d1y = p2.lat - p1.lat;
    const d2x = b.lon - a.lon, d2y = b.lat - a.lat;
    const denom = d1x * d2y - d1y * d2x;
    if (Math.abs(denom) < 1e-15) return null;
    const t = ((a.lon - p1.lon) * d2y - (a.lat - p1.lat) * d2x) / denom;
    const u = ((a.lon - p1.lon) * d1y - (a.lat - p1.lat) * d1x) / denom;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;
    return u;
  }

  // Minimum gap enforced between accepted crossings, to absorb GPS jitter that could
  // otherwise register as several crossings in quick succession right at the line (e.g. a
  // slow pit-lane pass near the drawn line). No real lap is anywhere near this short.
  const START_FINISH_MIN_LAP_SECONDS = 10;

  function computeStartFinishCrossingTimes(log, line) {
    const latLonSource = getLeafletLatLonSource(log);
    if (!latLonSource || !log || !Array.isArray(log.data)) return [];
    const times = (log.meta && log.meta._time) || [];
    const n = Math.min(log.data.length, times.length);
    const crossings = [];
    let prev = null;
    for (let i = 0; i < n; i++) {
      const lat = latLonSource.latAt(i);
      const lon = latLonSource.lonAt(i);
      const time = times[i];
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(time)) {
        prev = null;
        continue;
      }
      if (prev) {
        const u = segmentCrossingFraction(line.p1, line.p2, prev, { lat, lon });
        if (u != null) {
          const crossTime = prev.time + u * (time - prev.time);
          const lastCrossing = crossings[crossings.length - 1];
          if (Number.isFinite(crossTime) && (lastCrossing == null || crossTime - lastCrossing >= START_FINISH_MIN_LAP_SECONDS)) {
            crossings.push(crossTime);
          }
        }
      }
      prev = { lat, lon, time };
    }
    return crossings;
  }

  // Keeps the per-row "Lap Time"/"Lap Number" columns (written once at upload time in
  // buildLogRecord) in sync after meta.lapTime/lapNum get recomputed some other way.
  function syncLapColumnsFromMeta(log) {
    if (!log || !Array.isArray(log.data) || !log.meta) return;
    const lapTime = log.meta.lapTime || [];
    const lapNum = log.meta.lapNum || [];
    log.data.forEach((row, i) => {
      row['Lap Time'] = lapTime[i];
      row['Lap Number'] = lapNum[i];
    });
  }

  // Recomputes a log's laps from where its GPS track crosses a drawn start/finish line,
  // replacing whatever the file format's own lap splitter produced. The original
  // computation is snapshotted the first time this runs, so restoreOriginalLapsForLog can
  // revert it later without needing the file re-uploaded.
  function applyStartFinishLineToLog(log, line) {
    if (!log || !log.meta) return false;
    const crossings = computeStartFinishCrossingTimes(log, line);
    if (crossings.length === 0) return false;

    if (!log.meta._originalLapComputation) {
      log.meta._originalLapComputation = {
        lapNum: log.meta.lapNum ? log.meta.lapNum.slice() : null,
        lapTime: log.meta.lapTime ? log.meta.lapTime.slice() : null,
        lapRelDist: log.meta.lapRelDist ? log.meta.lapRelDist.slice() : null,
        lapDurations: log.meta.lapDurations ? log.meta.lapDurations.slice() : null
      };
    }

    const LP = window.LogFileProcessors;
    LP.computeLapsFromCrossingTimes(log.meta, crossings);
    LP.computeCrashFlags(log.meta);
    syncLapColumnsFromMeta(log);
    return true;
  }

  function restoreOriginalLapsForLog(log) {
    if (!log || !log.meta || !log.meta._originalLapComputation) return false;
    const orig = log.meta._originalLapComputation;
    if (orig.lapNum) log.meta.lapNum = orig.lapNum.slice();
    if (orig.lapTime) log.meta.lapTime = orig.lapTime.slice();
    if (orig.lapRelDist) log.meta.lapRelDist = orig.lapRelDist.slice();
    if (orig.lapDurations) log.meta.lapDurations = orig.lapDurations.slice();
    else delete log.meta.lapDurations;
    delete log.meta._originalLapComputation;
    const LP = window.LogFileProcessors;
    if (LP && typeof LP.computeCrashFlags === 'function') LP.computeCrashFlags(log.meta);
    syncLapColumnsFromMeta(log);
    return true;
  }

  function applyStartFinishLineToMatchingLogs(key, line) {
    logs.forEach((log) => {
      if (getStartFinishLineKey(log) === key) applyStartFinishLineToLog(log, line);
    });
  }

  function setStartFinishEditStatus(message) {
    startFinishEditStatusMessage = message || '';
    renderFilesList();
  }

  const START_FINISH_LINE_COLOR = '#ff2d55';

  function clearStartFinishDrawOverlay() {
    startFinishDrawMarkers.forEach(m => { if (leafletMap) leafletMap.removeLayer(m); });
    startFinishDrawMarkers = [];
    if (startFinishDrawLine && leafletMap) leafletMap.removeLayer(startFinishDrawLine);
    startFinishDrawLine = null;
  }

  // Cheap update used during marker drag (fires continuously) -- only moves the connecting
  // line's endpoints, never touches the markers themselves (rebuilding those mid-drag would
  // destroy the very marker the user is dragging).
  function redrawStartFinishLineOnly() {
    if (startFinishDrawPoints.length !== 2) return;
    const latlngs = startFinishDrawPoints.map(p => [p.lat, p.lon]);
    if (startFinishDrawLine) {
      startFinishDrawLine.setLatLngs(latlngs);
    } else if (leafletMap) {
      startFinishDrawLine = L.polyline(latlngs, { color: START_FINISH_LINE_COLOR, weight: 3, dashArray: '6 4' }).addTo(leafletMap);
    }
  }

  // Full rebuild of the draw overlay's markers + line -- used when a point is added/removed
  // (not during a drag, see redrawStartFinishLineOnly above).
  function redrawStartFinishDrawOverlay() {
    clearStartFinishDrawOverlay();
    if (!leafletMap || !startFinishEditLogId) return;

    startFinishDrawPoints.forEach((pt, idx) => {
      const marker = L.marker([pt.lat, pt.lon], {
        draggable: true,
        title: idx === 0 ? 'Start/finish point A -- drag to adjust' : 'Start/finish point B -- drag to adjust'
      }).addTo(leafletMap);
      marker.on('drag', (ev) => {
        const ll = ev.target.getLatLng();
        startFinishDrawPoints[idx] = { lat: ll.lat, lon: ll.lng };
        redrawStartFinishLineOnly();
      });
      marker.on('dragend', () => setStartFinishEditStatus(''));
      startFinishDrawMarkers.push(marker);
    });

    redrawStartFinishLineOnly();
  }

  function handleStartFinishMapClick(e) {
    if (!startFinishEditLogId || startFinishDrawPoints.length >= 2) return;
    startFinishDrawPoints.push({ lat: e.latlng.lat, lon: e.latlng.lng });
    redrawStartFinishDrawOverlay();
    setStartFinishEditStatus('');
  }

  function attachStartFinishMapClickHandler() {
    if (!leafletMap) return;
    detachStartFinishMapClickHandler();
    startFinishMapClickHandler = (e) => handleStartFinishMapClick(e);
    leafletMap.on('click', startFinishMapClickHandler);
  }

  function detachStartFinishMapClickHandler() {
    if (leafletMap && startFinishMapClickHandler) leafletMap.off('click', startFinishMapClickHandler);
    startFinishMapClickHandler = null;
  }

  function startStartFinishLineEdit(log) {
    if (!log) return;
    if (!getLeafletLatLonSource(log)) {
      alert('This file has no GPS latitude/longitude data to draw a start/finish line on.');
      return;
    }
    cancelStartFinishLineEdit();
    if (cornerEditMode) closeCornerEditor();

    startFinishEditLogId = log.id;
    startFinishEditStatusMessage = '';
    const existing = getStartFinishLineForLog(log);
    startFinishDrawPoints = existing ? [{ ...existing.p1 }, { ...existing.p2 }] : [];

    if (showMapInput && !showMapInput.checked) showMapInput.checked = true;

    renderFilesList();
    renderLapsList();
    updatePlot();

    attachStartFinishMapClickHandler();
    redrawStartFinishDrawOverlay();
  }

  function cancelStartFinishLineEdit() {
    detachStartFinishMapClickHandler();
    clearStartFinishDrawOverlay();
    startFinishEditLogId = null;
    startFinishDrawPoints = [];
    startFinishEditStatusMessage = '';
  }

  function applyStartFinishLineEdit() {
    if (!startFinishEditLogId || startFinishDrawPoints.length !== 2) return;
    const log = logs.find(l => l.id === startFinishEditLogId);
    if (!log) { cancelStartFinishLineEdit(); renderFilesList(); return; }

    const line = { p1: startFinishDrawPoints[0], p2: startFinishDrawPoints[1] };
    const crossingCount = computeStartFinishCrossingTimes(log, line).length;
    if (crossingCount === 0) {
      setStartFinishEditStatus("This line doesn't cross the GPS track for this file -- drag the points onto the track and try again.");
      return;
    }

    const key = getStartFinishLineKey(log);
    setStartFinishLineForLog(log, line.p1, line.p2);
    applyStartFinishLineToMatchingLogs(key, line);

    cancelStartFinishLineEdit();
    renderFilesList();
    renderLapsList();
    updatePlot();
  }

  function handleClearStartFinishLine(log) {
    if (!log) return;
    const key = getStartFinishLineKey(log);
    if (key) clearStartFinishLineForKey(key);
    logs.forEach((l) => {
      if (getStartFinishLineKey(l) === key) restoreOriginalLapsForLog(l);
    });
    if (startFinishEditLogId === log.id) cancelStartFinishLineEdit();
    renderFilesList();
    renderLapsList();
    updatePlot();
  }

  // Saves the in-progress editor segments as this venue's override, using the actual
  // (non-normalized) venue name from the current reference lap for display purposes.
  function persistCornerEditorSegments() {
    if (!cornerEditorVenueKey || !Array.isArray(cornerEditorSegments) || cornerEditorSegments.length === 0) return;
    const ref = getReferenceLapForCorners(getSelectedFiles(), getSelectedLaps());
    const venue = ref ? getLogVenue(ref.log) : cornerEditorVenueKey;
    const trackLength = cornerEditorSegments[cornerEditorSegments.length - 1].endDist;
    setCornerOverrideForVenue(venue, cornerEditorSegments, trackLength);
  }

  function closeCornerEditor() {
    cornerEditMode = false;
    cornerEditorSegments = null;
    cornerEditorSelected = new Set();
    cornerEditorCombineFromIndex = null;
    cornerEditorVenueKey = '';
    if (cornerEditorPanel) cornerEditorPanel.hidden = true;
    if (cornerEditToggleBtn) {
      cornerEditToggleBtn.classList.remove('is-active');
      cornerEditToggleBtn.textContent = 'Edit';
    }
    if (cornerEditorStatus) cornerEditorStatus.textContent = '';
  }

  function openCornerEditor() {
    if (cornerEditorPanel) cornerEditorPanel.hidden = false;
    if (cornerEditorStatus) cornerEditorStatus.textContent = '';

    const xModeInput = document.querySelector('input[name=xaxis]:checked');
    const xMode = xModeInput ? xModeInput.value : null;
    if (xMode !== 'distance') {
      if (cornerEditorStatus) cornerEditorStatus.textContent = 'Switch X Axis to "Distance" to edit corners.';
      return;
    }

    const ref = getReferenceLapForCorners(getSelectedFiles(), getSelectedLaps());
    if (!ref) {
      if (cornerEditorStatus) cornerEditorStatus.textContent = 'Select a lap with distance data to edit corners.';
      return;
    }

    const swapLeftRight = !!(cornerSwapLRInput && cornerSwapLRInput.checked);
    const autoData = computeCornerSegments(ref.log, ref.lap, swapLeftRight);
    if (!autoData || !Array.isArray(autoData.segments) || autoData.segments.length === 0) {
      if (cornerEditorStatus) cornerEditorStatus.textContent = 'No corner data detected for this lap yet.';
      return;
    }

    if (showCornersInput && !showCornersInput.checked) showCornersInput.checked = true;

    const venue = getLogVenue(ref.log);
    const override = getCornerOverrideForVenue(venue);

    cornerEditMode = true;
    cornerEditorVenueKey = normalizeVenueKey(venue);
    cornerEditorSegments = override
      ? clampSegmentsToTrackLength(override.segments, autoData.trackLength)
      : autoData.segments.map(s => ({ type: s.type, startDist: s.startDist, endDist: s.endDist, label: '', nickname: '' }));
    cornerEditorSelected = new Set();
    cornerEditorCombineFromIndex = null;

    if (cornerEditToggleBtn) {
      cornerEditToggleBtn.classList.add('is-active');
      cornerEditToggleBtn.textContent = 'Close';
    }
    renderCornerEditorPanel();
    updatePlot();
  }

  function changeCornerEditorSegmentType(i, newType) {
    if (!Array.isArray(cornerEditorSegments) || !cornerEditorSegments[i]) return;
    if (newType !== 'straight' && newType !== 'left' && newType !== 'right') return;
    cornerEditorSegments[i].type = newType;
    persistCornerEditorSegments();
    renderCornerEditorPanel();
    updatePlot();
  }

  // fraction is 0–1, how far through the segment to place the split (0.5 = halfway).
  function splitCornerEditorSegment(i, fraction) {
    const seg = Array.isArray(cornerEditorSegments) ? cornerEditorSegments[i] : null;
    if (!seg) return;
    if (!Number.isFinite(fraction) || fraction <= 0 || fraction >= 1) {
      if (cornerEditorStatus) cornerEditorStatus.textContent = 'Split fraction must be between 0 and 1 (e.g. 0.5 for the midpoint).';
      return;
    }

    const MIN_GAP = 0.5; // meters -- avoid degenerate near-zero-length segments
    const atDist = seg.startDist + fraction * (seg.endDist - seg.startDist);
    if (atDist <= seg.startDist + MIN_GAP || atDist >= seg.endDist - MIN_GAP) {
      if (cornerEditorStatus) {
        cornerEditorStatus.textContent =
          `That fraction lands too close to the edge of the segment (${seg.startDist.toFixed(1)}–${seg.endDist.toFixed(1)} m); pick one nearer the middle.`;
      }
      return;
    }
    if (cornerEditorStatus) cornerEditorStatus.textContent = '';

    // Splitting invalidates any manual number/nickname on the original segment -- it no
    // longer refers to one physical corner/straight, so both halves start fresh.
    const second = { type: seg.type, startDist: atDist, endDist: seg.endDist, label: '', nickname: '' };
    seg.endDist = atDist;
    seg.label = '';
    seg.nickname = '';
    cornerEditorSegments.splice(i + 1, 0, second);
    cornerEditorSelected = new Set(); // row indices shifted -- drop selection rather than point at the wrong rows
    cornerEditorCombineFromIndex = null;
    persistCornerEditorSegments();
    renderCornerEditorPanel();
    updatePlot();
  }

  function mergeCornerEditorSelected(newType) {
    if (!Array.isArray(cornerEditorSegments) || cornerEditorSelected.size < 2) {
      if (cornerEditorStatus) cornerEditorStatus.textContent = 'Select at least 2 adjacent segments to merge.';
      return;
    }
    const indices = Array.from(cornerEditorSelected).sort((a, b) => a - b);
    for (let k = 1; k < indices.length; k++) {
      if (indices[k] !== indices[k - 1] + 1) {
        if (cornerEditorStatus) cornerEditorStatus.textContent = 'Selected segments must be adjacent to merge.';
        return;
      }
    }

    const first = indices[0];
    const last = indices[indices.length - 1];
    // Merging combines multiple segments into one -- their individual numbers/nicknames
    // no longer apply, so the result starts fresh (the user can renumber/rename it).
    const merged = { type: newType, startDist: cornerEditorSegments[first].startDist, endDist: cornerEditorSegments[last].endDist, label: '', nickname: '' };
    cornerEditorSegments.splice(first, last - first + 1, merged);
    cornerEditorSelected = new Set();
    cornerEditorCombineFromIndex = null;
    if (cornerEditorStatus) cornerEditorStatus.textContent = '';
    persistCornerEditorSegments();
    renderCornerEditorPanel();
    updatePlot();
  }

  // Renumbers segment i and, if the new number is a simple shift from the old one (e.g.
  // T6 -> T7), cascades that same shift to every later segment of the same category
  // (corners only shift corners, straights only shift straights) so the sequence stays
  // consistent -- "T6 -> T7" pushes what was T7 to T8, T8 to T9, etc. Non-numeric labels
  // like "2a" carry their leading number ("2") through the shift ("2a" -> "3a").
  // A same-value edit (e.g. "6" -> "6a") has zero delta, so nothing else moves.
  function setCornerEditorSegmentLabel(i, value) {
    if (!Array.isArray(cornerEditorSegments) || !cornerEditorSegments[i]) return;
    const seg = cornerEditorSegments[i];
    const newLabel = String(value == null ? '' : value).trim();

    // Snapshot of *pre-edit* effective numbers, to compute the shift and read every
    // later segment's current number before any of them change.
    const numbered = buildCornerDataFromSegments(cornerEditorSegments, 0).segments;
    const oldNum = parseLeadingSegmentNumber(cornerSegmentDisplayNumber(numbered[i]));
    const newNum = parseLeadingSegmentNumber(newLabel);

    seg.label = newLabel;

    if (Number.isFinite(oldNum) && Number.isFinite(newNum) && newNum !== oldNum) {
      const delta = newNum - oldNum;
      const category = seg.type === 'straight' ? 'straight' : 'corner';
      for (let k = i + 1; k < cornerEditorSegments.length; k++) {
        const otherType = cornerEditorSegments[k].type;
        const otherCategory = otherType === 'straight' ? 'straight' : 'corner';
        if (otherCategory !== category) continue;
        const current = cornerSegmentDisplayNumber(numbered[k]);
        const m = /^(\d+)(.*)$/.exec(current);
        if (!m) continue; // no leading number to shift -- leave it as-is
        cornerEditorSegments[k].label = String(parseInt(m[1], 10) + delta) + m[2];
      }
    }

    persistCornerEditorSegments();
    renderCornerEditorPanel();
    updatePlot();
  }

  function setCornerEditorSegmentNickname(i, value) {
    if (!Array.isArray(cornerEditorSegments) || !cornerEditorSegments[i]) return;
    cornerEditorSegments[i].nickname = String(value == null ? '' : value).trim();
    persistCornerEditorSegments();
    updatePlot();
  }

  function resetCornerEditorToAutoDetected() {
    const ref = getReferenceLapForCorners(getSelectedFiles(), getSelectedLaps());
    if (!ref) return;
    const venue = getLogVenue(ref.log);
    clearCornerOverrideForVenue(venue);

    const swapLeftRight = !!(cornerSwapLRInput && cornerSwapLRInput.checked);
    const autoData = computeCornerSegments(ref.log, ref.lap, swapLeftRight);
    cornerEditorSegments = autoData
      ? autoData.segments.map(s => ({ type: s.type, startDist: s.startDist, endDist: s.endDist, label: '', nickname: '' }))
      : [];
    cornerEditorSelected = new Set();
    cornerEditorCombineFromIndex = null;
    if (cornerEditorStatus) cornerEditorStatus.textContent = 'Reset to auto-detected corners.';
    renderCornerEditorPanel();
    updatePlot();
  }

  function renderCornerEditorPanel() {
    if (!cornerEditorList || !Array.isArray(cornerEditorSegments)) return;

    // Cloned + renumbered copy purely to compute default T#/S# numbers for display;
    // indices line up 1:1 with cornerEditorSegments since it's built from the same order.
    const numbered = buildCornerDataFromSegments(cornerEditorSegments, 0).segments;

    cornerEditorList.innerHTML = '';
    cornerEditorSegments.forEach((seg, i) => {
      const row = document.createElement('div');
      row.className = 'corner-editor-row'
        + (cornerEditorSelected.has(i) ? ' is-selected' : '')
        + (cornerEditorCombineFromIndex === i ? ' is-combine-from' : '');

      // Range-pick a merge target: click "Combine From" on the start segment, then
      // "Combine To" on the end segment -- every segment in between gets selected,
      // avoiding a checkbox-per-row click-fest when jittery data produces many tiny
      // segments in a row.
      const combineBtn = document.createElement('button');
      combineBtn.type = 'button';
      combineBtn.className = 'corner-editor-combine-btn';
      if (cornerEditorCombineFromIndex === i) {
        combineBtn.textContent = 'Cancel';
        combineBtn.classList.add('is-picking');
        combineBtn.title = 'Cancel combining from this segment';
        combineBtn.addEventListener('click', () => {
          cornerEditorCombineFromIndex = null;
          renderCornerEditorPanel();
        });
      } else if (cornerEditorCombineFromIndex !== null) {
        combineBtn.textContent = 'Combine To';
        combineBtn.addEventListener('click', () => {
          const lo = Math.min(cornerEditorCombineFromIndex, i);
          const hi = Math.max(cornerEditorCombineFromIndex, i);
          const range = new Set();
          for (let k = lo; k <= hi; k++) range.add(k);
          cornerEditorSelected = range;
          cornerEditorCombineFromIndex = null;
          if (cornerEditorStatus) cornerEditorStatus.textContent = '';
          renderCornerEditorPanel();
        });
      } else {
        combineBtn.textContent = 'Combine From';
        combineBtn.addEventListener('click', () => {
          cornerEditorCombineFromIndex = i;
          cornerEditorSelected = new Set();
          renderCornerEditorPanel();
        });
      }
      row.appendChild(combineBtn);

      // Composite "T[2] (dropdown)" id: prefix letter, an inline renumber box, and the
      // type dropdown standing in for the old "(Right)" text -- replaces what used to be
      // a separate full-text label span plus a full-row type <select>.
      const idWrap = document.createElement('span');
      idWrap.className = 'corner-editor-id';

      const prefix = document.createElement('span');
      prefix.className = 'corner-editor-prefix';
      prefix.textContent = seg.type === 'straight' ? 'S' : 'T';
      idWrap.appendChild(prefix);

      const numberInput = document.createElement('input');
      numberInput.type = 'text';
      numberInput.className = 'corner-editor-number-input';
      numberInput.placeholder = '#';
      numberInput.title = 'Renumber this segment -- later ones shift to stay sequential';
      numberInput.value = cornerSegmentDisplayNumber(numbered[i]);
      numberInput.addEventListener('change', () => setCornerEditorSegmentLabel(i, numberInput.value));
      idWrap.appendChild(numberInput);

      const openParen = document.createElement('span');
      openParen.textContent = '(';
      idWrap.appendChild(openParen);

      const select = document.createElement('select');
      select.className = 'corner-editor-type-select';
      ['straight', 'left', 'right'].forEach((t) => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = CORNER_TYPE_LABELS[t];
        if (seg.type === t) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', () => changeCornerEditorSegmentType(i, select.value));
      idWrap.appendChild(select);

      const closeParen = document.createElement('span');
      closeParen.textContent = ')';
      idWrap.appendChild(closeParen);

      row.appendChild(idWrap);

      const range = document.createElement('span');
      range.className = 'corner-editor-row-range';
      const len = seg.endDist - seg.startDist;
      range.textContent = `${seg.startDist.toFixed(1)}–${seg.endDist.toFixed(1)} m (${len.toFixed(1)} m)`;
      row.appendChild(range);

      const nicknameInput = document.createElement('input');
      nicknameInput.type = 'text';
      nicknameInput.className = 'corner-editor-nickname-input';
      nicknameInput.placeholder = 'nickname (optional)';
      nicknameInput.value = seg.nickname || '';
      nicknameInput.addEventListener('change', () => setCornerEditorSegmentNickname(i, nicknameInput.value));
      row.appendChild(nicknameInput);

      const splitWrap = document.createElement('span');
      splitWrap.className = 'corner-editor-split';
      const splitInput = document.createElement('input');
      splitInput.type = 'number';
      splitInput.min = '0.01';
      splitInput.max = '0.99';
      splitInput.step = '0.05';
      splitInput.value = '0.5';
      splitInput.title = 'Fraction of the way through this segment (0–1, e.g. 0.5 = halfway)';
      const splitBtn = document.createElement('button');
      splitBtn.type = 'button';
      splitBtn.textContent = 'Split';
      splitBtn.addEventListener('click', () => splitCornerEditorSegment(i, Number(splitInput.value)));
      splitWrap.appendChild(splitInput);
      splitWrap.appendChild(splitBtn);
      row.appendChild(splitWrap);

      cornerEditorList.appendChild(row);
    });
  }

  function updatePlot() {
    // Captured before anything below rebuilds plotDiv.data, so a box/lasso selection (and
    // its fit) survives the replot -- see captureCurrentTraceSelection for why this is
    // needed at all. Suppressing reentrant selection handling for the duration keeps the
    // replot's own automatic "deselect" (Plotly clears selectedpoints on any data change)
    // from wiping the stats panel out from under the reapply below.
    const preservedSelection = captureCurrentTraceSelection();
    if (preservedSelection) suppressSelectionReentry = true;
    const selFiles = getSelectedFiles();
    const selectedYChannels = getSelectedY();
    let ycols = selectedYChannels.filter(channel => !shouldHideOriginalQuickModChannel(channel, selectedYChannels));
    const plotLinesEnabled = !plotTypeLinesInput || plotTypeLinesInput.checked;
    const plotMarkersEnabled = !!(plotTypeMarkersInput && plotTypeMarkersInput.checked);
    const traceMode = plotLinesEnabled && plotMarkersEnabled
      ? 'lines+markers'
      : (plotMarkersEnabled ? 'markers' : 'lines');
    const xMode = document.querySelector('input[name=xaxis]:checked').value;
    const customXCol = xCustomSelect ? xCustomSelect.value : '';
    const logX = !!(logXAxisInput && logXAxisInput.checked);
    const logY = !!(logYAxisInput && logYAxisInput.checked);
    const xRangeSignature = `${xMode}|${xMode === 'custom' ? (customXCol || '') : ''}|${logX}`;
    if (mainPlotXRangeSignature !== xRangeSignature) {
      mainPlotXRangeSignature = xRangeSignature;
      mainPlotXRange = null;
    }
    const plotByLap = true;
    const selectedLaps = getSelectedLaps();
    const checkedColorMode = document.querySelector('input[name=colorMode]:checked');
    const colorMode = checkedColorMode ? checkedColorMode.value : 'channel'; // 'lap' | 'channel' | 'axis'
    syncSelectedChannelColors(ycols);
    const channelColors = new Map(ycols.map((y) => [y, getChannelColor(y)]));
    const mainXTitle = getXAxisTitle(xMode, customXCol);

    const colorAxisEnabled = colorMode === 'axis';
    const colorAxisChannel = colorAxisEnabled && colorAxisSelect ? colorAxisSelect.value : '';
    const colorAxisContext = colorAxisChannel ? computeColorAxisContext(selFiles, selectedLaps, colorAxisChannel) : null;
    renderColorAxisLegend(colorAxisChannel, colorAxisContext);
    let colorAxisScaleShown = false;

    const enabledDataFilters = getEnabledDataFilters();

    const binnedPlotEnabled = !!(binnedPlotEnabledInput && binnedPlotEnabledInput.checked);
    const binnedPlotAxis = binnedPlotAxisSelect ? binnedPlotAxisSelect.value : '';
    const binnedPlotBinWidth = binnedPlotBinWidthInput ? parseFloat(binnedPlotBinWidthInput.value) : NaN;

    const tsBuilt = buildTimeSlipTraces(selFiles, selectedLaps, xMode);
    const tsPreview = tsBuilt.traces;
    const includeTimeSlip = tsPreview.length > 0;
    lastIncludeTimeSlipForResize = includeTimeSlip;

    const activeTempPlots = getActiveTempProfilePlots(xMode);
    if (tempProfileHiddenHint) tempProfileHiddenHint.hidden = !(tempProfilePlots.length > 0 && xMode === 'custom');

    const cornersEnabled = !!(showCornersInput && showCornersInput.checked);
    let cornerData = null;
    let cornerRef = null;
    let cornerVenueKeyForRender = '';
    if (cornersEnabled && xMode === 'distance') {
      const resolved = resolveCornerDataForRender(selFiles, selectedLaps);
      cornerData = resolved.cornerData;
      cornerRef = resolved.cornerRef;
      cornerVenueKeyForRender = resolved.cornerVenueKeyForRender;
    }
    // The editor is bound to one venue at a time; close it if the selection no longer
    // resolves to that venue (different file/lap picked, corners toggled off, or X axis
    // switched away from Distance) so it never shows stale segments against a mismatched
    // track. Safe to call mid-render: cornerData above is already resolved correctly.
    if (cornerEditMode && cornerVenueKeyForRender !== cornerEditorVenueKey) {
      closeCornerEditor();
    }
    const showCornerStrip = !!(cornerData && cornerData.segments.length > 0);
    activeCornerDataForFitting = cornerData;
    activeCornerReferenceForFitting = cornerRef;

    const built = buildLayout(mainXTitle, ycols, includeTimeSlip, showCornerStrip, logX, logY, activeTempPlots);
    const layout = built.layout;
    const channelToRef = built.channelToRef;
    let traces = [];

    if (Array.isArray(mainPlotXRange) && mainPlotXRange.length === 2
      && Number.isFinite(mainPlotXRange[0]) && Number.isFinite(mainPlotXRange[1])) {
      layout.xaxis.range = mainPlotXRange.slice();
      layout.xaxis.autorange = false;
    }

    // Always on, regardless of the user's tooltip-visibility toggle -- see
    // setHoverTooltipVisible for why hovermode itself can never be false here.
    layout.hovermode = 'x';
    layout.hoverlabel = { namelength: -1 };
    layout.hoverdistance = 40;

    if (showCornerStrip) {
      const shadeOpacityPct = cornerShadeOpacityInput ? Number(cornerShadeOpacityInput.value) : 10;
      const cornerVis = buildCornerShapesAndAnnotations(cornerData, built.mainDomainTop, shadeOpacityPct);
      baseCornerShapesForOverlay = cornerVis.shapes;
      baseCornerAnnotationsForOverlay = cornerVis.annotations;
      activeCornerHeadingSegments = cornerVis.clickTargets;

      const cornerTotals = computeCornerTotals(cornerData);
      const cornerVenue = getLogVenue(cornerRef.log);
      saveCornerMetadataForVenue(cornerVenue, cornerData, cornerTotals);
      if (cornerTrackInfoDiv) cornerTrackInfoDiv.textContent = formatCornerSummary(cornerVenue, cornerData, cornerTotals);
    } else {
      baseCornerShapesForOverlay = [];
      baseCornerAnnotationsForOverlay = [];
      activeCornerHeadingSegments = [];
      if (cornerTrackInfoDiv) cornerTrackInfoDiv.textContent = '';
    }
    // Pinned-note markers ("Pin on Graph" -- see setNotePickMode/handlePlotNotePickClick).
    // Rendered as annotations just above the plot area rather than on any data trace, so
    // a marker never depends on -- and is never hidden by -- which Y channels happen to
    // be selected right now. Still scoped to: its file being currently loaded, its lap
    // (if any) being selected, and having a known position for the CURRENT x-axis mode --
    // time_value/distance_value (captured alongside x at pin time, see
    // handlePlotNotePickClick) cover a straight Time<->Distance switch; a 'custom'
    // channel axis only matches a note pinned on that exact same channel.
    notePinAnnotationsForOverlay = plotNotesRaw.map((entry) => {
      const loc = entry.note.location;
      let positionX;
      if (xMode === 'time') {
        positionX = Number.isFinite(loc.time_value) ? loc.time_value
          : (entry.x_axis === 'time' ? entry.x : undefined);
      } else if (xMode === 'distance') {
        positionX = Number.isFinite(loc.distance_value) ? loc.distance_value
          : (entry.x_axis === 'distance' ? entry.x : undefined);
      } else if (xMode === 'custom' && entry.x_axis === 'custom' && entry.x_channel === customXCol) {
        positionX = entry.x;
      }
      return { entry, positionX };
    }).filter(({ entry, positionX }) => {
      if (!Number.isFinite(positionX)) return false;
      const matchingLog = selFiles.find((l) => l.name === entry.fileName);
      if (!matchingLog) return false;
      if (entry.lap != null && !isLapSelected(selectedLaps, matchingLog.id, entry.lap)) return false;
      return true;
    }).map(({ entry, positionX }) => ({
      x: positionX, xref: 'x',
      y: built.mainDomainTop, yref: 'paper', yanchor: 'bottom',
      // A plain glyph in the theme's own accent colour rather than a colour emoji, so
      // this reads as part of the app rather than a generic sticker (see also
      // .note-map-marker-icon, the equivalent marker on the track map).
      text: '▼',
      showarrow: false,
      captureevents: true,
      hovertext: noteHoverPreview(entry.note),
      font: { size: 13, color: getNoteMarkerAccentColor() },
      // Not a native Plotly field -- plotly_clickannotation's handler (see
      // bindMainPlotHoverSync) reads this straight off plotDiv.layout.annotations[index]
      // to know which note a click landed on.
      _noteId: entry.note.id
    }));

    layout.shapes = baseCornerShapesForOverlay.concat(selectionFitShapes);
    layout.annotations = baseCornerAnnotationsForOverlay
      .concat(selectionFitBoxesVisible ? selectionFitAnnotations : [])
      .concat(notePinAnnotationsForOverlay);
    mainPlotXAxisTitle = mainXTitle;
    mainPlotXAxisUnit = getXAxisUnit(xMode, customXCol);
    // Plotly.react takes a fresh layout object each call; without this, any re-render
    // while the select tool is active (e.g. toggling a lap) would silently drop back to
    // the default 'zoom' dragmode.
    if (selectModeActive) layout.dragmode = 'select';

    if (plotDiv && Number.isFinite(layout.height)) {
      plotDiv.style.height = `${layout.height}px`;
    }

    maybeAutoFitOffsets(selFiles, selectedLaps);
    applyOffsetsToDerivedMapXY(getMapOffsets());

    if (includeTimeSlip && layout.yaxis2) {
      const baselineMax = Number.isFinite(tsBuilt.nonCrashMaxDelta) ? tsBuilt.nonCrashMaxDelta : tsBuilt.allMaxDelta;
      const baselineMin = Number.isFinite(tsBuilt.nonCrashMinDelta) ? tsBuilt.nonCrashMinDelta : tsBuilt.allMinDelta;
      if (Number.isFinite(baselineMax) && Number.isFinite(baselineMin)) {
        const paddedMax = Math.max(0.05, baselineMax * 1.1);
        const paddedMin = Math.min(-0.05, baselineMin * 1.1);
        layout.yaxis2.range = [paddedMin, paddedMax];
      }
    }

    // optionally compute shading envelope when plotting by lap
    const shadeLaps = document.getElementById('shadeLaps') && document.getElementById('shadeLaps').checked;

    selFiles.forEach((log, li) => {
      const fileColor = COLORS[li % COLORS.length];
      const colorAxisResolvedCol = colorAxisContext ? resolveChannelForLog(colorAxisChannel, log) : '';
      const canColorByChannel = !!(colorAxisResolvedCol && log.cols.includes(colorAxisResolvedCol));
      const activeDataFilters = resolveDataFiltersForLog(log, enabledDataFilters);
      // plot each selected lap separately, x axis is Lap Time or Lap Distance
      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      lapNums.forEach((lap) => {
        const isPreviewOnly = !!(hoverPreviewLap && hoverPreviewLap.fileId === log.id && hoverPreviewLap.lap === lap
          && !isLapSelected(selectedLaps, log.id, lap));
        if (!isLapSelected(selectedLaps, log.id, lap) && !isPreviewOnly) return;
        let maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
        maskIdx = applyRowFiltersToMask(log, maskIdx, activeDataFilters);
        if (canColorByChannel && colorAxisContext.kind === 'discrete') {
          const hiddenSet = colorAxisHiddenCategoriesByChannel.get(colorAxisChannel);
          if (hiddenSet && hiddenSet.size > 0) {
            // Points with no reading for the color channel stay visible -- there's no
            // category to have clicked off in the legend in the first place.
            maskIdx = maskIdx.filter((i) => {
              const raw = log.data[i][colorAxisResolvedCol];
              if (raw === null || raw === undefined || raw === '') return true;
              return !hiddenSet.has(normalizeColorAxisCategory(colorAxisContext, raw));
            });
          }
        }
        const xArr = getXSeriesForMode(log, maskIdx, xMode, customXCol);
        if (!xArr) return;
        const colorRawArr = canColorByChannel ? maskIdx.map(i => log.data[i][colorAxisResolvedCol]) : null;
        ycols.forEach(y => {
          const resolvedCol = resolveChannelForLog(y, log);
          if (!resolvedCol || !log.cols.includes(resolvedCol)) return; // channel not in this file
          const yArr = maskIdx.map(i => log.data[i][resolvedCol]);
          const keyArr = maskIdx.map(i => rowKey(log.id, lap, i));
          const traceColor = colorMode === 'lap' ? getLapColor(log.id, lap) : (channelColors.get(y) || fileColor);
          const dash = isPreviewOnly ? 'dot' : getLineDashForFileIndex(li);
          const trace = {
            x: xArr,
            y: yArr,
            customdata: keyArr,
            yaxis: channelToRef.get(y) || 'y',
            name: `${log.name} — Lap ${lap} — ${y}${isPreviewOnly ? ' (preview)' : ''}`,
            mode: traceMode,
            marker:{color: traceColor},
            line:{color: traceColor, dash},
            hovertemplate: buildHoverTemplate(mainXTitle, getChannelLabel(y)),
            // Consumed by the box/lasso selection stats panel to label + color each
            // fit line; overlay traces (shading, race-line curvature, etc.) intentionally
            // don't set this so they're excluded from selection fitting -- a hover preview
            // is exactly that kind of transient overlay, so it's excluded too.
            meta: isPreviewOnly ? undefined : {channel: y, color: traceColor}
          };
          if (isPreviewOnly) trace.opacity = 0.55;
          if (colorRawArr) {
            applyColorAxisToTrace(trace, colorRawArr, colorAxisContext, colorAxisChannel, !colorAxisScaleShown);
            trace.hovertemplate = buildHoverTemplate(mainXTitle, getChannelLabel(y), getChannelLabel(colorAxisChannel));
            if (colorAxisContext.kind === 'continuous') colorAxisScaleShown = true;
          }
          traces.push(trace);
        });
      });
    });

    // Temperature profile plots: one heatmap trace per active plot per contributing
    // (log, lap) -- X = the selected time/distance axis, Y = the plot's channels (in the
    // configured order), color = each sample's value. See getActiveTempProfilePlots for the
    // Time/Distance-only gating and built.tempAxisMap (from buildLayout) for the xaxis/yaxis
    // pair + domain each plot was assigned.
    activeTempPlots.forEach((p) => {
      const axisInfo = built.tempAxisMap.get(p.id);
      if (!axisInfo) return;
      const colorConfig = getEffectiveTempProfileColorConfig(p);
      const colorscale = buildTempProfileColorscale(colorConfig.colormap, colorConfig.aboveColor, colorConfig.belowColor);

      // Gather every contributing (log, lap) first so the equal fixed multi-lap opacity
      // (TEMP_PROFILE_MULTI_LAP_OPACITY) can be decided before building trace objects.
      const contributors = [];
      selFiles.forEach((log) => {
        const activeDataFilters = resolveDataFiltersForLog(log, enabledDataFilters);
        const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
        lapNums.forEach((lap) => {
          if (!isLapSelected(selectedLaps, log.id, lap)) return;
          let maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
          maskIdx = applyRowFiltersToMask(log, maskIdx, activeDataFilters);
          const xArr = getXSeriesForMode(log, maskIdx, xMode, customXCol);
          if (!xArr || xArr.length === 0) return;
          contributors.push({log, lap, maskIdx, xArr});
        });
      });

      const opacity = contributors.length > 1 ? TEMP_PROFILE_MULTI_LAP_OPACITY : 1;
      let scaleShown = false;
      contributors.forEach(({log, lap, maskIdx, xArr}) => {
        // A channel absent from this particular log becomes an all-null row -- keeps the
        // row/category alignment intact without breaking on partial sensor coverage across
        // files (e.g. a file missing one of the configured sensors).
        const z = p.channels.map((ch) => {
          const resolvedCol = resolveChannelForLog(ch, log);
          if (!resolvedCol || !log.cols.includes(resolvedCol)) return maskIdx.map(() => null);
          return maskIdx.map((i) => {
            const v = Number(log.data[i][resolvedCol]);
            return Number.isFinite(v) ? v : null;
          });
        });
        const trace = {
          type: 'heatmap',
          x: xArr,
          y: p.channels,
          z,
          xaxis: axisInfo.xaxis,
          yaxis: axisInfo.yaxis,
          zmin: colorConfig.min,
          zmax: colorConfig.max,
          zauto: false,
          colorscale,
          opacity,
          name: `${log.name} — Lap ${lap} — ${p.name}`,
          // No "%{y}: " channel-name prefix -- that's redundant with the row's own Y-axis
          // position/label right next to it.
          hovertemplate: `${mainXTitle}: %{x}<br>Value: %{z}<extra>${p.name}</extra>`,
          showscale: !scaleShown,
          // No title -- redundant with the plot's own Y-axis title at this same vertical
          // position (and on mobile, a colorbar title measurably widens the colorbar,
          // squeezing the actual plot area on a narrow screen).
          colorbar: !scaleShown ? {
            y: (axisInfo.domain[0] + axisInfo.domain[1]) / 2,
            len: Math.max(0.05, axisInfo.domain[1] - axisInfo.domain[0]),
            yanchor: 'middle',
            thickness: 12
          } : undefined
        };
        scaleShown = true;
        traces.push(trace);
      });
    });

    if (binnedPlotEnabled && Number.isFinite(binnedPlotBinWidth) && binnedPlotBinWidth > 0) {
      traces.push(...computeBinnedOverlayTraces(selFiles, selectedLaps, ycols, binnedPlotAxis, binnedPlotBinWidth, channelToRef));
    }

    // If shading is requested, compute an envelope per Y channel spanning every lap of each
    // currently-selected file (excluding in/out laps), regardless of which laps are
    // currently checked/plotted -- it's meant to show the full range the rider has been
    // performing in, so the currently-displayed laps can be compared against it, not just
    // an envelope of themselves.
    if (shadeLaps && ycols.length>0) {
      // for each y channel compute global union x grid across all selected files' laps
      ycols.forEach(y => {
        const allLapSeries = [];
        selFiles.forEach((log, li) => {
          const activeDataFilters = resolveDataFiltersForLog(log, enabledDataFilters);
          const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
          const inOutLapNums = getInOutLapNumbers(lapNums);
          lapNums.forEach(lap => {
            if (inOutLapNums.has(lap)) return;
            let maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
            maskIdx = applyRowFiltersToMask(log, maskIdx, activeDataFilters);
            const resolvedCol = resolveChannelForLog(y, log);
            if (!resolvedCol || !log.cols.includes(resolvedCol)) return;
            const xArr = getXSeriesForMode(log, maskIdx, xMode, customXCol);
            if (!xArr) return;
            const yArr = maskIdx.map(i => log.data[i][resolvedCol]);
            if (xArr.length > 0) allLapSeries.push(buildSortedNumericSeries(xArr, yArr));
          });
        });
        if (allLapSeries.length === 0) return;
        // build union x grid
        const xSet = new Set();
        allLapSeries.forEach(s => s.x.forEach(v=> xSet.add(v)));
        const grid = Array.from(xSet).sort((a,b)=>a-b);
        // compute min/max per grid point using interpolation
        const minY = []; const maxY = [];
        for (const gx of grid) {
          const vals = allLapSeries.map(s => interpAt(s.x, s.y, gx)).filter(v => v != null && !isNaN(v));
          if (vals.length === 0) { minY.push(null); maxY.push(null); continue; }
          const mn = Math.min(...vals); const mx = Math.max(...vals);
          minY.push(mn); maxY.push(mx);
        }
        // create filled traces: place min first, then max with fill='tonexty' to fill between
        const shadeColor = 'rgba(100,100,100,0.2)';
        const axisRef = channelToRef.get(y) || 'y';
        const minTrace = {x: grid, y: minY, yaxis: axisRef, name: `Min ${y}`, mode: 'lines', line:{color: shadeColor, width:0}, fill:'none', showlegend:false, hoverinfo:'skip'};
        const maxTrace = {x: grid, y: maxY, yaxis: axisRef, name: `Max ${y}`, mode: 'lines', line:{color: shadeColor, width:0}, fill:'tonexty', fillcolor: shadeColor, showlegend:false, hoverinfo:'skip'};
        // put shading below all other traces
        traces = [minTrace, maxTrace].concat(traces);
      });
    }

    applyLogAxisRanges(layout, traces, tsPreview, logX, logY);

    currentTsTraces = tsPreview.slice();
    // uirevision controls when Plotly.react resets the user's zoom/pan.
    // Keyed on axis config + loaded files, but NOT lap selection — so toggling
    // a lap keeps the current view instead of resetting it.
    layout.uirevision = [
      xMode,
      customXCol || '',
      [...ycols].sort().join('\x00'),
      selFiles.map(f => f.id).sort().join('\x00'),
      String(includeTimeSlip)
    ].join('|');
    layout.template = getPlotlyThemeTemplate();
    const plotReactDone = Plotly.react(plotDiv, traces.concat(tsPreview), layout, plotlyConfig);
    setHoverTooltipVisible(plotDiv, hoverEnabled);
    bindMainPlotHoverSync();
    bindMainPlotRelayoutSync();
    bindMainPlotSelectionSync();
    bindCornerStripZoom();
    positionTempProfileResizeHandle(built.tempBlockDomain, activeTempPlots.length > 0);
    positionTimeSlipResizeHandle(built.timeSlipDomain, includeTimeSlip);
    // Plotly.react rebuilds trace objects from scratch (mode:'lines'), so re-apply the
    // invisible selection markers if the select/lasso tool was already active.
    if (selectModeActive) setSelectableMarkersEnabled(true);
    // Carries a box/lasso selection across this replot (see captureCurrentTraceSelection
    // above) -- deferred until the redraw has actually settled, since Plotly's own
    // "deselect" (fired by the data change react() just did) needs suppressSelectionReentry
    // held through that window or it'll race this and clear right back out.
    if (preservedSelection) {
      plotReactDone.then(() => {
        suppressSelectionReentry = false;
        reapplyCapturedSelection(preservedSelection);
      });
    }

    const hasLeafletData = hasRenderableLeafletMapData(selFiles, selectedLaps);
    const hasXYData = hasRenderableXYMapData(selFiles, selectedLaps);
    const hasAnyMapData = hasLeafletData || hasXYData;
    syncShowMapDefault(hasAnyMapData);
    const showMap = !showMapInput || showMapInput.checked;
    const showingMapColumn = showMap && hasAnyMapData;
    applyMapColumnLayout(showingMapColumn);
    // Plotly's own responsive:true resize-detection doesn't reliably catch a container
    // width change caused by *our* grid-column edit above -- most visibly the very first
    // time the map appears (Plotly.react already drew the plot at the old, full width a
    // few lines up, before we knew whether the map column would be reserved), leaving
    // the map visually overlapping the plot until something else happens to trigger a
    // resize. Explicitly resizing whenever this column's shown/hidden state changes
    // closes that gap.
    if (showingMapColumn !== lastAppliedShowMapColumn) {
      lastAppliedShowMapColumn = showingMapColumn;
      scheduleVisualizationResize();
    }

    if (showMap && hasLeafletData) {
      setMapDisplayMode('leaflet');
      clearXYMapPlot();
      updateLeafletMap(selFiles, selectedLaps, 'geo');
    } else if (showMap && hasXYData) {
      setMapDisplayMode('leaflet');
      clearXYMapPlot();
      updateLeafletMap(selFiles, selectedLaps, 'xy');
    } else {
      setMapDisplayMode('none');
      clearXYMapPlot();
      clearLeafletMapPlot();
    }
  }

  // event handlers
  fileInput.addEventListener('change', (ev)=>{
    const files = Array.from(ev.target.files || []);
    const wasEmpty = logs.length === 0;
    files.forEach(f => parseFile(f));
    fileInput.value = '';
    if (files.length > 0 && wasEmpty && window.innerWidth <= 980) setControlsOpen(false);
  });

  // replot when X axis mode changes
  const xRadios = document.querySelectorAll('input[name=xaxis]');
  xRadios.forEach(r=> r.addEventListener('change', ()=> {
    if (xCustomSelect) xCustomSelect.disabled = (r.value !== 'custom' || !r.checked);
    updatePlot();
  }));
  if (logXAxisInput) logXAxisInput.addEventListener('change', ()=> updatePlot());
  if (logYAxisInput) logYAxisInput.addEventListener('change', ()=> updatePlot());
  const shadeBox = document.getElementById('shadeLaps');
  if (shadeBox) {
    try {
      const savedShadeLaps = JSON.parse(localStorage.getItem(SHADE_LAPS_STORAGE_KEY) || 'null');
      if (typeof savedShadeLaps === 'boolean') shadeBox.checked = savedShadeLaps;
    } catch {}
    shadeBox.addEventListener('change', () => { saveShadeLapsEnabled(); updatePlot(); });
  }
  if (showCornersInput) showCornersInput.addEventListener('change', ()=> updatePlot());
  if (cornerShadeOpacityInput) cornerShadeOpacityInput.addEventListener('input', ()=> updatePlot());
  if (cornerSwapLRInput) cornerSwapLRInput.addEventListener('change', ()=> updatePlot());
  if (cornerEditToggleBtn) {
    cornerEditToggleBtn.addEventListener('click', () => {
      if (cornerEditMode) {
        closeCornerEditor();
        updatePlot();
      } else {
        openCornerEditor();
      }
    });
  }
  if (cornerEditorMergeStraightBtn) cornerEditorMergeStraightBtn.addEventListener('click', () => mergeCornerEditorSelected('straight'));
  if (cornerEditorMergeLeftBtn) cornerEditorMergeLeftBtn.addEventListener('click', () => mergeCornerEditorSelected('left'));
  if (cornerEditorMergeRightBtn) cornerEditorMergeRightBtn.addEventListener('click', () => mergeCornerEditorSelected('right'));
  if (cornerEditorResetBtn) cornerEditorResetBtn.addEventListener('click', () => resetCornerEditorToAutoDetected());
  if (vehicleSimulateBtn) {
    vehicleSimulateBtn.addEventListener('click', (event) => {
      // The button lives inside a <summary>; without this the click would also toggle
      // the <details> open/closed via the browser's default disclosure behavior.
      event.preventDefault();
      simulateVehicle(false);
    });
  }
  // Toggling the elevation effect re-fits and re-simulates in place, rather than
  // requiring the user to hit "Simulate Vehicle" again to see the effect of the change.
  if (vehicleSimUseElevationInput) {
    vehicleSimUseElevationInput.addEventListener('change', () => {
      if (logs.some(l => l.meta && l.meta.racingLine)) simulateVehicle(true);
    });
  }

  // Vehicle / rider pickers: choosing one sources mass, CdA, average power and grip
  // limits from it (see computeEffectiveSimParams); the ✎ and + buttons open the very
  // same editor popovers the Sessions panel uses.
  setSimClass(loadSimSelection().vehicleClass);
  vehicleSimClassRadios.forEach((r) => r.addEventListener('change', () => { saveSimSelection(); updateSimSelectionState(); }));
  if (vehicleSimInfoBtn) vehicleSimInfoBtn.addEventListener('click', openSimInfoModal);
  if (vehicleSimLoggedBtn) vehicleSimLoggedBtn.addEventListener('click', simulateRpmGearForLoggedData);
  if (vehicleSimVehicleSelect) {
    vehicleSimVehicleSelect.addEventListener('change', () => {
      // A car or motorcycle picks its own class (kart/other leave the current choice).
      const picked = selectedSimVehicle();
      if (picked && (picked.type === 'car' || picked.type === 'motorcycle')) setSimClass(picked.type);
      saveSimSelection();
      updateSimSelectionState();
    });
  }
  if (vehicleSimRiderSelect) {
    vehicleSimRiderSelect.addEventListener('change', () => { saveSimSelection(); updateSimSelectionState(); });
  }
  if (vehicleSimPowerModelSelect) {
    vehicleSimPowerModelSelect.addEventListener('change', () => updateSimSelectionState());
  }
  const openSimVehicleEditor = (existing) => {
    if (!window.SessionsUI) return;
    window.SessionsUI.openVehicleEditor(
      (saved) => refreshVehicleSimLists({ vehicleId: saved && saved.id }),
      existing || undefined
    );
  };
  const openSimRiderEditor = (existing) => {
    if (!window.SessionsUI) return;
    window.SessionsUI.openRiderEditor(
      (saved) => refreshVehicleSimLists({ riderId: saved && saved.id }),
      existing || undefined
    );
  };
  if (vehicleSimVehicleNewBtn) vehicleSimVehicleNewBtn.addEventListener('click', () => openSimVehicleEditor(null));
  if (vehicleSimVehicleEditBtn) vehicleSimVehicleEditBtn.addEventListener('click', () => openSimVehicleEditor(selectedSimVehicle()));
  if (vehicleSimRiderNewBtn) vehicleSimRiderNewBtn.addEventListener('click', () => openSimRiderEditor(null));
  if (vehicleSimRiderEditBtn) vehicleSimRiderEditBtn.addEventListener('click', () => openSimRiderEditor(selectedSimRider()));
  if (mapXOffsetInput) mapXOffsetInput.addEventListener('input', ()=> {
    if (!isApplyingAutoOffset) mapOffsetManuallyAdjusted = true;
    updatePlot();
  });
  if (mapYOffsetInput) mapYOffsetInput.addEventListener('input', ()=> {
    if (!isApplyingAutoOffset) mapOffsetManuallyAdjusted = true;
    updatePlot();
  });
  if (mapCenterLatInput) mapCenterLatInput.addEventListener('input', ()=> {
    if (!isApplyingAutoCenter) mapCenterManuallyAdjusted = true;
    updatePlot();
  });
  if (mapCenterLonInput) mapCenterLonInput.addEventListener('input', ()=> {
    if (!isApplyingAutoCenter) mapCenterManuallyAdjusted = true;
    updatePlot();
  });
  if (mapFitBtn) mapFitBtn.addEventListener('click', () => runManualFit());
  if (showMapInput) {
    showMapInput.addEventListener('change', () => {
      showMapManuallyToggled = true;
      updatePlot();
      scheduleVisualizationResize();
    });
  }
  if (xCustomSelect) xCustomSelect.addEventListener('change', ()=> updatePlot());
  enhanceSelectWithSearch(xCustomSelect);
  enhanceSelectWithSearch(mapColorSelect);
  enhanceSelectWithSearch(colorAxisSelect);
  if (mapColorEnabledInput) {
    mapColorEnabledInput.addEventListener('change', () => {
      if (mapColorSelect) mapColorSelect.disabled = !mapColorEnabledInput.checked;
      if (mapColorModeSelect) mapColorModeSelect.disabled = !mapColorEnabledInput.checked;
      updatePlot();
    });
  }
  if (mapColorSelect) mapColorSelect.addEventListener('change', ()=> updatePlot());
  if (mapDrawModeSelect) mapDrawModeSelect.addEventListener('change', ()=> updatePlot());
  if (mapColorModeSelect) mapColorModeSelect.addEventListener('change', ()=> updatePlot());
  document.querySelectorAll('input[name=colorMode]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (colorAxisSelect) colorAxisSelect.disabled = radio.value !== 'axis';
      updatePlot();
    });
  });
  if (colorAxisSelect) colorAxisSelect.addEventListener('change', ()=> updatePlot());
  if (colorAxisLegendDiv) {
    colorAxisLegendDiv.addEventListener('click', (ev) => {
      const btn = ev.target instanceof Element ? ev.target.closest('[data-color-axis-category]') : null;
      if (!btn) return;
      const channel = colorAxisLegendDiv.dataset.channel || '';
      if (!channel) return;
      const isNumeric = btn.getAttribute('data-color-axis-numeric') === '1';
      const raw = btn.getAttribute('data-color-axis-category');
      const category = isNumeric ? Number(raw) : raw;
      toggleColorAxisCategoryHidden(channel, category);
      updatePlot();
    });
  }
  if (binnedPlotEnabledInput) {
    binnedPlotEnabledInput.addEventListener('change', () => {
      const enabled = binnedPlotEnabledInput.checked;
      if (binnedPlotAxisSelect) {
        binnedPlotAxisSelect.disabled = !enabled;
        if (enabled) populateAxisChannelSelect(binnedPlotAxisSelect);
      }
      if (binnedPlotBinWidthInput) binnedPlotBinWidthInput.disabled = !enabled;
      updatePlot();
    });
  }
  if (binnedPlotAxisSelect) binnedPlotAxisSelect.addEventListener('change', () => updatePlot());
  if (binnedPlotBinWidthInput) binnedPlotBinWidthInput.addEventListener('input', () => updatePlot());
  ySelect.addEventListener('change', ()=> {
    renderSelectedChannelColorControls();
    updatePlot();
  });

  const enforcePlotTypeSelection = (changedInput) => {
    if (!plotTypeLinesInput || !plotTypeMarkersInput) return;
    if (plotTypeLinesInput.checked || plotTypeMarkersInput.checked) return;
    changedInput.checked = true;
  };

  if (plotTypeLinesInput) {
    plotTypeLinesInput.addEventListener('change', () => {
      enforcePlotTypeSelection(plotTypeLinesInput);
      updatePlot();
    });
  }
  if (plotTypeMarkersInput) {
    plotTypeMarkersInput.addEventListener('change', () => {
      enforcePlotTypeSelection(plotTypeMarkersInput);
      updatePlot();
    });
  }
  if (ySelectSearch) {
    // Rebuilding via populateYSelect() (rather than filtering in place) reuses its existing
    // "preserve current selection" logic, so already-picked channels stay selected even
    // when the search term would otherwise filter their <option> out of the list.
    ySelectSearch.addEventListener('input', () => populateYSelect());
  }
  if (selectedYColors) {
    selectedYColors.addEventListener('click', (ev) => {
      const target = ev.target instanceof Element ? ev.target : null;
      if (!target) return;

      const editBtn = target.closest('button[data-quick-mod-edit]');
      if (editBtn) {
        const channel = editBtn.getAttribute('data-quick-mod-edit');
        const selectedChannels = getSelectedY();
        if (!channel || !selectedChannels.includes(channel)) return;

        if (quickModState.channel !== channel) {
          clearQuickModSelectionState();
          quickModState.channel = channel;
          quickModEditorOpen = true;
        } else {
          quickModEditorOpen = !quickModEditorOpen;
        }

        renderSelectedChannelColorControls();
        updatePlot();
        return;
      }

      const visibilityBtn = target.closest('button[data-quick-mod-visibility]');
      if (visibilityBtn) {
        const channel = visibilityBtn.getAttribute('data-quick-mod-visibility');
        const selectedChannels = getSelectedY();
        if (!channel || !selectedChannels.includes(channel)) return;
        if (!(quickModState.channel === channel && quickModPreviewName && hasQuickModActive())) return;

        quickModOriginalVisible = !quickModOriginalVisible;
        renderSelectedChannelColorControls();
        updatePlot();
      }
    });

    selectedYColors.addEventListener('input', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'color') return;
      const channel = target.getAttribute('data-channel');
      if (!channel) return;
      const color = normalizeHexColor(target.value);
      channelColorOverrides.set(channel, color);
      const label = target.parentElement && target.parentElement.querySelector('span');
      if (label) label.style.color = color;
      updatePlot();
    });

    selectedYColors.addEventListener('change', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'radio') return;
      const channel = target.getAttribute('data-axis-picker');
      if (!channel) return;
      const value = target.value;
      if (value === 'auto') {
        manualAxisOverrides.delete(channel);
      } else if (value === 'own') {
        manualAxisOverrides.set(channel, { type: 'own' });
      } else if (value.startsWith('peer:')) {
        manualAxisOverrides.set(channel, { type: 'peer', channel: value.slice('peer:'.length) });
      } else {
        return;
      }
      renderSelectedChannelColorControls();
      updatePlot();
    });
  }

  filesList.addEventListener('click', (ev)=>{
    if (ev.target.matches('button[data-importer-customize]')) {
      const id = ev.target.getAttribute('data-importer-customize');
      if (!id) return;
      openImporterEditor(id);
      return;
    }

    if (ev.target.matches('button[data-remove]')) {
      const id = ev.target.getAttribute('data-remove');
      const idx = logs.findIndex(l=>l.id===id);
      if (idx>=0) {
        if (startFinishEditLogId === id) cancelStartFinishLineEdit();
        logs.splice(idx,1);
        mapOffsetManuallyAdjusted = false;
        lastAutoOffsetSignature = '';
        lastTrackDefaultSignature = '';
        renderFilesList();
        populateYSelect();
        populateXCustomSelect();
        populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
        renderLapsList();
        Plotly.purge(plotDiv);
        clearXYMapPlot();
        clearLeafletMapPlot();
      }
    }

    if (ev.target.matches('button[data-decoder-edit]')) {
      const id = ev.target.getAttribute('data-decoder-edit');
      const fileItem = ev.target.closest('.file-item');
      if (!fileItem) return;
      const selector = fileItem.querySelector('.file-decoder-selector');
      const badge = fileItem.querySelector('.file-decoder-badge');
      if (selector) selector.hidden = false;
      if (badge) badge.hidden = true;
      ev.target.hidden = true;
    }

    if (ev.target.matches('button[data-decoder-cancel]')) {
      const fileItem = ev.target.closest('.file-item');
      if (!fileItem) return;
      const selector = fileItem.querySelector('.file-decoder-selector');
      const badge = fileItem.querySelector('.file-decoder-badge');
      const editBtn = fileItem.querySelector('button[data-decoder-edit]');
      if (selector) selector.hidden = true;
      if (badge) badge.hidden = false;
      if (editBtn) editBtn.hidden = false;
    }

    if (ev.target.matches('button[data-decoder-confirm]')) {
      const id = ev.target.getAttribute('data-decoder-confirm');
      const fileItem = ev.target.closest('.file-item');
      if (!fileItem) return;
      const select = fileItem.querySelector('.file-decoder-select, #file-decoder-select');
      const decoderName = select ? select.value : null;
      if (!decoderName) return;
      handleDecoderSelectionChange(select, id, decoderName);
      renderFilesList();
    }

    if (ev.target.matches('button[data-startfinish-edit]')) {
      const id = ev.target.getAttribute('data-startfinish-edit');
      if (startFinishEditLogId === id) {
        cancelStartFinishLineEdit();
        renderFilesList();
        return;
      }
      const log = logs.find(l => l.id === id);
      startStartFinishLineEdit(log);
    }

    if (ev.target.matches('button[data-startfinish-clear]')) {
      const id = ev.target.getAttribute('data-startfinish-clear');
      const log = logs.find(l => l.id === id);
      handleClearStartFinishLine(log);
    }

    if (ev.target.matches('button[data-startfinish-apply]')) {
      applyStartFinishLineEdit();
    }

    if (ev.target.matches('button[data-startfinish-cancel]')) {
      cancelStartFinishLineEdit();
      renderFilesList();
    }
  });

  if (importerEditorRows) {
    importerEditorRows.addEventListener('change', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.matches('select[data-importer-channel]')) {
        const standard = target.getAttribute('data-importer-channel');
        if (!standard) return;
        importerEditorState.channels[standard] = target.value || '';
        if (standard === 'Time') updateImporterEditorFrequencyInfo();
        return;
      }

      if (target.matches('input[data-importer-filter-enabled]')) {
        const standard = target.getAttribute('data-importer-filter-enabled');
        if (!standard) return;
        if (!importerEditorState.filters[standard]) importerEditorState.filters[standard] = { enabled: false, axis: 'time', window: 0.5 };
        importerEditorState.filters[standard].enabled = !!target.checked;
        const row = target.closest('tr');
        const axisSelect = row ? row.querySelector('select[data-importer-filter-axis]') : null;
        const windowInput = row ? row.querySelector('input[data-importer-filter-window]') : null;
        if (axisSelect) axisSelect.disabled = !target.checked;
        if (windowInput) windowInput.disabled = !target.checked;
        return;
      }

      if (target.matches('select[data-importer-filter-axis]')) {
        const standard = target.getAttribute('data-importer-filter-axis');
        if (!standard) return;
        if (!importerEditorState.filters[standard]) importerEditorState.filters[standard] = { enabled: false, axis: 'time', window: 0.5 };
        importerEditorState.filters[standard].axis = IMPORTER_FILTER_AXES.includes(target.value) ? target.value : 'time';
      }
    });

    importerEditorRows.addEventListener('input', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches('input[data-importer-filter-window]')) return;
      const standard = target.getAttribute('data-importer-filter-window');
      if (!standard) return;
      if (!importerEditorState.filters[standard]) importerEditorState.filters[standard] = { enabled: false, axis: 'time', window: 0.5 };
      const n = Number(target.value);
      importerEditorState.filters[standard].window = Number.isFinite(n) ? n : 0;
    });
  }

  if (importerEditorDownsampleHzInput) {
    importerEditorDownsampleHzInput.addEventListener('input', () => {
      const n = Number(importerEditorDownsampleHzInput.value);
      importerEditorState.downsampleHz = Number.isFinite(n) && n > 0 ? n : null;
    });
  }

  function handleImporterHeaderModeChange() {
    if (!importerEditorState.headerOverride) return;
    importerEditorState.headerOverride.enabled = !!(importerHeaderModeManualInput && importerHeaderModeManualInput.checked);
    if (importerHeaderOverrideFields) importerHeaderOverrideFields.hidden = !importerEditorState.headerOverride.enabled;
    setImporterEditorError('');
  }
  if (importerHeaderModeAutoInput) importerHeaderModeAutoInput.addEventListener('change', handleImporterHeaderModeChange);
  if (importerHeaderModeManualInput) importerHeaderModeManualInput.addEventListener('change', handleImporterHeaderModeChange);

  // Converts a 1-based row-number input's value into a 0-based index, or null when blank
  // (only valid for the optional units-row field -- the header/data-start inputs are
  // required and simply resolve to NaN, caught by getImporterHeaderOverrideError on save).
  function importerRowInputToIndex(inputEl) {
    const raw = inputEl ? String(inputEl.value || '').trim() : '';
    if (!raw) return null;
    const n = Number(raw);
    return Number.isInteger(n) ? n - 1 : NaN;
  }

  if (importerHeaderRowInput) {
    importerHeaderRowInput.addEventListener('input', () => {
      if (!importerEditorState.headerOverride) return;
      importerEditorState.headerOverride.headerRowIndex = importerRowInputToIndex(importerHeaderRowInput);
      renderImporterRowPreview();
    });
  }
  if (importerUnitsRowInput) {
    importerUnitsRowInput.addEventListener('input', () => {
      if (!importerEditorState.headerOverride) return;
      importerEditorState.headerOverride.unitsRowIndex = importerRowInputToIndex(importerUnitsRowInput);
      renderImporterRowPreview();
    });
  }
  if (importerDataStartRowInput) {
    importerDataStartRowInput.addEventListener('input', () => {
      if (!importerEditorState.headerOverride) return;
      importerEditorState.headerOverride.dataStartRowIndex = importerRowInputToIndex(importerDataStartRowInput);
      renderImporterRowPreview();
    });
  }

  if (importerCustomStandardAddBtn) {
    importerCustomStandardAddBtn.addEventListener('click', () => {
      const result = addUserDefinedStandardChannel(
        importerCustomStandardNameInput ? importerCustomStandardNameInput.value : '',
        importerCustomStandardUnitInput ? importerCustomStandardUnitInput.value : ''
      );
      if (!result.ok) {
        setImporterEditorError(result.message || 'Could not add this standard channel.');
        return;
      }
      setImporterEditorError('');
      if (importerCustomStandardNameInput) {
        importerCustomStandardNameInput.value = '';
        importerCustomStandardNameInput.focus();
      }
      if (importerCustomStandardUnitInput) importerCustomStandardUnitInput.value = '';
    });
  }

  if (importerCustomStandardNameInput) {
    importerCustomStandardNameInput.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter') return;
      ev.preventDefault();
      if (importerCustomStandardAddBtn) importerCustomStandardAddBtn.click();
    });
  }
  if (importerCustomStandardUnitInput) {
    importerCustomStandardUnitInput.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter') return;
      ev.preventDefault();
      if (importerCustomStandardAddBtn) importerCustomStandardAddBtn.click();
    });
  }

  if (importerCustomStandardList) {
    importerCustomStandardList.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches('button[data-importer-custom-remove]')) return;
      const displayName = target.getAttribute('data-importer-custom-remove');
      if (!displayName) return;
      removeUserDefinedStandardChannel(displayName);
    });
  }

  if (importerEditorBackdrop) importerEditorBackdrop.addEventListener('click', closeImporterEditor);
  if (importerEditorCloseBtn) importerEditorCloseBtn.addEventListener('click', closeImporterEditor);
  if (importerEditorCancelBtn) importerEditorCancelBtn.addEventListener('click', closeImporterEditor);
  if (importerEditorSaveBtn) {
    importerEditorSaveBtn.addEventListener('click', () => {
      if (!importerEditorState.isOpen || !importerEditorState.logId || !importerEditorState.decoderName) return;

      const headerOverrideError = getImporterHeaderOverrideError();
      if (headerOverrideError) {
        setImporterEditorError(headerOverrideError);
        return;
      }
      const manualHeaderActive = importerEditorState.headerOverrideSupported
        && importerEditorState.headerOverride && importerEditorState.headerOverride.enabled;

      const normalized = normalizeCustomImporterConfig({
        decoder: importerEditorState.decoderName,
        channels: importerEditorState.channels,
        filters: importerEditorState.filters,
        downsampleHz: importerEditorState.downsampleHz,
        headerRowIndex: manualHeaderActive ? importerEditorState.headerOverride.headerRowIndex : null,
        unitsRowIndex: manualHeaderActive ? importerEditorState.headerOverride.unitsRowIndex : null,
        dataStartRowIndex: manualHeaderActive ? importerEditorState.headerOverride.dataStartRowIndex : null
      });
      if (!normalized) {
        setImporterEditorError('Could not save importer config.');
        return;
      }

      const hasAnyChannel = Object.values(normalized.channels).some((v) => String(v || '').trim() !== '');
      const hasDownsample = Number.isFinite(Number(normalized.downsampleHz)) && Number(normalized.downsampleHz) > 0;
      const hasManualHeader = Number.isInteger(normalized.headerRowIndex);
      const payload = (hasAnyChannel || hasDownsample || hasManualHeader) ? normalized : null;
      const ok = reprocessLogWithDecoder(importerEditorState.logId, importerEditorState.decoderName, payload);
      if (!ok) {
        setImporterEditorError('Could not reprocess this file with the custom importer settings. See console for details.');
        return;
      }

      // Persist to IndexedDB (keyed by file name) so it's reapplied automatically the
      // next time this file is loaded from browser storage -- not just for this session.
      const savedLog = logs.find((entry) => entry.id === importerEditorState.logId);
      if (savedLog) saveImporterConfigForFile(savedLog.name, importerEditorState.decoderName, payload);

      closeImporterEditor();
      renderFilesList();
    });
  }

  // update lap list when file selection changes
  filesList.addEventListener('change', (ev)=>{
    if (ev.target.matches('.file-decoder-select, #file-decoder-select')) {
      const fileItem = ev.target.closest('.file-item');
      const id = (fileItem && fileItem.dataset) ? fileItem.dataset.id : ev.target.getAttribute('data-id');
      if (!id) return;
      handleDecoderSelectionChange(ev.target, id, ev.target.value);
      return;
    }

    if (ev.target.matches('input[type=checkbox]')) {
      renderLapsList();
      updatePlot();
    }
  });

  // handle lap checkbox toggles
  const lapsList = document.getElementById('lapsList');
  if (lapsList) {
    lapsList.addEventListener('change', (ev)=>{
      if (ev.target.matches('input[type=checkbox]')) updatePlot();
    });
    lapsList.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-lap-select-all], button[data-lap-select-none]');
      if (!btn) return;
      const logId = btn.getAttribute('data-lap-select-all') || btn.getAttribute('data-lap-select-none');
      const checkAll = btn.hasAttribute('data-lap-select-all');
      const group = btn.closest('.file-lap-group');
      if (!group) return;
      group.querySelectorAll(`input[type=checkbox][data-id="${CSS.escape(logId)}"]`).forEach((cb) => {
        cb.checked = checkAll;
      });
      updatePlot();
    });
    lapsList.addEventListener('input', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'color') return;
      const fileId = target.getAttribute('data-id');
      const lap = Number(target.getAttribute('data-lap'));
      if (!fileId || !Number.isFinite(lap)) return;
      const color = normalizeHexColor(target.value);
      setLapColor(fileId, lap, color);
      const item = target.closest('.lap-item');
      const checkbox = item ? item.querySelector('input[type=checkbox]') : null;
      const label = item ? item.querySelector('.lap-label') : null;
      if (checkbox) checkbox.style.accentColor = color;
      if (label) label.style.color = color;
      updatePlot();
    });

    // Hovering a lap row previews that lap's traces on the plot, even when it isn't
    // checked, and removes them when the mouse leaves. Debounced (rather than reacting to
    // every mouseover/mouseout directly) and re-checked via the :hover pseudo-class itself
    // -- not by tracking enter/leave targets -- so scanning quickly down the list only
    // triggers one replot for wherever the pointer actually settles, instead of a replot
    // per row crossed plus a flicker when moving directly between two adjacent rows.
    const scheduleHoverPreviewUpdate = () => {
      clearTimeout(hoverPreviewTimer);
      hoverPreviewTimer = setTimeout(() => {
        const hovered = lapsList.querySelector('.lap-item:hover');
        const fileId = hovered ? hovered.getAttribute('data-id') : null;
        const lap = hovered ? Number(hovered.getAttribute('data-lap')) : NaN;
        const next = (fileId && Number.isFinite(lap)) ? { fileId, lap } : null;
        const unchanged = next === hoverPreviewLap || (next && hoverPreviewLap
          && next.fileId === hoverPreviewLap.fileId && next.lap === hoverPreviewLap.lap);
        if (unchanged) return;
        hoverPreviewLap = next;
        updatePlot();
      }, 60);
    };
    lapsList.addEventListener('mouseover', (ev) => {
      if (ev.target.closest('.lap-item')) scheduleHoverPreviewUpdate();
    });
    lapsList.addEventListener('mouseout', (ev) => {
      if (ev.target.closest('.lap-item')) scheduleHoverPreviewUpdate();
    });
  }

  if (downloadDisplayedDataBtn) {
    downloadDisplayedDataBtn.addEventListener('click', () => {
      downloadDisplayedDataCsv();
      if (binnedPlotEnabledInput && binnedPlotEnabledInput.checked) {
        downloadBinnedPlotDataCsv();
      }
    });
  }

  clearBtn.addEventListener('click', ()=>{
    logs.length = 0;
    mapOffsetManuallyAdjusted = false;
    mapCenterManuallyAdjusted = false;
    showMapManuallyToggled = false;
    lastAutoOffsetSignature = '';
    lastTrackDefaultSignature = '';
    mainPlotXRange = null;
    mainPlotXRangeSignature = '';
    if (mapCenterLatInput) mapCenterLatInput.value = '';
    if (mapCenterLonInput) mapCenterLonInput.value = '';
    updateMapFitInfo('');
    // Reset quick mod state
    quickModPreviewName = null;
    quickModState.channel = null;
    quickModState.negate = false;
    quickModState.reciprocal = false;
    quickModState.filter = false;
    if (quickModNegate) quickModNegate.checked = false;
    if (quickModReciprocal) quickModReciprocal.checked = false;
    if (quickModFilter) quickModFilter.checked = false;
    if (quickModFilterControls) quickModFilterControls.hidden = true;
    if (quickModCreateBtn) quickModCreateBtn.disabled = true;
    renderFilesList();
    populateYSelect();
    populateXCustomSelect();
    populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
    renderLapsList();
    Plotly.purge(plotDiv);
    clearXYMapPlot();
    clearLeafletMapPlot();
    setMapDisplayMode('none');
    syncShowMapDefault(false);
    applyMapColumnLayout(false);
    if (window.innerWidth <= 980) setControlsOpen(true);
  });

  // allow toggling file visibility by checking/unchecking checkboxes
  filesList.addEventListener('change', (ev)=>{
    if (ev.target.matches('input[type=checkbox]')) updatePlot();
  });

  customStandardChannels = loadCustomStandardChannels();
  loadChannelMapConfig();
  loadTrackMapDefaultsConfig();

  function saveMathChannels() {
    try { localStorage.setItem('mathChannels', JSON.stringify(mathChannels)); } catch {}
  }

  (function loadMathChannels() {
    try {
      const saved = JSON.parse(localStorage.getItem('mathChannels') || '[]');
      if (!Array.isArray(saved)) return;
      saved.forEach(mc => {
        if (mc && typeof mc.name === 'string' && typeof mc.expression === 'string') {
          const entry = { name: mc.name, expression: mc.expression, unit: mc.unit || '' };
          if (mc.smoothing && typeof mc.smoothing === 'object' && mc.smoothing.window > 0) {
            // mc.smoothing.mode is the pre-"filter on channel" field name (always 'time' or
            // 'distance') -- still a valid axisChannel value, so reading it as a fallback
            // here is enough to load older saved math channels without a migration step.
            entry.smoothing = { window: mc.smoothing.window, axisChannel: mc.smoothing.axisChannel || mc.smoothing.mode || 'time' };
          }
          mathChannels.push(entry);
        }
      });
      if (mathChannels.length > 0) renderMathChannelsList();
    } catch {}
  })();

  function saveDataFilters() {
    try {
      localStorage.setItem('dataFiltersState', JSON.stringify({
        enabled: !!(dataFiltersEnabledInput && dataFiltersEnabledInput.checked),
        filters: dataFilters
      }));
    } catch {}
  }

  (function loadDataFilters() {
    try {
      const saved = JSON.parse(localStorage.getItem('dataFiltersState') || 'null');
      if (saved && Array.isArray(saved.filters)) {
        saved.filters.forEach(f => {
          if (!f || typeof f.channel !== 'string' || !f.channel) return;
          const enabled = f.enabled !== false;
          if (f.kind === 'discrete' && Array.isArray(f.values) && f.values.length > 0) {
            dataFilters.push({ channel: f.channel, kind: 'discrete', values: f.values.slice(), allNumeric: !!f.allNumeric, enabled });
            return;
          }
          const min = Number.isFinite(f.min) ? f.min : null;
          const max = Number.isFinite(f.max) ? f.max : null;
          if (min === null && max === null) return;
          dataFilters.push({ channel: f.channel, kind: 'range', min, max, enabled });
        });
      }
      if (dataFiltersEnabledInput) dataFiltersEnabledInput.checked = !saved || saved.enabled !== false;
      syncDataFiltersEnabledVisual();
      if (dataFilters.length > 0) renderDataFiltersList();
    } catch {}
  })();

  function saveTempProfilePlots() {
    try { localStorage.setItem('tempProfilePlots', JSON.stringify(tempProfilePlots)); } catch {}
  }

  function saveTempProfileDefaults() {
    try { localStorage.setItem('tempProfileDefaults', JSON.stringify(tempProfileDefaults)); } catch {}
  }

  function saveTempProfileRowsHeight() {
    try { localStorage.setItem(TEMP_PROFILE_ROWS_HEIGHT_KEY, JSON.stringify(tempProfileRowsHeightPx)); } catch {}
  }

  function saveTimeSlipHeight() {
    try { localStorage.setItem(TIME_SLIP_HEIGHT_KEY, JSON.stringify(timeSlipHeightPx)); } catch {}
  }

  function saveShadeLapsEnabled() {
    try { localStorage.setItem(SHADE_LAPS_STORAGE_KEY, JSON.stringify(!!(shadeBox && shadeBox.checked))); } catch {}
  }

  function normalizeTempProfilePlot(p) {
    if (!p || typeof p !== 'object' || typeof p.name !== 'string' || !p.name) return null;
    const channels = Array.isArray(p.channels) ? p.channels.filter(c => typeof c === 'string' && c) : [];
    if (channels.length === 0) return null;
    return {
      id: typeof p.id === 'string' && p.id ? p.id : `temp-profile-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      name: p.name,
      channels,
      enabled: p.enabled !== false,
      useDefaultRange: p.useDefaultRange !== false,
      colormap: TEMP_COLORMAP_NAMES.includes(p.colormap) ? p.colormap : 'Jet',
      min: Number.isFinite(p.min) ? p.min : tempProfileDefaults.min,
      max: Number.isFinite(p.max) ? p.max : tempProfileDefaults.max,
      aboveColor: typeof p.aboveColor === 'string' && p.aboveColor ? p.aboveColor : tempProfileDefaults.aboveColor,
      belowColor: typeof p.belowColor === 'string' && p.belowColor ? p.belowColor : tempProfileDefaults.belowColor
    };
  }

  (function loadTempProfileData() {
    try {
      const savedDefaults = JSON.parse(localStorage.getItem('tempProfileDefaults') || 'null');
      if (savedDefaults && typeof savedDefaults === 'object') {
        tempProfileDefaults = {
          colormap: TEMP_COLORMAP_NAMES.includes(savedDefaults.colormap) ? savedDefaults.colormap : tempProfileDefaults.colormap,
          min: Number.isFinite(savedDefaults.min) ? savedDefaults.min : tempProfileDefaults.min,
          max: Number.isFinite(savedDefaults.max) ? savedDefaults.max : tempProfileDefaults.max,
          aboveColor: typeof savedDefaults.aboveColor === 'string' && savedDefaults.aboveColor ? savedDefaults.aboveColor : tempProfileDefaults.aboveColor,
          belowColor: typeof savedDefaults.belowColor === 'string' && savedDefaults.belowColor ? savedDefaults.belowColor : tempProfileDefaults.belowColor
        };
      }
    } catch {}
    try {
      const saved = JSON.parse(localStorage.getItem('tempProfilePlots') || '[]');
      if (Array.isArray(saved)) tempProfilePlots = saved.map(normalizeTempProfilePlot).filter(Boolean);
    } catch {}
    try {
      const savedHeight = JSON.parse(localStorage.getItem(TEMP_PROFILE_ROWS_HEIGHT_KEY) || 'null');
      if (Number.isFinite(savedHeight) && savedHeight > 0) tempProfileRowsHeightPx = savedHeight;
    } catch {}
    try {
      const savedTimeSlipHeight = JSON.parse(localStorage.getItem(TIME_SLIP_HEIGHT_KEY) || 'null');
      if (Number.isFinite(savedTimeSlipHeight) && savedTimeSlipHeight > 0) timeSlipHeightPx = savedTimeSlipHeight;
    } catch {}
    if (tempProfilePlots.length > 0) renderTempProfilePlotsList();
  })();

  // localStorage keys that represent user-editable settings/preferences (as opposed to
  // in-memory-only UI state, or the 'uiFlag7' easter-egg toggle) -- the set the User
  // section's Download/Upload Settings buttons carry between browsers. Loaded log files
  // themselves are deliberately excluded: they aren't persisted at all today, and a user
  // switching browsers still has the original CSV/.res files to re-open there.
  const SETTINGS_STORAGE_KEYS = [
    'csvPlotterTheme',
    'csv-plotter-panel-sizes',
    IMPORTER_CUSTOM_STANDARD_CHANNELS_STORAGE_KEY,
    'mathChannels',
    'dataFiltersState',
    SELECTION_FIT_TYPE_STORAGE_KEY,
    SELECTION_FIT_FORMULA_STORAGE_KEY,
    'trackCornerMetadata',
    'trackCornerOverrides',
    'startFinishLineOverrides',
    'tempProfilePlots',
    'tempProfileDefaults',
    TEMP_PROFILE_ROWS_HEIGHT_KEY,
    TIME_SLIP_HEIGHT_KEY,
    SHADE_LAPS_STORAGE_KEY
  ];

  function triggerJsonDownload(jsonString, filenamePrefix) {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Minimal ZIP builder (store / no compression) ─────────────────────────
  // Builds a valid ZIP archive entirely in-browser without any external library.
  // Each entry is stored uncompressed (method 0) to avoid needing DecompressionStream
  // on the restore path — maximising compatibility with older browsers and the ESP32
  // build served over plain HTTP.

  function buildZip(entries) {
    // entries: Array<{ name: string, data: string | Uint8Array }>
    // Returns a Uint8Array containing the complete ZIP file.

    const enc = new TextEncoder();

    function toBytes(data) {
      return (typeof data === 'string') ? enc.encode(data) : data;
    }

    function crc32(bytes) {
      let crc = 0xFFFFFFFF;
      for (let i = 0; i < bytes.length; i++) {
        crc ^= bytes[i];
        for (let j = 0; j < 8; j++) {
          crc = (crc & 1) ? (crc >>> 1) ^ 0xEDB88320 : (crc >>> 1);
        }
      }
      return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    function u16le(n, buf, off) { buf[off] = n & 0xFF; buf[off+1] = (n >> 8) & 0xFF; }
    function u32le(n, buf, off) { buf[off] = n & 0xFF; buf[off+1] = (n>>8)&0xFF; buf[off+2] = (n>>16)&0xFF; buf[off+3] = (n>>24)&0xFF; }

    const localHeaders = [];
    const offsets = [];
    let offset = 0;
    const parts = [];

    for (const entry of entries) {
      const nameBytes = enc.encode(entry.name);
      const dataBytes = toBytes(entry.data);
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      const local = new Uint8Array(30 + nameBytes.length);
      u32le(0x04034B50, local, 0);  // local file header signature
      u16le(20, local, 4);           // version needed: 2.0
      u16le(0, local, 6);            // general purpose bit flag
      u16le(0, local, 8);            // compression method: store
      u16le(0, local, 10);           // last mod time
      u16le(0, local, 12);           // last mod date
      u32le(crc, local, 14);
      u32le(size, local, 18);        // compressed size
      u32le(size, local, 22);        // uncompressed size
      u16le(nameBytes.length, local, 26);
      u16le(0, local, 28);           // extra field length
      local.set(nameBytes, 30);

      offsets.push(offset);
      offset += local.length + size;
      parts.push(local, dataBytes);
      localHeaders.push({ nameBytes, crc, size });
    }

    const centralStart = offset;
    const centralParts = [];

    for (let i = 0; i < entries.length; i++) {
      const { nameBytes, crc, size } = localHeaders[i];
      const central = new Uint8Array(46 + nameBytes.length);
      u32le(0x02014B50, central, 0);  // central dir signature
      u16le(20, central, 4);           // version made by
      u16le(20, central, 6);           // version needed
      u16le(0, central, 8);            // flags
      u16le(0, central, 10);           // method: store
      u16le(0, central, 12);           // last mod time
      u16le(0, central, 14);           // last mod date
      u32le(crc, central, 16);
      u32le(size, central, 20);        // compressed size
      u32le(size, central, 24);        // uncompressed size
      u16le(nameBytes.length, central, 28);
      u16le(0, central, 30);           // extra field length
      u16le(0, central, 32);           // file comment length
      u16le(0, central, 34);           // disk number start
      u16le(0, central, 36);           // internal attrs
      u32le(0, central, 38);           // external attrs
      u32le(offsets[i], central, 42);  // relative offset of local header
      central.set(nameBytes, 46);
      centralParts.push(central);
      offset += central.length;
    }

    const centralSize = offset - centralStart;
    const eocd = new Uint8Array(22);
    u32le(0x06054B50, eocd, 0);  // end of central dir signature
    u16le(0, eocd, 4);            // disk number
    u16le(0, eocd, 6);            // disk with central dir
    u16le(entries.length, eocd, 8);
    u16le(entries.length, eocd, 10);
    u32le(centralSize, eocd, 12);
    u32le(centralStart, eocd, 16);
    u16le(0, eocd, 20);           // comment length

    const allParts = [...parts, ...centralParts, eocd];
    const totalLen = allParts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(totalLen);
    let pos = 0;
    for (const p of allParts) { out.set(p, pos); pos += p.length; }
    return out;
  }

  function triggerZipDownload(zipBytes, filenamePrefix) {
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}-${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── ZIP reader (store-only, no DEFLATE) ───────────────────────────────────
  // Reads a ZIP produced by buildZip() above. Returns a Map<name, Uint8Array>.
  // Only handles method-0 (store) entries; others are skipped gracefully.
  function readZip(buffer) {
    const view = new DataView(buffer);
    const u8 = new Uint8Array(buffer);
    const files = new Map();

    let i = 0;
    while (i + 4 <= buffer.byteLength) {
      const sig = view.getUint32(i, true);
      if (sig === 0x04034B50) {
        const method      = view.getUint16(i + 8,  true);
        const compSize    = view.getUint32(i + 18, true);
        const nameLen     = view.getUint16(i + 26, true);
        const extraLen    = view.getUint16(i + 28, true);
        const nameStart   = i + 30;
        const dataStart   = nameStart + nameLen + extraLen;
        const name = new TextDecoder().decode(u8.slice(nameStart, nameStart + nameLen));
        if (method === 0) {
          files.set(name, u8.slice(dataStart, dataStart + compSize));
        }
        i = dataStart + compSize;
      } else if (sig === 0x02014B50 || sig === 0x06054B50) {
        break; // reached central directory or EOCD
      } else {
        i++; // scan forward (shouldn't happen with well-formed ZIP)
      }
    }
    return files;
  }

  function setSettingsIoStatus(message, isError) {
    if (!settingsIoStatus) return;
    settingsIoStatus.textContent = message;
    settingsIoStatus.classList.toggle('is-error', !!isError);
  }

  // Every SETTINGS_STORAGE_KEYS entry is JSON.stringify'd before being written to
  // localStorage (applyTheme, saveMathChannels, saveDataFilters, resize-panels.js's
  // saveSizes, etc.) -- except 'csvPlotterTheme', which app.js writes as a bare raw string
  // ('dark'/'light', see applyTheme) so index.html's inline anti-flash-of-wrong-theme
  // script can compare it directly. These two need different (de)serialization on the way
  // in and out of the settings JSON, hence the special case below.
  function readSettingValue(key) {
    const raw = localStorage.getItem(key);
    if (raw == null) return undefined;
    if (key === 'csvPlotterTheme') return raw;
    try { return JSON.parse(raw); } catch { return undefined; }
  }

  function writeSettingValue(key, value) {
    if (key === 'csvPlotterTheme') {
      if (typeof value !== 'string') return false;
      localStorage.setItem(key, value);
      return true;
    }
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  }

  function downloadSettingsJson() {
    const settings = {};
    SETTINGS_STORAGE_KEYS.forEach((key) => {
      const value = readSettingValue(key);
      if (value !== undefined) settings[key] = value;
    });
    const payload = { app: 'csv-plotter-settings', version: 1, exportedAt: new Date().toISOString(), settings };
    triggerJsonDownload(JSON.stringify(payload, null, 2), 'csv-plotter-settings');
    setSettingsIoStatus('Settings downloaded.');
  }

  function importSettingsFromFile(file) {
    if (typeof file.text !== 'function') {
      setSettingsIoStatus('This browser cannot read that file.', true);
      return;
    }
    file.text().then((text) => {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        setSettingsIoStatus("Could not read that file -- not valid JSON.", true);
        return;
      }
      if (!parsed || typeof parsed.settings !== 'object' || parsed.settings === null) {
        setSettingsIoStatus("That file doesn't look like a csv-plotter settings export.", true);
        return;
      }
      let applied = 0;
      SETTINGS_STORAGE_KEYS.forEach((key) => {
        if (!(key in parsed.settings)) return;
        try {
          if (writeSettingValue(key, parsed.settings[key])) applied += 1;
        } catch { /* localStorage write failed (quota, etc.) -- skip this key */ }
      });
      if (applied === 0) {
        setSettingsIoStatus('No recognized settings found in that file.', true);
        return;
      }
      // A page reload is the simplest reliable way to apply imported settings: they're each
      // restored by their own scattered init-time load (theme, math channels, data filters,
      // resize-panels.js panel sizes, etc.) rather than one central "apply settings" path.
      setSettingsIoStatus(`Imported ${applied} setting${applied === 1 ? '' : 's'}. Reloading...`);
      setTimeout(() => location.reload(), 600);
    }, () => {
      setSettingsIoStatus('Failed to read that file.', true);
    });
  }

  if (downloadSettingsBtn) {
    downloadSettingsBtn.addEventListener('click', downloadSettingsJson);
  }
  if (uploadSettingsBtn && settingsFileInput) {
    uploadSettingsBtn.addEventListener('click', () => settingsFileInput.click());
    settingsFileInput.addEventListener('change', () => {
      const file = settingsFileInput.files && settingsFileInput.files[0];
      settingsFileInput.value = ''; // allow re-selecting the same file back-to-back
      if (file) importSettingsFromFile(file);
    });
  }

  // ── Vehicles & Riders: standalone JSON import/export ──────────────────────
  // Separate from Download All Data (which already includes the full sessions bundle,
  // vehicles/riders included) -- this is the "share just my garage" path: a plain,
  // human-readable file with only vehicles and riders, importable as new entries on
  // another browser/profile without touching anything else there.
  function setVehiclesRidersIoStatus(message, isError) {
    if (!vehiclesRidersIoStatus) return;
    vehiclesRidersIoStatus.textContent = message;
    vehiclesRidersIoStatus.classList.toggle('is-error', !!isError);
  }

  function stripRecordForExport(record) {
    const copy = Object.assign({}, record);
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    return copy;
  }

  // Builds the same JSON payload Download Vehicles & Riders writes to disk, without
  // triggering the download itself -- shared by the local download path and Backup
  // Vehicles & Riders to Drive. Resolves null when there's nothing to export.
  function buildVehiclesRidersJsonPayload() {
    if (!sessionsApi) return Promise.reject(new Error('Sessions storage is not available.'));
    return Promise.all([
      sessionsApi.VehicleService.listVehicles(),
      sessionsApi.RiderService.listRiders()
    ]).then(([vehicles, riders]) => {
      if (!vehicles.length && !riders.length) return null;
      const payload = {
        app: 'csv-plotter-vehicles-riders',
        version: 1,
        exportedAt: new Date().toISOString(),
        vehicles: vehicles.map(stripRecordForExport),
        riders: riders.map(stripRecordForExport)
      };
      return { json: JSON.stringify(payload, null, 2), vehicleCount: vehicles.length, riderCount: riders.length };
    });
  }

  function downloadVehiclesRidersJson() {
    if (!sessionsApi) { setVehiclesRidersIoStatus('Sessions storage is not available.', true); return; }
    buildVehiclesRidersJsonPayload().then((result) => {
      if (!result) {
        setVehiclesRidersIoStatus('No vehicles or riders to download yet.', true);
        return;
      }
      triggerJsonDownload(result.json, 'csv-plotter-vehicles-riders');
      setVehiclesRidersIoStatus(`Downloaded ${result.vehicleCount} vehicle${result.vehicleCount === 1 ? '' : 's'} `
        + `and ${result.riderCount} rider${result.riderCount === 1 ? '' : 's'}.`);
    }).catch(() => setVehiclesRidersIoStatus('Could not read vehicles/riders from storage.', true));
  }

  // Every vehicle/rider in the file is added as a brand-new record (a fresh id is minted
  // by the normal create path) -- never matched against or merged into an existing one,
  // so importing the same file twice makes duplicates. That mirrors "import a shared
  // setup" semantics; "restore my own backup" (which reinstates the same records instead
  // of duplicating them) is what Upload Backup / Download All Data is for.
  function importVehiclesRidersFromFile(file) {
    if (!sessionsApi) { setVehiclesRidersIoStatus('Sessions storage is not available.', true); return; }
    if (typeof file.text !== 'function') { setVehiclesRidersIoStatus('This browser cannot read that file.', true); return; }
    file.text().then((text) => {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        setVehiclesRidersIoStatus('Could not read that file -- not valid JSON.', true);
        return;
      }
      const vehicles = Array.isArray(parsed && parsed.vehicles) ? parsed.vehicles : [];
      const riders = Array.isArray(parsed && parsed.riders) ? parsed.riders : [];
      if (!vehicles.length && !riders.length) {
        setVehiclesRidersIoStatus("That file doesn't look like a csv-plotter vehicles/riders export.", true);
        return;
      }
      Promise.all([
        Promise.all(vehicles.map((v) => sessionsApi.VehicleService.createVehicle(stripRecordForExport(v)).then(() => true).catch(() => false))),
        Promise.all(riders.map((r) => sessionsApi.RiderService.createRider(stripRecordForExport(r)).then(() => true).catch(() => false)))
      ]).then(([vehicleResults, riderResults]) => {
        const vehiclesAdded = vehicleResults.filter(Boolean).length;
        const ridersAdded = riderResults.filter(Boolean).length;
        const failed = (vehicleResults.length - vehiclesAdded) + (riderResults.length - ridersAdded);
        setVehiclesRidersIoStatus(
          `Imported ${vehiclesAdded} vehicle${vehiclesAdded === 1 ? '' : 's'} and ${ridersAdded} rider${ridersAdded === 1 ? '' : 's'} as new entries`
          + (failed ? `; ${failed} record(s) could not be imported.` : '.'),
          failed > 0 && vehiclesAdded + ridersAdded === 0
        );
        refreshVehicleSimLists();
        if (window.SessionsUI) window.SessionsUI.renderPanel();
      });
    }, () => setVehiclesRidersIoStatus('Failed to read that file.', true));
  }

  if (downloadVehiclesRidersBtn) {
    downloadVehiclesRidersBtn.addEventListener('click', downloadVehiclesRidersJson);
  }
  if (uploadVehiclesRidersBtn && vehiclesRidersFileInput) {
    uploadVehiclesRidersBtn.addEventListener('click', () => vehiclesRidersFileInput.click());
    vehiclesRidersFileInput.addEventListener('change', () => {
      const file = vehiclesRidersFileInput.files && vehiclesRidersFileInput.files[0];
      vehiclesRidersFileInput.value = '';
      if (file) importVehiclesRidersFromFile(file);
    });
  }

  // ── Google Drive (optional) ────────────────────────────────────────────────
  // See google-drive.js for the actual OAuth/Picker/Drive-API plumbing -- this block only
  // wires the User-panel buttons to it and feeds picked/downloaded content into the same
  // parseFile/restoreFromBackup/importVehiclesRidersFromFile entry points the local
  // file/upload pickers use, via a synthetic File wrapping the downloaded Blob.
  if (window.GoogleDriveIntegration) {
    const gdrive = window.GoogleDriveIntegration;

    function setGoogleDriveActionsStatus(message, isError) {
      if (!googleDriveActionsStatus) return;
      googleDriveActionsStatus.textContent = message;
      googleDriveActionsStatus.classList.toggle('is-error', !!isError);
    }

    function describeGoogleDriveError(err) {
      return (err && err.message) ? err.message : 'Something went wrong talking to Google Drive.';
    }

    function refreshGoogleDriveUi() {
      const ready = gdrive.isConfigured() && gdrive.isApiLoaded();
      const signedIn = ready && gdrive.isSignedIn();
      if (googleDriveConnectBtn) googleDriveConnectBtn.hidden = !ready || signedIn;
      if (googleDriveDisconnectBtn) googleDriveDisconnectBtn.hidden = !signedIn;
      if (googleDriveActions) googleDriveActions.hidden = !signedIn;
      if (googleDriveImportCsvBtn) googleDriveImportCsvBtn.hidden = !signedIn;
      if (!googleDriveStatus) return;
      if (!ready) {
        googleDriveStatus.textContent = gdrive.isConfigured()
          ? "Not available (Google's scripts didn't load -- check your connection)."
          : 'Not configured for this deployment.';
      } else if (!signedIn) {
        googleDriveStatus.textContent = 'Not connected.';
      } else {
        googleDriveStatus.textContent = 'Connected.';
        gdrive.getSignedInUserInfo().then((info) => {
          if (info && info.email && googleDriveStatus) googleDriveStatus.textContent = `Connected as ${info.email}.`;
        });
      }
    }

    if (googleDriveConnectBtn) {
      googleDriveConnectBtn.addEventListener('click', () => {
        setGoogleDriveActionsStatus('');
        gdrive.signIn().then(refreshGoogleDriveUi).catch((err) => setGoogleDriveActionsStatus(describeGoogleDriveError(err), true));
      });
    }
    if (googleDriveDisconnectBtn) {
      googleDriveDisconnectBtn.addEventListener('click', () => {
        gdrive.signOut().then(() => {
          setGoogleDriveActionsStatus('Disconnected.');
          refreshGoogleDriveUi();
        });
      });
    }
    if (googleDriveImportCsvBtn) {
      googleDriveImportCsvBtn.addEventListener('click', () => {
        gdrive.pickFile({ mimeTypes: ['text/csv', 'text/plain', 'application/vnd.ms-excel'] })
          .then((picked) => gdrive.downloadFileContent(picked.id).then((blob) => {
            parseFile(new File([blob], picked.name));
          }))
          .catch((err) => { if (err && err.message !== 'cancelled') setGoogleDriveActionsStatus(describeGoogleDriveError(err), true); });
      });
    }
    if (googleDriveBackupAllBtn) {
      googleDriveBackupAllBtn.addEventListener('click', () => {
        setGoogleDriveActionsStatus('Backing up to Drive…');
        buildAllDataZipBlob()
          .then((zipBytes) => gdrive.uploadOrUpdateFile({ name: 'csv-plotter-backup.zip', blob: new Blob([zipBytes]), mimeType: 'application/zip' }))
          .then(() => setGoogleDriveActionsStatus('Backed up to Drive.'))
          .catch((err) => setGoogleDriveActionsStatus(describeGoogleDriveError(err), true));
      });
    }
    if (googleDriveRestoreAllBtn) {
      googleDriveRestoreAllBtn.addEventListener('click', () => {
        gdrive.pickFile({ mimeTypes: ['application/zip'] })
          .then((picked) => gdrive.downloadFileContent(picked.id).then((blob) => {
            restoreFromBackup(new File([blob], picked.name, { type: 'application/zip' }));
          }))
          .catch((err) => { if (err && err.message !== 'cancelled') setGoogleDriveActionsStatus(describeGoogleDriveError(err), true); });
      });
    }
    if (googleDriveBackupVehiclesRidersBtn) {
      googleDriveBackupVehiclesRidersBtn.addEventListener('click', () => {
        setGoogleDriveActionsStatus('Backing up to Drive…');
        buildVehiclesRidersJsonPayload()
          .then((result) => {
            if (!result) { setGoogleDriveActionsStatus('No vehicles or riders to back up yet.', true); return null; }
            return gdrive.uploadOrUpdateFile({ name: 'csv-plotter-vehicles-riders.json', blob: new Blob([result.json]), mimeType: 'application/json' })
              .then(() => setGoogleDriveActionsStatus('Backed up to Drive.'));
          })
          .catch((err) => setGoogleDriveActionsStatus(describeGoogleDriveError(err), true));
      });
    }
    if (googleDriveRestoreVehiclesRidersBtn) {
      googleDriveRestoreVehiclesRidersBtn.addEventListener('click', () => {
        gdrive.pickFile({ mimeTypes: ['application/json'] })
          .then((picked) => gdrive.downloadFileContent(picked.id).then((blob) => {
            importVehiclesRidersFromFile(new File([blob], picked.name, { type: 'application/json' }));
          }))
          .catch((err) => { if (err && err.message !== 'cancelled') setGoogleDriveActionsStatus(describeGoogleDriveError(err), true); });
      });
    }

    refreshGoogleDriveUi();
  }

  // ── Stored Files (IndexedDB) ──────────────────────────────────────────────
  // Uploaded files are persisted in IndexedDB so they survive page reloads.
  // On startup all stored entries are re-parsed automatically.
  //
  // The csvPlotterFiles database itself is owned by sessions-storage.js, which also
  // carries its schema migration (v2 keyed by `name` -> v3 keyed by a UUID `id`, with
  // the filename kept as a field). Opening the same database from two places at two
  // versions would deadlock the upgrade, so everything below delegates rather than
  // calling indexedDB.open directly. Stored records gained session-link fields
  // (session_ids, vehicle_id, rider_id, setup_id, tags) at v3; the quick-plot path that
  // writes them is otherwise unchanged.

  const sessionsApi = (window.SessionsServices && window.SessionsStorage)
    ? window.SessionsServices.createServices()
    : null;
  const sessionsFiles = sessionsApi ? sessionsApi.FileService : null;

  // The sessions UI owns the Sessions panel and the Add to Session modal; app.js only
  // tells it when session state changed so the stored-file lists can re-render.
  if (sessionsApi && window.SessionsUI) {
    window.SessionsUI.init({
      services: sessionsApi,
      onChanged: () => {
        renderStoredFilesList();
        renderPickerList();
        // Also re-render the loaded-files list so each row's session badges reflect the
        // attachment that just happened.
        if (logs.length) renderFilesList();
        refreshNoteMarkerCaches();
        // A vehicle or rider may have just been added/edited in the Sessions panel.
        refreshVehicleSimLists();
      },
      onPickModeChange: (kind) => {
        // The Sessions panel's own "Pin on Graph"/"Pin on Map" buttons always mean the
        // panel composer should receive the next pick, not the full-screen FAB's floating
        // card -- even if the FAB happened to be armed a moment ago.
        notePickPurpose = 'panel';
        if (fabNotePickArmed) { fabNotePickArmed = false; updateFullscreenFab(); }
        setNotePickMode(kind);
      }
    });
    refreshNoteMarkerCaches();
    refreshVehicleSimLists();
  }

  // ── Author Name (User tab) ────────────────────────────────────────────────
  // Names the device-local user notes are attributed to (there's no login system yet).
  if (sessionsApi && authorNameInput) {
    sessionsApi.UserService.ensureLocalUser().then((user) => {
      authorNameInput.value = (user && user.name) || '';
    }).catch(() => {});

    let lastSavedAuthorName = null;
    const saveAuthorName = () => {
      const value = authorNameInput.value;
      if (value === lastSavedAuthorName) return;
      lastSavedAuthorName = value;
      sessionsApi.UserService.setLocalUserName(value).then((user) => {
        authorNameInput.value = user.name; // reflects the "Anonymous User" fallback if left blank
        lastSavedAuthorName = user.name;
        if (authorNameStatus) authorNameStatus.textContent = 'Saved.';
        renderSessionsPanel(); // the note composer's author list shows this name
      }).catch(() => {
        if (authorNameStatus) authorNameStatus.textContent = 'Could not save that name.';
      });
    };
    authorNameInput.addEventListener('blur', saveAuthorName);
    authorNameInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); authorNameInput.blur(); }
    });
  }

  function renderSessionsPanel() {
    if (window.SessionsUI) window.SessionsUI.renderPanel();
  }

  // ── Pin-a-note-on-graph/map ──────────────────────────────────────────────
  // "Pin on Graph"/"Pin on Map" in the Sessions panel arm one of these; the next click
  // on the plot (native plotly_click) or the Leaflet map (a click handler attached only
  // while armed, mirroring the start/finish-line editor's own attach/detach pattern)
  // captures a location and hands it to SessionsUI.beginNoteAtLocation. Notes with a
  // location are rendered back as markers below, independent of whether picking is armed.

  let notePickMode = null; // 'plot' | 'map' | null
  let notePickPurpose = 'panel'; // 'panel' (Sessions panel composer) | 'fab' (full-screen map FAB)
  let noteMapPickHandler = null; // bound fn currently attached to leafletMap's click event

  function setNotePickMode(kind) {
    notePickMode = kind;
    if (plotDiv) plotDiv.style.cursor = kind === 'plot' ? 'crosshair' : '';
    if (leafletMapDiv) leafletMapDiv.style.cursor = kind === 'map' ? 'crosshair' : '';
    if (kind === 'map') {
      // Two "click the map to place something" modes at once would be confusing.
      cancelStartFinishLineEdit();
      attachNoteMapPickHandler();
    } else {
      detachNoteMapPickHandler();
    }
  }

  function attachNoteMapPickHandler() {
    if (!leafletMap) return;
    detachNoteMapPickHandler();
    noteMapPickHandler = (e) => handleMapNotePickClick(e);
    // 'preclick' rather than 'click': the track itself is drawn as an interactive
    // Leaflet path, and an interactive path consumes the click before it would reach a
    // plain map 'click' listener -- which is exactly where a user pinning a note to a
    // spot on the track is most likely to click. 'preclick' fires on the map first,
    // before any layer gets a chance to swallow it, and carries the same e.latlng.
    leafletMap.on('preclick', noteMapPickHandler);
  }

  function detachNoteMapPickHandler() {
    if (leafletMap && noteMapPickHandler) leafletMap.off('preclick', noteMapPickHandler);
    noteMapPickHandler = null;
  }

  function handleMapNotePickClick(e) {
    const purpose = notePickPurpose;
    setNotePickMode(null);
    if (purpose === 'fab') {
      fabNotePickArmed = false;
      updateFullscreenFab();
    }
    if (leafletMapMode !== 'geo') {
      const message = 'Switch the map to GPS/Lat-Lon mode (not the X/Y overlay) to pin a note by location.';
      if (purpose === 'fab') window.alert(message);
      else if (window.SessionsUI) window.SessionsUI.notifyPickCancelled('map', message);
      return;
    }
    const location = { kind: 'map', lat: e.latlng.lat, lon: e.latlng.lng };
    if (purpose === 'fab') {
      openFullscreenNoteCard(location);
    } else if (window.SessionsUI) {
      window.SessionsUI.beginNoteAtLocation(location);
    }
  }

  // Called from the main plot's plotly_click handler (see bindMainPlotHoverSync) with
  // whichever point Plotly resolved the click to, and that point's row key (see rowKey),
  // when picking is armed for the plot.
  function handlePlotNotePickClick(point, key) {
    setNotePickMode(null);
    if (!point) {
      if (window.SessionsUI) {
        window.SessionsUI.notifyPickCancelled('plot', 'Click directly on a plotted line to pin a note there.');
      }
      return;
    }
    const parts = key ? String(key).split('|') : [];
    const logId = parts[0];
    const lap = parts.length > 1 ? Number(parts[1]) : null;
    const rowIndex = parts.length > 2 ? Number(parts[2]) : NaN;
    const log = logId ? logs.find((l) => l.id === logId) : null;
    if (!log || !sessionsFiles) {
      if (window.SessionsUI) {
        window.SessionsUI.notifyPickCancelled('plot', 'Could not determine which file that point belongs to.');
      }
      return;
    }

    const trace = point.fullData || point.data || {};
    const channel = trace.meta && trace.meta.channel;
    const xValue = Number(point.x);
    const yValue = Number(point.y);
    const xMode = document.querySelector('input[name=xaxis]:checked').value;
    const customXCol = xCustomSelect ? xCustomSelect.value : '';

    if (!Number.isFinite(xValue)) {
      if (window.SessionsUI) {
        window.SessionsUI.notifyPickCancelled('plot', 'Could not read a position for that point.');
      }
      return;
    }

    sessionsFiles.getFileByName(log.name).then((record) => {
      if (!record) {
        if (window.SessionsUI) {
          window.SessionsUI.notifyPickCancelled('plot', `"${log.name}" needs to be stored in this browser before you can pin a note to it.`);
        }
        return;
      }
      // Every row has both a time and a distance value regardless of which one is
      // currently the x-axis -- capturing both here (via the same helper the plot itself
      // uses to build its x-series) lets the marker keep its position after switching
      // between Time and Distance, instead of only ever matching the mode it was pinned
      // in. Not attempted for a 'custom' channel x-axis: there's no second axis to fall
      // back to that's guaranteed to make sense.
      let timeValue;
      let distanceValue;
      if (Number.isFinite(rowIndex) && log.meta) {
        const timeSeries = getXSeriesForMode(log, [rowIndex], 'time', '');
        const distanceSeries = getXSeriesForMode(log, [rowIndex], 'distance', '');
        if (timeSeries && Number.isFinite(timeSeries[0])) timeValue = timeSeries[0];
        if (distanceSeries && Number.isFinite(distanceSeries[0])) distanceValue = distanceSeries[0];
      }

      const location = {
        kind: 'plot',
        file_id: record.id,
        file_name: log.name,
        lap: Number.isFinite(lap) ? lap : undefined,
        x: xValue,
        x_axis: xMode,
        x_channel: xMode === 'custom' ? customXCol : undefined,
        time_value: timeValue,
        distance_value: distanceValue,
        channel: channel || undefined,
        value: Number.isFinite(yValue) ? yValue : undefined
      };
      if (window.SessionsUI) window.SessionsUI.beginNoteAtLocation(location);
    });
  }

  function noteHoverPreview(note) {
    const text = String((note && note.content) || '').trim();
    if (!text) return '(no content)';
    // Both hover surfaces now wrap long text (.note-map-tooltip on the map, Plotly's own
    // hoverlabel wrapping on the graph) instead of running off in one line, so this can
    // afford to show more than a token-length snippet.
    return text.length > 160 ? text.slice(0, 157) + '…' : text;
  }

  // Raw notes-with-a-location, refreshed from IndexedDB whenever session data changes
  // (see the onChanged callback above). Per-render filtering against whichever files/
  // laps/x-axis mode are currently displayed happens synchronously in updatePlot() and
  // renderMapNoteMarkers(), so those stay cheap even though this refresh is async.
  let plotNotesRaw = []; // [{ fileName, lap, x, x_axis, note }]
  let mapNotesRaw = [];  // Note[] with location.kind === 'map'

  function refreshNoteMarkerCaches() {
    if (!sessionsApi) {
      plotNotesRaw = [];
      mapNotesRaw = [];
      updatePlot();
      renderMapNoteMarkers();
      return Promise.resolve();
    }
    return sessionsApi.NoteService.listNotes().then((notes) => {
      const plotNotes = (notes || []).filter((n) => (
        n.location && n.location.kind === 'plot' && n.location.file_id && Number.isFinite(n.location.x)
      ));
      mapNotesRaw = (notes || []).filter((n) => (
        n.location && n.location.kind === 'map' && Number.isFinite(n.location.lat) && Number.isFinite(n.location.lon)
      ));

      if (!plotNotes.length) {
        plotNotesRaw = [];
        updatePlot();
        renderMapNoteMarkers();
        return null;
      }

      // file_id is the persisted sessions File.id, not the transient in-memory log.id
      // used for plotting -- resolve it back to a filename here (once, async) so
      // updatePlot()'s per-render filter can match it against `logs` by name (sync).
      const fileIds = Array.from(new Set(plotNotes.map((n) => n.location.file_id)));
      return Promise.all(fileIds.map((id) => sessionsFiles.getFile(id))).then((files) => {
        const nameById = new Map();
        files.forEach((f, i) => { if (f) nameById.set(fileIds[i], f.name); });
        plotNotesRaw = plotNotes.map((n) => ({
          fileName: nameById.get(n.location.file_id) || null,
          lap: n.location.lap,
          x: n.location.x,
          x_axis: n.location.x_axis,
          x_channel: n.location.x_channel,
          note: n
        })).filter((entry) => entry.fileName);
        updatePlot();
        renderMapNoteMarkers();
      });
    }).catch((err) => {
      // Left visible (rather than swallowed) so a persistent failure here -- which
      // would otherwise look like "my pinned note just never comes back" -- shows up
      // as something diagnosable in devtools instead of failing completely silently.
      console.error('Could not refresh note markers:', err);
    });
  }

  // Leaflet markers for map-pinned notes. Rebuilt on every updateLeafletMap() call and
  // whenever the notes cache refreshes -- map notes aren't file-specific (a physical
  // track location is a fact about the place, not about any one log), so unlike the
  // plot markers they don't need to be re-filtered against the currently loaded files.
  let leafletNoteMarkers = [];

  function clearMapNoteMarkers() {
    leafletNoteMarkers.forEach((marker) => {
      if (leafletMap && leafletMap.hasLayer(marker)) leafletMap.removeLayer(marker);
    });
    leafletNoteMarkers = [];
  }

  function renderMapNoteMarkers() {
    if (!leafletMap || !window.L) return;
    clearMapNoteMarkers();
    if (leafletMapMode !== 'geo' || !mapNotesRaw.length) return;
    mapNotesRaw.forEach((note) => {
      const icon = L.divIcon({
        className: 'note-map-marker-icon',
        // The same "note" glyph as the Add Note button and the graph marker (see
        // sessions-model.js's NOTE_ICON_SVG) -- a plain stroked icon (fill:none,
        // stroke:currentColor), not a colour emoji, so it inherits .note-map-marker-icon's
        // CSS color (the same accent used for badges/active buttons elsewhere in the
        // sessions UI) and matches both themes.
        html: (window.SessionsModel && window.SessionsModel.NOTE_ICON_SVG) || '',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      const marker = L.marker([note.location.lat, note.location.lon], { icon, keyboard: false });
      // className: Leaflet's default tooltip CSS is white-space:nowrap, which either
      // overflows or stretches very wide for anything longer than a few words -- see
      // .note-map-tooltip for the override that lets a long note preview wrap instead.
      marker.bindTooltip(noteHoverPreview(note), { direction: 'top', offset: [0, -14], className: 'note-map-tooltip' });
      // Leaflet's own tooltip pane isn't sized to the map (it's auto-width, content-
      // sized), so a CSS percentage width on .note-map-tooltip would have nothing real
      // to resolve against -- this sets a max-width in real pixels, computed from the
      // map's own current width, each time a tooltip actually opens (not once at build
      // time, so it stays correct if the map gets resized afterward).
      marker.on('tooltipopen', () => {
        const tooltipEl = marker.getTooltip() && marker.getTooltip().getElement();
        if (!tooltipEl || !leafletMapDiv) return;
        const mapWidth = leafletMapDiv.clientWidth || 280;
        tooltipEl.style.maxWidth = `${Math.max(160, Math.min(420, Math.round(mapWidth * 0.75)))}px`;
      });
      marker.on('click', (ev) => {
        if (window.L && window.L.DomEvent) L.DomEvent.stopPropagation(ev);
        if (window.SessionsUI) window.SessionsUI.viewNote(note.id);
      });
      marker.addTo(leafletMap);
      leafletNoteMarkers.push(marker);
    });
  }

  // Fills `target` with a badge per session the named file is attached to. Async and
  // best-effort: the file row is already on screen, badges just arrive a tick later.
  function renderFileSessionBadges(fileName, target) {
    if (!sessionsApi || !target) return;
    sessionsFiles.getFileByName(fileName).then((record) => {
      const sessionIds = (record && record.session_ids) || [];
      if (!sessionIds.length) return null;
      return Promise.all(sessionIds.map((id) => sessionsApi.SessionService.getSession(id)))
        .then((sessions) => {
          target.textContent = '';
          sessions.filter(Boolean).forEach((session) => {
            const badge = document.createElement('span');
            badge.className = 'file-session-badge';
            badge.textContent = session.name;
            badge.title = `Attached to "${session.name}"`;
            target.appendChild(badge);
          });
          return null;
        });
    }).catch(() => { /* badges are cosmetic -- never break the file row over them */ });
  }

  // Lightweight DJB2 hash of a string -- avoids crypto.subtle which requires a
  // secure context (HTTPS/localhost) not guaranteed in the ESP32 embedded build.
  function computeFileHash(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) + h) ^ text.charCodeAt(i);
      h = h >>> 0; // keep unsigned 32-bit
    }
    return h.toString(16).padStart(8, '0');
  }

  // Extract key metadata fields from the top of a CSV/TSV file without a full
  // PapaParse run -- reads the first 50 lines looking for key,value rows.
  function extractCsvFileMetadata(text) {
    const lines = text.split(/\r?\n/).slice(0, 50);
    const meta = {};
    const FIELDS = ['venue', 'track', 'rider', 'vehicle', 'bike', 'driver', 'car', 'championship', 'event', 'session', 'date'];
    for (const line of lines) {
      if (!line.trim()) continue;
      // Support comma- and tab-delimited key,value rows
      const sep = line.includes('\t') ? '\t' : ',';
      const parts = line.split(sep);
      if (parts.length < 2) continue;
      const key = String(parts[0] == null ? '' : parts[0]).trim().toLowerCase();
      if (!key || !FIELDS.includes(key)) continue;
      const value = parts.slice(1).map(p => String(p == null ? '' : p).trim()).filter(Boolean).join(' ');
      if (value && !Object.prototype.hasOwnProperty.call(meta, key)) {
        meta[key] = value;
      }
    }
    // Normalise: prefer 'venue' over 'track' but keep both if present
    const track = meta.venue || meta.track || '';
    const rider = meta.rider || meta.driver || '';
    const vehicle = meta.vehicle || meta.bike || meta.car || '';
    return { track, rider, vehicle, date: meta.date || '', session: meta.session || '', event: meta.event || '' };
  }

  // Returns a promise that resolves to the stored entry if a file with the same
  // hash already exists (but different name), or null otherwise.
  function findDuplicateByHash(hash) {
    return getAllFilesFromDB().then((entries) => {
      return entries.find(e => e.hash && e.hash === hash) || null;
    });
  }

  // Upserts by filename: an existing record keeps its id and its session links, so
  // re-opening a file never detaches it from the sessions it belongs to.
  function storeFileInDB(name, text, hash, fileMeta) {
    if (!sessionsFiles) return Promise.resolve();
    return sessionsFiles.storeFile(
      name,
      text,
      hash || computeFileHash(text),
      fileMeta || extractCsvFileMetadata(text)
    ).then(() => {
      renderStoredFilesList();
      renderPickerList();
      maybeAutoRequestStoragePersistence();
    }).catch(() => { /* storage failure -- continue silently */ });
  }

  // Takes a record id (not a filename): deleteFile also scrubs the file out of any
  // session that listed it.
  function removeFileFromDB(fileId) {
    if (!sessionsFiles) return Promise.resolve();
    return sessionsFiles.deleteFile(fileId).then(() => {
      renderStoredFilesList();
      renderPickerList();
    }).catch(() => {});
  }

  function getAllFilesFromDB() {
    if (!sessionsFiles) return Promise.resolve([]);
    return sessionsFiles.listFiles().catch(() => []);
  }

  function getFileEntryByName(name) {
    if (!sessionsFiles) return Promise.resolve(null);
    return sessionsFiles.getFileByName(name).then((entry) => entry || null).catch(() => null);
  }

  // Persists (or, when config is null, clears) the custom importer config -- channel
  // mapping, filters, downsample rate -- for a stored file, so it's reapplied
  // automatically the next time that file is loaded (see applySavedImporterConfigToLog).
  function saveImporterConfigForFile(name, decoderName, config) {
    if (!sessionsFiles) return Promise.resolve();
    return getFileEntryByName(name).then((entry) => {
      if (!entry) return null;
      return sessionsFiles.saveImporterConfig(entry.id, decoderName, config);
    }).catch(() => {});
  }

  function clearAllFilesFromDB() {
    if (!sessionsApi) return Promise.resolve();
    return sessionsApi.storage.files.clear().then(() => {
      renderStoredFilesList();
      renderPickerList();
    }).catch(() => {});
  }

  function setStoredFilesStatus(message, isError) {
    if (!storedFilesStatus) return;
    storedFilesStatus.textContent = message;
    storedFilesStatus.classList.toggle('is-error', !!isError);
  }

  // ── Persistent storage ──────────────────────────────────────────────────
  // Browsers treat IndexedDB/localStorage as "best-effort" by default: Safari can drop
  // a site's storage after about a week of no visits, and Chrome/Edge can evict it under
  // disk pressure. navigator.storage.persist() asks the browser to exempt this origin
  // from that -- it's a request, not a guarantee (Chrome/Edge decide silently by
  // engagement heuristics; Firefox shows the user a prompt; Safari 15.2+ supports it but
  // is stricter for a site that isn't added to the home screen). Download All Data
  // remains the reliable backup regardless of whether this is granted.
  const STORAGE_PERSIST_ASKED_KEY = 'storagePersistAsked';

  function formatStorageBytes(n) {
    if (!Number.isFinite(n)) return '';
    if (n < 1024) return `${n} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = n / 1024;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
    return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
  }

  // Reads and displays the current persisted/estimate state. Returns a promise of
  // whether storage is persisted (null if the API isn't available).
  function refreshStoragePersistence() {
    if (!storagePersistStatus) return Promise.resolve(null);
    const storage = navigator.storage;
    if (!storage || typeof storage.persisted !== 'function') {
      storagePersistStatus.textContent = 'Permanent storage is not supported in this browser -- use Download All Data above for backups.';
      storagePersistStatus.classList.remove('is-error');
      if (requestPersistBtn) requestPersistBtn.hidden = true;
      return Promise.resolve(null);
    }
    return storage.persisted().then((granted) => {
      const estimateP = typeof storage.estimate === 'function' ? storage.estimate().catch(() => null) : Promise.resolve(null);
      return estimateP.then((estimate) => {
        const usedText = estimate && Number.isFinite(estimate.usage) ? ` (${formatStorageBytes(estimate.usage)} used)` : '';
        if (granted) {
          storagePersistStatus.textContent = `Permanent storage: granted${usedText}. The browser should not clear this data automatically.`;
          storagePersistStatus.classList.remove('is-error');
          if (requestPersistBtn) requestPersistBtn.hidden = true;
        } else {
          storagePersistStatus.textContent = `Permanent storage: not granted${usedText}. The browser may clear this data when it needs `
            + 'space or after a period of no use -- use Download All Data above to keep a copy.';
          storagePersistStatus.classList.remove('is-error');
          if (requestPersistBtn) requestPersistBtn.hidden = false;
        }
        return granted;
      });
    }).catch(() => null);
  }

  // Asks the browser to persist this origin's storage, then refreshes the status. Used
  // by both the manual button and the one-time auto-request after the first file is
  // stored (see storeFileInDB).
  function requestStoragePersistence() {
    const storage = navigator.storage;
    if (!storage || typeof storage.persist !== 'function') return Promise.resolve(false);
    if (requestPersistBtn) requestPersistBtn.disabled = true;
    return storage.persist().then((granted) => {
      if (requestPersistBtn) requestPersistBtn.disabled = false;
      // Granted: let refreshStoragePersistence show the normal "granted" status (and hide
      // the button). Declined: show the decline note directly -- refreshing here would
      // just overwrite it with the plain "not granted" text refreshStoragePersistence
      // already showed before this request was ever made.
      if (granted) return refreshStoragePersistence().then(() => granted);
      if (storagePersistStatus) {
        storagePersistStatus.textContent = 'The browser declined the request -- it usually grants this once you use the site regularly, '
          + 'or if you install or bookmark it. Use Download All Data above to keep a copy meanwhile.';
        storagePersistStatus.classList.add('is-error');
      }
      if (requestPersistBtn) requestPersistBtn.hidden = false;
      return granted;
    }).catch(() => {
      if (requestPersistBtn) requestPersistBtn.disabled = false;
      return false;
    });
  }

  // Fires once, right after the first file this session is actually stored -- a
  // user-driven moment (rather than on page load) so a Firefox permission prompt isn't a
  // surprise on every visit. The button in the User panel covers manual retries after
  // that (e.g. once the browser's engagement heuristics have had a chance to warm up).
  function maybeAutoRequestStoragePersistence() {
    let already = true;
    try { already = localStorage.getItem(STORAGE_PERSIST_ASKED_KEY) === '1'; } catch (e) { /* assume asked */ }
    if (already) return;
    try { localStorage.setItem(STORAGE_PERSIST_ASKED_KEY, '1'); } catch (e) { /* best effort */ }
    requestStoragePersistence();
  }

  function renderStoredFilesList() {
    if (!storedFilesList) return;
    getAllFilesFromDB().then((entries) => {
      storedFilesList.innerHTML = '';
      if (entries.length === 0) {
        const hint = document.createElement('p');
        hint.className = 'settings-io-hint';
        hint.textContent = 'No stored files.';
        storedFilesList.appendChild(hint);
        return;
      }
      entries.forEach((entry) => {
        const row = document.createElement('div');
        row.className = 'stored-file-row';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'stored-file-name';
        nameSpan.textContent = entry.name;
        nameSpan.title = `Stored: ${entry.storedAt || ''}`;
        // No Load button here: loading a stored file lives in "Pick Uploaded Data". This
        // list is only for managing (deleting) what's stored.
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'stored-file-remove-btn';
        removeBtn.textContent = '✕';
        removeBtn.title = 'Remove from browser storage';
        removeBtn.addEventListener('click', () => {
          // Permanent, and it also detaches the file from any session that lists it, so
          // ask first rather than deleting on a single (possibly accidental) tap.
          const ok = window.confirm(
            `Delete "${entry.name}" from browser storage?\n\n`
            + 'It will also be removed from any sessions it is attached to. This cannot be undone.'
          );
          if (!ok) return;
          removeFileFromDB(entry.id);
          setStoredFilesStatus(`Removed "${entry.name}" from storage.`);
        });
        row.appendChild(nameSpan);
        row.appendChild(removeBtn);
        storedFilesList.appendChild(row);
      });
    });
  }

  function loadStoredFilesIntoPlotter() {
    getAllFilesFromDB().then((entries) => {
      if (entries.length === 0) return;
      const alreadyLoaded = new Set(logs.map(l => l.name));
      entries.forEach((entry) => {
        if (alreadyLoaded.has(entry.name) || isSimChannelsRecord(entry)) return;
        const blob = new Blob([entry.text], { type: 'text/plain' });
        const file = new File([blob], entry.name, { type: 'text/plain' });
        parseFile(file, /* skipStore */ true);
      });
    });
  }

  // ── Pick Uploaded Data modal ──────────────────────────────────────────────

  // 'files' (unchanged default), 'sessions', or 'events' -- picking one of the latter two
  // loads every file linked to that session/event at once, instead of one CSV at a time.
  let pickUploadedActiveTab = 'files';

  function setPickUploadedTab(tab) {
    pickUploadedActiveTab = tab;
    pickUploadedTabButtons.forEach((btn) => {
      const isActive = btn.dataset.pickTab === tab;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (pickUploadedFileControls) pickUploadedFileControls.hidden = tab !== 'files';
    renderPickerList();
  }

  function openPickerModal() {
    if (!pickUploadedModal) return;
    pickUploadedModal.hidden = false;
    setPickUploadedTab('files');
    if (pickUploadedSearch) pickUploadedSearch.focus();
  }

  function closePickerModal() {
    if (!pickUploadedModal) return;
    pickUploadedModal.hidden = true;
  }

  // Loads every stored file behind the given File.id list into the plotter (skipping
  // ones already loaded), the same way the per-file "Load" button in the Files tab does.
  function loadStoredFileRecordsIntoPlotter(fileIds) {
    if (!sessionsFiles || !fileIds || !fileIds.length) return Promise.resolve(0);
    const alreadyLoaded = new Set(logs.map((l) => l.name));
    return Promise.all(fileIds.map((id) => sessionsFiles.getFile(id))).then((records) => {
      let loadedCount = 0;
      records.forEach((record) => {
        if (!record || !record.text || alreadyLoaded.has(record.name) || isSimChannelsRecord(record)) return;
        const blob = new Blob([record.text], { type: 'text/plain' });
        const file = new File([blob], record.name, { type: 'text/plain' });
        parseFile(file, /* skipStore */ true);
        loadedCount += 1;
      });
      return loadedCount;
    });
  }

  function renderPickerList() {
    if (!pickUploadedList) return;
    if (pickUploadedActiveTab === 'sessions') { renderPickerSessionsList(); return; }
    if (pickUploadedActiveTab === 'events') { renderPickerEventsList(); return; }
    const sortBy = pickUploadedSortSelect ? pickUploadedSortSelect.value : 'date';
    const filter = pickUploadedSearch ? pickUploadedSearch.value.trim().toLowerCase() : '';

    getAllFilesFromDB().then((allEntries) => {
      // Saved simulated-channel files ride along with their source log; they aren't logs.
      const entries = allEntries.filter((e) => !isSimChannelsRecord(e));
      pickUploadedList.innerHTML = '';
      if (entries.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'pick-uploaded-empty';
        empty.textContent = 'No stored files. Upload a CSV file to get started.';
        pickUploadedList.appendChild(empty);
        return;
      }

      let filtered = entries;
      if (filter) {
        filtered = entries.filter((e) => {
          const fm = e.fileMeta || {};
          return [e.name, fm.track, fm.rider, fm.vehicle, fm.event, fm.session]
            .filter(Boolean).join(' ').toLowerCase().includes(filter);
        });
      }

      const sorted = filtered.slice().sort((a, b) => {
        const fa = a.fileMeta || {};
        const fb = b.fileMeta || {};
        switch (sortBy) {
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          case 'track':
            return (fa.track || '').localeCompare(fb.track || '') || (a.name || '').localeCompare(b.name || '');
          case 'rider':
            return (fa.rider || '').localeCompare(fb.rider || '') || (a.name || '').localeCompare(b.name || '');
          case 'vehicle':
            return (fa.vehicle || '').localeCompare(fb.vehicle || '') || (a.name || '').localeCompare(b.name || '');
          default: // 'date' -- newest first
            return (b.storedAt || '').localeCompare(a.storedAt || '');
        }
      });

      if (sorted.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'pick-uploaded-empty';
        empty.textContent = 'No files match that filter.';
        pickUploadedList.appendChild(empty);
        return;
      }

      sorted.forEach((entry) => {
        const fm = entry.fileMeta || {};
        const tags = [fm.track, fm.rider, fm.vehicle, fm.event, fm.session]
          .filter(Boolean).join(' · ');
        const storedDate = entry.storedAt ? new Date(entry.storedAt).toLocaleDateString() : '';

        const item = document.createElement('div');
        item.className = 'pick-uploaded-item';

        const metaDiv = document.createElement('div');
        metaDiv.className = 'pick-uploaded-item-meta';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'pick-uploaded-item-name';
        nameDiv.textContent = entry.name;
        nameDiv.title = entry.name;
        metaDiv.appendChild(nameDiv);

        if (tags || storedDate) {
          const tagsDiv = document.createElement('div');
          tagsDiv.className = 'pick-uploaded-item-tags';
          tagsDiv.textContent = [tags, storedDate ? `Stored ${storedDate}` : ''].filter(Boolean).join('  ·  ');
          metaDiv.appendChild(tagsDiv);
        }

        const actions = document.createElement('div');
        actions.className = 'pick-uploaded-item-actions';

        const loadBtn = document.createElement('button');
        loadBtn.type = 'button';
        loadBtn.className = 'pick-uploaded-item-load-btn';
        loadBtn.textContent = 'Load';
        loadBtn.title = 'Load this file into the plotter';
        loadBtn.addEventListener('click', () => {
          const blob = new Blob([entry.text], { type: 'text/plain' });
          const file = new File([blob], entry.name, { type: 'text/plain' });
          parseFile(file, /* skipStore */ true);
          closePickerModal();
        });

        // Deliberately no delete button here: it sat right next to Load and was too easy
        // to hit by accident. Removing a stored file lives under User data instead.
        actions.appendChild(loadBtn);
        item.appendChild(metaDiv);
        item.appendChild(actions);
        pickUploadedList.appendChild(item);
      });
    });
  }

  // Builds one pick-uploaded-item row with a single "Load All Files" action, shared by
  // the Sessions and Events tabs below.
  function buildPickUploadedGroupItem(title, subtitle, fileIds) {
    const item = document.createElement('div');
    item.className = 'pick-uploaded-item';

    const metaDiv = document.createElement('div');
    metaDiv.className = 'pick-uploaded-item-meta';
    const nameDiv = document.createElement('div');
    nameDiv.className = 'pick-uploaded-item-name';
    nameDiv.textContent = title;
    nameDiv.title = title;
    metaDiv.appendChild(nameDiv);
    if (subtitle) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'pick-uploaded-item-tags';
      tagsDiv.textContent = subtitle;
      metaDiv.appendChild(tagsDiv);
    }

    const actions = document.createElement('div');
    actions.className = 'pick-uploaded-item-actions';
    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'pick-uploaded-item-load-btn';
    loadBtn.textContent = fileIds.length === 1 ? 'Load File' : `Load All Files (${fileIds.length})`;
    loadBtn.title = 'Load every file linked to this into the plotter';
    loadBtn.disabled = fileIds.length === 0;
    loadBtn.addEventListener('click', () => {
      loadBtn.disabled = true;
      loadStoredFileRecordsIntoPlotter(fileIds).then((loadedCount) => {
        setStoredFilesStatus(
          loadedCount ? `Loaded ${loadedCount} file(s).` : 'Those files are already loaded, or not stored in this browser.'
        );
        closePickerModal();
      });
    });
    actions.appendChild(loadBtn);
    item.appendChild(metaDiv);
    item.appendChild(actions);
    return item;
  }

  function renderPickerSessionsList() {
    if (!pickUploadedList || !sessionsApi) return;
    const filter = pickUploadedSearch ? pickUploadedSearch.value.trim().toLowerCase() : '';
    sessionsApi.SessionService.listSessions().then((sessions) => {
      pickUploadedList.innerHTML = '';
      const filtered = filter
        ? sessions.filter((s) => (s.name || '').toLowerCase().includes(filter) || (s.location || '').toLowerCase().includes(filter))
        : sessions;
      if (!filtered.length) {
        const empty = document.createElement('div');
        empty.className = 'pick-uploaded-empty';
        empty.textContent = sessions.length ? 'No sessions match that filter.' : 'No sessions yet -- use Add to Session on a file first.';
        pickUploadedList.appendChild(empty);
        return;
      }
      filtered.forEach((session) => {
        const when = session.start_time ? new Date(session.start_time).toLocaleDateString() : '';
        const subtitle = [session.location, when ? `Started ${when}` : '', `${session.file_ids.length} file(s)`]
          .filter(Boolean).join('  ·  ');
        pickUploadedList.appendChild(buildPickUploadedGroupItem(session.name, subtitle, session.file_ids));
      });
    });
  }

  function renderPickerEventsList() {
    if (!pickUploadedList || !sessionsApi) return;
    const filter = pickUploadedSearch ? pickUploadedSearch.value.trim().toLowerCase() : '';
    Promise.all([sessionsApi.EventService.listEvents(), sessionsApi.SessionService.listSessions()]).then(([events, sessions]) => {
      pickUploadedList.innerHTML = '';
      const filtered = filter ? events.filter((e) => (e.name || '').toLowerCase().includes(filter)) : events;
      if (!filtered.length) {
        const empty = document.createElement('div');
        empty.className = 'pick-uploaded-empty';
        empty.textContent = events.length ? 'No events match that filter.' : 'No events yet -- assign a session to one in the Sessions panel first.';
        pickUploadedList.appendChild(empty);
        return;
      }
      filtered.forEach((event) => {
        const eventSessions = sessions.filter((s) => s.event_id === event.id);
        const fileIds = Array.from(new Set(eventSessions.reduce((all, s) => all.concat(s.file_ids), [])));
        const subtitle = [event.location, `${eventSessions.length} session(s)`, `${fileIds.length} file(s)`]
          .filter(Boolean).join('  ·  ');
        pickUploadedList.appendChild(buildPickUploadedGroupItem(event.name, subtitle, fileIds));
      });
    });
  }

  pickUploadedTabButtons.forEach((btn) => {
    btn.addEventListener('click', () => setPickUploadedTab(btn.dataset.pickTab));
  });

  if (pickUploadedDataBtn) {
    pickUploadedDataBtn.addEventListener('click', openPickerModal);
  }
  if (pickUploadedCloseBtn) {
    pickUploadedCloseBtn.addEventListener('click', closePickerModal);
  }
  if (pickUploadedModal) {
    const backdrop = pickUploadedModal.querySelector('.pick-uploaded-backdrop');
    if (backdrop) backdrop.addEventListener('click', closePickerModal);
    pickUploadedModal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePickerModal();
    });
  }
  if (pickUploadedSortSelect) {
    pickUploadedSortSelect.addEventListener('change', renderPickerList);
  }
  if (pickUploadedSearch) {
    pickUploadedSearch.addEventListener('input', renderPickerList);
  }

  // Builds the same backup ZIP bytes Download All Data writes to disk, without triggering
  // the download itself -- shared by the local download path and Backup All Data to Drive.
  function buildAllDataZipBlob() {
    // The sessions bundle (sessions, notes, vehicles, riders, setups, users, media refs)
    // rides along inside the same manifest, so one Download All Data still captures
    // everything. Bumped to version 3 for that key; v1/v2 backups still restore.
    const sessionsBundlePromise = sessionsApi
      ? sessionsApi.ExportService.exportAll(false).catch(() => null)
      : Promise.resolve(null);

    return Promise.all([getAllFilesFromDB(), sessionsBundlePromise]).then((results) => {
      const entries = results[0];
      const sessionsBundle = results[1];
      const settings = {};
      SETTINGS_STORAGE_KEYS.forEach((key) => {
        const value = readSettingValue(key);
        if (value !== undefined) settings[key] = value;
      });
      const plotterVersion = appVersionLabel ? appVersionLabel.textContent.replace(/^Version\s*/i, '').trim() : '';

      // manifest.json references file names only — the actual CSV content lives in
      // separate files inside the ZIP rather than being inlined in the JSON.
      const manifest = {
        app: 'csv-plotter-backup',
        version: 3,
        plotterVersion,
        exportedAt: new Date().toISOString(),
        // `id` carries the stored record's UUID so session links survive the round trip
        // even if the same filename is later reused for different content.
        files: entries.map(e => ({ name: e.name, id: e.id || '', storedAt: e.storedAt || '' })),
        settings
      };
      if (sessionsBundle) manifest.sessions = sessionsBundle;

      const zipEntries = [
        { name: 'manifest.json', data: JSON.stringify(manifest, null, 2) },
        ...entries.map(e => ({ name: e.name, data: e.text || '' }))
      ];

      return buildZip(zipEntries);
    });
  }

  function downloadAllData() {
    buildAllDataZipBlob().then((zipBytes) => {
      triggerZipDownload(zipBytes, 'csv-plotter-backup');
      setStoredFilesStatus('Backup downloaded.');
    });
  }

  function restoreFromBackup(file) {
    if (typeof file.arrayBuffer !== 'function' && typeof file.text !== 'function') {
      setStoredFilesStatus('This browser cannot read that file.', true);
      return;
    }

    // Shared finalise step used by both ZIP and JSON restore paths.
    function applyBackup(parsed, fileEntries) {
      // fileEntries: Array<{ name, text }>
      const storePromises = fileEntries.map((entry) => {
        if (!entry.name || typeof entry.text !== 'string') return Promise.resolve();
        return storeFileInDB(entry.name, entry.text).then(() => {
          const alreadyLoaded = new Set(logs.map(l => l.name));
          if (!alreadyLoaded.has(entry.name) && !String(entry.name).endsWith(" - sim channels.csv")) {
            const blob = new Blob([entry.text], { type: 'text/plain' });
            const fileObj = new File([blob], entry.name, { type: 'text/plain' });
            parseFile(fileObj, /* skipStore */ true);
          }
        });
      });
      Promise.all(storePromises).then(() => {
        // Sessions are imported after the files are stored, so the bundle's file
        // references resolve onto the records just written (matched by filename) instead
        // of landing as metadata-only rows. Absent in v1/v2 backups, which skip this.
        const sessionsBundle = parsed && parsed.sessions;
        if (!sessionsApi || !sessionsBundle) return null;
        return sessionsApi.ExportService
          .importAll(sessionsBundle, { overwriteMatchingIds: true })
          .then((result) => result)
          .catch(() => null);
      }).then((sessionsResult) => {
        const sessionsSummary = (sessionsResult && sessionsResult.ok)
          ? `, ${sessionsResult.counts.sessions || 0} session(s)`
          : '';
        if (parsed && parsed.settings && typeof parsed.settings === 'object') {
          let applied = 0;
          SETTINGS_STORAGE_KEYS.forEach((key) => {
            if (!(key in parsed.settings)) return;
            try { if (writeSettingValue(key, parsed.settings[key])) applied += 1; } catch {}
          });
          if (applied > 0) {
            setStoredFilesStatus(`Restored ${fileEntries.length} file(s)${sessionsSummary} and ${applied} setting(s). Reloading...`);
            setTimeout(() => location.reload(), 800);
            return;
          }
        }
        setStoredFilesStatus(`Restored ${fileEntries.length} file(s)${sessionsSummary}.`);
        renderStoredFilesList();
        if (typeof renderSessionsPanel === 'function') renderSessionsPanel();
      });
    }

    // ── ZIP backup (version 2+) ──────────────────────────────────────────────
    if (/\.zip$/i.test(file.name || '')) {
      (typeof file.arrayBuffer === 'function' ? file.arrayBuffer() : Promise.reject())
        .then((buffer) => {
          let zipFiles;
          try { zipFiles = readZip(buffer); } catch {
            setStoredFilesStatus('Could not read ZIP — file may be corrupt.', true);
            return;
          }
          const manifestBytes = zipFiles.get('manifest.json');
          if (!manifestBytes) {
            setStoredFilesStatus("That ZIP doesn't contain a csv-plotter manifest.", true);
            return;
          }
          let manifest;
          try { manifest = JSON.parse(new TextDecoder().decode(manifestBytes)); } catch {
            setStoredFilesStatus('manifest.json inside the ZIP is not valid JSON.', true);
            return;
          }
          if (!manifest || manifest.app !== 'csv-plotter-backup' || !Array.isArray(manifest.files)) {
            setStoredFilesStatus("That ZIP doesn't look like a csv-plotter backup.", true);
            return;
          }
          const dec = new TextDecoder();
          const fileEntries = manifest.files
            .map(ref => {
              const bytes = zipFiles.get(ref.name);
              if (!bytes) return null;
              return { name: ref.name, text: dec.decode(bytes) };
            })
            .filter(Boolean);
          applyBackup(manifest, fileEntries);
        }, () => {
          setStoredFilesStatus('Failed to read that ZIP file.', true);
        });
      return;
    }

    // ── Legacy JSON backup (version 1) ─────────────────────────────────────
    (typeof file.text === 'function' ? file.text() : Promise.reject())
      .then((text) => {
        let parsed;
        try { parsed = JSON.parse(text); } catch {
          setStoredFilesStatus('Could not read that file — not valid JSON.', true);
          return;
        }
        if (!parsed || parsed.app !== 'csv-plotter-backup' || !Array.isArray(parsed.files)) {
          setStoredFilesStatus("That file doesn't look like a csv-plotter backup.", true);
          return;
        }
        // v1 format: each file entry has { name, text, storedAt }
        const fileEntries = parsed.files.filter(e => e.name && typeof e.text === 'string');
        applyBackup(parsed, fileEntries);
      }, () => {
        setStoredFilesStatus('Failed to read that file.', true);
      });
  }

  if (loadAllStoredFilesBtn) {
    loadAllStoredFilesBtn.addEventListener('click', loadStoredFilesIntoPlotter);
  }
  if (downloadAllDataBtn) {
    downloadAllDataBtn.addEventListener('click', downloadAllData);
  }
  if (uploadDataBackupBtn && dataBackupFileInput) {
    uploadDataBackupBtn.addEventListener('click', () => dataBackupFileInput.click());
    dataBackupFileInput.addEventListener('change', () => {
      const f = dataBackupFileInput.files && dataBackupFileInput.files[0];
      dataBackupFileInput.value = '';
      if (f) restoreFromBackup(f);
    });
  }
  if (deleteAllStoredFilesBtn) {
    deleteAllStoredFilesBtn.addEventListener('click', () => {
      if (!confirm('Delete all stored files from browser storage? This cannot be undone.')) return;
      clearAllFilesFromDB();
      setStoredFilesStatus('All stored files deleted.');
    });
  }
  if (requestPersistBtn) requestPersistBtn.addEventListener('click', requestStoragePersistence);

  renderStoredFilesList();
  refreshStoragePersistence();
  renderSessionsPanel();

  if (xCustomSelect) {
    const checkedMode = document.querySelector('input[name=xaxis]:checked');
    xCustomSelect.disabled = !checkedMode || checkedMode.value !== 'custom';
  }
  if (mapColorSelect) {
    mapColorSelect.disabled = !(mapColorEnabledInput && mapColorEnabledInput.checked);
  }
  if (mapColorModeSelect) {
    mapColorModeSelect.disabled = !(mapColorEnabledInput && mapColorEnabledInput.checked);
  }

  setMapDisplayMode('none');
  syncShowMapDefault(false);
  applyMapColumnLayout(false);

  const PANEL7_FLAG_KEY = 'uiFlag7';
  const PANEL7_TARGET = 7;
  const PANEL7_TIMEOUT_MS = 1500;
  let panel7Count = 0;
  let panel7Timer = null;

  if (uiPanel7) {
    try {
      if (localStorage.getItem(PANEL7_FLAG_KEY) === '1') uiPanel7.hidden = false;
    } catch {}
  }

  if (appVersionLabel && uiPanel7) {
    appVersionLabel.style.userSelect = 'none';
    appVersionLabel.addEventListener('click', () => {
      if (!uiPanel7.hidden) {
        uiPanel7.hidden = true;
        try { localStorage.removeItem(PANEL7_FLAG_KEY); } catch {}
        panel7Count = 0;
        clearTimeout(panel7Timer);
        return;
      }

      clearTimeout(panel7Timer);
      panel7Count += 1;
      panel7Timer = setTimeout(() => { panel7Count = 0; }, PANEL7_TIMEOUT_MS);

      if (panel7Count >= PANEL7_TARGET) {
        panel7Count = 0;
        uiPanel7.hidden = false;
        try { localStorage.setItem(PANEL7_FLAG_KEY, '1'); } catch {}
      }
    });
  }

  // Math channel UI handlers
  function showMathChError(msg) {
    if (mathChError) { mathChError.textContent = msg; mathChError.hidden = false; }
  }

  function resetMathChForm() {
    mathChEditIdx = -1;
    if (mathChannelForm) mathChannelForm.hidden = true;
    if (mathChName) mathChName.value = '';
    if (mathChExpr) mathChExpr.value = '';
    if (mathChUnit) mathChUnit.value = '';
    if (mathChFilterEnabled) mathChFilterEnabled.checked = false;
    if (mathChFilterControls) mathChFilterControls.hidden = true;
    if (mathChFilterWindow) mathChFilterWindow.value = '0.5';
    if (mathChError) { mathChError.hidden = true; mathChError.textContent = ''; }
    if (mathChPreview) mathChPreview.hidden = true;
    if (mathChSave) mathChSave.textContent = 'Add Channel';
    if (mathChName) mathChName.disabled = false;
    if (addMathChannelBtn) addMathChannelBtn.disabled = false;
  }

  if (addMathChannelBtn) {
    addMathChannelBtn.addEventListener('click', () => {
      if (mathChannelForm) mathChannelForm.hidden = false;
      if (mathChFilterAxis) populateAxisChannelSelect(mathChFilterAxis);
      if (mathChName) mathChName.focus();
      addMathChannelBtn.disabled = true;
    });
  }

  if (mathChCancel) {
    mathChCancel.addEventListener('click', resetMathChForm);
  }

  if (mathChFilterEnabled) {
    mathChFilterEnabled.addEventListener('change', () => {
      if (mathChFilterControls) mathChFilterControls.hidden = !mathChFilterEnabled.checked;
      if (mathChFilterEnabled.checked && mathChFilterAxis) populateAxisChannelSelect(mathChFilterAxis);
    });
  }

  if (mathChSave) {
    mathChSave.addEventListener('click', () => {
      const name = mathChName ? mathChName.value.trim() : '';
      const expression = mathChExpr ? mathChExpr.value.trim() : '';
      const unit = mathChUnit ? mathChUnit.value.trim() : '';

      if (!name) return showMathChError('Name is required.');
      if (!expression) return showMathChError('Expression is required.');

      const isEditing = mathChEditIdx >= 0 && mathChEditIdx < mathChannels.length;
      const editingOldName = isEditing ? mathChannels[mathChEditIdx].name : null;

      if (mathChannels.some((mc, i) => mc.name === name && i !== mathChEditIdx))
        return showMathChError(`"${name}" already exists.`);
      const existingCols = new Set();
      logs.forEach(l => l.cols.forEach(c => existingCols.add(c)));
      if (existingCols.has(name) && name !== editingOldName)
        return showMathChError(`"${name}" conflicts with an existing column.`);

      const testResult = testMathChannelExpression(expression);
      if (!testResult.valid) return showMathChError(testResult.error);

      const mc = { name, expression, unit };
      if (mathChFilterEnabled && mathChFilterEnabled.checked) {
        const w = parseFloat(mathChFilterWindow ? mathChFilterWindow.value : '');
        const axisChannel = mathChFilterAxis ? mathChFilterAxis.value : 'time';
        if (!Number.isFinite(w) || w <= 0) return showMathChError('Filter window must be a positive number.');
        mc.smoothing = { window: w, axisChannel: axisChannel || 'time' };
      }

      if (isEditing) {
        // Remove old column data from all logs before re-applying with new definition
        if (editingOldName && editingOldName !== name) {
          logs.forEach(log => {
            const ci = log.cols.indexOf(editingOldName);
            if (ci >= 0) log.cols.splice(ci, 1);
            log.data.forEach(row => { delete row[editingOldName]; });
            if (log.meta.units) delete log.meta.units[editingOldName];
          });
        }
        mathChannels[mathChEditIdx] = mc;
      } else {
        mathChannels.push(mc);
      }
      saveMathChannels();
      logs.forEach(log => applyMathChannelToLog(mc, log));
      renderMathChannelsList();
      populateYSelect();
      populateXCustomSelect();
      populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
      updatePlot();
      resetMathChForm();
    });
  }

  if (mathChannelsList) {
    mathChannelsList.addEventListener('click', ev => {
      const editBtn = ev.target.closest('.math-ch-edit');
      if (editBtn) {
        const idx = Number(editBtn.dataset.idx);
        if (!Number.isFinite(idx) || idx < 0 || idx >= mathChannels.length) return;
        const mc = mathChannels[idx];
        mathChEditIdx = idx;
        if (mathChName) { mathChName.value = mc.name; mathChName.disabled = true; }
        if (mathChExpr) mathChExpr.value = mc.expression;
        if (mathChUnit) mathChUnit.value = mc.unit || '';
        if (mathChFilterAxis) populateAxisChannelSelect(mathChFilterAxis);
        if (mc.smoothing && mc.smoothing.window > 0) {
          if (mathChFilterEnabled) mathChFilterEnabled.checked = true;
          if (mathChFilterControls) mathChFilterControls.hidden = false;
          if (mathChFilterAxis) mathChFilterAxis.value = mc.smoothing.axisChannel || 'time';
          if (mathChFilterWindow) mathChFilterWindow.value = mc.smoothing.window;
        } else {
          if (mathChFilterEnabled) mathChFilterEnabled.checked = false;
          if (mathChFilterControls) mathChFilterControls.hidden = true;
        }
        if (mathChError) { mathChError.hidden = true; mathChError.textContent = ''; }
        if (mathChPreview) mathChPreview.hidden = true;
        if (mathChSave) mathChSave.textContent = 'Save Changes';
        if (mathChannelForm) mathChannelForm.hidden = false;
        if (addMathChannelBtn) addMathChannelBtn.disabled = true;
        if (mathChExpr) mathChExpr.focus();
        return;
      }

      const btn = ev.target.closest('.math-ch-delete');
      if (!btn) return;
      const idx = Number(btn.dataset.idx);
      if (!Number.isFinite(idx) || idx < 0 || idx >= mathChannels.length) return;
      const removed = mathChannels.splice(idx, 1)[0];
      saveMathChannels();
      logs.forEach(log => {
        const ci = log.cols.indexOf(removed.name);
        if (ci >= 0) log.cols.splice(ci, 1);
        log.data.forEach(row => { delete row[removed.name]; });
        if (log.meta.units) delete log.meta.units[removed.name];
      });
      renderMathChannelsList();
      populateYSelect();
      populateXCustomSelect();
      populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
      updatePlot();
    });
  }

  // Expression autocomplete
  if (mathChExpr && mathChSuggestions) {
    mathChExpr.addEventListener('input', () => {
      const val = mathChExpr.value;
      const pos = mathChExpr.selectionStart;
      const before = val.slice(0, pos);
      const openBrace = before.lastIndexOf('{');
      if (openBrace < 0 || before.slice(openBrace).includes('}')) {
        hideMathChSuggestions(); return;
      }
      const partial = before.slice(openBrace + 1).toLowerCase();
      const matches = getMathChAvailableChannels().filter(c => c.toLowerCase().includes(partial));
      if (matches.length === 0) { hideMathChSuggestions(); return; }
      mathChSuggestions.dataset.openBrace = openBrace;
      mathChSuggestions.dataset.cursor = pos;
      mathChActiveSuggIdx = -1;
      mathChSuggestions.innerHTML = matches
        .map(m => `<div class="math-ch-suggestion" data-name="${escapeHtml(m)}">${escapeHtml(m)}</div>`)
        .join('');
      mathChSuggestions.hidden = false;
    });

    let mathChPreviewTimer = null;
    mathChExpr.addEventListener('input', () => {
      clearTimeout(mathChPreviewTimer);
      if (!mathChPreview) return;
      const expr = mathChExpr.value.trim();
      if (!expr) { mathChPreview.hidden = true; return; }
      mathChPreviewTimer = setTimeout(() => {
        const result = testMathChannelExpression(expr);
        if (result.error) {
          mathChPreview.textContent = result.error;
          mathChPreview.className = 'math-ch-preview math-ch-preview-error';
        } else if (result.sampleValue !== null) {
          mathChPreview.textContent = `✓ Sample value: ${+result.sampleValue.toPrecision(5)}`;
          mathChPreview.className = 'math-ch-preview math-ch-preview-ok';
        } else {
          mathChPreview.textContent = 'Syntax OK — load a file to validate values';
          mathChPreview.className = 'math-ch-preview math-ch-preview-neutral';
        }
        mathChPreview.hidden = false;
      }, 300);
    });

    mathChExpr.addEventListener('keydown', ev => {
      if (!mathChSuggestions || mathChSuggestions.hidden) return;
      const items = mathChSuggestions.querySelectorAll('.math-ch-suggestion');
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        mathChActiveSuggIdx = Math.min(mathChActiveSuggIdx + 1, items.length - 1);
        items.forEach((el, i) => el.classList.toggle('active', i === mathChActiveSuggIdx));
        if (items[mathChActiveSuggIdx]) items[mathChActiveSuggIdx].scrollIntoView({ block: 'nearest' });
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        mathChActiveSuggIdx = Math.max(mathChActiveSuggIdx - 1, 0);
        items.forEach((el, i) => el.classList.toggle('active', i === mathChActiveSuggIdx));
        if (items[mathChActiveSuggIdx]) items[mathChActiveSuggIdx].scrollIntoView({ block: 'nearest' });
      } else if (ev.key === 'Enter' && mathChActiveSuggIdx >= 0) {
        ev.preventDefault();
        const active = items[mathChActiveSuggIdx];
        if (active) applyMathChSuggestion(active.dataset.name);
      } else if (ev.key === 'Escape') {
        hideMathChSuggestions();
      }
    });

    mathChExpr.addEventListener('blur', () => setTimeout(hideMathChSuggestions, 150));

    mathChSuggestions.addEventListener('mousedown', ev => {
      const item = ev.target.closest('.math-ch-suggestion');
      if (!item) return;
      ev.preventDefault();
      applyMathChSuggestion(item.dataset.name);
    });
  }

  // Data Filters event handlers

  function showDataFilterError(msg) {
    if (dataFilterError) { dataFilterError.textContent = msg; dataFilterError.hidden = false; }
  }

  function resetDataFilterForm() {
    dataFilterEditIdx = -1;
    if (dataFilterForm) dataFilterForm.hidden = true;
    if (dataFilterMinInput) dataFilterMinInput.value = '';
    if (dataFilterMaxInput) dataFilterMaxInput.value = '';
    if (dataFilterValuesSelect) dataFilterValuesSelect.innerHTML = '';
    if (dataFilterRangeField) dataFilterRangeField.hidden = false;
    if (dataFilterDiscreteField) dataFilterDiscreteField.hidden = true;
    if (dataFilterError) { dataFilterError.hidden = true; dataFilterError.textContent = ''; }
    if (dataFilterRangeHint) dataFilterRangeHint.textContent = '';
    if (dataFilterSaveBtn) dataFilterSaveBtn.textContent = 'Add Filter';
    if (addDataFilterBtn) addDataFilterBtn.disabled = false;
  }

  if (addDataFilterBtn) {
    addDataFilterBtn.addEventListener('click', () => {
      populateDataFilterChannelSelect();
      updateDataFilterFormForChannel();
      if (dataFilterForm) dataFilterForm.hidden = false;
      addDataFilterBtn.disabled = true;
      if (dataFilterChannelSelect) dataFilterChannelSelect.focus();
    });
  }

  if (dataFilterChannelSelect) dataFilterChannelSelect.addEventListener('change', updateDataFilterFormForChannel);
  if (dataFilterModeRangeInput) dataFilterModeRangeInput.addEventListener('change', handleDataFilterModeToggleChange);
  if (dataFilterModeDiscreteInput) dataFilterModeDiscreteInput.addEventListener('change', handleDataFilterModeToggleChange);

  if (dataFilterCancelBtn) dataFilterCancelBtn.addEventListener('click', resetDataFilterForm);

  if (dataFilterSaveBtn) {
    dataFilterSaveBtn.addEventListener('click', () => {
      const channel = dataFilterChannelSelect ? dataFilterChannelSelect.value : '';
      if (!channel) return showDataFilterError('Channel is required.');

      const isEditing = dataFilterEditIdx >= 0 && dataFilterEditIdx < dataFilters.length;
      const enabled = isEditing ? dataFilters[dataFilterEditIdx].enabled : true;
      const classification = computeDataFilterChannelClassification(channel);
      let filter;

      // Whichever field is actually visible reflects the user's choice, including an
      // ambiguous numeric channel manually toggled to Range -- not just the raw
      // auto-classification (see updateDataFilterFormForChannel).
      const isDiscreteMode = dataFilterDiscreteField
        ? !dataFilterDiscreteField.hidden
        : !!(classification && classification.kind === 'discrete');

      if (isDiscreteMode && classification) {
        const selected = dataFilterValuesSelect ? Array.from(dataFilterValuesSelect.selectedOptions).map(o => o.value) : [];
        if (selected.length === 0) return showDataFilterError('Select at least one value.');
        const values = selected.map((raw) => classification.allNumeric ? Number(raw) : raw);
        filter = { channel, kind: 'discrete', values, allNumeric: classification.allNumeric, enabled };
      } else {
        const minRaw = dataFilterMinInput ? dataFilterMinInput.value.trim() : '';
        const maxRaw = dataFilterMaxInput ? dataFilterMaxInput.value.trim() : '';
        const min = minRaw === '' ? null : Number(minRaw);
        const max = maxRaw === '' ? null : Number(maxRaw);
        if (minRaw !== '' && !Number.isFinite(min)) return showDataFilterError('Min must be a number.');
        if (maxRaw !== '' && !Number.isFinite(max)) return showDataFilterError('Max must be a number.');
        if (min === null && max === null) return showDataFilterError('Enter a min, a max, or both.');
        if (min !== null && max !== null && min > max) return showDataFilterError('Min must be less than or equal to Max.');
        filter = { channel, kind: 'range', min, max, enabled };
      }

      if (isEditing) {
        dataFilters[dataFilterEditIdx] = filter;
      } else {
        dataFilters.push(filter);
      }
      saveDataFilters();
      renderDataFiltersList();
      updatePlot();
      resetDataFilterForm();
    });
  }

  if (dataFiltersList) {
    dataFiltersList.addEventListener('click', ev => {
      const editBtn = ev.target.closest('.data-filter-edit');
      if (editBtn) {
        const idx = Number(editBtn.dataset.idx);
        if (!Number.isFinite(idx) || idx < 0 || idx >= dataFilters.length) return;
        const f = dataFilters[idx];
        dataFilterEditIdx = idx;
        populateDataFilterChannelSelect();
        if (dataFilterChannelSelect) dataFilterChannelSelect.value = f.channel;
        updateDataFilterFormForChannel();
        // updateDataFilterFormForChannel() reclassifies against the currently loaded data and
        // defaults an ambiguous numeric channel's toggle to discrete -- override that default
        // to match what this saved filter actually is, so editing a range filter on such a
        // channel doesn't silently flip it to discrete.
        if (dataFilterModeToggle && !dataFilterModeToggle.hidden) {
          const wantDiscrete = f.kind === 'discrete';
          if (dataFilterModeRangeInput) dataFilterModeRangeInput.checked = !wantDiscrete;
          if (dataFilterModeDiscreteInput) dataFilterModeDiscreteInput.checked = wantDiscrete;
          handleDataFilterModeToggleChange();
        }
        if (f.kind === 'discrete' && dataFilterValuesSelect && !dataFilterDiscreteField.hidden) {
          const wanted = new Set((f.values || []).map((v) => String(v)));
          Array.from(dataFilterValuesSelect.options).forEach((opt) => { opt.selected = wanted.has(opt.value); });
        } else {
          if (dataFilterMinInput) dataFilterMinInput.value = (f.min === null || f.min === undefined) ? '' : f.min;
          if (dataFilterMaxInput) dataFilterMaxInput.value = (f.max === null || f.max === undefined) ? '' : f.max;
        }
        if (dataFilterError) { dataFilterError.hidden = true; dataFilterError.textContent = ''; }
        if (dataFilterSaveBtn) dataFilterSaveBtn.textContent = 'Save Changes';
        if (dataFilterForm) dataFilterForm.hidden = false;
        if (addDataFilterBtn) addDataFilterBtn.disabled = true;
        return;
      }

      const deleteBtn = ev.target.closest('.data-filter-delete');
      if (!deleteBtn) return;
      const idx = Number(deleteBtn.dataset.idx);
      if (!Number.isFinite(idx) || idx < 0 || idx >= dataFilters.length) return;
      dataFilters.splice(idx, 1);
      saveDataFilters();
      renderDataFiltersList();
      updatePlot();
    });

    dataFiltersList.addEventListener('change', ev => {
      if (!ev.target.matches('.data-filter-item-enabled')) return;
      const idx = Number(ev.target.dataset.idx);
      if (!Number.isFinite(idx) || idx < 0 || idx >= dataFilters.length) return;
      dataFilters[idx].enabled = ev.target.checked;
      saveDataFilters();
      renderDataFiltersList();
      updatePlot();
    });
  }

  if (dataFiltersEnabledInput) {
    dataFiltersEnabledInput.addEventListener('change', () => {
      syncDataFiltersEnabledVisual();
      saveDataFilters();
      updatePlot();
    });
  }

  // Temperature Profile Plots event handlers
  if (addTempProfileBtn) {
    addTempProfileBtn.addEventListener('click', () => openTempProfilePlotModal(null));
  }
  if (editTempProfileDefaultsBtn) {
    editTempProfileDefaultsBtn.addEventListener('click', () => openTempProfileDefaultsModal());
  }
  if (tempProfilePlotsList) {
    tempProfilePlotsList.addEventListener('click', (ev) => {
      const editBtn = ev.target.closest('.temp-profile-edit');
      if (editBtn) {
        const idx = Number(editBtn.dataset.idx);
        if (!Number.isFinite(idx) || idx < 0 || idx >= tempProfilePlots.length) return;
        openTempProfilePlotModal(tempProfilePlots[idx]);
        return;
      }
      const deleteBtn = ev.target.closest('.temp-profile-delete');
      if (!deleteBtn) return;
      const idx = Number(deleteBtn.dataset.idx);
      if (!Number.isFinite(idx) || idx < 0 || idx >= tempProfilePlots.length) return;
      tempProfilePlots.splice(idx, 1);
      saveTempProfilePlots();
      renderTempProfilePlotsList();
      updatePlot();
    });
    tempProfilePlotsList.addEventListener('change', (ev) => {
      if (!ev.target.matches('.temp-profile-item-enabled')) return;
      const idx = Number(ev.target.dataset.idx);
      if (!Number.isFinite(idx) || idx < 0 || idx >= tempProfilePlots.length) return;
      tempProfilePlots[idx].enabled = ev.target.checked;
      saveTempProfilePlots();
      renderTempProfilePlotsList();
      updatePlot();
    });
  }

  // Quick Modify event handlers

  if (quickModNegate) {
    quickModNegate.addEventListener('change', () => {
      quickModState.negate = quickModNegate.checked;
      if (quickModCreateBtn) quickModCreateBtn.disabled = !hasQuickModActive();
      updateQuickModPreview();
    });
  }

  if (quickModReciprocal) {
    quickModReciprocal.addEventListener('change', () => {
      quickModState.reciprocal = quickModReciprocal.checked;
      if (quickModCreateBtn) quickModCreateBtn.disabled = !hasQuickModActive();
      updateQuickModPreview();
    });
  }

  if (quickModFilter) {
    quickModFilter.addEventListener('change', () => {
      quickModState.filter = quickModFilter.checked;
      if (quickModFilterControls) quickModFilterControls.hidden = !quickModFilter.checked;
      if (quickModFilter.checked && quickModFilterAxis) populateAxisChannelSelect(quickModFilterAxis);
      if (quickModCreateBtn) quickModCreateBtn.disabled = !hasQuickModActive();
      updateQuickModPreview();
    });
  }

  if (quickModFilterWindow) {
    quickModFilterWindow.addEventListener('input', () => {
      const v = parseFloat(quickModFilterWindow.value);
      quickModState.filterWindow = Number.isFinite(v) && v > 0 ? v : 0.5;
      if (quickModState.filter) updateQuickModPreview();
    });
  }

  if (quickModFilterAxis) {
    quickModFilterAxis.addEventListener('change', () => {
      quickModState.filterAxis = quickModFilterAxis.value || 'time';
      if (quickModState.filter) updateQuickModPreview();
    });
  }

  if (quickModCreateBtn) {
    quickModCreateBtn.addEventListener('click', () => {
      const channel = quickModState.channel;
      if (!channel || !hasQuickModActive()) return;

      const expression = buildQuickModExpression(channel);
      const smoothing = buildQuickModSmoothing();
      const unit = getUnitForChannel(channel);

      // Generate a unique name
      const baseName = `${channel} modified`;
      let finalName = baseName;
      let suffix = 1;
      const existingNames = new Set(mathChannels.map(mc => mc.name));
      logs.forEach(l => l.cols.forEach(c => existingNames.add(c)));
      while (existingNames.has(finalName) && finalName !== quickModPreviewName) {
        suffix++;
        finalName = `${baseName} ${suffix}`;
      }

      const mc = { name: finalName, expression, unit };
      if (smoothing) mc.smoothing = smoothing;

      // Remove the preview channel before adding permanent one
      removeQuickModPreviewFromLogs();

      mathChannels.push(mc);
      saveMathChannels();
      logs.forEach(log => applyMathChannelToLog(mc, log));

      // Reset quick mod state
      resetQuickModToggles();

      renderMathChannelsList();
      populateYSelect();
      populateXCustomSelect();
      populateMapColorSelect(); populateColorAxisSelect(); populateDataFilterChannelSelect(); if (binnedPlotAxisSelect) populateAxisChannelSelect(binnedPlotAxisSelect);
      updatePlot();
    });
  }

})();
