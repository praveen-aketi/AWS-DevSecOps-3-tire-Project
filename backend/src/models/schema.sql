-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  species VARCHAR(30) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 50),
  breed VARCHAR(50),
  description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert mock data for pets
INSERT INTO pets (name, species, age, breed, description) VALUES
  ('Fluffy', 'Cat', 3, 'Persian', 'A fluffy white cat'),
  ('Max', 'Dog', 5, 'Golden Retriever', 'Friendly and energetic'),
  ('Whiskers', 'Cat', 2, 'Siamese', 'Loves to play'),
  ('Buddy', 'Dog', 4, 'Labrador', 'Great with kids')
ON CONFLICT DO NOTHING;
