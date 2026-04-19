(() => {
  const LAP_SPLIT_DISTANCE_M = 100;
  const CRASH_LAP_DISTANCE_RATIO = 0.8;
  const DISTANCE_MONO_EPS_M = 0.5;

  function normalizedCells(row) {
    if (!Array.isArray(row)) return [];
    return row.map(c => (c == null ? '' : String(c).trim())).filter(Boolean);
  }

  function isDataLikeCell(value) {
    if (!value) return false;
    if (!isNaN(Number(value))) return true;
    if (!isNaN(Date.parse(value))) return true;
    return /^(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)$/.test(value);
  }

  function isHeaderRow(cells) {
    if (!cells || cells.length < 3) return false;
    const uniqueCount = new Set(cells.map(c => c.toLowerCase())).size;
    const textLikeCount = cells.filter(c => isNaN(Number(c))).length;
    return uniqueCount >= Math.max(2, Math.floor(cells.length * 0.6))
      && textLikeCount >= Math.max(2, Math.floor(cells.length * 0.5));
  }

  function findHeaderRowIndex(rows) {
    let fallbackIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const cells = normalizedCells(rows[i]);
      if (!isHeaderRow(cells)) continue;
      if (fallbackIdx < 0) fallbackIdx = i;

      // Allow one optional units row between header and numeric/data rows.
      const nextCells = normalizedCells(rows[i + 1]);
      const afterNextCells = normalizedCells(rows[i + 2]);
      const nextDataLike = nextCells.filter(isDataLikeCell).length;
      const afterNextDataLike = afterNextCells.filter(isDataLikeCell).length;
      if (nextDataLike >= 2 || afterNextDataLike >= 2) {
        return i;
      }
    }
    return fallbackIdx < 0 ? 0 : fallbackIdx;
  }

  function extractMetadata(rows, headerRowIndex) {
    const metadata = {};
    const maxRows = Math.max(0, Math.min(rows.length, headerRowIndex > 0 ? headerRowIndex : 40));
    for (let i = 0; i < maxRows; i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const key = row[0] == null ? '' : String(row[0]).trim();
      if (!key) continue;
      const keyNorm = key.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(metadata, keyNorm)) continue;

      let value = '';
      if (row.length > 1) {
        const values = row.slice(1).map(c => (c == null ? '' : String(c).trim())).filter(Boolean);
        value = values.join(', ');
      }

      if (value) {
        metadata[keyNorm] = value;
      }
    }
    return metadata;
  }

  function getMetadataValue(metadata, key) {
    if (!metadata || !key) return '';
    return metadata[String(key).toLowerCase()] || '';
  }

  function isGPBikesFormat(format) {
    return /^piboso\s+csv\s+file$/i.test(format || '');
  }

  function isAiMFormat(format) {
    return /^aim\s+csv\s+file$/i.test(format || '');
  }

  function isStandardFormat(rows, headerRowIndex, metadata = {}) {
    const format = getMetadataValue(metadata, 'format');
    if (isGPBikesFormat(format) || isAiMFormat(format)) return false;

    // Standard CSV is expected to be: one header row at the top, then data.
    if (headerRowIndex !== 0) return false;
    const headerCells = normalizedCells(rows[0]);
    if (!isHeaderRow(headerCells)) return false;

    const headerWidth = (rows[0] || []).length;
    if (headerWidth < 2) return false;

    const sampleRows = rows.slice(1, Math.min(rows.length, 26));
    if (sampleRows.length === 0) return false;

    const minDataLikeCells = Math.max(1, Math.floor(headerWidth * 0.2));
    const dataLikeRowCount = sampleRows.reduce((count, row) => {
      const rowCells = (row || []).slice(0, headerWidth).map(c => (c == null ? '' : String(c).trim()));
      const dataLikeCount = rowCells.filter(isDataLikeCell).length;
      return count + (dataLikeCount >= minDataLikeCells ? 1 : 0);
    }, 0);

    const minDataLikeRows = Math.max(2, Math.floor(sampleRows.length * 0.6));
    return dataLikeRowCount >= minDataLikeRows;
  }

  function processCsvRows(rows) {
    const headerRowIndex = findHeaderRowIndex(rows);
    const metadata = extractMetadata(rows, headerRowIndex);
    const format = getMetadataValue(metadata, 'format');
    const source = getMetadataValue(metadata, 'data source') || getMetadataValue(metadata, 'source');

    if (isGPBikesFormat(format)) {
      return processGPBikesRows(rows, headerRowIndex, { source, format, metadata });
    }

    if (isAiMFormat(format)) {
      return processAiMRows(rows, headerRowIndex, { source, format, metadata });
    }

    if (isStandardFormat(rows, headerRowIndex, metadata)) {
      return processStandardRows(rows, headerRowIndex, { source, format, metadata });
    }

    return processGenericRows(rows, headerRowIndex, { source, format, metadata });
  }

  function processGPBikesRows(rows, headerRowIndex, details = {}) {
    const source = details.source || 'GP Bikes';
    const format = details.format || 'PiBoSo CSV File';
    return processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {});
  }

  function processAiMRows(rows, headerRowIndex, details = {}) {
    const source = details.source || 'AiM';
    const format = details.format || 'AiM CSV File';
    return processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {});
  }

  function processStandardRows(rows, headerRowIndex, details = {}) {
    const source = details.source || 'Standard CSV';
    const format = details.format || 'Standard CSV';
    return processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {}, { allowUnitsRow: false });
  }

  function processGenericRows(rows, headerRowIndex, details = {}) {
    const source = details.source || 'Unknown';
    const format = details.format || 'Unknown';
    return processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {});
  }

  function processRowsWithCurrentMethod(rows, headerRowIndex, source, format, metadata = {}, options = {}) {
    const allowUnitsRow = options.allowUnitsRow !== false;
    const rawCols = (rows[headerRowIndex] || []).map(c => String(c).trim());
    const minSignalCount = Math.max(2, Math.floor(rawCols.length * 0.3));

    let dataStart = headerRowIndex + 1;
    let unitsRow = null;
    if (allowUnitsRow && rows[dataStart]) {
      const unitCandidate = rows[dataStart].slice(0, rawCols.length).map(c => (c == null ? '' : String(c).trim()));
      const nextRowCells = (rows[dataStart + 1] || []).slice(0, rawCols.length).map(c => (c == null ? '' : String(c).trim()));
      const unitTextLikeCount = unitCandidate.filter(v => v && !isDataLikeCell(v)).length;
      const unitDataLikeCount = unitCandidate.filter(v => isDataLikeCell(v)).length;
      const nextDataLikeCount = nextRowCells.filter(v => isDataLikeCell(v)).length;

      const looksLikeUnitsRow = unitTextLikeCount >= minSignalCount && nextDataLikeCount >= minSignalCount;
      const strictLegacyUnitsRow = unitDataLikeCount === 0 && unitTextLikeCount > 0;

      if (looksLikeUnitsRow || strictLegacyUnitsRow) {
        unitsRow = unitCandidate;
        dataStart = headerRowIndex + 2;
      }
    }

    const data = rows.slice(dataStart).map((r) => {
      const obj = {};
      rawCols.forEach((c, i) => {
        obj[c] = r[i];
      });
      return obj;
    }).filter(r => Object.keys(r).length > 0);

    const cols = rawCols;
    const units = {};
    rawCols.forEach((c, i) => {
      units[c] = unitsRow && unitsRow[i] ? unitsRow[i] : '';
    });

    const meta = analyzeColumns(data, cols, units);
    meta.units = units;
    meta.source = source;
    meta.format = format;
    meta.metadata = metadata;
    computeLaps(meta, metadata);

    return { data, cols, units, meta, source, format };
  }

  function analyzeColumns(data, cols, units = {}) {
    const lc = cols.map(c => c.toLowerCase());
    const timeIdx = lc.findIndex(c => /time|timestamp|date/.test(c));
    const distIdx = lc.findIndex(c => /dist|distance|odometer/.test(c));
    const latIdx = lc.findIndex(c => /^(lat|latitude)$/.test(c));
    const lonIdx = lc.findIndex(c => /^(lon|lng|longitude)$/.test(c));

    const meta = { timeCol: null, distCol: null, latCol: null, lonCol: null, computedDistance: null };
    if (timeIdx >= 0) meta.timeCol = cols[timeIdx];
    if (distIdx >= 0) meta.distCol = cols[distIdx];
    if (latIdx >= 0 && lonIdx >= 0) {
      meta.latCol = cols[latIdx];
      meta.lonCol = cols[lonIdx];
    }

    if (meta.timeCol) {
      const timeUnit = units[meta.timeCol] || '';
      meta._time = data.map(r => parseTimeValue(r[meta.timeCol], timeUnit));
    } else {
      meta._time = data.map((_, i) => i);
    }

    if (meta.distCol) {
      meta._dist = data.map((r) => {
        const v = r[meta.distCol];
        return (typeof v === 'number') ? v : (isNaN(Number(v)) ? null : Number(v));
      });
    } else if (meta.latCol && meta.lonCol) {
      const latArr = data.map(r => r[meta.latCol]);
      const lonArr = data.map(r => r[meta.lonCol]);
      const dist = [0];
      for (let i = 1; i < latArr.length; i++) {
        const d = haversine(latArr[i - 1], lonArr[i - 1], latArr[i], lonArr[i]);
        dist.push(dist[dist.length - 1] + d);
      }
      meta._dist = dist;
    } else {
      meta._dist = data.map((_, i) => i);
    }

    return meta;
  }

  function parseTimeValue(v, unit) {
    if (v == null || v === '') return null;
    if (typeof v === 'number') {
      if (unit && /ms/i.test(unit)) return v / 1000;
      return v;
    }
    const s = String(v).trim();
    if (!isNaN(Number(s))) return Number(s);
    const t = Date.parse(s);
    if (!isNaN(t)) return t / 1000;

    const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?$/);
    if (m) {
      const h = parseInt(m[1], 10);
      const mm2 = parseInt(m[2], 10);
      const ss = parseInt(m[3] || 0, 10);
      const ms = parseInt(m[4] || 0, 10);
      return h * 3600 + mm2 * 60 + ss + (ms ? ms / 1000 : 0);
    }
    return null;
  }

  function interpCrossingTime(d0, d1, t0, t1, threshold) {
    if (![d0, d1, t0, t1, threshold].every(v => Number.isFinite(v))) return null;
    if (d0 === d1) return t1;
    const ratio = (threshold - d0) / (d1 - d0);
    if (!Number.isFinite(ratio)) return null;
    const clamped = Math.min(1, Math.max(0, ratio));
    return t0 + (t1 - t0) * clamped;
  }

  function parseBeaconMarkers(metadata = {}) {
    const raw = getMetadataValue(metadata, 'beacon markers');
    if (!raw) return [];
    return raw
      .split(',')
      .map(s => Number(s.trim()))
      .filter(v => Number.isFinite(v) && v >= 0)
      .sort((a, b) => a - b);
  }

  function computeLaps(meta, metadata = {}) {
    const beaconMarkers = parseBeaconMarkers(metadata);
    const hasValidBeaconLaps = beaconMarkers.length > 0 && Array.isArray(meta._time) && meta._time.length > 0;
    if (hasValidBeaconLaps) {
      computeLapsFromBeacons(meta, beaconMarkers);
    } else {
      computeLapsFromDistance(meta);
    }
    computeCrashFlags(meta);
  }

  function computeLapsFromBeacons(meta, beaconMarkers) {
    const t = meta._time || [];
    const d = meta._dist || [];
    const lapNum = [];
    const lapTime = [];
    const lapRelDist = [];

    let markerIdx = 0;
    let currentLap = 0;

    for (let i = 0; i < t.length; i++) {
      const tiRaw = t[i];
      const ti = Number.isFinite(tiRaw) ? tiRaw : (i > 0 ? (Number.isFinite(t[i - 1]) ? t[i - 1] : 0) : 0);

      while (markerIdx < beaconMarkers.length && ti >= beaconMarkers[markerIdx]) {
        markerIdx += 1;
      }
      currentLap = markerIdx;

      const lapStartTime = currentLap <= 0 ? 0 : beaconMarkers[currentLap - 1];
      const lapStartDist = findLapStartDistanceByTime(meta, lapStartTime, i);
      const di = d[i] != null ? d[i] : (i > 0 ? d[i - 1] : 0);

      lapNum.push(currentLap);
      lapTime.push(Math.max(0, ti - lapStartTime));
      lapRelDist.push(Number.isFinite(di) && Number.isFinite(lapStartDist) ? (di - lapStartDist) : 0);
    }

    meta.lapNum = lapNum;
    meta.lapTime = lapTime;
    meta.lapRelDist = lapRelDist;
  }

  function findLapStartDistanceByTime(meta, lapStartTime, upToIndex) {
    const t = meta._time || [];
    const d = meta._dist || [];
    if (!Number.isFinite(lapStartTime)) return 0;
    for (let i = 0; i <= upToIndex && i < t.length; i++) {
      if (Number.isFinite(t[i]) && t[i] >= lapStartTime) {
        const di = d[i];
        return Number.isFinite(di) ? di : 0;
      }
    }
    return 0;
  }

  function computeLapsFromDistance(meta) {
    const t = meta._time || [];
    const d = meta._dist || [];
    const lapNum = [];
    const lapTime = [];
    const lapRelDist = [];
    const lapHasDistanceDrop = new Map();
    let currentLap = 1;
    let lapStartTime = (t[0] != null) ? t[0] : 0;
    let prevD = (d[0] != null) ? d[0] : 0;
    let prevT = (t[0] != null) ? t[0] : 0;
    let lapStartDist = 0;

    for (let i = 0; i < t.length; i++) {
      const di = d[i] != null ? d[i] : prevD;
      const ti = t[i] != null ? t[i] : (i > 0 ? t[i - 1] : 0);
      const crossedSplitZone = i > 0
        && prevD >= LAP_SPLIT_DISTANCE_M
        && di < LAP_SPLIT_DISTANCE_M
        && di < prevD - 1;

      if (!crossedSplitZone && i > 0 && di < prevD - DISTANCE_MONO_EPS_M) {
        lapHasDistanceDrop.set(currentLap, true);
      }

      if (crossedSplitZone) {
        const splitTime = interpCrossingTime(prevD, di, prevT, ti, LAP_SPLIT_DISTANCE_M) ?? ti;
        if (lapTime.length > 0) {
          lapTime[lapTime.length - 1] = splitTime - lapStartTime;
        }
        currentLap += 1;
        lapStartTime = splitTime;
        lapStartDist = 0;
      }

      lapNum.push(currentLap);
      lapTime.push(ti - lapStartTime);
      lapRelDist.push(di - lapStartDist);
      prevD = di;
      prevT = ti;
    }

    meta.lapNum = lapNum;
    meta.lapTime = lapTime;
    meta.lapRelDist = lapRelDist;
  }

  function computeCrashFlags(meta) {
    const lapNum = meta.lapNum || [];
    const lapRelDist = meta.lapRelDist || [];
    const lapMaxDistance = new Map();
    const lapHasDistanceDrop = new Map();
    const lapLastRelDist = new Map();
    lapNum.forEach((lap, i) => {
      const rel = lapRelDist[i];
      if (!Number.isFinite(rel)) return;
      const prevRel = lapLastRelDist.get(lap);
      if (Number.isFinite(prevRel) && rel < prevRel - DISTANCE_MONO_EPS_M) {
        lapHasDistanceDrop.set(lap, true);
      }
      lapLastRelDist.set(lap, rel);
      lapMaxDistance.set(lap, Math.max(lapMaxDistance.get(lap) || 0, rel));
    });

    const sortedLaps = Array.from(new Set(lapNum)).sort((a, b) => a - b);
    const crashLapSet = new Set();
    const completedLapDistances = [];

    sortedLaps.forEach((lap) => {
      const totalDist = lapMaxDistance.get(lap) || 0;
      const hasDrop = lapHasDistanceDrop.get(lap) === true;
      if (hasDrop) crashLapSet.add(lap);

      if (completedLapDistances.length > 0) {
        const avgPrevDist = completedLapDistances.reduce((sum, v) => sum + v, 0) / completedLapDistances.length;
        if (avgPrevDist > 0 && totalDist < avgPrevDist * CRASH_LAP_DISTANCE_RATIO) {
          crashLapSet.add(lap);
        }
      }
      completedLapDistances.push(totalDist);
    });

    meta.crashLapSet = crashLapSet;
    meta.crashLapByIndex = lapNum.map(lap => crashLapSet.has(lap));
  }

  function haversine(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
    const R = 6371000;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  window.LogFileProcessors = {
    processCsvRows,
    isGPBikesFormat,
    isAiMFormat,
    isStandardFormat
  };
})();
