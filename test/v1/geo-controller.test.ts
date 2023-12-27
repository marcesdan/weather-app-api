import request from "supertest";
import app from "../../src/app";
import { mockNotOk, mockOk } from "../utils";

jest.mock("../../src/utils", () => ({
  safeFetch: jest.fn(),
}));
const safeFetchMock = require("../../src/utils").safeFetch;

describe("GET /api/v1/geo/direct", () => {
  it("responds 400", async () => {
    safeFetchMock.mockResolvedValue(mockNotOk);
    const response = await request(app).get("/api/v1/geo/direct");
    expect(response.statusCode).toBe(400);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });
  it("responds with json", async () => {
    safeFetchMock.mockResolvedValue(mockOk);
    const response = await request(app).get("/api/v1/geo/direct?city=Ushuaia");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });
});

describe("GET /api/v1/geo/reverse", () => {
  it("responds 400", async () => {
    safeFetchMock.mockResolvedValue(mockNotOk);
    const response = await request(app).get("/api/v1/geo/reverse");
    expect(response.statusCode).toBe(400);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });
  it("responds 400", async () => {
    safeFetchMock.mockResolvedValue(mockNotOk);
    const response = await request(app).get("/api/v1/geo/reverse?lat=0");
    expect(response.statusCode).toBe(400);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });

  it("responds with json", async () => {
    safeFetchMock.mockResolvedValue(mockOk);
    const response = await request(app).get("/api/v1/geo/reverse?lat=0&lon=0");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });
});
