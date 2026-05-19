(() => {
  const fileInput = document.getElementById('fileInput');
  const filesList = document.getElementById('filesList');
  const ySelect = document.getElementById('ySelect');
  const xCustomSelect = document.getElementById('xCustomSelect');
  const mapColorEnabledInput = document.getElementById('mapColorEnabled');
  const mapColorSelect = document.getElementById('mapColorSelect');
  const mapColorModeSelect = document.getElementById('mapColorMode');
  const plotBtn = document.getElementById('plotBtn');
  const clearBtn = document.getElementById('clearBtn');
  const plotDiv = document.getElementById('plotDiv');
  const mapDiv = document.getElementById('mapDiv');
  const controlsToggle = document.getElementById('controlsToggle');
  const controlsClose = document.getElementById('controlsClose');
  const controlsBackdrop = document.getElementById('controlsBackdrop');
  const mapXOffsetInput = document.getElementById('mapXOffset');
  const mapYOffsetInput = document.getElementById('mapYOffset');
  const mapCenterLatInput = document.getElementById('mapCenterLat');
  const mapCenterLonInput = document.getElementById('mapCenterLon');
  const mapFitInfo = document.getElementById('mapFitInfo');
  const plotlyConfig = {responsive:true, displaylogo:false};
  const DEFAULT_Y_CHANNEL = 'Speed';
  const HOVER_MARKER_TRACE_NAME = '__hover_marker__';
  const DERIVED_MAP_X_COL = 'Map X';
  const DERIVED_MAP_Y_COL = 'Map Y';
  const DERIVED_LAT_COL = 'Derived Latitude';
  const DERIVED_LON_COL = 'Derived Longitude';

  const logs = []; // {id, name, data: [rows], cols: [names], meta: {timeCol, distCol, latCol, lonCol, computedDistance}}

  // Fallback channel mapping if channel-map.json is unavailable.
  // Each entry: { displayName, piboso, aim }
  const DEFAULT_CHANNEL_MAP = [
    { displayName: 'Speed', piboso: 'Speed', aim: 'GPS Speed' },
    { displayName: 'LatAcc', piboso: 'LatAcc', aim: 'GPS LatAcc' },
    { displayName: 'LongAcc', piboso: 'LonAcc', aim: 'GPS LonAcc' },
  ];
  let channelMap = DEFAULT_CHANNEL_MAP.slice();

  const COLORS = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];
  const DASHES = ['solid','dash','dot','dashdot','longdash','longdashdot'];
  let mapHoverLookup = new Map(); // key -> {x, y}
  let mapHoverMarkerVisible = false;
  let isApplyingAutoOffset = false;
  let isApplyingAutoCenter = false;
  let mapOffsetManuallyAdjusted = false;
  let mapCenterManuallyAdjusted = false;
  let lastAutoOffsetSignature = '';
  let mapViewState = null;

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

  function bindMainPlotHoverSync() {
    if (!plotDiv || plotDiv.__mapHoverSyncBound) return;
    if (typeof plotDiv.on !== 'function') return;
    plotDiv.__mapHoverSyncBound = true;

    plotDiv.on('plotly_hover', (eventData) => {
      const point = eventData && eventData.points && eventData.points[0];
      if (!point || point.data == null) return;
      const custom = point.data.customdata;
      if (!Array.isArray(custom)) {
        clearMapHoverMarker();
        return;
      }
      const key = custom[point.pointNumber];
      if (!key) {
        clearMapHoverMarker();
        return;
      }
      showMapHoverMarker(key);
    });

    plotDiv.on('plotly_unhover', () => {
      clearMapHoverMarker();
    });
  }

  function colorForLap(lap) {
    const n = Number.isFinite(lap) ? Math.floor(lap) : 0;
    const idx = ((n % COLORS.length) + COLORS.length) % COLORS.length;
    return COLORS[idx];
  }

  function setControlsOpen(isOpen) {
    document.body.classList.toggle('controls-open', isOpen);
    if (controlsBackdrop) controlsBackdrop.hidden = !isOpen;
    if (controlsToggle) controlsToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  if (window.innerWidth <= 980 && logs.length === 0) {
    setControlsOpen(true);
  }

  if (controlsToggle) {
    controlsToggle.addEventListener('click', () => {
      const next = !document.body.classList.contains('controls-open');
      setControlsOpen(next);
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
    if (window.innerWidth > 980 && document.body.classList.contains('controls-open')) {
      setControlsOpen(false);
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

        deriveAndExposeMapXY(data, cols, meta);

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
    logs.forEach(log => {
      const el = document.createElement('div');
      el.className = 'file-item';
      el.dataset.id = log.id;
      el.innerHTML = `<label><input type="checkbox" data-id="${log.id}" checked /> <strong>${escapeHtml(log.name)}</strong></label>
        <button data-remove="${log.id}">Remove</button>`;
      filesList.appendChild(el);
    });
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

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
        if (!displayName) return null;
        return { displayName, piboso, aim };
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
      const label = unit ? `${c} [${unit}]` : c;
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
    } else if (mapColorSelect.options.length > 0) {
      mapColorSelect.value = mapColorSelect.options[0].value;
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
        const perLapMax = new Map();
        l.meta.lapNum.forEach((n, i) => {
          const lt = l.meta.lapTime && l.meta.lapTime[i];
          if (lt == null || isNaN(lt)) return;
          perLapMax.set(n, Math.max(perLapMax.get(n) || 0, lt));
        });
        perLapMax.forEach((duration, lap) => {
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
      // compute per-file lap durations
      const filelapDurations = new Map();
      (log.meta.lapNum || []).forEach((n, i) => {
        const lt = log.meta.lapTime && log.meta.lapTime[i];
        if (lt == null || isNaN(lt)) return;
        filelapDurations.set(n, Math.max(filelapDurations.get(n) || 0, lt));
      });
      html.push(`<div class="file-lap-group"><div class="file-lap-heading">${escapeHtml(log.name)}</div><div class="laps-col">`);
      const totalFileLaps = fileLaps.length;
      fileLaps.forEach((n, idx) => {
        const color = colorForLap(n);
        const dur = filelapDurations.get(n);
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

  // Resolve a Y channel value (which may be a CHANNEL_MAP displayName) to
  // the actual column name present in the given log, based on its file format.
  function resolveChannelForLog(yValue, log) {
    const mapping = getChannelMap().find(m => m.displayName === yValue);
    if (!mapping) return yValue; // raw column name, use as-is
    const LP = window.LogFileProcessors;
    const fmt = (log.meta && log.meta.format) ? log.meta.format : '';
    if (LP && LP.isGPBikesFormat(fmt)) return mapping.piboso;
    if (LP && LP.isAiMFormat(fmt)) return mapping.aim;
    // Standard/unknown: fall back to displayName then piboso
    return mapping.displayName || mapping.piboso;
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

  function buildTimeSlipTraces(selFiles, selectedLaps, xMode) {
    // Time slip is defined only against distance while split by lap.
    if (xMode !== 'distance') {
      return {traces: [], nonCrashMaxDelta: null, nonCrashMinDelta: null, allMaxDelta: null, allMinDelta: null};
    }

    const lapSeries = [];
    selFiles.forEach((log) => {
      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
        const xArr = maskIdx.map(i => log.meta.lapRelDist[i]);
        const tArr = maskIdx.map(i => log.meta.lapTime[i]);
        if (xArr.length > 1) {
          const isCrashLap = !!(log.meta && log.meta.crashLapSet && log.meta.crashLapSet.has(lap));
          lapSeries.push({file: log.name, lap, x: xArr, t: tArr, isCrashLap});
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
      tsTraces.push({x: grid, y: deltas, xaxis:'x2', yaxis:'y2', name: `${s.file} — Lap ${s.lap}`, mode:'lines', line:{color}});
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
    const mobile = window.innerWidth <= 980;

    if (!ycols || ycols.length === 0) {
      axisLayout.yaxis = {title:'Value', domain: mainDomain, automargin:true};
      return {channelToRef, axisLayout, marginLeft: mobile ? 54 : 80, marginRight: mobile ? 54 : 80};
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
    const firstTitle = (firstUnit != null && firstUnit !== '') ? `[${firstUnit}]` : ycols[0];
    axisLayout.yaxis = {title: firstTitle, domain: mainDomain, automargin:true};
    if (firstUnit != null && firstUnit !== '') {
      unitToAxis.set(firstUnit, 'y');
    }

    // Additional overlaid Y axes (skip y2, reserved for time slip subplot)
    let leftExtraCount = 0;
    let rightExtraCount = 0;

    for (let i = 1; i < ycols.length; i++) {
      const channel = ycols[i];
      const unit = getUnitForChannel(channel);
      const hasUnit = unit != null && unit !== '';

      // Check if an existing axis covers this unit
      if (hasUnit && unitToAxis.has(unit)) {
        channelToRef.set(channel, unitToAxis.get(unit));
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

      const axisTitle = hasUnit ? `[${unit}]` : channel;
      channelToRef.set(channel, axisRef);
      if (hasUnit) unitToAxis.set(unit, axisRef);
      axisLayout[axisKey] = {
        title: axisTitle,
        domain: mainDomain,
        overlaying: 'y',
        anchor: 'free',
        side,
        position,
        automargin: true
      };
    }

    const baseMargin = mobile ? 54 : 80;
    const marginStep = mobile ? 22 : 40;
    const marginLeft = Math.min(baseMargin + leftExtraCount * marginStep, mobile ? 120 : 260);
    const marginRight = Math.min(baseMargin + rightExtraCount * marginStep, mobile ? 120 : 260);
    return {channelToRef, axisLayout, marginLeft, marginRight};
  }

  function getFigureHeight(includeTimeSlip) {
    const mobile = window.innerWidth <= 980;
    if (!mobile) return includeTimeSlip ? 860 : 640;

    const reserve = includeTimeSlip ? 145 : 125;
    const available = Math.max(220, window.innerHeight - reserve);
    return Math.min(Math.max(available, 260), Math.max(320, window.innerHeight - 70));
  }

  function getMapFigureHeight() {
    const mobile = window.innerWidth <= 980;
    return mobile ? Math.min(Math.max(window.innerHeight * 0.28, 170), 340) : 300;
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
    const lat = Number(mapCenterLatInput && mapCenterLatInput.value);
    const lon = Number(mapCenterLonInput && mapCenterLonInput.value);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { originLat: lat, originLon: lon };
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

  function getDerivedMapLogs(selFiles) {
    return selFiles.filter(l => Array.isArray(l.cols) && l.cols.includes(DERIVED_MAP_X_COL) && l.cols.includes(DERIVED_MAP_Y_COL));
  }

  function getNativeXYLogs(selFiles) {
    return selFiles.filter(l => !!getNativeXYCols(l));
  }

  function computeAutoMapOffsetFit(selFiles, selectedLaps) {
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
          allPairs.push(...buildLapAlignedPairs(posPts, mapPts));
        });

        const fit = window.MapCoordinateUtils.fitTranslationLeastSquares(allPairs);
        if (!fit || !Number.isFinite(fit.offsetX) || !Number.isFinite(fit.offsetY) || fit.pairCount < 2) return;

        const candidate = {
          ...fit,
          posLog,
          mapLog,
          originLat: mapLog.meta && mapLog.meta.mapDerivedXY ? mapLog.meta.mapDerivedXY.originLat : null,
          originLon: mapLog.meta && mapLog.meta.mapDerivedXY ? mapLog.meta.mapDerivedXY.originLon : null,
          lapCount: sharedLaps.length
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
    const fit = computeAutoMapOffsetFit(selFiles, selectedLaps);
    if (!fit) {
      const aimOrigin = getFirstDerivedMapOrigin(selFiles);
      const manualOrigin = getManualMapOrigin();
      const fallbackOrigin = aimOrigin || manualOrigin;
      if (fallbackOrigin) {
        const addedCols = updateGpBikesDerivedLatLon(getMapOffsets(), fallbackOrigin);
        if (addedCols) {
          populateYSelect();
          populateXCustomSelect();
        }
        if (aimOrigin) setMapCenterInputsIfAuto(aimOrigin);
        const originSource = aimOrigin ? 'AiM origin' : 'manual center origin';
        const centerSuffix = buildCenterInfoSuffix(fallbackOrigin);
        updateMapFitInfo(`Auto fit waiting for both Lat/Lon-derived and PosX/PosY datasets. Using ${originSource} for GP Bikes Derived Latitude/Longitude.${centerSuffix}`);
      } else {
        updateMapFitInfo('Auto fit waiting for both Lat/Lon-derived and PosX/PosY datasets. Enter Center Lat/Lng to derive GP Bikes Latitude/Longitude without AiM data.');
      }
      return;
    }

    const signature = `${fit.posLog.id}|${fit.mapLog.id}|${fit.pairCount}|${fit.lapCount}`;
    const shouldApply = !mapOffsetManuallyAdjusted || lastAutoOffsetSignature !== signature;
    if (shouldApply) {
      setMapOffsetInputs(fit.offsetX, fit.offsetY);
      mapOffsetManuallyAdjusted = false;
      lastAutoOffsetSignature = signature;
    }

    const offsets = getMapOffsets();
    const fitOrigin = { originLat: fit.originLat, originLon: fit.originLon };
    const addedCols = updateGpBikesDerivedLatLon(offsets, fitOrigin);
    if (addedCols) {
      populateYSelect();
      populateXCustomSelect();
    }
    setMapCenterInputsIfAuto(fitOrigin);

    const fitErr = Number.isFinite(fit.meanAbsError) ? fit.meanAbsError.toFixed(3) : 'n/a';
    const centerSuffix = buildCenterInfoSuffix(fitOrigin);
    updateMapFitInfo(`Auto offset X=${fit.offsetX.toFixed(3)} m, Y=${fit.offsetY.toFixed(3)} m | Avg error ${fitErr} m (${fit.pairCount} pts)${centerSuffix}`);
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

    let mapColorScaleConfig = null;
    if (mapColorEnabled && Number.isFinite(mapColorMin) && Number.isFinite(mapColorMax)) {
      let markerCmin = mapColorMin;
      let markerCmax = mapColorMax;
      let markerColorscale = 'Viridis';

      if (mapColorMode === 'divergent') {
        markerColorscale = 'RdBu';
        if (mapColorMin < 0 && mapColorMax > 0) {
          const zeroPos = (0 - markerCmin) / (markerCmax - markerCmin);
          markerColorscale = [
            [0, '#2166ac'],
            [zeroPos, '#f7f7f7'],
            [1, '#b2182b']
          ];
        }
      }

      if (markerCmin === markerCmax) {
        markerCmax = markerCmin + 1;
      }

      mapColorScaleConfig = {
        cmin: markerCmin,
        cmax: markerCmax,
        colorscale: markerColorscale
      };
    }

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

    const mapLayout = {
      margin: { t: 30, l: 60, r: 20, b: 55 },
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

  function buildLayout(mainXTitle, ycols, includeTimeSlip) {
    const mainDomain = includeTimeSlip ? [0.16,1] : [0,1];
    const axisCfg = buildChannelAxisConfig(ycols, mainDomain);

    if (!includeTimeSlip) {
      const layout = {
        margin:{t:30},
        xaxis:{title: mainXTitle},
        showlegend:false,
        height: getFigureHeight(false)
      };
      layout.margin.l = axisCfg.marginLeft;
      layout.margin.r = axisCfg.marginRight;
      Object.assign(layout, axisCfg.axisLayout);
      return {layout, channelToRef: axisCfg.channelToRef};
    }

    const layout = {
      margin:{t:30},
      xaxis:{title: mainXTitle, domain:[0,1], anchor:'y'},
      xaxis2:{title:'Lap Distance (m)', domain:[0,1], anchor:'y2', matches:'x'},
      yaxis2:{title:'Time Slip (s)', domain:[0,0.12]},
      showlegend:false,
      height: getFigureHeight(true)
    };
    layout.margin.l = axisCfg.marginLeft;
    layout.margin.r = axisCfg.marginRight;
    Object.assign(layout, axisCfg.axisLayout);
    return {layout, channelToRef: axisCfg.channelToRef};
  }

  function getXSeriesForMode(log, maskIdx, xMode, customXCol) {
    if (xMode === 'distance') {
      if (!log.meta.lapRelDist) return null;
      return maskIdx.map(i => log.meta.lapRelDist[i]);
    }
    if (xMode === 'time') {
      return maskIdx.map(i => log.meta.lapTime[i]);
    }
    if (!customXCol || !log.cols.includes(customXCol)) return null;
    return maskIdx.map(i => log.data[i][customXCol]);
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
    const channelColors = new Map(ycols.map((y, i) => [y, COLORS[i % COLORS.length]]));
    const mainXTitle = xMode === 'distance'
      ? 'Lap Distance (m)'
      : (xMode === 'time' ? 'Lap Time (s)' : (customXCol || 'X Axis'));
    const tsBuilt = buildTimeSlipTraces(selFiles, selectedLaps, xMode);
    const tsPreview = tsBuilt.traces;
    const includeTimeSlip = tsPreview.length > 0;
    const built = buildLayout(mainXTitle, ycols, includeTimeSlip);
    const layout = built.layout;
    const channelToRef = built.channelToRef;
    let traces = [];

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
          const dash = DASHES[li % DASHES.length];
          traces.push({x: xArr, y: yArr, customdata: keyArr, yaxis: channelToRef.get(y) || 'y', name: `${log.name} — Lap ${lap} — ${y}`, mode: 'lines', marker:{color: traceColor}, line:{color: traceColor, dash}});
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

    Plotly.react(plotDiv, traces.concat(tsPreview), layout, plotlyConfig);
    bindMainPlotHoverSync();
    updateMapPlot(selFiles, selectedLaps);
  }

  // event handlers
  fileInput.addEventListener('change', (ev)=>{
    const files = Array.from(ev.target.files || []);
    files.forEach(f => parseFile(f));
    fileInput.value = '';
  });

  // replot when X axis mode changes
  const xRadios = document.querySelectorAll('input[name=xaxis]');
  xRadios.forEach(r=> r.addEventListener('change', ()=> {
    if (xCustomSelect) xCustomSelect.disabled = (r.value !== 'custom' || !r.checked);
    updatePlot();
  }));
  const shadeBox = document.getElementById('shadeLaps');
  if (shadeBox) shadeBox.addEventListener('change', ()=> updatePlot());
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
  ySelect.addEventListener('change', ()=> updatePlot());

  filesList.addEventListener('click', (ev)=>{
    if (ev.target.matches('button[data-remove]')) {
      const id = ev.target.getAttribute('data-remove');
      const idx = logs.findIndex(l=>l.id===id);
      if (idx>=0) {
        logs.splice(idx,1);
        mapOffsetManuallyAdjusted = false;
        lastAutoOffsetSignature = '';
        renderFilesList();
        populateYSelect();
        populateXCustomSelect();
        populateMapColorSelect();
        renderLapsList();
        Plotly.purge(plotDiv);
        if (mapDiv) {
          mapHoverLookup = new Map();
          mapHoverMarkerVisible = false;
          mapViewState = null;
          Plotly.purge(mapDiv);
        }
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

  plotBtn.addEventListener('click', ()=>{
    updatePlot();
  });

  clearBtn.addEventListener('click', ()=>{
    logs.length = 0;
    mapOffsetManuallyAdjusted = false;
    mapCenterManuallyAdjusted = false;
    lastAutoOffsetSignature = '';
    if (mapCenterLatInput) mapCenterLatInput.value = '';
    if (mapCenterLonInput) mapCenterLonInput.value = '';
    updateMapFitInfo('');
    renderFilesList();
    populateYSelect();
    populateXCustomSelect();
    populateMapColorSelect();
    renderLapsList();
    Plotly.purge(plotDiv);
    if (mapDiv) {
      mapHoverLookup = new Map();
      mapHoverMarkerVisible = false;
      mapViewState = null;
      Plotly.purge(mapDiv);
    }
    if (window.innerWidth <= 980) setControlsOpen(true);
  });

  // allow toggling file visibility by checking/unchecking checkboxes
  filesList.addEventListener('change', (ev)=>{
    if (ev.target.matches('input[type=checkbox]')) updatePlot();
  });

  loadChannelMapConfig();

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

})();
