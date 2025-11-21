import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    🐾 SecurePetStore
                </Link>

                <div className="nav-menu">
                    <Link to="/" className="nav-link">
                        Home
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <span className="nav-user">
                                👤 {user?.username}
                            </span>
                            <button onClick={logout} className="nav-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">
                                Login
                            </Link>
                            <Link to="/register" className="nav-button">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
