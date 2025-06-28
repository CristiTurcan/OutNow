import {useEffect, useState} from 'react';
import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {BASE_URL} from '@/config/api';
import {EventDTO} from "@/types/EventDTO";


export function useEventSocket<T extends { eventId: number }>(initialEvents: T[]) {
    const [eventsState, setEventsState] = useState<EventDTO[]>(initialEvents);

    // keep HTTP‐loaded data in sync
    useEffect(() => {
        setEventsState(initialEvents);
    }, [initialEvents]);

    useEffect(() => {
        const socketUrl = `${BASE_URL}/ws`;
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 5_000,
            heartbeatIncoming: 4_000,
            heartbeatOutgoing: 4_000,
        });

        client.onConnect = () => {
            client.subscribe('/topic/eventCreated', msg => {
                const created = JSON.parse(msg.body) as T;
                setEventsState(prev => [created, ...prev]);
            });
            client.subscribe('/topic/eventUpdated', msg => {
                const updated = JSON.parse(msg.body) as T;
                setEventsState(prev =>
                    prev.map(e => e.eventId === updated.eventId ? updated : e)
                );
            });
            client.subscribe('/topic/eventDeleted', msg => {
                const deletedId = Number(msg.body);
                setEventsState(prev => prev.filter(e => e.eventId !== deletedId));
            });
        };

        client.activate();
        return () => {
            client.deactivate();
        };
    }, []);

    return eventsState;
}
