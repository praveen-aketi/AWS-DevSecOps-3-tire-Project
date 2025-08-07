const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Sample pets data
const pets = [
  { id: 1, name: 'Fluffy' },
  { id: 2, name: 'Max' },
  { id: 3, name: 'Whiskers' }
];

// API endpoint
app.get('/api/pets', (req, res) => {
  res.json(pets);
});

// Start server
app.listen(PORT, () => {
  console.log(`SecurePetStore API running on port ${PORT}`);
});
