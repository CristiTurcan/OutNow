import React, {useEffect, useState} from 'react';
import {
    SafeAreaView,
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
    Alert, TouchableOpacity,
} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {useAuthContext} from '@/contexts/AuthContext';
import useUserIdByEmail from '../hooks/useUserByIdByEmail';
import useBusinessProfile from '@/hooks/useBusinessProfile';
import useMyEvents from '@/hooks/useMyEvents';
import useFollowedBusiness, {UserDTO} from '@/hooks/useFollowedBusiness';
import EventCard from '@/components/eventCard';
import globalStyles from "@/styles/globalStyles";
import CustomBackButton from "@/components/customBackButton";
import useFavoriteEvent from '@/hooks/useFavoriteEvent';
import useGoingEvent from '@/hooks/useGoingEvents';

// Determine card width (example: two columns)
import {Dimensions} from 'react-native';
import useUserProfile from "@/hooks/useUserProfile";

const {width} = Dimensions.get('window');
const CARD_PADDING = 10;
const CARD_WIDTH = (width / 2) - (CARD_PADDING * 2);

type BusinessProfile = {
    id: number;
    email: string;
    username: string;
    userPhoto?: string;
    bio?: string;
    location?: string;
    interestList?: string;
};

export default function ProfilePreview() {
    const {businessAccountId: businessIdParam, userId: userIdParam} =
        useLocalSearchParams<{ businessAccountId?: string; userId?: string }>();
    const profileId = businessIdParam ? parseInt(businessIdParam, 10) : parseInt(userIdParam || '0', 10);
    const viewingBusiness = !!businessIdParam;
    const {user, isBusiness} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const {fetchFavoritedEvents, favoritedEvents} = useFavoriteEvent();
    const {fetchGoingEvents, goingEvents} = useGoingEvent();
    const {getBusinessProfileById} = useBusinessProfile();
    const {getUserProfileById} = useUserProfile();

    useEffect(() => {
        if (viewingBusiness) {
            getBusinessProfileById(profileId)
                .then(setProfile)
                .catch(err => {
                    console.error('Error loading business profile', err);
                    Alert.alert('Failed to load profile.');
                });
        } else {
            getUserProfileById(profileId)
                .then(setProfile)
                .catch(err => {
                    console.error('Error loading user profile', err);
                    Alert.alert('Failed to load profile.');
                });
        }
    }, [viewingBusiness, profileId]);

    useEffect(() => {
        const targetUserId = viewingBusiness ? userId : profileId;
        if (targetUserId) {
            fetchGoingEvents(targetUserId);
        }
    }, [viewingBusiness, userId, profileId, fetchGoingEvents]);


    // Load events logic
    const {
        events,
        loading: eventsLoading,
        error: eventsError,
    } = useMyEvents(viewingBusiness ? profile?.email : user?.email || null);

// Filter events if viewing a user profile (to show only events the user is attending)
    const displayedEvents = viewingBusiness
        ? events                                  // normal user: show business’s events
        : events.filter((evt) => goingEvents.includes(evt.eventId)); // business: show their own events the user is going to

    // Follow/unfollow + followers data
    const {
        follow,
        unfollow,
        isFollowing,
        userFetchLoading,
        userActionLoading,
        followerCount,
        countLoading,
        fetchFollowerCount,
    } = useFollowedBusiness(userId, profileId);

    const handleToggleFollow = async () => {
        if (!userId) {
            return Alert.alert('Please log in to follow this business.');
        }
        try {
            if (isFollowing(profileId)) {
                await unfollow(profileId);
            } else {
                await follow(profileId);
            }
            await fetchFollowerCount();
        } catch {
            Alert.alert('Error updating follow status.');
        }
    };

    if (!profile) {
        return <Text style={styles.center}>Loading profile…</Text>;
    }

    return (
        <SafeAreaView style={globalStyles.container}>
            {/* Header */}
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Profile</Text>
            </View>

            {/* Profile Info */}
            <View style={styles.header}>
                {profile.userPhoto && (
                    <Image source={{uri: profile.userPhoto}} style={styles.photo}/>
                )}
                <Text style={styles.username}>{profile.username}</Text>
                {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

                {viewingBusiness ? (
                    <>
                        {!isBusiness && (
                            <TouchableOpacity
                                onPress={handleToggleFollow}
                                style={[
                                    styles.followButton,
                                    isFollowing(profileId) && styles.following,
                                ]}
                                disabled={userFetchLoading || userActionLoading}
                            >
                                <Text style={styles.followText}>
                                    {isFollowing(profileId) ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.followerCount}>
                            {countLoading ? 'Loading followers…' : `Followers: ${followerCount}`}
                        </Text>
                    </>
                ) : (
                    <>
                        {(profile as UserDTO).showDob       && (
                            <Text style={styles.meta}>
                                Date of Birth: {(profile as UserDTO).dateOfBirth || 'N/A'}
                            </Text>
                        )}

                        {(profile as UserDTO).showGender    && (profile as UserDTO).gender && (
                            <Text style={styles.meta}>
                                Gender: {(profile as UserDTO).gender}
                            </Text>
                        )}

                        {(profile as UserDTO).showLocation  && profile.location && (
                            <Text style={styles.meta}>{profile.location}</Text>
                        )}

                        {(profile as UserDTO).showInterests && profile.interestList && (
                            <Text style={styles.meta}>{profile.interestList}</Text>
                        )}

                        <Text style={styles.email}>Contact: {profile.email}</Text>
                    </>
                )}

                {/*{profile.location && <Text style={styles.meta}>{profile.location}</Text>}*/}
                {/*{profile.interestList && <Text style={styles.meta}>{profile.interestList}</Text>}*/}
            </View>


            {/* Events Grid */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {viewingBusiness ? `${profile.username}’s Events` : `Events ${profile.username} is going to`}
                </Text>


                {eventsLoading && <Text>Loading events…</Text>}
                {eventsError && <Text>Error: {eventsError}</Text>}

                <FlatList
                    data={displayedEvents}
                    numColumns={2}
                    keyExtractor={(item) => item.eventId.toString()}
                    renderItem={({item}) => (
                        <EventCard
                            event={{
                                ...item,
                                isFavorited: favoritedEvents.includes(item.eventId),
                                isGoing: goingEvents.includes(item.eventId),
                            }}
                            userId={userId}
                            cardWidth={CARD_WIDTH}
                        />
                    )}
                    contentContainerStyle={{
                        paddingHorizontal: CARD_PADDING,
                    }}
                    columnWrapperStyle={{
                        justifyContent: 'space-between',
                        marginBottom: CARD_PADDING,
                    }}
                    ListEmptyComponent={<Text>No events found.</Text>}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    center: {flex: 1, textAlign: 'center', marginTop: 50},
    header: {alignItems: 'center', marginBottom: 24},
    photo: {width: 100, height: 100, borderRadius: 50, marginBottom: 8},
    username: {fontSize: 24, fontWeight: 'bold'},
    email: {fontSize: 14, color: 'gray', marginVertical: 4},
    bio: {fontSize: 16, textAlign: 'center', marginVertical: 8},
    meta: {fontSize: 14, color: 'gray', paddingHorizontal: 1},
    followButton: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
        backgroundColor: '#007AFF',
    },
    following: {backgroundColor: '#34C759'},
    followText: {color: 'white', fontWeight: '600'},
    followerCount: {marginTop: 8, fontSize: 14, color: 'gray'},
    headerContainer: {
        backgroundColor: '#f2f2f2',
        paddingHorizontal: 10,
        paddingVertical: 10,
        flex: 1,
    },
    section: {flex: 1},
    sectionTitle: {fontSize: 22, fontWeight: '600', marginBottom: 8, marginHorizontal: 15},
});
