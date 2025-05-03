// src/notifications/NotificationsManager.tsx
import {useAuthContext} from '@/contexts/AuthContext';
import {useNotifications} from '@/hooks/useNotifications';
import {BASE_URL} from "@/config/api";

export default function NotificationsManager() {
    const {appUser, loadingAppUser} = useAuthContext();

    const userId = appUser?.userid ?? null;
    const isReady = !loadingAppUser && userId !== null;

    // console.log('[NotificationsManager]', { loadingAppUser, userId, isReady });

    useNotifications(isReady ? userId : null, BASE_URL);

    return null; // No UI
}
