const request = require("supertest");
const app = require("./app");

// Mock pg
jest.mock("pg", () => {
  const mPool = {
    query: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const { Pool } = require("pg");
const pool = new Pool();

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
    const mockPets = [{ id: 1, name: "Fluffy" }];
    pool.query.mockResolvedValue({ rows: mockPets });

    const res = await request(app).get("/api/pets");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockPets);
  });
});
