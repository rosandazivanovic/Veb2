import api from './api';

const checklistService = {
    getAll: (planId) => api.get(`/travel-plans/${planId}/checklist`),
    create: (planId, data) => api.post(`/travel-plans/${planId}/checklist`, data),
    toggle: (planId, id) => api.patch(`/travel-plans/${planId}/checklist/${id}/toggle`),
    delete: (planId, id) => api.delete(`/travel-plans/${planId}/checklist/${id}`),
};

export default checklistService;