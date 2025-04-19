import {useCallback, useState} from 'react';
import axios from 'axios';
import {BASE_URL} from "@/config/api";

const useFavoriteEvent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [favoritedEvents, setFavoritedEvents] = useState<number[]>([]);


    const favoriteEvent = async (userId: number, eventId: number) => {
        setLoading(true);
        setError(null);
        console.log("usedId:" + userId);
        console.log("eventId:" + eventId);
        try {
            const response = await axios.post(`${BASE_URL}/users/${userId}/favorites/${eventId}`);
            console.log('Event favorited successfully:', response.data);
        } catch (err: any) {
            console.error('Error favoriting event:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const removeFavoriteEvent = async (userId: number, eventId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${BASE_URL}/users/${userId}/favorites/${eventId}`);
            console.log('Event unfavorited successfully:', response.data);
        } catch (err: any) {
            console.error('Error unfavoriting event:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavoritedEvents = useCallback(async (userId: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/users/${userId}/favorites`);
            const eventIds = response.data.map((event: any) => event.eventId); // Extract event IDs
            setFavoritedEvents(eventIds); // Update hook state
            // console.log('Favorited events fetched successfully:', eventIds);
            return eventIds; // Explicitly return the event IDs
        } catch (err: any) {
            console.error('Error fetching favorited events:', err);
            setError(err.message || 'An error occurred');
            return []; // Return empty array on error
        } finally {
            setLoading(false);
        }
    }, []);



    return {
        favoriteEvent,
        removeFavoriteEvent,
        fetchFavoritedEvents,
        favoritedEvents,
        loading,
        error,
    };
};

export default useFavoriteEvent;
