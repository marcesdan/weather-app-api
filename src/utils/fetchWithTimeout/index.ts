import { fetch, Agent } from "undici";

export default async function fetchWithTimeout(url: string, timeout = 15) {
  const response = await fetch(url, {
    dispatcher: new Agent({
      keepAliveTimeout: timeout,
      keepAliveMaxTimeout: timeout,
    }),
  });
  const data = await response.json();
  return data;
}
