(function () {
  'use strict';

  // =======================================================================
  // Module overview
  // =======================================================================
  // This module fits a single closed-loop (periodic) quintic B-spline to a
  // lap of logged (x, y) position data. It is a two-stage pipeline:
  //
  //   Stage 1 (fitPeriodicPositionLSQ): an ordinary least-squares fit of the
  //   spline to the raw logged points, ignoring curvature entirely. This
  //   gives a "reference" curve -- already reasonably close to the data,
  //   but with no explicit smoothness guarantee on its curvature.
  //
  //   Stage 2 (solveQuinticCurvatureQP): a quadratic program over the same
  //   control points that minimizes
  //     J = alpha * integral( kappa'(s)^2 ) ds  +  beta * sum( |T(s_i) - data_i|^2 )
  //   i.e. a weighted blend of "smooth curvature change" (alpha) and
  //   "stay close to the logged data" (beta). Because curvature is a
  //   nonlinear (ratio) function of the control points, it is linearized
  //   around the Stage 1 reference curve -- the same technique used by
  //   Xue, Yue & Dolan, "Spline-Based Minimum-Curvature Trajectory
  //   Optimization for Autonomous Racing" (2023): the curve's first
  //   derivatives (the denominator of the curvature ratio) are frozen at
  //   their Stage-1 reference values, while the second derivatives (which
  //   are *linear* in the control points) remain live decision variables.
  //   This turns the otherwise-nonlinear curvature objective into a genuine
  //   quadratic form solvable by a single dense linear solve -- no
  //   iterative QP solver (e.g. OSQP) is required, because the problem as
  //   specified has no inequality constraints (no track-width bounds), so
  //   minimizing an unconstrained quadratic reduces to solving H*z = -g
  //   directly (the same closed-form point any iterative QP solver would
  //   converge to for this unconstrained case).
  //
  // The spline itself is degree 5 (quintic), giving C4 continuity -- i.e.
  // curvature itself is guaranteed continuous, and this pipeline further
  // asks the *rate of change* of curvature to be smooth, which is what
  // gives the fitted path a natural, vehicle-like feel instead of jagged
  // steering transitions.
  //
  // Control points are seeded at uniform arc-length spacing (curvature-aware seeding --
  // denser in corners, sparser on straights -- was tried and reverted: the extra
  // control-point freedom it added in corners let the fit track more of the logged
  // data's noise there, which made the result visibly less smooth than uniform spacing).
  //
  // One more piece sits around the core QP: a soft per-corner max-curvature cap (inside
  // solveQuinticCurvatureQP), an additional penalty term active only where the current
  // fit curves more sharply than the logged data's own local peak (a rolling max of a
  // robust, baseline-distance curvature estimate -- see buildCurvatureProfile), pulling
  // violating samples down via a sum-of-squared-violations penalty (not a true minimax --
  // that would need inequality constraints and a real QP solver). This does NOT minimize
  // the lap's overall curvature (a genuinely different, lap-time-oriented objective
  // requiring track-width constraints) -- it only discourages the fit from being sharper
  // than the data it's smoothing. There's also an optional per-corner gamma weight
  // (see the cornerOverrides mechanism below) that *does* directly minimize curvature,
  // but only within whichever corner the user has explicitly dialed it up for.
  // =======================================================================

  function normalizeFitWeight(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  function curvatureFromDerivatives(first, second) {
    const speedSq = first.x * first.x + first.y * first.y;
    if (!(speedSq > 1e-12)) return null;
    const cross = Math.abs(first.x * second.y - first.y * second.x);
    const curvature = cross / Math.pow(speedSq, 1.5);
    return Number.isFinite(curvature) ? curvature : null;
  }

  function radiusFromCurvature(curvature) {
    if (!(Number.isFinite(curvature) && Math.abs(curvature) > 1e-9)) return null;
    const radius = 1 / Math.abs(curvature);
    return Number.isFinite(radius) ? radius : null;
  }

  // ---------------------------------------------------------------------
  // General (non-uniform, arbitrary-degree) B-spline core: de Boor
  // evaluation and basis functions, plus the recursive derivative-control-
  // point construction (Piegl & Tiller). Degree-agnostic -- used here at
  // degree 5, but makes no assumption about degree anywhere.
  // ---------------------------------------------------------------------

  function findKnotSpan(t, degree, knots, numPoints) {
    const n = numPoints - 1;
    if (t >= knots[n + 1]) return n;
    if (t <= knots[degree]) return degree;
    let low = degree;
    let high = n + 1;
    let mid = Math.floor((low + high) / 2);
    while (t < knots[mid] || t >= knots[mid + 1]) {
      if (t < knots[mid]) high = mid; else low = mid;
      mid = Math.floor((low + high) / 2);
    }
    return mid;
  }

  function evalBSplineDeBoor(points, knots, degree, t) {
    const numPoints = points.length;
    const tc = Math.max(knots[degree], Math.min(knots[numPoints], t));
    const span = findKnotSpan(tc, degree, knots, numPoints);
    const d = [];
    for (let j = 0; j <= degree; j++) {
      d[j] = { x: points[span - degree + j].x, y: points[span - degree + j].y };
    }
    for (let r = 1; r <= degree; r++) {
      for (let j = degree; j >= r; j--) {
        const i = span - degree + j;
        const denom = knots[i + degree - r + 1] - knots[i];
        const alpha = denom > 1e-12 ? (tc - knots[i]) / denom : 0;
        d[j] = {
          x: (1 - alpha) * d[j - 1].x + alpha * d[j].x,
          y: (1 - alpha) * d[j - 1].y + alpha * d[j].y
        };
      }
    }
    return { x: d[degree].x, y: d[degree].y };
  }

  function computeBSplineBasisFuns(t, degree, knots, numPoints) {
    const tc = Math.max(knots[degree], Math.min(knots[numPoints], t));
    const span = findKnotSpan(tc, degree, knots, numPoints);
    const N = new Array(degree + 1).fill(0);
    N[0] = 1;
    const left = new Array(degree + 1).fill(0);
    const right = new Array(degree + 1).fill(0);
    for (let j = 1; j <= degree; j++) {
      left[j] = tc - knots[span + 1 - j];
      right[j] = knots[span + j] - tc;
      let saved = 0;
      for (let r = 0; r < j; r++) {
        const denom = right[r + 1] + left[j - r];
        const temp = denom > 1e-12 ? N[r] / denom : 0;
        N[r] = saved + right[r + 1] * temp;
        saved = left[j - r] * temp;
      }
      N[j] = saved;
    }
    return { span, values: N };
  }

  function bsplineDerivativeControlPoints(points, knots, degree) {
    const n = points.length - 1;
    const derivPoints = [];
    for (let i = 0; i < n; i++) {
      const denom = knots[i + degree + 1] - knots[i + 1];
      const scale = denom > 1e-12 ? degree / denom : 0;
      derivPoints.push({
        x: (points[i + 1].x - points[i].x) * scale,
        y: (points[i + 1].y - points[i].y) * scale
      });
    }
    const derivKnots = knots.slice(1, knots.length - 1);
    return { points: derivPoints, knots: derivKnots, degree: degree - 1 };
  }

  function evalBSplineDerivatives(points, knots, degree, t) {
    if (degree < 1) return { first: { x: 0, y: 0 }, second: { x: 0, y: 0 } };
    const d1 = bsplineDerivativeControlPoints(points, knots, degree);
    const first = evalBSplineDeBoor(d1.points, d1.knots, d1.degree, t);
    let second = { x: 0, y: 0 };
    if (d1.degree >= 1) {
      const d2 = bsplineDerivativeControlPoints(d1.points, d1.knots, d1.degree);
      second = evalBSplineDeBoor(d2.points, d2.knots, d2.degree, t);
    }
    return { first, second };
  }

  function solveLinearSystem(matrix, rhs) {
    const n = matrix.length;
    const M = matrix.map((row) => row.slice());
    const b = rhs.slice();
    for (let col = 0; col < n; col++) {
      let pivot = col;
      let maxAbs = Math.abs(M[col][col]);
      for (let r = col + 1; r < n; r++) {
        if (Math.abs(M[r][col]) > maxAbs) {
          maxAbs = Math.abs(M[r][col]);
          pivot = r;
        }
      }
      if (maxAbs < 1e-12) continue;
      if (pivot !== col) {
        const tmpRow = M[col]; M[col] = M[pivot]; M[pivot] = tmpRow;
        const tmpB = b[col]; b[col] = b[pivot]; b[pivot] = tmpB;
      }
      const pivotVal = M[col][col];
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const factor = M[r][col] / pivotVal;
        if (factor === 0) continue;
        for (let c = col; c < n; c++) M[r][c] -= factor * M[col][c];
        b[r] -= factor * b[col];
      }
    }
    const x = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      x[i] = Math.abs(M[i][i]) > 1e-12 ? b[i] / M[i][i] : 0;
    }
    return x;
  }

  // ---------------------------------------------------------------------
  // Periodic (closed-loop) representation: an ordered ring of "entries",
  // each pairing a control point with the along-track knot span (distance,
  // i.e. arc length between consecutive knots) to the next entry. This is
  // the non-uniform, arc-length-based knot vector the spline is built on.
  // Extending it into the flat {points, knots, degree} form the de Boor
  // evaluator above expects just wraps `degree` entries past each end of
  // one period.
  // ---------------------------------------------------------------------

  const SPLINE_DEGREE = 5; // quintic: C4 continuous, so curvature itself is always continuous
  const WHOLE_CIRCUIT_TARGET_SPACING_M = 20;
  const WHOLE_CIRCUIT_MIN_CONTROL_POINTS = 24;
  const WHOLE_CIRCUIT_MAX_CONTROL_POINTS = 220;
  const WHOLE_CIRCUIT_ABSOLUTE_MIN_CONTROL_POINTS = 12; // must stay > SPLINE_DEGREE + 1
  const WHOLE_CIRCUIT_MIN_SPAN_M = 2;
  const QP_SAMPLE_MIN = 150;
  const QP_SAMPLE_MAX = 400;
  const QP_SAMPLE_SPACING_M = 8;

  function buildPeriodicRepFromEntries(entries, degree) {
    const S = entries.length;
    const primary = [0];
    for (let i = 0; i < S; i++) primary.push(primary[i] + entries[i].span);
    const period = primary[S];

    const knotValueAt = (i) => {
      let k = i;
      let offset = 0;
      while (k < 0) { k += S; offset -= period; }
      while (k > S) { k -= S; offset += period; }
      return primary[k] + offset;
    };

    const numPoints = S + degree;
    const points = [];
    for (let i = 0; i < numPoints; i++) points.push(entries[i % S].point);

    const numKnots = numPoints + degree + 1;
    const knots = [];
    for (let j = 0; j < numKnots; j++) knots.push(knotValueAt(j - degree));

    return { points, knots, degree, period, numControlPoints: S };
  }

  function periodicEntryDistances(entries) {
    const distances = [];
    let acc = 0;
    entries.forEach((entry) => {
      distances.push(acc);
      acc += entry.span;
    });
    return distances;
  }

  function evalPeriodicBSpline(rep, t) {
    const tc = ((t % rep.period) + rep.period) % rep.period;
    return evalBSplineDeBoor(rep.points, rep.knots, rep.degree, tc);
  }

  function evalPeriodicBSplineDerivatives(rep, t) {
    const tc = ((t % rep.period) + rep.period) % rep.period;
    return evalBSplineDerivatives(rep.points, rep.knots, rep.degree, tc);
  }

  function computePeriodicBSplineCurvatureAtT(rep, t) {
    const d = evalPeriodicBSplineDerivatives(rep, t);
    return curvatureFromDerivatives(d.first, d.second);
  }

  function computePeriodicBSplineRadiusAtT(rep, t) {
    return radiusFromCurvature(computePeriodicBSplineCurvatureAtT(rep, t));
  }

  function samplePeriodicBSpline(rep, sampleCount) {
    const count = Math.max(2, Number(sampleCount) || 200);
    const pts = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * rep.period;
      const p = evalPeriodicBSpline(rep, t);
      pts.push({ x: p.x, y: p.y, t: t / rep.period, dist: t });
    }
    return pts;
  }

  // Removes the control point at `indexToRemove`, merging its knot span into the
  // previous one.
  function removePeriodicControlPoint(entries, indexToRemove) {
    const S = entries.length;
    if (S <= WHOLE_CIRCUIT_ABSOLUTE_MIN_CONTROL_POINTS) return null;
    const idx = ((indexToRemove % S) + S) % S;
    const prevIdx = (idx - 1 + S) % S;
    const newEntries = entries.slice();
    newEntries[prevIdx] = { point: entries[prevIdx].point, span: entries[prevIdx].span + entries[idx].span };
    newEntries.splice(idx, 1);
    return newEntries;
  }

  function collectWholeLapMapPoints(log, lap, deps) {
    if (!log || !log.meta || !Array.isArray(log.meta.lapNum) || !Array.isArray(log.meta.lapRelDist)) return [];
    const mapSource = deps.getMapSourceForLog(log);
    if (!mapSource) return [];
    const points = [];
    for (let i = 0; i < log.meta.lapNum.length; i++) {
      if (log.meta.lapNum[i] !== lap) continue;
      const dist = Number(log.meta.lapRelDist[i]);
      if (!Number.isFinite(dist)) continue;
      const x = Number(mapSource.xAt(i));
      const y = Number(mapSource.yAt(i));
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      points.push({ x, y, dist, rowIndex: i });
    }
    if (points.length < 8) return [];
    points.sort((a, b) => a.dist - b.dist);
    const deduped = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const prev = deduped[deduped.length - 1];
      const curr = points[i];
      if (Math.hypot(curr.x - prev.x, curr.y - prev.y) <= 1e-6) continue;
      deduped.push(curr);
    }
    return deduped;
  }

  // ---------------------------------------------------------------------
  // Curvature profile of the raw logged data, used for two purposes:
  //   1. Curvature-aware initial control-point seeding (more points where the track
  //      curves sharply, fewer on straights).
  //   2. A soft per-corner max-curvature cap in the QP (see solveQuinticCurvatureQP)
  //      that discourages the fit from curving *more* sharply than the logged data
  //      ever did in that region.
  // Both reuse the same discrete curvature estimate and windowed-stat helpers below.
  // ---------------------------------------------------------------------

  const CURVATURE_ESTIMATE_BASELINE_M = 5; // chord length for the discrete curvature estimate itself
  const SEEDING_CURVATURE_SMOOTH_HALF_WINDOW_M = 15; // smoothing for the cap's reference profile
  const CURVATURE_CAP_WINDOW_M = 25; // ~corner-scale local-max window for the cap target
  const CURVATURE_CAP_TOLERANCE = 1.05; // allow 5% over the local data peak before penalizing
  const CURVATURE_CAP_PENALTY_STRENGTH = 2.0;

  // Shortest signed distance from a to b on a circle of the given period.
  function periodicDelta(a, b, period) {
    let d = (b - a) % period;
    if (d > period / 2) d -= period;
    if (d < -period / 2) d += period;
    return d;
  }

  // Discrete (Menger) curvature at every point, via 2*|cross(AB,BC)| / (|AB|*|BC|*|CA|)
  // for the circle through three points: the point itself, and neighbors roughly
  // `baselineM` away on each side (found by stepping outward in distance, same technique
  // as periodicWindowStat). Using a fixed *distance* baseline rather than the immediately
  // adjacent logged rows is essential for real (densely-logged, noisy) telemetry: a
  // three-point curvature estimate is a second finite difference, so its noise
  // sensitivity scales as (position noise / baseline length)^2 -- with adjacent rows
  // often well under a meter apart, even sub-meter GPS/logging noise completely swamps
  // the true curvature signal (verified: ~0.02 true curvature measured as ~1.2 with
  // adjacent-row spacing on synthetic noisy data). A several-meter baseline brings that
  // ratio back down to where the estimate actually reflects track geometry.
  function computeMengerCurvature(points, period, baselineM) {
    const n = points.length;
    const out = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let prevIdx = i;
      for (let step = 1; step < n; step++) {
        const j = (i - step + n) % n;
        prevIdx = j;
        if (Math.abs(periodicDelta(points[i].dist, points[j].dist, period)) >= baselineM) break;
      }
      let nextIdx = i;
      for (let step = 1; step < n; step++) {
        const j = (i + step) % n;
        nextIdx = j;
        if (Math.abs(periodicDelta(points[i].dist, points[j].dist, period)) >= baselineM) break;
      }
      const a = points[prevIdx];
      const b = points[i];
      const c = points[nextIdx];
      const abx = b.x - a.x, aby = b.y - a.y;
      const bcx = c.x - b.x, bcy = c.y - b.y;
      const cax = a.x - c.x, cay = a.y - c.y;
      const cross = abx * bcy - aby * bcx;
      const denom = Math.hypot(abx, aby) * Math.hypot(bcx, bcy) * Math.hypot(cax, cay);
      out[i] = denom > 1e-9 ? (2 * Math.abs(cross)) / denom : 0;
    }
    return out;
  }

  // Periodic windowed mean or max of `values` (parallel to `points`) over a physical
  // arc-length half-window, using the fact that `points` is already sorted by distance
  // so stepping outward in index order also steps outward in distance.
  function periodicWindowStat(points, values, period, halfWindowM, mode) {
    const n = points.length;
    const out = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let sum = 0, count = 0, maxVal = 0;
      for (let step = 0; step < n; step++) {
        const j = (i + step) % n;
        const delta = step === 0 ? 0 : periodicDelta(points[i].dist, points[j].dist, period);
        if (Math.abs(delta) > halfWindowM) break;
        sum += values[j]; count++;
        if (values[j] > maxVal) maxVal = values[j];
      }
      for (let step = 1; step < n; step++) {
        const j = (i - step + n) % n;
        const delta = periodicDelta(points[i].dist, points[j].dist, period);
        if (Math.abs(delta) > halfWindowM) break;
        sum += values[j]; count++;
        if (values[j] > maxVal) maxVal = values[j];
      }
      out[i] = mode === 'max' ? maxVal : (count > 0 ? sum / count : 0);
    }
    return out;
  }

  function buildCurvatureProfile(points, totalLapDistance) {
    const raw = computeMengerCurvature(points, totalLapDistance, CURVATURE_ESTIMATE_BASELINE_M);
    const smoothed = periodicWindowStat(points, raw, totalLapDistance, SEEDING_CURVATURE_SMOOTH_HALF_WINDOW_M, 'mean');
    const localMax = periodicWindowStat(points, smoothed, totalLapDistance, CURVATURE_CAP_WINDOW_M, 'max');
    return { smoothed, localMax };
  }

  // Linearly interpolates a per-point profile array (parallel to `points`) at an
  // arbitrary along-track distance, wrapping across the seam.
  function lookupProfileAtDistance(points, profile, targetDist, period) {
    const n = points.length;
    const tc = ((targetDist % period) + period) % period;
    if (tc <= points[0].dist) {
      const prevDist = points[n - 1].dist - period;
      const span = points[0].dist - prevDist;
      const frac = span > 1e-9 ? (tc - prevDist) / span : 0;
      return profile[n - 1] + frac * (profile[0] - profile[n - 1]);
    }
    if (tc >= points[n - 1].dist) {
      const nextDist = points[0].dist + period;
      const span = nextDist - points[n - 1].dist;
      const frac = span > 1e-9 ? (tc - points[n - 1].dist) / span : 0;
      return profile[n - 1] + frac * (profile[0] - profile[n - 1]);
    }
    let lo = 0, hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (points[mid].dist < tc) lo = mid + 1; else hi = mid;
    }
    const idx = lo;
    const prevIdx = idx - 1;
    const span = points[idx].dist - points[prevIdx].dist;
    const frac = span > 1e-9 ? (tc - points[prevIdx].dist) / span : 0;
    return profile[prevIdx] + frac * (profile[idx] - profile[prevIdx]);
  }

  // Builds periodic entries (control point + knot span) from non-uniform seed
  // distances, clamping any span that ended up implausibly short (extreme curvature
  // peaks pulling two seeds very close together).
  function buildPeriodicEntriesFromDistances(controlPoints, seedDistances, period) {
    const S = controlPoints.length;
    const entries = controlPoints.map((p, i) => {
      const next = seedDistances[(i + 1) % S];
      const cur = seedDistances[i];
      let span = next - cur;
      if (span <= 0) span += period;
      return { point: { x: p.x, y: p.y }, span };
    });
    for (let i = 0; i < S; i++) {
      if (entries[i].span < WHOLE_CIRCUIT_MIN_SPAN_M) {
        const deficit = WHOLE_CIRCUIT_MIN_SPAN_M - entries[i].span;
        entries[i].span = WHOLE_CIRCUIT_MIN_SPAN_M;
        const donor = (i - 1 + S) % S;
        entries[donor].span = Math.max(WHOLE_CIRCUIT_MIN_SPAN_M, entries[donor].span - deficit);
      }
    }
    // The clamp above can drift the total away from `period` (e.g. when a donor span was
    // already near the minimum and couldn't absorb the full deficit, so part of it was
    // effectively invented from nowhere). Renormalize so spans always sum back to exactly
    // the true lap distance -- otherwise the periodic wrap (keyed off this sum) silently
    // desyncs from the raw logged distances, and samples near the desync point land on the
    // wrong part of the track entirely.
    const sumSpans = entries.reduce((s, e) => s + e.span, 0);
    if (sumSpans > 1e-9 && Math.abs(sumSpans - period) > 1e-9) {
      const scale = period / sumSpans;
      entries.forEach((e) => { e.span *= scale; });
    }
    return entries;
  }

  // =======================================================================
  // Stage 1: plain position least-squares fit (no curvature term at all).
  // Produces the reference curve that Stage 2 linearizes around. This is
  // exactly the same normal-equations technique used throughout this
  // module: for every logged point, the (degree+1) nonzero basis function
  // values at that point's arc-length parameter contribute a weighted row
  // to the least-squares system; solved once via the dense linear solver.
  // =======================================================================

  function fitPeriodicPositionLSQ(entries, points, positionWeight) {
    const degree = SPLINE_DEGREE;
    const S = entries.length;
    const rep = buildPeriodicRepFromEntries(entries, degree);
    const w = positionWeight > 0 ? positionWeight : 1e-6;

    const M = Array.from({ length: S }, () => new Array(S).fill(0));
    const rhsX = new Array(S).fill(0);
    const rhsY = new Array(S).fill(0);

    points.forEach((pt) => {
      const tc = ((pt.dist % rep.period) + rep.period) % rep.period;
      const basis = computeBSplineBasisFuns(tc, degree, rep.knots, rep.points.length);
      for (let a = 0; a <= degree; a++) {
        const extA = basis.span - degree + a;
        const realA = ((extA % S) + S) % S;
        rhsX[realA] += w * basis.values[a] * pt.x;
        rhsY[realA] += w * basis.values[a] * pt.y;
        for (let b = 0; b <= degree; b++) {
          const extB = basis.span - degree + b;
          const realB = ((extB % S) + S) % S;
          M[realA][realB] += w * basis.values[a] * basis.values[b];
        }
      }
    });

    // Light ridge purely for numerical safety -- with real logged data far denser than
    // typical control-point spacing, this system is already well-conditioned on its own.
    let diagSum = 0;
    for (let a = 0; a < S; a++) diagSum += M[a][a];
    const ridge = Math.max(1e-6, (diagSum / Math.max(1, S)) * 0.01);
    for (let a = 0; a < S; a++) M[a][a] += ridge;

    const solvedX = solveLinearSystem(M, rhsX);
    const solvedY = solveLinearSystem(M, rhsY);

    return entries.map((entry, i) => ({ point: { x: solvedX[i], y: solvedY[i] }, span: entry.span }));
  }

  // =======================================================================
  // Stage 2: the curvature-smoothness QP.
  //
  // Curvature: kappa(t) = (x'y'' - y'x'') / (x'^2+y'^2)^1.5
  //
  // This is nonlinear in the control points (the denominator depends on
  // them too), so it isn't directly a quadratic objective. Following the
  // reference-linearization technique: freeze the first derivatives
  // (x', y') at their Stage-1 reference values -- call them x'_ref, y'_ref,
  // and D_ref = x'_ref^2 + y'_ref^2 -- and let only the second derivatives
  // (x'', y''), which are *linear* in the control points via the
  // second-derivative basis functions, remain live:
  //
  //   kappa(t) =~ w(t) * [ x'_ref(t)*y''(t) - y'_ref(t)*x''(t) ],  w(t) = 1/D_ref(t)^1.5
  //
  // This kappa(t) is now a linear functional of the (stacked x,y) control
  // point vector z. kappa'(s) (derivative with respect to *arc length*,
  // not the spline parameter) is approximated by a central finite
  // difference of this linearized kappa across neighboring samples,
  // converted from parameter-spacing to arc-length spacing via the
  // reference speed (ds/dt = |T'_ref(t)|). A finite difference of linear
  // functionals is itself linear, so kappa'(s) is linear in z too, and
  // squaring it (as the objective requires) gives a proper quadratic form:
  //
  //   integral( kappa'(s)^2 ) ds =~ sum_j  kappa'_j(z)^2 * ds_j
  //                              =  z^T [ sum_j ds_j * v_j v_j^T ] z
  //
  // where v_j is the (sparse) coefficient vector of kappa'_j as a linear
  // function of z. That quadratic form is exactly what gets accumulated
  // into the H matrix below, alongside the (already-quadratic) data-
  // fidelity term, and the whole unconstrained QP is solved by setting its
  // gradient to zero -- i.e. one dense linear solve, no iterative solver.
  // =======================================================================

  // Sparse second-derivative basis contribution at parameter t: returns the (at most
  // degree+1) real (periodic-wrapped) control point indices whose value affects x''(t)/
  // y''(t), and by how much (x''(t) = sum(values[k] * x[indices[k]]), same for y).
  // Computed via unit-impulse evaluation of the already-validated derivative machinery
  // above, rather than a hand-derived closed form -- keeps this in lockstep with
  // evalBSplineDerivatives by construction, at the cost of (degree+1) extra evaluations
  // per sample (cheap: degree is fixed at 5, so 6 unit evaluations per sample point).
  function secondDerivativeBasisAt(rep, tc) {
    const { knots, degree, points } = rep;
    const numPoints = points.length;
    const S = rep.numControlPoints;
    const span = findKnotSpan(tc, degree, knots, numPoints);
    const merged = new Map();
    for (let k = 0; k <= degree; k++) {
      const extIdx = span - degree + k;
      const unitPoints = points.map((p, i) => ({ x: (i === extIdx) ? 1 : 0, y: 0 }));
      const d = evalBSplineDerivatives(unitPoints, knots, degree, tc);
      const realIdx = ((extIdx % S) + S) % S;
      merged.set(realIdx, (merged.get(realIdx) || 0) + d.second.x);
    }
    return { indices: Array.from(merged.keys()), values: Array.from(merged.values()) };
  }

  // Resolves the effective LOCAL value of a weight ('alpha' | 'beta' | 'gamma') at
  // along-track position `dist`: the corresponding field of whichever corner override
  // (from fitWeights.cornerOverrides) contains that position, or `fallback` (the global
  // slider value, or 0 for gamma which has no global slider) outside any override.
  // Overrides are {startDist, endDist, alpha?, beta?, gamma?} in the same coordinate
  // frame as `points[i].dist`, wrapping periodically like everything else here.
  function resolveLocalWeight(dist, key, fallback, overrides, period) {
    if (!Array.isArray(overrides) || overrides.length === 0) return fallback;
    const tc = ((dist % period) + period) % period;
    for (let i = 0; i < overrides.length; i++) {
      const ov = overrides[i];
      if (!Number.isFinite(ov[key])) continue;
      const start = ((Number(ov.startDist) % period) + period) % period;
      const end = ((Number(ov.endDist) % period) + period) % period;
      const inRange = start <= end ? (tc >= start && tc <= end) : (tc >= start || tc <= end);
      if (inRange) return Number(ov[key]);
    }
    return fallback;
  }

  // Builds and solves the joint (2S-dimensional, z = [x_1..x_S, y_1..y_S]) QP described
  // above. `referenceRep` is the Stage-1 fit (or the previous iteration's result, see the
  // re-linearization loop in finishWholeCircuitFit), used to supply frozen first-
  // derivative values for the curvature linearization -- the actual decision variables
  // are the (fresh) control points being solved for, sharing the same knot structure.
  // `curvatureProfile` (from buildCurvatureProfile) is optional; when present it adds a
  // fourth soft penalty term discouraging the fit from curving more sharply, at any
  // point, than the logged data ever did nearby (see the cap section below).
  //
  // `weights.cornerOverrides`, if present, lets alpha/beta/gamma vary along the track
  // (e.g. a stronger "minimize curvature" gamma just within one corner being reviewed).
  // Every term below is therefore built in two parallel matrices: an *unweighted*
  // version (weight = 1, or for alpha/beta the notional "global value ignoring
  // overrides") used only to compute that term's auto-scale factor, and a *weighted*
  // version with the actual per-position value baked in, which is what's actually added
  // to the system. Keeping the auto-scale calibration on the unweighted matrix is
  // essential: if the local weight were baked in before computing its own auto-scale
  // factor, raising that weight would proportionally shrink its own auto-scale factor,
  // silently canceling out the change instead of applying it.
  function solveQuinticCurvatureQP(entries, points, referenceRep, weights, constants, curvatureProfile) {
    const degree = SPLINE_DEGREE;
    const S = entries.length;
    const N = 2 * S;
    const period = referenceRep.period;
    const globalAlpha = normalizeFitWeight(weights.alpha, constants.defaultWeights.alpha);
    const globalBetaRaw = normalizeFitWeight(weights.beta, constants.defaultWeights.beta);
    const globalBeta = globalBetaRaw > 0 ? globalBetaRaw : 1e-6;
    const overrides = Array.isArray(weights.cornerOverrides) ? weights.cornerOverrides : [];

    const Hdata = Array.from({ length: N }, () => new Array(N).fill(0));
    const gdata = new Array(N).fill(0);
    const HdataWeighted = Array.from({ length: N }, () => new Array(N).fill(0));
    const gdataWeighted = new Array(N).fill(0);

    // ---- Data fidelity term: beta * sum ||T(t_i) - data_i||^2 ----
    // x and y are decoupled here (fitting x doesn't depend on y or vice versa), so this
    // only ever touches the x-block [0..S) or the y-block [S..2S) of the joint system.
    points.forEach((pt) => {
      const tc = ((pt.dist % period) + period) % period;
      const basis = computeBSplineBasisFuns(tc, degree, referenceRep.knots, referenceRep.points.length);
      const localBeta = resolveLocalWeight(pt.dist, 'beta', globalBeta, overrides, period);
      for (let a = 0; a <= degree; a++) {
        const extA = basis.span - degree + a;
        const realA = ((extA % S) + S) % S;
        gdata[realA] += basis.values[a] * pt.x;
        gdata[S + realA] += basis.values[a] * pt.y;
        gdataWeighted[realA] += localBeta * basis.values[a] * pt.x;
        gdataWeighted[S + realA] += localBeta * basis.values[a] * pt.y;
        for (let b = 0; b <= degree; b++) {
          const extB = basis.span - degree + b;
          const realB = ((extB % S) + S) % S;
          const prod = basis.values[a] * basis.values[b];
          Hdata[realA][realB] += prod;
          Hdata[S + realA][S + realB] += prod;
          HdataWeighted[realA][realB] += localBeta * prod;
          HdataWeighted[S + realA][S + realB] += localBeta * prod;
        }
      }
    });

    // ---- Curvature-smoothness term: alpha * integral(kappa'(s)^2) ds ----
    const Hsmooth = Array.from({ length: N }, () => new Array(N).fill(0));
    const HsmoothWeighted = Array.from({ length: N }, () => new Array(N).fill(0));
    const sampleCount = Math.max(QP_SAMPLE_MIN, Math.min(QP_SAMPLE_MAX, Math.round(period / QP_SAMPLE_SPACING_M)));
    const dt = period / sampleCount;

    // Precompute, at every sample, the linearized kappa(t) as a sparse coefficient
    // vector over z (indices into the x-block and y-block of the joint system).
    const kappaCoeffs = new Array(sampleCount);
    for (let j = 0; j < sampleCount; j++) {
      const t = j * dt;
      const d = evalBSplineDerivatives(referenceRep.points, referenceRep.knots, degree, t);
      const speedSq = Math.max(1e-6, d.first.x * d.first.x + d.first.y * d.first.y);
      const w = 1 / Math.pow(speedSq, 1.5); // 1 / D_ref^1.5
      const basis = secondDerivativeBasisAt(referenceRep, t);
      // kappa(t) =~ w * [ x'_ref*y''(z) - y'_ref*x''(z) ]
      //   contribution to y-block (from y''): +w * x'_ref * Bpp_k(t)
      //   contribution to x-block (from x''): -w * y'_ref * Bpp_k(t)
      const idx = basis.indices;
      const xCoef = basis.values.map((v) => -w * d.first.y * v);
      const yCoef = basis.values.map((v) => w * d.first.x * v);
      kappaCoeffs[j] = { idx, xCoef, yCoef, speed: Math.sqrt(speedSq), first: d.first, second: d.second };
    }

    for (let j = 0; j < sampleCount; j++) {
      const jPrev = (j - 1 + sampleCount) % sampleCount;
      const jNext = (j + 1) % sampleCount;
      const arcStep = Math.max(1e-6, kappaCoeffs[j].speed * dt);
      const denom = 2 * arcStep; // approx (s_{j+1} - s_{j-1})

      const v = new Map();
      const accumulate = (sample, sign) => {
        sample.idx.forEach((realIdx, k) => {
          const gx = realIdx;
          const gy = S + realIdx;
          v.set(gx, (v.get(gx) || 0) + (sign * sample.xCoef[k]) / denom);
          v.set(gy, (v.get(gy) || 0) + (sign * sample.yCoef[k]) / denom);
        });
      };
      accumulate(kappaCoeffs[jNext], 1);
      accumulate(kappaCoeffs[jPrev], -1);

      const nz = Array.from(v.entries()).filter(([, val]) => Math.abs(val) > 1e-14);
      if (nz.length === 0) continue;
      const arcWeight = arcStep; // ds measure for this sample's contribution to the integral
      const localAlpha = resolveLocalWeight(j * dt, 'alpha', globalAlpha, overrides, period);
      for (let p = 0; p < nz.length; p++) {
        const [gi, vi] = nz[p];
        for (let q = 0; q < nz.length; q++) {
          const [gj, vj] = nz[q];
          Hsmooth[gi][gj] += arcWeight * vi * vj;
          HsmoothWeighted[gi][gj] += arcWeight * localAlpha * vi * vj;
        }
      }
    }

    // ---- Minimize-curvature term: gamma * integral(kappa(s)^2) ds ----
    // Unlike alpha/beta there's no global slider for this -- it defaults to 0 (off)
    // everywhere and only does anything within a corner override that sets it, so it
    // never disturbs a fit the user hasn't explicitly asked to straighten out. Reuses
    // the same linearized kappa(t) proxy as the smoothness term above, just penalizing
    // its value directly rather than its arc-length derivative.
    const Hgamma = Array.from({ length: N }, () => new Array(N).fill(0));
    const HgammaWeighted = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let j = 0; j < sampleCount; j++) {
      const sample = kappaCoeffs[j];
      const arcStep = Math.max(1e-6, sample.speed * dt);
      const localGamma = resolveLocalWeight(j * dt, 'gamma', 0, overrides, period);
      const nzIdx = [];
      const nzVal = [];
      sample.idx.forEach((realIdx, k) => {
        nzIdx.push(realIdx); nzVal.push(sample.xCoef[k]);
        nzIdx.push(S + realIdx); nzVal.push(sample.yCoef[k]);
      });
      for (let p = 0; p < nzIdx.length; p++) {
        for (let q = 0; q < nzIdx.length; q++) {
          const contrib = arcStep * nzVal[p] * nzVal[q];
          Hgamma[nzIdx[p]][nzIdx[q]] += contrib;
          if (localGamma > 0) HgammaWeighted[nzIdx[p]][nzIdx[q]] += localGamma * contrib;
        }
      }
    }

    // ---- Soft per-corner max-curvature cap ----
    // Discourages the fit from curving more sharply, anywhere, than the logged data's own
    // local peak (a rolling max of the smoothed data curvature -- see buildCurvatureProfile
    // -- which acts as a per-corner ceiling without needing any explicit corner
    // boundaries). This checks the *actual* (nonlinear) curvature of the current
    // reference against that ceiling; only violating samples get penalized, and the
    // penalty targets the same linearized kappa(t) proxy used above, pulled toward the
    // (correctly signed) cap value rather than toward zero. Because this depends on the
    // current reference, it sharpens up across the re-linearization loop just like the
    // smoothness term does.
    const Hcap = Array.from({ length: N }, () => new Array(N).fill(0));
    const gcap = new Array(N).fill(0);
    if (curvatureProfile) {
      for (let j = 0; j < sampleCount; j++) {
        const sample = kappaCoeffs[j];
        const kappaActual = curvatureFromDerivatives(sample.first, sample.second);
        if (kappaActual === null) continue;
        const t = j * dt;
        const cap = lookupProfileAtDistance(points, curvatureProfile.localMax, t, referenceRep.period);
        if (!(cap > 1e-9) || kappaActual <= cap * CURVATURE_CAP_TOLERANCE) continue;

        const crossSign = Math.sign(sample.first.x * sample.second.y - sample.first.y * sample.second.x) || 1;
        const target = crossSign * cap;

        const nzIdx = [];
        const nzVal = [];
        sample.idx.forEach((realIdx, k) => {
          nzIdx.push(realIdx); nzVal.push(sample.xCoef[k]);
          nzIdx.push(S + realIdx); nzVal.push(sample.yCoef[k]);
        });
        for (let p = 0; p < nzIdx.length; p++) {
          gcap[nzIdx[p]] += target * nzVal[p];
          for (let q = 0; q < nzIdx.length; q++) {
            Hcap[nzIdx[p]][nzIdx[q]] += nzVal[p] * nzVal[q];
          }
        }
      }
    }

    // Auto-scale alpha's, gamma's, and the cap penalty's contributions relative to the
    // (unweighted) data term so the sliders operate on comparable magnitudes regardless
    // of the raw (very different) physical units of a position-squared term (m^2) versus
    // curvature-based terms (1/m^2, 1/m^3) -- without this, alpha/gamma=1 would be either
    // imperceptible or would blow out the fit depending on track scale. Computed from the
    // *unweighted* matrices (see function doc) so this calibration doesn't move when the
    // user actually changes alpha/beta/gamma -- only the intended term does.
    const avgDiag = (mat) => {
      let sum = 0;
      let count = 0;
      for (let i = 0; i < N; i++) {
        if (mat[i][i] > 1e-12) { sum += mat[i][i]; count += 1; }
      }
      return count > 0 ? sum / count : 0;
    };
    const dataDiagAvg = avgDiag(Hdata);
    const smoothDiagAvg = avgDiag(Hsmooth);
    const gammaDiagAvg = avgDiag(Hgamma);
    const capDiagAvg = avgDiag(Hcap);
    const alphaScale = smoothDiagAvg > 1e-12 ? (dataDiagAvg / smoothDiagAvg) : 0;
    const gammaScale = gammaDiagAvg > 1e-12 ? (dataDiagAvg / gammaDiagAvg) : 0;
    const capScale = capDiagAvg > 1e-12 ? (dataDiagAvg / capDiagAvg) : 0;
    const capWeight = CURVATURE_CAP_PENALTY_STRENGTH * capScale;

    const H = Array.from({ length: N }, () => new Array(N).fill(0));
    const g = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      g[i] = gdataWeighted[i] + capWeight * gcap[i];
      for (let j = 0; j < N; j++) {
        H[i][j] = HdataWeighted[i][j] + alphaScale * HsmoothWeighted[i][j] + gammaScale * HgammaWeighted[i][j] + capWeight * Hcap[i][j];
      }
    }

    let diagSum = 0;
    for (let i = 0; i < N; i++) diagSum += H[i][i];
    const ridge = Math.max(1e-6, (diagSum / Math.max(1, N)) * 0.001);
    for (let i = 0; i < N; i++) H[i][i] += ridge;

    const z = solveLinearSystem(H, g);
    return entries.map((entry, i) => ({ point: { x: z[i], y: z[S + i] }, span: entry.span }));
  }

  function finishWholeCircuitFit(log, entries, points, totalLapDistance, baseDist, fitWeights, fitOptions, deps, constants) {
    const fitWeightsResolved = {
      alpha: normalizeFitWeight(fitWeights && fitWeights.alpha, constants.defaultWeights.alpha),
      beta: normalizeFitWeight(fitWeights && fitWeights.beta, constants.defaultWeights.beta),
      cornerOverrides: Array.isArray(fitWeights && fitWeights.cornerOverrides) ? fitWeights.cornerOverrides : []
    };

    // Reference curvature profile of the raw data, used by the QP's soft max-curvature
    // cap term (see solveQuinticCurvatureQP) -- purely a property of the logged points,
    // independent of the fit itself, so it's computed once up front.
    const curvatureProfile = buildCurvatureProfile(points, totalLapDistance);

    // Stage 1: reference curve for linearizing the curvature term (see module doc).
    const referenceEntries = fitPeriodicPositionLSQ(entries, points, 1.0);
    let referenceRep = buildPeriodicRepFromEntries(referenceEntries, SPLINE_DEGREE);

    // Stage 2: QP refinement, re-linearized a few times around its own previous result.
    // A single linearization pass is only accurate near the Stage-1 reference; for larger
    // alpha the solution can move far enough from that reference that the frozen first-
    // derivative terms stop being a good approximation, so curvature smoothness actually
    // *worsens* rather than improves as alpha grows past a certain point. Re-solving with
    // the previous solution as the new reference (a small sequential-convexification loop)
    // corrects this, converging in just a couple of iterations for realistic weights, and
    // also sharpens the max-curvature cap term against the current solution each pass.
    const QP_RELINEARIZE_ITERATIONS = 4;
    let solvedEntries = referenceEntries;
    for (let iter = 0; iter < QP_RELINEARIZE_ITERATIONS; iter++) {
      solvedEntries = solveQuinticCurvatureQP(entries, points, referenceRep, fitWeightsResolved, constants, curvatureProfile);
      const nextRep = buildPeriodicRepFromEntries(solvedEntries, SPLINE_DEGREE);
      let maxMove = 0;
      for (let i = 0; i < solvedEntries.length; i++) {
        const dx = solvedEntries[i].point.x - referenceRep.points[i].x;
        const dy = solvedEntries[i].point.y - referenceRep.points[i].y;
        maxMove = Math.max(maxMove, Math.hypot(dx, dy));
      }
      referenceRep = nextRep;
      if (maxMove < 0.01) break; // converged
    }
    const rep = referenceRep;

    const sampleCount = Math.max(200, Math.min(1400, Math.round(totalLapDistance / 3)));
    const sampled = samplePeriodicBSpline(rep, sampleCount);

    let sumSq = 0;
    let count = 0;
    points.forEach((pt) => {
      const fitPt = evalPeriodicBSpline(rep, pt.dist);
      const dx = fitPt.x - pt.x;
      const dy = fitPt.y - pt.y;
      sumSq += dx * dx + dy * dy;
      count += 1;
    });
    const positionRmse = count > 0 ? Math.sqrt(sumSq / count) : null;

    // Diagnostic: how much of the final curve still exceeds the data's own local
    // curvature peak (see the cap term in solveQuinticCurvatureQP) -- this is a *soft*
    // constraint, so some residual overshoot is expected, especially at low alpha/high
    // beta where data fidelity is prioritized over it.
    let curvatureCapExceedCount = 0;
    let curvatureCapMaxExceedPct = 0;
    const diagSampleCount = Math.max(200, Math.min(800, Math.round(totalLapDistance / 5)));
    for (let j = 0; j < diagSampleCount; j++) {
      const t = (j / diagSampleCount) * rep.period;
      const kappa = computePeriodicBSplineCurvatureAtT(rep, t);
      if (kappa === null) continue;
      const cap = lookupProfileAtDistance(points, curvatureProfile.localMax, t, totalLapDistance);
      if (cap > 1e-9 && kappa > cap * CURVATURE_CAP_TOLERANCE) {
        curvatureCapExceedCount += 1;
        curvatureCapMaxExceedPct = Math.max(curvatureCapMaxExceedPct, (kappa / cap - 1) * 100);
      }
    }

    return {
      method: 'whole-circuit',
      entries: solvedEntries,
      control: rep,
      sampled,
      totalLapDistance,
      baseDist,
      pointCount: points.length,
      positionRmse,
      curvatureCapExceedCount,
      curvatureCapMaxExceedPct,
      fitWeights: fitWeightsResolved,
      fitOptions
    };
  }

  function buildWholeCircuitFit(log, lap, fitWeights, fitOptions, deps, constants) {
    const rawPoints = collectWholeLapMapPoints(log, lap, deps);
    if (rawPoints.length < 20) return null;

    const baseDist = rawPoints[0].dist;
    const points = rawPoints.map((p) => ({ ...p, dist: p.dist - baseDist }));
    const totalLapDistance = points[points.length - 1].dist;
    if (!(totalLapDistance > 0)) return null;

    let numControlPoints = Math.round(totalLapDistance / WHOLE_CIRCUIT_TARGET_SPACING_M);
    numControlPoints = Math.max(WHOLE_CIRCUIT_MIN_CONTROL_POINTS, Math.min(WHOLE_CIRCUIT_MAX_CONTROL_POINTS, numControlPoints));

    // Uniform arc-length seeding. (Curvature-aware seeding was tried here -- denser
    // spacing in corners, sparser on straights -- but the extra control points'
    // freedom let the fit track more of the noise in the logged data, which made the
    // result visibly less smooth than uniform spacing despite reducing peak error.)
    const seedDistances = [];
    for (let i = 0; i < numControlPoints; i++) seedDistances.push((i / numControlPoints) * totalLapDistance);

    const seedControlPoints = seedDistances.map((t) => {
      let bestIdx = 0;
      let bestDt = Infinity;
      for (let j = 0; j < points.length; j++) {
        const dt = Math.abs(points[j].dist - t);
        if (dt < bestDt) { bestDt = dt; bestIdx = j; }
      }
      return { x: points[bestIdx].x, y: points[bestIdx].y };
    });
    const entries = buildPeriodicEntriesFromDistances(seedControlPoints, seedDistances, totalLapDistance);

    return finishWholeCircuitFit(log, entries, points, totalLapDistance, baseDist, fitWeights, fitOptions, deps, constants);
  }

  // Re-fits an already-built whole-circuit fit after the user has removed a control
  // point while navigating corners, or changed alpha/beta -- reuses the same reference
  // lap and baseDist coordinate system, just re-running both fit stages for the
  // (possibly thinned) entries ring.
  function refitWholeCircuitFromEntries(log, lap, entries, baseDist, fitWeights, fitOptions, deps, constants) {
    const rawPoints = collectWholeLapMapPoints(log, lap, deps);
    if (rawPoints.length < 20) return null;
    const points = rawPoints.map((p) => ({ ...p, dist: p.dist - baseDist }));
    const totalLapDistance = entries.reduce((sum, e) => sum + e.span, 0);
    if (!(totalLapDistance > 0)) return null;
    return finishWholeCircuitFit(log, entries, points, totalLapDistance, baseDist, fitWeights, fitOptions, deps, constants);
  }

  window.RacingLineCalculations = {
    normalizeFitWeight,
    buildWholeCircuitFit,
    refitWholeCircuitFromEntries,
    removePeriodicControlPoint,
    periodicEntryDistances,
    evalPeriodicBSpline,
    computePeriodicBSplineRadiusAtT,
    samplePeriodicBSpline
  };
})();
