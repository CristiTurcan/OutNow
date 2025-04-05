import { useState, useEffect } from 'react';
import axios from 'axios';
import {BASE_URL} from "@/config/api";

const useUserIdByEmail = (email: string | null) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!email) return;

        const fetchUserId = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${BASE_URL}/users/id-by-email`, {
                    params: { email },
                });
                setUserId(response.data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch user ID');
                setUserId(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserId();
    }, [email]);

    return { userId, loading, error };
};

export default useUserIdByEmail;
