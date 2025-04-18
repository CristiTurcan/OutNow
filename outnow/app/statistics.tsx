import React, {useEffect, useMemo, useState} from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    SectionList,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import {router, useLocalSearchParams} from 'expo-router';
import globalStyles from '@/styles/globalStyles';
import CustomBackButton from '@/components/customBackButton';
import useFeedback, {Feedback} from '@/hooks/useFeedback';
import useUsersByIds from "@/hooks/useUsersByIds";
import useEventStats from "@/hooks/useEventStats";
import {Ionicons} from '@expo/vector-icons';
import useEventDetails from "@/hooks/useEventDetails";


const {width: windowWidth} = Dimensions.get('window');
const BAR_MAX_WIDTH = windowWidth * 0.6;
const CARD_SPACING = 16;
const NUM_CARDS = 3;
const CARD_WIDTH = (windowWidth - CARD_SPACING * (NUM_CARDS + 1)) / NUM_CARDS;

export default function Statistics() {
    const {eventId: eventIdParam} = useLocalSearchParams<{ eventId: string }>();
    const eventId = parseInt(eventIdParam, 10);
    const {getFeedback} = useFeedback();
    const [loading, setLoading] = useState(true);
    const [ratingsCount, setRatingsCount] = useState<Record<string, number>>({});
    const [comments, setComments] = useState<{ feedbackId: number; userId: number; comment: string }[]>([]);
    const userIds = useMemo(
        () => Array.from(new Set(comments.map(c => c.userId))),
        [comments]
    );
    const {profiles, loading: usersLoading} = useUsersByIds(userIds);
    const {
        attendeeCount,
        favoriteCount,
        uniqueFavoriteCount,
        loading: statsLoading,
        error: statsError
    } = useEventStats(eventId);
    const {event, loading: eventLoading} = useEventDetails(eventId);
    const eventDate = event?.eventDate ? new Date(event.eventDate) : null;
    const isPast = eventDate ? eventDate < new Date() : false;

    useEffect(() => {
        async function load() {
            try {
                const all = await getFeedback(eventId);
                if (!all) throw new Error('Failed to load feedback');
                // Count ratings
                const counts: Record<string, number> = {
                    VERY_BAD: 0,
                    BAD: 0,
                    OK: 0,
                    GOOD: 0,
                    VERY_GOOD: 0,
                };
                all.forEach(fb => {
                    counts[fb.rating] = (counts[fb.rating] || 0) + 1;
                });
                setRatingsCount(counts);

                // Prepare comments list
                const cms = all.map(fb => ({
                    feedbackId: fb.feedbackId,
                    userId: fb.userId,
                    comment: fb.comment || '',
                }));
                setComments(cms);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [eventId]);


    if (loading || usersLoading || statsLoading) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <ActivityIndicator size="large" color="#0D2C66"/>
            </SafeAreaView>
        );
    }

    if (statsError) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <Text>Error loading stats: {statsError}</Text>
            </SafeAreaView>
        );
    }

    // Find the maximum count to scale bars
    const maxCount = Math.max(...Object.values(ratingsCount), 1);


    const sections = [
        {
            title: 'Ratings',
            data: Object.entries(ratingsCount).map(([rating, count]) => ({rating, count})),
        },
        {
            title: 'Comments',
            data: comments,
        },
    ];

    return (
        <SafeAreaView style={globalStyles.container}>
            {/* Header */}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Statistics</Text>
            </View>

            {/* Stat Cards */}
            <View style={styles.cardsContainer}>
                {[
                    {key: 'attendees', label: 'Attendees', value: attendeeCount, icon: 'people'},
                    {key: 'favorites', label: 'Favorites', value: favoriteCount, icon: 'heart'},
                    {key: 'unique', label: 'Unique Favs', value: uniqueFavoriteCount, icon: 'star'},
                ].map(stat => (
                    <View key={stat.key} style={styles.card}>
                        <Ionicons name={stat.icon} size={24} color="#0D2C66"/>
                        <Text style={styles.cardValue}>{stat.value}</Text>
                        <Text style={styles.cardLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Body */}
            {isPast && (
                <SectionList
                    sections={sections}
                    keyExtractor={(item, index) => {
                        if ('count' in item) return item.rating;
                        return `c${item.feedbackId}`;
                    }}
                    renderSectionHeader={(info) => (
                        <View style={styles.headerContainer}>
                            <Text style={globalStyles.title}>{info.section.title}</Text>
                        </View>
                    )}

                    renderItem={({item}) => {
                        // Ratings row
                        if ('count' in item) {
                            const barWidth = (item.count / maxCount) * BAR_MAX_WIDTH;
                            const labelMap: Record<string, string> = {
                                VERY_BAD: 'Very Bad',
                                BAD: 'Bad',
                                OK: 'Ok',
                                GOOD: 'Good',
                                VERY_GOOD: 'Very Good',
                            };
                            return (
                                <View style={styles.ratingRow}>
                                    <Text style={styles.ratingLabel}>{labelMap[item.rating]}</Text>
                                    <View style={[styles.barBackground]}>
                                        <View style={[styles.barFill, {width: barWidth}]}/>
                                    </View>
                                    <Text style={styles.ratingCount}>{item.count}</Text>
                                </View>
                            );
                        }

                        // Comments row
                        return (
                            <View style={styles.commentRow}>
                                <Text style={styles.commentUser}>
                                    {profiles[item.userId]?.username || 'Unknown User'}
                                </Text>
                                <Text style={styles.commentText}>{item.comment}</Text>
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    headerContainer: {
        backgroundColor: '#f2f2f2',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    ratingLabel: {
        width: 80,
        fontSize: 14,
    },
    barBackground: {
        flex: 1,
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginHorizontal: 8,
    },
    barFill: {
        height: '100%',
        backgroundColor: '#0D2C66',
        borderRadius: 5,
    },
    ratingCount: {
        width: 24,
        textAlign: 'right',
        fontSize: 14,
    },
    commentRow: {
        marginVertical: 12,
    },
    commentUser: {
        fontWeight: '600',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: 'gray',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    statText: {
        fontSize: 16,
        fontWeight: '500',
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: CARD_SPACING,
        marginVertical: 12,
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        // shadows for iOS
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // elevation for Android
        elevation: 3,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 6,
        color: '#0D2C66',
    },
    cardLabel: {
        fontSize: 12,
        color: 'gray',
    },
});
