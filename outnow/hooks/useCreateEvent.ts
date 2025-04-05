// hooks/useCreateEvent.ts
import { useState } from 'react';
import axios from 'axios';
import {BASE_URL} from "@/config/api";

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
                `${BASE_URL}/events/${businessAccountId}`,
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
