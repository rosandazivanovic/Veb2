import { useState } from 'react';
import { CATEGORY_META } from '../../constants/expenseCategories';
import { formatDate } from '../../utils/formatDate';

export default function SharedExpenses({ planId, expenses, setExpenses, canEdit, sharedApi }) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '', category: 'other', amount: '', date: '', description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.amount || !form.date) {
            alert('Naziv, iznos i datum su obavezni');
            return;
        }
        try {
            const res = await sharedApi.post(`/travel-plans/${planId}/expenses`, {
                ...form, amount: Number(form.amount)
            });
            setExpenses(prev => [...prev, res.data]);
            setForm({ name: '', category: 'other', amount: '', date: '', description: '' });
            setShowForm(false);
        } catch {
            alert('Greška pri dodavanju troška');
        }
    };

    return (
        <div className="tab-section" style={{ marginBottom: '1rem' }}>
            <div className="tab-section-header">
                <div>
                    <h2>Troškovi</h2>
                    <p className="muted-text">{expenses.length} stavki</p>
                </div>
                {canEdit && (
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize: '0.85rem' }}>
                        + Dodaj trošak
                    </button>
                )}
            </div>

            {canEdit && showForm && (
                <form className="inline-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Naziv *</label>
                            <input value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="Npr. Restoran" />
                        </div>
                        <div className="form-group">
                            <label>Kategorija</label>
                            <select value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}>
                                {Object.entries(CATEGORY_META).map(([val, { label }]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Iznos (€) *</label>
                            <input type="number" min="0" step="0.01" value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label>Datum *</label>
                            <input type="date" value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Opis</label>
                        <input value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Opis troška..." />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Otkaži</button>
                        <button type="submit" className="btn-primary">Dodaj trošak</button>
                    </div>
                </form>
            )}

            {expenses.length === 0 ? (
                <p className="empty-text">Nema troškova.</p>
            ) : (
                <div className="items-list" style={{ marginTop: '1rem' }}>
                    {expenses.map(e => {
                        const cat = CATEGORY_META[e.category] || CATEGORY_META.other;
                        return (
                            <div key={e.id} className="item-card" style={{
                                borderLeft: `3px solid ${cat.color}`,
                                borderRadius: '0 12px 12px 0'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{e.name}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                                                borderRadius: '999px', background: cat.bg, color: cat.color
                                            }}>
                                                {cat.label}
                                            </span>
                                            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{formatDate(e.date)}</span>
                                        </div>
                                        {e.description && (
                                            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                                                {e.description}
                                            </p>
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', flexShrink: 0 }}>
                                        {e.amount.toFixed(2)} €
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}