import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import travelPlanService from '../services/travelPlanService';
import TravelPlanCard from '../components/plan/TravelPlanCard';
import CreatePlanModal from '../components/plan/CreatePlanModal';
import Navbar from '../components/shared/Navbar';
import Toast from '../components/shared/Toast';
import { useToast } from '../hooks/useToast';
export default function DashboardPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        travelPlanService.getAll()
            .then(res => setPlans(res.data))
            .catch(() => setError('Greška pri učitavanju planova'))
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = (newPlan) => {
        setPlans([...plans, newPlan]);
        setShowModal(false);
        showToast('Plan putovanja uspješno kreiran');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Da li ste sigurni da želite obrisati ovaj plan?')) return;
        try {
            await travelPlanService.delete(id);
            setPlans(plans.filter(p => p.id !== id));
            showToast('Plan putovanja uspješno obrisan');
        } catch {
            showToast('Greška pri brisanju plana', 'error');
        }
    };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Dobro jutro';
        if (h < 18) return 'Dobar dan';
        return 'Dobro veče';
    };

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">

                <div className="dashboard-header">
                    <div>
                        <h1>{greeting()}, {user?.name}! ✈️</h1>
                        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                            {plans.length > 0
                                ? `Imate ${plans.length} ${plans.length === 1 ? 'plan' : plans.length < 5 ? 'plana' : 'planova'} putovanja`
                                : 'Kreirajte svoj prvi plan putovanja'}
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        + Novi plan
                    </button>
                </div>

                {loading && (
                    <div className="empty-state">
                        <p style={{ color: 'var(--muted)' }}>Učitavanje planova...</p>
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                {!loading && !error && plans.length === 0 && (
                    <div className="empty-state">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                            Još nema planova putovanja
                        </p>
                        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Kreirajte prvi plan i počnite planirati svoje avanture.
                        </p>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            Kreirajte prvi plan
                        </button>
                    </div>
                )}

                
                {!loading && plans.length > 0 && (
                    <div className="plans-grid">
                        {plans.map(plan => (
                            <TravelPlanCard
                                key={plan.id}
                                plan={plan}
                                onClick={() => navigate(`/plans/${plan.id}`)}
                                onDelete={() => handleDelete(plan.id)}
                            />
                        ))}
                    </div>
                )}

                {showModal && (
                    <CreatePlanModal
                        onClose={() => setShowModal(false)}
                        onCreate={handleCreate}
                    />
                )}
                {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
            </div>
        </div>
    );
}