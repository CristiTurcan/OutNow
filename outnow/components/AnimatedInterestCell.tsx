import React, {useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text} from 'react-native';

interface AnimatedInterestCellProps {
    interest: string;
    isSelected: boolean;
    onPress: () => void;
}

export default function AnimatedInterestCell({
                                                 interest,
                                                 isSelected,
                                                 onPress,
                                             }: AnimatedInterestCellProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 1.07,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.pressableArea}
        >
            <Animated.View
                style={[
                    styles.cellContainer,
                    isSelected && styles.selectedCell,
                    {transform: [{scale: scaleAnim}]},
                ]}
            >
                <Text
                    style={styles.cellText}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    numberOfLines={3}
                    ellipsizeMode="clip"
                >
                    {interest}
                </Text>

            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressableArea: {
        margin: 4,
        flex: 1,
    },
    cellContainer: {
        width: 148,
        height: 80,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ececec',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedCell: {
        borderColor: 'green',
        borderWidth: 2,
        width: 150,
        backgroundColor: '#e9ffe9',
    },
    cellText: {
        padding: 10,
        fontFamily: 'Roboto',
        fontSize: 18,
        color: '#333',
        fontWeight: "500",
        textAlign: 'center',
    },
});
