// hooks/useCreateEvent.ts
import { useState } from 'react';
import axios from 'axios';

interface EventData {
    imageUrl: string;
    title: string;
    description: string;
    location: string;
    price: number;
}

export default function useCreateEvent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createEvent = async (businessAccountId: number, eventData: EventData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `http://localhost:8080/api/events/${businessAccountId}`,
                eventData
            );
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createEvent, loading, error };
}
