import {Stack, useRouter, useSegments} from 'expo-router';
import {useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {ActivityIndicator, TextInput, View} from 'react-native';
import {AuthProvider} from '@/contexts/AuthContext';
import NotificationsManager from '@/notifications/NotificationsManager';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

;(TextInput as any).defaultProps = {
    ...(TextInput as any).defaultProps || {},
    placeholderTextColor: '#999',
};

export default function RootLayout() {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
    const router = useRouter();
    const segments = useSegments();
    const queryClient = new QueryClient();

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged((user) => {
            setUser(user);
            setInitializing(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (initializing) return;

        const inAuthGroup = segments[0] === '(auth)';

        // console.log("Routing status:", { user, inAuthGroup });

        if (!user && !inAuthGroup) {
            console.log("Redirecting to login...");
            router.replace('(auth)/login');
        } else if (user && inAuthGroup) {
            console.log("Redirecting to home...");
            router.replace('(tabs)/home');
        }
    }, [user, initializing]);


    if (initializing)
        return (
            <View
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1
                }}
            >
                <ActivityIndicator size="large"/>
            </View>
        );

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <NotificationsManager/>
                <Stack>
                    <Stack.Screen name="index" options={{headerShown: false}}/>
                    <Stack.Screen name="(auth)" options={{headerShown: false}}/>
                    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                    <Stack.Screen name="createEvent" options={{headerShown: false}}/>
                    <Stack.Screen name="eventInterests" options={{headerShown: false}}/>
                    <Stack.Screen name="seeEvent" options={{headerShown: false}}/>
                    <Stack.Screen name="editEvent" options={{headerShown: false}}/>
                    <Stack.Screen name="feedback" options={{headerShown: false}}/>
                    <Stack.Screen name="statistics" options={{headerShown: false}}/>
                    <Stack.Screen name="profilePreview" options={{headerShown: false}}/>
                    <Stack.Screen name="buyMockup" options={{headerShown: false}}/>
                    <Stack.Screen name="NotificationCenter" options={{headerShown: false}}/>
                </Stack>
            </AuthProvider>
        </QueryClientProvider>
    );
}
