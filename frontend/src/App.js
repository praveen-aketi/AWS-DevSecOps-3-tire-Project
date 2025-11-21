import React, { useEffect, useState } from 'react';

function App() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api/pets";
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setPets(data))
      .catch((error) => console.error("Error fetching pets:", error));
  }, []);

  return (
    <div>
      <h1>Welcome to Secure Pet Store</h1>
      <h2>Pets list from backend:</h2>
      <ul>
        {pets.map((pet) => (
          <li key={pet.id}>{pet.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
