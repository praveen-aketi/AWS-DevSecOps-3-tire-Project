const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Welcome to SecurePetStore Backend API!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Pets endpoint
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "petstoredb",
  password: process.env.DB_PASSWORD || "changeMe1234!",
  port: process.env.DB_PORT || 5432,
});

// Apply rate limiter to /api/pets endpoint
const petsApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.get("/api/pets", petsApiLimiter, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pets");
    res.json(result.rows);
  } catch (err) {
    console.error("Database connection failed, returning mock data:", err.message);
    // Fallback to mock data for local development
    const mockPets = [
      { id: 1, name: "Fluffy", species: "Cat", age: 3 },
      { id: 2, name: "Max", species: "Dog", age: 5 },
      { id: 3, name: "Whiskers", species: "Cat", age: 2 },
      { id: 4, name: "Buddy", species: "Dog", age: 4 }
    ];
    res.json(mockPets);
  }
});

module.exports = app;
