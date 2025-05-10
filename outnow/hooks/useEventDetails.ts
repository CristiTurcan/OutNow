import {useEffect, useState} from 'react';
import axios from 'axios';
import {BASE_URL} from '@/config/api';

export interface EventDetails {
    eventId: number;
    title: string;
    description: string;
    imageUrl: string;
    location: string;
    price: number;
    eventDate: string;
    eventTime: string;
    attendees: number;
    interestList: string;
    businessAccountId: number;
    totalTickets: number;
}

export default function useEventDetails(eventId: number | null) {
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEventDetails = async () => {
        if (!eventId) return;
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/events/${eventId}`);
            setEvent(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    return {event, loading, error, refetch: fetchEventDetails};
}
