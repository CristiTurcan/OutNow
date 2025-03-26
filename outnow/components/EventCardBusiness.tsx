import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const EventCardBusiness = ({ event, cardWidth }) => {
    return (
        <View style={[styles.card, { width: cardWidth }]}>
            <Image source={{ uri: event.imageUrl }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.details}>{event.location}</Text>
                <Text style={styles.details}>{`$${event.price}`}</Text>
                <Text style={styles.details}>{`${event.attendees} people are going`}</Text>
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
});

export default EventCardBusiness;
