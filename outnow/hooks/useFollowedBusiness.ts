// src/hooks/useFollowedBusiness.ts
import {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import {BASE_URL} from '@/config/api'
import type {UserDTO} from '@/types/UserDTO'

export default function useFollowedBusiness(
    userId: number | null,
    businessAccountId: number | null = null
) {

    const [followed, setFollowed] = useState<number[]>([])
    const [userFetchLoading, setUserFetchLoading] = useState(false)
    const [userActionLoading, setUserActionLoading] = useState(false)
    const [userError, setUserError] = useState<string | null>(null)

    const fetchFollowed = useCallback(async () => {
        if (!userId) {
            setFollowed([])
            return
        }
        setUserFetchLoading(true)
        setUserError(null)
        try {
            const res = await axios.get<{ id: number }[]>(
                `${BASE_URL}/users/${userId}/followed-business-accounts`
            )
            setFollowed(res.data.map((ba) => ba.id))
        } catch (err: any) {
            setUserError(err.response?.data || err.message)
        } finally {
            setUserFetchLoading(false)
        }
    }, [userId])

    const follow = useCallback(
        async (baId: number) => {
            if (!userId) throw new Error('No userId')
            setUserActionLoading(true)
            setUserError(null)
            try {
                await axios.post(
                    `${BASE_URL}/users/${userId}/follow/${baId}`
                )
                setFollowed((prev) =>
                    prev.includes(baId) ? prev : [...prev, baId]
                )
            } catch (err: any) {
                setUserError(err.response?.data || err.message)
                throw err
            } finally {
                setUserActionLoading(false)
            }
        },
        [userId]
    )

    const unfollow = useCallback(
        async (baId: number) => {
            if (!userId) throw new Error('No userId')
            setUserActionLoading(true)
            setUserError(null)
            try {
                await axios.delete(
                    `${BASE_URL}/users/${userId}/follow/${baId}`
                )
                setFollowed((prev) => prev.filter((id) => id !== baId))
            } catch (err: any) {
                setUserError(err.response?.data || err.message)
                throw err
            } finally {
                setUserActionLoading(false)
            }
        },
        [userId]
    )

    const isFollowing = useCallback(
        (baId: number) => followed.includes(baId),
        [followed]
    )

    const [followers, setFollowers] = useState<UserDTO[]>([])
    const [followersLoading, setFollowersLoading] = useState(false)
    const [followersError, setFollowersError] = useState<string | null>(null)

    const [followerCount, setFollowerCount] = useState<number>(0)
    const [countLoading, setCountLoading] = useState(false)
    const [countError, setCountError] = useState<string | null>(null)

    const fetchFollowers = useCallback(async () => {
        if (!businessAccountId) {
            setFollowers([])
            return
        }
        setFollowersLoading(true)
        setFollowersError(null)
        try {
            const res = await axios.get<UserDTO[]>(
                `${BASE_URL}/business-accounts/${businessAccountId}/followers`
            )
            setFollowers(res.data)
        } catch (err: any) {
            setFollowersError(err.response?.data || err.message)
        } finally {
            setFollowersLoading(false)
        }
    }, [businessAccountId])

    const fetchFollowerCount = useCallback(async () => {
        if (!businessAccountId) {
            setFollowerCount(0)
            return
        }
        setCountLoading(true)
        setCountError(null)
        try {
            const res = await axios.get<number>(
                `${BASE_URL}/business-accounts/${businessAccountId}/followers/count`
            )
            setFollowerCount(res.data)
        } catch (err: any) {
            setCountError(err.response?.data || err.message)
        } finally {
            setCountLoading(false)
        }
    }, [businessAccountId])

    useEffect(() => {
        fetchFollowed()
    }, [fetchFollowed])

    useEffect(() => {
        fetchFollowers()
        fetchFollowerCount()
    }, [fetchFollowers, fetchFollowerCount])

    return {
        followed,
        userFetchLoading,
        userActionLoading,
        userError,
        fetchFollowed,
        follow,
        unfollow,
        isFollowing,
        followers,
        followersLoading,
        followersError,
        fetchFollowers,
        followerCount,
        countLoading,
        countError,
        fetchFollowerCount,
    }
}
