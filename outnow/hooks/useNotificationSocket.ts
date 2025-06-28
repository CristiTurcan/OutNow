import {useEffect} from 'react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {BASE_URL} from '@/config/api';

type NotificationHandler = (payload: any) => void;

export function useNotificationSocket(
    userId: number | null,
    onCount: (count: number) => void,
    onNotification: NotificationHandler
) {
    useEffect(() => {
        if (!userId) return;

        const sockJsUrl = `${BASE_URL}/ws`;

        // configure STOMP client
        const client = new Client({
            // SockJS fallback
            webSocketFactory: () => new SockJS(sockJsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            // console.log('[STOMP] Connected – subscribing…');
            client.subscribe(`/topic/unreadCount/${userId}`, msg => {
                onCount(Number(msg.body));
            });
            client.subscribe(`/topic/newNotification/${userId}`, msg => {
                onNotification(JSON.parse(msg.body));
            });
        };
        // client.onWebSocketError = err => console.error('[STOMP] WS error', err);
        // client.onStompError     = frame => console.error('[STOMP] STOMP error', frame)

        client.activate();
        return () => {
            client.deactivate();
        };
    }, [userId, onCount, onNotification]);
}
