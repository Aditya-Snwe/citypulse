import { ChevronRight, LogIn, LogOut, MapPin, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TopHeader } from '../components/TopHeader'
import { useAuth } from '../context/AuthContext'
import { WebPushOptInCard } from '../components/WebPushOptInCard'
import { AlertPreferencesCard } from '../components/AlertPreferencesCard'

export function Profile() {
  const navigate = useNavigate()
  const { user, profile, loading, signOut, isConfigured } = useAuth()

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Guest'
  const displayArea = profile?.area_label || (user ? 'Nashik' : 'College Road area (demo profile)')
  const displayRole = profile?.role ? `Citizen · ${profile.role}` : (user ? 'Citizen · Verified' : 'Citizen · Guest')
  const initial = displayName.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <TopHeader title="Citizen Profile & Settings" subtitle="Manage your account, alert radii, and notification channels" />

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Citizen Identity & Navigation Actions */}
          <div className="lg:col-span-5 space-y-6">
            <section className="rounded-3xl border border-outline-variant/40 bg-surface-lowest p-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-[22px] font-bold text-primary shadow-xs">
                  {initial}
                </div>
                <div className="min-w-0">
                  <h2 className="text-[20px] font-bold text-on-surface truncate">
                    {loading ? 'Loading…' : displayName}
                  </h2>
                  <p className="text-[13px] text-on-surface-variant truncate">
                    {user ? user.email : displayRole}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-primary">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{displayArea}</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Links Card */}
            <section className="overflow-hidden rounded-3xl border border-outline-variant/40 bg-surface-lowest shadow-xs divide-y divide-outline-variant/30">
              <Row label="View Notifications" onClick={() => navigate('/notifications')} />
              <Row label="My Submitted Reports" onClick={() => navigate('/reports')} />
              <Row label="Open Community Map" onClick={() => navigate('/map')} />
            </section>

            {/* Guarantee Note */}
            <div className="flex items-start gap-3 rounded-2xl bg-surface-low p-5 text-[13px] text-on-surface-variant leading-relaxed">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                CityPulse never asks you which municipal department handles an issue. You report what you observe; the platform categorizes and routes it automatically.
              </span>
            </div>

            {/* Account Controls */}
            <div>
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-error/30 bg-surface-lowest text-[14px] font-semibold text-error hover:bg-error/5 active:scale-[0.98] transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out of CityPulse</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-lowest text-[14px] font-semibold text-on-surface hover:bg-surface-container active:scale-[0.98] transition-all"
                >
                  {isConfigured ? (
                    <>
                      <LogIn className="h-4 w-4 text-primary" />
                      <span>Sign in or register account</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Return to Landing Page</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Alert Preferences & Browser Web Push Configuration */}
          <div className="lg:col-span-7 space-y-6">
            <AlertPreferencesCard />
            <WebPushOptInCard />
          </div>
        </div>
      </main>
    </div>
  )
}

function Row({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center justify-between px-5 text-left transition-colors hover:bg-surface-container/50 active:bg-surface-container"
    >
      <span className="text-[14px] sm:text-[15px] font-medium text-on-surface">{label}</span>
      <ChevronRight className="h-4 w-4 text-outline" />
    </button>
  )
}
