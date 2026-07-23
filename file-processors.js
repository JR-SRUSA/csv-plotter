(() => {
  const LAP_SPLIT_DISTANCE_M = 100;
  const CRASH_LAP_DISTANCE_RATIO = 0.8;
  const DISTANCE_MONO_EPS_M = 0.5;
  const SCAN_MY_TESLA_DEFAULT_RESAMPLE_HZ = 20;
  const SMT_CALC_BATTERY_AMPS_COL = 'Battery Amps (calc)';
  const SMT_CALC_MOTOR_POWER_TOTAL_COL = 'Motor Power Total (calc)';
  const SMT_CALC_EFFICIENCY_COL = 'Efficiency (calc)';
  const TOTAL_ACCEL_CALC_COL = 'Total Acceleration (calc)';
  // Racelogic VBOX raw channel name -> this app's canonical channel-map displayName, so
  // resolveChannelForLog's fallback (used for every format besides GP Bikes/AiM/MoTeC)
  // picks these up automatically for corner detection, map coloring defaults, etc.
  const VBOX_CHANNEL_RENAMES = {
    Velocity: 'Speed',
    Height: 'Altitude',
    LatAccel: 'LatAcc',
    LongAccel: 'LongAcc'
  };

  function normalizedCells(row) {
    if (!Array.isArray(row)) return [];
    return row.map(c => (c == null ? '' : String(c).trim())).filter(Boolean);
  }

  // Sniffs the raw file text (before Papa.parse tokenizes it) to tell tab-delimited logs
  // apart from ordinary comma CSVs -- PapaParse's own delimiter auto-detection already
  // covers comma/semicolon/pipe well, but content-sniffing a short or metadata-heavy tab
  // file can be less reliable than just checking for tab characters directly.
  // Returns 'tab' | 'auto' (let Papa.parse's own guess run).
  function detectFieldDelimiter(text) {
    const lines = String(text || '')
      .split(/\r\n|\r|\n/)
      .map(l => l.trim())
      .filter(l => l !== '')
      .slice(0, 40);
    if (lines.length === 0) return 'auto';

    let commaLines = 0, tabLines = 0;
    lines.forEach(line => {
      if (line.indexOf(',') >= 0) commaLines += 1;
      if (line.indexOf('\t') >= 0) tabLines += 1;
    });

    const n = lines.length;
    if (commaLines / n >= 0.5) return 'auto'; // comma CSV -- untouched, existing behavior
    if (tabLines / n >= 0.5) return 'tab';
    return 'auto';
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
      // A genuine "header, units row, data" layout has the units row's cell count
      // match the header's (one unit per column). A metadata row that happens to pass
      // isHeaderRow too usually won't line up in width with the real header row that
      // follows it. Use that mismatch to keep looking instead of locking onto the
      // metadata row here.
      const nextLooksLikeRealHeader = isHeaderRow(nextCells) && nextCells.length !== cells.length;
      if (nextDataLike >= 2 || (afterNextDataLike >= 2 && !nextLooksLikeRealHeader)) {
        return i;
      }
    }
    return fallbackIdx < 0 ? 0 : fallbackIdx;
  }

  function findMoTeCHeaderRowIndex(rows) {
    for (let i = 0; i < rows.length; i++) {
      const cells = normalizedCells(rows[i]);
      if (cells.length < 5) continue;
      if (!/^time$/i.test(cells[0])) continue;
      if (!/^distance$/i.test(cells[1])) continue;

      const nextCells = normalizedCells(rows[i + 1]);
      const nextTextLikeCount = nextCells.filter(v => v && !isDataLikeCell(v)).length;
      if (nextCells.length >= 2 && nextTextLikeCount >= 2) {
        return i;
      }
    }

    return findHeaderRowIndex(rows);
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
        // A single space, not ", " -- so a multi-word value spread across several
        // tab-separated cells (e.g. "Piboso CSV File") reassembles exactly, matching
        // the same format strings a comma CSV would produce in one cell.
        value = values.join(' ');
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

  function isMoTeCFormat(format) {
    return /(?:^|\b)motec\s+csv\s+file(?:\b|$)/i.test(format || '');
  }

  function getMetadataValueFromRows(rows, key, maxRows = 40) {
    if (!Array.isArray(rows) || !key) return '';
    const keyNorm = String(key).toLowerCase();
    const limit = Math.max(0, Math.min(rows.length, maxRows));
    for (let i = 0; i < limit; i++) {
      const row = rows[i];
      if (!Array.isArray(row) || row.length === 0) continue;
      const rowKey = row[0] == null ? '' : String(row[0]).trim().toLowerCase();
      if (rowKey !== keyNorm) continue;

      const values = row.slice(1).map(c => (c == null ? '' : String(c).trim())).filter(Boolean);
      return values.join(' ');
    }
    return '';
  }

  function isScanMyTeslaFormat(format, rows = [], headerRowIndex = 0, metadata = {}) {
    if (/scan\s*my\s*tesla/i.test(format || '')) return true;
    const source = getMetadataValue(metadata, 'data source') || getMetadataValue(metadata, 'source');
    if (/scan\s*my\s*tesla/i.test(source || '')) return true;

    const header = (rows[headerRowIndex] || []).map(c => String(c == null ? '' : c).trim().toLowerCase());
    if (header.length === 0) return false;

    const hasTime = header.some(c => /time|timestamp|date|utc/.test(c));
    const hasChannel = header.some(c => /channel|signal|name|parameter|pid/.test(c));
    const hasValue = header.some(c => /value|reading|data/.test(c));
    if (hasTime && hasChannel && hasValue) return true;

    // Sparse wide Scan My Tesla CSVs: first column is Time, many channel columns,
    // and each row updates only a small subset of channels.
    const firstCol = header[0] || '';
    if (!/time|timestamp|date|utc/.test(firstCol)) return false;
    if (header.length < 6) return false;

    const probeRows = rows.slice(headerRowIndex + 1, headerRowIndex + 1 + 50);
    if (probeRows.length === 0) return false;
    let sparseRows = 0;
    let validRows = 0;
    for (const row of probeRows) {
      if (!Array.isArray(row) || row.length === 0) continue;
      const t = parseTimeValue(row[0], '');
      if (!Number.isFinite(t)) continue;
      validRows += 1;

      const nonEmptySignals = row.slice(1).reduce((count, cell) => {
        const text = cell == null ? '' : String(cell).trim();
        return text ? (count + 1) : count;
      }, 0);
      if (nonEmptySignals > 0 && nonEmptySignals <= 2) {
        sparseRows += 1;
      }
    }

    return validRows >= 5 && (sparseRows / validRows) >= 0.6;
  }

  function isVIGradeFormat(rows, headerRowIndex) {
    // VIGrade files have no metadata preamble – header is the very first row.
    if (headerRowIndex !== 0) return false;
    const headerCells = normalizedCells(rows[0]);
    // VIGrade files are wide (typically hundreds of channels).
    if (headerCells.length < 10) return false;
    // The overwhelming majority of VIGrade column names use dot notation:
    //   Component.Channel  or  Component.Channel.Qualifier
    const dotNotationCount = headerCells.filter(c => /^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+$/.test(c)).length;
    if (dotNotationCount / headerCells.length < 0.5) return false;
    // The first column is always the time channel and contains "time" in its name.
    return /time/i.test(headerCells[0]);
  }

  // Finds the row index of a "[Section Name]" marker line (VBOX's ASCII export uses these
  // instead of the key,value metadata rows other formats have) within the first
  // searchLimit rows. The row after it holds that section's actual content.
  function findVBoxSectionRowIndex(rows, sectionPattern, searchLimit = 40) {
    const limit = Math.max(0, Math.min(rows.length, searchLimit));
    for (let i = 0; i < limit; i++) {
      const cells = normalizedCells(rows[i]);
      if (cells.length === 1 && sectionPattern.test(cells[0].replace(/^\uFEFF/, ''))) return i;
    }
    return -1;
  }

  // Racelogic VBOX ASCII export: bracket-delimited metadata sections ([File],
  // [Information], [Unit], [Column name]) rather than the key,value preamble other
  // formats use. Detected from the original log's filename (recorded verbatim in the
  // [File] section) ending in .vbo -- the upload itself is typically a re-exported/
  // converted .csv, so the extension on disk can't be used the way it is for .dat/.vbo.
  function isVBoxFormat(rows) {
    const fileSectionIdx = findVBoxSectionRowIndex(rows, /^\[file\]$/i, 5);
    if (fileSectionIdx < 0) return false;
    const nextCells = normalizedCells(rows[fileSectionIdx + 1]);
    return nextCells.length >= 1 && /\.vbo$/i.test(nextCells[0]);
  }

  function isStandardFormat(rows, headerRowIndex, metadata = {}) {
    const format = getMetadataValue(metadata, 'format');
    if (isGPBikesFormat(format) || isAiMFormat(format) || isMoTeCFormat(format)) return false;
    // VIGrade files would otherwise pass the standard-format check.
    if (isVIGradeFormat(rows, headerRowIndex)) return false;

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

  // TSV isn't detected from file content the way the other formats are -- there's no
  // metadata field or structural shape that reliably says "this came from a tab-delimited
  // file" after it's already been tokenized into rows. app.js's parseFile() does its own
  // delimiter sniffing before Papa.parse ever runs, so it's the one place that actually
  // knows -- it passes that along as options.delimiter.
  function isTsvFormat(options = {}) {
    return !!(options && options.delimiter === 'tab');
  }

  function processCsvRows(rows, options = {}) {
    const parsedOptions = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
    const formatHint = getMetadataValueFromRows(rows, 'format');
    const headerRowIndex = isMoTeCFormat(formatHint) ? findMoTeCHeaderRowIndex(rows) : findHeaderRowIndex(rows);
    const metadata = extractMetadata(rows, headerRowIndex);
    const format = getMetadataValue(metadata, 'format');
    const source = getMetadataValue(metadata, 'data source') || getMetadataValue(metadata, 'source');

    if (isGPBikesFormat(format)) {
      return processGPBikesRows(rows, headerRowIndex, { source, format, metadata });
    }

    if (isAiMFormat(format)) {
      return processAiMRows(rows, headerRowIndex, { source, format, metadata });
    }

    if (isMoTeCFormat(format)) {
      return processMoTeCRows(rows, headerRowIndex, { source, format, metadata });
    }

    // Checked before the generic detectors below -- VBOX's bracket-sectioned preamble
    // doesn't look like a key,value metadata block, so headerRowIndex/metadata above are
    // meaningless for it; processVBoxRows re-scans rows for its own section markers.
    if (isVBoxFormat(rows)) {
      return processVBoxRows(rows, { source, format, metadata });
    }

    if (isVIGradeFormat(rows, headerRowIndex)) {
      return processVIGradeRows(rows, headerRowIndex, { source, format, metadata });
    }

    if (isScanMyTeslaFormat(format, rows, headerRowIndex, metadata)) {
      return processScanMyTeslaRows(rows, headerRowIndex, { source, format, metadata }, {
        resampleHz: parsedOptions.scanMyTeslaHz
      });
    }

    if (isStandardFormat(rows, headerRowIndex, metadata)) {
      return processStandardRows(rows, headerRowIndex, { source, format, metadata });
    }

    if (isTsvFormat(parsedOptions)) {
      return processTsvRows(rows, headerRowIndex, { source, format, metadata });
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

  function processMoTeCRows(rows, headerRowIndex, details = {}) {
    const source = details.source || 'MoTeC';
    const format = details.format || 'MoTeC CSV File';
    return processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {});
  }

  function processStandardRows(rows, headerRowIndex, details = {}) {
    const source = details.source || 'Standard CSV';
    const format = details.format || 'Standard CSV';
    return processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {}, { allowUnitsRow: false });
  }

  function processTsvRows(rows, headerRowIndex, details = {}) {
    const source = details.source || 'TSV';
    const format = details.format || 'TSV';
    return processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {});
  }

  function processGenericRows(rows, headerRowIndex, details = {}) {
    // 'Generic' (not 'Unknown') so this matches the 'Generic' entry in AVAILABLE_DECODERS --
    // otherwise resolveDecoderName() can't map the source back to a decoder, no <option>
    // ends up marked selected, and the file list's decoder dropdown silently falls back to
    // displaying its first entry (GP Bikes) regardless of what actually decoded the file.
    const source = details.source || 'Generic';
    const format = details.format || 'Unknown';
    return processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {});
  }

  function processVIGradeRows(rows, headerRowIndex, details = {}) {
    const source = details.source || 'VIGrade';
    const format = details.format || 'VIGrade CSV';
    const processed = processRowsWithCurrentMethod(
      rows, headerRowIndex, source, format, details.metadata || {}, { allowUnitsRow: false }
    );
    filterAllZeroColumns(processed);
    return processed;
  }

  // Parses attributes off a raw XML tag/element source string, e.g. turns
  // `name="L1" unitsValue="" id="12"` into { name: 'L1', unitsValue: '', id: '12' }.
  function parseXmlTagAttrs(tagSource) {
    const attrs = {};
    const re = /([\w:-]+)\s*=\s*"([^"]*)"/g;
    let m;
    while ((m = re.exec(tagSource || ''))) {
      attrs[m[1]] = m[2];
    }
    return attrs;
  }

  // "Pressure (MPa)" -> "MPa" -- used as a fallback when a Component's unitsValue
  // attribute is blank but its human-readable plotLabel still names the unit.
  function unitFromPlotLabel(plotLabel) {
    const m = /\(([^)]+)\)\s*$/.exec(plotLabel || '');
    return m ? m[1].trim() : '';
  }

  // VIGrade .res files are XML (VI-CarRealTime/xrf schema), not delimited text, so they
  // don't go through the tokenized-rows pipeline the rest of this file shares. The
  // <StepMap> declares every logged channel as an <Entity>/<Component> pair with an "id"
  // -- crucially, that id is NOT a foreign key to a matching <Data id="..."> element (the
  // Data/Step "id"/"name" values are just a sequential save-set counter that coincidentally
  // overlaps with low Component ids). Instead every <Data><Step> holds one flattened,
  // whitespace-separated array of every channel's value at one time sample, and a
  // Component's "id" is the 1-based *position* of its value within that array.
  function parseVIGradeResChannelMap(xmlText) {
    const stepMapMatch = /<StepMap\b[^>]*>([\s\S]*?)<\/StepMap>/.exec(xmlText);
    const stepMapBody = stepMapMatch ? stepMapMatch[1] : '';

    const channelsById = new Map();
    const entityRe = /<Entity\b([^>]*)>([\s\S]*?)<\/Entity>/g;
    let entityMatch;
    while ((entityMatch = entityRe.exec(stepMapBody))) {
      const entityAttrs = parseXmlTagAttrs(entityMatch[1]);
      const entityBody = entityMatch[2];
      const entityLabel = (entityAttrs.entity || entityAttrs.name || '').trim();
      if (!entityLabel) continue;
      const isTimeEntity = entityLabel.toLowerCase() === 'time';

      const componentRe = /<Component\b([^>]*)\/>/g;
      let componentMatch;
      while ((componentMatch = componentRe.exec(entityBody))) {
        const compAttrs = parseXmlTagAttrs(componentMatch[1]);
        const id = parseInt(compAttrs.id, 10);
        if (!Number.isFinite(id)) continue;

        const componentName = (compAttrs.name || '').trim();
        const colName = isTimeEntity ? 'Time' : `${entityLabel}.${componentName}`;
        const unit = (compAttrs.unitsValue || '').trim() || unitFromPlotLabel(compAttrs.plotLabel);
        channelsById.set(id, { colName, unit });
      }
    }
    return channelsById;
  }

  function processVIGradeResXml(xmlText, details = {}) {
    const source = details.source || 'VIGrade';
    const format = details.format || 'VIGrade RES';
    const metadata = details.metadata || {};

    const channelsById = parseVIGradeResChannelMap(xmlText);
    const idsInColOrder = Array.from(channelsById.keys()).sort((a, b) => a - b);

    const cols = [];
    const units = {};
    idsInColOrder.forEach((id) => {
      const { colName, unit } = channelsById.get(id);
      if (!cols.includes(colName)) {
        cols.push(colName);
        units[colName] = unit;
      }
    });

    const data = [];
    const stepRe = /<Step\b[^>]*>([\s\S]*?)<\/Step>/g;
    let stepMatch;
    while ((stepMatch = stepRe.exec(xmlText))) {
      const nums = stepMatch[1].split(/\s+/).filter(Boolean).map(Number);
      if (!nums.length) continue;

      const row = {};
      idsInColOrder.forEach((id) => {
        const { colName } = channelsById.get(id);
        const v = nums[id - 1];
        row[colName] = Number.isFinite(v) ? v : null;
      });
      data.push(row);
    }

    if (cols.includes('Time')) {
      data.sort((a, b) => (a.Time ?? 0) - (b.Time ?? 0));
    }

    const meta = analyzeColumns(data, cols, units);
    meta.units = units;
    meta.source = source;
    meta.format = format;
    meta.metadata = metadata;
    computeLaps(meta, metadata);

    const processed = { data, cols, units, meta, source, format };
    filterAllZeroColumns(processed);
    return processed;
  }

  // Racelogic VBOX ASCII export (see isVBoxFormat). Structurally nothing like the other
  // formats' "metadata rows then one header row" shape, so this bypasses
  // processRowsWithCurrentMethod entirely and builds data/cols/units from the [Unit] and
  // [Column name] sections directly.
  function processVBoxRows(rows, details = {}) {
    const source = details.source || 'VBOX';
    const format = details.format || 'VBOX File';
    const metadata = details.metadata || {};

    const unitSectionIdx = findVBoxSectionRowIndex(rows, /^\[unit\]$/i);
    const columnSectionIdx = findVBoxSectionRowIndex(rows, /^\[column\s*names?\]$/i);
    if (unitSectionIdx < 0 || columnSectionIdx < 0) {
      // Malformed/unexpected preamble -- fall back to the generic path rather than throw.
      return processGenericRows(rows, findHeaderRowIndex(rows), details);
    }

    const rawUnits = (rows[unitSectionIdx + 1] || []).map(c => (c == null ? '' : String(c).trim()));
    const rawCols = (rows[columnSectionIdx + 1] || [])
      .map(c => (c == null ? '' : String(c).trim()))
      .filter(c => c !== '');

    const cols = rawCols.map(c => VBOX_CHANNEL_RENAMES[c] || c);
    const units = {};
    rawCols.forEach((rawCol, i) => {
      units[cols[i]] = rawUnits[i] || '';
    });

    const latIdx = rawCols.indexOf('Latitude');
    const lonIdx = rawCols.indexOf('Longitude');
    // Lat/lon convert from VBOX's raw arc-minutes into decimal degrees (see the
    // channel-renames comment above); the unit label needs to follow that conversion.
    if (latIdx >= 0) units['Latitude'] = 'deg';
    if (lonIdx >= 0) units['Longitude'] = 'deg';

    const dataStart = columnSectionIdx + 2;
    const data = [];
    for (let r = dataStart; r < rows.length; r++) {
      const cells = rows[r];
      if (!Array.isArray(cells) || cells.length < rawCols.length) continue;

      const obj = {};
      cols.forEach((displayCol, i) => {
        // PapaParse's dynamicTyping requires a bare leading "-", not "+" -- VBOX's ASCII
        // export signs every positive number explicitly (e.g. "+00158.62"), so those cells
        // arrive as untouched strings and need converting by hand here.
        const raw = cells[i];
        const num = toFiniteNumber(raw);
        obj[displayCol] = num !== null ? num : (raw == null ? '' : String(raw).trim());
      });

      if (latIdx >= 0) {
        const rawLat = toFiniteNumber(cells[latIdx]);
        obj['Latitude'] = Number.isFinite(rawLat) ? rawLat / 60 : null;
      }
      if (lonIdx >= 0) {
        const rawLon = toFiniteNumber(cells[lonIdx]);
        // VBOX stores longitude in arc-minutes with positive = WEST -- inverted from the
        // standard signed-degrees (positive = East) convention the map elsewhere assumes.
        obj['Longitude'] = Number.isFinite(rawLon) ? -(rawLon / 60) : null;
      }

      // (0, 0) -- "null island" -- is what a GPS receiver reports before it gets a fix,
      // not a real position; scrub it so it doesn't show up as a bogus point/spike on the
      // map or a false start/finish-line crossing.
      if (latIdx >= 0 && lonIdx >= 0 && obj['Latitude'] === 0 && obj['Longitude'] === 0) {
        obj['Latitude'] = null;
        obj['Longitude'] = null;
      }

      data.push(obj);
    }

    const meta = analyzeColumns(data, cols, units);
    meta.units = units;
    meta.source = source;
    meta.format = format;
    meta.metadata = metadata;
    computeLaps(meta, metadata);

    return { data, cols, units, meta, source, format };
  }

  function filterAllZeroColumns(processed) {
    if (!processed || !Array.isArray(processed.data) || !Array.isArray(processed.cols)) return;
    if (processed.data.length === 0) return;

    const timeCol = processed.meta && processed.meta.timeCol;

    const colsToKeep = processed.cols.filter((col) => {
      if (col === timeCol) return true;
      return processed.data.some((row) => {
        const v = toFiniteNumber(row[col]);
        return Number.isFinite(v) && v !== 0;
      });
    });

    const removedCols = new Set(processed.cols.filter(c => !colsToKeep.includes(c)));
    if (removedCols.size === 0) return;

    processed.cols = colsToKeep;

    if (processed.units) {
      removedCols.forEach(col => { delete processed.units[col]; });
    }

    processed.data.forEach((row) => {
      removedCols.forEach(col => { delete row[col]; });
    });

    refreshProcessedMeta(processed);
  }

  function processScanMyTeslaRows(rows, headerRowIndex, details = {}, options = {}) {
    const source = details.source || 'ScanMyTesla';
    const format = details.format || 'ScanMyTesla CSV';
    const resampleHz = normalizeResampleHz(options.resampleHz);

    const sparseResult = processScanMyTeslaSparseRows(rows, headerRowIndex, source, format, details.metadata || {}, resampleHz);
    if (sparseResult) {
      return sparseResult;
    }

    const base = processRowsWithCurrentMethod(rows, headerRowIndex, source, format, details.metadata || {}, { allowUnitsRow: false });
    normalizeScanMyTeslaTimeToSeconds(base);
    applyScanMyTeslaDefaultUnits(base);
    const resampled = resampleProcessedData(base, resampleHz);
    addScanMyTeslaCalculatedChannels(resampled);
    return resampled;
  }

  function processScanMyTeslaSparseRows(rows, headerRowIndex, source, format, metadata = {}, resampleHz = SCAN_MY_TESLA_DEFAULT_RESAMPLE_HZ) {
    const rawCols = (rows[headerRowIndex] || []).map(c => String(c == null ? '' : c).trim());
    if (rawCols.length === 0) return null;

    const lc = rawCols.map(c => c.toLowerCase());
    const timeIdx = lc.findIndex(c => /time|timestamp|date|utc/.test(c));
    const channelIdx = lc.findIndex(c => /channel|signal|name|parameter|pid/.test(c));
    const valueIdx = lc.findIndex(c => /value|reading|data/.test(c));
    const unitIdx = lc.findIndex(c => /^unit$|\bunit\b/.test(c));

    if (timeIdx < 0 || channelIdx < 0 || valueIdx < 0) return null;

    const rowsData = rows.slice(headerRowIndex + 1);
    const byTime = new Map();
    const channelOrder = [];
    const channelSet = new Set();
    const units = { Time: 's' };

    rowsData.forEach((row) => {
      if (!Array.isArray(row)) return;
      const channelName = row[channelIdx] == null ? '' : String(row[channelIdx]).trim();
      if (!channelName) return;
      const rawValue = row[valueIdx];
      const numericValue = toFiniteNumber(rawValue);
      if (!Number.isFinite(numericValue)) return;

      const timeValueRaw = parseTimeValue(row[timeIdx], '');
      if (!Number.isFinite(timeValueRaw)) return;
      const timeValue = timeValueRaw / 1000;

      if (!channelSet.has(channelName)) {
        channelSet.add(channelName);
        channelOrder.push(channelName);
      }

      if (unitIdx >= 0 && units[channelName] == null) {
        const unitText = row[unitIdx] == null ? '' : String(row[unitIdx]).trim();
        units[channelName] = unitText;
      }

      const timeKey = String(timeValue);
      let packed = byTime.get(timeKey);
      if (!packed) {
        packed = { Time: timeValue };
        byTime.set(timeKey, packed);
      }
      packed[channelName] = numericValue;
    });

    const cols = ['Time', ...channelOrder];
    if (byTime.size < 2 || cols.length < 2) return null;

    const data = Array.from(byTime.values()).sort((a, b) => a.Time - b.Time);
    cols.forEach((col) => {
      if (units[col] == null) units[col] = '';
    });

    const meta = analyzeColumns(data, cols, units);
    meta.units = units;
    meta.source = source;
    meta.format = format;
    meta.metadata = metadata;
    computeLaps(meta, metadata);

    const sparseWide = { data, cols, units, meta, source, format };
    normalizeScanMyTeslaTimeToSeconds(sparseWide);
    applyScanMyTeslaDefaultUnits(sparseWide);
    const resampled = resampleProcessedData(sparseWide, resampleHz);
    addScanMyTeslaCalculatedChannels(resampled);
    return resampled;
  }

  function inferScanMyTeslaUnitFromColumn(colName) {
    const name = String(colName == null ? '' : colName).toLowerCase();
    if (!name) return '';
    if (isScanMyTeslaTorqueBiasColumn(name)) return 'Percent';
    if (isScanMyTeslaConsumptionColumn(name)) return 'W/km';
    if (name.includes('voltage')) return 'Volts';
    if (name.includes('power')) return 'kW';
    if (name.includes('torque')) return 'Nm';
    if (name.includes('speed')) return 'km/h';
    if (name.includes('temp')) return 'C';
    return '';
  }

  function isScanMyTeslaTemperatureColumn(colName) {
    const name = String(colName == null ? '' : colName).toLowerCase();
    return name.includes('temp') || name.includes('temperature');
  }

  function isScanMyTeslaTorqueBiasColumn(colName) {
    const name = String(colName == null ? '' : colName).toLowerCase();
    return name.includes('torque bias') || (name.includes('torque') && name.includes('bias'));
  }

  function isScanMyTeslaConsumptionColumn(colName) {
    const name = String(colName == null ? '' : colName).toLowerCase();
    return name.includes('consumption');
  }

  function shouldUseLinearInterpolationForColumn(colName) {
    return isScanMyTeslaTemperatureColumn(colName)
      || isScanMyTeslaTorqueBiasColumn(colName)
      || isScanMyTeslaConsumptionColumn(colName);
  }

  function normalizeScanMyTeslaColumnName(name) {
    return String(name == null ? '' : name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function findScanMyTeslaColumnByTokenSets(cols, tokenSets) {
    if (!Array.isArray(cols) || cols.length === 0) return null;
    if (!Array.isArray(tokenSets) || tokenSets.length === 0) return null;

    for (const col of cols) {
      const norm = normalizeScanMyTeslaColumnName(col);
      if (!norm) continue;
      const matched = tokenSets.some((tokens) => {
        if (!Array.isArray(tokens) || tokens.length === 0) return false;
        return tokens.every(token => norm.includes(String(token).toLowerCase()));
      });
      if (matched) return col;
    }

    return null;
  }

  function refreshProcessedMeta(processed) {
    if (!processed || !Array.isArray(processed.data) || !Array.isArray(processed.cols)) return;
    if (!processed.units || typeof processed.units !== 'object') {
      processed.units = {};
    }

    const meta = analyzeColumns(processed.data, processed.cols, processed.units);
    meta.units = processed.units;
    meta.source = processed.source;
    meta.format = processed.format;
    meta.metadata = (processed.meta && processed.meta.metadata) || {};
    if (processed.meta && Number.isFinite(processed.meta.resampledHz)) {
      meta.resampledHz = processed.meta.resampledHz;
    }
    computeLaps(meta, meta.metadata);
    processed.meta = meta;
  }

  function addScanMyTeslaCalculatedChannels(processed) {
    if (!processed || !Array.isArray(processed.data) || !Array.isArray(processed.cols)) return;
    if (processed.data.length === 0) return;
    if (!processed.units || typeof processed.units !== 'object') {
      processed.units = {};
    }

    const batteryPowerCol = findScanMyTeslaColumnByTokenSets(processed.cols, [
      ['battery', 'power'],
      ['batt', 'power']
    ]);
    const batteryVoltageCol = findScanMyTeslaColumnByTokenSets(processed.cols, [
      ['battery', 'voltage'],
      ['batt', 'voltage']
    ]);
    const frontPowerCol = findScanMyTeslaColumnByTokenSets(processed.cols, [
      ['front', 'power'],
      ['f', 'power']
    ]);
    const rearPowerCol = findScanMyTeslaColumnByTokenSets(processed.cols, [
      ['rear', 'power'],
      ['r', 'power']
    ]);

    let addedAny = false;

    if (batteryPowerCol && batteryVoltageCol) {
      if (!processed.cols.includes(SMT_CALC_BATTERY_AMPS_COL)) {
        processed.cols.push(SMT_CALC_BATTERY_AMPS_COL);
      }
      processed.units[SMT_CALC_BATTERY_AMPS_COL] = 'A';

      processed.data.forEach((row) => {
        const powerKw = toFiniteNumber(row[batteryPowerCol]);
        const voltageV = toFiniteNumber(row[batteryVoltageCol]);
        if (!Number.isFinite(powerKw) || !Number.isFinite(voltageV) || Math.abs(voltageV) <= 1e-9) {
          row[SMT_CALC_BATTERY_AMPS_COL] = null;
          return;
        }
        row[SMT_CALC_BATTERY_AMPS_COL] = (powerKw * 1000) / voltageV;
      });
      addedAny = true;
    }

    if (frontPowerCol && rearPowerCol) {
      if (!processed.cols.includes(SMT_CALC_MOTOR_POWER_TOTAL_COL)) {
        processed.cols.push(SMT_CALC_MOTOR_POWER_TOTAL_COL);
      }
      processed.units[SMT_CALC_MOTOR_POWER_TOTAL_COL] = 'kW';

      processed.data.forEach((row) => {
        const fPower = toFiniteNumber(row[frontPowerCol]);
        const rPower = toFiniteNumber(row[rearPowerCol]);
        if (!Number.isFinite(fPower) || !Number.isFinite(rPower)) {
          row[SMT_CALC_MOTOR_POWER_TOTAL_COL] = null;
          return;
        }
        row[SMT_CALC_MOTOR_POWER_TOTAL_COL] = fPower + rPower;
      });
      addedAny = true;
    }

    const batteryPowerForEfficiencyCol = batteryPowerCol || findScanMyTeslaColumnByTokenSets(processed.cols, [
      ['battery', 'power'],
      ['batt', 'power']
    ]);
    if (batteryPowerForEfficiencyCol && processed.cols.includes(SMT_CALC_MOTOR_POWER_TOTAL_COL)) {
      if (!processed.cols.includes(SMT_CALC_EFFICIENCY_COL)) {
        processed.cols.push(SMT_CALC_EFFICIENCY_COL);
      }
      processed.units[SMT_CALC_EFFICIENCY_COL] = '%';

      processed.data.forEach((row) => {
        const motorPowerTotal = toFiniteNumber(row[SMT_CALC_MOTOR_POWER_TOTAL_COL]);
        const batteryPower = toFiniteNumber(row[batteryPowerForEfficiencyCol]);
        if (!Number.isFinite(motorPowerTotal) || !Number.isFinite(batteryPower) || Math.abs(batteryPower) < 10) {
          row[SMT_CALC_EFFICIENCY_COL] = null;
          return;
        }
        row[SMT_CALC_EFFICIENCY_COL] = 100 * (motorPowerTotal / batteryPower);
      });
      addedAny = true;
    }

    if (addedAny) {
      refreshProcessedMeta(processed);
    }
  }

  function addTotalAccelerationCalculatedChannel(processed, lateralCol, longitudinalCol) {
    if (!processed || !Array.isArray(processed.data) || !Array.isArray(processed.cols)) return false;
    if (!lateralCol || !longitudinalCol) return false;
    if (!processed.cols.includes(lateralCol) || !processed.cols.includes(longitudinalCol)) return false;

    if (!processed.units || typeof processed.units !== 'object') {
      processed.units = {};
    }

    if (!processed.cols.includes(TOTAL_ACCEL_CALC_COL)) {
      processed.cols.push(TOTAL_ACCEL_CALC_COL);
    }

    processed.data.forEach((row) => {
      const latAcc = toFiniteNumber(row[lateralCol]);
      const longAcc = toFiniteNumber(row[longitudinalCol]);
      if (!Number.isFinite(latAcc) || !Number.isFinite(longAcc)) {
        row[TOTAL_ACCEL_CALC_COL] = null;
        return;
      }
      row[TOTAL_ACCEL_CALC_COL] = Math.sqrt((latAcc * latAcc) + (longAcc * longAcc));
    });

    processed.units[TOTAL_ACCEL_CALC_COL] = 'g';

    if (processed.meta && typeof processed.meta === 'object') {
      processed.meta.units = processed.units;
    }
    return true;
  }

  function applyScanMyTeslaDefaultUnits(processed) {
    if (!processed || !Array.isArray(processed.cols)) return;
    if (!processed.units || typeof processed.units !== 'object') {
      processed.units = {};
    }

    processed.cols.forEach((col) => {
      const existing = processed.units[col];
      if (typeof existing === 'string' && existing.trim()) return;
      const inferred = inferScanMyTeslaUnitFromColumn(col);
      if (inferred) {
        processed.units[col] = inferred;
      }
    });
  }

  function normalizeScanMyTeslaTimeToSeconds(processed) {
    if (!processed || !processed.meta || !Array.isArray(processed.data)) return;
    const timeCol = processed.meta.timeCol;
    if (!timeCol) return;

    for (let i = 0; i < processed.data.length; i++) {
      const row = processed.data[i];
      if (!row || !Object.prototype.hasOwnProperty.call(row, timeCol)) continue;
      const raw = row[timeCol];
      const numeric = toFiniteNumber(raw);
      if (Number.isFinite(numeric)) {
        row[timeCol] = numeric / 1000;
      } else {
        const parsed = parseTimeValue(raw, '');
        if (Number.isFinite(parsed)) {
          row[timeCol] = parsed;
        }
      }
    }

    if (!processed.units || typeof processed.units !== 'object') {
      processed.units = {};
    }
    processed.units[timeCol] = 's';

    const refreshedMeta = analyzeColumns(processed.data, processed.cols || [], processed.units);
    refreshedMeta.units = processed.units;
    refreshedMeta.source = processed.source;
    refreshedMeta.format = processed.format;
    refreshedMeta.metadata = (processed.meta && processed.meta.metadata) || {};
    processed.meta = refreshedMeta;
  }

  function normalizeResampleHz(hz) {
    const n = Number(hz);
    if (Number.isFinite(n) && n > 0) return n;
    return SCAN_MY_TESLA_DEFAULT_RESAMPLE_HZ;
  }

  function toFiniteNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (value == null) return null;
    const n = Number(String(value).trim());
    return Number.isFinite(n) ? n : null;
  }

  function buildUniformTimeGrid(timeValues, hz) {
    let start = Infinity;
    let end = -Infinity;
    let count = 0;
    for (let i = 0; i < timeValues.length; i++) {
      const v = timeValues[i];
      if (!Number.isFinite(v)) continue;
      if (v < start) start = v;
      if (v > end) end = v;
      count += 1;
    }
    if (count < 2) return [];
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];

    const step = 1 / normalizeResampleHz(hz);
    const grid = [];
    for (let t = start; t <= end + step * 0.5; t += step) {
      grid.push(Number(t.toFixed(6)));
    }
    return grid;
  }

  function dedupeSortedSamples(xs, ys) {
    const outX = [];
    const outY = [];
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const y = ys[i];
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      const last = outX.length - 1;
      if (last >= 0 && Math.abs(outX[last] - x) <= 1e-9) {
        outY[last] = y;
      } else {
        outX.push(x);
        outY.push(y);
      }
    }
    return { x: outX, y: outY };
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
      if (xs[mid] <= xq) {
        lo = mid;
      } else {
        hi = mid;
      }
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
      if (xs[mid] <= xq) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    const x0 = xs[lo];
    const x1 = xs[hi];
    const y0 = ys[lo];
    const y1 = ys[hi];
    if (!Number.isFinite(x0) || !Number.isFinite(x1) || x1 === x0) return y0;
    const ratio = (xq - x0) / (x1 - x0);
    return y0 + (y1 - y0) * ratio;
  }

  function resampleProcessedData(processed, resampleHz) {
    if (!processed || !processed.meta || !Array.isArray(processed.data) || !Array.isArray(processed.cols)) {
      return processed;
    }

    const timeCol = processed.meta.timeCol;
    if (!timeCol) return processed;

    const baseTime = processed.meta._time || [];
    const grid = buildUniformTimeGrid(baseTime, resampleHz);
    if (grid.length < 2) return processed;

    const columns = processed.cols.slice();
    const resampledData = grid.map(t => ({ [timeCol]: t }));

    columns.forEach((col) => {
      if (col === timeCol) return;

      const points = [];
      for (let i = 0; i < processed.data.length; i++) {
        const tx = baseTime[i];
        const vy = toFiniteNumber(processed.data[i][col]);
        if (Number.isFinite(tx) && Number.isFinite(vy)) {
          points.push({ x: tx, y: vy });
        }
      }
      if (points.length === 0) return;

      points.sort((a, b) => a.x - b.x);
      const deduped = dedupeSortedSamples(points.map(p => p.x), points.map(p => p.y));
      if (deduped.x.length === 0) return;

      const preferLinear = shouldUseLinearInterpolationForColumn(col);
      const spline = preferLinear ? null : buildNaturalCubicSpline(deduped.x, deduped.y);
      for (let i = 0; i < grid.length; i++) {
        const xq = grid[i];
        const yq = spline
          ? evaluateNaturalCubicSpline(spline, xq)
          : evaluateLinear(deduped.x, deduped.y, xq);
        resampledData[i][col] = Number.isFinite(yq) ? yq : null;
      }
    });

    const units = processed.units && typeof processed.units === 'object' ? processed.units : {};
    const meta = analyzeColumns(resampledData, columns, units);
    meta.units = units;
    meta.source = processed.source;
    meta.format = processed.format;
    meta.metadata = processed.meta.metadata || {};
    meta.resampledHz = normalizeResampleHz(resampleHz);
    computeLaps(meta, meta.metadata);

    return {
      data: resampledData,
      cols: columns,
      units,
      meta,
      source: processed.source,
      format: processed.format
    };
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
    const matches = String(raw).match(/-?\d+(?:\.\d+)?/g);
    if (!matches) return [];
    return matches
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
    let lapStartDist = Number.isFinite(d[0]) ? d[0] : 0;

    for (let i = 0; i < t.length; i++) {
      const ti = Number.isFinite(t[i])
        ? t[i]
        : (i > 0 ? t[i - 1] : 0);
      const di = Number.isFinite(d[i])
        ? d[i]
        : (i > 0 ? d[i - 1] : 0);

      const prevMarkerIdx = markerIdx;
      while (markerIdx < beaconMarkers.length && ti >= beaconMarkers[markerIdx]) {
        markerIdx++;
      }
      if (markerIdx !== prevMarkerIdx) {
        // A beacon was just crossed: the new lap's distance baseline starts here.
        lapStartDist = di;
      }

      const lapStartTime = markerIdx > 0 ? beaconMarkers[markerIdx - 1] : 0;

      lapNum.push(markerIdx);
      lapTime.push(Math.max(0, ti - lapStartTime));
      lapRelDist.push(di - lapStartDist);
    }

    // Exact split/lap durations: the difference between consecutive beacon
    // times themselves, not the nearest logged sample around the crossing.
    // lapDurations[m] is the duration of the completed lap numbered m (i.e.
    // the segment that ends when beaconMarkers[m] is crossed). The final,
    // still-in-progress lap (lapNum === beaconMarkers.length) has no entry
    // here since it has no closing beacon yet.
    const lapDurations = beaconMarkers.map((bm, idx) => bm - (idx > 0 ? beaconMarkers[idx - 1] : 0));

    meta.lapNum = lapNum;
    meta.lapTime = lapTime;
    meta.lapRelDist = lapRelDist;
    meta.lapDurations = lapDurations;
  }

  // Same lap-splitting shape as computeLapsFromBeacons, for laps derived from a
  // user-drawn start/finish line crossing the GPS track (app.js computes the actual
  // crossing timestamps -- this just turns them into lapNum/lapTime/lapRelDist/
  // lapDurations, the same way beacon markers do). Kept as its own function rather than
  // reusing computeLapsFromBeacons because that one assumes meta._time is already
  // 0-based at the start of the session; a crossing-based log's raw Time channel isn't
  // guaranteed to be (e.g. VBOX's Time column is seconds-since-midnight), so lap 0's
  // baseline here is the first sample's own timestamp instead of a hardcoded 0.
  function computeLapsFromCrossingTimes(meta, crossingTimes) {
    const t = meta._time || [];
    const d = meta._dist || [];
    const firstTime = Number.isFinite(t[0]) ? t[0] : 0;

    const lapNum = [];
    const lapTime = [];
    const lapRelDist = [];

    let markerIdx = 0;
    let lapStartDist = Number.isFinite(d[0]) ? d[0] : 0;

    for (let i = 0; i < t.length; i++) {
      const ti = Number.isFinite(t[i])
        ? t[i]
        : (i > 0 ? t[i - 1] : firstTime);
      const di = Number.isFinite(d[i])
        ? d[i]
        : (i > 0 ? d[i - 1] : 0);

      const prevMarkerIdx = markerIdx;
      while (markerIdx < crossingTimes.length && ti >= crossingTimes[markerIdx]) {
        markerIdx++;
      }
      if (markerIdx !== prevMarkerIdx) {
        lapStartDist = di;
      }

      const lapStartTime = markerIdx > 0 ? crossingTimes[markerIdx - 1] : firstTime;

      lapNum.push(markerIdx);
      lapTime.push(Math.max(0, ti - lapStartTime));
      lapRelDist.push(di - lapStartDist);
    }

    const lapDurations = crossingTimes.map((ct, idx) => ct - (idx > 0 ? crossingTimes[idx - 1] : firstTime));

    meta.lapNum = lapNum;
    meta.lapTime = lapTime;
    meta.lapRelDist = lapRelDist;
    meta.lapDurations = lapDurations;
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
        // Use actual sample time (no interpolation)
        const splitTime = ti;

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

  const AVAILABLE_DECODERS = [
    { name: 'GP Bikes', label: 'GP Bikes (PiBoSo)' },
    { name: 'AiM', label: 'AiM' },
    { name: 'MoTeC', label: 'MoTeC' },
    { name: 'VIGrade', label: 'VIGrade' },
    { name: 'ScanMyTesla', label: 'ScanMyTesla' },
    { name: 'VBOX', label: 'VBOX' },
    { name: 'Standard', label: 'Standard CSV' },
    { name: 'TSV', label: 'TSV (Tab-Separated)' },
    { name: 'Generic', label: 'Generic (fallback)' }
  ];

  function processCsvRowsWithDecoder(rows, decoderName, options = {}) {
    const parsedOptions = (options && typeof options === 'object' && !Array.isArray(options)) ? options : {};
    const useMotecHeader = decoderName === 'MoTeC';
    const formatHint = getMetadataValueFromRows(rows, 'format');
    const headerRowIndex = (useMotecHeader || isMoTeCFormat(formatHint))
      ? findMoTeCHeaderRowIndex(rows)
      : findHeaderRowIndex(rows);
    const metadata = extractMetadata(rows, headerRowIndex);
    const source = getMetadataValue(metadata, 'data source') || getMetadataValue(metadata, 'source');
    const format = getMetadataValue(metadata, 'format');

    switch (decoderName) {
      case 'GP Bikes':
        return processGPBikesRows(rows, headerRowIndex, { source, format, metadata });
      case 'AiM':
        return processAiMRows(rows, headerRowIndex, { source, format, metadata });
      case 'MoTeC':
        return processMoTeCRows(rows, headerRowIndex, { source, format, metadata });
      case 'VIGrade':
        return processVIGradeRows(rows, headerRowIndex, { source, format, metadata });
      case 'VBOX':
        return processVBoxRows(rows, { source, format, metadata });
      case 'ScanMyTesla':
        return processScanMyTeslaRows(rows, headerRowIndex, { source, format, metadata }, {
          resampleHz: parsedOptions.scanMyTeslaHz
        });
      case 'Standard':
        return processStandardRows(rows, headerRowIndex, { source, format, metadata });
      case 'TSV':
        return processTsvRows(rows, headerRowIndex, { source, format, metadata });
      case 'Generic':
        return processGenericRows(rows, headerRowIndex, { source, format, metadata });
      default:
        return processCsvRows(rows, options);
    }
  }

  window.LogFileProcessors = {
    processCsvRows,
    processCsvRowsWithDecoder,
    processVIGradeResXml,
    AVAILABLE_DECODERS,
    isGPBikesFormat,
    isAiMFormat,
    isMoTeCFormat,
    isStandardFormat,
    isScanMyTeslaFormat,
    isVIGradeFormat,
    isVBoxFormat,
    isTsvFormat,
    addTotalAccelerationCalculatedChannel,
    detectFieldDelimiter,
    computeLapsFromCrossingTimes,
    computeCrashFlags
  };
})();
