import {useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import axios from 'axios';
import {FirebaseError} from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useBusinessProfile from "@/hooks/useBusinessProfile";

interface AuthHook {
    user: FirebaseAuthTypes.User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string, isBusiness?: boolean) => Promise<void>;
    signOut: () => Promise<void>;
    isBusiness: boolean;
}

const useAuth = (): AuthHook => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isBusiness, setIsBusiness] = useState<boolean>(false);
    const { getBusinessProfile } = useBusinessProfile();

    useEffect(() => {
        const loadIsBusiness = async () => {
            try {
                const value = await AsyncStorage.getItem('isBusiness');
                if (value !== null) {
                    setIsBusiness(JSON.parse(value));
                }
            } catch (error) {
                console.error("Error loading isBusiness flag", error);
            }
        };
        loadIsBusiness();
    }, []);

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(setUser);
        return subscriber;
    }, []);

    async function checkBusinessAccount(email: string): Promise<boolean> {
        try {
            const profile = await getBusinessProfile(email);
            console.log("checkBusiness:" + profile);
            return !!profile;
        } catch (error) {
            return false;
        }
    }

    const signIn = async (email: string, password: string,) => {
        setLoading(true);
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            const businessStatus = await checkBusinessAccount(email);
            await AsyncStorage.setItem('isBusiness', JSON.stringify(businessStatus));
            setIsBusiness(businessStatus);
            if(!businessStatus) {
                await axios.post('http://localhost:8080/users/upsert', {email: userCredential.user?.email});
            }
        } catch (error: any) {
            throw new Error((error as FirebaseError).message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, username: string, isBusiness: boolean = false) => {
        setLoading(true);
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            if (!isBusiness) {
                await axios.post('http://localhost:8080/users/upsert', {
                    email: userCredential.user?.email,
                    username
                });
            }
            await AsyncStorage.setItem('isBusiness', JSON.stringify(isBusiness));
            setIsBusiness(isBusiness);
            console.log("isBusiness is set to:" + isBusiness);
        } catch (error: any) {
            throw new Error((error as FirebaseError).message);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await auth().signOut();
            await AsyncStorage.removeItem('isBusiness');
            setIsBusiness(false);
        } catch (error) {
            console.error("Sign out failed", error);
        }
    };


    return {user, loading, signIn, signUp, signOut, isBusiness };
};

export default useAuth;
