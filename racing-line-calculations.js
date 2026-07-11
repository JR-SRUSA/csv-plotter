(function () {
  'use strict';

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
  // General (non-uniform) cubic B-spline core: de Boor evaluation and basis
  // functions. Shared by the periodic whole-circuit representation below.
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

  function getRadiusColumnForLog(log, deps) {
    const resolved = deps.resolveChannelForLog('Radius', log);
    if (resolved && Array.isArray(log.cols) && log.cols.includes(resolved)) return resolved;
    const fallbacks = ['GPS Radius', 'Radius', 'Track Radius'];
    for (const name of fallbacks) {
      if (Array.isArray(log.cols) && log.cols.includes(name)) return name;
    }
    return '';
  }

  // ---------------------------------------------------------------------
  // Whole-circuit fit: a single periodic (closed-loop) cubic B-spline fit
  // across the entire lap distance, guided by a forward/backward-smoothed
  // curvature profile of the logged data. Every control point is free --
  // there is no start/end to clamp on a closed loop -- and C2 continuity
  // across the wrap-around seam falls out of the standard B-spline
  // construction automatically, so no tangent constraints are needed
  // anywhere.
  //
  // The spline is represented as an ordered ring of "entries", each pairing
  // a control point with the along-track knot span (distance) to the next
  // entry. This directly supports local knot insertion/removal -- adding or
  // removing a control point in just one corner, without disturbing the
  // knot spacing anywhere else -- by reusing the general (non-uniform) de
  // Boor machinery above, just extended periodically instead of clamped.
  // Any change to the entries ring is always followed by a fresh
  // least-squares re-solve against the logged data, so there's no need for
  // shape-preserving insertion/removal math.
  // ---------------------------------------------------------------------

  const WHOLE_CIRCUIT_DEGREE = 3;
  const WHOLE_CIRCUIT_TARGET_SPACING_M = 20;
  const WHOLE_CIRCUIT_MIN_CONTROL_POINTS = 24;
  const WHOLE_CIRCUIT_MAX_CONTROL_POINTS = 220;
  const WHOLE_CIRCUIT_ABSOLUTE_MIN_CONTROL_POINTS = 8;
  const WHOLE_CIRCUIT_MIN_SPAN_M = 2;
  const WHOLE_CIRCUIT_CURVATURE_SMOOTH_HALF_WINDOW_M = 35;
  const WHOLE_CIRCUIT_EXTREMA_MIN_SPACING_M = 20;

  function buildUniformPeriodicEntries(controlPoints, period) {
    const S = controlPoints.length;
    const span = period / S;
    return controlPoints.map((p) => ({ point: { x: p.x, y: p.y }, span }));
  }

  // Extends the compact "entries" ring (S control points + S knot spans) into the flat
  // {points, knots, degree} form the generic de Boor evaluator expects, by wrapping
  // `degree` entries past each end of one period.
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

  // Inserts a new control point at along-track distance `tInsert`, splitting whichever
  // knot span currently contains it. The new point is seeded at the midpoint of its two
  // new neighbors -- just a starting guess, since the caller always re-runs the
  // least-squares fit immediately afterward.
  function insertPeriodicControlPoint(entries, tInsert) {
    const S = entries.length;
    if (S >= WHOLE_CIRCUIT_MAX_CONTROL_POINTS) return null;
    const primary = periodicEntryDistances(entries).concat([entries.reduce((sum, e) => sum + e.span, 0)]);
    const period = primary[S];
    const tc = ((tInsert % period) + period) % period;

    let k = S - 1;
    for (let i = 0; i < S; i++) {
      if (tc >= primary[i] && tc < primary[i + 1]) { k = i; break; }
    }
    const leftSpan = tc - primary[k];
    const rightSpan = primary[k + 1] - tc;
    if (leftSpan < WHOLE_CIRCUIT_MIN_SPAN_M || rightSpan < WHOLE_CIRCUIT_MIN_SPAN_M) return null;

    const prevPt = entries[k].point;
    const nextPt = entries[(k + 1) % S].point;
    const newEntry = { point: { x: (prevPt.x + nextPt.x) / 2, y: (prevPt.y + nextPt.y) / 2 }, span: rightSpan };

    const newEntries = entries.slice();
    newEntries[k] = { point: entries[k].point, span: leftSpan };
    newEntries.splice(k + 1, 0, newEntry);
    return newEntries;
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

  // Curvature (1/radius) of the logged data at every collected point, plus a
  // forward/backward-smoothed version (same windowed-average technique used
  // elsewhere in the app, e.g. the Quick Modify filter) over a 35 m half-window.
  function buildWholeLapCurvatureProfile(log, points, deps) {
    const radiusCol = getRadiusColumnForLog(log, deps);
    if (!radiusCol) return null;
    const curvatureArr = points.map((pt) => {
      const radius = Number(log.data[pt.rowIndex][radiusCol]);
      return (Number.isFinite(radius) && radius > 0) ? (1 / radius) : null;
    });
    const validCount = curvatureArr.filter((v) => Number.isFinite(v)).length;
    if (validCount < 8) return null;

    const distArr = points.map((pt) => pt.dist);
    const smoothed = deps.computeWindowedAverage(curvatureArr, distArr, WHOLE_CIRCUIT_CURVATURE_SMOOTH_HALF_WINDOW_M);
    return points.map((pt, i) => ({
      rowIndex: pt.rowIndex,
      dist: pt.dist,
      x: pt.x,
      y: pt.y,
      curvature: curvatureArr[i],
      smoothedCurvature: Number.isFinite(smoothed[i]) ? smoothed[i] : null
    }));
  }

  // Local minima of the smoothed-curvature-derived radius (i.e. apex points of
  // every corner around the whole lap), non-max-suppressed by along-track
  // spacing so nearby noisy candidates collapse to the single tightest point.
  function findCurvatureExtrema(profile, minSpacingM) {
    const n = profile.length;
    if (n < 5) return [];
    const smoothedRadius = profile.map((p) => (
      Number.isFinite(p.smoothedCurvature) && p.smoothedCurvature > 1e-6 ? (1 / p.smoothedCurvature) : null
    ));
    const valid = smoothedRadius.filter((r) => Number.isFinite(r));
    if (valid.length < 5) return [];
    const rMin = Math.min(...valid);
    const rMax = Math.max(...valid);
    const range = Math.max(1, rMax - rMin);
    const slopeSlack = 0.01 * range;

    // Compare each point against neighbors a meaningful distance away rather than the
    // literal adjacent array entry: with dense per-row logging (samples every fraction
    // of a meter) and a wide 35 m smoothing window, immediately-adjacent samples are
    // visually identical, so an adjacent-index slope test almost never registers.
    const compareSpacingM = Math.max(5, minSpacingM * 0.5);
    const findNeighbor = (i, dir) => {
      let j = i;
      while (j + dir >= 0 && j + dir < n) {
        j += dir;
        if (Math.abs(profile[j].dist - profile[i].dist) >= compareSpacingM) return j;
      }
      return null;
    };

    const candidates = [];
    for (let i = 0; i < n; i++) {
      const r = smoothedRadius[i];
      if (!Number.isFinite(r)) continue;
      const prevIdx = findNeighbor(i, -1);
      const nextIdx = findNeighbor(i, 1);
      if (prevIdx === null || nextIdx === null) continue;
      const rPrev = smoothedRadius[prevIdx];
      const rNext = smoothedRadius[nextIdx];
      if (!Number.isFinite(rPrev) || !Number.isFinite(rNext)) continue;
      if (r <= rPrev - slopeSlack && r <= rNext - slopeSlack) {
        candidates.push({ index: i, radius: r });
      }
    }
    candidates.sort((a, b) => a.radius - b.radius);
    const accepted = [];
    candidates.forEach((cand) => {
      const candDist = profile[cand.index].dist;
      const tooClose = accepted.some((acc) => Math.abs(profile[acc.index].dist - candDist) < minSpacingM);
      if (!tooClose) accepted.push(cand);
    });
    accepted.sort((a, b) => profile[a.index].dist - profile[b.index].dist);
    return accepted.map((a) => profile[a.index]);
  }

  // curvatureByRowIndex/maxSmoothedCurvature (optional): when supplied, the position
  // weight for each logged point is boosted in proportion to how tight the smoothed
  // curvature is there (scaled by the radiusFit weight), so the fit tracks the smoothed
  // curvature profile throughout every corner -- not just at each corner's single
  // extrema anchor.
  function fitPeriodicBSplineControlPoints(entries, points, extremaAnchors, fitWeights, constants, curvatureByRowIndex, maxSmoothedCurvature) {
    const degree = WHOLE_CIRCUIT_DEGREE;
    const S = entries.length;
    const rep = buildPeriodicRepFromEntries(entries, degree);

    const weights = fitWeights || constants.defaultWeights;
    const positionWeight = normalizeFitWeight(weights.position, constants.defaultWeights.position);
    const radiusWeight = normalizeFitWeight(weights.radiusFit, constants.defaultWeights.radiusFit);
    const effectivePositionWeight = positionWeight > 0 ? positionWeight : 1e-6;
    const hasCurvatureWeighting = !!(curvatureByRowIndex && maxSmoothedCurvature > 1e-9);

    const M = Array.from({ length: S }, () => new Array(S).fill(0));
    const rhsX = new Array(S).fill(0);
    const rhsY = new Array(S).fill(0);

    const addEquation = (t, targetX, targetY, w) => {
      if (!(w > 0)) return;
      const tc = ((t % rep.period) + rep.period) % rep.period;
      const basis = computeBSplineBasisFuns(tc, degree, rep.knots, rep.points.length);
      for (let a = 0; a <= degree; a++) {
        const extA = basis.span - degree + a;
        const realA = ((extA % S) + S) % S;
        rhsX[realA] += w * basis.values[a] * targetX;
        rhsY[realA] += w * basis.values[a] * targetY;
        for (let b = 0; b <= degree; b++) {
          const extB = basis.span - degree + b;
          const realB = ((extB % S) + S) % S;
          M[realA][realB] += w * basis.values[a] * basis.values[b];
        }
      }
    };

    points.forEach((pt) => {
      let w = effectivePositionWeight;
      if (hasCurvatureWeighting && Number.isFinite(pt.rowIndex)) {
        const c = curvatureByRowIndex.get(pt.rowIndex);
        if (Number.isFinite(c)) {
          const norm = Math.max(0, Math.min(1, c / maxSmoothedCurvature));
          w = effectivePositionWeight * (1 + radiusWeight * norm);
        }
      }
      addEquation(pt.dist, pt.x, pt.y, w);
    });
    extremaAnchors.forEach((pt) => addEquation(pt.dist, pt.x, pt.y, radiusWeight));

    // Light ridge purely for numerical safety -- the position term above, sampled from
    // real logged data far denser than typical control-point spacing, already keeps
    // this system well-conditioned on its own.
    let diagSum = 0;
    for (let a = 0; a < S; a++) diagSum += M[a][a];
    const ridge = Math.max(1e-6, (diagSum / Math.max(1, S)) * 0.01);
    for (let a = 0; a < S; a++) M[a][a] += ridge;

    const solvedX = solveLinearSystem(M, rhsX);
    const solvedY = solveLinearSystem(M, rhsY);

    return entries.map((entry, i) => ({ point: { x: solvedX[i], y: solvedY[i] }, span: entry.span }));
  }

  function finishWholeCircuitFit(log, entries, points, totalLapDistance, baseDist, fitWeights, fitOptions, deps, constants) {
    const profile = buildWholeLapCurvatureProfile(log, points, deps);
    const extrema = profile ? findCurvatureExtrema(profile, WHOLE_CIRCUIT_EXTREMA_MIN_SPACING_M) : [];

    const fitWeightsResolved = {
      position: normalizeFitWeight(fitWeights && fitWeights.position, constants.defaultWeights.position),
      radiusFit: normalizeFitWeight(fitWeights && fitWeights.radiusFit, constants.defaultWeights.radiusFit)
    };

    let curvatureByRowIndex = null;
    let maxSmoothedCurvature = 0;
    if (profile) {
      curvatureByRowIndex = new Map();
      profile.forEach((p) => {
        if (Number.isFinite(p.smoothedCurvature)) {
          curvatureByRowIndex.set(p.rowIndex, p.smoothedCurvature);
          if (p.smoothedCurvature > maxSmoothedCurvature) maxSmoothedCurvature = p.smoothedCurvature;
        }
      });
    }

    const solvedEntries = fitPeriodicBSplineControlPoints(
      entries, points, extrema, fitWeightsResolved, constants,
      curvatureByRowIndex, maxSmoothedCurvature
    );
    const rep = buildPeriodicRepFromEntries(solvedEntries, WHOLE_CIRCUIT_DEGREE);

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

    return {
      method: 'whole-circuit',
      entries: solvedEntries,
      control: rep,
      sampled,
      totalLapDistance,
      baseDist,
      pointCount: points.length,
      extremaCount: extrema.length,
      positionRmse,
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

    const seedControlPoints = [];
    for (let i = 0; i < numControlPoints; i++) {
      const t = (i / numControlPoints) * totalLapDistance;
      let bestIdx = 0;
      let bestDt = Infinity;
      for (let j = 0; j < points.length; j++) {
        const dt = Math.abs(points[j].dist - t);
        if (dt < bestDt) { bestDt = dt; bestIdx = j; }
      }
      seedControlPoints.push({ x: points[bestIdx].x, y: points[bestIdx].y });
    }
    const entries = buildUniformPeriodicEntries(seedControlPoints, totalLapDistance);

    return finishWholeCircuitFit(log, entries, points, totalLapDistance, baseDist, fitWeights, fitOptions, deps, constants);
  }

  // Re-fits an already-built whole-circuit fit after the user has added/removed a
  // control point while navigating corners -- reuses the same reference lap and
  // baseDist coordinate system, just re-solving the least-squares system for the
  // (possibly locally denser) entries ring.
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
    insertPeriodicControlPoint,
    removePeriodicControlPoint,
    periodicEntryDistances,
    evalPeriodicBSpline,
    computePeriodicBSplineRadiusAtT,
    samplePeriodicBSpline
  };
})();
