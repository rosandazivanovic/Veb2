import { useState } from 'react';

export default function SharedChecklist({ planId, checklistItems, setChecklistItems, canEdit, sharedApi }) {
    const [newItem, setNewItem] = useState('');

    const completed = checklistItems.filter(c => c.isCompleted).length;
    const progressPercent = checklistItems.length > 0
        ? Math.round((completed / checklistItems.length) * 100)
        : 0;

    const handleToggle = async (id) => {
        try {
            const res = await sharedApi.patch(`/travel-plans/${planId}/checklist/${id}/toggle`);
            setChecklistItems(prev => prev.map(c => c.id === id ? res.data : c));
        } catch {
            alert('Greška pri ažuriranju stavke');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        try {
            const res = await sharedApi.post(`/travel-plans/${planId}/checklist`, { name: newItem });
            setChecklistItems(prev => [...prev, res.data]);
            setNewItem('');
        } catch {
            alert('Greška pri dodavanju stavke');
        }
    };

    const handleDelete = async (id) => {
        try {
            await sharedApi.delete(`/travel-plans/${planId}/checklist/${id}`);
            setChecklistItems(prev => prev.filter(c => c.id !== id));
        } catch {
            alert('Greška pri brisanju stavke');
        }
    };

    return (
        <div className="tab-section">
            <div className="tab-section-header">
                <div>
                    <h2>Checklist</h2>
                    <p className="muted-text">{completed}/{checklistItems.length} završeno</p>
                </div>
            </div>

            {checklistItems.length > 0 && (
                <div style={{ height: '4px', background: 'var(--line)', borderRadius: '999px', marginBottom: '1rem', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${progressPercent}%`,
                        background: progressPercent === 100 ? '#10b981' : 'var(--primary)',
                        borderRadius: '999px', transition: 'width 0.4s ease'
                    }} />
                </div>
            )}

            {canEdit && (
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                    <input
                        value={newItem}
                        onChange={e => setNewItem(e.target.value)}
                        placeholder="Dodaj stavku..."
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>Dodaj</button>
                </form>
            )}

            {checklistItems.length === 0 ? (
                <p className="empty-text">Lista je prazna.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[...checklistItems]
                        .sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted))
                        .map(c => (
                            <div key={c.id} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.7rem 1rem', border: '1px solid var(--line)',
                                borderLeft: c.isCompleted ? '3px solid #10b981' : '3px solid var(--primary)',
                                borderRadius: '0 12px 12px 0',
                                background: c.isCompleted ? '#fbfaf9' : 'white', transition: 'all 0.2s'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={c.isCompleted}
                                    onChange={() => canEdit ? handleToggle(c.id) : null}
                                    readOnly={!canEdit}
                                    style={{
                                        width: '17px', height: '17px',
                                        cursor: canEdit ? 'pointer' : 'default',
                                        accentColor: c.isCompleted ? '#10b981' : 'var(--primary)',
                                        flexShrink: 0
                                    }}
                                />
                                <span style={{
                                    flex: 1, fontSize: '0.92rem',
                                    color: c.isCompleted ? 'var(--muted)' : 'var(--text)',
                                    textDecoration: c.isCompleted ? 'line-through' : 'none'
                                }}>
                                    {c.name}
                                </span>
                                {canEdit && (
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--muted)', fontSize: '1rem', opacity: 0.4,
                                            transition: 'opacity 0.2s', flexShrink: 0
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}