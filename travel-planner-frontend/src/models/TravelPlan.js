export const createTravelPlanModel = (data = {}) => ({
    title: data.title || '',
    description: data.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    budget: data.budget || 0,
    notes: data.notes || '',
});