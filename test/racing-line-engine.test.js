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
  assert.ok(none.some((p) => /tire size/.test(p)));
  const noTyre = Array.from(calc.describeEngineProblems({
    powerCurve: shapedCurve, gearing: Object.assign({}, GEARING, { wheel_circumference_m: 0 })
  }));
  assert.deepStrictEqual(noTyre, ['a tire size']);
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

test('required lean angle is atan(lateral acceleration in g), signed like the lateral acceleration', () => {
  const rep = circleRep(120, 40);
  const sampled = sampleAt(rep, 160);
  const res = calc.simulateVehicleSpeed(rep, sampled, Object.assign({ powerKw: 60 }, BASE), null);
  assert.equal(res.leanDeg.length, 160);
  for (let i = 0; i < 160; i++) {
    const expected = (Math.atan(res.ay[i] / 9.81) * 180) / Math.PI;
    assert.ok(Math.abs(res.leanDeg[i] - expected) < 1e-9, `lean at ${i} should be atan(ay/g)`);
    assert.strictEqual(Math.sign(res.leanDeg[i]), Math.sign(res.ay[i]), 'same sign as lateral acceleration');
  }
});

test('a lap held at the lateral-grip limit needs a lean of exactly atan(max lateral g)', () => {
  // Plenty of power and a small circle, so cornering grip (1.5 g) is what limits speed
  // everywhere -- which means lateral acceleration is 1.5 g at every point.
  const rep = circleRep(120, 40);
  const sampled = sampleAt(rep, 160);
  const res = calc.simulateVehicleSpeed(rep, sampled, Object.assign({ powerKw: 400 }, BASE), null);
  const expectedDeg = (Math.atan(BASE.maxLatG) * 180) / Math.PI; // 56.31 deg for 1.5 g
  const mags = Array.from(res.leanDeg).map(Math.abs);
  assert.ok(Math.max(...mags) - Math.min(...mags) < 0.5, 'constant around the circle');
  const mean = mags.reduce((a, b) => a + b, 0) / mags.length;
  assert.ok(Math.abs(mean - expectedDeg) < 0.5, `mean lean ${mean} vs ${expectedDeg}`);
});

test('lean angle rate is the time derivative of lean angle, and ~0 on a steady-state circle', () => {
  const rep = circleRep(120, 40);
  const sampled = sampleAt(rep, 160);
  const res = calc.simulateVehicleSpeed(rep, sampled, Object.assign({ powerKw: 400 }, BASE), null);
  assert.equal(res.leanRateDegS.length, 160);
  assert.ok(Math.max(...Array.from(res.leanRateDegS).map(Math.abs)) < 1, 'steady lean has no lean rate');
  // Interior points: central difference of lean over the elapsed time.
  const i = 50;
  const expected = (res.leanDeg[i + 1] - res.leanDeg[i - 1]) / (res.time[i + 1] - res.time[i - 1]);
  assert.ok(Math.abs(res.leanRateDegS[i] - expected) < 1e-9);
});

test('the lean angle is produced in every power model, since it only depends on lateral acceleration', () => {
  const rep = circleRep(120, 40);
  const sampled = sampleAt(rep, 100);
  const avg = calc.simulateVehicleSpeed(rep, sampled, Object.assign({ powerKw: 30 }, BASE), null);
  const eng = calc.simulateVehicleSpeed(rep, sampled, Object.assign({
    engine: { powerCurve: shapedCurve, gearing: GEARING, efficiency: 0.95 }
  }, BASE), null);
  assert.equal(avg.leanDeg.length, 100);
  assert.equal(eng.leanDeg.length, 100);
});

