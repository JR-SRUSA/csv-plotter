(() => {
  const fileInput = document.getElementById('fileInput');
  const filesList = document.getElementById('filesList');
  const ySelect = document.getElementById('ySelect');
  const selectedYColors = document.getElementById('selectedYColors');
  const xCustomSelect = document.getElementById('xCustomSelect');
  const mapColorEnabledInput = document.getElementById('mapColorEnabled');
  const mapColorSelect = document.getElementById('mapColorSelect');
  const mapColorModeSelect = document.getElementById('mapColorMode');
  const showCornersInput = document.getElementById('showCorners');
  const cornerShadeOpacityInput = document.getElementById('cornerShadeOpacity');
  const cornerSwapLRInput = document.getElementById('cornerSwapLR');
  const cornerTrackInfoDiv = document.getElementById('cornerTrackInfo');
  const clearBtn = document.getElementById('clearBtn');
  const plotDiv = document.getElementById('plotDiv');
  const mapDiv = document.getElementById('mapDiv');
  const leafletMapDiv = document.getElementById('leafletMapDiv');
  const controlsToggle = document.getElementById('controlsToggle');
  const controlsClose = document.getElementById('controlsClose');
  const controlsBackdrop = document.getElementById('controlsBackdrop');
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
  const mathChError = document.getElementById('mathChError');
  const mathChSave = document.getElementById('mathChSave');
  const mathChCancel = document.getElementById('mathChCancel');
  const mathChSuggestions = document.getElementById('mathChSuggestions');
  const mathChPreview = document.getElementById('mathChPreview');
  const plotlyConfig = {responsive:true, displaylogo:false};
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

  const logs = []; // {id, name, data: [rows], cols: [names], meta: {timeCol, distCol, latCol, lonCol, computedDistance}}

  // Fallback channel mapping if channel-map.json is unavailable.
  // Each entry: { displayName, piboso, aim, motec }
  const DEFAULT_CHANNEL_MAP = [
    { displayName: 'Speed', piboso: 'Speed', aim: 'GPS Speed', motec: 'Ground Speed' },
    { displayName: 'LatAcc', piboso: 'LatAcc', aim: 'GPS LatAcc', motec: 'G Force Lat' },
    { displayName: 'LongAcc', piboso: 'LonAcc', aim: 'GPS LonAcc', motec: 'G Force Long' },
    { displayName: 'Total Acceleration (calc)', piboso: 'Total Acceleration (calc)', aim: 'Total Acceleration (calc)', motec: 'Total Acceleration (calc)' },
  ];
  let channelMap = DEFAULT_CHANNEL_MAP.slice();
  let gpbikesTrackMapDefaults = DEFAULT_GPBIKES_TRACK_MAP_DEFAULTS.slice();
  const channelColorOverrides = new Map();
  const mathChannels = []; // { name, expression, unit }

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
  const CORNER_STRIP_DOMAIN = [0.96, 1];
  const CORNER_STRIP_GAP = 0.02; // reserved blank space between strip and main plot
  let mapHoverLookup = new Map(); // key -> {x, y}
  let mapHoverMarkerVisible = false;
  let isApplyingAutoOffset = false;
  let isApplyingAutoCenter = false;
  let mapOffsetManuallyAdjusted = false;
  let mapCenterManuallyAdjusted = false;
  let lastAutoOffsetSignature = '';
  let lastTrackDefaultSignature = '';
  let mapViewState = null;
  let leafletMap = null;
  let leafletLayers = []; // array of layer groups
  let leafletViewState = null;
  let leafletViewStateUserSet = false;
  let leafletXYViewState = null;
  let leafletXYViewStateUserSet = false;
  let leafletMapMode = null; // 'geo' | 'xy'
  let isApplyingLeafletProgrammaticView = false;
  let leafletHoverLookup = new Map(); // key -> {lat, lon}
  let leafletHoverMarker = null;
  let leafletColorLegendControl = null;
  let leafletMapColorManualRanges = new Map(); // channel -> {min, max}
  let currentTsTraces = []; // latest timeslip traces for Y-range recomputation on X zoom
  let isSyncingPlotHover = false;
  let lastLinkedHoverKey = null;

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
    const pad = Math.max(0.05, Math.abs(yMax - yMin) * 0.1);
    return [yMin - pad, yMax + pad];
  }

  function bindMainPlotRelayoutSync() {
    if (!plotDiv || plotDiv.__tsRelayoutBound) return;
    if (typeof plotDiv.on !== 'function') return;
    plotDiv.__tsRelayoutBound = true;
    let _applying = false;

    plotDiv.on('plotly_relayout', (eventData) => {
      if (_applying || !eventData || currentTsTraces.length === 0) return;

      // X axis reset — restore full-data Y range
      if (Object.prototype.hasOwnProperty.call(eventData, 'xaxis.autorange') && eventData['xaxis.autorange']) {
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

      // X axis zoomed/panned
      const x0 = Number(eventData['xaxis.range[0]']);
      const x1 = Number(eventData['xaxis.range[1]']);
      if (!Number.isFinite(x0) || !Number.isFinite(x1)) return;

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

    // Mobile touch interaction primarily fires click events; keep marker linked on tap.
    plotDiv.on('plotly_click', (eventData) => {
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
    });
  }

  function colorForLap(lap) {
    const n = Number.isFinite(lap) ? Math.floor(lap) : 0;
    const idx = ((n % COLORS.length) + COLORS.length) % COLORS.length;
    return COLORS[idx];
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

  document.addEventListener('keydown', (ev) => {
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

  function parseFile(file) {
    Papa.parse(file, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        if (!window.LogFileProcessors || typeof window.LogFileProcessors.processCsvRows !== 'function') {
          console.error('Missing LogFileProcessors.processCsvRows; cannot parse file:', file.name);
          return;
        }

        const processed = window.LogFileProcessors.processCsvRows(rows, file.name);
        if (!processed || !Array.isArray(processed.data) || !Array.isArray(processed.cols)) {
          console.error('Failed to process CSV file:', file.name);
          return;
        }

        const data = processed.data;
        const cols = [...processed.cols];
        const units = processed.units && typeof processed.units === 'object' ? processed.units : {};
        const id = idForName(file.name);
        const meta = processed.meta || {};
        meta.units = meta.units && typeof meta.units === 'object' ? meta.units : units;

        const lapNum = (Array.isArray(meta.lapNum) && meta.lapNum.length === data.length)
          ? meta.lapNum
          : data.map(() => 1);
        const lapTime = (Array.isArray(meta.lapTime) && meta.lapTime.length === data.length)
          ? meta.lapTime
          : data.map((_, i) => i);

        meta.lapNum = lapNum;
        meta.lapTime = lapTime;

        addCalculatedCommonChannels(data, cols, meta);
        deriveAndExposeMapXY(data, cols, meta);
        applyAllMathChannelsToLog({ data, cols, meta });

        // expose lap columns in data rows and cols list
        if (!cols.includes('Lap Time')) cols.push('Lap Time');
        if (!cols.includes('Lap Number')) cols.push('Lap Number');
        data.forEach((r,i)=>{ r['Lap Time'] = lapTime[i]; r['Lap Number'] = lapNum[i]; });

        // record units for new columns
        meta.units['Lap Time'] = 's';
        meta.units['Lap Number'] = '';

        logs.push({id, name: file.name, data, cols, meta});
        renderFilesList();
        populateYSelect();
        populateXCustomSelect();
        populateMapColorSelect();
        renderLapsList();
        updatePlot();
      }
    });
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
      label.appendChild(checkbox);
      label.appendChild(nameWrap);
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.setAttribute('data-remove', log.id);
      el.appendChild(label);
      el.appendChild(removeBtn);
      filesList.appendChild(el);
    });
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  function applyMathChannelToLog(mc, log) {
    const { name, expression, unit } = mc;
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
    if (!log.cols.includes(name)) log.cols.push(name);
    log.data.forEach(row => {
      const vals = resolvedRefs.map(col => { const v = Number(row[col]); return Number.isFinite(v) ? v : NaN; });
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

  let mathChEditIdx = -1; // -1 = add mode, >=0 = editing existing channel

  function renderMathChannelsList() {
    if (!mathChannelsList) return;
    mathChannelsList.innerHTML = mathChannels.map((mc, i) =>
      `<div class="math-ch-item">` +
      `<span class="math-ch-name">${escapeHtml(mc.name)}</span>` +
      `<span class="math-ch-expr">${escapeHtml(mc.expression)}</span>` +
      `<button type="button" class="math-ch-edit" data-idx="${i}" aria-label="Edit ${escapeHtml(mc.name)}">✎</button>` +
      `<button type="button" class="math-ch-delete" data-idx="${i}" aria-label="Delete ${escapeHtml(mc.name)}">✕</button>` +
      `</div>`
    ).join('');
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
        populateMapColorSelect();
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
    // Collect all numeric columns across logs.
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

    // Determine which raw column names are covered by CHANNEL_MAP entries.
    // A raw column is "covered" if a CHANNEL_MAP entry maps to it in at least one loaded log.
    const coveredRawCols = new Set();
    const activeMappings = []; // mappings that have at least one matching column
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

    // Build options: mapped display names first (sorted), then uncovered raw columns.
    const mappedOptions = activeMappings.map(m => {
      const unit = getUnitForChannel(m.displayName);
      const label = unit ? `${m.displayName} [${unit}]` : m.displayName;
      return `<option value="${escapeHtml(m.displayName)}">${escapeHtml(label)}</option>`;
    });
    const rawOptions = Array.from(numericCols).filter(c => !coveredRawCols.has(c)).sort().map(c => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const isMathCh = mathChannels.some(mc => mc.name === c);
      const suffix = isMathCh ? ' (math)' : '';
      const label = unit ? `${c} [${unit}]${suffix}` : `${c}${suffix}`;
      return `<option value="${escapeHtml(c)}">${escapeHtml(label)}</option>`;
    });
    ySelect.innerHTML = mappedOptions.concat(rawOptions).join('');

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
      html.push(`<div class="file-lap-group"><div class="file-lap-heading">${escapeHtml(log.name)}</div><div class="laps-col">`);
      const totalFileLaps = fileLaps.length;
      fileLaps.forEach((n, idx) => {
        const color = colorForLap(n);
        const dur = getLapDuration(log.meta, n);
        const lapLabel = `${n} - ${formatLapTime(dur)}`;
        // Uncheck first and last lap (in/out laps) when there are 3 or more laps
        const isInOutLap = totalFileLaps >= 3 && (idx === 0 || idx === totalFileLaps - 1);
        const checkedAttr = isInOutLap ? '' : ' checked';
        html.push(`<label class="lap-item"><input type="checkbox" data-id="${log.id}" data-lap="${n}"${checkedAttr} style="accent-color:${color};" /> <span class="lap-label" style="color:${color}">${lapLabel}</span></label>`);
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
    return result;
  }

  function isLapSelected(selectedLaps, fileId, lap) {
    if (selectedLaps.size === 0) return true; // nothing filtered
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

  function renderSelectedChannelColorControls() {
    if (!selectedYColors) return;
    const selectedChannels = getSelectedY();
    syncSelectedChannelColors(selectedChannels);
    selectedYColors.innerHTML = '';
    selectedChannels.forEach((channel) => {
      const color = getChannelColor(channel);
      const item = document.createElement('label');
      item.className = 'selected-y-color-item';
      const input = document.createElement('input');
      input.type = 'color';
      input.value = color;
      input.setAttribute('data-channel', channel);
      input.setAttribute('aria-label', `Color for ${getChannelLabel(channel)}`);
      const text = document.createElement('span');
      text.textContent = getChannelLabel(channel);
      text.style.color = color;
      item.appendChild(input);
      item.appendChild(text);
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

    const typeForRow = (r) => {
      if (!r.isTurning || r.dirSign === 0) return 'straight';
      const isRight = swapLeftRight ? r.dirSign < 0 : r.dirSign > 0;
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

    let cornerNum = 0;
    segments.forEach(seg => {
      if (seg.type === 'left' || seg.type === 'right') {
        cornerNum += 1;
        seg.number = cornerNum;
      }
    });

    return { segments, trackLength: rows[rows.length - 1].dist };
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
    selFiles.forEach((log, fileIdx) => {
      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        if (!Array.isArray(log.meta.lapRelDist)) return;
        const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
        const xArr = maskIdx.map(i => log.meta.lapRelDist[i]);
        const tArr = maskIdx.map(i => log.meta.lapTime[i]);
        if (xArr.length > 1) {
          const isCrashLap = !!(log.meta && log.meta.crashLapSet && log.meta.crashLapSet.has(lap));
          const keys = maskIdx.map(i => rowKey(log.id, lap, i));
          lapSeries.push({file: log.name, lap, x: xArr, t: tArr, keys, isCrashLap, fileIdx});
        }
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
        const traceMax = Math.max(...validDeltas);
        const traceMin = Math.min(...validDeltas);
        if (allMaxDelta == null || traceMax > allMaxDelta) allMaxDelta = traceMax;
        if (allMinDelta == null || traceMin < allMinDelta) allMinDelta = traceMin;
        if (!s.isCrashLap && (nonCrashMaxDelta == null || traceMax > nonCrashMaxDelta)) {
          nonCrashMaxDelta = traceMax;
        }
        if (!s.isCrashLap && (nonCrashMinDelta == null || traceMin < nonCrashMinDelta)) {
          nonCrashMinDelta = traceMin;
        }
      }
      const color = colorForLap(s.lap);
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

  function buildChannelAxisConfig(ycols, mainDomain) {
    const channelToRef = new Map();
    const axisLayout = {};
    const axisChannels = new Map();
    const axisUnits = new Map();
    const mobile = window.innerWidth <= 980;

    const addAxisChannel = (axisRef, channel) => {
      if (!axisChannels.has(axisRef)) axisChannels.set(axisRef, new Set());
      axisChannels.get(axisRef).add(channel);
    };

    const setAxisUnit = (axisRef, unit) => {
      if (unit == null || unit === '') return;
      axisUnits.set(axisRef, unit);
    };

    const formatAxisTitle = (axisRef) => {
      const channels = axisChannels.has(axisRef) ? Array.from(axisChannels.get(axisRef)) : [];
      const unit = axisUnits.get(axisRef);
      const channelTitle = channels.join(' / ');
      if (channelTitle && unit) return `${channelTitle} [${unit}]`;
      if (channelTitle) return channelTitle;
      if (unit) return `[${unit}]`;
      return 'Value';
    };

    const titleObject = (text) => ({ text, standoff: 8 });

    const baseMarginLeft = mobile ? 48 : 80;
    const baseMarginRight = mobile ? 22 : 80;

    if (!ycols || ycols.length === 0) {
      axisLayout.yaxis = {title:titleObject('Value'), domain: mainDomain, automargin:true};
      return {channelToRef, axisLayout, marginLeft: baseMarginLeft, marginRight: baseMarginRight};
    }

    // Group channels by unit; channels with same unit share an axis.
    // unitToAxis: unit string -> existing axisRef (or null-keyed for channels with no unit - each gets its own)
    const unitToAxis = new Map();
    // axisCounter tracks how many distinct axes we've allocated (beyond primary y)
    // y2 is reserved for time slip, so we start extra axes at y3
    let extraAxisCount = 0; // number of extra axes created so far

    // Primary Y axis gets the first channel
    const firstUnit = getUnitForChannel(ycols[0]);
    channelToRef.set(ycols[0], 'y');
    addAxisChannel('y', ycols[0]);
    setAxisUnit('y', firstUnit);
    axisLayout.yaxis = {title: titleObject(formatAxisTitle('y')), domain: mainDomain, automargin:true};
    if (firstUnit != null && firstUnit !== '') unitToAxis.set(firstUnit, 'y');

    // Additional overlaid Y axes (skip y2, reserved for time slip subplot)
    let leftExtraCount = 0;
    let rightExtraCount = 0;

    for (let i = 1; i < ycols.length; i++) {
      const channel = ycols[i];
      const unit = getUnitForChannel(channel);
      const hasUnit = unit != null && unit !== '';

      // Check if an existing axis covers this unit
      if (hasUnit && unitToAxis.has(unit)) {
        const existingAxisRef = unitToAxis.get(unit);
        channelToRef.set(channel, existingAxisRef);
        addAxisChannel(existingAxisRef, channel);
        continue; // reuse existing axis, no new axis needed
      }

      // Need a new axis
      extraAxisCount += 1;
      const axisNumber = extraAxisCount + 2; // extraAxisCount=1 -> y3
      const axisRef = `y${axisNumber}`;
      const axisKey = `yaxis${axisNumber}`;
      const side = (extraAxisCount % 2 === 1) ? 'right' : 'left';

      let position;
      if (side === 'right') {
        position = Math.max(0.62, 1 - rightExtraCount * 0.06);
        rightExtraCount += 1;
      } else {
        leftExtraCount += 1;
        position = Math.min(0.38, leftExtraCount * 0.06);
      }

      channelToRef.set(channel, axisRef);
      addAxisChannel(axisRef, channel);
      setAxisUnit(axisRef, unit);
      if (hasUnit) unitToAxis.set(unit, axisRef);
      axisLayout[axisKey] = {
        title: titleObject(formatAxisTitle(axisRef)),
        domain: mainDomain,
        overlaying: 'y',
        anchor: 'free',
        side,
        position,
        automargin: true
      };
    }

    for (const axisRef of axisChannels.keys()) {
      const axisKey = axisRef === 'y' ? 'yaxis' : `yaxis${axisRef.slice(1)}`;
      if (!axisLayout[axisKey]) continue;
      axisLayout[axisKey].title = titleObject(formatAxisTitle(axisRef));
    }

    const marginStep = mobile ? 18 : 40;
    const marginLeft = Math.min(baseMarginLeft + leftExtraCount * marginStep, mobile ? 130 : 260);
    const marginRight = Math.min(baseMarginRight + rightExtraCount * marginStep, mobile ? 110 : 260);
    return {channelToRef, axisLayout, marginLeft, marginRight};
  }

  function getFigureHeight(includeTimeSlip) {
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
    // Mobile targets: main plot ~33dvh. With timeslip: main ~33dvh + slip ~25dvh.
    const main = Math.max(200, Math.round(window.innerHeight * 0.33));
    const timeSlip = Math.max(160, Math.round(window.innerHeight * 0.25));
    return includeTimeSlip ? (main + timeSlip) : main;
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
    return selFiles.filter(l => Array.isArray(l.cols) && l.cols.includes(DERIVED_MAP_X_COL) && l.cols.includes(DERIVED_MAP_Y_COL));
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
    });

    return addedCols;
  }

  function getFirstDerivedMapOrigin(selFiles) {
    const candidates = Array.isArray(selFiles) && selFiles.length > 0 ? selFiles : logs;
    for (const log of candidates) {
      const origin = log && log.meta && log.meta.mapDerivedXY;
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

        const color = colorForLap(lap);
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
    }

    if (leafletMap && leafletMapMode === mode) return;

    syncLeafletContainerHeight();

    leafletMapDiv.style.background = '#fff';

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

      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, DigitalGlobe, Earthstar Geographics',
          maxZoom: 20
        }
      ).addTo(leafletMap);

      const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }
      );

      const blankLayer = L.layerGroup();
      L.control.layers(
        {
          'Satellite': satelliteLayer,
          'OpenStreetMap': osmLayer,
          'Blank (white)': blankLayer
        },
        {},
        { position: 'topright' }
      ).addTo(leafletMap);
    }

    L.control.zoom({ position: 'bottomleft' }).addTo(leafletMap);

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
      div.style.background = 'rgba(255,255,255,0.95)';
      div.style.border = '1px solid #c8d2df';
      div.style.borderRadius = '6px';
      div.style.padding = '6px 8px';
      div.style.font = '12px/1.2 sans-serif';
      div.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
      div.style.minWidth = '150px';
      div.style.cursor = 'pointer';

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
            '<div style="position:relative;display:flex;justify-content:space-between;margin-top:3px;color:#31445a;">',
            `<span>${currentMin.toFixed(2)}</span>`,
            `<span>${currentMax.toFixed(2)}</span>`,
            `<span style="position:absolute;left:${zeroPct.toFixed(2)}%;transform:translateX(-50%);font-weight:600;">0</span>`,
            '</div>'
          ].join('')
        : [
            '<div style="display:flex;justify-content:space-between;margin-top:3px;color:#31445a;">',
            `<span>${currentMin.toFixed(2)}</span>`,
            `<span>${currentMax.toFixed(2)}</span>`,
            '</div>'
          ].join('');

      div.innerHTML = [
        `<div style="margin-bottom:4px;font-weight:600;color:#223;">${escapeHtml(channelName || 'Map Color')}</div>`,
        `<div style="height:10px;border-radius:3px;border:1px solid #9fb0c5;background:${gradient};"></div>`,
        rangeLabelsHtml,
        `<div style="margin-top:4px;color:#5a6b82;">${isManualRange ? 'Manual bounds active' : 'Auto bounds active'} (click to edit)</div>`,
        '<div class="leaflet-map-color-range-editor" style="display:none;margin-top:6px;border-top:1px solid #d7e0ec;padding-top:6px;">',
        '<div style="display:flex;gap:6px;align-items:center;">',
        `<label style="display:flex;align-items:center;gap:4px;color:#223;">Min <input type="number" step="any" class="leaflet-map-color-min" value="${currentMin.toFixed(6)}" style="width:74px;padding:2px 4px;font-size:12px;"></label>`,
        `<label style="display:flex;align-items:center;gap:4px;color:#223;">Max <input type="number" step="any" class="leaflet-map-color-max" value="${currentMax.toFixed(6)}" style="width:74px;padding:2px 4px;font-size:12px;"></label>`,
        '</div>',
        '<div style="display:flex;gap:6px;margin-top:6px;">',
        '<button type="button" class="leaflet-map-color-apply" style="padding:2px 8px;font-size:12px;">Apply</button>',
        '<button type="button" class="leaflet-map-color-auto" style="padding:2px 8px;font-size:12px;">Auto</button>',
        '</div>',
        '<div class="leaflet-map-color-error" style="display:none;color:#9b1c1c;margin-top:5px;"></div>',
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

  function getLeafletLatLonSource(log) {
    if (!log || !Array.isArray(log.cols)) return null;

    if (log.cols.includes(DERIVED_LAT_COL) && log.cols.includes(DERIVED_LON_COL)) {
      return {
        latAt: (index) => Number(log.data[index][DERIVED_LAT_COL]),
        lonAt: (index) => Number(log.data[index][DERIVED_LON_COL]),
        source: 'derived'
      };
    }

    const cols = findLatLonColumns(log.cols, log.meta);
    if (!cols) return null;

    return {
      latAt: (index) => Number(log.data[index][cols.latCol]),
      lonAt: (index) => Number(log.data[index][cols.lonCol]),
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
  }

  function updateLeafletMap(selFiles, selectedLaps, mode) {
    if (!leafletMapDiv || !window.L) return;
    syncLeafletContainerHeight();

    initLeafletMap(mode);
    
    // Clear existing layers
    leafletLayers.forEach(layer => leafletMap.removeLayer(layer));
    leafletLayers = [];
    const nextLeafletHoverLookup = new Map();
    const mapColorEnabled = !!(mapColorEnabledInput && mapColorEnabledInput.checked);
    const mapColorChannel = mapColorSelect ? mapColorSelect.value : '';
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
        
        if (latlngs.length >= 2) {
          const color = colorForLap(lap);
          const dash = DASHES[fileIdx % DASHES.length];
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

    leafletHoverLookup = nextLeafletHoverLookup;
    clearLeafletHoverMarker();
    updateLeafletColorLegend(mapColorEnabled ? mapColorChannel : '', effectiveMapColorScaleConfig, mapColorScaleConfig, mapColorMode);

    requestAnimationFrame(() => leafletMap.invalidateSize());
  }

  function buildLayout(mainXTitle, ycols, includeTimeSlip, showCornerStrip) {
    const mobile = window.innerWidth <= 980;
    const mainDomainTop = showCornerStrip ? (CORNER_STRIP_DOMAIN[0] - CORNER_STRIP_GAP) : 1;
    const mainDomain = includeTimeSlip ? (mobile ? [0.48,mainDomainTop] : [0.23,mainDomainTop]) : [0,mainDomainTop];
    const timeSlipDomain = includeTimeSlip ? (mobile ? [0,0.43] : [0,0.20]) : null;
    const axisCfg = buildChannelAxisConfig(ycols, mainDomain);

    if (!includeTimeSlip) {
      const layout = {
        margin:{t:30},
        xaxis:{title:{text: mainXTitle, standoff: 8}, automargin:true},
        showlegend:false,
        height: getFigureHeight(false)
      };
      layout.margin.l = axisCfg.marginLeft;
      layout.margin.r = axisCfg.marginRight;
      Object.assign(layout, axisCfg.axisLayout);
      return {layout, channelToRef: axisCfg.channelToRef, mainDomainTop};
    }

    const layout = {
      margin:{t:30},
      xaxis:{title:{text: mainXTitle, standoff: 8}, domain:[0,1], anchor:'y'},
      xaxis2:{title:{text: ''}, domain:[0,1], anchor:'y2', matches:'x', showticklabels:false},
      yaxis2:{title:{text: 'Time Slip (s)', standoff: 8}, domain: timeSlipDomain},
      showlegend:false,
      height: getFigureHeight(true)
    };
    layout.margin.l = axisCfg.marginLeft;
    layout.margin.r = axisCfg.marginRight;
    Object.assign(layout, axisCfg.axisLayout);
    return {layout, channelToRef: axisCfg.channelToRef, mainDomainTop};
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

  function buildHoverTemplate(xLabel, yLabel) {
    return `${escapeHtml(xLabel)}: %{x:.3f}<br>${escapeHtml(yLabel)}: %{y:.3f}<extra></extra>`;
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
        const span = Math.max(...dists) - Math.min(...dists);
        if (span > bestSpan) {
          bestSpan = span;
          best = { log, lap };
        }
      });
    });
    return best;
  }

  function buildCornerShapesAndAnnotations(cornerData, mainDomainTop, shadeOpacityPct) {
    const shapes = [];
    const annotations = [];
    if (!cornerData || !Array.isArray(cornerData.segments)) return { shapes, annotations };

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

      // Faint full-height shading over corner zones only.
      if (seg.type === 'left' || seg.type === 'right') {
        shapes.push({
          type: 'rect', xref: 'x', yref: 'paper',
          x0: seg.startDist, x1: seg.endDist,
          y0: 0, y1: mainDomainTop,
          fillcolor: color, opacity: shadeOpacity, line: { width: 0 }, layer: 'below'
        });

        annotations.push({
          x: (seg.startDist + seg.endDist) / 2, xref: 'x',
          y: (CORNER_STRIP_DOMAIN[0] + CORNER_STRIP_DOMAIN[1]) / 2, yref: 'paper',
          text: String(seg.number), showarrow: false,
          font: { color: '#fff', size: 11 }
        });
      }
    });

    return { shapes, annotations };
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

  function updatePlot() {
    const selFiles = getSelectedFiles();
    const ycols = getSelectedY();
    const xMode = document.querySelector('input[name=xaxis]:checked').value;
    const customXCol = xCustomSelect ? xCustomSelect.value : '';
    const plotByLap = true;
    const selectedLaps = getSelectedLaps();
    // singleLapSelected: true when exactly one lap is visible across all files
    const totalSelectedLaps = Array.from(selectedLaps.values()).reduce((sum, s) => sum + s.size, 0);
    const singleLapSelected = totalSelectedLaps === 1;
    syncSelectedChannelColors(ycols);
    const channelColors = new Map(ycols.map((y) => [y, getChannelColor(y)]));
    const mainXTitle = getXAxisTitle(xMode, customXCol);
    const tsBuilt = buildTimeSlipTraces(selFiles, selectedLaps, xMode);
    const tsPreview = tsBuilt.traces;
    const includeTimeSlip = tsPreview.length > 0;

    const cornersEnabled = !!(showCornersInput && showCornersInput.checked);
    let cornerData = null;
    let cornerRef = null;
    if (cornersEnabled && xMode === 'distance') {
      cornerRef = getReferenceLapForCorners(selFiles, selectedLaps);
      if (cornerRef) {
        const swapLeftRight = !!(cornerSwapLRInput && cornerSwapLRInput.checked);
        cornerData = computeCornerSegments(cornerRef.log, cornerRef.lap, swapLeftRight);
      }
    }
    const showCornerStrip = !!(cornerData && cornerData.segments.length > 0);

    const built = buildLayout(mainXTitle, ycols, includeTimeSlip, showCornerStrip);
    const layout = built.layout;
    const channelToRef = built.channelToRef;
    let traces = [];
    layout.hovermode = 'x';
    layout.hoverlabel = { namelength: -1 };
    layout.hoverdistance = 40;

    if (showCornerStrip) {
      const shadeOpacityPct = cornerShadeOpacityInput ? Number(cornerShadeOpacityInput.value) : 10;
      const cornerVis = buildCornerShapesAndAnnotations(cornerData, built.mainDomainTop, shadeOpacityPct);
      layout.shapes = cornerVis.shapes;
      layout.annotations = cornerVis.annotations;

      const cornerTotals = computeCornerTotals(cornerData);
      const cornerVenue = getLogVenue(cornerRef.log);
      saveCornerMetadataForVenue(cornerVenue, cornerData, cornerTotals);
      if (cornerTrackInfoDiv) cornerTrackInfoDiv.textContent = formatCornerSummary(cornerVenue, cornerData, cornerTotals);
    } else {
      layout.shapes = [];
      layout.annotations = [];
      if (cornerTrackInfoDiv) cornerTrackInfoDiv.textContent = '';
    }

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
      // plot each selected lap separately, x axis is Lap Time or Lap Distance
      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
        const xArr = getXSeriesForMode(log, maskIdx, xMode, customXCol);
        if (!xArr) return;
        ycols.forEach(y => {
          const resolvedCol = resolveChannelForLog(y, log);
          if (!resolvedCol || !log.cols.includes(resolvedCol)) return; // channel not in this file
          const yArr = maskIdx.map(i => log.data[i][resolvedCol]);
          const keyArr = maskIdx.map(i => rowKey(log.id, lap, i));
          const traceColor = singleLapSelected ? (channelColors.get(y) || fileColor) : colorForLap(lap);
          const dash = getLineDashForFileIndex(li);
          traces.push({
            x: xArr,
            y: yArr,
            customdata: keyArr,
            yaxis: channelToRef.get(y) || 'y',
            name: `${log.name} — Lap ${lap} — ${y}`,
            mode: 'lines',
            marker:{color: traceColor},
            line:{color: traceColor, dash},
            hovertemplate: buildHoverTemplate(mainXTitle, getChannelLabel(y))
          });
        });
      });
    });

    // if shading requested and plotting by lap, compute envelope per Y channel
    if (shadeLaps && ycols.length>0) {
      // for each y channel compute global union x grid across all selected files/laps
      ycols.forEach(y => {
        const allLapSeries = [];
        selFiles.forEach((log, li) => {
          const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
          lapNums.forEach(lap => {
            if (!isLapSelected(selectedLaps, log.id, lap)) return;
            const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
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
    Plotly.react(plotDiv, traces.concat(tsPreview), layout, plotlyConfig);
    bindMainPlotHoverSync();
    bindMainPlotRelayoutSync();

    const hasLeafletData = hasRenderableLeafletMapData(selFiles, selectedLaps);
    const hasXYData = hasRenderableXYMapData(selFiles, selectedLaps);

    if (hasLeafletData) {
      setMapDisplayMode('leaflet');
      clearXYMapPlot();
      updateLeafletMap(selFiles, selectedLaps, 'geo');
    } else if (hasXYData) {
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
  const shadeBox = document.getElementById('shadeLaps');
  if (shadeBox) shadeBox.addEventListener('change', ()=> updatePlot());
  if (showCornersInput) showCornersInput.addEventListener('change', ()=> updatePlot());
  if (cornerShadeOpacityInput) cornerShadeOpacityInput.addEventListener('input', ()=> updatePlot());
  if (cornerSwapLRInput) cornerSwapLRInput.addEventListener('change', ()=> updatePlot());
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
  if (xCustomSelect) xCustomSelect.addEventListener('change', ()=> updatePlot());
  if (mapColorEnabledInput) {
    mapColorEnabledInput.addEventListener('change', () => {
      if (mapColorSelect) mapColorSelect.disabled = !mapColorEnabledInput.checked;
      if (mapColorModeSelect) mapColorModeSelect.disabled = !mapColorEnabledInput.checked;
      updatePlot();
    });
  }
  if (mapColorSelect) mapColorSelect.addEventListener('change', ()=> updatePlot());
  if (mapColorModeSelect) mapColorModeSelect.addEventListener('change', ()=> updatePlot());
  ySelect.addEventListener('change', ()=> {
    renderSelectedChannelColorControls();
    updatePlot();
  });
  if (selectedYColors) {
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
  }

  filesList.addEventListener('click', (ev)=>{
    if (ev.target.matches('button[data-remove]')) {
      const id = ev.target.getAttribute('data-remove');
      const idx = logs.findIndex(l=>l.id===id);
      if (idx>=0) {
        logs.splice(idx,1);
        mapOffsetManuallyAdjusted = false;
        lastAutoOffsetSignature = '';
        lastTrackDefaultSignature = '';
        renderFilesList();
        populateYSelect();
        populateXCustomSelect();
        populateMapColorSelect();
        renderLapsList();
        Plotly.purge(plotDiv);
        clearXYMapPlot();
        clearLeafletMapPlot();
      }
    }
  });

  // update lap list when file selection changes
  filesList.addEventListener('change', (ev)=>{
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
  }

  clearBtn.addEventListener('click', ()=>{
    logs.length = 0;
    mapOffsetManuallyAdjusted = false;
    mapCenterManuallyAdjusted = false;
    lastAutoOffsetSignature = '';
    lastTrackDefaultSignature = '';
    if (mapCenterLatInput) mapCenterLatInput.value = '';
    if (mapCenterLonInput) mapCenterLonInput.value = '';
    updateMapFitInfo('');
    renderFilesList();
    populateYSelect();
    populateXCustomSelect();
    populateMapColorSelect();
    renderLapsList();
    Plotly.purge(plotDiv);
    clearXYMapPlot();
    clearLeafletMapPlot();
    setMapDisplayMode('none');
    if (window.innerWidth <= 980) setControlsOpen(true);
  });

  // allow toggling file visibility by checking/unchecking checkboxes
  filesList.addEventListener('change', (ev)=>{
    if (ev.target.matches('input[type=checkbox]')) updatePlot();
  });

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
          mathChannels.push({ name: mc.name, expression: mc.expression, unit: mc.unit || '' });
        }
      });
      if (mathChannels.length > 0) renderMathChannelsList();
    } catch {}
  })();

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
    if (mathChError) { mathChError.hidden = true; mathChError.textContent = ''; }
    if (mathChPreview) mathChPreview.hidden = true;
    if (mathChSave) mathChSave.textContent = 'Add Channel';
    if (mathChName) mathChName.disabled = false;
    if (addMathChannelBtn) addMathChannelBtn.disabled = false;
  }

  if (addMathChannelBtn) {
    addMathChannelBtn.addEventListener('click', () => {
      if (mathChannelForm) mathChannelForm.hidden = false;
      if (mathChName) mathChName.focus();
      addMathChannelBtn.disabled = true;
    });
  }

  if (mathChCancel) {
    mathChCancel.addEventListener('click', resetMathChForm);
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
      populateMapColorSelect();
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
      populateMapColorSelect();
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

})();
