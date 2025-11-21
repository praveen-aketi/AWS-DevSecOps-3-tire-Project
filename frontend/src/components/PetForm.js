import React, { useState, useEffect } from 'react';
import './Pets.css';

function PetForm({ pet, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        age: '',
        breed: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pet) {
            setFormData({
                name: pet.name || '',
                species: pet.species || '',
                age: pet.age || '',
                breed: pet.breed || '',
                description: pet.description || '',
            });
        }
    }, [pet]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate age
        const age = parseInt(formData.age);
        if (age < 0 || age > 50) {
            setError('Age must be between 0 and 50');
            setLoading(false);
            return;
        }

        try {
            await onSubmit({
                ...formData,
                age: parseInt(formData.age),
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save pet');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{pet ? 'Edit Pet' : 'Add New Pet'}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            minLength="2"
                            maxLength="50"
                            placeholder="Pet's name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Species *</label>
                        <input
                            type="text"
                            name="species"
                            value={formData.species}
                            onChange={handleChange}
                            required
                            minLength="2"
                            maxLength="30"
                            placeholder="e.g., Dog, Cat, Bird"
                        />
                    </div>

                    <div className="form-group">
                        <label>Age *</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            required
                            min="0"
                            max="50"
                            placeholder="Pet's age in years"
                        />
                    </div>

                    <div className="form-group">
                        <label>Breed</label>
                        <input
                            type="text"
                            name="breed"
                            value={formData.breed}
                            onChange={handleChange}
                            maxLength="50"
                            placeholder="Optional"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength="500"
                            rows="4"
                            placeholder="Tell us about this pet..."
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-btn">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? 'Saving...' : (pet ? 'Update Pet' : 'Add Pet')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PetForm;