test('shift time: a downshift only happens when it gains more than a down + up shift costs', () => {
  const mk = (ms) => calc.buildEngineModel(
    { powerCurve: shapedCurve, gearing: Object.assign({}, GEARING, { shift_time_ms: ms }), efficiency: 1 },
    { massKg: 250, dragDecel: () => 0, accelCap: 20 }
  );
  const instant = mk(0);
  // Find a speed where the strongest gear is well below the top gear.
  let v = 8;
  while (instant.best(v).gear >= instant.gearCount - 1 && v < 60) v += 1;
  v = 12;
  const lowGear = instant.best(v).gear;
  const top = instant.gearCount;
  assert.ok(lowGear < top, 'premise: best gear at low speed is below top gear');

  // No shift time: always the strongest gear, even if a taller one is engaged.
  assert.equal(instant.best(v, top).gear, lowGear);
  // A huge shift time: the gain can never repay it, so the taller gear is kept.
  assert.equal(mk(60000).best(v, top).gear, top);
  // A negligible one: the downshift is worth it.
  assert.equal(mk(0.001).best(v, top).gear, lowGear);
  // Upshifts always go through, whatever the shift time.
  assert.equal(mk(60000).best(v, 1).gear, lowGear);
});

test('shift time lengthens (never shortens) the simulated lap, and 0 leaves it unchanged', () => {
  const rep = circleRep(120, 40);
  const sampled = sampleAt(rep, 160);
  const run = (shift) => calc.simulateVehicleSpeed(rep, sampled, Object.assign({
    engine: {
      powerCurve: shapedCurve,
      gearing: shift === undefined ? GEARING : Object.assign({}, GEARING, { shift_time_ms: shift }),
      efficiency: 0.95
    }
  }, BASE), null);
  const none = run(undefined);
  const zero = run(0);
  const slow = run(400);
  assert.equal(zero.lapTime, none.lapTime);
  assert.ok(slow.lapTime >= none.lapTime - 1e-9);
  assert.equal(slow.gear.length, 160);
});

test('leaning shrinks the rolling radius, raising RPM at the same road speed (tread radius = half the tire width)', () => {
  const R = GEARING.wheel_circumference_m / (2 * Math.PI);
  const r = 0.07;
  const mk = (tread) => calc.buildEngineModel({
    powerCurve: shapedCurve, gearing: GEARING, efficiency: 1, treadRadiusM: tread
  });
  const tire = mk(r);
  const plain = mk(0);
  const v = 25;
  const upright = tire.best(v, null, 0).rpm;
  assert.equal(upright, plain.best(v, null, 0).rpm, 'no lean, no change');
  assert.equal(plain.best(v, null, 0.9).rpm, upright, 'no tread radius, no lean effect');
  for (const deg of [15, 30, 50]) {
    const lean = (deg * Math.PI) / 180;
    const expected = upright * R / ((R - r) + r * Math.cos(lean));
    const leaned = tire.best(v, null, lean);
    // Gear can differ once RPM shifts, so compare the same gear directly.
    const sameGear = tire.best(v, null, lean).gear === tire.best(v, null, 0).gear;
    if (sameGear) assert.ok(Math.abs(leaned.rpm - expected) < 1e-6, `rpm at ${deg} deg`);
    assert.ok(leaned.rpm >= upright - 1e-9);
  }
  // ~50 degrees of lean on the R3's 140 mm tire is roughly +8-9% RPM.
  const ratio = R / ((R - r) + r * Math.cos((50 * Math.PI) / 180));
  assert.ok(ratio > 1.07 && ratio < 1.10, `ratio ${ratio}`);
});

test('the simulated RPM in corners is higher with the tread radius set, straights are unchanged', () => {
  const rep = circleRep(60, 40); // one long constant corner
  const sampled = sampleAt(rep, 120);
  const run = (tread) => calc.simulateVehicleSpeed(rep, sampled, Object.assign({
    engine: { powerCurve: shapedCurve, gearing: GEARING, efficiency: 0.95, treadRadiusM: tread }
  }, BASE), null);
  const withTread = run(0.07);
  const without = run(0);
  const meanRpm = (r) => r.rpm.reduce((a, b) => a + b, 0) / r.rpm.length;
  assert.ok(meanRpm(withTread) > meanRpm(without) * 1.02);
  assert.ok(withTread.lapTime >= 0 && Math.abs(withTread.lapTime - without.lapTime) / without.lapTime < 0.05);
});

