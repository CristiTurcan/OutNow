import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged((user) => {
			if (user) {
				router.replace('(tabs)/home');
			} else {
				router.replace('/(auth)/login');
			}
		});
		return unsubscribe;
	}, []);

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size="large" />
		</View>
	);
}
