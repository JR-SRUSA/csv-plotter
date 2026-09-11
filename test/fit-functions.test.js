const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadFitFunctions() {
  const scriptPath = path.join(__dirname, '..', 'fit-functions.js');
  const source = fs.readFileSync(scriptPath, 'utf8');

  const context = {
    window: {},
    console,
    Math,
    Number,
    String,
    Array,
    Object,
    Function,
    Infinity
  };

  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'fit-functions.js' });
  return context.window.FitFunctions;
}

const MATH_SCOPE_KEYS = ['sin', 'cos', 'exp', 'sqrt', 'abs', 'PI'];
const MATH_SCOPE_VALS = [Math.sin, Math.cos, Math.exp, Math.sqrt, Math.abs, Math.PI];

function buildSeries(n, xStep, fn) {
  const xs = [], ys = [];
  for (let i = 0; i < n; i++) {
    const x = i * xStep;
    xs.push(x);
    ys.push(fn(x));
  }
  return { xs, ys };
}

test('computeLinearFit recovers slope/intercept from a noise-free line', () => {
  const FF = loadFitFunctions();
  const { xs, ys } = buildSeries(50, 0.1, (x) => 3 * x + 2);
  const fit = FF.computeLinearFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.slope - 3) < 1e-9);
  assert.ok(Math.abs(fit.intercept - 2) < 1e-9);
  assert.ok(Math.abs(fit.r2 - 1) < 1e-9);
});

test('computeLinearFit returns null for a vertical slice (no x spread)', () => {
  const FF = loadFitFunctions();
  const fit = FF.computeLinearFit([5, 5, 5], [1, 2, 3]);
  assert.equal(fit, null);
});

test('computeR2 is 1 for a perfect fit and null on mismatched/empty input', () => {
  const FF = loadFitFunctions();
  assert.equal(FF.computeR2([1, 2, 3], [1, 2, 3]), 1);
  assert.equal(FF.computeR2([1, 2], [1, 2, 3]), null);
  assert.equal(FF.computeR2([], []), null);
});

test('sampleFitSeries passes through short series and downsamples long ones', () => {
  const FF = loadFitFunctions();
  const xs = Array.from({ length: 10 }, (_, i) => i);
  const ys = xs.slice();
  const passthrough = FF.sampleFitSeries(xs, ys, 4000);
  assert.equal(passthrough.xs.length, 10);

  const longXs = Array.from({ length: 10000 }, (_, i) => i);
  const longYs = longXs.slice();
  const sampled = FF.sampleFitSeries(longXs, longYs, 500);
  assert.equal(sampled.xs.length, 500);
  assert.equal(sampled.xs[0], 0);
  assert.equal(sampled.xs[sampled.xs.length - 1], 9999);
});

test('fitLinearCombination solves a simple two-feature regression exactly', () => {
  const FF = loadFitFunctions();
  // y = 2*a + 5*b, no noise
  const aCol = [1, 2, 3, 4, 5];
  const bCol = [1, 1, 1, 1, 1];
  const ys = aCol.map((a, i) => 2 * a + 5 * bCol[i]);
  const reg = FF.fitLinearCombination([aCol, bCol], ys);
  assert.ok(reg);
  assert.ok(Math.abs(reg.coeffs[0] - 2) < 1e-9);
  assert.ok(Math.abs(reg.coeffs[1] - 5) < 1e-9);
  assert.ok(reg.sse < 1e-15);
});

test('computeSinusoidalFit recovers amplitude/frequency/phase/offset from a clean sine', () => {
  const FF = loadFitFunctions();
  const trueA = 4, trueOmega = 3, truePhi = 0.5, trueOffset = -1.5;
  const { xs, ys } = buildSeries(400, 0.01, (x) => trueA * Math.sin(trueOmega * x + truePhi) + trueOffset);
  const fit = FF.computeSinusoidalFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.A - trueA) < 0.05);
  assert.ok(Math.abs(fit.omega - trueOmega) < 0.01);
  assert.ok(Math.abs(fit.offset - trueOffset) < 0.05);
  assert.ok(fit.r2 > 0.999);
});

