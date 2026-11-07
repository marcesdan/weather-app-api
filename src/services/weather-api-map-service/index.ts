import { safeFetch } from "../../utils";
import { FetchResult } from "../../utils/safeFetch";

const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;
const baseUrl = process.env.OPEN_WEATHER_MAP_URL;

// URLSearchParams escapes user input, so "city=x&units=imperial" cannot change the upstream query.
const url = (path: string, params: Record<string, string>) =>
  `${baseUrl}${path}?${new URLSearchParams({
    ...params,
    appid: apiKey ?? "",
  })}`;

export async function fetchDirectGeocoding(city: string) {
  return safeFetch(url("/geo/1.0/direct", { q: city }));
}

export async function fetchReverseGeocoding(lat: string, lon: string) {
  return safeFetch(url("/geo/1.0/reverse", { lat, lon }));
}

// One Call 3.0 is billed per call past 1000/day: share one upstream call per ~1 km cell for 10 minutes
// (OpenWeatherMap's own update interval).
// shortcut: in-memory, per process; move to Redis if the API runs on more than one instance.
const TTL_MS = 10 * 60_000;
const MAX_ENTRIES = 1000;
const cache = new Map<string, { at: number; result: FetchResult }>();

export async function fetchOnecall(lat: string, lon: string) {
  const key = `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.result;
  const result = await safeFetch(
    url("/data/3.0/onecall", { lat, lon, units: "metric", lang: "es" }),
  );
  if (result.ok) {
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
    cache.set(key, { at: Date.now(), result });
  }
  return result;
}

export const clearOnecallCache = () => cache.clear();
