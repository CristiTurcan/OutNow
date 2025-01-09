import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet, Text, ActivityIndicator} from 'react-native';
import EventCard from '../../components/eventCard'; // Ensure path correctness
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2; // Adjust 40 to account for padding and any space between cards

const Home = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        fetch('http://localhost:8080/event/v1/') // Adjust this URL to your server
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setEvents(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                setError(error.toString());
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <FlatList
            data={events}
            renderItem={({ item }) => <EventCard event={item} cardWidth={cardWidth} />}
            keyExtractor={item => item.event_id.toString()} // Ensure your key extractor matches the unique identifier from your API
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
