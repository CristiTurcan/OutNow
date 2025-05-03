import {useCallback, useState} from 'react';
import {fetchAllEvents} from '@/services/eventService';

export function useAllEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadEvents = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchAllEvents();
            setEvents(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    }, []);

    return {events, loading, error, loadEvents};
}
