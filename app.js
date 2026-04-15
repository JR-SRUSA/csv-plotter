(() => {
  const fileInput = document.getElementById('fileInput');
  const filesList = document.getElementById('filesList');
  const ySelect = document.getElementById('ySelect');
  const plotBtn = document.getElementById('plotBtn');
  const clearBtn = document.getElementById('clearBtn');
  const plotDiv = document.getElementById('plotDiv');
  const timeslipDiv = document.getElementById('timeslipDiv');

  const logs = []; // {id, name, data: [rows], cols: [names], meta: {timeCol, distCol, latCol, lonCol, computedDistance}}
  const COLORS = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'];
  const DASHES = ['solid','dash','dot','dashdot','longdash','longdashdot'];

  function idForName(name) {
    return name.replace(/[^a-z0-9]+/ig, '_') + '_' + Math.random().toString(36).slice(2,8);
  }

  function parseFile(file) {
    Papa.parse(file, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data; // array of arrays

        // find the header row: require multiple column-name matches
        function isHeaderRow(r) {
          if (!r || r.length < 3) return false;
          const headerTokens = ['time','timestamp','date','distance','dist','speed','lat','lon','engine','rpm','yaw','posx','posy','throttle','brake','gear'];
          let count = 0;
          for (const cell of r) {
            if (cell == null) continue;
            const s = String(cell).toLowerCase();
            for (const t of headerTokens) {
              if (s.includes(t)) { count++; break; }
            }
          }
          return count >= 2;
        }

        let headerRowIndex = rows.findIndex(r => isHeaderRow(r));
        if (headerRowIndex < 0) headerRowIndex = 0;

        const rawCols = rows[headerRowIndex].map(c => String(c).trim());

        // detect if next row is units (short non-numeric tokens) and capture it
        let dataStart = headerRowIndex + 1;
        let unitsRow = null;
        if (rows[dataStart] && rows[dataStart].every(cell => (cell === null || cell === undefined) || (typeof cell === 'string' && cell.length>0 && cell.length < 20 && isNaN(Number(cell))))) {
          unitsRow = rows[dataStart].map(c => c == null ? '' : String(c).trim());
          dataStart = headerRowIndex + 2;
        }

        // build objects mapping col->value for each data row
        const data = rows.slice(dataStart).map(r => {
          const obj = {};
          rawCols.forEach((c, i) => { obj[c] = r[i]; });
          return obj;
        }).filter(r => Object.keys(r).length > 0);

        const cols = rawCols;
        const units = {};
        rawCols.forEach((c,i)=> { units[c] = unitsRow && unitsRow[i] ? unitsRow[i] : ''; });
        const id = idForName(file.name);
        const meta = analyzeColumns(data, cols, units);
        meta.units = units;

        // compute lap numbers and lap times and append as columns
        computeLaps(meta);
        // expose lap columns in data rows and cols list
        if (!cols.includes('Lap Time')) cols.push('Lap Time');
        if (!cols.includes('Lap Number')) cols.push('Lap Number');
        data.forEach((r,i)=>{ r['Lap Time'] = meta.lapTime[i]; r['Lap Number'] = meta.lapNum[i]; });

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

  function analyzeColumns(data, cols, units = {}) {
    const lc = cols.map(c => c.toLowerCase());
    const timeIdx = lc.findIndex(c => /time|timestamp|date/.test(c));
    const distIdx = lc.findIndex(c => /dist|distance|odometer/.test(c));
    const latIdx = lc.findIndex(c => /^(lat|latitude)$/.test(c));
    const lonIdx = lc.findIndex(c => /^(lon|lng|longitude)$/.test(c));

    const meta = {timeCol: null, distCol: null, latCol: null, lonCol: null, computedDistance: null};
    if (timeIdx >= 0) meta.timeCol = cols[timeIdx];
    if (distIdx >= 0) meta.distCol = cols[distIdx];
    if (latIdx >= 0 && lonIdx >= 0) { meta.latCol = cols[latIdx]; meta.lonCol = cols[lonIdx]; }

    // parse time values and distance if needed
    if (meta.timeCol) {
      const timeUnit = units[meta.timeCol] || '';
      meta._time = data.map(r => parseTimeValue(r[meta.timeCol], timeUnit));
    } else {
      meta._time = data.map((_,i)=>i);
    }

    if (meta.distCol) {
      meta._dist = data.map(r => {
        const v = r[meta.distCol];
        return (typeof v === 'number') ? v : (isNaN(Number(v)) ? null : Number(v));
      });
    } else if (meta.latCol && meta.lonCol) {
      // compute haversine cumulative distance in meters
      const latArr = data.map(r => r[meta.latCol]);
      const lonArr = data.map(r => r[meta.lonCol]);
      const dist = [0];
      for (let i=1;i<latArr.length;i++) {
        const d = haversine(latArr[i-1], lonArr[i-1], latArr[i], lonArr[i]);
        dist.push(dist[dist.length-1] + d);
      }
      meta._dist = dist;
    } else {
      meta._dist = data.map((_,i)=>i);
    }

    return meta;
  }

  function parseTimeValue(v, unit) {
    if (v == null || v === '') return null;
    // prefer numeric seconds
    if (typeof v === 'number') {
      // treat numeric as seconds unless unit explicitly indicates ms
      if (unit && /ms/i.test(unit)) return v / 1000;
      return v;
    }
    const s = String(v).trim();
    if (!isNaN(Number(s))) return Number(s);
    const t = Date.parse(s);
    if (!isNaN(t)) return t / 1000;
    // try HH:MM:SS -> seconds since midnight
    const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?$/);
    if (m) {
      const h = parseInt(m[1],10), mm2 = parseInt(m[2],10), ss = parseInt(m[3]||0,10), ms = parseInt(m[4]||0,10);
      return h*3600 + mm2*60 + ss + (ms? ms/1000 : 0);
    }
    return null;
  }

  function computeLaps(meta) {
    // require _time and _dist arrays
    const t = meta._time || [];
    const d = meta._dist || [];
    const lapNum = [];
    const lapTime = [];
    const lapRelDist = [];
    let currentLap = 1;
    let lapStartTime = (t[0] != null) ? t[0] : 0;
    let prevD = (d[0] != null) ? d[0] : 0;
    let lapStartDist = (d[0] != null) ? d[0] : 0;
    for (let i=0;i<t.length;i++) {
      const di = d[i] != null ? d[i] : prevD;
      const ti = t[i] != null ? t[i] : (i>0 ? t[i-1] : 0);
      // detect lap reset: distance decreases significantly or resets to near zero
      if (i>0 && ((di < prevD - 1) || (di < 1 && prevD > 10))) {
        currentLap += 1;
        lapStartTime = ti;
        lapStartDist = di;
      }
      lapNum.push(currentLap);
      lapTime.push((ti - lapStartTime));
      lapRelDist.push(di - lapStartDist);
      prevD = di;
    }
    meta.lapNum = lapNum;
    meta.lapTime = lapTime;
    meta.lapRelDist = lapRelDist;
  }

  function haversine(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
    const R = 6371000; // m
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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

  function populateYSelect() {
    // collect numeric columns across logs and show unique
    const numericCols = new Set();
    logs.forEach(l => {
      l.cols.forEach(col => {
        // check if column appears numeric in at least one row
        const sample = l.data.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '');
        if (sample) {
          const val = sample[col];
          if (typeof val === 'number') numericCols.add(col);
          else if (!isNaN(Number(val))) numericCols.add(col);
        }
      });
    });
    const arr = Array.from(numericCols).sort();
    // use units when available; prefer units from the first log that has them
    ySelect.innerHTML = arr.map(c => {
      let unit = '';
      for (const l of logs) { if (l.meta && l.meta.units && l.meta.units[c]) { unit = l.meta.units[c]; break; } }
      const label = unit ? `${c} [${unit}]` : c;
      return `<option value="${c}">${label}</option>`;
    }).join('');
    // default-select Speed if present
    const opts = Array.from(ySelect.options);
    const speedOpt = opts.find(o => o.value.toLowerCase() === 'speed');
    if (speedOpt) { speedOpt.selected = true; }
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
    sel.forEach(l => {
      if (l.meta && l.meta.lapNum) l.meta.lapNum.forEach(n => lapSet.add(n));
    });
    const laps = Array.from(lapSet).sort((a,b)=>a-b);
    if (laps.length === 0) { container.innerHTML = ''; return; }
    // render as vertical list with colored checkboxes
    const html = ['<strong>Laps:</strong>', '<div class="laps-col">'];
    laps.forEach(n => {
      const color = COLORS[(n-1) % COLORS.length];
      html.push(`<label class="lap-item"><input type="checkbox" data-lap="${n}" checked style="accent-color:${color};" /> <span class="lap-label" style="color:${color}">Lap ${n}</span></label>`);
    });
    html.push('</div>');
    container.innerHTML = html.join('');
  }

  function getSelectedLaps() {
    const checks = document.querySelectorAll('#lapsList input[type=checkbox]');
    const result = new Set();
    checks.forEach(ch => { if (ch.checked) result.add(Number(ch.getAttribute('data-lap'))); });
    return result;
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

  function updatePlot() {
    const selFiles = getSelectedFiles();
    const ycols = getSelectedY();
    const xMode = document.querySelector('input[name=xaxis]:checked').value;
    const plotByLap = document.getElementById('plotByLap') && document.getElementById('plotByLap').checked;
    const selectedLaps = getSelectedLaps();
    let traces = [];

    // optionally compute shading envelope when plotting by lap
    const shadeLaps = document.getElementById('shadeLaps') && document.getElementById('shadeLaps').checked;

    // helper: linear interpolation
    function interpAt(xArr, yArr, x) {
      if (!xArr || xArr.length === 0) return null;
      // assume xArr sorted
      if (x <= xArr[0]) return (yArr[0] != null ? yArr[0] : null);
      if (x >= xArr[xArr.length-1]) return (yArr[yArr.length-1] != null ? yArr[yArr.length-1] : null);
      // find interval
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

    selFiles.forEach((log, li) => {
      const fileColor = COLORS[li % COLORS.length];
      if (plotByLap) {
        // plot each selected lap separately, x axis is Lap Time
        const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
        lapNums.forEach((lap, idx) => {
          if (selectedLaps.size && !selectedLaps.has(lap)) return;
          const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
          ycols.forEach(y => {
            const xArr = (xMode === 'distance' && log.meta.lapRelDist) ? maskIdx.map(i => log.meta.lapRelDist[i]) : maskIdx.map(i => log.meta.lapTime[i]);
            const yArr = maskIdx.map(i => log.data[i][y]);
            const lapColor = COLORS[(lap-1) % COLORS.length];
            const dash = DASHES[li % DASHES.length];
            traces.push({x: xArr, y: yArr, name: `${log.name} — Lap ${lap} — ${y}`, mode: 'lines', marker:{color: lapColor}, line:{color: lapColor, dash}});
          });
        });
      } else {
        const xArr = xMode === 'time' ? (log.meta._time || log.data.map((_,i)=>i)) : (log.meta._dist || log.data.map((_,i)=>i));
        ycols.forEach(y => {
          const yArr = log.data.map(r => r[y]);
          traces.push({x: xArr, y: yArr, name: `${log.name} — ${y}`, mode: 'lines', hoverinfo: 'x+y+name', line:{color: fileColor}, marker:{color: fileColor}});
        });
      }
    });

    // if shading requested and plotting by lap, compute envelope per Y channel
    if (plotByLap && shadeLaps && ycols.length>0) {
      // for each y channel compute global union x grid across all selected files/laps
      ycols.forEach(y => {
        const allLapSeries = [];
        selFiles.forEach((log, li) => {
          const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
          lapNums.forEach(lap => {
            if (selectedLaps.size && !selectedLaps.has(lap)) return;
            const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
            const xArr = (xMode === 'distance' && log.meta.lapRelDist) ? maskIdx.map(i => log.meta.lapRelDist[i]) : maskIdx.map(i => log.meta.lapTime[i]);
            const yArr = maskIdx.map(i => log.data[i][y]);
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
        const minTrace = {x: grid, y: minY, name: `Min ${y}`, mode: 'lines', line:{color: shadeColor, width:0}, fill:'none', showlegend:false, hoverinfo:'skip'};
        const maxTrace = {x: grid, y: maxY, name: `Max ${y}`, mode: 'lines', line:{color: shadeColor, width:0}, fill:'tonexty', fillcolor: shadeColor, showlegend:false, hoverinfo:'skip'};
        // put shading below all other traces
        traces = [minTrace, maxTrace].concat(traces);
      });
    }

    const layout = {
      margin:{t:30},
      xaxis:{title: plotByLap ? (xMode === 'distance' ? 'Lap Distance (m)' : 'Lap Time (s)') : (xMode === 'time' ? 'Time' : 'Distance (m)')},
      yaxis:{title: ycols.length===1? ycols[0] : 'Value'},
      legend:{orientation:'h'}
    };

    Plotly.react(plotDiv, traces, layout, {responsive:true});
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
  const plotByLapBox = document.getElementById('plotByLap');
  if (plotByLapBox) plotByLapBox.addEventListener('change', ()=> updatePlot());
  const shadeBox = document.getElementById('shadeLaps');
  if (shadeBox) shadeBox.addEventListener('change', ()=> updatePlot());

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

  const plotXYBtn = document.getElementById('plotXYBtn');
  if (plotXYBtn) {
    plotXYBtn.addEventListener('click', ()=>{
      const xcol = document.getElementById('xColSelect').value;
      const ycol = document.getElementById('xyYColSelect').value;
      if (!xcol || !ycol) return alert('Select both X and Y columns');
      const selFiles = getSelectedFiles();
      const traces = [];
      const plotByLap = document.getElementById('plotByLap') && document.getElementById('plotByLap').checked;
      const selectedLaps = getSelectedLaps();
      selFiles.forEach((log, idx) => {
        if (!log.cols.includes(xcol) || !log.cols.includes(ycol)) return;
        const fileColor = COLORS[idx % COLORS.length];
        if (plotByLap) {
          const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
          lapNums.forEach((lap) => {
            if (selectedLaps.size && !selectedLaps.has(lap)) return;
            const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
            const xArr = maskIdx.map(i => log.data[i][xcol]);
            const yArr = maskIdx.map(i => log.data[i][ycol]);
            const color = COLORS[(lap-1) % COLORS.length];
            const dash = DASHES[idx % DASHES.length];
            traces.push({x: xArr, y: yArr, name: `${log.name} — Lap ${lap} — ${ycol} vs ${xcol}`, mode: 'lines+markers', line:{color, dash}, marker:{color}});
          });
        } else {
          const xArr = log.data.map(r => r[xcol]);
          const yArr = log.data.map(r => r[ycol]);
          traces.push({x: xArr, y: yArr, name: `${log.name} — ${ycol} vs ${xcol}`, mode: 'lines+markers', hoverinfo: 'x+y+name', line:{color: fileColor}, marker:{color: fileColor}});
        }
      });
      const layout = {margin:{t:30}, xaxis:{title: xcol}, yaxis:{title: ycol}, legend:{orientation:'h'}};
      Plotly.react(plotDiv, traces, layout, {responsive:true});

      // Time Slip plot: only meaningful when X axis is distance and plotting by lap
      if (timeslipDiv) {
        if (xMode === 'distance' && plotByLap) {
          // build lap time series: each series has x=lapRelDist, t=lapTime
          const lapSeries = [];
          selFiles.forEach((log, li) => {
            const lapNums = Array.from(new Set(log.meta.lapNum || [])).sort((a,b)=>a-b);
            lapNums.forEach(lap => {
              if (selectedLaps.size && !selectedLaps.has(lap)) return;
              const maskIdx = log.meta.lapNum.map((n,i)=> n === lap ? i : -1).filter(i=>i>=0);
              const xArr = maskIdx.map(i => log.meta.lapRelDist[i]);
              const tArr = maskIdx.map(i => log.meta.lapTime[i]);
              if (xArr.length>0) lapSeries.push({file: log.name, lap, x: xArr, t: tArr});
            });
          });
          if (lapSeries.length === 0) {
            Plotly.purge(timeslipDiv);
          } else {
            // union grid of distances
            const xSet = new Set();
            lapSeries.forEach(s => s.x.forEach(v=> xSet.add(v)));
            const grid = Array.from(xSet).sort((a,b)=>a-b);

            // compute times at grid for each lap using interpAt
            const timeAt = lapSeries.map(s => grid.map(g => interpAt(s.x, s.t, g)));
            // compute fastest (min) time per grid point
            const fastest = grid.map((_, gi) => {
              const vals = timeAt.map(arr => arr[gi]).filter(v => v != null && !isNaN(v));
              if (vals.length === 0) return null;
              return Math.min(...vals);
            });

            // build traces: for each lap, delta = time - fastest
            const tsTraces = [];
            for (let si=0; si<lapSeries.length; si++) {
              const s = lapSeries[si];
              const deltas = timeAt[si].map((v, gi) => (v == null || fastest[gi] == null) ? null : (v - fastest[gi]));
              // skip series with all nulls
              if (deltas.every(v => v == null || isNaN(v))) continue;
              const color = COLORS[(s.lap-1) % COLORS.length];
              tsTraces.push({x: grid, y: deltas, name: `${s.file} — Lap ${s.lap}`, mode:'lines', line:{color}});
            }

            const tsLayout = {margin:{t:20}, xaxis:{title:'Lap Distance (m)'}, yaxis:{title:'Time Slip (s)'}, legend:{orientation:'h'}};
            Plotly.react(timeslipDiv, tsTraces, tsLayout, {responsive:true});
          }
          } else {
            // clear timeslip plot if not applicable
            Plotly.purge(timeslipDiv);
          }
    }
    });
  }

  clearBtn.addEventListener('click', ()=>{
    logs.length = 0; renderFilesList(); populateYSelect(); Plotly.purge(plotDiv);
  });

  // allow toggling file visibility by checking/unchecking checkboxes
  filesList.addEventListener('change', (ev)=>{
    if (ev.target.matches('input[type=checkbox]')) updatePlot();
  });

})();
