import { useState } from 'react';
import { STATUS } from '../../constants/activityStatuses';
import { formatDate } from '../../utils/formatDate';

export default function SharedActivities({ planId, activities, setActivities, canEdit, sharedApi }) {
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({
        name: '', date: '', time: '09:00:00', location: '',
        description: '', estimatedCost: '', status: 'planned'
    });

    const resetForm = () => {
        setForm({ name: '', date: '', time: '09:00:00', location: '', description: '', estimatedCost: '', status: 'planned' });
        setEditItem(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.date) {
            alert('Naziv i datum su obavezni');
            return;
        }
        try {
            const payload = { ...form, estimatedCost: Number(form.estimatedCost) || 0 };
            if (editItem) {
                const res = await sharedApi.put(`/travel-plans/${planId}/activities/${editItem.id}`, payload);
                setActivities(prev => prev.map(a => a.id === editItem.id ? res.data : a));
            } else {
                const res = await sharedApi.post(`/travel-plans/${planId}/activities`, payload);
                setActivities(prev => [...prev, res.data]);
            }
            resetForm();
        } catch {
            alert('Greška pri čuvanju aktivnosti');
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati aktivnost?')) return;
        try {
            await sharedApi.delete(`/travel-plans/${planId}/activities/${id}`);
            setActivities(prev => prev.filter(a => a.id !== id));
        } catch {
            alert('Greška pri brisanju aktivnosti');
        }
    };

    return (
        <div className="tab-section" style={{ marginBottom: '1rem' }}>
            <div className="tab-section-header">
                <div>
                    <h2>Aktivnosti</h2>
                    <p className="muted-text">{activities.length} aktivnosti</p>
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
                                placeholder="Npr. Posjet muzeju"
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="planned">Planirano</option>
                                <option value="reserved">Rezervisano</option>
                                <option value="completed">Završeno</option>
                                <option value="cancelled">Otkazano</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Datum *</label>
                            <input type="date" value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Vrijeme</label>
                            <input type="time" value={form.time?.substring(0, 5)}
                                onChange={e => setForm({ ...form, time: e.target.value + ':00' })} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Lokacija</label>
                            <input value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                placeholder="Npr. Atina" />
                        </div>
                        <div className="form-group">
                            <label>Trošak (€)</label>
                            <input type="number" min="0" value={form.estimatedCost}
                                onChange={e => setForm({ ...form, estimatedCost: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Opis</label>
                        <input value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Kratki opis..." />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={resetForm}>Otkaži</button>
                        <button type="submit" className="btn-primary">{editItem ? 'Sačuvaj' : 'Dodaj'}</button>
                    </div>
                </form>
            )}

            {activities.length === 0 ? (
                <p className="empty-text">Nema aktivnosti.</p>
            ) : (
                <div className="items-list">
                    {[...activities]
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(a => {
                            const status = STATUS[a.status] || STATUS.planned;
                            return (
                                <div key={a.id} className="item-card" style={{
                                    borderLeft: `3px solid ${status.color}`,
                                    borderRadius: '0 12px 12px 0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.name}</span>
                                                <span style={{
                                                    fontSize: '0.72rem', fontWeight: 700,
                                                    padding: '2px 8px', borderRadius: '999px',
                                                    background: `${status.color}18`, color: status.color
                                                }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
                                                <span>{formatDate(a.date)} {a.time?.substring(0, 5)}</span>
                                                {a.location && <span>{a.location}</span>}
                                                {a.estimatedCost > 0 && (
                                                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{a.estimatedCost} €</span>
                                                )}
                                            </div>
                                            {a.description && (
                                                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', marginTop: '0.3rem' }}>
                                                    {a.description}
                                                </p>
                                            )}
                                        </div>
                                        {canEdit && (
                                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                <button className="icon-btn edit" onClick={() => {
                                                    setEditItem(a);
                                                    setForm({
                                                        name: a.name, date: a.date?.split('T')[0] || '',
                                                        time: a.time || '09:00:00', location: a.location || '',
                                                        description: a.description || '',
                                                        estimatedCost: a.estimatedCost || '', status: a.status || 'planned'
                                                    });
                                                    setShowForm(true);
                                                }}>✎</button>
                                                <button className="icon-btn delete" onClick={() => handleDelete(a.id)}>×</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}