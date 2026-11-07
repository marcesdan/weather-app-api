import request from "supertest";
import app from "../../src/app";
import { mockNotOk, mockOk } from "../utils";

jest.mock("../../src/utils", () => ({
  safeFetch: jest.fn(),
}));
const safeFetchMock = require("../../src/utils").safeFetch;
import { clearOnecallCache } from "../../src/services/weather-api-map-service";
import { RATE_LIMIT } from "../../src/middlewares";

beforeEach(() => {
  clearOnecallCache();
  safeFetchMock.mockReset();
});

describe("GET /api/v1/onecall", () => {
  it("responds with 400", async () => {
    safeFetchMock.mockResolvedValue(mockNotOk);
    const response = await request(app).get("/api/v1/onecall");
    expect(response.statusCode).toBe(400);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });
  it("responds with 400", async () => {
    safeFetchMock.mockResolvedValue(mockNotOk);
    const response = await request(app).get("/api/v1/onecall?lat=0");
    expect(response.statusCode).toBe(400);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });

  it("responds with JSON", async () => {
    safeFetchMock.mockResolvedValue(mockOk);
    const response = await request(app).get("/api/v1/onecall?lat=0&lon=0");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });

  it("rejects coordinates that are not numbers on the globe", async () => {
    for (const q of [
      "lat=abc&lon=0",
      "lat=91&lon=0",
      "lat=0&lon=0%26units%3Dimperial",
    ]) {
      const response = await request(app).get(`/api/v1/onecall?${q}`);
      expect(response.statusCode).toBe(400);
    }
    expect(safeFetchMock).not.toHaveBeenCalled();
  });

  it("serves nearby repeat requests from the 10 minute cache", async () => {
    safeFetchMock.mockResolvedValue(mockOk);
    await request(app).get("/api/v1/onecall?lat=-34.6037&lon=-58.3816");
    const second = await request(app).get(
      "/api/v1/onecall?lat=-34.6041&lon=-58.3819",
    );
    expect(second.statusCode).toBe(200);
    expect(safeFetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not cache failures", async () => {
    safeFetchMock
      .mockResolvedValueOnce(mockNotOk)
      .mockResolvedValueOnce(mockOk);
    await request(app).get("/api/v1/onecall?lat=1&lon=1");
    const retry = await request(app).get("/api/v1/onecall?lat=1&lon=1");
    expect(retry.statusCode).toBe(200);
    expect(safeFetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("rate limit", () => {
  it("answers 429 past the per-minute limit", async () => {
    safeFetchMock.mockResolvedValue(mockOk);
    let last = 0;
    for (let i = 0; i <= RATE_LIMIT; i++)
      last = (await request(app).get("/api/v1/")).statusCode;
    expect(last).toBe(429);
  });
});
