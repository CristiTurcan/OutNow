import {useCallback, useState} from 'react';
import axios from 'axios';
import {BASE_URL} from '@/config/api';

const useGoingEvent = () => {
    // State for storing event IDs that the user is going to
    const [goingEvents, setGoingEvents] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGoingEvents = useCallback(async (userId: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/users/${userId}/going`);
            // Assuming the API returns an array of events with "eventId" field
            const eventIds: number[] = response.data.map((event: any) => event.eventId as number);
            setGoingEvents(eventIds);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching going events:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    // Change the signature to include quantity (defaulting to 1)
    const addGoingEvent = useCallback(async (userId: number, eventId: number, quantity: number = 1) => {
        try {
            // Pass quantity as a query param
            await axios.post(
                `${BASE_URL}/users/${userId}/going/${eventId}`,
                null,
                {params: {quantity}}
            );
            setGoingEvents(prev => [...prev, eventId]);
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    }, []);


    const removeGoingEvent = useCallback(async (userId: number, eventId: number) => {
        try {
            await axios.delete(`${BASE_URL}/users/${userId}/going/${eventId}`);
            setGoingEvents(prev => prev.filter(id => id !== eventId));
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    }, []);

    return {goingEvents, loading, error, fetchGoingEvents, addGoingEvent, removeGoingEvent};
};

export default useGoingEvent;
