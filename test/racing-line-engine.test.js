const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// racing-line-calculations.js is a browser IIFE that only needs `window`, so it loads in a
// bare vm sandbox. Only plain numbers/arrays cross back out, so no cross-realm deepEqual.
const sandbox = { window: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '..', 'racing-line-calculations.js'), 'utf8'),
  sandbox
);
const calc = sandbox.window.RacingLineCalculations;

// A closed circular track: a periodic quintic B-spline whose control points sit on a
// circle. Same {points, knots, degree, period} shape buildPeriodicRepFromEntries makes
// (uniform spans), which is all simulateVehicleSpeed reads.
function circleRep(radius, controlPoints) {
  const degree = 5;
  const S = controlPoints;
  const span = (2 * Math.PI * radius) / S;
  const period = span * S;
  const entries = [];
  for (let i = 0; i < S; i++) {
    const a = (i / S) * 2 * Math.PI;
    entries.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) });
  }
  const primary = [];
  for (let i = 0; i <= S; i++) primary.push(i * span);
  const knotValueAt = (i) => {
    let k = i;
    let offset = 0;
    while (k < 0) { k += S; offset -= period; }
    while (k > S) { k -= S; offset += period; }
    return primary[k] + offset;
  };
  const points = [];
  for (let i = 0; i < S + degree; i++) points.push(entries[i % S]);
  const knots = [];
  for (let j = 0; j < S + degree + degree + 1; j++) knots.push(knotValueAt(j - degree));
  return { points, knots, degree, period, numControlPoints: S };
}

function sampleAt(rep, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push({ dist: (i / count) * rep.period });
  return out;
}

const GEARING = {
  primary_ratio: 1.0,
  final_ratio: 2.8,
  gear_ratios: [2.5, 1.9, 1.5, 1.25, 1.05, 0.95],
  wheel_circumference_m: 1.9
};
const flatCurve = (kw) => [1000, 4000, 8000, 12000, 14000].map((rpm) => ({ rpm, power_kw: kw }));
const shapedCurve = [
  { rpm: 3000, power_kw: 10 }, { rpm: 6000, power_kw: 30 }, { rpm: 9000, power_kw: 52 },
  { rpm: 11000, power_kw: 60 }, { rpm: 12500, power_kw: 55 }
];

const BASE = { maxLatG: 1.5, maxLongG: 1.0, cda: 0.4, massKg: 250 };

test('describeEngineProblems names each missing piece and is empty when complete', () => {
  assert.strictEqual(calc.describeEngineProblems({ powerCurve: shapedCurve, gearing: GEARING }).length, 0);
  const none = Array.from(calc.describeEngineProblems({ powerCurve: [], gearing: {} }));
  assert.ok(none.some((p) => /power curve/.test(p)));
  assert.ok(none.some((p) => /gear ratios/.test(p)));
  assert.ok(none.some((p) => /final drive/.test(p)));
  assert.ok(none.some((p) => /wheel circumference/.test(p)));
  const noTyre = Array.from(calc.describeEngineProblems({
    powerCurve: shapedCurve, gearing: Object.assign({}, GEARING, { wheel_circumference_m: 0 })
  }));
  assert.deepStrictEqual(noTyre, ['a wheel circumference']);
});

test('the best gear only ever goes up with speed, stays under redline, and cuts out past top gear', () => {
  const model = calc.buildEngineModel({ powerCurve: shapedCurve, gearing: GEARING, efficiency: 1 });
  let lastGear = 0;
  for (let v = 1; v < model.maxGearSpeed; v += 1) {
    const pick = model.best(v);
    assert.ok(pick.gear >= lastGear, `gear dropped at ${v} m/s (${lastGear} -> ${pick.gear})`);
    assert.ok(pick.rpm <= model.redlineRpm + 1e-6, `over redline at ${v} m/s`);
    assert.ok(pick.powerW > 0);
    lastGear = pick.gear;
  }
  assert.strictEqual(model.best(1).gear, 1, 'launches in first gear');
  assert.strictEqual(model.best(model.maxGearSpeed * 0.999).gear, 6, 'top speed is in top gear');
  assert.strictEqual(model.best(model.maxGearSpeed * 1.05).powerW, 0, 'no power beyond the redline in top gear');
});

