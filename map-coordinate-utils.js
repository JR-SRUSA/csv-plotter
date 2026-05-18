(() => {
  const EARTH_RADIUS_M = 6371000;

  function toFiniteNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function findMiddleOrigin(latSeries, lonSeries) {
    const valid = [];
    const len = Math.min(latSeries.length, lonSeries.length);
    for (let i = 0; i < len; i++) {
      const lat = toFiniteNumber(latSeries[i]);
      const lon = toFiniteNumber(lonSeries[i]);
      if (lat == null || lon == null) continue;
      valid.push({ lat, lon });
    }

    if (valid.length === 0) return null;
    const mid = Math.floor(valid.length / 2);
    return { originLat: valid[mid].lat, originLon: valid[mid].lon };
  }

  function latLonToLocalXYMeters(lat, lon, originLat, originLon) {
    const latN = toFiniteNumber(lat);
    const lonN = toFiniteNumber(lon);
    const oLat = toFiniteNumber(originLat);
    const oLon = toFiniteNumber(originLon);
    if (latN == null || lonN == null || oLat == null || oLon == null) return null;

    const dLat = (latN - oLat) * Math.PI / 180;
    const dLon = (lonN - oLon) * Math.PI / 180;
    const meanLatRad = ((latN + oLat) * 0.5) * Math.PI / 180;

    const x = EARTH_RADIUS_M * dLon * Math.cos(meanLatRad);
    const y = EARTH_RADIUS_M * dLat;
    return { x, y };
  }

  function buildDerivedXY(latSeries, lonSeries, explicitOrigin) {
    if (!Array.isArray(latSeries) || !Array.isArray(lonSeries)) return null;

    const origin = explicitOrigin && Number.isFinite(Number(explicitOrigin.originLat)) && Number.isFinite(Number(explicitOrigin.originLon))
      ? { originLat: Number(explicitOrigin.originLat), originLon: Number(explicitOrigin.originLon) }
      : findMiddleOrigin(latSeries, lonSeries);

    if (!origin) return null;

    const len = Math.min(latSeries.length, lonSeries.length);
    const x = new Array(len);
    const y = new Array(len);

    for (let i = 0; i < len; i++) {
      const xy = latLonToLocalXYMeters(latSeries[i], lonSeries[i], origin.originLat, origin.originLon);
      x[i] = xy ? xy.x : null;
      y[i] = xy ? xy.y : null;
    }

    return {
      x,
      y,
      originLat: origin.originLat,
      originLon: origin.originLon
    };
  }

  function localXYToLatLonMeters(x, y, originLat, originLon) {
    const xN = toFiniteNumber(x);
    const yN = toFiniteNumber(y);
    const oLat = toFiniteNumber(originLat);
    const oLon = toFiniteNumber(originLon);
    if (xN == null || yN == null || oLat == null || oLon == null) return null;

    const dLat = yN / EARTH_RADIUS_M;
    const lat = oLat + dLat * 180 / Math.PI;
    const cosLat = Math.max(1e-9, Math.cos(oLat * Math.PI / 180));
    const dLon = xN / (EARTH_RADIUS_M * cosLat);
    const lon = oLon + dLon * 180 / Math.PI;
    return { lat, lon };
  }

  function fitTranslationLeastSquares(pairs) {
    if (!Array.isArray(pairs) || pairs.length === 0) return null;
    let sumDx = 0;
    let sumDy = 0;
    let n = 0;

    pairs.forEach((p) => {
      if (!p) return;
      const posX = toFiniteNumber(p.posX);
      const posY = toFiniteNumber(p.posY);
      const mapX = toFiniteNumber(p.mapX);
      const mapY = toFiniteNumber(p.mapY);
      if (posX == null || posY == null || mapX == null || mapY == null) return;
      sumDx += (posX - mapX);
      sumDy += (posY - mapY);
      n += 1;
    });

    if (n === 0) return null;
    const offsetX = sumDx / n;
    const offsetY = sumDy / n;

    let sumErr = 0;
    let sumErrSq = 0;
    let used = 0;
    pairs.forEach((p) => {
      if (!p) return;
      const posX = toFiniteNumber(p.posX);
      const posY = toFiniteNumber(p.posY);
      const mapX = toFiniteNumber(p.mapX);
      const mapY = toFiniteNumber(p.mapY);
      if (posX == null || posY == null || mapX == null || mapY == null) return;
      const ex = posX - (mapX + offsetX);
      const ey = posY - (mapY + offsetY);
      const e = Math.hypot(ex, ey);
      sumErr += e;
      sumErrSq += e * e;
      used += 1;
    });

    return {
      offsetX,
      offsetY,
      pairCount: used,
      meanAbsError: used > 0 ? sumErr / used : null,
      rmse: used > 0 ? Math.sqrt(sumErrSq / used) : null
    };
  }

  window.MapCoordinateUtils = {
    toFiniteNumber,
    findMiddleOrigin,
    latLonToLocalXYMeters,
    buildDerivedXY,
    localXYToLatLonMeters,
    fitTranslationLeastSquares
  };
})();
