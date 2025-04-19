import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView, SectionList, StyleSheet, Text, TextInput, View} from 'react-native';
import EventCard from '../../components/eventCard';
import {Dimensions} from 'react-native';
import useFavoriteEvent from "@/hooks/useFavoriteEvent";
import {useAuthContext} from '@/contexts/AuthContext';
import useUserIdByEmail from "@/hooks/useUserByIdByEmail";
import {useFocusEffect} from '@react-navigation/native';
import {useAllEvents} from '@/hooks/useAllEvents';
import LoadingIndicator from '@/components/LoadingIndicator';
import globalStyles from "@/styles/globalStyles";
import useGoingEvent from "@/hooks/useGoingEvents";
import useSearchEvents from "@/hooks/useSearchEvents";


const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;

const Home = () => {
    const {user, isBusiness} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {fetchFavoritedEvents, favoritedEvents} = useFavoriteEvent();
    const {events, loading, error, loadEvents} = useAllEvents();
    const {goingEvents, fetchGoingEvents} = useGoingEvent();
    const [searchQuery, setSearchQuery] = useState('');
    const {results: searchResults, loading: searchLoading, error: searchError, searchEvents} = useSearchEvents();
    const displayedEvents = searchQuery.length > 0 ? searchResults : events;
    const currentDate = new Date();
    const futureEvents = displayedEvents.filter(e => new Date(e.eventDate) >= currentDate);
    const pastEvents = displayedEvents.filter(e => new Date(e.eventDate) < currentDate);

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

    if (loading) {
        return <LoadingIndicator/>;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <TextInput
                placeholder="Search events…"
                placeholderTextColor="#999"
                clearButtonMode="while-editing"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBox}
            />
                <>
                    <SectionList
                        sections={[
                            {title: 'Trending', data: futureRows},
                            {title: 'Past events', data: pastRows},
                        ]}
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
    searchBox: {
        height: 40,
        margin: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        fontSize: 16,
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Android elevation
        elevation: 3,
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
