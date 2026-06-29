import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiLogOut, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ planTitle, activeTab, onTabChange, onBack, onEdit, onShare, onExportPdf }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdminPlansActive =
        location.pathname === '/admin' && (!location.search || location.search.includes('tab=plans'));
    const isAdminUsersActive =
        location.pathname === '/admin' && location.search.includes('tab=users');

    const isPlanDetail = !!planTitle;

    const tabs = [
        { key: 'destinations', label: 'Destinacije' },
        { key: 'activities', label: 'Aktivnosti' },
        { key: 'expenses', label: 'Troškovi' },
        { key: 'checklist', label: 'Checklist' },
    ];

    const actionBtnStyle = {
        background: 'none',
        border: 'none',
        padding: '0.4rem 0.85rem',
        cursor: 'pointer',
        fontSize: '0.88rem',
        fontWeight: 400,
        color: 'var(--muted)',
        transition: 'color 0.2s',
        borderRadius: 0
    };

    return (
        <nav className="navbar" style={{
            flexDirection: isPlanDetail ? 'column' : 'row',
            padding: isPlanDetail ? '0' : undefined,
            gap: 0
        }}>
            {isPlanDetail ? (
                <>
                    {/* Gornji red */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.7rem 1.5rem',
                        borderBottom: '1px solid rgba(235,235,235,0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                            <button
                                onClick={onBack}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    color: 'var(--muted)', fontSize: '0.88rem', padding: 0,
                                    flexShrink: 0, transition: 'color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                            >
                                <FiArrowLeft size={15} />
                                Nazad
                            </button>

                            <span style={{ width: '1px', height: '16px', background: 'var(--line)', flexShrink: 0 }} />

                            <span style={{
                                fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {planTitle}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexShrink: 0 }}>
                            <button
                                onClick={onEdit}
                                style={actionBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                            >
                                Uredi
                            </button>
                            <button
                                onClick={onShare}
                                style={actionBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                            >
                                Podijeli
                            </button>
                            <button
                                onClick={onExportPdf}
                                style={actionBtnStyle}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                            >
                                PDF
                            </button>
                        </div>
                    </div>

                    {/* Donji red — tabovi */}
                    <div style={{
                        display: 'flex',
                        width: '100%',
                        padding: '0 1.5rem',
                        overflowX: 'auto',
                        background: 'rgba(255, 90, 95, 0.05)',
                        borderBottom: '1px solid rgba(255, 90, 95, 0.1)'
                    }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab.key
                                        ? '2px solid var(--primary)'
                                        : '2px solid transparent',
                                    padding: '0.65rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '0.88rem',
                                    fontWeight: activeTab === tab.key ? 700 : 400,
                                    color: activeTab === tab.key ? 'var(--primary)' : 'var(--muted)',
                                    transition: 'all 0.15s',
                                    whiteSpace: 'nowrap',
                                    borderRadius: 0
                                }}
                                onMouseEnter={e => {
                                    if (activeTab !== tab.key)
                                        e.currentTarget.style.color = 'var(--primary)';
                                }}
                                onMouseLeave={e => {
                                    if (activeTab !== tab.key)
                                        e.currentTarget.style.color = 'var(--muted)';
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <Link to="/" className="navbar-brand">
                        TravelPlanner
                    </Link>

                    <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {user?.role === 'admin' && (
                            <div style={{ display: 'flex', gap: '6px', marginRight: '8px' }}>
                                <Link
                                    to="/admin?tab=plans"
                                    className="navbar-link"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 12px', borderRadius: '8px',
                                        background: isAdminPlansActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        fontWeight: isAdminPlansActive ? 600 : 400
                                    }}
                                >
                                    <FiGrid size={16} />
                                    Admin
                                </Link>
                                <Link
                                    to="/admin?tab=users"
                                    className="navbar-link"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '6px 12px', borderRadius: '8px',
                                        background: isAdminUsersActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                        fontWeight: isAdminUsersActive ? 600 : 400
                                    }}
                                >
                                    <FiUsers size={16} />
                                    Korisnici
                                </Link>
                            </div>
                        )}

                        <span className="navbar-user">{user?.name}</span>

                        <button
                            onClick={handleLogout}
                            className="btn-logout"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <FiLogOut size={16} />
                            Odjava
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
}