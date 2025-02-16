import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

type CustomBackButtonProps = {
    text?: string; // Optional text prop
};

export default function CustomBackButton({ text = '← Back' }: CustomBackButtonProps) {
    const router = useRouter();

    return (
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.text}>← {text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: 70, // Adjust for safe area
        left: 5, // Adjust for padding
        zIndex: 10, // Ensure it stays above other content
    },
    text: {
        fontSize: 16,
        color: '#007AFF', // iOS-style blue
    },
});
