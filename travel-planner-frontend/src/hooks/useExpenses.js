import { useState, useEffect } from 'react';
import expenseService from '../services/expenseService';

export function useExpenses(planId) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        expenseService.getAll(planId)
            .then(res => setExpenses(res.data))
            .catch(err => setError(err.response?.data?.message || 'Greška pri učitavanju troškova'))
            .finally(() => setLoading(false));
    }, [planId]);

    const addExpense = async (data) => {
        const res = await expenseService.create(planId, data);
        setExpenses(prev => [...prev, res.data]);
        return res.data;
    };

    const updateExpense = async (id, data) => {
        const res = await expenseService.update(planId, id, data);
        setExpenses(prev => prev.map(e => e.id === id ? res.data : e));
        return res.data;
    };

    const deleteExpense = async (id) => {
        await expenseService.delete(planId, id);
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    return { expenses, loading,error, addExpense, updateExpense, deleteExpense };
}