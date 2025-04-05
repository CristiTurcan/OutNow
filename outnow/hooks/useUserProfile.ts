// hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import {BASE_URL} from "@/config/api";

interface UserProfile {
    userid: number;
    email: string;
    username: string;
    userPhoto?: string;
    bio?: string;
    gender?: string;
    dateOfBirth?: string;
    location?: string;
    interestList?: string;
}

const useUserProfile = (email?: string | null) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${BASE_URL}/users/by-email?email=${encodeURIComponent(email)}`
                );
                setProfile(response.data);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [email]);

    return { getProfile: profile, loading, error };
};

export default useUserProfile;
