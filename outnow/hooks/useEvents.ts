import { useState, useCallback } from 'react';
import { fetchAllEvents } from '@/services/eventService';

export function useEvents(favoritedEvents: number[]) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadEvents = useCallback(async () => {
        if (favoritedEvents.length === 0) {
            setEvents([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const allEvents = await fetchAllEvents();
            const filteredEvents = allEvents.filter((event: any) =>
                favoritedEvents.includes(event.event_id)
            );
            setEvents(filteredEvents);
            setError(null);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [favoritedEvents]);

    return { events, loading, error, loadEvents };
}
