const express = require("express");
const cors = require("cors");

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

app.get("/api/pets", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pets");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
