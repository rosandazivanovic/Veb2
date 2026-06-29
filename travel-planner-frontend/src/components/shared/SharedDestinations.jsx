import { useState } from 'react';
import { formatDate } from '../../utils/formatDate';


export default function SharedDestinations({ planId, destinations, setDestinations, canEdit, sharedApi }) {
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({
        name: '', location: '', arrivalDate: '', departureDate: '', description: '', notes: ''
    });

    const resetForm = () => {
        setForm({ name: '', location: '', arrivalDate: '', departureDate: '', description: '', notes: '' });
        setEditItem(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) {
            alert('Naziv je obavezan');
            return;
        }
        if (!form.arrivalDate || !form.departureDate) {
            alert('Datumi dolaska i odlaska su obavezni');
            return;
        }
        if (form.departureDate < form.arrivalDate) {
            alert('Datum odlaska ne može biti prije dolaska');
            return;
        }
        try {
            if (editItem) {
                const res = await sharedApi.put(`/travel-plans/${planId}/destinations/${editItem.id}`, form);
                setDestinations(prev => prev.map(d => d.id === editItem.id ? res.data : d));
            } else {
                const res = await sharedApi.post(`/travel-plans/${planId}/destinations`, form);
                setDestinations(prev => [...prev, res.data]);
            }
            resetForm();
        } catch {
            alert('Greška pri čuvanju destinacije');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati destinaciju?')) return;
        try {
            await sharedApi.delete(`/travel-plans/${planId}/destinations/${id}`);
            setDestinations(prev => prev.filter(d => d.id !== id));
        } catch {
            alert('Greška pri brisanju destinacije');
        }
    };

    return (
        <div className="tab-section" style={{ marginBottom: '1rem' }}>
            <div className="tab-section-header">
                <div>
                    <h2>Destinacije</h2>
                    <p className="muted-text">{destinations.length} destinacija</p>
                </div>
                {canEdit && (
                    <button
                        className="btn-primary"
                        onClick={() => { resetForm(); setShowForm(v => !v); }}
                        style={{ fontSize: '0.85rem' }}
                    >
                        + Dodaj
                    </button>
                )}
            </div>

            {canEdit && showForm && (
                <form className="inline-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Naziv *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Npr. Sidari"
                            />
                        </div>
                        <div className="form-group">
                            <label>Lokacija</label>
                            <input
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                placeholder="Npr. Krf, Grčka"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Datum dolaska *</label>
                            <input
                                type="date"
                                value={form.arrivalDate}
                                onChange={e => setForm({ ...form, arrivalDate: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Datum odlaska *</label>
                            <input
                                type="date"
                                value={form.departureDate}
                                onChange={e => setForm({ ...form, departureDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Opis</label>
                        <input
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Kratki opis..."
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={resetForm}>Otkaži</button>
                        <button type="submit" className="btn-primary">
                            {editItem ? 'Sačuvaj' : 'Dodaj'}
                        </button>
                    </div>
                </form>
            )}

            {destinations.length === 0 ? (
                <p className="empty-text">Nema destinacija.</p>
            ) : (
                <div className="destination-grid">
                    {destinations.map(d => (
                        <div key={d.id} className="destination-card">
                            <div className="destination-top">
                                <div className="destination-title">{d.name}</div>
                                {canEdit && (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            className="icon-btn edit"
                                            onClick={() => {
                                                setEditItem(d);
                                                setForm({
                                                    name: d.name,
                                                    location: d.location || '',
                                                    arrivalDate: d.arrivalDate?.split('T')[0] || '',
                                                    departureDate: d.departureDate?.split('T')[0] || '',
                                                    description: d.description || '',
                                                    notes: d.notes || ''
                                                });
                                                setShowForm(true);
                                            }}
                                        >
                                            ✎
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(d.id)}>
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                            {d.location && <div className="destination-line">{d.location}</div>}
                            <div className="destination-line" style={{ fontSize: '0.8rem' }}>
                                {formatDate(d.arrivalDate)} — {formatDate(d.departureDate)}
                            </div>
                            {d.description && <p className="destination-desc">{d.description}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}