test('the chosen gear is the one with the most wheel power, not just the tallest gear that fits', () => {
  const model = calc.buildEngineModel({ powerCurve: shapedCurve, gearing: GEARING, efficiency: 1 });
  const circ = GEARING.wheel_circumference_m;
  const powerAt = (rpm) => {
    // Below the first curve point (3000 rpm): clutch slip, torque held -> power scales with rpm.
    if (rpm <= 3000) return 10000 * (rpm / 3000);
    for (let i = 1; i < shapedCurve.length; i++) {
      if (rpm <= shapedCurve[i].rpm) {
        const a = shapedCurve[i - 1]; const b = shapedCurve[i];
        return (a.power_kw + (b.power_kw - a.power_kw) * (rpm - a.rpm) / (b.rpm - a.rpm)) * 1000;
      }
    }
    return 0;
  };
  for (const v of [3, 5, 8, 14, 20, 27, 33, 40]) {
    let bestPower = -1;
    GEARING.gear_ratios.forEach((r) => {
      const rpm = (v / circ) * 60 * r * GEARING.final_ratio;
      if (rpm <= 12500) bestPower = Math.max(bestPower, powerAt(rpm));
    });
    assert.ok(Math.abs(model.best(v).powerW - bestPower) < 1e-6, `not the max-power gear at ${v} m/s`);
  }
});

test('drivetrain efficiency scales the power the engine model delivers', () => {
  const full = calc.buildEngineModel({ powerCurve: shapedCurve, gearing: GEARING, efficiency: 1 });
  const lossy = calc.buildEngineModel({ powerCurve: shapedCurve, gearing: GEARING, efficiency: 0.9 });
  assert.ok(Math.abs(lossy.best(25).powerW - full.best(25).powerW * 0.9) < 1e-6);
});

test('a flat engine curve behaves like the same flat average power (engine mode sanity check)', () => {
  const rep = circleRep(400, 40);
  const sampled = sampleAt(rep, 200);
  const avg = calc.simulateVehicleSpeed(rep, sampled, Object.assign({ powerKw: 30 }, BASE), null);
  const eng = calc.simulateVehicleSpeed(rep, sampled, Object.assign({
    powerKw: 30, engine: { powerCurve: flatCurve(30), gearing: GEARING, efficiency: 1 }
  }, BASE), null);
  assert.ok(Math.abs(eng.lapTime - avg.lapTime) / avg.lapTime < 0.005,
    `lap times differ: ${eng.lapTime} vs ${avg.lapTime}`);
  assert.ok(eng.usedEngineModel);
});

test('more engine power gives a faster lap, and the outputs include gear and RPM', () => {
  const rep = circleRep(400, 40);
  const sampled = sampleAt(rep, 200);
  const run = (scale) => calc.simulateVehicleSpeed(rep, sampled, Object.assign({
    engine: {
      powerCurve: shapedCurve.map((p) => ({ rpm: p.rpm, power_kw: p.power_kw * scale })),
      gearing: GEARING, efficiency: 0.95
    }
  }, BASE), null);
  const weak = run(0.4);
  const strong = run(1);
  assert.ok(strong.lapTime < weak.lapTime);
  assert.strictEqual(strong.gear.length, 200);
  assert.strictEqual(strong.rpm.length, 200);
  for (let i = 0; i < 200; i++) {
    assert.ok(strong.gear[i] >= 1 && strong.gear[i] <= 6);
    assert.ok(strong.rpm[i] > 0 && strong.rpm[i] <= 12500 + 1e-6);
  }
});

test('without an engine there are no gear/RPM channels and nothing else changes', () => {
  const rep = circleRep(400, 40);
  const sampled = sampleAt(rep, 120);
  const res = calc.simulateVehicleSpeed(rep, sampled, Object.assign({ powerKw: 30 }, BASE), null);
  assert.strictEqual(res.gear, null);
  assert.strictEqual(res.rpm, null);
  assert.strictEqual(res.usedEngineModel, false);
  assert.ok(res.lapTime > 0);
});

test('an incomplete engine falls back to average power instead of failing', () => {
  const rep = circleRep(400, 40);
  const sampled = sampleAt(rep, 120);
  const res = calc.simulateVehicleSpeed(rep, sampled, Object.assign({
    powerKw: 30, engine: { powerCurve: shapedCurve, gearing: { final_ratio: 2.8 } }
  }, BASE), null);
  assert.strictEqual(res.usedEngineModel, false);
  assert.ok(res.lapTime > 0);
});

