import { fetchWithTimeout } from "../../utils";

const baseUrl = process.env.IP_API_URL;

export async function fetchIpApiData(ip: string) {
  const url = `${baseUrl}/${ip}`;
  const data = await fetchWithTimeout(url);
  return data;
}
