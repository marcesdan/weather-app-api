import { fetchWithTimeout } from "../../utils";

const apiKey = process.env.OPEN_WEATHER_MAP_API_KEY;
const baseUrl = process.env.OPEN_WEATHER_MAP_URL;

export async function fetchDirectGeocoding(city: string) {
  const url = `${baseUrl}/geo/1.0/direct?q=${city}&appid=${apiKey}`;
  const data = await fetchWithTimeout(url);
  return data;
}

export async function fetchReverseGeocoding(lat: string, lon: string) {
  const url = `${baseUrl}/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const data = await fetchWithTimeout(url);
  return data;
}

export async function fetchOnecall(lat: string, lon: string) {
  const url = `${baseUrl}/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const data = await fetchWithTimeout(url);
  return data;
}
