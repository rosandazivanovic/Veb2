import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { createSharedApi } from '../services/sharedApi';
import sharedPlanService from '../services/sharedPlanService';
import SharedDestinations from '../components/shared/SharedDestinations';
import SharedActivities from '../components/shared/SharedActivities';
import SharedExpenses from '../components/shared/SharedExpenses';
import SharedChecklist from '../components/shared/SharedChecklist';
import { formatDate } from '../utils/formatDate';

export default function SharedPlanPage() {
    const { token } = useParams();
    const sharedApi = useMemo(() => createSharedApi(token), [token]);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [activities, setActivities] = useState([]);
    const [checklistItems, setChecklistItems] = useState([]);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        sharedPlanService.getByToken(token)
            .then(res => {
                setData(res.data);
                setDestinations(res.data.plan.destinations || []);
                setActivities(res.data.plan.activities || []);
                setChecklistItems(res.data.plan.checklist || []);
            })
            .catch(() => setError('Link nije validan ili je istekao.'))
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        if (!data?.plan?.id) return;
        sharedApi.get(`/travel-plans/${data.plan.id}/expenses`)
            .then(res => setExpenses(res.data || []))
            .catch(() => setExpenses([]));
    }, [data?.plan?.id, sharedApi]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--muted)' }}>Učitavanje plana...</p>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Link nije validan
                </p>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{error}</p>
            </div>
        </div>
    );

    const { plan, accessType } = data;
    const canEdit = accessType === 'EDIT';
    const nights = Math.ceil(
        (new Date(plan.endDate) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24)
    );
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="shared-plan-container">

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--line)',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <div>
                    <span style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--primary)',
                        marginBottom: '0.4rem'
                    }}>
                        Plan putovanja
                    </span>
                    <h1 style={{
                        fontSize: '1.6rem', fontWeight: 800,
                        color: 'var(--primary)', margin: '0 0 0.3rem', lineHeight: 1.1
                    }}>
                        {plan.title}
                    </h1>
                    {plan.description && (
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
                            {plan.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                            {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
                        </span>
                        <span style={{
                            background: 'var(--primary-soft)', color: 'var(--primary)',
                            fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px'
                        }}>
                            {nights} {nights === 1 ? 'noć' : 'noći'}
                        </span>
                    </div>
                </div>
                <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px',
                    background: canEdit ? '#fef3c7' : '#eef2ff',
                    color: canEdit ? '#92400e' : '#4338ca',
                    flexShrink: 0, alignSelf: 'flex-start'
                }}>
                    {canEdit ? 'Uređivanje' : 'Pregled'}
                </span>
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem', marginBottom: '1.25rem'
            }}>
                {[
                    { label: 'Budžet', value: `${plan.budget} €`, color: '#f59e0b' },
                    { label: 'Potrošeno', value: `${totalSpent.toFixed(2)} €`, color: '#e74c3c' },
                    { label: 'Preostalo', value: `${(plan.budget - totalSpent).toFixed(2)} €`, color: '#10b981' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{
                        background: 'white', border: '1px solid var(--line)',
                        borderRadius: '12px', padding: '0.75rem', textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)',
                            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem'
                        }}>
                            {label}
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{value}</div>
                    </div>
                ))}
            </div>

            {plan.notes && (
                <div style={{
                    background: 'white', border: '1px solid var(--line)', borderRadius: '12px',
                    padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.88rem',
                    color: 'var(--muted)', fontStyle: 'italic',
                    borderLeft: '3px solid var(--primary-soft)'
                }}>
                    {plan.notes}
                </div>
            )}

            <SharedDestinations
                planId={plan.id}
                destinations={destinations}
                setDestinations={setDestinations}
                canEdit={canEdit}
                sharedApi={sharedApi}
            />

            <SharedActivities
                planId={plan.id}
                activities={activities}
                setActivities={setActivities}
                canEdit={canEdit}
                sharedApi={sharedApi}
            />

            <SharedExpenses
                planId={plan.id}
                expenses={expenses}
                setExpenses={setExpenses}
                canEdit={canEdit}
                sharedApi={sharedApi}
            />

            <SharedChecklist
                planId={plan.id}
                checklistItems={checklistItems}
                setChecklistItems={setChecklistItems}
                canEdit={canEdit}
                sharedApi={sharedApi}
            />
        </div>
    );
}