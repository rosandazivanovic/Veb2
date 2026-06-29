import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useChecklist } from '../hooks/useChecklist';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
export default function ChecklistTab({ planId }) {
    const { items, loading, addItem, toggleItem, deleteItem } = useChecklist(planId);
    const [newItem, setNewItem] = useState('');
    const { toast, showToast, hideToast } = useToast();

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        try {
            await addItem(newItem);
            setNewItem('');
            showToast('Stavka uspješno dodana');
        } catch (err) {
            showToast(err.response?.data?.message || 'Greška pri dodavanju stavke', 'error');
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleItem(id);
        } catch (err) {
            alert(err.response?.data?.message || 'Greška pri ažuriranju stavke');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteItem(id);
            showToast('Stavka uspješno obrisana');
        } catch (err) {
            showToast(err.response?.data?.message || 'Greška pri brisanju stavke', 'error');
        }
    };

    const completed = items.filter(i => i.isCompleted).length;
    const progressPercent = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

    if (loading) return (
        <div className="empty-state">
            <p style={{ color: 'var(--muted)' }}>Učitavanje...</p>
        </div>
    );

    return (
        <div className="tab-section">
            <div className="tab-section-header">
                <div>
                    <h2>Checklist / Packing lista</h2>
                    <p className="muted-text">Stvari i obaveze prije polaska</p>
                </div>
                {items.length > 0 && (
                    <span style={{
                        fontSize: '0.82rem', fontWeight: 700,
                        color: progressPercent === 100 ? '#10b981' : 'var(--muted)',
                        background: progressPercent === 100 ? '#d1fae5' : 'var(--line)',
                        padding: '4px 12px', borderRadius: '999px'
                    }}>
                        {completed}/{items.length} završeno
                    </span>
                )}
            </div>

            {items.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ height: '4px', background: 'var(--line)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', width: `${progressPercent}%`,
                            background: progressPercent === 100 ? '#10b981' : 'var(--primary)',
                            borderRadius: '999px', transition: 'width 0.4s ease'
                        }} />
                    </div>
                </div>
            )}

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <input
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="Dodaj stavku (npr. Pasoš, Punjač...)"
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                    <FiPlus size={15} />
                    Dodaj
                </button>
            </form>

            {items.length === 0 ? (
                <div className="empty-text"><p>Lista je prazna. Dodajte prve stavke.</p></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[...items]
                        .sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
                        .map(item => (
                            <div key={item.id} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.7rem 1rem', border: '1px solid var(--line)',
                                borderLeft: item.isCompleted ? '3px solid #10b981' : '3px solid var(--primary)',
                                borderRadius: '0 12px 12px 0',
                                background: item.isCompleted ? '#fbfaf9' : 'white', transition: 'all 0.2s'
                            }}>
                                <input type="checkbox" checked={item.isCompleted}
                                    onChange={() => handleToggle(item.id)}
                                    style={{
                                        width: '17px', height: '17px', cursor: 'pointer',
                                        accentColor: item.isCompleted ? '#10b981' : 'var(--primary)', flexShrink: 0
                                    }}
                                />
                                <span style={{
                                    flex: 1, fontSize: '0.92rem',
                                    color: item.isCompleted ? 'var(--muted)' : 'var(--text)',
                                    textDecoration: item.isCompleted ? 'line-through' : 'none', transition: 'all 0.2s'
                                }}>
                                    {item.name}
                                </span>
                                <button onClick={() => handleDelete(item.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--muted)', fontSize: '1rem', lineHeight: 1,
                                    padding: '0.15rem', borderRadius: '4px', opacity: 0.4, transition: 'opacity 0.2s', flexShrink: 0
                                }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                                    title="Obriši stavku">
                                    ×
                                </button>
                            </div>
                        ))}
                </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}