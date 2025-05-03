import {useState} from 'react';
import {BASE_URL} from "@/config/api";

export type Feedback = {
    feedbackId: number;
    eventId: number;
    userId: number;
    rating: string;
    comment: string;
    createdAt: string;
};

export default function useFeedback() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Adds feedback for a given event and user.
     * Uses a POST request to /feedback/event/{eventId}/user/{userId}.
     */
    const addFeedback = async (
        eventId: number,
        userId: number,
        rating: string,
        comment: string
    ): Promise<Feedback | null> => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `${BASE_URL}/feedback/event/${eventId}/user/${userId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Only send rating and comment in the request body.
                    body: JSON.stringify({
                        rating,
                        comment,
                    }),
                }
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to add feedback');
            }

            const data = await response.json();
            return data as Feedback;
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            return null;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Retrieves all feedback for a specified event.
     * Uses a GET request to /feedback/event/{eventId}.
     */
    const getFeedback = async (eventId: number): Promise<Feedback[] | null> => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `${BASE_URL}/feedback/event/${eventId}`,
                {
                    method: 'GET',
                }
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to retrieve feedback');
            }

            const data = await response.json();
            return data as Feedback[];
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {addFeedback, getFeedback, loading, error};
}
