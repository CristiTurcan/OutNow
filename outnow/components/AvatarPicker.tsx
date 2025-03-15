import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface AvatarPickerProps {
    photoUri: string | null;
    photoBase64: string | null;
    onPress: () => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ photoUri, photoBase64, onPress }) => {
    return (
        <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={onPress}>
                <View style={styles.avatarWrapper}>
                    {photoUri ? (
                        <Image
                            source={{ uri: photoBase64 ? photoBase64 : photoUri }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarPlaceholderText}>No photo</Text>
                        </View>
                    )}
                    <View style={styles.addIconContainer}>
                        <Text style={styles.addIconText}>+</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e1e1e1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        color: '#9b9b9b',
    },
    addIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0D2C66',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIconText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 16,
        textAlign: 'center',
    },
});

export default AvatarPicker;
