import api from './api';

const travelPlanService = {
    getAll: () => api.get('/travel-plans'),
    getById: (id) => api.get(`/travel-plans/${id}`),
    create: (data) => api.post('/travel-plans', data),
    update: (id, data) => api.put(`/travel-plans/${id}`, data),
    delete: (id) => api.delete(`/travel-plans/${id}`),
};

export default travelPlanService;