import React, {useRef, useState} from 'react';
import {Alert, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import CustomButton from '@/components/customButton';
import globalStyles from '@/styles/globalStyles';
import CustomBackButton from "@/components/customBackButton";
import useGoingEvent from "@/hooks/useGoingEvents";
import {useAuthContext} from "@/contexts/AuthContext";
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";

export default function BuyMockup() {
    const router = useRouter();
    const {eventId, quantity} = useLocalSearchParams() as { eventId: string; quantity: string };
    const ticketQty = parseInt(quantity, 10) || 1;
    const {addGoingEvent, fetchGoingEvents} = useGoingEvent();
    const {user} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);

    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const [nameError, setNameError] = useState<string | null>(null);
    const [numberError, setNumberError] = useState<string | null>(null);
    const [expError, setExpError] = useState<string | null>(null);
    const [cvcError, setCvcError] = useState<string | null>(null);

    const numberRef = useRef<TextInput>(null);
    const expRef = useRef<TextInput>(null);
    const cvcRef = useRef<TextInput>(null);

    const luhnCheck = (num: string) => {
        const digits = num.replace(/\D/g, '').split('').reverse().map(d => parseInt(d, 10));
        let sum = 0;
        for (let i = 0; i < digits.length; i++) {
            let digit = digits[i];
            if (i % 2 === 1) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
        }
        return sum % 10 === 0;
    };

    const validate = () => {
        if (!cardName.trim()) {
            Alert.alert('Validation Error', 'Please enter the cardholder name.');
            return false;
        }
        const rawNumber = cardNumber.replace(/\s+/g, '');
        if (rawNumber.length < 13 || rawNumber.length > 19 || !luhnCheck(rawNumber)) {
            Alert.alert('Validation Error', 'Please enter a valid card number.');
            return false;
        }
        const [monthStr, yearStr] = expiry.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt('20' + yearStr, 10);
        const now = new Date();
        if (!month || month < 1 || month > 12 || !yearStr || isNaN(year)) {
            Alert.alert('Validation Error', 'Expiry date must be in MM/YY format.');
            return false;
        }
        const expDate = new Date(year, month - 1, 1);
        if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
            Alert.alert('Validation Error', 'Card has expired.');
            return false;
        }
        if (!/^[0-9]{3,4}$/.test(cvc)) {
            Alert.alert('Validation Error', 'CVC must be 3 or 4 digits.');
            return false;
        }
        return true;
    };

    const validateName = (text: string) => {
        if (text.trim().length < 3) {
            setNameError('Name must be at least 3 characters');
            return false;
        }
        setNameError(null);
        return true;
    };

    const validateNumber = (formatted: string) => {
        const raw = formatted.replace(/\s+/g, '');
        if (raw.length < 13 || raw.length > 19 || !luhnCheck(raw)) {
            setNumberError('Invalid card number');
            return false;
        }
        setNumberError(null);
        return true;
    };

    const validateExpiry = (text: string) => {
        const [mm, yy] = text.split('/');
        const month = parseInt(mm, 10);
        const year = parseInt('20' + yy, 10);
        if (!mm || !yy || month < 1 || month > 12 || isNaN(year)) {
            setExpError('MM/YY format required');
            return false;
        }
        const now = new Date();
        const expDate = new Date(year, month - 1, 1);
        if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
            setExpError('Card expired');
            return false;
        }
        setExpError(null);
        return true;
    };

    const validateCvc = (text: string) => {
        if (!/^[0-9]{3,4}$/.test(text)) {
            setCvcError('CVC must be 3 or 4 digits');
            return false;
        }
        setCvcError(null);
        return true;
    };

    const allValid =
        !nameError &&
        !numberError &&
        !expError &&
        !cvcError &&
        cardName &&
        cardNumber &&
        expiry &&
        cvc;

    const onSubmit = async () => {
        Keyboard.dismiss();
        if (!validateName(cardName) || !validateNumber(cardNumber) || !validateExpiry(expiry) || !validateCvc(cvc)) {
            return;
        }
        if (!userId) {
            console.error('User ID missing');
            return;
        }
        try {
            await addGoingEvent(userId, parseInt(eventId, 10), ticketQty);
            await fetchGoingEvents(userId);
            router.replace('/(tabs)/home');
        } catch (err) {
            console.error('Purchase error', err);
            Alert.alert('Purchase failed', 'Please try again.');
        }
    };

    const handleBuy = () => {
        if (!validate()) return;
        if (!userId) {
            console.error('User ID is missing.');
            return;
        }

        addGoingEvent(userId, parseInt(eventId, 10), ticketQty)
            .then(() => {
                fetchGoingEvents(userId);
                router.replace('/(tabs)/home');
            })
            .catch(err => console.error('Error buying event:', err));
    };

    return (
        <SafeAreaView style={globalStyles.container}>

            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Payment Details</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <TextInput
                    style={[styles.input, {textTransform: 'uppercase'}]}
                    placeholder="Cardholder Name"
                    value={cardName}
                    onChangeText={text => {
                        const sanitized = text.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
                        setCardName(sanitized);
                        validateName(sanitized);
                    }}
                    onBlur={() => validateName(cardName)}
                    autoCapitalize={"characters"}
                    onSubmitEditing={() => numberRef.current?.focus()}
                />
                {nameError && <Text style={globalStyles.errorText}>{nameError}</Text>}

                <TextInput
                    ref={numberRef}
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChangeText={text => {
                        const raw = text.replace(/\D/g, ''); // keep only digits
                        const formatted = raw.match(/.{1,4}/g)?.join(' ') ?? raw;
                        setCardNumber(formatted);
                        validateNumber(formatted);
                        if (raw.length === 16) expRef.current?.focus();
                    }}

                    keyboardType="number-pad"
                />
                {numberError && <Text style={globalStyles.errorText}>{numberError}</Text>}

                <TextInput
                    ref={expRef}
                    style={styles.input}
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={text => {
                        const clean = text.replace(/\D/g, '');
                        const m = clean.slice(0, 2);
                        const y = clean.slice(2, 4);
                        const formatted = y ? `${m}/${y}` : m;
                        setExpiry(formatted);
                        validateExpiry(formatted);
                        if (y.length === 2) cvcRef.current?.focus();
                    }}
                    keyboardType="number-pad"
                />
                {expError && <Text style={globalStyles.errorText}>{expError}</Text>}

                <TextInput
                    ref={cvcRef}
                    style={styles.input}
                    placeholder="CVC"
                    value={cvc}
                    onChangeText={text => {
                        const digits = text.replace(/\D/g, '');
                        setCvc(digits);
                        validateCvc(digits);
                    }}

                    keyboardType="number-pad"
                    maxLength={4}
                />
                {cvcError && <Text style={globalStyles.errorText}>{cvcError}</Text>}
            </ScrollView>
            <View style={styles.footer}>
                <CustomButton
                    onPress={handleBuy}
                    title={'Buy'}
                    style={globalStyles.nextButton}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    half: {
        flex: 0.48,
    },
    button: {
        marginTop: 24,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f2f2f2',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
});
