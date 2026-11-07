// lat/lon must be numbers inside the globe; anything else is a 400 before it reaches OpenWeatherMap.
export function validCoords(lat: unknown, lon: unknown) {
  if (typeof lat !== "string" || typeof lon !== "string" || !lat || !lon)
    return false;
  const la = Number(lat);
  const lo = Number(lon);
  return (
    Number.isFinite(la) &&
    Number.isFinite(lo) &&
    Math.abs(la) <= 90 &&
    Math.abs(lo) <= 180
  );
}
