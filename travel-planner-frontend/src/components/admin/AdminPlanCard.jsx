import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatDate';

export default function AdminPlanCard({ plan, onDelete }) {
    const navigate = useNavigate();

    const budgetPercent = plan.budget > 0
        ? Math.min((Number(plan.totalSpent || 0) / plan.budget) * 100, 100)
        : 0;

    const remaining = plan.remainingBudget
        ?? ((plan.budget || 0) - (plan.totalSpent || 0));

    return (
        <div className="plan-card" style={{ position: 'relative', cursor: 'default' }}>

            <button
                onClick={() => onDelete(plan.id)}
                style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--muted)', fontSize: '1rem', lineHeight: 1,
                    padding: '0.2rem', borderRadius: '6px', opacity: 0.4, transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                title="Obriši plan"
            >
                ×
            </button>

            <h3 style={{
                fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)',
                marginBottom: '0.3rem', paddingRight: '1.5rem'
            }}>
                {plan.title}
            </h3>

            <p className="plan-description" style={{
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
                {plan.description || 'Bez opisa'}
            </p>

            <div style={{
                fontSize: '0.85rem', color: 'var(--muted)', margin: '0.8rem 0'
            }}>
                {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
            </div>

            <div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem'
                }}>
                    <span>Potrošeno</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                        {Number(plan.totalSpent || 0).toFixed(2)} € / {Number(plan.budget || 0).toFixed(2)} €
                    </span>
                </div>
                <div className="budget-bar">
                    <div
                        className="budget-fill"
                        style={{
                            width: `${budgetPercent}%`,
                            background: budgetPercent > 90 ? '#e74c3c'
                                : budgetPercent > 70 ? 'var(--warning)' : 'var(--primary)'
                        }}
                    />
                </div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: '0.4rem', fontSize: '0.8rem'
                }}>
                    <span style={{ color: 'var(--muted)' }}>
                        {Math.round(budgetPercent)}% iskorišteno
                    </span>
                    <span className="remaining">
                        Ostalo: {Number(remaining).toFixed(2)} €
                    </span>
                </div>
            </div>

            <button
                className="btn-secondary"
                onClick={() => navigate(`/plans/${plan.id}`)}
                style={{ width: '100%', marginTop: '1rem' }}
            >
                Otvori plan
            </button>
        </div>
    );
}