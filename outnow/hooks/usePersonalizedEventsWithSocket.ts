import {useEffect} from 'react'
import {InfiniteData, QueryKey, useInfiniteQuery, useQueryClient,} from '@tanstack/react-query'
import {Client} from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import axios from 'axios'
import {BASE_URL} from '@/config/api'
import {EventDTO} from '@/types/EventDTO'

const PAGE_SIZE = 20

export default function usePersonalizedEventsWithSocket(
    userId: number | null
) {
    const queryClient = useQueryClient()
    const queryKey: QueryKey = ['events', userId]
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        refetch,
    } = useInfiniteQuery<EventDTO[], Error, InfiniteData<EventDTO[]>, QueryKey>({
        queryKey,
        queryFn: async ({pageParam = 0}): Promise<EventDTO[]> => {
            // console.log('[RQ] fetching page', pageParam)
            const resp = await axios.get(`${BASE_URL}/events/personalized`, {
                params: {userId, page: pageParam, size: PAGE_SIZE},
            })
            // console.log("api called");
            const data: EventDTO[] = Array.isArray(resp.data)
                ? resp.data
                : resp.data.content
            // console.log('[RQ] got', data.length, 'items')
            return data
        },
        getNextPageParam: (lastPage, pages) =>
            lastPage.length < PAGE_SIZE ? undefined : pages.length,
        initialPageParam: 0,
        enabled: !!userId,
    })

    useEffect(() => {
        if (!userId) return
        // console.log('[SOCKET] initializing STOMP client for userId=', userId)

        queryClient.setQueryData<InfiniteData<EventDTO[]>>(queryKey, old =>
            old ??
            ({
                pages: [[]],
                pageParams: [0],
            } as InfiniteData<EventDTO[]>)
        )

        const socketUrl = `${BASE_URL}/ws`
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 5_000,
            heartbeatIncoming: 4_000,
            heartbeatOutgoing: 4_000,
        })

        client.onConnect = () => {
            // console.log('[SOCKET] connected to', socketUrl)

            client.subscribe('/topic/eventCreated', msg => {
                const created = JSON.parse(msg.body) as EventDTO
                // console.log('[SOCKET] eventCreated:', created)
                queryClient.setQueryData<InfiniteData<EventDTO[]>>(queryKey, old => {
                    if (!old) return old
                    const [first, ...rest] = old.pages
                    return {
                        ...old,
                        pages: [[created, ...first], ...rest],
                    }
                })
            })

            client.subscribe('/topic/eventUpdated', msg => {
                const updated = JSON.parse(msg.body) as EventDTO
                // console.log('[SOCKET] eventUpdated:', updated)
                queryClient.setQueryData<InfiniteData<EventDTO[]>>(queryKey, old => {
                    if (!old) return old
                    return {
                        ...old,
                        pages: old.pages.map(page =>
                            page.map(e => (e.eventId === updated.eventId ? updated : e))
                        ),
                    }
                })
            })

            client.subscribe('/topic/eventDeleted', msg => {
                const deletedId = Number(msg.body)
                // console.log('[SOCKET] eventDeleted:', deletedId)
                queryClient.setQueryData<InfiniteData<EventDTO[]>>(queryKey, old => {
                    if (!old) return old
                    return {
                        ...old,
                        pages: old.pages.map(page =>
                            page.filter(e => e.eventId !== deletedId)
                        ),
                    }
                })
            })
        }

        client.activate()
        return () => {
            // console.log('[SOCKET] disconnecting STOMP client for userId=', userId)
            client.deactivate()
        }
    }, [userId, queryClient])

    return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error,
        refetch,
    };
}
