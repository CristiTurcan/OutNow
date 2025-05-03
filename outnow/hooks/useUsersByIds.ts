import {useEffect, useState} from 'react';
import axios from 'axios';
import {BASE_URL} from '@/config/api';

export type UserProfile = {
    userid: number;
    email: string;
    username: string;
    userPhoto: string;
    bio: string;
    gender?: string;
    dateOfBirth?: string;
    location?: string;
    interestList?: string;
};

export default function useUsersByIds(userIds: number[]) {
    const [profiles, setProfiles] = useState<Record<number, UserProfile>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userIds.length === 0) {
            setLoading(false);
            return;
        }
        ;

        setLoading(true);
        setError(null);

        Promise.all(
            userIds.map((id) =>
                axios
                    .get<UserProfile>(`${BASE_URL}/users/${id}`)
                    .then((res) => [id, res.data] as [number, UserProfile])
            )
        )
            .then((results) => {
                const map: Record<number, UserProfile> = {};
                results.forEach(([id, profile]) => {
                    map[id] = profile;
                });
                setProfiles(map);
            })
            .catch((err) => {
                setError(err.message || 'Failed to load user profiles');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userIds]);

    return {profiles, loading, error};
}
