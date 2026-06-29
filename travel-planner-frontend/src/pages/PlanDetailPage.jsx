import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import travelPlanService from '../services/travelPlanService';
import DestinationsTab from '../components/DestinationsTab';
import ActivitiesTab from '../components/ActivitiesTab';
import ExpensesTab from '../components/ExpensesTab';
import ChecklistTab from '../components/ChecklistTab';
import SharePlanModal from '../components/SharePlanModal';
import EditPlanModal from '../components/EditPlanModal';
import { formatDate } from '../utils/formatDate';
import { storage } from '../services/storage';


export default function PlanDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('destinations');
    const [showShare, setShowShare] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    useEffect(() => {
        let mounted = true;
        travelPlanService
            .getById(id)
            .then(res => { if (mounted) setPlan(res.data); })
            .catch(() => navigate('/'))
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [id, navigate]);

    const handleExportPdf = async () => {
        try {
            const token = storage.get('token');
            const url = `${import.meta.env.VITE_API_URL}/travel-plans/${id}/pdf`;
            console.log('PDF URL:', url);
            console.log('Token:', token ? 'postoji' : 'ne postoji');

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const text = await response.text();
                console.log('Response body:', text);
                throw new Error(`Status: ${response.status}`);
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = `${plan.title}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(objectUrl);
        } catch (err) {
            console.error('PDF greška:', err);
            alert(`Greška pri generisanju PDF-a: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="dashboard-container">
                    <div className="empty-state">
                        <p style={{ color: 'var(--muted)' }}>Učitavanje plana...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!plan) return null;

    const budgetPercent = plan.budget > 0
        ? Math.min(100, Math.round((plan.totalSpent / plan.budget) * 100))
        : 0;

    const nights = Math.ceil(
        (new Date(plan.endDate) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24)
    );

    const budgetColor = budgetPercent > 90
        ? '#e74c3c'
        : budgetPercent > 70
            ? '#f59e0b'
            : '#10b981';

    return (
        <div>
            <Navbar
                planTitle={plan.title}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onBack={() => navigate('/')}
                onEdit={() => setShowEdit(true)}
                onShare={() => setShowShare(true)}
                onExportPdf={handleExportPdf}
            />

            <div className="plan-detail-container">

                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap'
                }}>
                    {/* Lijevo — info */}
                    <div style={{ flex: '1', minWidth: '240px' }}>
                        <h1 style={{
                            fontSize: '1.6rem',
                            fontWeight: 800,
                            color: 'var(--text)',
                            margin: '0 0 0.3rem'
                        }}>
                            {plan.title}
                        </h1>
                        {plan.description && (
                            <p style={{
                                color: 'var(--muted)',
                                fontSize: '0.9rem',
                                margin: '0 0 0.5rem',
                                lineHeight: 1.5
                            }}>
                                {plan.description}
                            </p>
                        )}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                                {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
                            </span>
                            <span style={{
                                background: 'var(--line)',
                                color: 'var(--muted)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '999px'
                            }}>
                                {nights} {nights === 1 ? 'noć' : 'noći'}
                            </span>
                        </div>
                        {plan.notes && (
                            <p style={{
                                fontSize: '0.82rem',
                                color: 'var(--muted)',
                                fontStyle: 'italic',
                                margin: '0.5rem 0 0',
                                lineHeight: 1.5
                            }}>
                                {plan.notes}
                            </p>
                        )}
                    </div>

                    {/* Desno — budget kartice */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{
                            background: 'white',
                            border: '1px solid var(--line)',
                            borderRadius: '12px',
                            padding: '0.85rem 1.1rem',
                            minWidth: '90px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.3rem',
                                fontWeight: 700
                            }}>
                                Budžet
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                                {plan.budget} €
                            </div>
                        </div>

                        <div style={{
                            background: 'white',
                            border: '1px solid var(--line)',
                            borderRadius: '12px',
                            padding: '0.85rem 1.1rem',
                            minWidth: '90px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.3rem',
                                fontWeight: 700
                            }}>
                                Potrošeno
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                                {plan.totalSpent} €
                            </div>
                            <div style={{ height: '3px', background: 'var(--line)', borderRadius: '999px', marginTop: '0.4rem' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${budgetPercent}%`,
                                    background: budgetColor,
                                    borderRadius: '999px',
                                    transition: 'width 0.4s ease'
                                }} />
                            </div>
                        </div>

                        <div style={{
                            background: 'white',
                            border: '1px solid var(--line)',
                            borderRadius: '12px',
                            padding: '0.85rem 1.1rem',
                            minWidth: '90px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.3rem',
                                fontWeight: 700
                            }}>
                                Preostalo
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: budgetColor }}>
                                {plan.remainingBudget} €
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab content */}
                <div className="tab-content">
                    {activeTab === 'destinations' && <DestinationsTab planId={id} />}
                    {activeTab === 'activities' && <ActivitiesTab planId={id} />}
                    {activeTab === 'expenses' && <ExpensesTab planId={id} plan={plan} />}
                    {activeTab === 'checklist' && <ChecklistTab planId={id} />}
                </div>
            </div>

            {showShare && (
                <SharePlanModal planId={id} onClose={() => setShowShare(false)} />
            )}

            {showEdit && (
                <EditPlanModal
                    plan={plan}
                    onClose={() => setShowEdit(false)}
                    onUpdate={(updatedPlan) => {
                        setPlan(updatedPlan);
                        setShowEdit(false);
                    }}
                />
            )}
        </div>
    );
}