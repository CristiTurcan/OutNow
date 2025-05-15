import React, {useState} from 'react';
import {Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
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

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');

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
        if (!name.trim()) {
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
                    style={styles.input}
                    placeholder="Cardholder Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Card Number"
                    value={cardNumber}
                    onChangeText={text => setCardNumber(text.replace(/(\d{4})(?=\d)/g, '$1 '))}
                    keyboardType="numeric"
                    maxLength={19 + 3} // spaces
                />

                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, styles.half]}
                        placeholder="MM/YY"
                        value={expiry}
                        onChangeText={setExpiry}
                        keyboardType="numeric"
                        maxLength={5}
                    />

                    <TextInput
                        style={[styles.input, styles.half]}
                        placeholder="CVC"
                        value={cvc}
                        onChangeText={setCvc}
                        keyboardType="numeric"
                        secureTextEntry
                        maxLength={4}
                    />
                </View>
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
