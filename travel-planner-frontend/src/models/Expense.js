export const createExpenseModel = (data = {}) => ({
    name: data.name || '',
    category: data.category || 'other',
    amount: data.amount || 0,
    date: data.date || '',
    description: data.description || '',
});