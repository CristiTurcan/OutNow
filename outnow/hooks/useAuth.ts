import {useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import axios from 'axios';
import useBusinessProfile from "@/hooks/useBusinessProfile";
import functions from '@react-native-firebase/functions';
import {BASE_URL} from "@/config/api";


export interface AuthHook {
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
        const unsubscribe = auth().onIdTokenChanged(async (user) => {
            setUser(user);
            if (user) {
                try {
                    const idTokenResult = await user.getIdTokenResult();
                    const businessStatus: boolean = idTokenResult.claims.isBusiness || false;
                    setIsBusiness(businessStatus);
                } catch (error) {
                    console.error("Error fetching token claims:", error);
                    setIsBusiness(false);
                }
            } else {
                setIsBusiness(false);
            }
        });
        return unsubscribe;
    }, []);


    useEffect(() => {
        if (user) {
            user.getIdTokenResult(true)
                .then((idTokenResult) => {
                    const businessStatus: boolean = idTokenResult.claims.isBusiness || false;
                    setIsBusiness(businessStatus);
                })
                .catch((error) => {
                    console.error("Error fetching token claims:", error);
                    setIsBusiness(false);
                });
        } else {
            setIsBusiness(false);
        }
    }, [user]);

    const signIn = async (email: string, password: string): Promise<void> => {
        setLoading(true);
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            // Force token refresh
            await userCredential.user.getIdToken(true);
            // Option 1: Reload user to ensure latest custom claims
            await userCredential.user.reload();
            const idTokenResult = await userCredential.user.getIdTokenResult();
            const businessStatus: boolean = idTokenResult.claims.isBusiness || false;
            setIsBusiness(businessStatus);
            if (!businessStatus) {
                // fetch current flags so we don’t overwrite them
                const { data: current } = await axios.get(
                    `${BASE_URL}/users/by-email`,
                    { params: { email: userCredential.user?.email } }
                );

                await axios.post(`${BASE_URL}/users/upsert`, {
                    email: userCredential.user?.email,
                    showDob:       current.showDob,
                    showLocation:  current.showLocation,
                    showGender:    current.showGender,
                    showInterests: current.showInterests,
                });
            }
        } catch (error: any) {
            throw new Error(error.message);
        } finally {
            setLoading(false);
        }
    };



    const signUp = async (
        email: string,
        password: string,
        username: string,
        isBusiness: boolean = false
    ): Promise<void> => {
        setLoading(true);
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;

            if (isBusiness) {
                // set the custom claim
                const setUserRole = functions().httpsCallable('setUserRole');
                await setUserRole({ uid, isBusiness });
            } else {
                await axios.post(`${BASE_URL}/users/upsert`, {
                    email: userCredential.user?.email,
                    username
                });
            }
            // Force token refresh to get updated custom claims
            await userCredential.user.getIdToken(true);
            const idTokenResult = await userCredential.user.getIdTokenResult();
            const businessStatus: boolean = idTokenResult.claims.isBusiness || false;
            setIsBusiness(businessStatus);
        } catch (error: any) {
            throw new Error(error.message);
        } finally {
            setLoading(false);
        }
    };


    const signOut = async () => {
        try {
            await auth().signOut();
            setIsBusiness(false);
        } catch (error) {
            console.error("Sign out failed", error);
        }
    };


    return {user, loading, signIn, signUp, signOut, isBusiness };
};

export default useAuth;
