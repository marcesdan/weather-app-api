import fetch from "node-fetch";

export default async function fetchWithTimeout(url: string) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
