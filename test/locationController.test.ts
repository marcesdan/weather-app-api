import request from "supertest";
import app from "../src/app";

describe("GET /v1/location", () => {
  it("responds with json", async () => {
    const response = await request(app).get("/v1/location");
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("json"),
    );
  });
});
