import { useState, useEffect } from 'react'
import {
  BellRing,
  CheckCircle2,
  AlertCircle,
  Shield,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  checkPushSupport,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  type PushSupportStatus,
} from '../lib/pushService'

export function WebPushOptInCard() {
  const { user } = useAuth()
  const [supportStatus, setSupportStatus] = useState<PushSupportStatus>(() => checkPushSupport())
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function checkSubscription() {
      if (supportStatus.supported) {
        const sub = await getExistingSubscription()
        if (!isCancelled) {
          setIsSubscribed(Boolean(sub))
        }
      }
    }

    void checkSubscription()

    return () => {
      isCancelled = true
    }
  }, [supportStatus.supported])

  const handleSubscribe = async () => {
    if (!user) {
      setFeedback({
        type: 'info',
        message: 'Please sign in to register browser push notifications for your account.',
      })
      return
    }

    setLoading(true)
    setFeedback(null)

    try {
      const { subscription, error } = await subscribeToPush(user.id)
      if (error) {
        setFeedback({
          type: 'error',
          message: error.message,
        })
      } else if (subscription) {
        setIsSubscribed(true)
        setSupportStatus(checkPushSupport())
        setFeedback({
          type: 'success',
          message: 'Browser push notifications enabled! You will receive alerts when issues are reported near your saved locations.',
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setFeedback({ type: 'error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!user) return
    setLoading(true)
    setFeedback(null)

    try {
      const { success, error } = await unsubscribeFromPush(user.id)
      if (error) {
        setFeedback({ type: 'error', message: error.message })
      } else if (success) {
        setIsSubscribed(false)
        setSupportStatus(checkPushSupport())
        setFeedback({
          type: 'info',
          message: 'Unsubscribed from browser push notifications. You will still receive in-app notifications.',
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setFeedback({ type: 'error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-on-surface">Browser Web Push</h3>
            <p className="text-[11px] text-on-surface-variant">
              Instant alerts even when the tab is closed
            </p>
          </div>
        </div>

        {isSubscribed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
            Disabled
          </span>
        )}
      </div>

      <p className="text-[12px] leading-relaxed text-on-surface-variant">
        Receive real-time alerts on your device when a verified civic report is logged near your
        saved alert areas. We never ask for your location merely to enable push.
      </p>

      {/* Support or Configuration Warning */}
      {!supportStatus.supported ? (
        <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-2.5 text-[12px] text-amber-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Web Push is not supported in this browser. In-app notifications will continue to work.
          </span>
        </div>
      ) : !supportStatus.hasVapidKey ? (
        <div className="flex items-start gap-2 rounded-xl bg-surface-container p-2.5 text-[12px] text-on-surface-variant">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <span className="font-semibold text-on-surface">VAPID Key Pending: </span>
            Set <code className="rounded bg-surface-lowest px-1 py-0.5 text-[11px]">VITE_VAPID_PUBLIC_KEY</code> in{' '}
            <code className="rounded bg-surface-lowest px-1 py-0.5 text-[11px]">.env</code> to activate live push registration.
          </div>
        </div>
      ) : supportStatus.permission === 'denied' ? (
        <div className="flex items-start gap-2 rounded-xl bg-error/10 p-2.5 text-[12px] text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Notification permission is blocked</p>
            <p className="mt-0.5 text-[11px]">
              To enable push alerts, update notification permissions in your browser address bar / site settings.
            </p>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="pt-1">
        {isSubscribed ? (
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-lowest text-[13px] font-medium text-error transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Revoke Browser Push Subscription</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubscribe}
            disabled={loading || !supportStatus.supported || !supportStatus.hasVapidKey}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-semibold text-on-primary shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-on-primary" />
            ) : (
              <>
                <BellRing className="h-4 w-4" />
                <span>Enable Browser Alerts</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Disclaimers & Transparency */}
      <div className="border-t border-outline-variant/30 pt-2 text-[11px] text-outline space-y-1">
        <p>• Push delivery varies by device, battery saver mode, and operating system.</p>
        <p>• Local offline demo: In-app alerts remain the primary guaranteed notification channel.</p>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`flex items-start gap-2 rounded-xl p-2.5 text-[12px] ${
            feedback.type === 'error'
              ? 'bg-error/10 text-error'
              : feedback.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700'
              : 'bg-surface-container text-on-surface'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : feedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  )
}
