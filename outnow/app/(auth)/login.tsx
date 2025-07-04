import React, {useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import CustomButton from "@/components/customButton";
import {router} from "expo-router";
import useAuth from '@/hooks/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {signIn, loading} = useAuth();

    const handleSignIn = async () => {
        try {
            await signIn(email, password);
            router.replace('(tabs)/home');
        } catch (error: any) {
            Alert.alert(
                "Sign in failed",
                "Email or username are not valid!"
            )
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
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

                {/* Forgot Password Button */}
                <TouchableOpacity onPress={() => router.push('(auth)/forgot_password')}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator size="small" style={{margin: 28}}/>
                ) : (
                    <View style={styles.buttonContainer}>
                        <CustomButton onPress={handleSignIn} title="Login" style={styles.loginButton}/>
                        <Button onPress={() => router.push('/(auth)/signup')} title="or create account"/>
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center'
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
    },
    forgotPasswordText: {
        alignSelf: 'flex-end',
        marginTop: 5,
        marginBottom: 15,
        color: '#007BFF',
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginButton: {
        backgroundColor: '#0D2C66',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
});