test('computeEngineRpmGear gives RPM and gear for logged speed, with a lean correction from lateral g', () => {
  const engine = { powerCurve: shapedCurve, gearing: GEARING, efficiency: 0.95, treadRadiusM: 0.07 };
  const speed = [10, 15, 20, 25, 30, 30];
  const straight = calc.computeEngineRpmGear(engine, speed, null, { massKg: 250, cda: 0.4 });
  const leaning = calc.computeEngineRpmGear(engine, speed, [0, 0, 0, 0, 1.2, 1.2], { massKg: 250, cda: 0.4 });
  assert.equal(straight.rpm.length, 6);
  assert.ok(straight.gear.every((g) => g >= 1 && g <= 6));
  for (let i = 0; i < 4; i++) assert.equal(leaning.rpm[i], straight.rpm[i]);
  assert.ok(leaning.rpm[4] > straight.rpm[4], 'leaned samples turn faster');
  assert.equal(calc.computeEngineRpmGear({ powerCurve: [], gearing: {} }, speed, null, {}), null);
  const gaps = calc.computeEngineRpmGear(engine, [10, NaN, 20], null, {});
  assert.equal(gaps.rpm[1], null);
});

test('computeLeanFromLatAcc: lean = atan(lat g), rate is dLean/dt within a lap only', () => {
  const lat = [0, 0.5, 1, 1, 0.5, 0];
  const t = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
  const res = calc.computeLeanFromLatAcc(lat, t, [1, 1, 1, 2, 2, 2]);
  assert.ok(Math.abs(res.leanDeg[2] - 45) < 1e-9);
  assert.ok(Math.abs(res.leanDeg[1] - (Math.atan(0.5) * 180 / Math.PI)) < 1e-9);
  assert.ok(Math.abs(res.leanRateDegS[1] - (45 - 0) / 0.2) < 1e-9);
  assert.strictEqual(res.leanRateDegS[0], null);
  assert.strictEqual(res.leanRateDegS[2], null, 'a difference never spans two laps');
  assert.strictEqual(res.leanRateDegS[5], null);
  const noTime = calc.computeLeanFromLatAcc([0.1, NaN, 0.3], null, null);
  assert.strictEqual(noTime.leanDeg[1], null);
  assert.ok(noTime.leanRateDegS.every((r) => r === null));
  assert.strictEqual(calc.computeLeanFromLatAcc(null, null, null), null);
});

test('computeTireAeroDecel: aero decel matches 0.5*rho*CdA*v^2/(mass*g), tire = ax + aero (+grade)', () => {
  const mass = 250, cda = 0.4;
  const rho = 1.225, g = 9.81;
  const speeds = [0, 10, 20, 30];
  const ax = [0, 0, 0, 0]; // coasting: measured accel is purely "minus aero" already netted in
  const res = calc.computeTireAeroDecel(speeds, ax, { massKg: mass, cda });
  speeds.forEach((v, i) => {
    const expectedAero = (0.5 * rho * cda * v * v) / mass / g;
    assert.ok(Math.abs(res.aeroDecelG[i] - expectedAero) < 1e-9, `aero at v=${v}`);
    // ax=0 here means "no net accel measured", so tire = 0 + aero -- i.e. the tires must be
    // pushing exactly hard enough to cancel drag and hold a steady speed.
    assert.ok(Math.abs(res.tireAccelG[i] - expectedAero) < 1e-9, `tire at v=${v}`);
  });

  // Coasting with the engine disengaged: ax == -aero exactly (drag is the only force) ->
  // the tires' own net contribution comes back as zero.
  const aeroOnly = speeds.map((v) => -((0.5 * rho * cda * v * v) / mass / g));
  const coasting = calc.computeTireAeroDecel(speeds, aeroOnly, { massKg: mass, cda });
  coasting.tireAccelG.forEach((t) => assert.ok(Math.abs(t) < 1e-9));

  // A positive (uphill) grade assists braking -- for the SAME measured deceleration,
  // gravity is doing part of the work, so the tires' own recovered contribution is a
  // smaller braking effort (a less negative number) than on the flat.
  const withGrade = calc.computeTireAeroDecel([20], [-0.5], { massKg: mass, cda, gradeDeg: [10] });
  const flat = calc.computeTireAeroDecel([20], [-0.5], { massKg: mass, cda });
  assert.ok(withGrade.tireAccelG[0] > flat.tireAccelG[0]);
  assert.ok(Math.abs(withGrade.tireAccelG[0] - (flat.tireAccelG[0] + Math.sin(10 * Math.PI / 180))) < 1e-9);

  assert.strictEqual(calc.computeTireAeroDecel(null, [1], {}), null);
  assert.strictEqual(calc.computeTireAeroDecel([1], null, {}), null);
  const gaps = calc.computeTireAeroDecel([10, NaN], [0.1, 0.1], {});
  assert.strictEqual(gaps.aeroDecelG[1], null);
  assert.strictEqual(gaps.tireAccelG[1], null);
});

