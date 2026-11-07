import fetch from "node-fetch";
import { safeFetch } from "../../utils";
import { FetchResult } from "../../utils/safeFetch";

const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY ?? "";
const baseUrl = process.env.OPEN_WEATHER_MAP_URL;

type Entry<T> = { at: number; value: T };
// Small TTL caches: the free plan allows 60 calls a minute for the whole app, shared by every user.
// shortcut: in-memory, per process; move to a shared store if the API scales out.
function ttlCache<T>(ttlMs: number, max: number) {
  const map = new Map<string, Entry<T>>();
  return {
    get(key: string) {
      const hit = map.get(key);
      return hit && Date.now() - hit.at < ttlMs ? hit.value : undefined;
    },
    set(key: string, value: T) {
      if (map.size >= max) map.delete(map.keys().next().value!);
      map.set(key, { at: Date.now(), value });
    },
    clear: () => map.clear(),
  };
}

type AirPoint = {
  dt: number;
  main: { aqi: number };
  components: Record<string, number>;
};
export type Air = {
  current: AirPoint | null;
  forecast: { dt: number; aqi: number; pm2_5: number }[];
};

const airCache = ttlCache<Air>(30 * 60_000, 500);

// Current air quality plus the hourly forecast (about 4 days), trimmed to what the app shows.
export async function fetchAir(
  lat: string,
  lon: string,
): Promise<FetchResult | { ok: true; data: Air }> {
  const key = `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
  const hit = airCache.get(key);
  if (hit) return { ok: true, data: hit };
  const q = new URLSearchParams({ lat, lon, appid: apiKey });
  const [now, next] = await Promise.all([
    safeFetch(`${baseUrl}/data/2.5/air_pollution?${q}`),
    safeFetch(`${baseUrl}/data/2.5/air_pollution/forecast?${q}`),
  ]);
  if (!now.ok) return now;
  const list = (now.data as { list?: AirPoint[] }).list ?? [];
  const future = next.ok ? (next.data as { list?: AirPoint[] }).list ?? [] : [];
  const data: Air = {
    current: list[0] ?? null,
    forecast: future
      .slice(0, 48)
      .map((p) => ({ dt: p.dt, aqi: p.main.aqi, pm2_5: p.components.pm2_5 })),
  };
  airCache.set(key, data);
  return { ok: true, data };
}

// Weather Maps 1.0 layers on the free plan.
export const TILE_LAYERS = [
  "clouds_new",
  "precipitation_new",
  "pressure_new",
  "wind_new",
  "temp_new",
] as const;
const tileCache = ttlCache<Buffer>(10 * 60_000, 3000); // ~10 kB each, ~30 MB worst case

export async function fetchTile(
  layer: string,
  z: number,
  x: number,
  y: number,
): Promise<{ ok: true; body: Buffer } | { ok: false; status: number }> {
  const key = `${layer}/${z}/${x}/${y}`;
  const hit = tileCache.get(key);
  if (hit) return { ok: true, body: hit };
  const res = await fetch(
    `https://tile.openweathermap.org/map/${key}.png?appid=${encodeURIComponent(
      apiKey,
    )}`,
  ).catch(() => null);
  if (!res?.ok) return { ok: false, status: res?.status ?? 502 };
  const body = await res.buffer();
  tileCache.set(key, body);
  return { ok: true, body };
}

export type Nowcast = { data: { dt: number; precipitation: number }[] };
const nowcastCache = ttlCache<Nowcast>(5 * 60_000, 500);

// Next 60 minutes of precipitation, minute by minute (One Call API 4.0). Needs the "One Call API" subscription:
// without it OpenWeatherMap answers 401 and the app simply hides the minute bar.
export async function fetchNowcast(
  lat: string,
  lon: string,
): Promise<FetchResult | { ok: true; data: Nowcast }> {
  const key = `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
  const hit = nowcastCache.get(key);
  if (hit) return { ok: true, data: hit };
  const q = new URLSearchParams({ lat, lon, appid: apiKey });
  const res = await safeFetch(`${baseUrl}/data/4.0/onecall/timeline/1min?${q}`);
  if (!res.ok) return res;
  const list =
    (res.data as { data?: { dt: number; precipitation?: number }[] }).data ??
    [];
  const data: Nowcast = {
    data: list.map((m) => ({ dt: m.dt, precipitation: m.precipitation ?? 0 })),
  };
  nowcastCache.set(key, data);
  return { ok: true, data };
}

export type Nearby = {
  name: string;
  lat: number;
  lon: number;
  kind: string;
  population: number;
}[];
const nearbyCache = ttlCache<Nearby>(24 * 60 * 60_000, 2000);

// Towns and cities within 60 km from OpenStreetMap (Overpass). Proxied and cached for a day per ~10 km: Overpass
// rate-limits by IP and answers its 429s without CORS headers, which the browser reports as a CORS failure.
export async function fetchNearby(
  lat: number,
  lon: number,
): Promise<{ ok: true; data: Nearby } | { ok: false; status: number }> {
  const key = `${lat.toFixed(1)},${lon.toFixed(1)}`;
  const hit = nearbyCache.get(key);
  if (hit) return { ok: true, data: hit };
  const q = `[out:json][timeout:15];node(around:60000,${lat.toFixed(
    3,
  )},${lon.toFixed(3)})[place~"^(city|town)$"][name];out 40;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: new URLSearchParams({ data: q }),
    headers: {
      "User-Agent":
        "weather-app-api (+https://github.com/marcesdan/weather-app-api)",
    },
  }).catch(() => null);
  if (!res?.ok) return { ok: false, status: res?.status ?? 502 };
  const { elements } = (await res.json()) as {
    elements: { lat: number; lon: number; tags: Record<string, string> }[];
  };
  const data = elements
    .map((e) => ({
      name: e.tags["name:es"] ?? e.tags.name,
      lat: e.lat,
      lon: e.lon,
      kind: e.tags.place,
      population: Number(e.tags.population) || 0,
    }))
    .sort((a, b) => b.population - a.population);
  nearbyCache.set(key, data);
  return { ok: true, data };
}

export const clearV2Caches = () => {
  nearbyCache.clear();
  nowcastCache.clear();
  airCache.clear();
  tileCache.clear();
};