test('computeSinusoidalFit honors a forced omega (FFT-panel click) without searching', () => {
  const FF = loadFitFunctions();
  const trueA = 2, trueOmega = 6, truePhi = 1.0, trueOffset = 0;
  const { xs, ys } = buildSeries(300, 0.01, (x) => trueA * Math.sin(trueOmega * x + truePhi) + trueOffset);
  const fit = FF.computeSinusoidalFit(xs, ys, trueOmega);
  assert.ok(fit);
  assert.equal(fit.omega, trueOmega);
  assert.ok(Math.abs(fit.A - trueA) < 0.01);
});

// Regression test: an earlier version of the sine*exponential fit used a much coarser,
// unrefined frequency search than the plain sine fit, which let a slightly-off omega get
// "explained away" by a spurious nonzero tau -- i.e. a pure, undamped sine could be
// misreported as decaying/growing. tau should come back close to zero here.
test('computeSineExpFit reports near-zero tau for an undamped (pure) sine', () => {
  const FF = loadFitFunctions();
  const trueA = 3, trueOmega = 5, truePhi = -0.3, trueOffset = 1;
  const { xs, ys } = buildSeries(400, 0.01, (x) => trueA * Math.sin(trueOmega * x + truePhi) + trueOffset);
  const fit = FF.computeSineExpFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.tau) < 0.05, `expected tau near 0, got ${fit.tau}`);
  assert.ok(Math.abs(fit.omega - trueOmega) < 0.02);
  assert.ok(fit.r2 > 0.999);
});

test('computeSineExpFit recovers a genuinely decaying sine envelope', () => {
  const FF = loadFitFunctions();
  const trueA = 3, trueOmega = 8, truePhi = 0.2, trueTau = -1.2, trueOffset = 0.5;
  const { xs, ys } = buildSeries(400, 0.01, (x) => trueA * Math.exp(trueTau * x) * Math.sin(trueOmega * x + truePhi) + trueOffset);
  const fit = FF.computeSineExpFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.tau - trueTau) < 0.1, `expected tau near ${trueTau}, got ${fit.tau}`);
  assert.ok(fit.r2 > 0.99);
});

test('computeExponentialFit recovers amplitude/time-constant/offset', () => {
  const FF = loadFitFunctions();
  const trueA = 5, trueTau = -2, trueOffset = 1;
  const { xs, ys } = buildSeries(200, 0.02, (x) => trueA * Math.exp(trueTau * x) + trueOffset);
  const fit = FF.computeExponentialFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.tau - trueTau) < 0.05);
  assert.ok(fit.r2 > 0.999);
});

test('computeFirstOrderResponseFit recovers A/tau/offset for a synthetic step response', () => {
  const FF = loadFitFunctions();
  const trueA = 10, trueTau = 0.5, trueOffset = 2;
  const { xs, ys } = buildSeries(300, 0.01, (x) => trueOffset + trueA * (1 - Math.exp(-x / trueTau)));
  const fit = FF.computeFirstOrderResponseFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.A - trueA) < 0.2);
  assert.ok(Math.abs(fit.tau - trueTau) < 0.05);
  assert.ok(Math.abs(fit.offset - trueOffset) < 0.2);
  assert.ok(fit.r2 > 0.999);
});

function secondOrderEnvelope(dt, zeta, wn) {
  const disc = 1 - zeta * zeta;
  if (Math.abs(disc) < 1e-8) return Math.exp(-zeta * wn * dt) * (1 + zeta * wn * dt);
  if (disc > 0) {
    const wd = wn * Math.sqrt(disc);
    return Math.exp(-zeta * wn * dt) * (Math.cos(wd * dt) + (zeta * wn / wd) * Math.sin(wd * dt));
  }
  const wd = wn * Math.sqrt(-disc);
  const r1 = zeta * wn - wd, r2 = zeta * wn + wd;
  const e1 = Math.exp(-r1 * dt), e2 = Math.exp(-r2 * dt);
  return 0.5 * (e1 + e2) + (zeta * wn / wd) * 0.5 * (e1 - e2);
}

test('computeSecondOrderResponseFit recovers zeta/wn for an underdamped step', () => {
  const FF = loadFitFunctions();
  const trueA = 2, trueZeta = 0.2, trueWn = 5, trueOffset = 1;
  const { xs, ys } = buildSeries(300, 0.02, (x) => trueOffset + trueA * (1 - secondOrderEnvelope(x, trueZeta, trueWn)));
  const fit = FF.computeSecondOrderResponseFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.zeta - trueZeta) < 0.05);
  assert.ok(Math.abs(fit.wn - trueWn) < 0.2);
  assert.ok(fit.r2 > 0.99);
});

