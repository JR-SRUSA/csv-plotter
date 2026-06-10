const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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

test('calculates Total Acceleration (calc) [g] for AiM rows', () => {
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
    processed.cols.includes('Total Acceleration (calc) [g]'),
    'Calculated channel should be present in cols'
  );

  const total = 'Total Acceleration (calc) [g]';
  assert.equal(processed.data[0][total], 5);
  assert.equal(processed.data[1][total], 13);
  assert.equal(processed.data[2][total], null);
  assert.equal(processed.units[total], 'g');
});
