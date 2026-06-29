import { useEffect, useMemo, useState } from 'react';
import { FiUser, FiShield, FiSearch } from 'react-icons/fi';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

const getInitials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || '?';


export default function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const { user: currentUser } = useAuth();

    useEffect(() => {
        userService.getAll()
            .then(res => setUsers(res.data || []))
            .catch((err) => setError(err.response?.data?.message || 'Greška pri učitavanju korisnika'))
            .finally(() => setLoading(false));
    }, []);

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(u =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    }, [users, search]);

    const adminCount = useMemo(() => users.filter(u => u.role === 'admin').length, [users]);

    const handleRoleChange = async (id, newRole) => {
        setUpdatingId(id);
        try {
            const res = await userService.updateRole(id, newRole);
            setUsers(prev => prev.map(u => u.id === id ? res.data : u));
            showToast('Uloga uspješno promijenjena');
        } catch (err) {
            showToast(err.response?.data?.message || 'Greška pri promjeni uloge', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id, email) => {
        if (currentUser?.email === email) {
            showToast('Ne možete obrisati sopstveni nalog.', 'error');
            return;
        }
        if (!window.confirm(`Da li ste sigurni da želite obrisati korisnika ${email}? Ova akcija će obrisati i sve njegove planove putovanja.`)) return;
        try {
            await userService.delete(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            showToast('Korisnik uspješno obrisan');
        } catch (err) {
         showToast(err.response?.data?.message || 'Greška pri brisanju korisnika', 'error');
        }
    };

    if (loading) return (
        <div className="empty-state">
            <p style={{ color: 'var(--muted)' }}>Učitavanje korisnika...</p>
        </div>
    );

    return (
        <div>
            {error && <p className="error-message">{error}</p>}

      
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.5rem'
            }}>
                {[
                    { label: 'Ukupno korisnika', value: users.length, accent: '#6366f1', bg: '#eef2ff' },
                    { label: 'Administratori', value: adminCount, accent: '#f59e0b', bg: '#fef3c7' },
                ].map(({ label, value, accent, bg }) => (
                    <div key={label} style={{
                        background: 'white',
                        border: '1px solid var(--line)',
                        borderRadius: '14px',
                        padding: '1.1rem 1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                        <div style={{ height: '3px', borderRadius: '999px', background: bg }}>
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


            <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.25rem' }}>
                <FiSearch
                    size={16}
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--muted)'
                    }}
                />
                <input
                    type="text"
                    placeholder="Pretraži po imenu ili emailu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.8rem 0.95rem 0.8rem 2.2rem',
                        border: '1.5px solid var(--line)',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        background: '#fff',
                        color: 'var(--text)',
                        outline: 'none'
                    }}
                />
            </div>

            {filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <p style={{ fontWeight: 600, color: 'var(--text)' }}>Nema rezultata</p>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                        Pokušajte sa drugim pojmom pretrage.
                    </p>
                </div>
            ) : (
                <div className="items-list">
                    {filteredUsers.map(u => {
                        const isSelf = currentUser?.email === u.email;
                        const isAdmin = u.role === 'admin';

                        return (
                            <div
                                key={u.id}
                                className="item-card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    flexWrap: 'wrap'
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: isAdmin ? '#fef3c7' : '#eef2ff',
                                    color: isAdmin ? '#92400e' : '#4338ca',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    flexShrink: 0
                                }}>
                                    {getInitials(u.name)}
                                </div>

                                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap',
                                        marginBottom: '0.2rem'
                                    }}>
                                        <span style={{
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            color: 'var(--text)'
                                        }}>
                                            {u.name}
                                        </span>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            background: isAdmin ? '#fef3c7' : '#eef2ff',
                                            color: isAdmin ? '#92400e' : '#4338ca'
                                        }}>
                                            {isAdmin ? <FiShield size={10} /> : <FiUser size={10} />}
                                            {isAdmin ? 'Admin' : 'Korisnik'}
                                        </span>
                                        {isSelf && (
                                            <span style={{
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                padding: '2px 8px',
                                                borderRadius: '999px',
                                                background: '#d1fae5',
                                                color: '#065f46'
                                            }}>
                                                Vi
                                            </span>
                                        )}
                                    </div>
                                    <span style={{
                                        display: 'block',
                                        fontSize: '0.85rem',
                                        color: 'var(--muted)'
                                    }}>
                                        {u.email}
                                    </span>
                                    <span style={{
                                        display: 'block',
                                        fontSize: '0.78rem',
                                        color: 'var(--muted)',
                                        marginTop: '0.1rem'
                                    }}>
                                        Registrovan: {formatDate(u.createdAt)}
                                    </span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    flexShrink: 0
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        <span style={{
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            color: 'var(--muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em'
                                        }}>
                                            Uloga
                                        </span>
                                        <select
                                            value={u.role}
                                            disabled={updatingId === u.id || isSelf}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            style={{
                                                padding: '0.45rem 0.7rem',
                                                border: '1.5px solid var(--line)',
                                                borderRadius: '8px',
                                                fontSize: '0.85rem',
                                                background: '#fff',
                                                color: 'var(--text)',
                                                outline: 'none',
                                                cursor: isSelf ? 'not-allowed' : 'pointer',
                                                opacity: isSelf ? 0.5 : 1
                                            }}
                                        >
                                            <option value="user">Korisnik</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(u.id, u.email)}
                                        disabled={isSelf}
                                        title={isSelf ? 'Ne možete obrisati sopstveni nalog' : 'Obriši korisnika'}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: isSelf ? 'not-allowed' : 'pointer',
                                            color: 'var(--muted)',
                                            fontSize: '1rem',
                                            lineHeight: 1,
                                            padding: '0.2rem',
                                            borderRadius: '6px',
                                            opacity: isSelf ? 0.3 : 0.4,
                                            transition: 'opacity 0.2s',
                                            marginTop: '1.2rem'
                                        }}
                                        onMouseEnter={e => { if (!isSelf) e.currentTarget.style.opacity = '1'; }}
                                        onMouseLeave={e => { if (!isSelf) e.currentTarget.style.opacity = '0.4'; }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
);
}