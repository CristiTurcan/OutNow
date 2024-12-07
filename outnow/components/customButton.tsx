import React from 'react';
import { Pressable, Text, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';

interface CustomButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    title: string;
    style?: ViewStyle; // Accept style as a prop
}

const CustomButton: React.FC<CustomButtonProps> = ({ onPress, title, style }) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                style, // Apply the passed style here
            ]}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 50,
        width: 200,
        backgroundColor: '#193071',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonPressed: {
        backgroundColor: '#45A049',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomButton;
