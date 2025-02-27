import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import EventCard from '../../components/eventCard';
import useFavoriteEvent from '@/hooks/useFavoriteEvent';
import useAuth from '@/hooks/useAuth';
import useUserIdByEmail from '@/hooks/useUserByIdByEmail';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useEvents } from '@/hooks/useEvents';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;

export default function Favorites() {
    const { user } = useAuth();
    const { userId } = useUserIdByEmail(user?.email || null);
    const { fetchFavoritedEvents, favoritedEvents, removeFavoriteEvent, favoriteEvent } = useFavoriteEvent();
    const { events, loading, error, loadEvents } = useEvents(favoritedEvents);

    // Fetch favorites when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchFavoritedEvents(userId);
            }
        }, [userId, fetchFavoritedEvents])
    );

    // Reload events whenever the favorites change
    useEffect(() => {
        loadEvents();
    }, [favoritedEvents, loadEvents]);

    // Callback to handle favorite/unfavorite toggle
    const handleToggleFavorite = async (eventId: number, isFavorited: boolean) => {
        if (!userId) {
            console.error('User ID is missing.');
            return;
        }

        try {
            if (isFavorited) {
                await removeFavoriteEvent(userId, eventId);
            } else {
                await favoriteEvent(userId, eventId);
            }
            // Refresh favorites list to update UI
            fetchFavoritedEvents(userId);
        } catch (err) {
            console.error('Error toggling favorite status:', err);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (events.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No favorited events yet.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={events}
            renderItem={({ item }) => (
                <EventCard
                    event={{ ...item, isFavorited: favoritedEvents.includes(item.event_id) }}
                    cardWidth={cardWidth}
                    onToggleFavorite={(isFavorited) => handleToggleFavorite(item.event_id, isFavorited)}
                />
            )}
            keyExtractor={(item) => item.event_id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.column}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#333',
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    column: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});
