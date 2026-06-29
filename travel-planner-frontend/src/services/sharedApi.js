import axios from 'axios';

export const createSharedApi = (token) => axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Shared-Token': token
    }
});