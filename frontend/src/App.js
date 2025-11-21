import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pets on component mount
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1/pets';

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Handle both old format and new format
        const petsData = data.data?.pets || data;
        setPets(petsData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching pets:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="App">
        <h1>Welcome to Secure Pet Store</h1>
        <p>Loading pets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <h1>Welcome to Secure Pet Store</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐾 Secure Pet Store</h1>
        <p className="subtitle">Enterprise-Grade Pet Management System</p>
      </header>

      <main className="App-main">
        <section className="pets-section">
          <h2>Available Pets ({pets.length})</h2>

          {pets.length === 0 ? (
            <p>No pets available at the moment.</p>
          ) : (
            <div className="pets-grid">
              {pets.map((pet) => (
                <div key={pet.id} className="pet-card">
                  <h3>{pet.name}</h3>
                  <div className="pet-details">
                    <p><strong>Species:</strong> {pet.species}</p>
                    <p><strong>Age:</strong> {pet.age} years old</p>
                    {pet.breed && <p><strong>Breed:</strong> {pet.breed}</p>}
                    {pet.description && (
                      <p className="description">{pet.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="api-info">
          <h3>📚 API Documentation</h3>
          <p>
            View the interactive API documentation at{' '}
            <a
              href="http://localhost:8080/api-docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:8080/api-docs
            </a>
          </p>
        </section>
      </main>

      <footer className="App-footer">
        <p>Powered by Enterprise-Grade DevSecOps Pipeline</p>
      </footer>
    </div>
  );
}

export default App;
