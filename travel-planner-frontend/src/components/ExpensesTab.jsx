import { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { useExpenses } from '../hooks/useExpenses';
import { createExpenseModel } from '../models/TravelPlan';
import { CATEGORY_META, CATEGORIES } from '../constants/expenseCategories';
import { formatDate } from '../utils/formatDate';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
export default function ExpensesTab({ planId, plan }) {
    const { expenses, loading, error, addExpense, updateExpense, deleteExpense } = useExpenses(planId);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({ ...createExpenseModel(), amount: '' });
    const [errors, setErrors] = useState({});
    const { toast, showToast, hideToast } = useToast();

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = plan?.budget || 0;
    const remaining = budget - totalSpent;
    const budgetPercent = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;
    const budgetColor = budgetPercent > 90 ? '#e74c3c' : budgetPercent > 70 ? '#f59e0b' : '#10b981';

    const resetForm = () => {
        setFormData({ ...createExpenseModel(), amount: '' });
        setErrors({});
        setEditItem(null);
        setShowForm(false);
    };

    const handleEdit = (expense) => {
        setFormData({
            ...createExpenseModel(expense),
            date: expense.date?.split('T')[0] || '',
        });
        setEditItem(expense);
        setShowForm(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Naziv je obavezan';
        if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'Iznos mora biti veći od 0';
        if (!formData.date) newErrors.date = 'Datum je obavezan';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        try {
            const payload = { ...formData, amount: Number(formData.amount) };
            if (editItem) {
                await updateExpense(editItem.id, payload);
                showToast('Trošak uspješno ažuriran');
            } else {
                await addExpense(payload);
                showToast('Trošak uspješno dodan');
            }
            resetForm();
        } catch (err) {
            showToast(err.response?.data?.message || 'Greška pri čuvanju troška', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati trošak?')) return;
        try {
            await deleteExpense(id);
            showToast('Trošak uspješno obrisan');
        } catch (err) {
            showToast(err.response?.data?.message || 'Greška pri brisanju', 'error');
        }
    };

    if (loading) return (
        <div className="empty-state">
            <p style={{ color: 'var(--muted)' }}>Učitavanje...</p>
        </div>
    );

    if (error) return (
        <div className="empty-state">
            <p style={{ color: '#e74c3c' }}>{error}</p>
        </div>
    );

    return (
        <div className="tab-section">
            <div className="tab-section-header">
                <div>
                    <h2>Troškovi</h2>
                    <p className="muted-text">Evidencija svih troškova putovanja</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    <FiPlus size={15} />
                    Dodaj trošak
                </button>
            </div>


            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem'
            }}>
                {[
                    { label: 'Ukupan budžet', value: `${budget.toFixed(2)} €`, color: '#6366f1', bg: '#eef2ff' },
                    { label: 'Potrošeno', value: `${totalSpent.toFixed(2)} €`, color: budgetColor, bg: '#f1f5f9', progress: budgetPercent },
                    { label: 'Preostalo', value: `${remaining.toFixed(2)} €`, color: budgetColor, bg: '#f1f5f9' },
                ].map(({ label, value, color, bg, progress }) => (
                    <div key={label} style={{
                        background: 'white',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem'
                    }}>
                        <div style={{
                            fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)',
                            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem'
                        }}>
                            {label}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color }}>
                            {value}
                        </div>
                        {progress != null && (
                            <div style={{ height: 3, background: bg, borderRadius: 999, marginTop: '0.4rem' }}>
                                <div style={{
                                    height: '100%', width: `${progress}%`,
                                    background: color, borderRadius: 999, transition: 'width 0.4s ease'
                                }} />
                            </div>
                        )}
                    </div>
                ))}
            </div>


            {showForm && (
                <form className="inline-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Naziv *</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Npr. Avionska karta"
                            />
                            {errors.name && <span className="error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label>Kategorija</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Iznos (€) *</label>
                            <input
                                type="number" value={formData.amount} min="0" step="0.01"
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                            />
                            {errors.amount && <span className="error">{errors.amount}</span>}
                        </div>
                        <div className="form-group">
                            <label>Datum *</label>
                            <input
                                type="date" value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                            {errors.date && <span className="error">{errors.date}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Opis</label>
                        <input
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Opis troška..."
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={resetForm}>Otkaži</button>
                        <button type="submit" className="btn-primary">
                            {editItem ? 'Sačuvaj izmjene' : 'Dodaj trošak'}
                        </button>
                    </div>
                </form>
            )}

            
            {expenses.length === 0 ? (
                <div className="empty-text">
                    <p>Nema troškova. Dodajte prvi trošak.</p>
                </div>
            ) : (
                <div className="items-list">
                    {expenses
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map(expense => {
                            const cat = CATEGORY_META[expense.category] || CATEGORY_META.other;
                            return (
                                <div key={expense.id} className="item-card" style={{
                                    borderLeft: `3px solid ${cat.color}`,
                                    borderRadius: '0 12px 12px 0'
                                }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'flex-start',
                                        justifyContent: 'space-between', gap: '1rem'
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center',
                                                gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem'
                                            }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                                                    {expense.name}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                                                    borderRadius: '999px', background: cat.bg, color: cat.color
                                                }}>
                                                    {cat.label}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                                                {formatDate(expense.date)}
                                                {expense.description && (
                                                    <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>
                                                        — {expense.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>
                                                {expense.amount.toFixed(2)} €
                                            </span>
                                            <button className="icon-btn edit" onClick={() => handleEdit(expense)} title="Uredi">
                                                <FiEdit2 size={14} />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(expense.id)} title="Obriši">
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        paddingTop: '0.75rem', borderTop: '1px solid var(--line)', marginTop: '0.25rem'
                    }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--muted)', marginRight: '0.5rem', alignSelf: 'center' }}>
                            Ukupno:
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: budgetColor }}>
                            {totalSpent.toFixed(2)} €
                        </span>
                    </div>
                </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}