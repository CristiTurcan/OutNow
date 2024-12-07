import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import auth from '@react-native-firebase/auth';

const Page = () => {
	const user = auth().currentUser;

	const handleSignOut = async () => {
		try {
			await auth().signOut();
		} catch (error) {
			alert('Error signing out: ' + error.message);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.welcomeText}>Welcome back,</Text>
			<Text style={styles.emailText}>{user?.email || 'User'}</Text>
			<TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
				<Text style={styles.signOutButtonText}>Sign Out</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f8f9fa', // Subtle background for better contrast
		padding: 20,
	},
	welcomeText: {
		fontSize: 24,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	emailText: {
		fontSize: 18,
		color: '#555',
		marginBottom: 30,
	},
	signOutButton: {
		backgroundColor: '#ff4757', // Bright color for a clear sign-out button
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 8,
		elevation: 3, // Slight shadow for depth
	},
	signOutButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '500',
	},
});

export default Page;
