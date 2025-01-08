import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import EventCard from '../../components/eventCard'; // Ensure path correctness
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2; // Adjust 40 to account for padding and any space between cards

const Home = () => {
    const events = [
        {
            id: 1,
            title: 'Keinemusik Full Set',
            image: require('../../assets/images/keinemusik.png'),
            location: 'Hi Ibiza, Timisoara, Timis, Romania',
            price: 120,
            attendees: 'Chris, Jenna, and 4 others',
        },
        {
            id: 2,
            title: 'Keinemusik Full Set',
            image: require('../../assets/images/keinemusik.png'),
            location: 'Hi Ibiza, Timisoara, Timis, Romania',
            price: 120,
            attendees: 'Chris, Jenna, and 4 others',
        },
        {
            id: 3,
            title: 'Keinemusik Full Set',
            image: require('../../assets/images/keinemusik.png'),
            location: 'Hi Ibiza, Timisoara, Timis, Romania',
            price: 120,
            attendees: 'Chris, Jenna, and 4 others',
        },
        {
            id: 2,
            title: 'Keinemusik Full Set',
            image: require('../../assets/images/keinemusik.png'),
            location: 'Hi Ibiza, Timisoara, Timis, Romania',
            price: 120,
            attendees: 'Chris, Jenna, and 4 others',
        },
        {
            id: 3,
            title: 'Keinemusik Full Set',
            image: require('../../assets/images/keinemusik.png'),
            location: 'Hi Ibiza, Timisoara, Timis, Romania',
            price: 120,
            attendees: 'Chris, Jenna, and 4 others',
        },
    ];

    return (
        <FlatList
            data={events}
            renderItem={({ item }) => <EventCard event={item} cardWidth={cardWidth}/>}
            keyExtractor={item => item.id.toString()}
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
