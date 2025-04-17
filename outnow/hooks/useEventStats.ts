import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config/api';

export default function useEventStats(eventId: number) {
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [uniqueFavoriteCount, setUniqueFavoriteCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const [attRes, favRes, uniqFavRes] = await Promise.all([
                    axios.get<number>(`${BASE_URL}/events/${eventId}/attendees/count`),
                    axios.get<number>(`${BASE_URL}/events/${eventId}/favorites/count`),
                    axios.get<number>(`${BASE_URL}/events/${eventId}/favorites/unique-count`),
                ]);
                setAttendeeCount(attRes.data);
                setFavoriteCount(favRes.data);
                setUniqueFavoriteCount(uniqFavRes.data);
            } catch (e: any) {
                setError(e.message || 'Failed to load event stats');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [eventId]);

    return { attendeeCount, favoriteCount, uniqueFavoriteCount, loading, error };
}
