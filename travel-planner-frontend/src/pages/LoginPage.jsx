import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export default function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email je obavezan';
        if (!formData.password) newErrors.password = 'Lozinka je obavezna';
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
        setServerError('');
        try {
            const res = await authService.login(formData);
            login(
                { name: res.data.name, email: res.data.email, role: res.data.role },
                res.data.token
            );
            navigate('/');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Greška pri logovanju');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'var(--primary-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', fontSize: '1.4rem'
                    }}>
                        ✈️
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>Dobrodošli nazad</h1>
                    <p style={{ marginTop: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                        Prijavite se na vaš Travel Planner nalog
                    </p>
                </div>

                {serverError && (
                    <div className="error-message">{serverError}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="email@example.com"
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>Lozinka</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="error">{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Prijava...' : 'Prijavi se'}
                    </button>
                </form>

                <p>Nemate nalog? <Link to="/register">Registrujte se</Link></p>
            </div>
        </div>
    );
}