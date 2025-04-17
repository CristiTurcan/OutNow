import React, {useEffect, useCallback} from 'react';
import {View, Text, FlatList, StyleSheet, ActivityIndicator, SectionList} from 'react-native';
import EventCard from '../../components/eventCard';
import useFavoriteEvent from '@/hooks/useFavoriteEvent';
import useAuth from '@/hooks/useAuth';
import useUserIdByEmail from '@/hooks/useUserByIdByEmail';
import {Dimensions} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useLoadEvents} from '@/hooks/useLoadEvents';
import useGoingEvent from "@/hooks/useGoingEvents";
import globalStyles from "@/styles/globalStyles";

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;

export default function Favorites() {
    const {user} = useAuth();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {fetchFavoritedEvents, favoritedEvents, removeFavoriteEvent, favoriteEvent} = useFavoriteEvent();
    const {events, loading, error, loadEvents} = useLoadEvents(favoritedEvents);
    const {goingEvents: goingEventIds, fetchGoingEvents} = useGoingEvent();
    const {
        events: favEvents,
        loading: favLoading,
        error: favError,
        loadEvents: loadFavEvents
    } = useLoadEvents(favoritedEvents);
    const {
        events: goEvents,
        loading: goLoading,
        error: goError,
        loadEvents: loadGoEvents
    } = useLoadEvents(goingEventIds);

    type EventSection = {
        title: string;
        data: any[];
    };


    // Fetch favorites when screen is focused
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchFavoritedEvents(userId);
                fetchGoingEvents(userId);
            }
        }, [userId, fetchFavoritedEvents, fetchGoingEvents])
    );

    useEffect(() => {
        loadFavEvents();
    }, [favoritedEvents, loadFavEvents]);

    useEffect(() => {
        loadGoEvents();
    }, [goingEventIds, loadGoEvents]);

    const groupIntoRows = (data: any[], columns: number) => {
        const rows = [];
        for (let i = 0; i < data.length; i += columns) {
            rows.push(data.slice(i, i + columns));
        }
        return rows;
    };


    // Show a loader if either favorites or going events are loading
    if (favLoading || goLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

// Show an error if one occurred
    if (favError || goError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{favError || goError}</Text>
            </View>
        );
    }

// If both favorites and going sections are empty, show a "no events" message
    if (favEvents.length === 0 && goEvents.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No favorited or going events yet.</Text>
            </View>
        );
    }

    const sections: { title: string; data: any[] }[] = [];
    if (favEvents.length > 0) {
        sections.push({ title: 'Favorited', data: groupIntoRows(favEvents, 2) });
    }
    if (goEvents.length > 0) {
        sections.push({ title: 'Going', data: groupIntoRows(goEvents, 2) });
    }

    return (
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
                                isGoing: goingEventIds.includes(eventItem.eventId),
                            }}
                            cardWidth={cardWidth}
                            onToggleFavorite={() => {
                                if (userId) {
                                    fetchFavoritedEvents(userId);
                                    fetchGoingEvents(userId);
                                }
                            }}
                        />
                    ))}
                </View>
            )}
            renderSectionHeader={({
                                      section,
                                  }: {
                section: EventSection;
            }) => (
                <View style={styles.headerContainer}>
                    <Text style={globalStyles.title}>{section.title}</Text>
                </View>
            )}

            stickySectionHeadersEnabled={true}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#333',
    },
    listContainer: {
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
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});
