import api from './api';

const sharedPlanService = {
    create: (planId, data) => api.post(`/shared-plans/${planId}`, data),
    getByToken: (token) => api.get(`/shared-plans/${token}`),
};

export default sharedPlanService;