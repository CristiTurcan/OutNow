import React from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    SafeAreaView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup';
import CustomButton from '@/components/customButton';
import CustomBackButton from '@/components/customBackButton';
import {router} from 'expo-router';
import useAuth from '@/hooks/useAuth';
import auth from '@react-native-firebase/auth';
import globalStyles from "@/styles/globalStyles";
import useBusinessProfile from '@/hooks/useBusinessProfile';

interface FormData {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    isBusiness: boolean;
}

const schema = yup.object().shape({
    email: yup
        .string()
        .email('Invalid email format')
        .required('Email is required')
        .test(
            'email-availability',
            'Email is already registered',
            async (value) => {
                if (!value) return false;
                try {
                    const methods = await auth().fetchSignInMethodsForEmail(value);
                    return methods.length === 0;
                } catch (error) {
                    return true;
                }
            }
        ),
    username: yup.string().required('Username is required'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(20, 'Password cannot be more than 20 characters')
        .matches(/(?=.*[!@#$%^&*])/, 'Password must contain at least one special character')
        .required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    isBusiness: yup.boolean(),
});

export default function SignUp() {
    const {signUp, loading} = useAuth();
    const {updateBusinessProfile, loading: businessProfileLoading, error: businessProfileError} = useBusinessProfile();

    const {
        control,
        handleSubmit,
        formState: {errors},
    } = useForm<FormData>({
        resolver: yupResolver(schema, {abortEarly: false}),
        mode: 'onBlur',
        criteriaMode: 'all',
    });

    const onSubmit = (data: FormData) => {
        router.push(
            `(auth)/createProfile?isBusiness=${data.isBusiness}&email=${data.email}&username=${data.username}&password=${data.password}`
        );
    };


    type FieldError = { message?: string; types?: Record<string, string> };

    const renderErrors = (error: FieldError) => {
        if (error.types) {
            return Object.values(error.types).map((msg, index) => (
                <Text key={index} style={styles.errorText}>
                    {String(msg)}
                </Text>
            ));
        }
        return <Text style={styles.errorText}>{error.message}</Text>;
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={globalStyles.container}>
                <View style={globalStyles.headerRow}>
                    <CustomBackButton text="" style={globalStyles.backButton}/>
                    <Text style={globalStyles.title}>Sign Up</Text>
                </View>
                <View style={styles.container}>
                    <KeyboardAvoidingView behavior="padding" style={styles.keyboardAvoidingView}>
                        <Controller<FormData>
                            control={control}
                            name="email"
                            render={({field: {onChange, onBlur, value}}) => (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                    {errors.email && renderErrors(errors.email)}
                                </>
                            )}
                        />
                        <Controller<FormData>
                            control={control}
                            name="username"
                            render={({field: {onChange, onBlur, value}}) => (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Username"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                    {errors.username && renderErrors(errors.username)}
                                </>
                            )}
                        />
                        <Controller<FormData>
                            control={control}
                            name="password"
                            render={({field: {onChange, onBlur, value}}) => (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        secureTextEntry
                                    />
                                    {errors.password && renderErrors(errors.password)}
                                </>
                            )}
                        />
                        <Controller<FormData>
                            control={control}
                            name="confirmPassword"
                            render={({field: {onChange, onBlur, value}}) => (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        secureTextEntry
                                    />
                                    {errors.confirmPassword && renderErrors(errors.confirmPassword)}
                                </>
                            )}
                        />
                        <Controller
                            control={control}
                            name="isBusiness"
                            render={({field: {onChange, value}}) => (
                                <View style={styles.checkboxContainer}>
                                    <Switch value={value} onValueChange={onChange}/>
                                    <Text style={styles.label}>Business Account</Text>
                                </View>
                            )}
                        />
                        <View style={styles.buttonContainer}>
                            {/* this button avoids signup validation */}
                            {/*<CustomButton onPress={() => router.push('(auth)/createProfile')} title="Sign Up"*/}
                            {/*              disabled={loading} style={styles.signupButton}/>  */}
                            <CustomButton onPress={handleSubmit(onSubmit)} title="Sign Up"
                                          disabled={loading} style={styles.signupButton}/>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signupButton: {
        backgroundColor: '#0D2C66',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        alignItems: 'flex-start',
        alignSelf: "flex-start",
        marginVertical: 8,
    },
    label: {
        fontSize: 16,
        marginHorizontal: 8,
        color: '#333',
    },
});
