// CustomBackButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';

type CustomBackButtonProps = {
    text?: string;
    style?: ViewStyle;
};

export default function CustomBackButton({ text = '← Back', style }: CustomBackButtonProps) {
    const router = useRouter();

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={() => router.back()}>
            <Text style={styles.text}>← {text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: 70,
        left: 5,
        zIndex: 10,
    },
    text: {
        fontSize: 16,
        color: '#007AFF',
    },
});
