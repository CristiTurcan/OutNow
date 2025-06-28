import {useCallback, useEffect, useState} from 'react';
import axios from 'axios';
import useBusinessProfile from '@/hooks/useBusinessProfile';
import {BASE_URL} from "@/config/api";

export default function useMyEvents(businessEmail: string | null) {
    const {getBusinessAccountId} = useBusinessProfile();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMyEvents = useCallback(async () => {
        if (!businessEmail) return;

        try {
            setLoading(true);
            const businessAccountId = await getBusinessAccountId(businessEmail);
            const eventsResponse = await axios.get(
                `${BASE_URL}/events/business/${businessAccountId}`
            );
            setEvents(eventsResponse.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [businessEmail, getBusinessAccountId]);

    useEffect(() => {
        fetchMyEvents();
    }, [fetchMyEvents]);

    return {events, loading, error, refetchBusiness: fetchMyEvents};
}
