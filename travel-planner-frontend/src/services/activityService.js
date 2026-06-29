import api from './api';

const activityService = {
    getAll: (planId) => api.get(`/travel-plans/${planId}/activities`),
    create: (planId, data) => api.post(`/travel-plans/${planId}/activities`, data),
    update: (planId, id, data) => api.put(`/travel-plans/${planId}/activities/${id}`, data),
    delete: (planId, id) => api.delete(`/travel-plans/${planId}/activities/${id}`),
};

export default activityService;