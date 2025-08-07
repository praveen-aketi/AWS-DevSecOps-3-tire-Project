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
const pets = [
  { id: 1, name: 'Fluffy' },
  { id: 2, name: 'Max' },
  { id: 3, name: 'Whiskers' }
];

app.get("/api/pets", (req, res) => {
  res.json(pets);
});

module.exports = app;
