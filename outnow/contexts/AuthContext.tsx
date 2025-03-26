import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
    user: FirebaseAuthTypes.User | null;
    loading: boolean;
    isBusiness: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string, isBusiness?: boolean) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isBusiness, setIsBusiness] = useState<boolean>(false);

    // Listen for auth state changes
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(setUser);
        // Load isBusiness flag from AsyncStorage on startup
        const loadIsBusiness = async () => {
            try {
                const value = await AsyncStorage.getItem('isBusiness');
                if (value !== null) {
                    setIsBusiness(JSON.parse(value));
                }
            } catch (error) {
                console.error('Error loading isBusiness flag', error);
            }
        };
        loadIsBusiness();
        return subscriber;
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            // Optionally, fetch additional profile details to determine isBusiness.
            // For now, we'll assume the flag persists from signUp.
        } catch (error: any) {
            throw new Error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, username: string, business: boolean = false) => {
        setLoading(true);
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            if (!business) {
                await axios.post('http://localhost:8080/users/upsert', {
                    email: userCredential.user?.email,
                    username,
                });
            }
            // Persist the business flag
            await AsyncStorage.setItem('isBusiness', JSON.stringify(business));
            setIsBusiness(business);
        } catch (error: any) {
            throw new Error(error.message);
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
            console.error('Sign out failed', error);
            throw error;
        }
    };

    const value: AuthContextData = { user, loading, isBusiness, signIn, signUp, signOut };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
