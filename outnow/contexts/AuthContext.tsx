import React, {createContext, useContext, useEffect} from 'react';
import useAuth, {AuthHook} from '@/hooks/useAuth';

const AuthContext = createContext<AuthHook | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const auth = useAuth();

    useEffect(() => {
    }, [auth.isBusiness, auth.user?.email]);
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthHook => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
