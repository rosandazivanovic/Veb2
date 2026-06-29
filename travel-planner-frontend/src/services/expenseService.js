import api from './api';

const expenseService = {
    getAll: (planId) => api.get(`/travel-plans/${planId}/expenses`),
    create: (planId, data) => api.post(`/travel-plans/${planId}/expenses`, data),
    update: (planId, id, data) => api.put(`/travel-plans/${planId}/expenses/${id}`, data),
    delete: (planId, id) => api.delete(`/travel-plans/${planId}/expenses/${id}`),
};

export default expenseService;