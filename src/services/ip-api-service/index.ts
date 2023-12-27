import { safeFetch } from "../../utils";

const baseUrl = process.env.IP_API_URL;

export async function fetchIpApiData(ip: string) {
  const url = `${baseUrl}/${ip}?lang=es`;
  const response = await safeFetch(url);
  return response;
}