test('computeSecondOrderResponseFit recovers zeta/wn for an overdamped step', () => {
  const FF = loadFitFunctions();
  const trueA = 3, trueZeta = 1.6, trueWn = 8, trueOffset = -1;
  const { xs, ys } = buildSeries(300, 0.02, (x) => trueOffset + trueA * (1 - secondOrderEnvelope(x, trueZeta, trueWn)));
  const fit = FF.computeSecondOrderResponseFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.zeta - trueZeta) < 0.2);
  assert.ok(fit.r2 > 0.99);
});

test('computeEllipseFit recovers center/axes for points on a known ellipse', () => {
  const FF = loadFitFunctions();
  const cx = 3, cy = -2, a = 5, b = 2;
  const xs = [], ys = [];
  for (let i = 0; i < 100; i++) {
    const theta = (2 * Math.PI * i) / 100;
    xs.push(cx + a * Math.cos(theta));
    ys.push(cy + b * Math.sin(theta));
  }
  const fit = FF.computeEllipseFit(xs, ys);
  assert.ok(fit);
  assert.ok(Math.abs(fit.centerX - cx) < 1e-6);
  assert.ok(Math.abs(fit.centerY - cy) < 1e-6);
  assert.ok(Math.abs(fit.a - a) < 1e-6);
  assert.ok(Math.abs(fit.b - b) < 1e-6);
});

test('computeTypedFormulaFit fits a valid decaying-exponential formula', () => {
  const FF = loadFitFunctions();
  const { xs, ys } = buildSeries(300, 0.02, (x) => 2 * Math.exp(-0.5 * x) + 1);
  const result = FF.computeTypedFormulaFit(xs, ys, 'p0*exp(-p1*t) + p2', MATH_SCOPE_KEYS, MATH_SCOPE_VALS);
  assert.equal(result.error, null);
  assert.ok(result.fit);
  assert.ok(result.fit.r2 > 0.95);
});

// Regression test: an earlier version threw an uncaught ReferenceError (crashing the
// whole selection-stats update) when the typed formula referenced an undefined name --
// `new Function` only validates syntax, not that every identifier resolves.
test('computeTypedFormulaFit returns a clean error for an undefined identifier instead of throwing', () => {
  const FF = loadFitFunctions();
  const xs = [0, 1, 2, 3, 4];
  const ys = [0, 1, 2, 3, 4];
  assert.doesNotThrow(() => {
    const result = FF.computeTypedFormulaFit(xs, ys, 'A * t', MATH_SCOPE_KEYS, MATH_SCOPE_VALS);
    assert.equal(result.fit, null);
    assert.match(result.error, /A is not defined/);
  });
});

test('compileTypedFitFormula reports a syntax error without throwing', () => {
  const FF = loadFitFunctions();
  const compiled = FF.compileTypedFitFormula('p0*(t', MATH_SCOPE_KEYS);
  assert.ok(compiled.error);
  assert.equal(compiled.fn, null);
});

test('compileTypedFitFormula rejects parameters beyond p11', () => {
  const FF = loadFitFunctions();
  const compiled = FF.compileTypedFitFormula('p0 + p12', MATH_SCOPE_KEYS);
  assert.match(compiled.error, /p0 through p11/);
});

test('computeFft finds a peak near the true frequency of a synthetic sine', () => {
  const FF = loadFitFunctions();
  const freqHz = 4;
  const { xs, ys } = buildSeries(1000, 0.005, (x) => Math.sin(2 * Math.PI * freqHz * x));
  const result = FF.computeFft(xs, ys);
  assert.ok(result);
  let peakIdx = 0;
  for (let i = 1; i < result.mags.length; i++) {
    if (result.mags[i] > result.mags[peakIdx]) peakIdx = i;
  }
  assert.ok(Math.abs(result.freqs[peakIdx] - freqHz) < 0.2, `expected peak near ${freqHz} Hz, got ${result.freqs[peakIdx]}`);
});

test('oscillatingFitPointCount scales up with cycle count but has an 80-point floor', () => {
  const FF = loadFitFunctions();
  assert.equal(FF.oscillatingFitPointCount(0, 0, 10), 80);
  const highFreqCount = FF.oscillatingFitPointCount(2 * Math.PI * 50, 0, 1); // 50 cycles over the window
  assert.ok(highFreqCount >= 501);
});
