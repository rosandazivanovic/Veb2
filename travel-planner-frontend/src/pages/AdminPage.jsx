import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiGrid, FiUsers } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import UsersTab from '../components/UsersTab';
import travelPlanService from '../services/travelPlanService';
import AdminPlanCard from '../components/AdminPlanCard';
export default function AdminPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'users' ? 'users' : 'plans';

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const switchTab = (tab) => {
        setSearchParams(tab === 'users' ? { tab: 'users' } : {});
    };

    useEffect(() => {
        travelPlanService.getAll()
            .then(res => setPlans(res.data || []))
            .catch((err) => setError(err.response?.data?.message || 'Greška pri učitavanju podataka'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Da li ste sigurni da želite obrisati ovaj plan?')) return;
        try {
            await travelPlanService.delete(id);
            setPlans(prev => prev.filter(plan => plan.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Greška pri brisanju plana');
        }
    };


    const filteredPlans = useMemo(() => {
        let result = [...plans];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(plan =>
                plan.title?.toLowerCase().includes(q) ||
                plan.description?.toLowerCase().includes(q)
            );
        }
        result.sort((a, b) => {
            const dateA = new Date(a.startDate || 0).getTime();
            const dateB = new Date(b.startDate || 0).getTime();
            if (sortBy === 'newest') return dateB - dateA;
            if (sortBy === 'oldest') return dateA - dateB;
            if (sortBy === 'budget-high') return (b.budget || 0) - (a.budget || 0);
            if (sortBy === 'budget-low') return (a.budget || 0) - (b.budget || 0);
            return 0;
        });
        return result;
    }, [plans, search, sortBy]);

    const stats = useMemo(() => {
        const totalBudget = plans.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
        const totalSpent = plans.reduce((sum, p) => sum + (Number(p.totalSpent) || 0), 0);
        return {
            totalPlans: plans.length,
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent
        };
    }, [plans]);

    const statCards = [
        { label: 'Ukupno planova', value: stats.totalPlans, accent: '#6366f1', bg: '#eef2ff' },
        { label: 'Ukupan budžet', value: `${stats.totalBudget.toFixed(2)} €`, accent: '#0ea5e9', bg: '#e0f2fe' },
        { label: 'Potrošeno', value: `${stats.totalSpent.toFixed(2)} €`, accent: '#f59e0b', bg: '#fef3c7' },
        { label: 'Preostalo', value: `${stats.remaining.toFixed(2)} €`, accent: '#10b981', bg: '#d1fae5' },
    ];

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">

                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Admin panel</h1>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                            Pregled svih planova putovanja i korisnika u sistemu
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
                        onClick={() => switchTab('plans')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <FiGrid size={15} /> Planovi putovanja
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => switchTab('users')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <FiUsers size={15} /> Korisnici
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'plans' && (
                        <>
                            {loading && (
                                <div className="empty-state">
                                    <p style={{ color: 'var(--muted)' }}>Učitavanje...</p>
                                </div>
                            )}
                            {error && <p className="error-message">{error}</p>}

                            {!loading && !error && (
                                <>
                                    {/* Stat cards */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                        gap: '0.75rem',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {statCards.map(({ label, value, accent, bg }) => (
                                            <div key={label} style={{
                                                background: 'white',
                                                border: '1px solid var(--line)',
                                                borderRadius: '14px',
                                                padding: '1.1rem 1.2rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.6rem'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: accent,
                                                        flexShrink: 0
                                                    }} />
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color: 'var(--muted)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.06em'
                                                    }}>
                                                        {label}
                                                    </span>
                                                </div>
                                                <strong style={{
                                                    fontSize: '1.4rem',
                                                    fontWeight: 800,
                                                    color: accent
                                                }}>
                                                    {value}
                                                </strong>
                                                <div style={{
                                                    height: '3px',
                                                    borderRadius: '999px',
                                                    background: bg
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: '100%',
                                                        borderRadius: '999px',
                                                        background: accent,
                                                        opacity: 0.5
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Toolbar */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.75rem',
                                        marginBottom: '1.25rem',
                                        alignItems: 'center'
                                    }}>
                                        <input
                                            type="text"
                                            placeholder="Pretraži po nazivu ili opisu..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '0.8rem 0.95rem',
                                                border: '1.5px solid var(--line)',
                                                borderRadius: '12px',
                                                fontSize: '0.95rem',
                                                background: '#fff',
                                                color: 'var(--text)',
                                                outline: 'none'
                                            }}
                                        />
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            style={{
                                                width: '200px',
                                                flexShrink: 0,
                                                padding: '0.8rem 0.95rem',
                                                border: '1.5px solid var(--line)',
                                                borderRadius: '12px',
                                                fontSize: '0.95rem',
                                                background: '#fff',
                                                color: 'var(--text)',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="newest">Najnoviji prvo</option>
                                            <option value="oldest">Najstariji prvo</option>
                                            <option value="budget-high">Najveći budžet</option>
                                            <option value="budget-low">Najmanji budžet</option>
                                        </select>
                                    </div>

                                    {/* Empty */}
                                    {filteredPlans.length === 0 ? (
                                        <div className="empty-state">
                                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                                            <p style={{ fontWeight: 600, color: 'var(--text)' }}>
                                                Nema rezultata
                                            </p>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                                                Pokušajte sa drugim pojmom pretrage.
                                            </p>
                                        </div>
                                    ) : (
                                            <div className="plans-grid">
                                                {filteredPlans.map(plan => (
                                                    <AdminPlanCard
                                                        key={plan.id}
                                                        plan={plan}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'users' && <UsersTab />}
                </div>
            </div>
        </div>
    );
}