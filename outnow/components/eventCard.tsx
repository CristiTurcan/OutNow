import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import useAuth from "@/hooks/useAuth";
import useFavoriteEvent from "@/hooks/useFavoriteEvent";
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";

const EventCard = ({ event, cardWidth, onToggleFavorite }) => {
    const [isFavorited, setIsFavorited] = useState(event.isFavorited);
    const { favoriteEvent, removeFavoriteEvent } = useFavoriteEvent();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const {user} = useAuth();
    const { userId } = useUserIdByEmail(user?.email || null);

    const toggleFavorite = async () => {
        if (!userId) {
            console.error('User ID not found for email:', user?.email);
            return;
        }

        try {
            if (isFavorited) {
                await removeFavoriteEvent(userId, event.event_id);
                console.log(`Event ${event.event_id} unfavorited by user ${userId}`);
            } else {
                await favoriteEvent(userId, event.event_id);
                console.log(`Event ${event.event_id} favorited by user ${userId}`);
            }

            const newFavoriteState = !isFavorited;
            setIsFavorited(newFavoriteState);
            if (onToggleFavorite) {
                onToggleFavorite(event.event_id, newFavoriteState);
            }
        } catch (error) {
            console.error('Error toggling favorite status:', error);
        }
    };

    const toggleConfirm = () => {
        setIsConfirmed(!isConfirmed);
    };

    return (
        <View style={[styles.card, { width: cardWidth }]}>
            <Image source={{ uri: event.imageUrl }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.details}>{event.location}</Text>
                <Text style={styles.details}>{`$${event.price}`}</Text>
                <Text style={styles.details}>{`${event.attendees} people are going`}</Text>
                <View style={styles.iconRow}>
                    <TouchableOpacity onPress={toggleFavorite}>
                        <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={24} color={isFavorited ? "red" : "gray"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleConfirm}>
                        <Ionicons
                            name={isConfirmed ? "checkmark-circle" : "checkmark-circle-outline"}
                            size={24}
                            color={isConfirmed ? "green" : "gray"}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Feather name="send" size={24} color="grey" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'column',
        margin: 5,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    info: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    details: {
        fontSize: 14,
        color: 'gray',
    },
    icon: {
        paddingHorizontal: 5,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
});

export default EventCard;
