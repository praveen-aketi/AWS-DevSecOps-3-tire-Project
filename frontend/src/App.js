import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Pets from './components/Pets';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Pets />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>

          <footer className="app-footer">
            <p>Enterprise-Grade DevSecOps Pipeline | API Docs: <a href="http://localhost:8080/api-docs" target="_blank" rel="noopener noreferrer">Swagger UI</a></p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
