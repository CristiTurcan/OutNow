import {useState} from 'react';
import axios from 'axios';
import {BASE_URL} from "@/config/api";

interface EventData {
    imageUrl: string;
    title: string;
    description: string;
    location: string;
    price: number;
    eventDate?: string | null;
    eventTime?: string | null;
    interestList?: string | null;
}

export default function useEvents() {
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
            // console.log("eventData:\n" + JSON.stringify(eventData));
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateEvent = async (eventId: number, eventData: EventData) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...eventData,
                interestList: Array.isArray(eventData.interestList)
                    ? eventData.interestList.join(',')
                    : eventData.interestList,
            };
            const response = await axios.put(`${BASE_URL}/events/${eventId}`, payload);
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (eventId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${BASE_URL}/events/${eventId}`);
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };


    return {createEvent, updateEvent, deleteEvent, loading, error};
}
