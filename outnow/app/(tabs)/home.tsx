import React, {useCallback, useEffect, useState} from 'react';
import {Dimensions, SafeAreaView, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import EventCard from '../../components/eventCard';
import useFavoriteEvent from "@/hooks/useFavoriteEvent";
import {useAuthContext} from '@/contexts/AuthContext';
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";
import {useFocusEffect} from '@react-navigation/native';
import LoadingIndicator from '@/components/LoadingIndicator';
import globalStyles from "@/styles/globalStyles";
import useGoingEvent from "@/hooks/useGoingEvents";
import useSearchEvents from "@/hooks/useSearchEvents";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import useBusinessProfile from "@/hooks/useBusinessProfile";
import {useLocalNotifications} from "@/hooks/useLocalNotifications";
import {useNotificationSocket} from "@/hooks/useNotificationSocket";
import {useEventSocket} from "@/hooks/useEventSocket";
import usePersonalizedEvents from "@/hooks/usePersonalizedEvents";


const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;

const Home = () => {
    const {user, isBusiness} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {fetchFavoritedEvents, favoritedEvents} = useFavoriteEvent();
    // const {events, loading, error, loadEvents} = useAllEvents();
    const {events, loading, error, loadEvents} = usePersonalizedEvents(userId);
    const eventsState = useEventSocket(events);
    const {goingEvents, fetchGoingEvents} = useGoingEvent();
    const [searchQuery, setSearchQuery] = useState('');
    const {results: searchResults, loading: searchLoading, error: searchError, searchEvents} = useSearchEvents();
    const displayedEvents = searchQuery.length > 0 ? searchResults : eventsState;
    const currentDate = new Date();
    const futureEvents = displayedEvents.filter(e => new Date(e.eventDate) >= currentDate);
    const pastEvents = displayedEvents.filter(e => new Date(e.eventDate) < currentDate);
    const [bizAccountId, setBizAccountId] = useState<number | null>(null)
    const {getBusinessAccountId} = useBusinessProfile()

    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessAccountId(user.email).then(setBizAccountId)
        }
    }, [isBusiness, user?.email, getBusinessAccountId])

    const notifUserId = isBusiness ? bizAccountId : userId
    const {
        notifications,
        unreadCount,
        loading: notifLoading,
        error: notifError,
        refresh: refreshNotifications,
        markAsRead
    } = useLocalNotifications(notifUserId);

// — insert these lines immediately below —
    const [count, setCount] = useState<number>(unreadCount);

    useEffect(() => {
        setCount(unreadCount);
    }, [unreadCount]);

    useNotificationSocket(
        notifUserId,
        newCount => setCount(newCount),
        () => {
        }   // we don’t need the full DTO here
    );

    const groupIntoRows = (data: any[], columns: number) => {
        const rows = [];
        for (let i = 0; i < data.length; i += columns) {
            rows.push(data.slice(i, i + columns));
        }
        return rows;
    };

    const futureRows = groupIntoRows(futureEvents, 2);
    const pastRows = groupIntoRows(pastEvents, 2);

    useEffect(() => {
        if (!isBusiness) {
            loadEvents();
        }
    }, [isBusiness, loadEvents]);

    useEffect(() => {
        if (searchQuery.length > 1) {
            searchEvents(searchQuery);
        }
    }, [searchQuery, searchEvents]);


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

    useFocusEffect(
        useCallback(() => {
            if (notifUserId) {
                refreshNotifications()
            }
        }, [notifUserId, refreshNotifications])
    )


    const sections: { title: string; data: any[] }[] = [
        {title: 'Trending', data: futureRows}
    ];

    if (searchQuery.length > 0 && pastRows.length > 0) {
        sections.push({title: 'Past events', data: pastRows});
    }


    if (loading) {
        return <LoadingIndicator/>;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.searchRow}>
                <TextInput
                    placeholder="Search events…"
                    placeholderTextColor="#999"
                    clearButtonMode="while-editing"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchBoxFlex}
                />
                <TouchableOpacity onPress={() => router.push('/NotificationCenter')}>
                    <View style={styles.bellContainer}>
                        <Ionicons name="notifications-outline" size={24}/>
                        {count > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{count}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
            <>
                <SectionList
                    sections={sections}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({item: row}) => (
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    searchBoxFlex: {
        flex: 1,
        height: 40,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginTop: 10,
    },
    bellContainer: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: 'red',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },


});


export default Home;
