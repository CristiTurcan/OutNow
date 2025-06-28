import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, Dimensions, SectionList, StyleSheet, Text, View} from 'react-native';
import EventCard from '../../components/eventCard';
import useUserIdByEmail from '@/hooks/useUserByIdByEmail';
import {useFocusEffect} from '@react-navigation/native';
import globalStyles from "@/styles/globalStyles";
import {useAuthContext} from "@/contexts/AuthContext";
import useBusinessProfile from "@/hooks/useBusinessProfile";
import useMyEvents from "@/hooks/useMyEvents";
import {router} from "expo-router";
import LoadingIndicator from "@/components/LoadingIndicator";
import CustomButton from "@/components/customButton";
import useUserEvents from "@/hooks/useUserEvents";

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2;

export default function Favorites() {
    const {user, isBusiness} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);

    const {favorites: favEvents, going: goEvents, loading, error, refetch} = useUserEvents(userId);
    type EventSection = {
        title: string;
        data: any[];
    };
    const {getBusinessProfile} = useBusinessProfile();
    const [businessAccountId, setBusinessAccountId] = useState<string | null>(null);
    const {
        events: myEvents,
        loading: myEventsLoading,
        error: myEventsError,
        refetchBusiness
    } = useMyEvents(businessAccountId);
    const currentDate = new Date();
    const futureBusinessEvents = myEvents.filter(evt => new Date(evt.eventDate) >= currentDate);
    const pastBusinessEvents = myEvents.filter(evt => new Date(evt.eventDate) < currentDate);

    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessProfile(user.email)
                .then(profile => setBusinessAccountId(profile.email))
                .catch(console.error);
        }
    }, [isBusiness, user?.email]);

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                refetch();
            }
        }, [userId])
    );

    useFocusEffect(
        useCallback(() => {
            if (isBusiness && businessAccountId) {
                refetchBusiness();
            }
        }, [isBusiness, businessAccountId])
    );

    const groupIntoRows = (data: any[], columns: number) => {
        const rows = [];
        for (let i = 0; i < data.length; i += columns) {
            rows.push(data.slice(i, i + columns));
        }
        return rows;
    };


    if (!isBusiness && loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (favEvents.length === 0 && goEvents.length === 0 && !isBusiness) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No favorited or going events yet.</Text>
            </View>
        );
    }

    const sections: { title: string; data: any[] }[] = [];
    if (favEvents.length > 0) {
        sections.push({title: 'Favorited', data: groupIntoRows(favEvents, 2)});
    }
    if (goEvents.length > 0) {
        sections.push({title: 'Going', data: groupIntoRows(goEvents, 2)});
    }

    const businessSections = [
        {title: 'Trending', data: groupIntoRows(futureBusinessEvents, 2)},
        {title: 'Past', data: groupIntoRows(pastBusinessEvents, 2)},
    ];

    const addEvent = () => {
        router.push('/createEvent');
    }

    if (isBusiness) {
        return (
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
                        renderItem={({item: row}) => (
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
                        renderSectionHeader={({section}) => (
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
        )
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
                                isFavorited: favEvents.some(e => e.eventId === eventItem.eventId),
                                isGoing: goEvents.some(e => e.eventId === eventItem.eventId),
                            }}
                            cardWidth={cardWidth}
                            onToggleFavorite={() => {
                                if (userId) {
                                    refetch();
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
    container: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
});
