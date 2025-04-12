import { RelativePathString, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
	const router = useRouter();
	const segments = useSegments();

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
				<ActivityIndicator size="large" />
			</View>
		);

	return (
		<AuthProvider>
			<Stack>
				<Stack.Screen name="index" options={{ headerShown: false }} />
				<Stack.Screen name="(auth)" options={{headerShown: false}}/>
				<Stack.Screen name="(tabs)" options={{headerShown: false}}/>
				<Stack.Screen name="createEvent" options={{headerShown: false}}/>
				<Stack.Screen name="eventInterests" options={{headerShown: false}}/>
				<Stack.Screen name="seeEvent" options={{headerShown: false}}/>
				<Stack.Screen name="editEvent" options={{headerShown: false}}/>
			</Stack>
		</AuthProvider>
	);
}
