const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Papa = require('papaparse');

function loadLogFileProcessors() {
  const scriptPath = path.join(__dirname, '..', 'file-processors.js');
  const source = fs.readFileSync(scriptPath, 'utf8');

  const context = {
    window: {},
    console,
    Math,
    Number,
    String,
    Date,
    Array,
    Object,
    Set,
    Map,
    RegExp,
    parseInt,
    parseFloat,
    isNaN,
    Infinity
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'file-processors.js' });
  return context.window.LogFileProcessors;
}

test('calculates Total Acceleration (calc) for AiM rows', () => {
  const processors = loadLogFileProcessors();
  assert.ok(processors, 'LogFileProcessors should be defined');

  const rows = [
    ['Format', 'AiM CSV File'],
    ['Source', 'AiM'],
    ['Time', 'GPS LatAcc', 'GPS LonAcc'],
    ['s', 'g', 'g'],
    [0, 3, 4],
    [1, 5, 12],
    [2, null, 1]
  ];

  const processed = processors.processCsvRows(rows);
  assert.ok(processed, 'processCsvRows should return a processed payload');

  const added = processors.addTotalAccelerationCalculatedChannel(
    processed,
    'GPS LatAcc',
    'GPS LonAcc'
  );

  assert.equal(added, true, 'Total acceleration channel should be added');
  assert.ok(
    processed.cols.includes('Total Acceleration (calc)'),
    'Calculated channel should be present in cols'
  );

  const total = 'Total Acceleration (calc)';
  assert.equal(processed.data[0][total], 5);
  assert.equal(processed.data[1][total], 13);
  assert.equal(processed.data[2][total], null);
  assert.equal(processed.units[total], 'g');
});

// Shared fixture for the TSV-detection tests below: a metadata preamble followed by
// header/units/data rows, real tab characters throughout (as Papa.parse would tokenize a
// genuinely tab-delimited file) -- the same shape as the Calspan/TIRF sample, which has no
// "Format"/"Source" metadata field and a header row that isn't at index 0, so it can't be
// recognized any other way than "this came from a tab-delimited file".
function buildTsvRows() {
  const text = [
    'TIRF Data File: Project 2881; Run 004',
    'ET\tV\tTSTO\tTSTC\tLABEL',
    's\tkph\tdeg c\tdeg c\tnone',
    '460.850\t59.95\t36.38\t35.23\tCHECK',
    '460.855\t59.95\t36.43\t35.23\tCHECK'
  ].join('\n');
  return Papa.parse(text, { header: false, dynamicTyping: true, skipEmptyLines: true, delimiter: '\t' }).data;
}

test('processCsvRows auto-detects TSV when told the source was tab-delimited', () => {
  const processors = loadLogFileProcessors();
  const rows = buildTsvRows();

  const processed = processors.processCsvRows(rows, { delimiter: 'tab' });
  assert.ok(processed, 'processCsvRows should return a processed payload');
  assert.equal(processed.meta.source, 'TSV');
  assert.equal(processed.meta.format, 'TSV');
  assert.deepEqual(processed.cols, ['ET', 'V', 'TSTO', 'TSTC', 'LABEL']);
  assert.equal(processed.units.TSTO, 'deg c');
  assert.equal(processed.data[0].TSTO, 36.38);
});

test('processCsvRows does not classify as TSV without delimiter:"tab" in options', () => {
  const processors = loadLogFileProcessors();
  const rows = buildTsvRows();

  const processed = processors.processCsvRows(rows, {});
  assert.ok(processed, 'processCsvRows should return a processed payload');
  assert.equal(processed.meta.source, 'Generic', 'same rows without the delimiter hint should fall back to Generic');
});

test('processCsvRowsWithDecoder can force the TSV decoder', () => {
  const processors = loadLogFileProcessors();
  const rows = buildTsvRows();

  const processed = processors.processCsvRowsWithDecoder(rows, 'TSV');
  assert.ok(processed, 'processCsvRowsWithDecoder should return a processed payload');
  assert.equal(processed.meta.source, 'TSV');
  assert.deepEqual(processed.cols, ['ET', 'V', 'TSTO', 'TSTC', 'LABEL']);
});

