import { View, TextInput, StyleSheet, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { FirebaseError } from 'firebase/app';
import CustomButton from '@/components/customButton';
import { router } from 'expo-router';
import CustomBackButton from '@/components/customBackButton';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordsMatch = password === confirmPassword;

    const signUp = async () => {
        if (!passwordsMatch) {
            alert('Passwords do not match!');
            return;
        }

        setLoading(true);
        try {
            await auth().createUserWithEmailAndPassword(email, password);
            router.replace('/home');
        } catch (e: any) {
            const err = e as FirebaseError;
            alert('Registration failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CustomBackButton text="Login" />
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
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholder="Username"
                />
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Password"
                />
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Confirm Password"
                />
                <View style={styles.buttonContainer}>
                    <CustomButton
                        onPress={signUp}
                        title="Sign Up"
                        disabled={!passwordsMatch || loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    },
    keyboardAvoidingView: {
        alignItems: 'center',
        width: '100%',
    },
    input: {
        marginVertical: 8,
        height: 48,
        width: '100%',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f9f9f9',
        borderColor: '#ddd',
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonContainer: {
        marginTop: 20,
        alignItems: 'center',
        width: '100%',
    },
});
