import request from "supertest";
import app from "../../src/app";
import { mockNotOk, mockOk } from "../utils";

jest.mock("../../src/utils", () => ({
  safeFetch: jest.fn(),
}));
const safeFetchMock = require("../../src/utils").safeFetch;

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
});
