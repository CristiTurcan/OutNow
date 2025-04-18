import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config/api';
import { useAuthContext } from '@/contexts/AuthContext';
import useUserIdByEmail from '@/hooks/useUserByIdByEmail';

export interface VisibilityPrefs {
    showDob: boolean;
    showLocation: boolean;
    showGender: boolean;
    showInterests: boolean;
}

export default function useVisibilityPrefs() {
    const { user } = useAuthContext();
    const { userId } = useUserIdByEmail(user?.email || null);

    const [prefs, setPrefs] = useState<VisibilityPrefs>({
        showDob: true,
        showLocation: true,
        showGender: true,
        showInterests: true,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // fetch flags once userId is known
    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        axios
            .get(`${BASE_URL}/users/${userId}`)
            .then((res) => {
                const { showDob, showLocation, showGender, showInterests } = res.data;
                setPrefs({ showDob, showLocation, showGender, showInterests });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [userId]);

    // update a single flag on the server
    const updatePref = useCallback(
        async (key: keyof VisibilityPrefs, value: boolean) => {
            if (!userId) return;
            const body = { [key]: value };
            await axios.put(`${BASE_URL}/users/${userId}/visibility`, body);
            setPrefs((prev) => ({ ...prev, [key]: value }));
        },
        [userId]
    );

    return { prefs, loading, error, updatePref };
}
