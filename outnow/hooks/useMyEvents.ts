import { useState, useEffect } from 'react';
import axios from 'axios';
import useBusinessProfile from '@/hooks/useBusinessProfile';

export default function useMyEvents(businessEmail: string | null) {
    const { getBusinessAccountId } = useBusinessProfile();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!businessEmail) return;
        setLoading(true);

        const fetchMyEvents = async () => {
            try {
                // Use the function from useBusinessProfile to get the account ID
                const businessAccountId = await getBusinessAccountId(businessEmail);
                const eventsResponse = await axios.get(
                    `http://localhost:8080/api/events/business/${businessAccountId}`
                );
                setEvents(eventsResponse.data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, [businessEmail, getBusinessAccountId]);

    return { events, loading, error };
}
