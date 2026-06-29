import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiClock, FiCalendar } from 'react-icons/fi';
import { useActivities } from '../hooks/useActivities';
import { createActivityModel } from '../models/TravelPlan';
import { STATUS } from '../constants/activityStatuses';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

const WEEKDAYS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const formatDayLabel = (dateStr) => {
    const d = new Date(dateStr);
    const days = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun',
        'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`;
};

const buildCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
};

export default function ActivitiesTab({ planId }) {
    const { activities, loading, addActivity, updateActivity, deleteActivity } = useActivities(planId);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [formData, setFormData] = useState({ ...createActivityModel(), time: '09:00:00', estimatedCost: '' });
    const [errors, setErrors] = useState({});
    const { toast, showToast, hideToast } = useToast();

    const resetForm = () => {
        setFormData({ ...createActivityModel(), time: '09:00:00', estimatedCost: '' });
        setErrors({});
        setEditItem(null);
        setShowForm(false);
    };

    const handleEdit = (activity) => {
        setFormData({
            ...createActivityModel(activity),
            date: activity.date?.split('T')[0],
            time: activity.time || '09:00:00',
            estimatedCost: activity.estimatedCost || ''
        });
        setEditItem(activity);
        setShowForm(true);
    };

    const handleAddOnDate = (dateKey) => {
        setFormData({ ...createActivityModel(), time: '09:00:00', estimatedCost: '', date: dateKey });
        setEditItem(null);
        setShowForm(true);
        setViewMode('list');
    };

    const validate = () => {
        const err = {};
        if (!formData.name) err.name = 'Naziv je obavezan';
        if (!formData.date) err.date = 'Datum je obavezan';
        if (formData.estimatedCost !== '' && Number(formData.estimatedCost) < 0)
            err.estimatedCost = 'Trošak ne može biti negativan';
        return err;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }
        try {
            const payload = { ...formData, estimatedCost: Number(formData.estimatedCost) || 0 };
            if (editItem) {
                await updateActivity(editItem.id, payload);
                showToast('Aktivnost uspješno ažurirana');
            } else {
                await addActivity(payload);
                showToast('Aktivnost uspješno dodana');
            }
            resetForm();
        } catch (err) {
            showToast(err.response?.data?.message || 'Greška pri čuvanju aktivnosti', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati aktivnost?')) return;
        try {
            await deleteActivity(id);
            showToast('Aktivnost uspješno obrisana');
        } catch (err) {
            showToast(err.response?.data?.message || 'Greška pri brisanju', 'error');
        }
    };

    const grouped = activities.reduce((acc, a) => {
        const date = a.date?.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(a);
        return acc;
    }, {});

    const shiftMonth = (delta) =>
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

    const calendarDays = buildCalendarDays(calendarDate);
    const todayKey = formatDateKey(new Date());

    if (loading) return (
        <div className="empty-state">
            <p style={{ color: 'var(--muted)' }}>Učitavanje...</p>
        </div>
    );

    return (
        <div className="tab-section">
            <div className="tab-section-header">
                <div>
                    <h2>Aktivnosti</h2>
                    <p className="muted-text">Raspored po danima</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
                        {['list', 'calendar'].map(mode => (
                            <button key={mode} type="button" onClick={() => setViewMode(mode)} style={{
                                background: viewMode === mode ? 'var(--text)' : 'transparent',
                                color: viewMode === mode ? 'white' : 'var(--muted)',
                                border: 'none', padding: '0.4rem 0.85rem', fontSize: '0.82rem',
                                fontWeight: viewMode === mode ? 700 : 400, cursor: 'pointer',
                                transition: 'all 0.15s', borderRadius: 0
                            }}>
                                {mode === 'list' ? 'Lista' : 'Kalendar'}
                            </button>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={() => setShowForm(v => !v)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiPlus size={15} />
                        Dodaj aktivnost
                    </button>
                </div>
            </div>

            {showForm && (
                <form className="inline-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Naziv *</label>
                            <input value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Npr. Posjet muzeju" />
                            {errors.name && <span className="error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}>
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
                            <input type="date" value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            {errors.date && <span className="error">{errors.date}</span>}
                        </div>
                        <div className="form-group">
                            <label>Vrijeme</label>
                            <input type="time" value={formData.time?.substring(0, 5)}
                                onChange={e => setFormData({ ...formData, time: e.target.value + ':00' })} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Lokacija</label>
                            <input value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Npr. Atina" />
                        </div>
                        <div className="form-group">
                            <label>Trošak (€)</label>
                            <input type="number" min="0" value={formData.estimatedCost}
                                onChange={e => setFormData({ ...formData, estimatedCost: e.target.value })} />
                            {errors.estimatedCost && <span className="error">{errors.estimatedCost}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Opis</label>
                        <textarea value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={resetForm}>Otkaži</button>
                        <button type="submit" className="btn-primary">
                            {editItem ? 'Sačuvaj izmjene' : 'Dodaj'}
                        </button>
                    </div>
                </form>
            )}

            {viewMode === 'list' && (
                activities.length === 0 ? (
                    <div className="empty-text"><p>Nema aktivnosti. Dodajte prvu aktivnost.</p></div>
                ) : (
                    Object.entries(grouped).sort().map(([date, items]) => (
                        <div key={date} className="day-group">
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginBottom: '0.75rem', paddingBottom: '0.4rem',
                                borderBottom: '1px solid var(--line)'
                            }}>
                                <FiCalendar size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                <span style={{
                                    fontSize: '0.85rem', fontWeight: 700,
                                    color: 'var(--text)', textTransform: 'capitalize'
                                }}>
                                    {formatDayLabel(date)}
                                </span>
                            </div>
                            {items.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(a => {
                                const status = STATUS[a.status];
                                return (
                                    <div key={a.id} className="item-card" style={{
                                        borderLeft: `3px solid ${status.color}`,
                                        borderRadius: '0 12px 12px 0', marginBottom: '0.6rem'
                                    }}>
                                        <div className="item-card-header">
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center',
                                                    gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem'
                                                }}>
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)' }}>
                                                        {a.name}
                                                    </h4>
                                                    <span style={{
                                                        fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                                                        borderRadius: '999px', background: `${status.color}18`, color: status.color
                                                    }}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex', gap: '1rem', flexWrap: 'wrap',
                                                    fontSize: '0.82rem', color: 'var(--muted)'
                                                }}>
                                                    {a.time && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FiClock size={12} />{a.time?.substring(0, 5)}
                                                        </span>
                                                    )}
                                                    {a.location && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FiMapPin size={12} />{a.location}
                                                        </span>
                                                    )}
                                                    {a.estimatedCost > 0 && (
                                                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                                                            {a.estimatedCost} €
                                                        </span>
                                                    )}
                                                </div>
                                                {a.description && (
                                                    <p style={{
                                                        margin: '0.4rem 0 0', fontSize: '0.85rem',
                                                        color: 'var(--muted)', fontStyle: 'italic'
                                                    }}>
                                                        {a.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="item-actions">
                                                <button className="icon-btn edit" onClick={() => handleEdit(a)} title="Uredi">
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button className="icon-btn delete" onClick={() => handleDelete(a.id)} title="Obriši">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )
            )}

            {viewMode === 'calendar' && (
                <div style={{ marginTop: '1rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', marginBottom: '1rem'
                    }}>
                        <button type="button" className="btn-secondary"
                            onClick={() => shiftMonth(-1)} style={{ fontSize: '0.85rem' }}>
                            ‹ Prethodni
                        </button>
                        <span style={{
                            fontWeight: 700, fontSize: '0.95rem',
                            color: 'var(--text)', textTransform: 'capitalize'
                        }}>
                            {calendarDate.toLocaleDateString('hr', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" className="btn-secondary"
                            onClick={() => shiftMonth(1)} style={{ fontSize: '0.85rem' }}>
                            Sljedeći ›
                        </button>
                    </div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px', textAlign: 'center', marginBottom: '6px'
                    }}>
                        {WEEKDAYS.map(d => (
                            <div key={d} style={{
                                fontSize: '0.75rem', fontWeight: 700,
                                color: 'var(--muted)', padding: '4px 0'
                            }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                        {calendarDays.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} />;
                            const key = formatDateKey(day);
                            const dayActivities = activities.filter(a => a.date?.split('T')[0] === key);
                            const isToday = key === todayKey;
                            return (
                                <div key={key} onClick={() => handleAddOnDate(key)} style={{
                                    minHeight: '80px',
                                    border: isToday ? '2px solid var(--primary)' : '1px solid var(--line)',
                                    borderRadius: '8px', padding: '6px', cursor: 'pointer',
                                    background: 'white', transition: 'border-color 0.15s'
                                }}
                                    onMouseEnter={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--primary-soft)'; }}
                                    onMouseLeave={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--line)'; }}
                                >
                                    <div style={{
                                        fontSize: '0.78rem', fontWeight: isToday ? 800 : 600,
                                        color: isToday ? 'var(--primary)' : 'var(--text)', marginBottom: '4px'
                                    }}>
                                        {day.getDate()}
                                    </div>
                                    {dayActivities.map(a => {
                                        const status = STATUS[a.status];
                                        return (
                                            <div key={a.id} title={a.name}
                                                onClick={e => { e.stopPropagation(); handleEdit(a); }}
                                                style={{
                                                    fontSize: '0.68rem', background: `${status.color}18`,
                                                    color: status.color, borderRadius: '4px', padding: '2px 4px',
                                                    marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap', fontWeight: 600
                                                }}>
                                                {a.time?.substring(0, 5)} {a.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}