// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

const useAuth = (): FirebaseAuthTypes.User | null => {
    const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(null);

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(setCurrentUser);
        return subscriber; // This works directly because subscriber is the unsubscribe function
    }, []);

    return currentUser;
};

export default useAuth;
