// addInterests.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function AddInterests() {
    const handleFinish = () => {
        // Once the user has chosen interests, navigate to home
        router.replace('(tabs)/home');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Interests</Text>
            {/* Add your UI for selecting interests here */}
            <Button title="Finish" onPress={handleFinish} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        marginBottom: 16,
    },
});
