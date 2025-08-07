const request = require("supertest");
const app = require("./app");

describe("SecurePetStore API", () => {
  it("GET / should return welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Welcome to SecurePetStore Backend API!");
  });

  it("GET /health should return healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("GET /api/pets should return list of pets", async () => {
    const res = await request(app).get("/api/pets");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
