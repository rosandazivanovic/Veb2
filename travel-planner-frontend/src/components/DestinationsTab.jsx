import { useState, useEffect } from 'react';
import { FiMapPin, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import destinationService from '../services/destinationService';
import { createDestinationModel } from '../models/TravelPlan';
import { formatDate } from '../utils/formatDate';


export default function DestinationsTab({ planId }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState(createDestinationModel());
    const [errors, setErrors] = useState({});

    useEffect(() => {
        let mounted = true;
        destinationService
            .getAll(planId)
            .then(res => {
                if (mounted) setDestinations(res.data);
            })
            .catch((err) => alert(err.response?.data?.message || 'Greška pri učitavanju destinacija'))
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, [planId]);

    const resetForm = () => {
        setFormData(createDestinationModel());
        setErrors({});
        setEditItem(null);
        setShowForm(false);
    };

    const handleEdit = (dest) => {
        setFormData({
            ...createDestinationModel(dest),
            arrivalDate: dest.arrivalDate ? dest.arrivalDate.split('T')[0] : '',
            departureDate: dest.departureDate ? dest.departureDate.split('T')[0] : '',
        });
        setEditItem(dest);
        setShowForm(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Naziv je obavezan';
        if (!formData.arrivalDate) newErrors.arrivalDate = 'Datum dolaska je obavezan';
        if (!formData.departureDate) newErrors.departureDate = 'Datum odlaska je obavezan';
        if (formData.arrivalDate && formData.departureDate && formData.departureDate < formData.arrivalDate) {
            newErrors.departureDate = 'Datum odlaska ne može biti prije dolaska';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            if (editItem) {
                const res = await destinationService.update(planId, editItem.id, formData);
                setDestinations(prev => prev.map(d => (d.id === editItem.id ? res.data : d)));
            } else {
                const res = await destinationService.create(planId, formData);
                setDestinations(prev => [...prev, res.data]);
            }
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || 'Greška pri čuvanju destinacije');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati destinaciju?')) return;
        try {
            await destinationService.delete(planId, id);
            setDestinations(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Greška pri brisanju');
        }
    };

    if (loading) return <p className="loading">Učitavanje...</p>;

    return (
        <div className="tab-section">
            <div className="tab-section-header">
                <div>
                    <h2>Destinacije</h2>
                    <p className="muted-text">Mjesta koja posjećujete tokom putovanja</p>
                </div>
                <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setShowForm(prev => !prev)}
                >
                    + Dodaj destinaciju
                </button>
            </div>

            {showForm && (
                <div className="form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Naziv *</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Npr. Atina"
                                />
                                {errors.name && <span className="error">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label>Lokacija</label>
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Npr. Grčka"
                                />
                            </div>

                            <div className="form-group">
                                <label>Datum dolaska *</label>
                                <input
                                    type="date"
                                    value={formData.arrivalDate}
                                    onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })}
                                />
                                {errors.arrivalDate && <span className="error">{errors.arrivalDate}</span>}
                            </div>

                            <div className="form-group">
                                <label>Datum odlaska *</label>
                                <input
                                    type="date"
                                    value={formData.departureDate}
                                    onChange={e => setFormData({ ...formData, departureDate: e.target.value })}
                                />
                                {errors.departureDate && <span className="error">{errors.departureDate}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Opis</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Opis destinacije..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Napomene</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Dodatne napomene..."
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Otkaži
                            </button>
                            <button type="submit" className="btn-primary">
                                {editItem ? 'Sačuvaj izmjene' : 'Dodaj'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {destinations.length === 0 ? (
                <div className="empty-state">
                    <p>Nema destinacija. Dodajte prvu!</p>
                </div>
            ) : (
                <div className="destination-grid">
                    {destinations.map(dest => (
                        <div key={dest.id} className="destination-card">
                            <div className="destination-top">
                                <h3 className="destination-title">
                                    <FiMapPin className="icon" />
                                    {dest.name}
                                </h3>
                                <div className="item-actions">
                                    <button
                                        type="button"
                                        className="icon-btn edit"
                                        onClick={() => handleEdit(dest)}
                                        aria-label="Uredi destinaciju"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        type="button"
                                        className="icon-btn delete"
                                        onClick={() => handleDelete(dest.id)}
                                        aria-label="Obriši destinaciju"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>

                            {dest.location && (
                                <p className="destination-line">
                                    <FiMapPin className="icon-muted" />
                                    {dest.location}
                                </p>
                            )}

                            <p className="destination-line">
                                <FiCalendar className="icon-muted" />
                                {formatDate(dest.arrivalDate)} — {formatDate(dest.departureDate)}
                            </p>

                            {dest.description && (
                                <p className="destination-desc">{dest.description}</p>
                            )}

                            {dest.notes && (
                                <p className="destination-notes">{dest.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}