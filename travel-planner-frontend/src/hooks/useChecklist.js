import { useState, useEffect } from 'react';
import checklistService from '../services/checklistService';
import { createChecklistItemModel } from '../models/TravelPlan';

export function useChecklist(planId) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checklistService.getAll(planId)
            .then(res => setItems(res.data))
            .catch(err => setError(err.response?.data?.message || 'Greška pri učitavanju checkliste'))
            .finally(() => setLoading(false));
    }, [planId]);

    const addItem = async (name) => {
        const res = await checklistService.create(planId, createChecklistItemModel({ name }));
        setItems(prev => [...prev, res.data]);
        return res.data;
    };

    const toggleItem = async (id) => {
        const res = await checklistService.toggle(planId, id);
        setItems(prev => prev.map(item => item.id === id ? res.data : item));
        return res.data;
    };

    const deleteItem = async (id) => {
        await checklistService.delete(planId, id);
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return { items, loading,error, addItem, toggleItem, deleteItem };
}