const test = require('node:test');
const assert = require('node:assert/strict');

// Reimplementation of computeWindowedAverage from app.js for testing.
// This matches the logic in app.js computeWindowedAverage exactly.
function computeWindowedAverage(values, axisValues, halfWindow) {
  const n = values.length;
  const result = new Array(n).fill(null);
  if (n === 0 || !(halfWindow > 0)) return result;

  const hasAxis = Array.isArray(axisValues) && axisValues.length === n &&
    axisValues.some(v => Number.isFinite(v));
  let isMonotonic = true;
  if (hasAxis) {
    for (let i = 1; i < n; i++) {
      if (!Number.isFinite(axisValues[i - 1]) || !Number.isFinite(axisValues[i])) continue;
      if (axisValues[i] < axisValues[i - 1]) { isMonotonic = false; break; }
    }
  }

  for (let i = 0; i < n; i++) {
    const raw = values[i];
    if (raw === null || raw === undefined) { result[i] = null; continue; }
    const center = Number(raw);
    if (!Number.isFinite(center)) { result[i] = null; continue; }
    if (!hasAxis) { result[i] = center; continue; }
    const cx = axisValues[i];
    if (!Number.isFinite(cx)) { result[i] = center; continue; }

    let weightedSum = 0;
    let weightTotal = 0;

    const accumulate = (j) => {
      const rv = values[j];
      if (rv === null || rv === undefined) return false;
      const v = Number(rv);
      const xj = axisValues[j];
      if (!Number.isFinite(v) || !Number.isFinite(xj)) return false;
      const dt = Math.abs(xj - cx);
      if (dt > halfWindow) return true;
      const w = 1 - (dt / halfWindow);
      if (w <= 0) return false;
      weightedSum += v * w;
      weightTotal += w;
      return false;
    };

    if (isMonotonic) {
      accumulate(i);
      for (let j = i - 1; j >= 0; j--) { if (accumulate(j)) break; }
      for (let j = i + 1; j < n; j++) { if (accumulate(j)) break; }
    } else {
      for (let j = 0; j < n; j++) accumulate(j);
    }

    result[i] = weightTotal > 0 ? (weightedSum / weightTotal) : center;
  }
  return result;
}

test('computeWindowedAverage returns null array for empty input', () => {
  const result = computeWindowedAverage([], [], 0.5);
  assert.deepEqual(result, []);
});

test('computeWindowedAverage returns null array when halfWindow <= 0', () => {
  const result = computeWindowedAverage([1, 2, 3], [0, 1, 2], 0);
  assert.deepEqual(result, [null, null, null]);
});

test('computeWindowedAverage returns original values without axis values', () => {
  const result = computeWindowedAverage([10, 20, 30], null, 0.5);
  assert.deepEqual(result, [10, 20, 30]);
});

test('computeWindowedAverage smooths a flat signal unchanged', () => {
  const values = [5, 5, 5, 5, 5];
  const times = [0, 1, 2, 3, 4];
  const result = computeWindowedAverage(values, times, 0.5);
  result.forEach(v => assert.ok(Math.abs(v - 5) < 1e-10, `Expected ~5 but got ${v}`));
});

test('computeWindowedAverage smooths a step function', () => {
  // [0,0,0,10,10,10] should have smoothed transitions at the step
  const values = [0, 0, 0, 10, 10, 10];
  const times = [0, 1, 2, 3, 4, 5];
  const result = computeWindowedAverage(values, times, 1.0);
  // Center samples (far from the step) should remain ~0 or ~10
  assert.ok(result[0] < 1, `First value should be near 0, got ${result[0]}`);
  assert.ok(result[5] > 9, `Last value should be near 10, got ${result[5]}`);
  // Middle samples near the step should be between 0 and 10
  assert.ok(result[2] >= 0 && result[2] <= 10, `result[2] should be between 0 and 10, got ${result[2]}`);
  assert.ok(result[3] >= 0 && result[3] <= 10, `result[3] should be between 0 and 10, got ${result[3]}`);
});

test('computeWindowedAverage handles null/NaN values gracefully', () => {
  const values = [1, NaN, 3, null, 5];
  const times = [0, 1, 2, 3, 4];
  const result = computeWindowedAverage(values, times, 0.5);
  assert.equal(result[1], null, 'NaN input should produce null output');
  assert.equal(result[3], null, 'null input should produce null output');
  assert.ok(Number.isFinite(result[0]), 'Finite inputs should produce finite output');
  assert.ok(Number.isFinite(result[2]), 'Finite inputs should produce finite output');
  assert.ok(Number.isFinite(result[4]), 'Finite inputs should produce finite output');
});

test('computeWindowedAverage with window larger than data span uses all samples', () => {
  const values = [1, 3, 5];
  const times = [0, 1, 2];
  // Window of 10 covers all samples — center value should be a weighted average
  const result = computeWindowedAverage(values, times, 10);
  result.forEach((v, i) => {
    assert.ok(v !== null && Number.isFinite(v), `result[${i}] should be finite, got ${v}`);
    assert.ok(v >= 1 && v <= 5, `result[${i}] should be between 1 and 5, got ${v}`);
  });
});

test('computeWindowedAverage center sample gets full weight', () => {
  // With very small window, only the center point has weight
  const values = [10, 20, 30];
  const times = [0, 1, 2];
  const result = computeWindowedAverage(values, times, 0.01);
  // With halfWindow=0.01, only samples within 0.01 of each center contribute
  assert.ok(Math.abs(result[0] - 10) < 1e-6, `result[0] should be ~10, got ${result[0]}`);
  assert.ok(Math.abs(result[1] - 20) < 1e-6, `result[1] should be ~20, got ${result[1]}`);
  assert.ok(Math.abs(result[2] - 30) < 1e-6, `result[2] should be ~30, got ${result[2]}`);
});
