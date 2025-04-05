import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import EventCard from '../../components/eventCard';
import {Dimensions} from 'react-native';
import useFavoriteEvent from "@/hooks/useFavoriteEvent";
import {useAuthContext} from '@/contexts/AuthContext';
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";
import {useFocusEffect} from '@react-navigation/native';
import {useAllEvents} from '@/hooks/useAllEvents';
import LoadingIndicator from '@/components/LoadingIndicator';
import CustomButton from "@/components/customButton";
import globalStyles from "@/styles/globalStyles";
import {router} from "expo-router";
import useMyEvents from "@/hooks/useMyEvents";
import useBusinessProfile from "@/hooks/useBusinessProfile";
import EventCardBusiness from "@/components/EventCardBusiness";
import useAuth from "@/hooks/useAuth";
import {BASE_URL} from "@/config/api";

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;

const Home = () => {
    const {user, isBusiness} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {fetchFavoritedEvents, favoritedEvents} = useFavoriteEvent();
    const {events, loading, error, loadEvents} = useAllEvents();
    const {getBusinessProfile} = useBusinessProfile();
    const [businessProfile, setBusinessProfile] = useState(null);
    const [businessAccountId, setBusinessAccountId] = useState<String | null>(null);
    const {events: myEvents, loading: myEventsLoading, error: myEventsError} = useMyEvents(businessAccountId);

    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessProfile(user.email)
                .then(data => {
                    setBusinessProfile(data);
                    setBusinessAccountId(data.email);
                })
                .catch(err => console.error("Error fetching business profile:", err));
        }
    }, [isBusiness, user?.email]);

    useEffect(() => {
        if (!isBusiness) {
            loadEvents();
        }
    }, [isBusiness, loadEvents]);


    // useFocusEffect(
    //     useCallback(() => {
    //         if (!isBusiness && userId) {
    //             fetchFavoritedEvents(userId);
    //             loadEvents();
    //         }
    //     }, [isBusiness, userId, fetchFavoritedEvents, loadEvents])
    // );


    const addEvent = () => {
        router.push('/createEvent');
    }

    if (loading) {
        return <LoadingIndicator/>;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            {!isBusiness && (
                <>
                    <FlatList
                        data={events}
                        renderItem={({item}) => (
                            <EventCard
                                event={{...item, isFavorited: favoritedEvents.includes(item.eventId)}}
                                cardWidth={cardWidth}
                                userId={userId}
                            />
                        )}
                        keyExtractor={(item) => item.eventId.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.column}
                        contentContainerStyle={styles.container}
                    />
                </>
            )}
            {isBusiness && (
                <>
                    {myEventsLoading ? (
                        <LoadingIndicator/>
                    ) : myEventsError ? (
                        <Text>Error: {myEventsError}</Text>
                    ) : (
                        <FlatList
                            data={myEvents}
                            renderItem={({item}) => (
                                <EventCardBusiness
                                    event={item}
                                    cardWidth={cardWidth}
                                />
                            )}
                            keyExtractor={(item) => item.eventId.toString()}
                            numColumns={2}
                            columnWrapperStyle={styles.column}
                            contentContainerStyle={styles.container}
                        />
                    )}
                    <View style={globalStyles.centeredFooter}>
                        <CustomButton
                            onPress={addEvent}
                            title="Add Event"
                            style={globalStyles.nextButton}
                        />
                    </View>
                </>
            )}
        </SafeAreaView>
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
