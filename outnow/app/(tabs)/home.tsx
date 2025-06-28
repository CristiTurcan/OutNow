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
import {FlashList} from '@shopify/flash-list';
import usePersonalizedEventsWithSocket from "@/hooks/usePersonalizedEventsWithSocket";


const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;
const ESTIMATED_ITEM_HEIGHT = 250;


const Home = () => {
    const {user, isBusiness} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {fetchFavoritedEvents, favoritedEvents} = useFavoriteEvent();
    const [bizAccountId, setBizAccountId] = useState<number | null>(null)
    const {getBusinessAccountId} = useBusinessProfile()

    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessAccountId(user.email).then(setBizAccountId)
        }
    }, [isBusiness, user?.email, getBusinessAccountId])

    const accountId = isBusiness ? bizAccountId : userId
    const {
        notifications,
        unreadCount,
        loading: notifLoading,
        error: notifError,
        refresh: refreshNotifications,
        markAsRead
    } = useLocalNotifications(accountId);
    const [count, setCount] = useState<number>(unreadCount);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        refetch,
    } = usePersonalizedEventsWithSocket(accountId)
    const events = data?.pages.flat() ?? [];
    const {goingEvents, fetchGoingEvents} = useGoingEvent();
    const [searchQuery, setSearchQuery] = useState('');
    const isSearching = searchQuery.length > 0;
    const now = new Date();
    const {results: searchResults, loading: searchLoading, error: searchError, searchEvents} = useSearchEvents();
    const upcomingEvents = isSearching ? searchResults.filter(e => new Date(e.eventDate) >= now) : events;
    const pastEvents = isSearching ? searchResults.filter(e => new Date(e.eventDate) < now) : [];
    const groupIntoRows = (data: any[], columns: number) => {
        const rows = [];
        for (let i = 0; i < data.length; i += columns) {
            rows.push(data.slice(i, i + columns));
        }
        return rows;
    };
    const upcomingRows = groupIntoRows(upcomingEvents, 2);
    const pastRows = groupIntoRows(pastEvents, 2);


    useEffect(() => {
        setCount(unreadCount);
    }, [unreadCount]);

    useNotificationSocket(
        accountId,
        newCount => setCount(newCount),
        () => {
        }
    );

    useEffect(() => {
        if (searchQuery.length > 1) {
            searchEvents(searchQuery);
        }
    }, [searchQuery]);

    useFocusEffect(
        useCallback(() => {
            if (!isBusiness && userId) {
                fetchFavoritedEvents(userId);
            }
        }, [isBusiness, userId])
    );

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchGoingEvents(userId);
            }
        }, [userId])
    );

    useFocusEffect(
        useCallback(() => {
            if (accountId) {
                refreshNotifications()
            }
        }, [accountId])
    )

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                refetch();
            }
        }, [userId, refetch])
    );

    if (status === 'loading') {
        return <LoadingIndicator/>;
    }

    if (status === 'error') {
        return <Text>Error: {error.message}</Text>;
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
                {isSearching ? (
                    <SectionList
                        sections={[
                            {title: 'Upcoming', data: upcomingRows},
                            ...(
                                pastRows.length
                                    ? [{title: 'Past events', data: pastRows}]
                                    : []
                            )
                        ]}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({item: row}) => (
                            <View style={styles.rowContainer}>
                                {row.map(evt => (
                                    <View key={evt.eventId} style={styles.cardWrapper}>
                                        <EventCard
                                            event={{
                                                ...evt,
                                                isFavorited: favoritedEvents.includes(evt.eventId),
                                                isGoing: goingEvents.includes(evt.eventId)
                                            }}
                                            cardWidth={cardWidth}
                                            userId={userId}
                                        />
                                    </View>
                                ))}

                            </View>
                        )}
                        renderSectionHeader={({section}) => (
                            <View style={styles.headerContainer}>
                                <Text style={globalStyles.title}>{section.title}</Text>
                            </View>
                        )}
                        stickySectionHeadersEnabled
                        contentContainerStyle={styles.container}
                    />
                ) : (
                    <>
                        <Text style={[globalStyles.title, {marginHorizontal: 10}]}>
                            Trending
                        </Text>
                        <FlashList
                            data={events}
                            renderItem={({item}) => (
                                <EventCard
                                    event={{
                                        ...item,
                                        isFavorited: favoritedEvents.includes(item.eventId),
                                        isGoing: goingEvents.includes(item.eventId)
                                    }}
                                    cardWidth={cardWidth}
                                    userId={userId}
                                />
                            )}
                            keyExtractor={item => item.eventId.toString()}
                            numColumns={2}
                            estimatedItemSize={ESTIMATED_ITEM_HEIGHT}
                            onEndReached={() => {
                                if (hasNextPage && !isFetchingNextPage) {
                                    fetchNextPage();
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                isFetchingNextPage ? <LoadingIndicator/> : null
                            }
                            contentContainerStyle={styles.container}
                        />
                    </>
                )}
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
        alignItems: 'stretch',
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
    cardWrapper: {
        flex: 1,
        marginHorizontal: 5,
    },


});


export default Home;
