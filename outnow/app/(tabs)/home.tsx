import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, SectionList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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
import useGoingEvent from "@/hooks/useGoingEvents";


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
    const { goingEvents, fetchGoingEvents } = useGoingEvent();
    const currentDate = new Date();
    const futureEvents = events.filter(e => new Date(e.eventDate) >= currentDate);
    const pastEvents = events.filter(e => new Date(e.eventDate) < currentDate);
    const futureBusinessEvents = myEvents.filter(evt => new Date(evt.eventDate) >= currentDate);
    const pastBusinessEvents = myEvents.filter(evt => new Date(evt.eventDate) < currentDate);
    const groupIntoRows = (data: any[], columns: number) => {
        const rows = [];
        for (let i = 0; i < data.length; i += columns) {
            rows.push(data.slice(i, i + columns));
        }
        return rows;
    };

    const futureRows = groupIntoRows(futureEvents, 2);
    const pastRows = groupIntoRows(pastEvents, 2);

    const businessSections = [
        { title: 'Trending', data: groupIntoRows(futureBusinessEvents, 2) },
        { title: 'Past',     data: groupIntoRows(pastBusinessEvents,   2) },
    ];


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


    useFocusEffect(
        useCallback(() => {
            if (!isBusiness && userId) {
                fetchFavoritedEvents(userId);
                loadEvents();
            }
        }, [isBusiness, userId, fetchFavoritedEvents, loadEvents])
    );

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchGoingEvents(userId);
            }
        }, [userId, fetchGoingEvents])
    );


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
                    <SectionList
                        sections={[
                            { title: 'Trending', data: futureRows },
                            { title: 'Past events', data: pastRows },
                        ]}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item: row }) => (
                            <View style={styles.rowContainer}>
                                {row.map((eventItem: any) => (
                                    <EventCard
                                        key={eventItem.eventId}
                                        event={{
                                            ...eventItem,
                                            isFavorited: favoritedEvents.includes(eventItem.eventId),
                                            isGoing: goingEvents.includes(eventItem.eventId)
                                        }}
                                        cardWidth={cardWidth}
                                        userId={userId}
                                    />
                                ))}
                            </View>
                        )}
                        renderSectionHeader={({
                                                  section,
                                              }: { section: { title: string; data: any[] } }) => (
                            <View style={styles.headerContainer}>
                                <Text style={globalStyles.title}>{section.title}</Text>
                            </View>
                        )}

                        stickySectionHeadersEnabled={true}
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
                        <SectionList
                            sections={businessSections}
                            keyExtractor={(row, idx) =>
                                row.map(evt => evt.eventId).join('-') + '-' + idx
                            }
                            renderItem={({ item: row }) => (
                                <View style={styles.rowContainer}>
                                    {row.map(evt => (
                                        <EventCard
                                            key={evt.eventId}
                                            event={evt}
                                            cardWidth={cardWidth}
                                        />
                                    ))}
                                </View>
                            )}
                            renderSectionHeader={({ section }) => (
                                <View style={styles.headerContainer}>
                                    <Text style={globalStyles.title}>{section.title}</Text>
                                </View>
                            )}
                            stickySectionHeadersEnabled
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
    headerContainer: {
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});


export default Home;
