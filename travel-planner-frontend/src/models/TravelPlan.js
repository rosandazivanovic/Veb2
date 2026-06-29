export const createTravelPlanModel = (data = {}) => ({
    title: data.title || '',
    description: data.description || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    budget: data.budget || 0,
    notes: data.notes || '',
});

export const createActivityModel = (data = {}) => ({
    name: data.name || '',
    date: data.date || '',
    time: data.time || '00:00:00',
    location: data.location || '',
    description: data.description || '',
    estimatedCost: data.estimatedCost || 0,
    status: data.status || 'planned',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
});

export const createDestinationModel = (data = {}) => ({
    name: data.name || '',
    location: data.location || '',
    arrivalDate: data.arrivalDate || '',
    departureDate: data.departureDate || '',
    description: data.description || '',
    notes: data.notes || '',
});

export const createExpenseModel = (data = {}) => ({
    name: data.name || '',
    category: data.category || 'other',
    amount: data.amount || 0,
    date: data.date || '',
    description: data.description || '',
});

export const createChecklistItemModel = (data = {}) => ({
    name: data.name || '',
    isCompleted: data.isCompleted || false,
});

export const createShareModel = (data = {}) => ({
    accessType: data.accessType || 'VIEW',
    expiresInDays: data.expiresInDays || 7,
});