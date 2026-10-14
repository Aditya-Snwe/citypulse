import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { dbService, type NotificationItem } from '../lib/dbService'
import { useAuth } from './AuthContext'

interface NotificationsContextValue {
  notifications: NotificationItem[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      const [items, unread] = await Promise.all([
        dbService.fetchNotifications(user.id, 50),
        dbService.getUnreadNotificationCount(user.id),
      ])
      setNotifications(items)
      setUnreadCount(unread)
    } catch (err) {
      console.warn('Failed to load notifications:', err)
    }
  }, [user])

  useEffect(() => {
    let isCancelled = false

    async function fetchInitial() {
      if (!isSupabaseConfigured || !user) {
        setNotifications([])
        setUnreadCount(0)
        return
      }

      setLoading(true)
      try {
        const [items, unread] = await Promise.all([
          dbService.fetchNotifications(user.id, 50),
          dbService.getUnreadNotificationCount(user.id),
        ])
        if (!isCancelled) {
          setNotifications(items)
          setUnreadCount(unread)
        }
      } catch (err) {
        console.warn('Failed to load notifications:', err)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void fetchInitial()

    return () => {
      isCancelled = true
    }
  }, [user])

  // Real-time subscription to notifications table for the logged-in user
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return

    const channel = supabase
      .channel(`user-notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, refresh])

  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      if (isSupabaseConfigured) {
        try {
          await dbService.markNotificationRead(id)
        } catch (err) {
          console.warn('Failed to mark notification as read:', err)
          refresh()
        }
      }
    },
    [refresh],
  )

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)

    if (isSupabaseConfigured && user) {
      try {
        await dbService.markAllNotificationsRead(user.id)
      } catch (err) {
        console.warn('Failed to mark all notifications as read:', err)
        refresh()
      }
    }
  }, [user, refresh])

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
