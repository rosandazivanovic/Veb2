import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlanDetailPage from './pages/PlanDetailPage';
import SharedPlanPage from './pages/SharedPlanPage';
import AdminPage from './pages/AdminPage';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, token } = useAuth();

    if (!token) return <Navigate to="/login" replace />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/plans/:id" element={
                <ProtectedRoute><PlanDetailPage /></ProtectedRoute>
            } />
            <Route path="/shared/:token" element={<SharedPlanPage />} />
            <Route path="/admin" element={
                <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}