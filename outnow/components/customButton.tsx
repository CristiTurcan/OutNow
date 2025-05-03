// CustomButton.tsx
import React from 'react';
import {GestureResponderEvent, Pressable, StyleSheet, Text, ViewStyle,} from 'react-native';

interface CustomButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    title: string;
    style?: ViewStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({onPress, title, style}) => {
    return (
        <Pressable
            style={({pressed}) => [
                styles.buttonBase,
                style, // Apply external style
                pressed && styles.buttonPressed,
            ]}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    buttonBase: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default CustomButton;
