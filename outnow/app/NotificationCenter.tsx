import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useAuthContext} from '@/contexts/AuthContext';
import {NotificationDTO, useLocalNotifications} from '@/hooks/useLocalNotifications';
import globalStyles from '@/styles/globalStyles';
import CustomBackButton from '@/components/customBackButton';
import {router} from 'expo-router';
import useUserIdByEmail from '@/hooks/useUserByIdByEmail';
import useBusinessProfile from '@/hooks/useBusinessProfile';
import {MaterialIcons} from '@expo/vector-icons';
import {formatDistanceToNow, parseISO} from 'date-fns';
import {useNotificationSocket} from "@/hooks/useNotificationSocket";

export default function NotificationCenter() {
    const {user, isBusiness} = useAuthContext();
    const {userId} = useUserIdByEmail(user?.email ?? null);
    const [bizAccountId, setBizAccountId] = useState<number | null>(null);
    const {getBusinessAccountId} = useBusinessProfile();

    useEffect(() => {
        if (isBusiness && user?.email) {
            getBusinessAccountId(user.email)
                .then((id) => setBizAccountId(id))
                .catch(() => setBizAccountId(null));
        }
    }, [isBusiness, user?.email, getBusinessAccountId]);

    const notifUserId = isBusiness ? bizAccountId : userId;

    const {
        notifications: initialNotifications,
        unreadCount: initialCount,
        loading,
        error,
        refresh,
        markAsRead
    } = useLocalNotifications(notifUserId);

    const [notificationsState, setNotificationsState] = useState<NotificationDTO[]>(initialNotifications);
    const [count, setCount] = useState<number>(initialCount);

    useEffect(() => {
        setNotificationsState(initialNotifications);
    }, [initialNotifications]);

    useEffect(() => {
        setCount(initialCount);
    }, [initialCount]);

    useNotificationSocket(
        notifUserId,
        newCount => setCount(newCount),
        newNotif => setNotificationsState(prev => [newNotif, ...prev])
    );


    const getIconName = (type: string) => {
        switch (type) {
            case 'EVENT_REMINDER':
                return 'alarm';
            case 'EVENT_UPDATED':
                return 'update';
            case 'NEW_EVENT':
                return 'event';
            case 'FEEDBACK_INVITE':
                return 'rate-review';
            case 'NEW_FEEDBACK':
                return 'feedback';
            case 'EVENT_CANCELED':
                return 'cancel';
            default:
                return 'notifications';
        }
    };

    const renderItem = ({item}: { item: NotificationDTO }) => {
        const handlePress = () => {
            markAsRead(item.id);
            switch (item.notificationType) {
                case 'EVENT_REMINDER':
                case 'EVENT_UPDATED':
                case 'NEW_EVENT':
                case 'FEEDBACK_INVITE':
                    router.push(`seeEvent?eventId=${item.targetId}`);
                    break;
                case 'NEW_FEEDBACK':
                    router.push(`/statistics?eventId=${item.targetId}`);
                    break;
                case 'EVENT_CANCELED':
                default:
                    break;
            }
        };

        const iconName = getIconName(item.notificationType);
        const timeAgo = formatDistanceToNow(parseISO(item.createdAt), {
            addSuffix: true
        });

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
            >
                <View
                    style={[
                        styles.cardContainer,
                        !item.read && styles.cardUnread
                    ]}
                >
                    <MaterialIcons
                        name={iconName}
                        size={24}
                        style={styles.icon}
                    />
                    <View style={styles.textContainer}>
                        <View style={styles.headerRow}>
                            <Text
                                style={[
                                    styles.title,
                                    !item.read && styles.titleUnread
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {item.title}
                            </Text>
                        </View>
                        <Text style={styles.body}>{item.body}</Text>
                        <Text style={styles.time}>{timeAgo}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.headerRow}>
                <CustomBackButton text="" style={globalStyles.backButton}/>
                <Text style={globalStyles.title}>Notifications</Text>
            </View>
            {error && <Text style={styles.error}>Error: {error}</Text>}
            <FlatList
                data={notificationsState}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={
                    notificationsState.length === 0 && styles.emptyContainer
                }
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No notifications.</Text>
                )}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh}/>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    cardUnread: {
        borderLeftWidth: 4,
        borderLeftColor: '#007BFF'
    },
    icon: {
        marginRight: 12,
        color: '#007BFF'
    },
    textContainer: {
        flex: 1
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        flexShrink: 1,
    },
    titleUnread: {
        fontWeight: '700'
    },
    time: {
        fontSize: 12,
        color: '#999'
    },
    body: {
        fontSize: 14,
        color: '#555',
        marginTop: 4
    },
    error: {
        color: 'red',
        padding: 16
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80
    },
    emptyText: {
        color: '#666',
        fontSize: 16
    }
});
