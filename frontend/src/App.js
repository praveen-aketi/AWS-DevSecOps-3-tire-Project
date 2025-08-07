import React, { useEffect, useState } from 'react';

function App() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/pets')
      .then(response => response.json())
      .then(data => {
        setPets(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching pets:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>🐾 Welcome to Secure Pet Store 🐾</h1>
      <p>Pets list from backend:</p>
      {loading ? (
        <p>Loading pets...</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {pets.length > 0 ? (
            pets.map(pet => (
              <li key={pet.id} style={{ margin: '8px 0' }}>
                🐶 {pet.name}
              </li>
            ))
          ) : (
            <p>No pets found.</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default App;
