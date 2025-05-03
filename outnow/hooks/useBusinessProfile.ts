import {useCallback, useState} from 'react';
import axios from 'axios';
import {BASE_URL} from "@/config/api";

interface BusinessProfileData {
    email: string;
    username: string;
    userPhoto?: string;
    bio?: string;
    location?: string;
    interestList?: string[];
}

export default function useBusinessProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateBusinessProfile = async (businessProfileData: BusinessProfileData) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...businessProfileData,
                interestList: businessProfileData.interestList?.join(','),
            };
            const response = await axios.post(
                `${BASE_URL}/business-accounts`,
                payload
            );
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateExistingBusinessProfile = async (email: string, updatedData: Partial<BusinessProfileData>) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...updatedData,
                interestList: updatedData.interestList?.join(','),
            };
            const response = await axios.put(
                `${BASE_URL}/business-accounts/by-email?email=${encodeURIComponent(email)}`,
                payload
            );
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message;
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getBusinessProfile = useCallback(async (email: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/business-accounts/by-email?email=${encodeURIComponent(email)}`);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    }, []);

    const getBusinessAccountId = useCallback(async (email: string) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/business-accounts/id?email=${encodeURIComponent(email)}`
            );
            return response.data; // should return the id as an Integer
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    }, []);

    const getBusinessProfileById = useCallback(async (id: number) => {
        try {
            const response = await axios.get(`${BASE_URL}/business-accounts/${id}`);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
            throw err;
        }
    }, []);


    return {
        updateBusinessProfile,
        updateExistingBusinessProfile,
        getBusinessProfile,
        getBusinessAccountId,
        getBusinessProfileById,
        loading,
        error,
    };
}
