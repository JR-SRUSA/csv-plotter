const test = require('node:test');
const assert = require('node:assert/strict');
const { Model, loadSessionsInSandbox } = require('./sessions-loader.js');

test('registers the browser globals when loaded as plain scripts', () => {
  // Mirrors how index.html and the ESP32 bundle load these files: bare IIFEs with no
  // module system, assigning to window.
  const sandbox = loadSessionsInSandbox();
  assert.ok(sandbox.Model, 'window.SessionsModel should be defined');
  assert.ok(sandbox.Storage, 'window.SessionsStorage should be defined');
  assert.ok(sandbox.Services, 'window.SessionsServices should be defined');
  assert.equal(typeof sandbox.Model.normalize, 'function');
});

test('mints readable prefixed UUID ids per store', () => {
  assert.match(Model.newId('sessions'), /^session_[0-9a-f-]{36}$/);
  assert.match(Model.newId('vehicles'), /^vehicle_[0-9a-f-]{36}$/);
  assert.match(Model.newLocalUserId(), /^user_local_[0-9a-f-]{36}$/);
  assert.notEqual(Model.newId('sessions'), Model.newId('sessions'), 'ids must be unique');
});

test('generates RFC 4122 version 4 UUIDs', () => {
  const uuid = Model.randomUuid();
  assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('recognises device-local user ids', () => {
  assert.equal(Model.isLocalUserId(Model.newLocalUserId()), true);
  assert.equal(Model.isLocalUserId('user_123'), false);
  assert.equal(Model.isLocalUserId(undefined), false);
});

test('normalize stamps timestamps and defaults every required list', () => {
  const session = Model.normalize('sessions', { name: 'FP1' });
  assert.match(session.id, /^session_/);
  assert.deepEqual(session.vehicle_ids, []);
  assert.deepEqual(session.rider_ids, []);
  assert.deepEqual(session.file_ids, []);
  assert.deepEqual(session.note_ids, []);
  assert.ok(session.created_at, 'created_at should be set');
  assert.ok(session.updated_at, 'updated_at should be set');
  assert.match(session.created_at, /^\d{4}-\d{2}-\d{2}T.*Z$/, 'timestamps are ISO 8601 UTC');
});

test('normalize preserves unknown keys so a newer bundle round-trips', () => {
  const session = Model.normalize('sessions', { name: 'FP1', futureField: { nested: 1 } });
  assert.deepEqual(session.futureField, { nested: 1 });
});

test('normalize accepts the singular session_id spelling for notes and files', () => {
  const note = Model.normalize('notes', { session_id: 'session_a', content: 'x' });
  assert.deepEqual(note.session_ids, ['session_a']);
  assert.equal('session_id' in note, false, 'the singular key should not be stored');

  const file = Model.normalize('files', { name: 'a.csv', session_id: 'session_b' });
  assert.deepEqual(file.session_ids, ['session_b']);
});

test('normalize coerces numeric fields and drops unparseable ones', () => {
  assert.equal(Model.normalize('vehicles', { type: 'car', year: '2019' }).year, 2019);
  assert.equal('year' in Model.normalize('vehicles', { type: 'car', year: 'nope' }), false);
  assert.equal(Model.normalize('riders', { name: 'A', weight_kg: '72.5' }).weight_kg, 72.5);
});

test('normalize derives a file type from the extension, case-insensitively', () => {
  assert.equal(Model.normalize('files', { name: 'run.CSV' }).filetype, 'csv');
  assert.equal(Model.normalize('files', { name: 'lap.tcx' }).filetype, 'tcx');
  assert.equal(Model.normalize('files', { name: 'noext' }).filetype, '');
});

test('normalize maps the export alias fields onto the stored spelling', () => {
  const file = Model.normalize('files', { filename: 'a.csv', uploaded_at: '2026-01-02T03:04:05Z' });
  assert.equal(file.name, 'a.csv');
  assert.equal(file.storedAt, '2026-01-02T03:04:05Z');
  assert.equal('filename' in file, false);
  assert.equal('uploaded_at' in file, false);
});

test('normalize falls back to a safe note type rather than storing junk', () => {
  assert.equal(Model.normalize('notes', { type: 'sideways' }).type, 'during');
  assert.equal(Model.normalize('notes', { type: 'pre' }).type, 'pre');
});

test('normalize de-duplicates id lists so repeated attaches stay idempotent', () => {
  const session = Model.normalize('sessions', { name: 'x', file_ids: ['f1', 'f1', 'f2', null, ''] });
  assert.deepEqual(session.file_ids, ['f1', 'f2']);
});

test('cleanTags trims, drops blanks and de-duplicates', () => {
  assert.deepEqual(Model.cleanTags([' wet ', 'wet', '', null, 'rain']), ['wet', 'rain']);
});

test('normalizeKpi keeps numeric strings numeric and non-numeric as text', () => {
  assert.deepEqual(Model.normalizeKpi({ type: 'best_lap', kpi: ' 92.55 ' }), { type: 'best_lap', kpi: 92.55 });
  assert.deepEqual(Model.normalizeKpi({ type: 'tyre', kpi: 'soft' }), { type: 'tyre', kpi: 'soft' });
  assert.equal(Model.normalizeKpi({ type: '   ', kpi: 1 }), null, 'a KPI with no type is not a KPI');
  assert.equal(Model.normalizeKpi(null), null);
});

test('normalizeMediaRef rejects a reference that points at nothing', () => {
  assert.equal(Model.normalizeMediaRef({ type: 'photo' }), null);
  assert.deepEqual(Model.normalizeMediaRef({ type: 'video', id: 'media_1' }), { type: 'video', id: 'media_1' });
  assert.equal(Model.normalizeMediaRef({ id: 'media_1' }).type, 'photo', 'photo is the default type');
});

test('validate reports each missing required field', () => {
  assert.deepEqual(Model.validate('sessions', {}), [
    'sessions: missing required field "id"',
    'sessions: missing required field "name"'
  ]);
  assert.deepEqual(Model.validate('setups', { id: 's1' }), ['setups: missing required field "vehicle_id"']);
  assert.deepEqual(Model.validate('sessions', { id: 'a', name: 'b' }), []);
});

test('validate rejects a non-object record', () => {
  assert.deepEqual(Model.validate('sessions', null), ['sessions: record is not an object']);
});

// ── Vehicle/Rider physics fields ─────────────────────────────────────────────

test('normalize keeps positive vehicle physics fields and drops invalid ones', () => {
  const vehicle = Model.normalize('vehicles', {
    type: 'motorcycle', mass_kg: '180', cda_m2: '0.32', avg_power_kw: '95'
  });
  assert.equal(vehicle.mass_kg, 180);
  assert.equal(vehicle.cda_m2, 0.32);
  assert.equal(vehicle.avg_power_kw, 95);

  const rejected = Model.normalize('vehicles', { type: 'motorcycle', mass_kg: '-5', cda_m2: '0' });
  assert.equal('mass_kg' in rejected, false, 'a non-positive mass is not physically meaningful');
  assert.equal('cda_m2' in rejected, false);
});

test('normalize accepts a legacy avg_power_w (watts) and converts it to avg_power_kw', () => {
  const vehicle = Model.normalize('vehicles', { type: 'motorcycle', avg_power_w: '95000' });
  assert.equal(vehicle.avg_power_kw, 95);
  assert.equal('avg_power_w' in vehicle, false, 'the legacy field is not carried forward');
});

test('normalize sorts a power curve by RPM and drops invalid points', () => {
  const vehicle = Model.normalize('vehicles', {
    type: 'motorcycle',
    power_curve: [{ rpm: '9000', power_kw: '80' }, { rpm: '3000', power_kw: '20' }, { rpm: -5, power_kw: 1 }]
  });
  assert.deepEqual(vehicle.power_curve, [{ rpm: 3000, power_kw: 20 }, { rpm: 9000, power_kw: 80 }]);
});

test('a power curve point can be entered as either power (kW), legacy watts, or torque (Nm)', () => {
  const vehicle = Model.normalize('vehicles', {
    type: 'motorcycle',
    power_curve: [
      { rpm: 9549.297, torque_nm: '100' },   // torque-entered: converts to ~100 kW
      { rpm: 3000, power_w: '20000' },        // legacy watts: converts to 20 kW
      { rpm: 6000, power_kw: '60' }           // direct kW
    ]
  });
  assert.equal(vehicle.power_curve.length, 3);
  const byRpm = Object.fromEntries(vehicle.power_curve.map((p) => [p.rpm, p]));
  assert.ok(Math.abs(byRpm[9549.297].power_kw - 100) < 0.01);
  assert.equal(byRpm[9549.297].torque_nm, 100, 'the originally-entered torque is kept alongside the derived power');
  assert.equal(byRpm[3000].power_kw, 20);
  assert.equal('torque_nm' in byRpm[3000], false);
  assert.equal(byRpm[6000].power_kw, 60);
});

test('torqueNmToKw and kwToTorqueNm are inverses at a given RPM', () => {
  const kw = Model.torqueNmToKw(100, 9549.297);
  assert.ok(Math.abs(kw - 100) < 0.01, '1 Nm at 9549.297 RPM is defined as 1 kW');
  const backToNm = Model.kwToTorqueNm(kw, 9549.297);
  assert.ok(Math.abs(backToNm - 100) < 0.01);
  assert.equal(Model.kwToTorqueNm(50, 0), undefined, 'undefined at 0 RPM rather than a division by zero');
});

test('normalize keeps only valid gearing fields, dropping non-positive gear ratios', () => {
  const vehicle = Model.normalize('vehicles', {
    type: 'motorcycle',
    gearing: { primary_ratio: '2.1', final_ratio: '2.9', gear_ratios: ['2.5', '1.8', 'bad', 0], wheel_circumference_m: '1.9' }
  });
  assert.deepEqual(vehicle.gearing, {
    primary_ratio: 2.1, final_ratio: 2.9, wheel_circumference_m: 1.9, gear_ratios: [2.5, 1.8]
  });
  assert.equal('gearing' in Model.normalize('vehicles', { type: 'x', gearing: {} }), false, 'an empty gearing object is dropped');
});

test('normalize allows a rider\'s additive CdA fields to be negative', () => {
  const rider = Model.normalize('riders', { name: 'Jo', cda_tucked_m2: '-0.02', cda_braking_m2: '0.05', cda_cornering_m2: '' });
  assert.equal(rider.cda_tucked_m2, -0.02, 'a negative delta is physically meaningful (leaned-over posture)');
  assert.equal(rider.cda_braking_m2, 0.05);
  assert.equal('cda_cornering_m2' in rider, false, 'a blank field is dropped, not stored as NaN');
});

// ── Note location ─────────────────────────────────────────────────────────────

test('normalizeNoteLocation accepts a plot location with file_id and x', () => {
  const location = Model.normalizeNoteLocation({
    kind: 'plot', file_id: 'file_1', x: '812.5', lap: '3', x_axis: 'distance', channel: 'Speed', value: '143.2'
  });
  assert.deepEqual(location, { kind: 'plot', file_id: 'file_1', x: 812.5, lap: 3, x_axis: 'distance', channel: 'Speed', value: 143.2 });
});

test('normalizeNoteLocation accepts a map location with lat/lon', () => {
  assert.deepEqual(Model.normalizeNoteLocation({ kind: 'map', lat: '40.1', lon: '-80.2' }), { kind: 'map', lat: 40.1, lon: -80.2 });
});

test('normalizeNoteLocation drops a plot location missing file_id or x', () => {
  assert.equal(Model.normalizeNoteLocation({ kind: 'plot', x: 5 }), undefined, 'no file_id');
  assert.equal(Model.normalizeNoteLocation({ kind: 'plot', file_id: 'file_1' }), undefined, 'no x');
  assert.equal(Model.normalizeNoteLocation({ kind: 'map', lat: 'nope', lon: -80 }), undefined, 'non-numeric lat');
  assert.equal(Model.normalizeNoteLocation({ kind: 'other' }), undefined, 'unknown kind');
  assert.equal(Model.normalizeNoteLocation(null), undefined);
});

test('normalize on notes applies normalizeNoteLocation and drops an unresolvable one', () => {
  const withLocation = Model.normalize('notes', { content: 'x', location: { kind: 'map', lat: '1', lon: '2' } });
  assert.deepEqual(withLocation.location, { kind: 'map', lat: 1, lon: 2 });

  const withoutEnoughInfo = Model.normalize('notes', { content: 'x', location: { kind: 'plot', x: 5 } });
  assert.equal('location' in withoutEnoughInfo, false);
});

// ── Tire size ──────────────────────────────────────────────────────────────

test('parseTireSize computes the overall diameter as 2 x sidewall + rim, the R3 example being 627.8 mm', () => {
  const t = Model.parseTireSize('140/70R17');
  assert.equal(t.width_mm, 140);
  assert.equal(t.aspect_pct, 70);
  assert.equal(t.rim_in, 17);
  // 140 x 0.70 x 2 + 17 x 25.4 = 196 + 431.8
  assert.ok(Math.abs(t.diameter_mm - 627.8) < 1e-9);
  assert.equal(t.label, '140/70R17');
});

test('parseTireSize accepts the usual ways of writing a size and normalises them', () => {
  for (const written of ['140/70R17', '140/70 R17', '140/70-17', ' 140 / 70 r17 ', '140/70r17', '140/70R17 66H']) {
    const t = Model.parseTireSize(written);
    assert.ok(t, `should parse "${written}"`);
    assert.equal(t.label, '140/70R17', `"${written}" normalises to the same size`);
  }
  assert.equal(Model.parseTireSize('190/55ZR17').label, '190/55R17');
  assert.equal(Model.parseTireSize('190/55 ZR17 (75W)').rim_in, 17);
  // A car tire uses the same scheme.
  assert.ok(Math.abs(Model.parseTireSize('205/55R16').diameter_mm - (2 * 205 * 0.55 + 16 * 25.4)) < 1e-9);
});

test('parseTireSize rejects things that are not a plausible tire size', () => {
  for (const bad of ['', 'abc', '140', '140/70', '140/70R', '1/70R17', '140/70R170', '140/70R5', '600/70R17', '140/10R17', null, undefined, 42]) {
    assert.equal(Model.parseTireSize(bad), null, `"${bad}" should not parse`);
  }
});

test('normalize derives the simulator circumference from a parseable tire size and stores the tidy label', () => {
  const vehicle = Model.normalize('vehicles', { type: 'motorcycle', gearing: { final_ratio: 2.9, tire_size: '140/70 r17' } });
  assert.equal(vehicle.gearing.tire_size, '140/70R17');
  assert.ok(Math.abs(vehicle.gearing.wheel_circumference_m - Math.PI * 0.6278) < 1e-9);
});

test('a parseable tire size wins over a stale circumference; an unparseable one is dropped, keeping the circumference', () => {
  const both = Model.normalize('vehicles', { type: 'x', gearing: { tire_size: '140/70R17', wheel_circumference_m: 0.59 } });
  assert.ok(Math.abs(both.gearing.wheel_circumference_m - Math.PI * 0.6278) < 1e-9);

  const junk = Model.normalize('vehicles', { type: 'x', gearing: { tire_size: 'big wheels', wheel_circumference_m: 1.9 } });
  assert.equal('tire_size' in junk.gearing, false);
  assert.equal(junk.gearing.wheel_circumference_m, 1.9);
});

test('a vehicle saved before tire sizes existed (circumference only) is unchanged', () => {
  const old = Model.normalize('vehicles', { type: 'motorcycle', gearing: { final_ratio: 2.9, wheel_circumference_m: 1.9 } });
  assert.deepEqual(old.gearing, { final_ratio: 2.9, wheel_circumference_m: 1.9 });
});

test('wheelDiameterMm reads the tire size, and falls back to circumference / pi for older records', () => {
  assert.ok(Math.abs(Model.wheelDiameterMm({ tire_size: '140/70R17' }) - 627.8) < 1e-9);
  assert.ok(Math.abs(Model.wheelDiameterMm({ wheel_circumference_m: Math.PI * 0.6 }) - 600) < 1e-9);
  assert.equal(Model.wheelDiameterMm({}), null);
  assert.equal(Model.wheelDiameterMm(undefined), null);
});

test('normalizeGearing keeps a positive shift time and drops blank/zero/invalid ones', () => {
  const g = (shift) => Model.normalizeGearing({ final_ratio: 2.8, shift_time_ms: shift });
  assert.equal(g(100).shift_time_ms, 100);
  assert.equal(g('80').shift_time_ms, 80);
  for (const bad of [0, '', null, -5, 'abc']) assert.equal('shift_time_ms' in g(bad), false);
});
