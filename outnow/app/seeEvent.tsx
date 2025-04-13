import React, {useEffect, useState} from 'react';
import {SafeAreaView, View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CustomBackButton from '@/components/customBackButton';
import CustomButton from '@/components/customButton';
import globalStyles from '@/styles/globalStyles';
import { Ionicons, Feather } from '@expo/vector-icons';
import useEventDetails from '@/hooks/useEventDetails';
import useBusinessProfile from "@/hooks/useBusinessProfile";
import { useAuthContext } from '@/contexts/AuthContext';
import useEvents from "@/hooks/useEvents";
import useFavoriteEvent from '@/hooks/useFavoriteEvent';
import useUserIdByEmail from '../hooks/useUserByIdByEmail';
import useGoingEvent from "@/hooks/useGoingEvents";


export default function SeeEvent() {
    const { eventId: eventIdParam } = useLocalSearchParams() as { eventId: string };
    const eventId = parseInt(eventIdParam, 10);
    const router = useRouter();

    const { event, loading, error } = useEventDetails(eventId);
    const { getBusinessProfileById } = useBusinessProfile();
    const [businessUsername, setBusinessUsername] = useState<string>('');
    const { isBusiness, user } = useAuthContext();
    const { deleteEvent } = useEvents();
    const { userId } = useUserIdByEmail(user?.email || null);
    const { fetchFavoritedEvents, favoritedEvents, favoriteEvent, removeFavoriteEvent } = useFavoriteEvent();
    const { fetchGoingEvents, goingEvents, addGoingEvent, removeGoingEvent } = useGoingEvent();
    const isGoing = userId && goingEvents.includes(event.eventId);

    useEffect(() => {
        if (event && event.businessAccountId) {
            getBusinessProfileById(event.businessAccountId)
                .then(profile => setBusinessUsername(profile.username))
                .catch(err => console.error("Error fetching business profile by id", err));
        }
    }, [event?.businessAccountId]);

    useEffect(() => {
        if (userId) {
            fetchFavoritedEvents(userId);
        }
    }, [userId, fetchFavoritedEvents]);

    useEffect(() => {
        if (userId) {
            fetchGoingEvents(userId);
        }
    }, [userId, fetchGoingEvents]);


    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error}</Text>;
    if (!event) return <Text>No event found</Text>;

    const handleDelete = async () => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                        try {
                            await deleteEvent(eventId);
                            // Navigate back to home or events list after deletion
                            router.replace('/(tabs)/home');
                        } catch (err) {
                            console.error("Error deleting event", err);
                        }
                    } }
            ]
        );
    };

    const handleBuyOrRefund = () => {
        if (!userId) {
            console.error('User ID is missing.');
            return;
        }

        if (!isGoing) {
            Alert.alert(
                "Buy Event",
                "Are you sure you want to buy this event?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Buy", onPress: async () => {
                            try {
                                await addGoingEvent(userId, event.eventId);
                                fetchGoingEvents(userId);
                            } catch (err) {
                                console.error("Error buying event:", err);
                            }
                        }
                    }
                ]
            );
        } else {
            Alert.alert(
                "Refund Event",
                "Are you sure you want to refund this event?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Refund", onPress: async () => {
                            try {
                                await removeGoingEvent(userId, event.eventId);
                                fetchGoingEvents(userId);
                            } catch (err) {
                                console.error("Error refunding event:", err);
                            }
                        }
                    }
                ]
            );
        }
    };


    const handleToggleFavorite = async () => {
        if (!userId) {
            console.error('User ID is missing.');
            return;
        }

        const isFav = favoritedEvents.includes(event.eventId);
        try {
            if (isFav) {
                await removeFavoriteEvent(userId, event.eventId);
            } else {
                await favoriteEvent(userId, event.eventId);
            }
            // Refresh favorites after toggling
            fetchFavoritedEvents(userId);
        } catch (err) {
            console.error('Error toggling favorite status:', err);
        }
    };

    const isFavorited = userId && favoritedEvents.includes(event.eventId);

    return (
        <SafeAreaView style={globalStyles.container}>
            {/* Header */}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton} />
                <Text style={globalStyles.title}>Event Details</Text>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <Image source={{ uri: event.imageUrl }} style={styles.image} />
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.details}>{event.description}</Text>
                <Text style={styles.details}>{`Location: ${event.location}`}</Text>
                <Text style={styles.details}>{`Price: $${event.price}`}</Text>
                <Text style={styles.details}>
                    {event.eventDate
                        ? `${new Date(event.eventDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })}${event.eventTime ? ' at ' + event.eventTime : ''}`
                        : ''}
                </Text>
                <Text style={styles.details}>{`By: ${businessUsername || ''}`}</Text>
                <Text style={styles.details}>{`${event.attendees} people are going`}</Text>
                <Text style={styles.details}>{`Type: ${event.interestList}`}</Text>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {!isBusiness && (
                    <>
                        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                            <Ionicons
                                name={isFavorited ? "heart" : "heart-outline"}
                                size={28}
                                color={isFavorited ? "red" : "gray"}
                            />
                        </TouchableOpacity>
                        <CustomButton
                            title={isGoing ? "Refund" : "Buy"}
                            onPress={handleBuyOrRefund}
                            style={globalStyles.nextButton}
                        />
                    </>
                )}
                {isBusiness && (
                    <>
                        <TouchableOpacity onPress={handleDelete} style={styles.favoriteButton}>
                            <Ionicons name="trash-outline" size={28} color="gray" />
                        </TouchableOpacity>
                        <CustomButton
                            title="Edit"
                            onPress={() => router.push(`/editEvent?eventId=${event.eventId}`)}
                            style={globalStyles.nextButton}
                        />

                    </>


                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginVertical: 16,
        resizeMode: 'cover',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    details: {
        fontSize: 16,
        marginBottom: 8,
        color: 'gray',
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 5,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f2f2f2',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    favoriteButton: {
        padding: 8,
    },
});