test('computeTireAeroDecel: decomposing a hand-built braking event (matching the simulator\'s own accounting) recovers the tire-only limit', () => {
  // Mirrors simulateVehicleSpeed's backward pass exactly: aBrakeTotal = aTraction + drag +
  // grade, i.e. measured ax = -aBrakeTotal. Built by hand here (rather than running a full
  // lap simulation) since a real braking *zone* needs a track with varying curvature --
  // more than this decomposition math itself needs to be exercised.
  const mass = 220, cda = 0.6, maxLongG = 0.7;
  const g = 9.81, rho = 1.225;
  const speeds = [40, 30, 20, 10, 0];
  const axG = speeds.map((v) => {
    const dragDecelG = (0.5 * rho * cda * v * v) / mass / g;
    return -(maxLongG + dragDecelG); // tires pinned at the limit the whole way down
  });
  const decomposed = calc.computeTireAeroDecel(speeds, axG, { massKg: mass, cda });
  decomposed.tireAccelG.forEach((t, i) => {
    assert.ok(Math.abs(t - -maxLongG) < 1e-9, `row ${i}: recovered tire g ${t}`);
  });
  // The raw measured deceleration is always more than the tire-only limit, by however much
  // drag contributed at that speed (biggest gap at the highest speed).
  assert.ok(Math.abs(axG[0]) > maxLongG + 0.05);
  assert.ok(Math.abs(axG[axG.length - 1]) - maxLongG < 1e-6); // at v=0, drag is 0 too
});

test('computeTireAeroDecel exposes the slope share and whether grade was actually used', () => {
  const flat = calc.computeTireAeroDecel([20, 20], [0, 0], { massKg: 220, cda: 0.5 });
  assert.strictEqual(flat.hasGrade, false);
  assert.ok(flat.slopeDecelG.every((s) => s === 0));

  const uphill = calc.computeTireAeroDecel([20, 20], [0, 0], { massKg: 220, cda: 0.5, gradeDeg: [10, -10] });
  assert.strictEqual(uphill.hasGrade, true);
  assert.ok(Math.abs(uphill.slopeDecelG[0] - Math.sin(10 * Math.PI / 180)) < 1e-9);
  assert.ok(Math.abs(uphill.slopeDecelG[1] - Math.sin(-10 * Math.PI / 180)) < 1e-9);
  // tireAccelG already folds slopeDecelG in -- exposing it separately shouldn't change that.
  uphill.tireAccelG.forEach((t, i) => {
    assert.ok(Math.abs(t - (0 + uphill.aeroDecelG[i] + uphill.slopeDecelG[i])) < 1e-9);
  });
});

test('computeWheelLoads: static split matches (L-p)/L and p/L with zero accel', () => {
  const geom = { massKg: 200, cgHeightM: 0.55, cgPositionM: 0.8, wheelbaseM: 1.4 };
  const res = calc.computeWheelLoads([0, 0, 0], null, null, geom);
  const expectedFront = 200 * (1.4 - 0.8) / 1.4;
  const expectedRear = 200 * 0.8 / 1.4;
  res.frontKg.forEach((f) => assert.ok(Math.abs(f - expectedFront) < 1e-9));
  res.rearKg.forEach((r) => assert.ok(Math.abs(r - expectedRear) < 1e-9));
  assert.ok(Math.abs(res.staticFrontKg - expectedFront) < 1e-9);
  assert.ok(Math.abs(expectedFront + expectedRear - geom.massKg) < 1e-9, 'front + rear = total mass');
});

