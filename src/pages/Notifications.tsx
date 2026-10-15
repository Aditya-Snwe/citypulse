import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, MapPin, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'
import { TopHeader } from '../components/TopHeader'
import { useNotifications } from '../context/NotificationsContext'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { formatRelative } from '../lib/format'
import { cn } from '../lib/cn'
import { WebPushOptInCard } from '../components/WebPushOptInCard'

export function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh } =
    useNotifications()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleNotificationClick = async (notif: (typeof notifications)[0]) => {
    if (!notif.is_read) {
      await markAsRead(notif.id)
    }
    if (notif.report_id) {
      navigate(`/reports/${notif.report_id}`)
    }
  }

  const getIconForType = (type?: string) => {
    switch (type) {
      case 'nearby_alert':
        return <MapPin className="h-4 w-4 text-primary" />
      case 'status_update':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'verification_milestone':
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />
      default:
        return <Bell className="h-4 w-4 text-primary" />
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface">
      <TopHeader
        title="Notifications"
        backTo="/home"
        subtitle="Nearby civic reports, verification alerts, and resolution updates"
        showBell={false}
        right={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline px-2.5 py-1.5 rounded-lg hover:bg-primary/5 transition-all"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all read</span>
            </button>
          ) : undefined
        }
      />

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 sm:px-6 py-6">
        <WebPushOptInCard />

        {!isSupabaseConfigured ? (
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4 text-center">
            <Bell className="mx-auto h-8 w-8 text-on-surface-variant/50" />
            <p className="mt-2 text-[14px] font-semibold text-on-surface">Supabase Not Connected</p>
            <p className="mt-1 text-[12px] text-on-surface-variant">
              In-app notifications require an active Supabase connection. Connect your project and
              configure alert locations in Profile.
            </p>
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-6 text-center">
            <Bell className="mx-auto h-8 w-8 text-on-surface-variant/50" />
            <p className="mt-2 text-[14px] font-semibold text-on-surface">Sign in to view notifications</p>
            <p className="mt-1 text-[12px] text-on-surface-variant">
              Personalized nearby alerts and status updates are linked to your account.
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-on-primary"
            >
              Go to Profile / Sign In
            </button>
          </div>
        ) : loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <p className="mt-3 text-[13px]">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-lowest py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-[15px] font-semibold text-on-surface">All caught up!</h3>
            <p className="mt-1 max-w-[260px] text-[12px] text-on-surface-variant">
              When civic reports are filed near your saved alert locations, they will appear here.
            </p>
            <button
              type="button"
              onClick={() => refresh()}
              className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const isUnread = !notif.is_read
              return (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    'group relative w-full rounded-2xl border p-3.5 text-left transition-all active:scale-[0.99]',
                    isUnread
                      ? 'border-primary/30 bg-primary/5 shadow-xs'
                      : 'border-outline-variant/40 bg-surface-lowest hover:bg-surface-container/50',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        isUnread ? 'bg-primary/15' : 'bg-surface-container',
                      )}
                    >
                      {getIconForType(notif.notification_type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            'truncate text-[13px]',
                            isUnread ? 'font-semibold text-on-surface' : 'font-medium text-on-surface/80',
                          )}
                        >
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <p className="mt-0.5 text-[12px] text-on-surface-variant line-clamp-2">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-outline">
                        <span>{formatRelative(notif.created_at)}</span>
                        {notif.report_id && (
                          <span className="font-medium text-primary group-hover:underline">
                            View issue →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
