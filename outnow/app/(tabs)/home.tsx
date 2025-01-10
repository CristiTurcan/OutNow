import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import EventCard from '../../components/eventCard'; // Ensure path correctness
import { Dimensions } from 'react-native';
import useFavoriteEvent from "@/hooks/useFavoriteEvent";
import useAuth from "@/hooks/useAuth";
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";
import { useFocusEffect } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2; // Adjust 40 to account for padding and any space between cards

const Home = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [favoritedEvents, setFavoritedEvents] = useState<number[]>([]);
    const user = useAuth(); // Get Firebase user
    const { userId } = useUserIdByEmail(user?.email || null); // Get userId from backend
    const { fetchFavoritedEvents } = useFavoriteEvent();

    // Fetch favorited events
    const fetchFavorites = useCallback(async () => {
        if (userId) {
            try {
                const favorites = await fetchFavoritedEvents(userId); // Fetch favorited event IDs
                setFavoritedEvents(favorites);
                console.log("Favorited events set: ", favorites);
            } catch (err) {
                console.error("Error fetching favorited events:", err);
            }
        }
    }, [userId, fetchFavoritedEvents]);

    // Fetch events from the server
    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8080/event/v1/'); // Adjust this URL to your server
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setEvents(data);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError(err.toString());
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Use focus effect to fetch data when the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
            fetchEvents();
        }, [fetchFavorites, fetchEvents])
    );

    if (isLoading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
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
            keyExtractor={(item) => item.event_id.toString()} // Ensure your key extractor matches the unique identifier from your API
            numColumns={2} // Use two columns
            columnWrapperStyle={styles.column}
            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10, // Horizontal padding around the grid
        paddingTop: 10, // Padding at the top of the list
    },
    column: {
        justifyContent: 'space-between', // Ensures there is space between columns
        marginBottom: 10, // Bottom margin for each row
    },
});

export default Home;
