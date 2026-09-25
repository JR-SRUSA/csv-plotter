// Vehicle dynamics simulation -- the "Simulate Vehicle" panel: whole-circuit racing-line
// fit + lap simulation, engine/gearing (Gear/RPM), lean, aero/slope/tire and wheel-load
// channels, the same channels computed for logged laps, and saving/renaming sim runs.
//
// Lives outside app.js so a build can leave it out entirely (scripts/build-production.js
// --no-vehicle-sim, which also drops racing-line-calculations.js and the panel's markup).
// app.js calls window.VehicleSim.init(host) once at startup with the shared state and
// helpers listed in HOST_KEYS, and init returns the three hooks app.js calls back into
// (see simHooks in app.js, which are no-ops when this file isn't loaded).
(() => {
  const HOST_KEYS = [
    // State
    'logs', 'sessionsApi', 'sessionsFiles', 'appVersionLabel', 'binnedPlotAxisSelect',
    // Constants
    'COMMON_LAT_ACC_CHANNEL', 'COMMON_LONG_ACC_CHANNEL', 'DERIVED_MAP_X_COL', 'DERIVED_MAP_Y_COL',
    'RACING_LINE_DEFAULT_WEIGHTS',
    // Channel / data helpers
    'getRacingLineCalculationsApi', 'resolveChannelForLog', 'computeWindowedAverage', 'getMapSourceForLog',
    'addCalculatedCommonChannels', 'getNativeXYCols', 'getLogVenue', 'interpAt', 'csvEscapeValue',
    'getSelectedFiles', 'getSelectedLaps', 'getReferenceLapForCorners',
    'simChannelsFileName', 'isSimChannelsRecord',
    // Re-render / populate
    'renderFilesList', 'renderLapsList', 'updatePlot', 'populateYSelect', 'populateXCustomSelect',
    'populateMapColorSelect', 'populateColorAxisSelect', 'populateDataFilterChannelSelect',
    'populateAxisChannelSelect', 'renderStoredFilesList', 'renderPickerList',
    // Stored files
    'getAllFilesFromDB', 'storeFileInDB', 'computeFileHash', 'extractCsvFileMetadata'
  ];

  function init(host) {
    const missing = HOST_KEYS.filter((k) => host[k] === undefined);
    if (missing.length) {
      console.error('VehicleSim: app.js did not provide ' + missing.join(', ') + ' -- the Simulate Vehicle panel will not work correctly.');
    }
    const {
      logs, sessionsApi, sessionsFiles, appVersionLabel, binnedPlotAxisSelect,
      COMMON_LAT_ACC_CHANNEL, COMMON_LONG_ACC_CHANNEL, DERIVED_MAP_X_COL, DERIVED_MAP_Y_COL,
      RACING_LINE_DEFAULT_WEIGHTS,
      getRacingLineCalculationsApi, resolveChannelForLog, computeWindowedAverage, getMapSourceForLog,
      addCalculatedCommonChannels, getNativeXYCols, getLogVenue, interpAt, csvEscapeValue,
      getSelectedFiles, getSelectedLaps, getReferenceLapForCorners,
      simChannelsFileName, isSimChannelsRecord,
      renderFilesList, renderLapsList, updatePlot, populateYSelect, populateXCustomSelect,
      populateMapColorSelect, populateColorAxisSelect, populateDataFilterChannelSelect,
      populateAxisChannelSelect, renderStoredFilesList, renderPickerList,
      getAllFilesFromDB, storeFileInDB, computeFileHash, extractCsvFileMetadata
    } = host;

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
          if (!log.cols.includes('Required Lean Angle (sim)')) log.cols.push('Required Lean Angle (sim)');
          for (let i = 0; i < n; i++) log.data[i]['Required Lean Angle (sim)'] = result.leanDeg[i];
          log.meta.units['Required Lean Angle (sim)'] = 'deg';
          extraChannels.push('Required Lean Angle (sim)');
        }
        if (isMoto && result.leanRateDegS) {
          if (!log.cols.includes('Required Lean Angle Rate (sim)')) log.cols.push('Required Lean Angle Rate (sim)');
          for (let i = 0; i < n; i++) log.data[i]['Required Lean Angle Rate (sim)'] = result.leanRateDegS[i];
          log.meta.units['Required Lean Angle Rate (sim)'] = 'deg/s';
          extraChannels.push('Required Lean Angle Rate (sim)');
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
        channel(moto, 'Required Lean Angle (sim)', 'arctan(lateral g), in degrees, signed like LatAcc. It is the lean of the bike + rider centre of mass.'),
        channel(moto, 'Required Lean Angle Rate (sim)', 'how fast that lean has to change, deg/s.'),
        channel(engineReady, 'Gear (sim)', 'the gear giving the most wheel power at that speed (subject to the shift-time rule below).'),
        channel(engineReady, 'RPM (sim)', 'engine RPM in that gear from road speed, gearing and tire size' + (moto ? ', corrected for lean.' : '.')),
        channel(true, 'Aero Decel (sim)', 'the deceleration aerodynamic drag alone causes at that speed, from Mass and CdA -- always positive.'),
        channel(true, 'Slope Decel (sim)', "gravity's own share, from the source lap's track grade -- 0 on a flat track or with the elevation option off."),
        channel(true, 'Tire Longitudinal Grip (sim)', 'LongAcc with Aero and Slope Decel added back in: the net grip the tires alone are using, positive (driving) or negative (braking).'),
        channel(loadsReady, 'Front/Rear ' + loadLabel, 'longitudinal weight transfer (plus an aero pitching share, if CoP height is set) applied to the static split, in kg -- see Assumptions.'),
        '</ul>',
        '<h4>Logged data</h4><ul>',
        "<li><strong>RPM (sim)</strong>, <strong>Gear (sim)</strong>" + (moto ? ', <strong>Required Lean Angle (sim)</strong>, <strong>Required Lean Angle Rate (sim)</strong>' : '') + ", <strong>Aero Decel (sim)</strong>, <strong>Slope Decel (sim)</strong>, <strong>Tire Longitudinal Grip (sim)</strong> and <strong>Front/Rear " + loadLabel + "</strong> can be added to real laps with <em>Simulate RPM, Gear, Lean &amp; Decel for Logged Data</em>, computed from the logged Speed, LongAcc" + (moto ? ' and LatAcc' : '') + " -- each one only where it applies, so e.g. Aero/Tire Decel (Speed + LongAcc + a Mass/CdA) are added even with no vehicle picked, or on a car, while the Load channels need a vehicle with the Weight Transfer fields filled in. They use the same channel names as the simulated lap so the two overlay, and never overwrite the log's own channels. If the log is a stored file, they're also saved as a small linked file (same sessions/vehicle/rider) and re-applied automatically next time it's loaded.</li>",
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
    const SIM_LEAN_COL = 'Required Lean Angle (sim)';
    const SIM_LEAN_RATE_COL = 'Required Lean Angle Rate (sim)';
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
      'RPM (sim)': 'rpm', 'Gear (sim)': '', 'Required Lean Angle (sim)': 'deg', 'Required Lean Angle Rate (sim)': 'deg/s',
      'Aero Decel (sim)': 'g', 'Slope Decel (sim)': 'g', 'Tire Longitudinal Grip (sim)': 'g',
      'Front Wheel Load (sim)': 'kg', 'Rear Wheel Load (sim)': 'kg',
      'Front Axle Load (sim)': 'kg', 'Rear Axle Load (sim)': 'kg'
    };

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

    return { applyLinkedSimChannels, persistSyntheticLogForSession, refreshVehicleSimLists };
  }

  window.VehicleSim = { init };
})();
