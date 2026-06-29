import { useState } from 'react';
import travelPlanService from '../services/travelPlanService';
import { createTravelPlanModel } from '../models/TravelPlan';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';
export default function EditPlanModal({ plan, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        ...createTravelPlanModel(plan),
        startDate: plan.startDate?.split('T')[0] || '',
        endDate: plan.endDate?.split('T')[0] || '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { toast, showToast, hideToast } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = 'Naziv je obavezan';
        if (!formData.startDate) newErrors.startDate = 'Početni datum je obavezan';
        if (!formData.endDate) newErrors.endDate = 'Krajnji datum je obavezan';
        if (formData.endDate && formData.startDate && formData.endDate < formData.startDate)
            newErrors.endDate = 'Krajnji datum ne može biti prije početnog';
        if (formData.budget && Number(formData.budget) < 0)
            newErrors.budget = 'Budžet ne može biti negativan';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setLoading(true);
        try {
            const res = await travelPlanService.update(plan.id, {
                ...formData,
                budget: Number(formData.budget) || 0
            });
            onUpdate(res.data);
        } catch (err) {
            showToast(err.response?.data?.message || 'Greška pri ažuriranju plana', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--line)'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'var(--text)',
                            margin: 0
                        }}>
                            Uredi plan
                        </h2>
                        <p style={{
                            fontSize: '0.8rem',
                            color: 'var(--muted)',
                            margin: '2px 0 0'
                        }}>
                            {plan.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--muted)',
                            fontSize: '1.1rem',
                            lineHeight: 1,
                            padding: '0.2rem',
                            borderRadius: '6px',
                            opacity: 0.5,
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Naziv *</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Naziv plana putovanja"
                        />
                        {errors.title && <span className="error">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label>Opis</label>
                        <textarea
                            name="description"
                            rows={1}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Kratki opis putovanja..."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Početni datum *</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                            {errors.startDate && <span className="error">{errors.startDate}</span>}
                        </div>
                        <div className="form-group">
                            <label>Krajnji datum *</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                            {errors.endDate && <span className="error">{errors.endDate}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Budžet (€)</label>
                        <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            min="0"
                            placeholder="0"
                        />
                        {errors.budget && <span className="error">{errors.budget}</span>}
                    </div>

                    <div className="form-group">
                        <label>Napomene</label>
                        <textarea
                            name="notes"
                            rows={1}
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Bilješke, napomene, važne informacije..."
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.75rem',
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--line)'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                        >
                            Otkaži
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Čuvanje...' : 'Sačuvaj izmjene'}
                        </button>
                    </div>
                </form>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}