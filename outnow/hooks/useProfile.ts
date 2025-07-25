import {useState} from 'react';
import {BASE_URL} from "@/config/api";
import axios from 'axios';

const useProfile = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = async (profileData: {
        email: string;
        username?: string;
        userPhoto?: string;
        bio?: string;
        gender?: string;
        dateOfBirth?: string;
        location?: string;
        interestList?: string[];
    }) => {
        setLoading(true);
        setError(null);
        try {
            const {data: current} = await axios.get(
                `${BASE_URL}/users/by-email`,
                {params: {email: profileData.email}}
            );

            const payload = {
                ...profileData,
                interestList: profileData.interestList?.join(','),
                showDob: 'showDob' in profileData ? (profileData as any).showDob : current.showDob,
                showLocation: 'showLocation' in profileData ? (profileData as any).showLocation : current.showLocation,
                showGender: 'showGender' in profileData ? (profileData as any).showGender : current.showGender,
                showInterests: 'showInterests' in profileData ? (profileData as any).showInterests : current.showInterests,
            };
            await axios.put(`${BASE_URL}/users/update-profile`, payload, {
                headers: {'Content-Type': 'application/json'},
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {updateProfile, loading, error};
};

export default useProfile;