test('computeWheelLoads: accelerating shifts load to the rear, braking to the front, by mass*axG*hCg/L', () => {
  const geom = { massKg: 200, cgHeightM: 0.55, cgPositionM: 0.8, wheelbaseM: 1.4 };
  const flat = calc.computeWheelLoads([0], null, null, geom);
  const accelerating = calc.computeWheelLoads([0.5], null, null, geom); // 0.5 g
  const braking = calc.computeWheelLoads([-0.5], null, null, geom);
  const expectedShift = 200 * 0.5 * 0.55 / 1.4;
  assert.ok(Math.abs((flat.frontKg[0] - accelerating.frontKg[0]) - expectedShift) < 1e-9);
  assert.ok(Math.abs((braking.frontKg[0] - flat.frontKg[0]) - expectedShift) < 1e-9);
  assert.ok(Math.abs((accelerating.rearKg[0] - flat.rearKg[0]) - expectedShift) < 1e-9);
  // Total load is conserved -- weight transfer only redistributes it.
  assert.ok(Math.abs((accelerating.frontKg[0] + accelerating.rearKg[0]) - geom.massKg) < 1e-9);
  assert.ok(Math.abs((braking.frontKg[0] + braking.rearKg[0]) - geom.massKg) < 1e-9);
});

test('computeWheelLoads: aero pitching term cancels exactly when the CoP sits at the same height as the CG', () => {
  // Pure-drag coasting: the vehicle's whole measured decel comes from aero alone. If CoP
  // and CG are at the same height, the two competing effects (inertial nose-dive from
  // decelerating, and the aero moment) exactly cancel back to the plain static split --
  // see the comment on computeWheelLoads for why.
  const geom = { massKg: 200, cgHeightM: 0.6, cgPositionM: 0.8, wheelbaseM: 1.4, copHeightM: 0.6 };
  const aeroDecelG = [0.2];
  const axG = [-0.2]; // deceleration entirely attributable to aero drag
  const res = calc.computeWheelLoads(axG, aeroDecelG, null, geom);
  const staticFront = 200 * (1.4 - 0.8) / 1.4;
  assert.ok(Math.abs(res.frontKg[0] - staticFront) < 1e-9, `front ${res.frontKg[0]} vs static ${staticFront}`);

  // With the CoP higher than the CG, the aero term no longer fully cancels -- the front
  // ends up lighter than the static split (drag pitches the nose up / squats the rear).
  const higherCop = calc.computeWheelLoads(axG, aeroDecelG, null, Object.assign({}, geom, { copHeightM: 1.0 }));
  assert.ok(higherCop.frontKg[0] < staticFront);
});

test('computeWheelLoads: lean shrinks the effective CG height (cos(lean)), reducing the weight-transfer magnitude', () => {
  const geom = { massKg: 200, cgHeightM: 0.6, cgPositionM: 0.8, wheelbaseM: 1.4 };
  const upright = calc.computeWheelLoads([0.5], null, [0], geom);
  const leaned = calc.computeWheelLoads([0.5], null, [50], geom); // 50 degrees of lean
  const staticFront = 200 * (1.4 - 0.8) / 1.4;
  const uprightShift = staticFront - upright.frontKg[0];
  const leanedShift = staticFront - leaned.frontKg[0];
  assert.ok(leanedShift > 0 && leanedShift < uprightShift, `leaned shift ${leanedShift} vs upright ${uprightShift}`);
  assert.ok(Math.abs(leanedShift - uprightShift * Math.cos(50 * Math.PI / 180)) < 1e-9);
});

test('computeWheelLoads returns null unless mass, cgHeightM, cgPositionM and wheelbaseM are all present', () => {
  assert.strictEqual(calc.computeWheelLoads([0], null, null, {}), null);
  assert.strictEqual(calc.computeWheelLoads([0], null, null, { massKg: 200 }), null);
  assert.strictEqual(calc.computeWheelLoads(null, null, null, { massKg: 200, cgHeightM: 0.5, cgPositionM: 0.8, wheelbaseM: 1.4 }), null);
  assert.ok(calc.computeWheelLoads([0], null, null, { massKg: 200, cgHeightM: 0.5, cgPositionM: 0.8, wheelbaseM: 1.4 }));
});

