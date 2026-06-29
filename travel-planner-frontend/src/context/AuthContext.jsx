import { createContext, useContext, useState } from 'react';
import { storage } from '../services/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => storage.get('token'));
    const [user, setUser] = useState(() => {
        try {
            const savedUser = storage.get('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const login = (userData, jwt) => {
        setUser(userData);
        setToken(jwt);
        storage.set('token', jwt);
        storage.set('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        storage.remove('token');
        storage.remove('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading: false }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);