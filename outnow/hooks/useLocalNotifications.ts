import {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import {BASE_URL} from '@/config/api'

export interface NotificationDTO {
    id: number
    userId: number
    title: string
    body: string
    notificationType:
        | 'EVENT_REMINDER'
        | 'EVENT_UPDATED'
        | 'NEW_EVENT'
        | 'FEEDBACK_INVITE'
        | 'NEW_FEEDBACK'
        | 'EVENT_CANCELED'
    targetId: number
    read: boolean
    createdAt: string
}


export function useLocalNotifications(userId: number | null) {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([])
    const [unreadCount, setUnreadCount] = useState<number>(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setNotifications([])
            setUnreadCount(0)
            return
        }
        setLoading(true)
        setError(null)
        try {
            const [allRes, countRes] = await Promise.all([
                axios.get<NotificationDTO[]>(`${BASE_URL}/notifications`, {
                    params: {userId},
                }),
                axios.get<number>(`${BASE_URL}/notifications/unread/count`, {
                    params: {userId},
                }),
            ])
            setNotifications(allRes.data)
            setUnreadCount(countRes.data)
        } catch (err: any) {
            const server = err.response?.data
            const msg =
                typeof server === 'string'
                    ? server
                    : server?.message || JSON.stringify(server)
            setError(msg)
        } finally {
            setLoading(false)
        }
    }, [userId])

    const markAsRead = useCallback(
        async (id: number) => {
            try {
                await axios.put(`${BASE_URL}/notifications/${id}/read`)
                // optimistically update both list and count
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? {...n, read: true} : n))
                )
                setUnreadCount((c) => Math.max(0, c - 1))
            } catch (err) {
                console.error('Failed to mark read', err)
            }
        },
        []
    )

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // auto-refresh every 30s
    useEffect(() => {
        const iv = setInterval(fetchNotifications, 30_000)
        return () => clearInterval(iv)
    }, [fetchNotifications])

    return {
        notifications,
        unreadCount,
        loading,
        error,
        refresh: fetchNotifications,
        markAsRead,
    }
}
