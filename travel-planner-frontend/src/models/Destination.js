export const createDestinationModel = (data = {}) => ({
    name: data.name || '',
    location: data.location || '',
    arrivalDate: data.arrivalDate || '',
    departureDate: data.departureDate || '',
    description: data.description || '',
    notes: data.notes || '',
});