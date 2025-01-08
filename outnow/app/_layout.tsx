import { RelativePathString, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
	const [initializing, setInitializing] = useState(true);
	const [user, setUser] = useState<FirebaseAuthTypes.User | null>();
	const router = useRouter();
	const segments = useSegments();

	const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
		console.log('onAuthStateChanged', user);
		setUser(user);
		if (initializing) setInitializing(false);
	};

	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber;
	}, []);

	useEffect(() => {
		if (initializing) return; // Ensure we don't route while still initializing

		const inAuthGroup = segments[0] === '(auth)'; // Previously cast as string, which might be incorrect
		console.log("Routing status:", { user, inAuthGroup });

		if (user && !inAuthGroup) {
			console.log("Navigating to home...");
			router.replace('(tabs)/home'); // Make sure this path is correct
		} else if (!user && inAuthGroup) {
			console.log("Navigating to root...");
			router.replace('/'); // Ensure this navigates to the login screen
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
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen name="(auth)" options={{headerShown: false}}/>
			<Stack.Screen name="(tabs)" options={{headerShown: false}}/>
		</Stack>
	);
}
