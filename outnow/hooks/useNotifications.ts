import {useEffect, useRef} from 'react';
import {Alert, Platform} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export function useNotifications(userId: number | null, backendUrl: string) {
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();

    useEffect(() => {
        if (!userId) {
            console.log('[useNotifications] No userId yet, skipping registration');
            return;
        }
        console.log('[useNotifications] Starting registration for userId:', userId);

        async function register() {
            try {
                console.log('[Register Push] Checking if device is physical...');
                if (!Device.isDevice) {
                    console.warn('[Register Push] Not a physical device. Push notifications require a real device.');
                    // Alert.alert('Push notifications require a physical device');
                    return;
                }

                console.log('[Register Push] Checking existing permissions...');
                const {status: existingStatus} = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    console.log('[Register Push] Requesting new permissions...');
                    const {status} = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    console.warn('[Register Push] Notifications permission not granted!');
                    Alert.alert('Failed to get push token for push notification!');
                    return;
                }

                console.log('[Register Push] Permissions granted. Getting Expo push token...');
                const tokenData = await Notifications.getExpoPushTokenAsync();
                const token = tokenData.data;
                console.log('Expo push token:', token);

                console.log('[Register Push] Sending token to backend...');
                await fetch(`${backendUrl}/devices`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({userId, token}),
                });
                console.log('[Register Push] Token successfully sent to backend');

                if (Platform.OS === 'android') {
                    console.log('[Register Push] Setting Android notification channel...');
                    await Notifications.setNotificationChannelAsync('default', {
                        name: 'default',
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                    });
                }
            } catch (err) {
                console.error('Error in push registration:', err);
            }
        }

        register();

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('📩 Notification received in foreground:', notification);
            const {title, body} = notification.request.content;
            Alert.alert(title ?? 'Notification', body ?? '');
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('👆 User tapped on notification:', response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [userId, backendUrl]);
}
