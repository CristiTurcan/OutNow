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

const {width: windowWidth} = Dimensions.get('window');
const BAR_MAX_WIDTH = windowWidth * 0.6;  // max width for the bar

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

    useEffect(() => {
        async function load() {
            try {
                const all = await getFeedback(eventId);
                if (!all) throw new Error('Failed to load feedback');
                // 1) Count ratings
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

                // 2) Prepare comments list
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


    if (loading || usersLoading) {
        return (
            <SafeAreaView style={globalStyles.container}>
                <ActivityIndicator size="large" color="#0D2C66"/>
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

            {/* Body */}
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
});