test('computeRiderCgDeltas picks tucked/braking/hangoff by ax sign and lean threshold', () => {
  const rider = {
    cg_height_delta_tucked_m: -0.05, cg_position_delta_tucked_m: 0.01,
    cg_height_delta_braking_m: 0.08, cg_position_delta_braking_m: -0.02,
    cg_height_delta_hangoff_m: -0.12, cg_position_delta_hangoff_m: 0.03
  };
  const axG = [0.3, -0.3, 0.1, -0.1];
  const leanDeg = [0, 0, 20, -20]; // last two past the 15 deg hang-off threshold
  const res = calc.computeRiderCgDeltas(axG, leanDeg, rider);
  assert.ok(Math.abs(res.heightDeltaM[0] - -0.05) < 1e-9, 'accelerating, no lean -> tucked');
  assert.ok(Math.abs(res.heightDeltaM[1] - 0.08) < 1e-9, 'braking, no lean -> braking');
  assert.ok(Math.abs(res.heightDeltaM[2] - -0.12) < 1e-9, 'past lean threshold -> hangoff regardless of ax sign');
  assert.ok(Math.abs(res.heightDeltaM[3] - -0.12) < 1e-9, 'negative lean magnitude still counts as hangoff');
  assert.ok(Math.abs(res.positionDeltaM[0] - 0.01) < 1e-9);
  assert.ok(Math.abs(res.positionDeltaM[1] - -0.02) < 1e-9);

  assert.strictEqual(calc.computeRiderCgDeltas(axG, leanDeg, null), null);
  assert.strictEqual(calc.computeRiderCgDeltas(axG, leanDeg, {}), null, 'a rider with no deltas at all changes nothing');
  assert.strictEqual(calc.computeRiderCgDeltas(null, leanDeg, rider), null);
});

test('computeWheelLoads applies per-sample rider CG deltas (height and position, so the static split can vary too)', () => {
  const geom = { massKg: 200, cgHeightM: 0.6, cgPositionM: 0.8, wheelbaseM: 1.4 };
  const flat = calc.computeWheelLoads([0, 0], null, null, geom);

  const withDelta = calc.computeWheelLoads([0, 0], null, null, Object.assign({}, geom, {
    cgHeightDeltaM: [0.1, 0.1], // ax = 0 so height delta alone doesn't move mech term, but...
    cgPositionDeltaM: [0.1, -0.1] // ...position delta shifts the static split itself
  }));
  const staticWithPlus = 200 * (1.4 - 0.9) / 1.4; // p = 0.8 + 0.1
  const staticWithMinus = 200 * (1.4 - 0.7) / 1.4; // p = 0.8 - 0.1
  assert.ok(Math.abs(withDelta.frontKg[0] - staticWithPlus) < 1e-9);
  assert.ok(Math.abs(withDelta.frontKg[1] - staticWithMinus) < 1e-9);
  assert.notStrictEqual(withDelta.frontKg[0], flat.frontKg[0]);

  // A height delta changes the weight-transfer magnitude once there's some accel to transfer.
  const accelFlat = calc.computeWheelLoads([0.4], null, null, geom);
  const accelRaised = calc.computeWheelLoads([0.4], null, null, Object.assign({}, geom, { cgHeightDeltaM: [0.2] }));
  const shiftFlat = geom.massKg * 0.8 / 1.4 - accelFlat.rearKg[0] + (geom.massKg * 0.8 / 1.4); // just sanity, recompute directly below
  void shiftFlat;
  const mechFlat = 200 * 0.4 * 0.6 / 1.4;
  const mechRaised = 200 * 0.4 * 0.8 / 1.4; // hCg 0.6 + 0.2 delta
  assert.ok(Math.abs((accelFlat.frontKg[0] - (200 * (1.4 - 0.8) / 1.4)) - -mechFlat) < 1e-9);
  assert.ok(Math.abs((accelRaised.frontKg[0] - (200 * (1.4 - 0.8) / 1.4)) - -mechRaised) < 1e-9);
});
