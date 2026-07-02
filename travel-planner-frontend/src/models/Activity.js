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