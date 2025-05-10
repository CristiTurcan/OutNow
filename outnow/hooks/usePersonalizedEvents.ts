import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {BASE_URL} from "@/config/api";

interface Event {
    eventId: number;
    title: string;
    description: string;
    imageUrl: string;
    location: string;
    price: number;
    createdAt: string;
    updatedAt: string;
    businessAccountId: number;
    eventDate: string;
    eventTime: string;
    interestList: string;
    favoriteCount: number;
    attendanceCount: number;
    averageRating: number;
    reviewCount: number;
    // plus any other fields your EventCard expects
}

export const usePersonalizedEvents = (userId: number | null) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadEvents = useCallback(async () => {
        if (userId == null) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<Event[]>(`${BASE_URL}/events/personalized`, {
                params: { userId }
            });
            setEvents(response.data);
        } catch (e: any) {
            setError(e.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // automatically load whenever userId changes
    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    return { events, loading, error, loadEvents };
};

export default usePersonalizedEvents;
