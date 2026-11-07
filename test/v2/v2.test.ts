import request from "supertest";
import app from "../../src/app";
import { clearV2Caches } from "../../src/services/weather-api-map-service/v2";
import { RATE_LIMIT } from "../../src/middlewares";

jest.mock("../../src/utils", () => ({ safeFetch: jest.fn() }));
jest.mock("node-fetch", () => jest.fn());
const safeFetchMock = require("../../src/utils").safeFetch;
const fetchMock = require("node-fetch") as jest.Mock;

const air = (aqi: number) => ({
  ok: true,
  data: { list: [{ dt: 1, main: { aqi }, components: { pm2_5: 7 } }] },
});

beforeEach(() => {
  clearV2Caches();
  safeFetchMock.mockReset();
  fetchMock.mockReset();
});

describe("GET /api/v2/air", () => {
  it("rejects bad coordinates", async () => {
    const res = await request(app).get("/api/v2/air?lat=abc&lon=1");
    expect(res.statusCode).toBe(400);
    expect(safeFetchMock).not.toHaveBeenCalled();
  });

  it("returns current AQI and a trimmed forecast, cached per ~1 km", async () => {
    safeFetchMock.mockResolvedValue(air(2));
    const res = await request(app).get("/api/v2/air?lat=-34.6&lon=-58.4");
    expect(res.statusCode).toBe(200);
    expect(res.body.current.main.aqi).toBe(2);
    expect(res.body.forecast[0]).toEqual({ dt: 1, aqi: 2, pm2_5: 7 });
    await request(app).get("/api/v2/air?lat=-34.6001&lon=-58.4001");
    expect(safeFetchMock).toHaveBeenCalledTimes(2); // current + forecast, once
  });
});

describe("GET /api/v2/nowcast", () => {
  it("passes the minute timeline through, trimmed", async () => {
    safeFetchMock.mockResolvedValue({
      ok: true,
      data: { data: [{ dt: 60, precipitation: 0.4, alerts: [] }] },
    });
    const res = await request(app).get("/api/v2/nowcast?lat=1&lon=2");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: [{ dt: 60, precipitation: 0.4 }] });
    expect(safeFetchMock.mock.calls[0][0]).toContain(
      "/data/4.0/onecall/timeline/1min?",
    );
  });

  it("forwards OpenWeatherMap's 401 when the account lacks the subscription", async () => {
    safeFetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      problem: "Fetch failed: 401",
    });
    expect(
      (await request(app).get("/api/v2/nowcast?lat=1&lon=2")).statusCode,
    ).toBe(401);
  });
});

describe("GET /api/v2/tiles", () => {
  it("rejects unknown layers and out-of-range tiles", async () => {
    for (const path of [
      "nope/1/0/0.png",
      "clouds_new/2/4/0.png",
      "clouds_new/20/0/0.png",
    ]) {
      expect((await request(app).get(`/api/v2/tiles/${path}`)).statusCode).toBe(
        400,
      );
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("proxies a tile with a cache header and serves repeats from memory", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      buffer: async () => Buffer.from("png"),
    });
    const res = await request(app).get(
      "/api/v2/tiles/precipitation_new/3/2/5.png",
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("image/png");
    expect(res.headers["cache-control"]).toContain("max-age=600");
    expect(res.headers["cross-origin-resource-policy"]).toBe("cross-origin");
    await request(app).get("/api/v2/tiles/precipitation_new/3/2/5.png");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("tiles have their own budget: a map pan does not trip the general limit", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      buffer: async () => Buffer.from("png"),
    });
    let last = 0;
    for (let i = 0; i <= RATE_LIMIT; i++) {
      last = (
        await request(app)
          .get(`/api/v2/tiles/clouds_new/8/${i}/1.png`)
          .set("X-Forwarded-For", "198.51.100.42")
      ).statusCode;
    }
    expect(last).toBe(200);
  });
});
