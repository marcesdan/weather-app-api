import fetch from "node-fetch";

export type SuccessfulFetchResult = {
  data: {} | null;
  ok: true;
  status: number;
  problem: null;
  error: null;
};

export type UnsuccessfulFetchResult = {
  data: null;
  ok: false;
} & FetchErrorResponse;

export type FetchErrorResponse = {
  status: number;
  problem: string;
  error: unknown;
};

export type FetchResult = SuccessfulFetchResult | UnsuccessfulFetchResult;

export default async function safeFetch(
  url: string,
  options?: {},
): Promise<FetchResult> {
  let response;
  try {
    response = await fetch(url, options);
    if (!response?.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    const data = await response.json();
    return {
      data,
      ok: true,
      status: response.status,
      problem: null,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(errorMessage);
    return {
      data: null,
      ok: false,
      status: response?.status ?? 500,
      problem: errorMessage,
      error: response ? await response.json() : null,
    };
  }
}