test('AVAILABLE_DECODERS is exported and contains expected decoders', () => {
  const processors = loadLogFileProcessors();
  assert.ok(processors, 'LogFileProcessors should be defined');
  assert.ok(Array.isArray(processors.AVAILABLE_DECODERS), 'AVAILABLE_DECODERS should be an array');

  const names = processors.AVAILABLE_DECODERS.map(d => d.name);
  for (const expected of ['GP Bikes', 'AiM', 'MoTeC', 'VIGrade', 'ScanMyTesla', 'Standard', 'TSV', 'Generic']) {
    assert.ok(names.includes(expected), `AVAILABLE_DECODERS should include "${expected}"`);
  }

  processors.AVAILABLE_DECODERS.forEach(d => {
    assert.ok(typeof d.name === 'string' && d.name.length > 0, 'Each decoder entry should have a non-empty name');
    assert.ok(typeof d.label === 'string' && d.label.length > 0, 'Each decoder entry should have a non-empty label');
  });
});

test('processCsvRowsWithDecoder is exported', () => {
  const processors = loadLogFileProcessors();
  assert.ok(processors, 'LogFileProcessors should be defined');
  assert.ok(typeof processors.processCsvRowsWithDecoder === 'function', 'processCsvRowsWithDecoder should be a function');
});

test('processCsvRowsWithDecoder forces GP Bikes decoder on a standard CSV', () => {
  const processors = loadLogFileProcessors();

  // Standard CSV rows (no format metadata header)
  const rows = [
    ['Time', 'Speed', 'RPM'],
    [0, 50, 3000],
    [1, 60, 3500],
    [2, 70, 4000]
  ];

  const processed = processors.processCsvRowsWithDecoder(rows, 'GP Bikes');
  assert.ok(processed, 'processCsvRowsWithDecoder should return a processed payload');
  assert.ok(Array.isArray(processed.data), 'should have data array');
  assert.ok(Array.isArray(processed.cols), 'should have cols array');
  assert.equal(processed.meta.source, 'GP Bikes', 'source should be GP Bikes');
});

test('processCsvRowsWithDecoder forces AiM decoder', () => {
  const processors = loadLogFileProcessors();

  const rows = [
    ['Time', 'GPS Speed', 'GPS LatAcc'],
    ['s', 'km/h', 'g'],
    [0, 100, 0.5],
    [1, 110, 0.3]
  ];

  const processed = processors.processCsvRowsWithDecoder(rows, 'AiM');
  assert.ok(processed, 'processCsvRowsWithDecoder should return a payload for AiM decoder');
  assert.equal(processed.meta.source, 'AiM', 'source should be AiM');
});

test('processCsvRowsWithDecoder forces Standard decoder', () => {
  const processors = loadLogFileProcessors();

  const rows = [
    ['Time', 'Speed', 'RPM'],
    [0, 50, 3000],
    [1, 60, 3500]
  ];

  const processed = processors.processCsvRowsWithDecoder(rows, 'Standard');
  assert.ok(processed, 'processCsvRowsWithDecoder should return a payload for Standard decoder');
  assert.equal(processed.meta.source, 'Standard CSV', 'source should be Standard CSV');
});

test('processCsvRowsWithDecoder falls back to auto-detect for unknown decoder name', () => {
  const processors = loadLogFileProcessors();

  const rows = [
    ['Time', 'Speed'],
    [0, 50],
    [1, 60]
  ];

  const processed = processors.processCsvRowsWithDecoder(rows, 'NotARealDecoder');
  assert.ok(processed, 'processCsvRowsWithDecoder should return a payload even for unknown decoder');
  assert.ok(Array.isArray(processed.data), 'should have data array');
});
