import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
        if (!formData.name) newErrors.name = 'Ime je obavezno';
        if (!formData.email) newErrors.email = 'Email je obavezan';
        if (!formData.password || formData.password.length < 6)
            newErrors.password = 'Lozinka mora imati najmanje 6 karaktera';
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
            const res = await authService.register(formData);
            login(
                { name: res.data.name, email: res.data.email, role: res.data.role },
                res.data.token
            );
            navigate('/');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Greška pri registraciji');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Registracija</h1>
                {serverError && <p className="error-message">{serverError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Ime</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Vaše ime"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
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
                    <button type="submit" disabled={loading}>
                        {loading ? 'Registracija...' : 'Registruj se'}
                    </button>
                </form>
                <p>Već imate nalog? <Link to="/login">Prijavite se</Link></p>
            </div>
        </div>
    );
}