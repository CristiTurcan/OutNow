// src/screens/Home.tsx
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import EventCard from '../../components/eventCard';
import { Dimensions } from 'react-native';
import useFavoriteEvent from "@/hooks/useFavoriteEvent";
import useAuth from "@/hooks/useAuth";
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";
import { useFocusEffect } from '@react-navigation/native';
import { useAllEvents } from '@/hooks/useAllEvents';
import LoadingIndicator from '@/components/LoadingIndicator';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;

const Home = () => {
    const {user} = useAuth(); // Get Firebase user
    const { userId } = useUserIdByEmail(user?.email || null); // Get userId from backend
    const { fetchFavoritedEvents, favoritedEvents } = useFavoriteEvent();
    const { events, loading, error, loadEvents } = useAllEvents();

    // Fetch both events and favorites when the screen is focused
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchFavoritedEvents(userId);
            }
            loadEvents();
        }, [userId, fetchFavoritedEvents, loadEvents])
    );

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <FlatList
            data={events}
            renderItem={({ item }) => (
                <EventCard
                    event={{ ...item, isFavorited: favoritedEvents.includes(item.event_id) }}
                    cardWidth={cardWidth}
                    userId={userId}
                />
            )}
            keyExtractor={(item) => item.event_id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.column}
            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    column: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});

export default Home;
