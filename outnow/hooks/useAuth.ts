import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import axios from 'axios';
import { FirebaseError } from 'firebase/app';

interface AuthHook {
    user: FirebaseAuthTypes.User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string) => Promise<void>;
}

const useAuth = (): AuthHook => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Monitor auth state changes
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(setUser);
        return subscriber;
    }, []);

    // Sign in function
    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            // Optional: update your backend with the signed in user's email
            await axios.post('http://localhost:8080/users/upsert', { email: userCredential.user?.email });
        } catch (error: any) {
            throw new Error((error as FirebaseError).message);
        } finally {
            setLoading(false);
        }
    };

    // Sign up function
    const signUp = async (email: string, password: string, username: string) => {
        setLoading(true);
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            // Include username in your backend update
            await axios.post('http://localhost:8080/users/upsert', {
                email: userCredential.user?.email,
                username
            });
        } catch (error: any) {
            throw new Error((error as FirebaseError).message);
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, signIn, signUp };
};

export default useAuth;
