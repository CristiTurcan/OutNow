import {useEffect, useState} from 'react';
import axios from 'axios';
import {EventDTO} from '@/types/EventDTO';
import {BASE_URL} from "@/config/api";

interface UserEvents {
    favorites: EventDTO[];
    going: EventDTO[];
}

export default function useUserEvents(userId: number | null) {
    const [favorites, setFavorites] = useState<EventDTO[]>([]);
    const [going, setGoing] = useState<EventDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserEvents = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const res = await axios.get<UserEvents>(`${BASE_URL}/users/${userId}/events`);
            setFavorites(res.data.favorites);
            setGoing(res.data.going);
        } catch (err) {
            console.error(err);
            setError('Failed to load events.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserEvents();
    }, [userId]);

    return {
        favorites,
        going,
        loading,
        error,
        refetch: fetchUserEvents,
    };
}