test('wheel force from power/speed equals engine torque x total ratio x efficiency / wheel radius', () => {
  // The model works from power (P = torque x angular speed); this checks that against the
  // textbook drive-force formulation built independently from the curve's torque.
  const efficiency = 0.93;
  const model = calc.buildEngineModel({ powerCurve: shapedCurve, gearing: GEARING, efficiency });
  const radius = GEARING.wheel_circumference_m / (2 * Math.PI);
  const powerKwAt = (rpm) => {
    if (rpm <= shapedCurve[0].rpm) return shapedCurve[0].power_kw;
    for (let i = 1; i < shapedCurve.length; i++) {
      if (rpm <= shapedCurve[i].rpm) {
        const a = shapedCurve[i - 1]; const b = shapedCurve[i];
        return a.power_kw + (b.power_kw - a.power_kw) * (rpm - a.rpm) / (b.rpm - a.rpm);
      }
    }
    return 0;
  };
  for (const v of [2, 6, 12, 19, 26, 33, 41]) {
    const pick = model.best(v);
    const totalRatio = GEARING.primary_ratio * GEARING.gear_ratios[pick.gear - 1] * GEARING.final_ratio;
    // Engine RPM really is wheel RPM x total ratio (wheel RPM = speed / circumference). Where
    // that is below the curve's first point the clutch slips and the torque is that point's.
    const rpm = (v / GEARING.wheel_circumference_m) * 60 * totalRatio;
    const torqueRpm = Math.max(rpm, 3000);
    const engineTorqueNm = (powerKwAt(torqueRpm) * 1000) / ((2 * Math.PI * torqueRpm) / 60);
    const wheelForceN = engineTorqueNm * totalRatio * efficiency / radius;
    const modelForceN = pick.powerW / v;
    assert.ok(Math.abs(wheelForceN - modelForceN) / modelForceN < 1e-9,
      `force mismatch at ${v} m/s: ${wheelForceN} vs ${modelForceN}`);
  }
});

test('the redline speed is redline RPM / total ratio x wheel circumference', () => {
  const model = calc.buildEngineModel({ powerCurve: shapedCurve, gearing: GEARING });
  // Tallest gear (0.95): 12500 rpm -> wheel rev/s = 12500 / 60 / (1.0 x 0.95 x 2.8).
  const expected = (12500 / 60 / (0.95 * 2.8)) * GEARING.wheel_circumference_m;
  assert.ok(Math.abs(model.maxGearSpeed - expected) < 1e-9);
});

test('a wheel diameter entered as the circumference pins the bike at the top-gear redline for the whole lap', () => {
  // Big enough circle (cornering limit ~66 m/s) that the track allows more than the wrong
  // wheel's ~47 m/s redline speed, so only the rev limiter can be what holds it back.
  const rep = circleRep(300, 40);
  const sampled = sampleAt(rep, 160);
  const run = (circumference) => calc.simulateVehicleSpeed(rep, sampled, Object.assign({
    engine: {
      powerCurve: shapedCurve,
      gearing: Object.assign({}, GEARING, { wheel_circumference_m: circumference }), efficiency: 0.95
    }
  }, BASE), null);

  const right = run(1.9); // pi x 0.6 m diameter
  const wrong = run(0.6); // the diameter itself, typed in the circumference field
  assert.ok(right.revLimitedFraction < 0.2, 'correct wheel size is limited by the track, not the rev limiter');
  assert.ok(wrong.revLimitedFraction > 0.9, `wrong wheel size should sit on the limiter (${wrong.revLimitedFraction})`);
  assert.ok(wrong.lapTime > right.lapTime * 1.15, 'and is much slower');
  // Exactly the reported symptom: one speed, top gear, redline RPM, all the way round.
  const speeds = Array.from(wrong.speed);
  assert.ok(Math.max(...speeds) - Math.min(...speeds) < 0.5);
  assert.ok(Array.from(wrong.gear).every((g) => g === 6));
  assert.ok(Array.from(wrong.rpm).every((r) => Math.abs(r - 12500) < 1));
  assert.ok(Math.abs(wrong.redlineSpeed - Math.max(...speeds)) < 0.5);
});
