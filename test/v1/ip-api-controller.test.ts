import request from "supertest";
import app from "../../src/app";
import { mockNotOk, mockOk } from "../utils";

jest.mock("../../src/utils", () => ({
  safeFetch: jest.fn(),
}));
const safeFetchMock = require("../../src/utils").safeFetch;

describe("GET /api/v1/ip-api", () => {
  it("responds with 400", async () => {
    safeFetchMock.mockResolvedValue(mockNotOk);
    const response = await request(app).get("/api/v1/ip-api");
    expect(response.statusCode).toBe(400);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });

  it("responds with json", async () => {
    safeFetchMock.mockResolvedValue(mockOk);
    const response = await request(app).get(
      "/api/v1/ip-api?ip=204.157.202.220",
    );
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });
});
