import { useState, useEffect } from 'react';
import destinationService from '../services/destinationService';

export function useDestinations(planId) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        destinationService.getAll(planId)
            .then(res => { if (mounted) setDestinations(res.data); })
            .catch(err => { if (mounted) setError(err.response?.data?.message || 'Greška pri učitavanju destinacija'); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [planId]);

    const addDestination = async (data) => {
        const res = await destinationService.create(planId, data);
        setDestinations(prev => [...prev, res.data]);
        return res.data;
    };

    const updateDestination = async (id, data) => {
        const res = await destinationService.update(planId, id, data);
        setDestinations(prev => prev.map(d => d.id === id ? res.data : d));
        return res.data;
    };

    const deleteDestination = async (id) => {
        await destinationService.delete(planId, id);
        setDestinations(prev => prev.filter(d => d.id !== id));
    };

    return { destinations, loading, error, addDestination, updateDestination, deleteDestination };
}