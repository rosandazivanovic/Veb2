import api from './api';

const userService = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
    delete: (id) => api.delete(`/users/${id}`),
};

export default userService;