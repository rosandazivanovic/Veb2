import { useState, useEffect } from 'react';
import activityService from '../services/activityService';

export function useActivities(planId) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        activityService.getAll(planId)
            .then(res => setActivities(res.data))
            .catch(err => alert(err.response?.data?.message || 'Greška pri učitavanju aktivnosti'))
            .finally(() => setLoading(false));
    }, [planId]);

    const addActivity = async (data) => {
        const res = await activityService.create(planId, data);
        setActivities(prev => [...prev, res.data]);
        return res.data;
    };

    const updateActivity = async (id, data) => {
        const res = await activityService.update(planId, id, data);
        setActivities(prev => prev.map(a => a.id === id ? res.data : a));
        return res.data;
    };

    const deleteActivity = async (id) => {
        await activityService.delete(planId, id);
        setActivities(prev => prev.filter(a => a.id !== id));
    };

    return { activities, loading, addActivity, updateActivity, deleteActivity };
}