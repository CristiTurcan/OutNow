import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Feather, Ionicons} from '@expo/vector-icons';
import useFavoriteEvent from "@/hooks/useFavoriteEvent";
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";
import {useAuthContext} from "@/contexts/AuthContext";
import useBusinessProfile from "@/hooks/useBusinessProfile";
import {router} from "expo-router";

const EventCard = ({event, cardWidth, onToggleFavorite}) => {
    const {isBusiness} = useAuthContext();
    const [isFavorited, setIsFavorited] = useState(event.isFavorited);
    const isGoing = event.isGoing || false;
    const {favoriteEvent, removeFavoriteEvent} = useFavoriteEvent();
    // const [isConfirmed, setIsConfirmed] = useState(false);
    const {user} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {getBusinessProfileById} = useBusinessProfile();
    const [businessUsername, setBusinessUsername] = useState<string>('');
    const businessId = event.businessAccountId;

    useEffect(() => {
        async function fetchProfile() {
            try {
                const profile = await getBusinessProfileById(businessId); // businessId is a number
                setBusinessUsername(profile.username);
            } catch (error) {
                console.error("Error fetching business profile by id", error);
            }
        }

        fetchProfile();
    }, [businessId]);


    const toggleFavorite = async () => {
        if (!userId) {
            console.error('User ID not found for email:', user?.email);
            return;
        }

        try {
            if (isFavorited) {
                await removeFavoriteEvent(userId, event.eventId);
                console.log(`Event ${event.eventId} unfavorited by user ${userId}`);
            } else {
                await favoriteEvent(userId, event.eventId);
                console.log(`Event ${event.eventId} favorited by user ${userId}`);
            }

            const newFavoriteState = !isFavorited;
            setIsFavorited(newFavoriteState);
            if (onToggleFavorite) {
                onToggleFavorite(event.eventId, newFavoriteState);
            }
        } catch (error) {
            console.error('Error toggling favorite status:', error);
        }
    };

    // const toggleConfirm = () => {
    //     setIsConfirmed(!isConfirmed);
    // };

    return (
        <TouchableOpacity
            onPress={() => {
                    router.push(`seeEvent?eventId=${event.eventId}`);
            }}
        >
            <View style={[styles.card, {width: cardWidth}]}>
                <Image source={{uri: event.imageUrl}} style={styles.image}/>
                <View style={styles.info}>
                    <Text style={styles.title}>{event.title}</Text>
                    <Text style={styles.details}>{event.location}</Text>
                    <Text style={styles.details}>{`$${event.price}`}</Text>
                    <Text style={styles.details}>
                        {event.eventDate
                            ? `${new Date(event.eventDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}${event.eventTime ? ' at ' + event.eventTime : ''}`
                            : ''}
                    </Text>
                    <Text style={styles.details}>{`@${businessUsername}`}</Text>
                    <Text style={styles.details}>{`${event.attendees} people are going`}</Text>
                    {!isBusiness && (
                        <View style={styles.iconRow}>
                            <TouchableOpacity onPress={toggleFavorite}>
                                <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={24}
                                          color={isFavorited ? "red" : "gray"}/>
                            </TouchableOpacity>

                            <View>
                                <Ionicons
                                    name={isGoing ? "checkmark-circle" : "checkmark-circle-outline"}
                                    size={24}
                                    color={isGoing ? "green" : "gray"}
                                    style={styles.icon}
                                />
                            </View>


                            <TouchableOpacity>
                                <Feather name="send" size={24} color="grey"/>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
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
