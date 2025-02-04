import { useState } from 'react';
import {
	Text,
	View,
	StyleSheet,
	KeyboardAvoidingView,
	TextInput,
	Button,
	ActivityIndicator
} from 'react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
import React from 'react';
import CustomButton from "@/components/customButton";
import {router} from "expo-router";
import axios from "axios";

export default function Index() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const signIn = async () => {
		console.log("Attempting to sign in...");
		setLoading(true);
		try {
			const userCredential = await auth().signInWithEmailAndPassword(email, password);

			// Prepare user data
			const userData = {
				email: userCredential.user?.email
			};

			console.log("userdata:\n" + JSON.stringify(userData));

			// Send user data to backend to create/update
			await axios.post('http://localhost:8080/users/upsert', userData)
				.then(response => console.log('User upserted successfully:', response.data))
				.catch(error => console.error('Failed to upsert user:', error));

			router.replace('(tabs)/home');
			console.log("Signed in successfully");
		} catch (e: any) {
			const err = e as FirebaseError;
			console.log('Sign in failed:', err.message);
			alert('Sign in failed: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView}>
				<TextInput
					style={styles.input}
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
					placeholder="Email"
				/>
				<TextInput
					style={styles.input}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					placeholder="Password"
				/>
				{loading ? (
					<ActivityIndicator size="small" style={{ margin: 28 }} />
				) : (
					<View style={styles.buttonContainer}>
						<CustomButton onPress={signIn} title="Login" />
						<Button onPress={ () => router.push('/signup')} title="or create account" />
					</View>
				)}
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 20,
		flex: 1,
		justifyContent: 'center'
	},
	keyboardAvoidingView: {
		alignItems: 'center', // Center all elements horizontally
		width: '100%', // Ensures it spans the full width
	},
	input: {
		marginVertical: 8, // Increased for better spacing
		height: 48, // Adjusted to standardize height
		width: '100%',
		borderWidth: 1, // Keep borders for structure
		borderRadius: 8, // More rounded corners for a modern feel
		paddingHorizontal: 16, // Better padding for text placement
		backgroundColor: '#f9f9f9', // Subtle background color for contrast
		borderColor: '#ddd', // Light border for clean aesthetics
		fontSize: 16, // Slightly larger font for readability
		color: '#333', // Darker text color for better visibility
		shadowColor: '#000', // Adds subtle shadow
		shadowOffset: { width: 0, height: 2 }, // Horizontal and vertical shadow offset
		shadowOpacity: 0.1, // Light shadow opacity
		shadowRadius: 4, // Soft shadow edges
		elevation: 2 // For shadow effect on Android
	},
	buttonContainer: {
		marginTop: 20, // Spacing between inputs and buttons
		alignItems: 'center', // Center buttons horizontally
		width: '100%', // Ensures the buttons are properly aligned
	},
});
