import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="editProfile"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="editInterests"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="notification"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="information"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="editFollow"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="myData"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
