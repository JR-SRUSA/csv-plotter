(() => {
  const fileInput = document.getElementById('fileInput');
  const filesList = document.getElementById('filesList');
  const ySelect = document.getElementById('ySelect');
  const plotBtn = document.getElementById('plotBtn');
  const clearBtn = document.getElementById('clearBtn');
  const plotDiv = document.getElementById('plotDiv');
  const controlsToggle = document.getElementById('controlsToggle');
  const controlsClose = document.getElementById('controlsClose');
  const controlsBackdrop = document.getElementById('controlsBackdrop');
  const plotlyConfig = {responsive:true, displaylogo:false};
  const DEFAULT_Y_CHANNEL = 'Speed';

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
        populateXYSelects();
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

  function populateXYSelects() {
    const allCols = new Set();
    logs.forEach(l=> l.cols.forEach(c=> allCols.add(c)));
    const arr = Array.from(allCols).sort();
    const makeOpt = (c) => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const label = unit ? `${c} [${unit}]` : c;
      return `<option value="${c}">${label}</option>`;
    };
    const xColSelect = document.getElementById('xColSelect');
    const xyYColSelect = document.getElementById('xyYColSelect');
    if (xColSelect) {
      xColSelect.innerHTML = arr.map(makeOpt).join('');
      // default X to PosX if present
      const opt = Array.from(xColSelect.options).find(o=>o.value.toLowerCase()==='posx');
      if (opt) xColSelect.value = opt.value;
    }
    if (xyYColSelect) {
      xyYColSelect.innerHTML = arr.map(makeOpt).join('');
      // default Y to PosY if present
      const opty = Array.from(xyYColSelect.options).find(o=>o.value.toLowerCase()==='posy');
      if (opty) xyYColSelect.value = opty.value;
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

  function updatePlot() {
    const selFiles = getSelectedFiles();
    const ycols = getSelectedY();
    const xMode = document.querySelector('input[name=xaxis]:checked').value;
    const plotByLap = true;
    const selectedLaps = getSelectedLaps();
    // singleLapSelected: true when exactly one lap is visible across all files
    const totalSelectedLaps = Array.from(selectedLaps.values()).reduce((sum, s) => sum + s.size, 0);
    const singleLapSelected = totalSelectedLaps === 1;
    const channelColors = new Map(ycols.map((y, i) => [y, COLORS[i % COLORS.length]]));
    const mainXTitle = xMode === 'distance' ? 'Lap Distance (m)' : 'Lap Time (s)';
    const tsBuilt = buildTimeSlipTraces(selFiles, selectedLaps, xMode);
    const tsPreview = tsBuilt.traces;
    const includeTimeSlip = tsPreview.length > 0;
    const built = buildLayout(mainXTitle, ycols, includeTimeSlip);
    const layout = built.layout;
    const channelToRef = built.channelToRef;
    let traces = [];

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
        ycols.forEach(y => {
          const resolvedCol = resolveChannelForLog(y, log);
          if (!resolvedCol || !log.cols.includes(resolvedCol)) return; // channel not in this file
          const xArr = (xMode === 'distance' && log.meta.lapRelDist) ? maskIdx.map(i => log.meta.lapRelDist[i]) : maskIdx.map(i => log.meta.lapTime[i]);
          const yArr = maskIdx.map(i => log.data[i][resolvedCol]);
          const traceColor = singleLapSelected ? (channelColors.get(y) || fileColor) : colorForLap(lap);
          const dash = DASHES[li % DASHES.length];
          traces.push({x: xArr, y: yArr, yaxis: channelToRef.get(y) || 'y', name: `${log.name} — Lap ${lap} — ${y}`, mode: 'lines', marker:{color: traceColor}, line:{color: traceColor, dash}});
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
            const xArr = (xMode === 'distance' && log.meta.lapRelDist) ? maskIdx.map(i => log.meta.lapRelDist[i]) : maskIdx.map(i => log.meta.lapTime[i]);
            const yArr = maskIdx.map(i => log.data[i][resolvedCol]);
            if (xArr.length>0) allLapSeries.push({x:xArr, y:yArr});
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
  }

  // event handlers
  fileInput.addEventListener('change', (ev)=>{
    const files = Array.from(ev.target.files || []);
    files.forEach(f => parseFile(f));
    fileInput.value = '';
  });

  // replot when X axis mode changes
  const xRadios = document.querySelectorAll('input[name=xaxis]');
  xRadios.forEach(r=> r.addEventListener('change', ()=> updatePlot()));
  const shadeBox = document.getElementById('shadeLaps');
  if (shadeBox) shadeBox.addEventListener('change', ()=> updatePlot());
  ySelect.addEventListener('change', ()=> updatePlot());

  filesList.addEventListener('click', (ev)=>{
    if (ev.target.matches('button[data-remove]')) {
      const id = ev.target.getAttribute('data-remove');
      const idx = logs.findIndex(l=>l.id===id);
      if (idx>=0) { logs.splice(idx,1); renderFilesList(); populateYSelect(); Plotly.purge(plotDiv); }
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

  function renderXYPlot(showAlertIfMissing = false) {
    const xcol = document.getElementById('xColSelect').value;
    const ycol = document.getElementById('xyYColSelect').value;
    if (!xcol || !ycol) {
      if (showAlertIfMissing) alert('Select both X and Y columns');
      return;
    }

    const selFiles = getSelectedFiles();
    const traces = [];
    const plotByLap = true;
    const selectedLaps = getSelectedLaps();
    selFiles.forEach((log, idx) => {
      if (!log.cols.includes(xcol) || !log.cols.includes(ycol)) return;
      const fileColor = COLORS[idx % COLORS.length];
      const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
      lapNums.forEach((lap) => {
        if (!isLapSelected(selectedLaps, log.id, lap)) return;
        const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
        const xArr = maskIdx.map(i => log.data[i][xcol]);
        const yArr = maskIdx.map(i => log.data[i][ycol]);
        const color = colorForLap(lap);
        const dash = DASHES[idx % DASHES.length];
        traces.push({x: xArr, y: yArr, name: `${log.name} — Lap ${lap} — ${ycol} vs ${xcol}`, mode: 'lines+markers', line:{color, dash}, marker:{color}});
      });
    });
    const built = buildLayout(xcol, [ycol], false);
    Plotly.react(plotDiv, traces, built.layout, plotlyConfig);
  }

  const xColSelect = document.getElementById('xColSelect');
  const xyYColSelect = document.getElementById('xyYColSelect');
  if (xColSelect) xColSelect.addEventListener('change', ()=> renderXYPlot(false));
  if (xyYColSelect) xyYColSelect.addEventListener('change', ()=> renderXYPlot(false));

  const plotXYBtn = document.getElementById('plotXYBtn');
  if (plotXYBtn) {
    plotXYBtn.addEventListener('click', ()=>{
      renderXYPlot(true);
    });
  }

  clearBtn.addEventListener('click', ()=>{
    logs.length = 0; renderFilesList(); populateYSelect(); Plotly.purge(plotDiv);
    if (window.innerWidth <= 980) setControlsOpen(true);
  });

  // allow toggling file visibility by checking/unchecking checkboxes
  filesList.addEventListener('change', (ev)=>{
    if (ev.target.matches('input[type=checkbox]')) updatePlot();
  });

  loadChannelMapConfig();

})();
