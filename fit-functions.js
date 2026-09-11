// Pure curve-fitting/signal-analysis math for the main plot's "Selection Stats" panel.
// No DOM/Plotly dependencies -- exposed as window.FitFunctions (see index.html load
// order: this file loads before app.js) so it can also be loaded standalone in tests
// (see test/fit-functions.test.js).
(() => {
  // Spreading a large array into Math.min/max (Math.min(...arr)) blows the call stack
  // once arr has more than ~65k elements -- accumulate in a plain loop instead.
  function arrayMinMax(arr) {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return [min, max];
  }

  // Least-squares fit of y = slope*x + intercept, plus R^2 (squared Pearson correlation).
  // Returns null when the selection has no x spread (a vertical slice), since slope is undefined.
  function computeLinearFit(xs, ys) {
    const n = xs.length;
    if (n < 2) return null;
    let sumX = 0, sumY = 0;
    for (let i = 0; i < n; i++) { sumX += xs[i]; sumY += ys[i]; }
    const meanX = sumX / n, meanY = sumY / n;
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - meanX, dy = ys[i] - meanY;
      sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
    }
    if (sxx === 0) return null;
    const slope = sxy / sxx;
    const intercept = meanY - slope * meanX;
    const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
    return { slope, intercept, r2 };
  }

  function computeR2(ys, preds) {
    if (!Array.isArray(ys) || !Array.isArray(preds) || ys.length !== preds.length || ys.length === 0) return null;
    let sumY = 0;
    for (let i = 0; i < ys.length; i++) sumY += ys[i];
    const meanY = sumY / ys.length;
    let sse = 0, sst = 0;
    for (let i = 0; i < ys.length; i++) {
      const y = ys[i];
      const p = preds[i];
      if (!Number.isFinite(y) || !Number.isFinite(p)) return null;
      const err = y - p;
      const dy = y - meanY;
      sse += err * err;
      sst += dy * dy;
    }
    if (sst === 0) return 1;
    return 1 - (sse / sst);
  }

  function sampleFitSeries(xs, ys, maxPoints = 4000) {
    if (xs.length <= maxPoints) return { xs: xs.slice(), ys: ys.slice() };
    const step = (xs.length - 1) / (maxPoints - 1);
    const sx = [];
    const sy = [];
    for (let i = 0; i < maxPoints; i++) {
      const idx = Math.round(i * step);
      sx.push(xs[idx]);
      sy.push(ys[idx]);
    }
    return { xs: sx, ys: sy };
  }

  function solveLinearSystem(matrix, vector) {
    const n = vector.length;
    const aug = matrix.map((row, i) => row.slice().concat([vector[i]]));
    for (let col = 0; col < n; col++) {
      let pivotRow = col;
      let pivotAbs = Math.abs(aug[col][col]);
      for (let r = col + 1; r < n; r++) {
        const abs = Math.abs(aug[r][col]);
        if (abs > pivotAbs) { pivotAbs = abs; pivotRow = r; }
      }
      if (pivotAbs < 1e-12) return null;
      if (pivotRow !== col) {
        const tmp = aug[col];
        aug[col] = aug[pivotRow];
        aug[pivotRow] = tmp;
      }
      const pivot = aug[col][col];
      for (let c = col; c <= n; c++) aug[col][c] /= pivot;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const f = aug[r][col];
        if (f === 0) continue;
        for (let c = col; c <= n; c++) aug[r][c] -= f * aug[col][c];
      }
    }
    return aug.map((row) => row[n]);
  }

  function fitLinearCombination(features, ys) {
    const n = ys.length;
    const k = features.length;
    if (n === 0 || k === 0) return null;
    const ata = Array.from({ length: k }, () => new Array(k).fill(0));
    const atb = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const y = ys[i];
      if (!Number.isFinite(y)) return null;
      for (let a = 0; a < k; a++) {
        const va = features[a][i];
        if (!Number.isFinite(va)) return null;
        atb[a] += va * y;
        for (let b = a; b < k; b++) {
          ata[a][b] += va * features[b][i];
        }
      }
    }
    for (let a = 0; a < k; a++) for (let b = 0; b < a; b++) ata[a][b] = ata[b][a];
    const coeffs = solveLinearSystem(ata, atb);
    if (!coeffs) return null;
    let sse = 0;
    const preds = new Array(n);
    for (let i = 0; i < n; i++) {
      let p = 0;
      for (let a = 0; a < k; a++) p += coeffs[a] * features[a][i];
      preds[i] = p;
      const err = ys[i] - p;
      sse += err * err;
    }
    return { coeffs, sse, preds };
  }

  // Angular-frequency search range for the sine fits: bounded only by what's physically
  // resolvable from this selection -- longer than ~20 periods across the whole span at
  // the low end, and the Nyquist limit of the median sample spacing at the high end.
  // No cycle-count floor/ceiling beyond that; the least-squares search picks whatever
  // frequency actually minimizes error.
  function getSinusoidalOmegaRange(xs, span) {
    const sorted = xs.slice().sort((a, b) => a - b);
    const diffs = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = sorted[i] - sorted[i - 1];
      if (diff > 0) diffs.push(diff);
    }
    const medianDt = diffs.length ? diffs.sort((a, b) => a - b)[Math.floor(diffs.length / 2)] : span / Math.max(1, xs.length);
    if (!(medianDt > 0)) return null;
    const omegaMin = (2 * Math.PI) / (span * 20);
    const omegaMax = Math.PI / medianDt;
    if (!(omegaMax > omegaMin)) return null;
    return { omegaMin, omegaMax };
  }

  // forcedOmega (rad/s), when provided, skips the frequency search entirely and just
  // fits sin/cos/offset at that single frequency (used when the user clicks a
  // point in the FFT panel to pin the sine fit to that frequency).
  function computeSinusoidalFit(xs, ys, forcedOmega) {
    if (xs.length < 4) return null;
    const sampled = sampleFitSeries(xs, ys);
    const tx = sampled.xs;
    const ty = sampled.ys;
    const [xMin, xMax] = arrayMinMax(tx);
    const span = xMax - xMin;
    if (!(span > 0)) return null;
    const xCenter = (xMin + xMax) / 2;
    const fitAtOmega = (omega) => {
      const sinCol = tx.map((x) => Math.sin(omega * (x - xCenter)));
      const cosCol = tx.map((x) => Math.cos(omega * (x - xCenter)));
      const ones = new Array(tx.length).fill(1);
      return fitLinearCombination([sinCol, cosCol, ones], ty);
    };
    let best = null;
    if (Number.isFinite(forcedOmega) && forcedOmega > 0) {
      const reg = fitAtOmega(forcedOmega);
      if (reg) best = { omega: forcedOmega, reg };
    } else {
      const range = getSinusoidalOmegaRange(tx, span);
      if (!range) return null;
      const { omegaMin, omegaMax } = range;
      // Coarse log-spaced scan across the whole range (pure least-squares SSE per omega,
      // no other constraints) followed by a few narrowing linear passes to home in on the
      // exact frequency -- important for a clean, low-noise sinusoid where the true minimum
      // can sit between two coarse samples.
      const scan = (lo, hi, steps, spacing) => {
        let localBest = null;
        for (let i = 0; i < steps; i++) {
          const frac = steps === 1 ? 0 : i / (steps - 1);
          const omega = spacing === 'log' ? lo * Math.pow(hi / lo, frac) : lo + (hi - lo) * frac;
          const reg = fitAtOmega(omega);
          if (!reg) continue;
          if (!localBest || reg.sse < localBest.reg.sse) localBest = { omega, reg };
        }
        return localBest;
      };
      const coarseSteps = 600;
      best = scan(omegaMin, omegaMax, coarseSteps, 'log');
      if (best) {
        let halfWidth = (best.omega * (Math.pow(omegaMax / omegaMin, 1 / (coarseSteps - 1)) - 1)) || (omegaMax - omegaMin) / coarseSteps;
        for (let pass = 0; pass < 5; pass++) {
          const lo = Math.max(omegaMin, best.omega - halfWidth);
          const hi = Math.min(omegaMax, best.omega + halfWidth);
          const refined = scan(lo, hi, 120, 'linear');
          if (refined && refined.reg.sse < best.reg.sse) best = refined;
          halfWidth = Math.max(halfWidth / 8, 1e-9);
        }
      }
    }
    if (!best) return null;
    const b = best.reg.coeffs[0];
    const c = best.reg.coeffs[1];
    const offset = best.reg.coeffs[2];
    const A = Math.hypot(b, c);
    const phi = Math.atan2(c, b);
    const predict = (x) => A * Math.sin(best.omega * (x - xCenter) + phi) + offset;
    const preds = tx.map((x) => predict(x));
    const r2 = computeR2(ty, preds);
    return { A, omega: best.omega, phi, offset, r2, predict };
  }

  // Damped/growing sine: y = A * exp(tau*(x - xCenter)) * sin(omega*x + phi) + offset.
  // The model is nonlinear in omega and tau, but linear in (b, c, offset) once both are
  // fixed -- same trick as the plain sinusoidal/exponential fits above -- so this jointly
  // grid-searches omega and tau and solves a 3-feature linear regression at each
  // combination, then narrows around the best point the same way computeSinusoidalFit
  // refines omega. Without that refinement, a slightly-off (coarse-grid) omega leaves a
  // slow phase drift across the window that a nonzero tau can partially explain away as
  // decay/growth -- so a pure, undamped sine could misreport a spurious tau.
  function computeSineExpFit(xs, ys, forcedOmega) {
    if (xs.length < 5) return null;
    const sampled = sampleFitSeries(xs, ys, 2000);
    const tx = sampled.xs;
    const ty = sampled.ys;
    const [xMin, xMax] = arrayMinMax(tx);
    const span = xMax - xMin;
    if (!(span > 0)) return null;
    const xScale = span;
    let sumX = 0;
    for (let i = 0; i < tx.length; i++) sumX += tx[i];
    const xCenter = sumX / tx.length;
    const tNorm = tx.map((x) => (x - xCenter) / xScale);
    const TAU_NORM_MIN = -8, TAU_NORM_MAX = 8;

    const fitAt = (omega, tauNorm) => {
      const sinCol = new Array(tx.length);
      const cosCol = new Array(tx.length);
      for (let i = 0; i < tx.length; i++) {
        const envelope = Math.exp(Math.max(-60, Math.min(60, tauNorm * tNorm[i])));
        const dx = tx[i] - xCenter;
        sinCol[i] = Math.sin(omega * dx) * envelope;
        cosCol[i] = Math.cos(omega * dx) * envelope;
      }
      const ones = new Array(tx.length).fill(1);
      return fitLinearCombination([sinCol, cosCol, ones], ty);
    };

    // Scans a 2D (omega x tauNorm) grid for the lowest-SSE combination.
    const scan2D = (omegaLo, omegaHi, omegaSteps, omegaSpacing, tauLo, tauHi, tauSteps) => {
      let localBest = null;
      for (let i = 0; i < omegaSteps; i++) {
        const ofrac = omegaSteps === 1 ? 0 : i / (omegaSteps - 1);
        const omega = omegaSpacing === 'log' ? omegaLo * Math.pow(omegaHi / omegaLo, ofrac) : omegaLo + (omegaHi - omegaLo) * ofrac;
        for (let j = 0; j < tauSteps; j++) {
          const tfrac = tauSteps === 1 ? 0 : j / (tauSteps - 1);
          const tauNorm = tauLo + (tauHi - tauLo) * tfrac;
          const reg = fitAt(omega, tauNorm);
          if (!reg) continue;
          if (!localBest || reg.sse < localBest.reg.sse) localBest = { omega, tauNorm, reg };
        }
      }
      return localBest;
    };

    let best = null;
    if (Number.isFinite(forcedOmega) && forcedOmega > 0) {
      // omega is pinned (e.g. from an FFT-panel click) -- only tau needs refining.
      best = scan2D(forcedOmega, forcedOmega, 1, 'linear', TAU_NORM_MIN, TAU_NORM_MAX, 25);
      if (best) {
        let tauHalfWidth = (TAU_NORM_MAX - TAU_NORM_MIN) / 24;
        for (let pass = 0; pass < 5; pass++) {
          const tLo = Math.max(TAU_NORM_MIN, best.tauNorm - tauHalfWidth);
          const tHi = Math.min(TAU_NORM_MAX, best.tauNorm + tauHalfWidth);
          const refined = scan2D(forcedOmega, forcedOmega, 1, 'linear', tLo, tHi, 25);
          if (refined && refined.reg.sse < best.reg.sse) best = refined;
          tauHalfWidth = Math.max(tauHalfWidth / 8, 1e-6);
        }
      }
    } else {
      const range = getSinusoidalOmegaRange(tx, span);
      if (!range) return null;
      const { omegaMin, omegaMax } = range;
      const coarseOmegaSteps = 90, coarseTauSteps = 21;
      best = scan2D(omegaMin, omegaMax, coarseOmegaSteps, 'log', TAU_NORM_MIN, TAU_NORM_MAX, coarseTauSteps);
      if (best) {
        let omegaHalfWidth = best.omega * (Math.pow(omegaMax / omegaMin, 1 / (coarseOmegaSteps - 1)) - 1) || (omegaMax - omegaMin) / coarseOmegaSteps;
        let tauHalfWidth = (TAU_NORM_MAX - TAU_NORM_MIN) / (coarseTauSteps - 1);
        for (let pass = 0; pass < 4; pass++) {
          const oLo = Math.max(omegaMin, best.omega - omegaHalfWidth);
          const oHi = Math.min(omegaMax, best.omega + omegaHalfWidth);
          const tLo = Math.max(TAU_NORM_MIN, best.tauNorm - tauHalfWidth);
          const tHi = Math.min(TAU_NORM_MAX, best.tauNorm + tauHalfWidth);
          const refined = scan2D(oLo, oHi, 21, 'linear', tLo, tHi, 11);
          if (refined && refined.reg.sse < best.reg.sse) best = refined;
          omegaHalfWidth = Math.max(omegaHalfWidth / 8, 1e-9);
          tauHalfWidth = Math.max(tauHalfWidth / 4, 1e-6);
        }
      }
    }
    if (!best) return null;
    const b = best.reg.coeffs[0];
    const c = best.reg.coeffs[1];
    const offset = best.reg.coeffs[2];
    const A = Math.hypot(b, c);
    const phi = Math.atan2(c, b);
    const tau = best.tauNorm / xScale;
    const predict = (x) => A * Math.exp(Math.max(-60, Math.min(60, tau * (x - xCenter)))) * Math.sin(best.omega * (x - xCenter) + phi) + offset;
    const preds = tx.map((x) => predict(x));
    const r2 = computeR2(ty, preds);
    return { A, omega: best.omega, phi, tau, offset, r2, predict };
  }

  // Oscillating fits (sinusoidal, sine×exponential) are drawn with a fixed 80-point path
  // by default, which looks choppy once the fitted frequency packs many cycles into the
  // selection -- so the point count scales up to guarantee at least ~10 points per cycle.
  function oscillatingFitPointCount(omega, xMin, xMax) {
    const span = xMax - xMin;
    const cycles = Math.abs(omega) * span / (2 * Math.PI);
    return Math.max(80, Math.ceil(cycles * 10) + 1);
  }

  // Computes a magnitude spectrum for a (possibly unevenly sampled) selection: resamples
  // onto a uniform grid (median spacing of the sorted x's), removes the mean/DC term,
  // applies a Hann window to reduce spectral leakage, then runs a direct DFT. A plain
  // O(n^2) DFT (rather than a radix-2 FFT) keeps the implementation simple and is fine
  // at the point counts a plot selection realistically produces (capped at 2048 here).
  function computeFft(xs, ys) {
    const n = xs.length;
    if (n < 8) return null;
    const order = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
    const sx = order.map((i) => xs[i]);
    const sy = order.map((i) => ys[i]);
    const diffs = [];
    for (let i = 1; i < sx.length; i++) {
      const d = sx[i] - sx[i - 1];
      if (d > 0) diffs.push(d);
    }
    if (diffs.length === 0) return null;
    diffs.sort((a, b) => a - b);
    const dt = diffs[Math.floor(diffs.length / 2)];
    if (!(dt > 0)) return null;
    const span = sx[sx.length - 1] - sx[0];
    const maxN = 2048;
    let count = Math.min(maxN, Math.max(8, Math.floor(span / dt) + 1));
    // Uniform resample via linear interpolation over the sorted, possibly-irregular samples.
    const rt = new Array(count);
    const ry = new Array(count);
    let srcIdx = 0;
    for (let i = 0; i < count; i++) {
      const t = sx[0] + (i * span) / (count - 1);
      while (srcIdx < sx.length - 2 && sx[srcIdx + 1] < t) srcIdx++;
      const x0 = sx[srcIdx], x1 = sx[srcIdx + 1];
      const y0 = sy[srcIdx], y1 = sy[srcIdx + 1];
      const frac = x1 > x0 ? (t - x0) / (x1 - x0) : 0;
      rt[i] = t;
      ry[i] = y0 + (y1 - y0) * frac;
    }
    const sampleDt = span / (count - 1);
    let mean = 0;
    for (let i = 0; i < count; i++) mean += ry[i];
    mean /= count;
    const windowed = new Array(count);
    for (let i = 0; i < count; i++) {
      const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (count - 1));
      windowed[i] = (ry[i] - mean) * hann;
    }
    // Do not expose frequencies that the fitted curve would render from fewer than
    // ten samples per period; those are high-frequency noise candidates, not reliable
    // smooth sine fits.
    const half = Math.min(Math.floor(count / 2), Math.floor(count / 10));
    if (half < 1) return null;
    const freqs = new Array(half);
    const mags = new Array(half);
    for (let k = 1; k <= half; k++) {
      let re = 0, im = 0;
      const w = (2 * Math.PI * k) / count;
      for (let i = 0; i < count; i++) {
        const angle = w * i;
        re += windowed[i] * Math.cos(angle);
        im -= windowed[i] * Math.sin(angle);
      }
      freqs[k - 1] = k / (count * sampleDt);
      mags[k - 1] = (2 / count) * Math.hypot(re, im);
    }
    return { freqs, mags };
  }

  function computeExponentialFit(xs, ys) {
    if (xs.length < 3) return null;
    const sampled = sampleFitSeries(xs, ys);
    const tx = sampled.xs;
    const ty = sampled.ys;
    const [xMin, xMax] = arrayMinMax(tx);
    const xSpan = xMax - xMin;
    const xScale = xSpan > 0 ? xSpan : 1;
    let sumX = 0;
    for (let i = 0; i < tx.length; i++) sumX += tx[i];
    const xCenter = sumX / tx.length;
    const tNorm = tx.map((x) => (x - xCenter) / xScale);
    let best = null;
    const steps = 120;
    for (let i = 0; i < steps; i++) {
      const tauNorm = -8 + (16 * i) / (steps - 1);
      const uCol = tNorm.map((t) => Math.exp(Math.max(-60, Math.min(60, tauNorm * t))));
      const ones = new Array(tx.length).fill(1);
      const reg = fitLinearCombination([uCol, ones], ty);
      if (!reg) continue;
      if (!best || reg.sse < best.sse) best = { tauNorm, reg };
    }
    if (!best) return null;
    const AScaled = best.reg.coeffs[0];
    const offset = best.reg.coeffs[1];
    const tau = best.tauNorm / xScale;
    const predict = (x) => AScaled * Math.exp(Math.max(-60, Math.min(60, best.tauNorm * ((x - xCenter) / xScale)))) + offset;
    const preds = tx.map((x) => predict(x));
    const r2 = computeR2(ty, preds);
    const amplitude = AScaled * Math.exp(Math.max(-60, Math.min(60, -tau * xCenter)));
    return { A: amplitude, tau, offset, r2, predict };
  }

  // First-order step response: y = A * (1 - exp(-(x - x0) / tau)) + offset. x0 is fixed to
  // the start of the selection (the usual case: the user selects the region starting at
  // the step event) so only tau is nonlinear; A and offset are a 2-feature linear
  // regression once tau is fixed, same coarse-then-refine log search as the other fits.
  function computeFirstOrderResponseFit(xs, ys) {
    if (xs.length < 3) return null;
    const sampled = sampleFitSeries(xs, ys);
    const tx = sampled.xs;
    const ty = sampled.ys;
    const [xMin, xMax] = arrayMinMax(tx);
    const span = xMax - xMin;
    if (!(span > 0)) return null;
    const x0 = xMin;
    const range = getSinusoidalOmegaRange(tx, span);
    if (!range) return null;
    // Reuse the angular-frequency range's bounds as a time-constant range (its reciprocal
    // covers "responds within a fraction of a sample" through "barely settles over 20x the
    // selection span"), which is the same kind of span the exponential fit searches.
    const tauMin = 1 / range.omegaMax;
    const tauMax = 1 / range.omegaMin;
    const fitAtTau = (tau) => {
      const uCol = tx.map((x) => 1 - Math.exp(Math.max(-60, -(x - x0) / tau)));
      const ones = new Array(tx.length).fill(1);
      return fitLinearCombination([uCol, ones], ty);
    };
    const scan = (lo, hi, steps) => {
      let localBest = null;
      for (let i = 0; i < steps; i++) {
        const frac = steps === 1 ? 0 : i / (steps - 1);
        const tau = lo * Math.pow(hi / lo, frac);
        const reg = fitAtTau(tau);
        if (!reg) continue;
        if (!localBest || reg.sse < localBest.reg.sse) localBest = { tau, reg };
      }
      return localBest;
    };
    const coarseSteps = 300;
    let best = scan(tauMin, tauMax, coarseSteps);
    if (best) {
      let ratio = Math.pow(tauMax / tauMin, 1 / (coarseSteps - 1));
      for (let pass = 0; pass < 5; pass++) {
        const lo = Math.max(tauMin, best.tau / ratio);
        const hi = Math.min(tauMax, best.tau * ratio);
        const refined = scan(lo, hi, 120);
        if (refined && refined.reg.sse < best.reg.sse) best = refined;
        ratio = Math.max(Math.pow(ratio, 1 / 8), 1 + 1e-9);
      }
    }
    if (!best) return null;
    const A = best.reg.coeffs[0];
    const offset = best.reg.coeffs[1];
    const tau = best.tau;
    const predict = (x) => offset + A * (1 - Math.exp(Math.max(-60, -(x - x0) / tau)));
    const preds = tx.map((x) => predict(x));
    const r2 = computeR2(ty, preds);
    return { A, tau, offset, x0, r2, predict };
  }

  // Envelope term shared by underdamped/critically-damped/overdamped 2nd-order step
  // response: exp(-zeta*wn*dt) * (cos/cosh(wd*dt) + (zeta*wn/wd)*sin/sinh(wd*dt)), with
  // wd = wn*sqrt(|1-zeta^2|). The overdamped branch is written as a sum of two decaying
  // exponentials (rather than exp(-zeta*wn*dt)*cosh(wd*dt) directly) because cosh/sinh of
  // a large argument overflows before being multiplied back down by the decaying prefactor.
  function secondOrderResponseEnvelope(dt, zeta, wn) {
    const disc = 1 - zeta * zeta;
    if (Math.abs(disc) < 1e-8) {
      return Math.exp(Math.max(-60, -zeta * wn * dt)) * (1 + zeta * wn * dt);
    }
    if (disc > 0) {
      const wd = wn * Math.sqrt(disc);
      const decay = Math.exp(Math.max(-60, -zeta * wn * dt));
      return decay * (Math.cos(wd * dt) + (zeta * wn / wd) * Math.sin(wd * dt));
    }
    const wd = wn * Math.sqrt(-disc);
    const r1 = zeta * wn - wd; // both roots are non-negative for zeta > 1
    const r2 = zeta * wn + wd;
    const e1 = Math.exp(Math.max(-60, -r1 * dt));
    const e2 = Math.exp(Math.max(-60, -r2 * dt));
    return 0.5 * (e1 + e2) + (zeta * wn / wd) * 0.5 * (e1 - e2);
  }

  // Second-order step response: y = A * (1 - envelope(x - x0; zeta, wn)) + offset, x0 fixed
  // to the selection start. Nonlinear in (zeta, wn) but linear in (A, offset) once both are
  // fixed, so this jointly grid-searches zeta (damping ratio) and wn (natural frequency)
  // the same coarse-then-refine way computeSineExpFit searches omega and tau.
  function computeSecondOrderResponseFit(xs, ys) {
    if (xs.length < 5) return null;
    const sampled = sampleFitSeries(xs, ys, 2000);
    const tx = sampled.xs;
    const ty = sampled.ys;
    const [xMin, xMax] = arrayMinMax(tx);
    const span = xMax - xMin;
    if (!(span > 0)) return null;
    const x0 = xMin;
    const range = getSinusoidalOmegaRange(tx, span);
    if (!range) return null;
    const { omegaMin: wnMin, omegaMax: wnMax } = range;
    const ZETA_MIN = 0.02, ZETA_MAX = 5;

    const fitAt = (zeta, wn) => {
      const uCol = tx.map((x) => 1 - secondOrderResponseEnvelope(x - x0, zeta, wn));
      const ones = new Array(tx.length).fill(1);
      return fitLinearCombination([uCol, ones], ty);
    };

    const scan2D = (wnLo, wnHi, wnSteps, zetaLo, zetaHi, zetaSteps) => {
      let localBest = null;
      for (let i = 0; i < wnSteps; i++) {
        const wfrac = wnSteps === 1 ? 0 : i / (wnSteps - 1);
        const wn = wnLo * Math.pow(wnHi / wnLo, wfrac);
        for (let j = 0; j < zetaSteps; j++) {
          const zfrac = zetaSteps === 1 ? 0 : j / (zetaSteps - 1);
          const zeta = zetaLo * Math.pow(zetaHi / zetaLo, zfrac);
          const reg = fitAt(zeta, wn);
          if (!reg) continue;
          if (!localBest || reg.sse < localBest.reg.sse) localBest = { zeta, wn, reg };
        }
      }
      return localBest;
    };

    const coarseWnSteps = 90, coarseZetaSteps = 40;
    let best = scan2D(wnMin, wnMax, coarseWnSteps, ZETA_MIN, ZETA_MAX, coarseZetaSteps);
    if (best) {
      let wnRatio = Math.pow(wnMax / wnMin, 1 / (coarseWnSteps - 1));
      let zetaRatio = Math.pow(ZETA_MAX / ZETA_MIN, 1 / (coarseZetaSteps - 1));
      for (let pass = 0; pass < 4; pass++) {
        const wnLo = Math.max(wnMin, best.wn / wnRatio);
        const wnHi = Math.min(wnMax, best.wn * wnRatio);
        const zetaLo = Math.max(ZETA_MIN, best.zeta / zetaRatio);
        const zetaHi = Math.min(ZETA_MAX, best.zeta * zetaRatio);
        const refined = scan2D(wnLo, wnHi, 21, zetaLo, zetaHi, 15);
        if (refined && refined.reg.sse < best.reg.sse) best = refined;
        wnRatio = Math.max(Math.pow(wnRatio, 1 / 6), 1 + 1e-9);
        zetaRatio = Math.max(Math.pow(zetaRatio, 1 / 4), 1 + 1e-9);
      }
    }
    if (!best) return null;
    const A = best.reg.coeffs[0];
    const offset = best.reg.coeffs[1];
    const { zeta, wn } = best;
    const predict = (x) => offset + A * (1 - secondOrderResponseEnvelope(x - x0, zeta, wn));
    const preds = tx.map((x) => predict(x));
    const r2 = computeR2(ty, preds);
    const wd = wn * Math.sqrt(Math.abs(1 - zeta * zeta));
    return { A, zeta, wn, wd, offset, x0, r2, predict };
  }

  function computeEllipseFit(xs, ys) {
    if (xs.length < 5) return null;
    const sampled = sampleFitSeries(xs, ys);
    const tx = sampled.xs;
    const ty = sampled.ys;
    const n = tx.length;
    let cx = 0, cy = 0;
    for (let i = 0; i < n; i++) { cx += tx[i]; cy += ty[i]; }
    cx /= n; cy /= n;
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = tx[i] - cx;
      const dy = ty[i] - cy;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    sxx /= n; syy /= n; sxy /= n;
    const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const ux = Math.cos(angle), uy = Math.sin(angle);
    const vx = -uy, vy = ux;
    let uMin = Infinity, uMax = -Infinity, vMin = Infinity, vMax = -Infinity;
    for (let i = 0; i < n; i++) {
      const dx = tx[i] - cx;
      const dy = ty[i] - cy;
      const u = dx * ux + dy * uy;
      const v = dx * vx + dy * vy;
      if (u < uMin) uMin = u;
      if (u > uMax) uMax = u;
      if (v < vMin) vMin = v;
      if (v > vMax) vMax = v;
    }
    const a = (uMax - uMin) / 2;
    const b = (vMax - vMin) / 2;
    if (!(a > 0) || !(b > 0)) return null;
    const uMid = (uMin + uMax) / 2;
    const vMid = (vMin + vMax) / 2;
    const centerX = cx + uMid * ux + vMid * vx;
    const centerY = cy + uMid * uy + vMid * vy;
    return { centerX, centerY, a, b, angle };
  }

  // mathScopeKeys/mathScopeVals (e.g. ['sin','cos',...] / [Math.sin,Math.cos,...]) are
  // passed in by the caller rather than owned here, since the same math scope is also
  // used by app.js for math channels and data-filter expressions -- one source of truth.
  function compileTypedFitFormula(expression, mathScopeKeys) {
    const source = String(expression || '').trim();
    if (!source) return { error: 'Formula is required.', fn: null, paramNames: [] };
    const paramIdx = [];
    source.replace(/\bp(\d+)\b/g, (_, num) => { paramIdx.push(Number(num)); return _; });
    const maxIdx = paramIdx.length ? Math.max(...paramIdx) : -1;
    if (maxIdx > 11) return { error: 'Use parameters p0 through p11 only.', fn: null, paramNames: [] };
    const paramNames = maxIdx >= 0 ? Array.from({ length: maxIdx + 1 }, (_, i) => `p${i}`) : [];
    let fn;
    try {
      fn = new Function('t', 'x', ...paramNames, ...(mathScopeKeys || []), `"use strict"; return (${source});`);
    } catch (e) {
      return { error: `Formula syntax error: ${e.message}`, fn: null, paramNames: [] };
    }
    return { error: null, fn, paramNames };
  }

  function computeTypedFormulaFit(xs, ys, expression, mathScopeKeys, mathScopeVals) {
    if (xs.length < 2) return { fit: null, error: null };
    const compiled = compileTypedFitFormula(expression, mathScopeKeys);
    if (compiled.error) return { fit: null, error: compiled.error };
    const scopeVals = mathScopeVals || [];
    const sampled = sampleFitSeries(xs, ys, 2500);
    const tx = sampled.xs;
    const ty = sampled.ys;
    const [xMin, xMax] = arrayMinMax(tx);
    const span = Math.max(1e-9, xMax - xMin);
    let meanY = 0, yMin = Infinity, yMax = -Infinity;
    for (let i = 0; i < ty.length; i++) {
      meanY += ty[i];
      if (ty[i] < yMin) yMin = ty[i];
      if (ty[i] > yMax) yMax = ty[i];
    }
    meanY /= ty.length;
    const yScale = Math.max(1, Math.abs(yMax - yMin), Math.abs(meanY));
    // `new Function` only validates syntax -- a name that isn't t, x, p0-p11, or a math
    // function (e.g. a bare "A") throws a ReferenceError the first time it's actually
    // called. Probe that up front with a clear message instead of letting it escape from
    // inside the fit loop below and abort the whole selection-stats update.
    const initialParams = compiled.paramNames.map((_, i) => (i === 0 ? meanY : 0));
    try {
      compiled.fn(tx[0], tx[0], ...initialParams, ...scopeVals);
    } catch (e) {
      return { fit: null, error: `Formula error: ${e.message}` };
    }
    const evalPoint = (x, params) => {
      const args = [x, x].concat(params).concat(scopeVals);
      let v;
      try {
        v = compiled.fn(...args);
      } catch {
        return NaN;
      }
      return Number.isFinite(v) ? v : NaN;
    };
    let params = compiled.paramNames.map((_, i) => (i === 0 ? meanY : 0));
    let steps = compiled.paramNames.map((_, i) => (i === 0 ? yScale * 0.5 : Math.max(0.05, 1 / span)));
    const calcSse = (candidate) => {
      let sse = 0;
      for (let i = 0; i < tx.length; i++) {
        const p = evalPoint(tx[i], candidate);
        if (!Number.isFinite(p)) return Infinity;
        const err = ty[i] - p;
        sse += err * err;
      }
      return sse;
    };
    if (compiled.paramNames.length > 0) {
      let bestSse = calcSse(params);
      for (let iter = 0; iter < 80; iter++) {
        let improved = false;
        for (let pIdx = 0; pIdx < params.length; pIdx++) {
          const step = steps[pIdx];
          if (!(step > 1e-6)) continue;
          let trial = params.slice();
          trial[pIdx] += step;
          let ssePlus = calcSse(trial);
          trial[pIdx] = params[pIdx] - step;
          let sseMinus = calcSse(trial);
          if (ssePlus < bestSse || sseMinus < bestSse) {
            if (ssePlus <= sseMinus) {
              params[pIdx] += step;
              bestSse = ssePlus;
            } else {
              params[pIdx] -= step;
              bestSse = sseMinus;
            }
            improved = true;
          }
        }
        if (!improved) steps = steps.map((v) => v * 0.6);
        if (steps.every((v) => v < 1e-6)) break;
      }
    }
    const preds = tx.map((x) => evalPoint(x, params));
    if (preds.some((v) => !Number.isFinite(v))) return { fit: null, error: 'Formula produced invalid values.' };
    const predict = (x) => evalPoint(x, params);
    const r2 = computeR2(ty, preds);
    return { fit: { expression: String(expression || '').trim(), paramNames: compiled.paramNames, params, r2, predict }, error: null };
  }

  window.FitFunctions = {
    arrayMinMax,
    computeLinearFit,
    computeR2,
    sampleFitSeries,
    solveLinearSystem,
    fitLinearCombination,
    getSinusoidalOmegaRange,
    computeSinusoidalFit,
    computeSineExpFit,
    oscillatingFitPointCount,
    computeFft,
    computeExponentialFit,
    computeFirstOrderResponseFit,
    secondOrderResponseEnvelope,
    computeSecondOrderResponseFit,
    computeEllipseFit,
    compileTypedFitFormula,
    computeTypedFormulaFit
  };
})();
