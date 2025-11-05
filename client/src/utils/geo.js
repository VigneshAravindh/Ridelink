// src/utils/geo.js
export function haversineDistanceKm(a, b, factor = 1.2) {
  // a = { lat, lng }  b = { lat, lng }
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const A =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));
  const d = R * C;

  return d * factor; // Road-adjusted distance
}
