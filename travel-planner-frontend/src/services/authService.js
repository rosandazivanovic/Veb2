import api from './api';

const authService = {

    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

export default authService;