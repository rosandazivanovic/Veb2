export const createChecklistItemModel = (data = {}) => ({
    name: data.name || '',
    isCompleted: data.isCompleted || false,
});