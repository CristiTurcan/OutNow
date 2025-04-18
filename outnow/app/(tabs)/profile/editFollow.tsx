import React, {useCallback, useEffect, useState} from 'react';
import {
    SafeAreaView,
    FlatList,
    Text,
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert
} from 'react-native';
import {useRouter} from 'expo-router';
import {useAuthContext} from '@/contexts/AuthContext';
import useUserIdByEmail from '@/hooks/useUserByIdByEmail';
import useFollowedBusiness, {UserDTO} from '@/hooks/useFollowedBusiness';
import useBusinessProfile from '@/hooks/useBusinessProfile';
import globalStyles from '@/styles/globalStyles';
import CustomBackButton from '@/components/customBackButton';
import {useFocusEffect} from "@react-navigation/native";

type BusinessAccountDTO = {
    id: number;
    username: string;
    userPhoto?: string;
};

export default function EditFollow() {
    const router = useRouter();
    const {user, isBusiness} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email || null);
    const {getBusinessProfileById} = useBusinessProfile();
    const [list, setList] = useState<BusinessAccountDTO[]>([]);
    const {getBusinessAccountId} = useBusinessProfile();
    const [bizAccountId, setBizAccountId] = useState<number | null>(null);
    const {
        followed,
        userFetchLoading,
        userError,
        fetchFollowed,
        followers,
        followersLoading,
        fetchFollowers,
        followerCount,
        countLoading,
    } = useFollowedBusiness(userId, bizAccountId);

    // For normal users: when the array of followed IDs changes, fetch each profile
    useEffect(() => {
        if (!isBusiness && followed.length) {
            (async () => {
                try {
                    const profiles = await Promise.all(
                        followed.map(id => getBusinessProfileById(id))
                    );
                    setList(profiles);
                } catch (err) {
                    console.error('Error loading followed profiles', err);
                    Alert.alert('Failed to load followed profiles.');
                }
            })();
        } else if (!isBusiness) {
            setList([]);
        }
    }, [isBusiness, followed, getBusinessProfileById]);

    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessAccountId(user.email)
                .then(setBizAccountId)
                .catch(err => {
                    console.error('Error fetching business ID', err);
                    Alert.alert('Failed to load business info.');
                });
        }
    }, [isBusiness, user?.email]);


    useFocusEffect(
        useCallback(() => {
            if (!isBusiness && userId) {
                fetchFollowed();
            }
        }, [fetchFollowed, isBusiness, userId])
    );

    useFocusEffect(
        useCallback(() => {
            if (isBusiness && bizAccountId) fetchFollowers();
        }, [fetchFollowers, isBusiness, bizAccountId])
    );

    if (isBusiness) {
        if (followersLoading) return <Text>Loading followers…</Text>;
        if (userError) return <Text>Error: {userError}</Text>;

        return (
            <SafeAreaView style={globalStyles.container}>
                <View style={globalStyles.headerRow}>
                    <CustomBackButton text="" style={globalStyles.backButton}/>
                    <Text style={globalStyles.title}>Followers</Text>
                </View>

                <Text style={styles.count}>
                    {countLoading ? 'Loading total…' : `Total: ${followerCount}`}
                </Text>

                <FlatList
                    data={followers}
                    keyExtractor={u => u.userid.toString()}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            style={styles.row}
                            onPress={() => router.push(`/profilePreview?userId=${item.userid}`)}
                        >
                            {item.userPhoto && (
                                <Image source={{uri: item.userPhoto}} style={styles.avatar}/>
                            )}
                            <Text style={styles.username}>{item.username}</Text>
                        </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator}/>}
                    ListEmptyComponent={<Text>No followers yet.</Text>}
                />
            </SafeAreaView>
        );
    }

    if (userFetchLoading) return <Text>Loading...</Text>;
    if (userError) return <Text>Error: {userError}</Text>;

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Following</Text>
            </View>

            <FlatList
                data={list}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() =>
                            router.push(`/profilePreview?businessAccountId=${item.id}`)
                        }
                    >
                        {item.userPhoto && (
                            <Image
                                source={{uri: item.userPhoto}}
                                style={styles.avatar}
                            />
                        )}
                        <Text style={styles.username}>{item.username}</Text>
                    </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator}/>}
                ListEmptyComponent={<Text>No followed businesses.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12
    },
    username: {
        fontSize: 16,
        fontWeight: '500'
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 16
    },
    count: { fontSize: 14, color: '#666', marginVertical: 4, paddingHorizontal: 13 },
});
