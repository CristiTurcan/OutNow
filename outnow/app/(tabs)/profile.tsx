import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import React from "react";
import auth from "@react-native-firebase/auth";
import {Ionicons} from "@expo/vector-icons";

export default function Profile() {
    const router = useRouter();
    const user = auth().currentUser;

    const handleLogout = () => {
        // Perform any logout logic if needed (e.g., clearing session, Firebase logout, etc.)
        router.replace('/'); // Navigate back to the login screen
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome</Text>
            <Text style={styles.emailText}>{user?.email || 'User'}</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    text: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#FF4757',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emailText: {
        fontSize: 18,
        color: '#555',
        marginBottom: 30,
    },
});
