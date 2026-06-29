import axios from 'axios';
import { storage } from './storage';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
    const token = storage.get('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            storage.remove('token');
            storage.remove('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;