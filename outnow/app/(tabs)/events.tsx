import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import EventCard from '../../components/eventCard';
import useFavoriteEvent from '@/hooks/useFavoriteEvent';
import useAuth from '@/hooks/useAuth';
import useUserIdByEmail from '@/hooks/useUserByIdByEmail';
import { Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;

export default function Favorites() {
    const [events, setEvents] = useState([]);
    const [favoritedEventIds, setFavoritedEventIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const user = useAuth();
    const { userId } = useUserIdByEmail(user?.email || null);
    const { fetchFavoritedEvents, removeFavoriteEvent, favoriteEvent } = useFavoriteEvent();

    // Fetch favorited event IDs from the backend
    const fetchFavorites = useCallback(async () => {
        if (userId) {
            setLoading(true);
            try {
                const favorites = await fetchFavoritedEvents(userId);
                setFavoritedEventIds(favorites); // Store the IDs of favorited events
            } catch (err) {
                console.error('Error fetching favorited events:', err);
                setError('Failed to load favorited events');
            } finally {
                setLoading(false);
            }
        }
    }, [userId, fetchFavoritedEvents]);

    // Fetch event details and filter by favoritedEventIds
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/event/v1/');
            const allEvents = await response.json();

            // Filter events based on favorited IDs
            const filteredEvents = allEvents.filter(event => favoritedEventIds.includes(event.event_id));
            setEvents(filteredEvents); // Update the displayed events
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [favoritedEventIds]);

    useFocusEffect(
        useCallback(() => {
            fetchFavorites(); // Fetch favorites whenever the screen is focused
        }, [fetchFavorites])
    );

    useFocusEffect(
        useCallback(() => {
            if (favoritedEventIds.length > 0) {
                fetchEvents();
            } else {
                setEvents([]); // Clear events if no favorites
                setLoading(false);
            }
        }, [favoritedEventIds, fetchEvents])
    );

    // Callback to handle favorite/unfavorite toggle
    const handleToggleFavorite = async (eventId: number, isFavorited: boolean) => {
        if (!userId) {
            console.error('User ID is missing.');
            return;
        }

        try {
            if (isFavorited) {
                await removeFavoriteEvent(userId, eventId);
                setFavoritedEventIds((prev) => prev.filter((id) => id !== eventId));
            } else {
                await favoriteEvent(userId, eventId);
                setFavoritedEventIds((prev) => [...prev, eventId]);
            }

            // Update events to reflect the change
            setEvents((prevEvents) =>
                prevEvents.map((event) =>
                    event.event_id === eventId ? { ...event, isFavorited: !isFavorited } : event
                )
            );
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
                    event={{ ...item, isFavorited: favoritedEventIds.includes(item.event_id) }}
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
