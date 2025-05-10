import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import CustomBackButton from '@/components/customBackButton';
import CustomButton from '@/components/customButton';
import globalStyles from '@/styles/globalStyles';
import {Ionicons} from '@expo/vector-icons';
import useEventDetails, {EventDetails} from '@/hooks/useEventDetails';
import useBusinessProfile from "@/hooks/useBusinessProfile";
import {useAuthContext} from '@/contexts/AuthContext';
import useEvents from "@/hooks/useEvents";
import useFavoriteEvent from '@/hooks/useFavoriteEvent';
import useUserIdByEmail from '../hooks/useUserByIdByEmail';
import useGoingEvent from "@/hooks/useGoingEvents";
import {useEventSocket} from "@/hooks/useEventSocket";
import {EventDTO} from "@/types/EventDTO";


export default function SeeEvent() {
    const {eventId: eventIdParam} = useLocalSearchParams() as { eventId: string };
    const eventId = parseInt(eventIdParam, 10);
    const router = useRouter();

    const {event, loading, error} = useEventDetails(eventId);
    const initialEvents = useMemo(() => (event ? [event] : []), [event]);
    const [eventState] = useEventSocket<EventDetails>(initialEvents);
    const {getBusinessProfileById} = useBusinessProfile();
    const [businessUsername, setBusinessUsername] = useState<string>('');
    const {isBusiness, user} = useAuthContext();
    const {deleteEvent} = useEvents();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {fetchFavoritedEvents, favoritedEvents, favoriteEvent, removeFavoriteEvent} = useFavoriteEvent();
    const {fetchGoingEvents, goingEvents, addGoingEvent, removeGoingEvent} = useGoingEvent();
    const isGoing = userId && goingEvents.includes(event?.eventId);
    const eventDate = new Date(event?.eventDate);
    const isPast = eventDate < new Date();
    const showControls = !isBusiness && (isGoing || !isPast);


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
    if (!eventState) return <Text>No event found</Text>;

    const handleDelete = async () => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event?",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        try {
                            await deleteEvent(eventId);
                            // Navigate back to home or events list after deletion
                            router.replace('/(tabs)/home');
                        } catch (err) {
                            console.error("Error deleting event", err);
                        }
                    }
                }
            ]
        );
    };

    const handleBuyOrRefund = () => {
        if (!userId) {
            console.error('User ID is missing.');
            return;
        }

        if (!isGoing) {
            router.push({
                pathname: '/buyMockup',
                params: {eventId: eventState.eventId.toString()},
            });
        } else {
            Alert.alert(
                "Refund Event",
                "Are you sure you want to refund this event?",
                [
                    {text: "Cancel", style: "cancel"},
                    {
                        text: "Refund", onPress: async () => {
                            try {
                                await removeGoingEvent(userId, eventState.eventId);
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

        const isFav = favoritedEvents.includes(eventState.eventId);
        try {
            if (isFav) {
                await removeFavoriteEvent(userId, eventState.eventId);
            } else {
                await favoriteEvent(userId, eventState.eventId);
            }
            // Refresh favorites after toggling
            fetchFavoritedEvents(userId);
        } catch (err) {
            console.error('Error toggling favorite status:', err);
        }
    };

    const isFavorited = userId && favoritedEvents.includes(eventState.eventId);

    return (
        <SafeAreaView style={globalStyles.container}>
            {/* Header */}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Event Details</Text>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.content}>
                <Image source={{uri: eventState.imageUrl}} style={styles.image}/>
                <Text style={styles.title}>{eventState.title}</Text>
                <Text style={styles.details}>{eventState.description}</Text>
                <Text style={styles.details}>{`Location: ${eventState.location}`}</Text>
                <Text style={styles.details}>{`Price: $${eventState.price}`}</Text>
                <Text style={styles.details}>
                    {eventState.eventDate
                        ? `${new Date(eventState.eventDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        })}${eventState.eventTime ? ' at ' + eventState.eventTime : ''}`
                        : ''}
                </Text>
                {/*<Text style={styles.details}>{`By: ${businessUsername || ''}`}</Text>*/}
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/profilePreview',
                        params: {businessAccountId: eventState.businessAccountId}
                    })}
                >
                    <Text style={[styles.details, {color: '#007AFF'}]}>
                        {`By: ${businessUsername || ''}`}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.details}>{`${eventState.attendees} people are going`}</Text>
                <Text style={styles.details}>{`Type: ${eventState.interestList}`}</Text>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {!isBusiness && !(isPast && !isGoing) && (
                    <>
                        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                            <Ionicons
                                name={isFavorited ? "heart" : "heart-outline"}
                                size={28}
                                color={isFavorited ? "red" : "gray"}
                            />
                        </TouchableOpacity>
                        <CustomButton
                            title={isPast ? "Feedback" : (isGoing ? "Refund" : "Buy")}
                            onPress={isPast
                                ? () => router.push(`/feedback?eventId=${eventState.eventId}`)
                                : handleBuyOrRefund}
                            style={globalStyles.nextButton}
                        />

                    </>
                )}
                {isBusiness && (
                    <>
                        <TouchableOpacity onPress={handleDelete} style={styles.favoriteButton}>
                            {!isPast && (
                                <Ionicons name="trash-outline" size={28} color="gray"/>
                            )}
                        </TouchableOpacity>
                        <CustomButton
                            title={"Statistics"}
                            onPress={() => router.push(`/statistics?eventId=${eventState.eventId}`)}
                            style={globalStyles.nextButton}
                        />
                        <CustomButton
                            title={"Edit"}
                            onPress={() => router.push(`/editEvent?eventId=${eventState.eventId}`)}
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
