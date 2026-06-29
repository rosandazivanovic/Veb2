import api from './api';

const destinationService = {
    getAll: (planId) => api.get(`/travel-plans/${planId}/destinations`),
    create: (planId, data) => api.post(`/travel-plans/${planId}/destinations`, data),
    update: (planId, id, data) => api.put(`/travel-plans/${planId}/destinations/${id}`, data),
    delete: (planId, id) => api.delete(`/travel-plans/${planId}/destinations/${id}`),
};

export default destinationService;