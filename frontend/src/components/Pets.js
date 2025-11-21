import React, { useState, useEffect } from 'react';
import { petAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PetForm from './PetForm';
import './Pets.css';

function Pets() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingPet, setEditingPet] = useState(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchPets();
    }, []);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const response = await petAPI.getAll();
            const petsData = response.data.data?.pets || response.data;
            setPets(petsData);
            setError(null);
        } catch (err) {
            setError('Failed to load pets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pet?')) {
            return;
        }

        try {
            await petAPI.delete(id);
            setPets(pets.filter(pet => pet.id !== id));
        } catch (err) {
            alert('Failed to delete pet. Please try again.');
        }
    };

    const handleEdit = (pet) => {
        setEditingPet(pet);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingPet(null);
    };

    const handleFormSubmit = async (petData) => {
        try {
            if (editingPet) {
                // Update existing pet
                await petAPI.update(editingPet.id, petData);
            } else {
                // Create new pet
                await petAPI.create(petData);
            }

            // Refresh list
            await fetchPets();
            handleFormClose();
        } catch (err) {
            throw err; // Let form handle the error
        }
    };

    if (loading) {
        return (
            <div className="pets-container">
                <div className="loading">Loading pets...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pets-container">
                <div className="error-banner">{error}</div>
            </div>
        );
    }

    return (
        <div className="pets-container">
            <div className="pets-header">
                <h2>🐾 Available Pets ({pets.length})</h2>
                {isAuthenticated && (
                    <button
                        className="add-pet-btn"
                        onClick={() => setShowForm(true)}
                    >
                        + Add New Pet
                    </button>
                )}
            </div>

            {pets.length === 0 ? (
                <div className="empty-state">
                    <p>No pets available at the moment.</p>
                    {isAuthenticated && (
                        <button className="add-pet-btn" onClick={() => setShowForm(true)}>
                            Add Your First Pet
                        </button>
                    )}
                </div>
            ) : (
                <div className="pets-grid">
                    {pets.map((pet) => (
                        <div key={pet.id} className="pet-card">
                            <div className="pet-header">
                                <h3>{pet.name}</h3>
                                {isAuthenticated && (
                                    <div className="pet-actions">
                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(pet)}
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(pet.id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>

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

            {showForm && (
                <PetForm
                    pet={editingPet}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
}

export default Pets;
