import { useState } from 'react';
import travelPlanService from '../services/travelPlanService';
import { createTravelPlanModel } from '../models/TravelPlan';

export default function CreatePlanModal({ onClose, onCreate }) {
    const [formData, setFormData] = useState({ ...createTravelPlanModel(), budget: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
            const res = await travelPlanService.create({
                ...formData,
                budget: Number(formData.budget) || 0
            });
            onCreate(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Greška pri kreiranju plana');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Novi plan putovanja</h2>
                    <button onClick={onClose} className="btn-close">✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Naziv *</label>
                        <input name="title" value={formData.title} onChange={handleChange} placeholder="Npr. Odmor u Grčkoj" />
                        {errors.title && <span className="error">{errors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label>Opis</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Kratki opis putovanja..." />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Početni datum *</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                            {errors.startDate && <span className="error">{errors.startDate}</span>}
                        </div>
                        <div className="form-group">
                            <label>Krajnji datum *</label>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                            {errors.endDate && <span className="error">{errors.endDate}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Budžet (€)</label>
                        <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="0" min="0" />
                        {errors.budget && <span className="error">{errors.budget}</span>}
                    </div>
                    <div className="form-group">
                        <label>Napomene</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Dodatne napomene..." />
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-secondary">Otkaži</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Kreiranje...' : 'Kreiraj plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}