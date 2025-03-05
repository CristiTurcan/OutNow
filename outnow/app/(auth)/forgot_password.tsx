import React, { useState } from 'react';
import {View, TextInput, Button, Alert, StyleSheet, Text, SafeAreaView} from 'react-native';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';
import CustomBackButton from "@/components/customBackButton";
import globalStyles from "@/styles/globalStyles";

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const resetPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        setLoading(true);
        try {
            await auth().sendPasswordResetEmail(email);
            Alert.alert("Success", "Check your email for reset instructions.");
            router.replace('/(auth)/login');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Reset Password</Text>
            </View>
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Button title="Send Reset Link" onPress={resetPassword} disabled={loading} />
            </View>
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 30,
        flex: 1,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    instructions: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#555',
    },
    input: {
        marginVertical: 10,
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f9f9f9',
        borderColor: '#ddd',
        fontSize: 16,
        color: '#333',
    },
});