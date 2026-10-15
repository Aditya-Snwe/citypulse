import { ArrowRight, Loader2, LogIn, RadioTower, Shield, ShieldCheck, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Landing() {
  const navigate = useNavigate()
  const { user, isConfigured, signIn, signUp, simulateDemoAuth } = useAuth()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setSubmitting(true)

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setAuthError('Please enter your full name')
        setSubmitting(false)
        return
      }

      if (!isConfigured) {
        // Offline demo sign-up simulation
        setTimeout(() => {
          simulateDemoAuth(email, fullName.trim())
          setSubmitting(false)
          setAuthModalOpen(false)
          navigate('/home')
        }, 500)
        return
      }

      const { error } = await signUp(email, password, fullName.trim())
      setSubmitting(false)
      if (error) {
        setAuthError(error.message)
      } else {
        setSignupSuccess(true)
      }
    } else {
      if (!isConfigured) {
        // Offline demo sign-in simulation
        setTimeout(() => {
          const derivedName = email.split('@')[0] || 'Guest'
          simulateDemoAuth(email, derivedName.charAt(0).toUpperCase() + derivedName.slice(1))
          setSubmitting(false)
          setAuthModalOpen(false)
          navigate('/home')
        }, 400)
        return
      }

      const { error } = await signIn(email, password)
      setSubmitting(false)
      if (error) {
        setAuthError(error.message)
      } else {
        setAuthModalOpen(false)
        navigate('/home')
      }
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm shadow-primary/30">
              <RadioTower className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-bold tracking-tight text-on-surface">CityPulse</span>
              <span className="text-[10px] -mt-1 font-semibold uppercase tracking-wider text-outline">
                Civic Technology
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
              </span>
              <span className="text-[11px] sm:text-[12px] font-semibold text-on-surface-variant">
                {isConfigured ? 'Nashik · live' : 'Nashik · demo'}
              </span>
            </div>

            {!user && (
              <button
                type="button"
                onClick={() => {
                  setAuthError(null)
                  setSignupSuccess(false)
                  setAuthMode('signin')
                  setAuthModalOpen(true)
                }}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/60 bg-surface-lowest px-3.5 py-1.5 text-[13px] font-semibold text-on-surface hover:bg-surface-container active:scale-95 transition-all"
              >
                <LogIn className="h-4 w-4 text-primary" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex flex-1 w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Hero Left: Message & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-[11px] font-semibold text-on-primary-fixed">
                <Shield className="h-3.5 w-3.5" />
                Citizen civic awareness · Nashik
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
              CITYPULSE
            </h1>
            <p className="mt-2 text-lg sm:text-xl font-semibold text-primary">
              Your city. Your awareness.
            </p>
            <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-on-surface-variant max-w-xl">
              Stay informed about civic hazards around you and help your community stay safer. Report
              potholes, water leaks, or road damage in seconds, verify active issues with fellow
              citizens, and receive geo-aware civic alerts.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-container px-6 text-[14px] font-semibold text-on-primary-container shadow-md shadow-primary/20 transition-all hover:bg-primary active:scale-[0.98]"
                >
                  <span>Enter as {user.email?.split('@')[0]}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-container px-6 text-[14px] font-semibold text-on-primary-container shadow-md shadow-primary/20 transition-all hover:bg-primary active:scale-[0.98]"
                  >
                    <span>Continue as Guest Citizen</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null)
                      setSignupSuccess(false)
                      setAuthModalOpen(true)
                    }}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-lowest px-6 text-[14px] font-semibold text-on-surface shadow-xs transition-all hover:bg-surface-container active:scale-[0.98]"
                  >
                    <LogIn className="h-4 w-4 text-primary" />
                    <span>Sign In / Register</span>
                  </button>
                </>
              )}
            </div>

            <p className="mt-4 text-[12px] text-on-surface-variant">
              {isConfigured
                ? 'Secured with Supabase Authentication & Row Level Security'
                : 'Supabase credentials not set in .env. Running in offline demo mode with sample reports.'}
            </p>
          </div>

          {/* Hero Right: Live Radar Scanner Card */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-outline-variant/50 bg-surface-lowest p-5 sm:p-6 shadow-xl shadow-surface-dim/40">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#c3c6d7_1px,transparent_1px)] bg-size-[16px_16px] opacity-40" />
              <div className="relative flex h-52 sm:h-56 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/30 bg-linear-to-b from-surface-low to-surface-container">
                <div className="absolute h-44 w-44 animate-pulse rounded-full border border-primary/20" />
                <div className="absolute h-32 w-32 rounded-full border border-primary/30" />
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/5">
                  <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary-fixed" />
                </div>
                <div className="absolute top-6 left-6 flex items-center gap-1.5 rounded-full border border-error/30 bg-surface-lowest/95 px-2.5 py-1 text-[12px] font-medium shadow-xs">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error" />
                  <span>Pothole · Gangapur Rd</span>
                </div>
                <div className="absolute right-6 bottom-8 flex items-center gap-1.5 rounded-full border border-tertiary-container/30 bg-surface-lowest/95 px-2.5 py-1 text-[12px] font-medium shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                  <span>Cleared nearby</span>
                </div>
                <p className="absolute bottom-2.5 left-3 text-[12px] font-mono text-on-surface-variant">
                  19.9975° N, 73.7898° E (Nashik Center)
                </p>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-low p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-container text-error font-bold text-[18px]">
                    !
                  </div>
                  <div>
                    <p className="text-[22px] font-bold leading-none">8</p>
                    <p className="mt-1 text-[11px] text-on-surface-variant">Hazards tracked</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-low p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-fixed text-tertiary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[20px] font-bold leading-none truncate max-w-[110px]">
                      {user ? 'Citizen' : 'Guest'}
                    </p>
                    <p className="mt-1 text-[11px] text-on-surface-variant">
                      {user ? 'Authenticated' : 'Browsing'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Civic Features Grid */}
        <div className="mt-14 sm:mt-20 pt-10 border-t border-outline-variant/30">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-primary text-center">
            How CityPulse Works
          </p>
          <h2 className="mt-1 text-[24px] sm:text-[28px] font-bold text-center text-on-surface">
            Built for Transparent Citizen Action
          </h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 font-bold">
                1
              </div>
              <h3 className="text-[17px] font-semibold text-on-surface">Spotted a Hazard?</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-on-surface-variant">
                Drop a pin on the map or use your GPS. Upload an evidence photo and brief description.
                CityPulse categorizes it automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container/40 text-secondary mb-4 font-bold">
                2
              </div>
              <h3 className="text-[17px] font-semibold text-on-surface">Community Verification</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-on-surface-variant">
                Nearby citizens vote to confirm if the issue is real or resolved. 5 positive votes
                advance the report to Community Confirmed status.
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant/40 bg-surface-lowest p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tertiary-fixed text-tertiary mb-4 font-bold">
                3
              </div>
              <h3 className="text-[17px] font-semibold text-on-surface">Geo-Aware Alerts</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-on-surface-variant">
                Configure your home or workplace area radius. Receive in-app and browser push alerts
                when high-severity hazards appear nearby.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal preserving native aesthetic */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-outline-variant/60 bg-surface-lowest p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-[20px] font-bold">
                {authMode === 'signin' ? 'Sign in to CityPulse' : 'Create Citizen Account'}
              </h3>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-high"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {signupSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tertiary-fixed text-tertiary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h4 className="text-[16px] font-semibold">Verification link sent</h4>
                <p className="text-[13px] text-on-surface-variant">
                  We sent a confirmation email to <strong>{email}</strong>. Please confirm your email
                  or sign in if email confirmation is disabled.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSignupSuccess(false)
                    setAuthMode('signin')
                  }}
                  className="mt-3 inline-block text-[13px] font-semibold text-primary"
                >
                  Switch to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4 pt-2">
                {authError && (
                  <div className="rounded-lg bg-error-container p-3 text-[12px] text-error">
                    {authError}
                  </div>
                )}

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[12px] font-semibold text-outline">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Citizen Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-[14px] text-on-surface placeholder:text-outline"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-semibold text-outline">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-[14px] text-on-surface placeholder:text-outline"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-outline">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-[14px] text-on-surface placeholder:text-outline"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-semibold text-on-primary shadow-sm disabled:opacity-50 active:scale-[0.98]"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : authMode === 'signin' ? (
                    <>
                      <LogIn className="h-4 w-4" /> Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> Create Account
                    </>
                  )}
                </button>

                {!isConfigured && (
                  <div className="pt-2 border-t border-outline-variant/30 space-y-1.5 text-center">
                    <p className="text-[11px] font-semibold text-outline uppercase tracking-wider">
                      Demo Mode Quick Sign-In
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          simulateDemoAuth('guest@citypulse.local', 'Guest')
                          setAuthModalOpen(false)
                          navigate('/home')
                        }}
                        className="flex-1 rounded-lg border border-primary/30 bg-primary/5 py-1.5 text-[12px] font-semibold text-primary hover:bg-primary/10 active:scale-95"
                      >
                        Guest
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          simulateDemoAuth('rahul@citypulse.local', 'Rahul Verma')
                          setAuthModalOpen(false)
                          navigate('/home')
                        }}
                        className="flex-1 rounded-lg border border-secondary/30 bg-secondary/5 py-1.5 text-[12px] font-semibold text-secondary hover:bg-secondary/10 active:scale-95"
                      >
                        Citizen 2 (Rahul)
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null)
                      setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                    }}
                    className="text-[13px] font-medium text-primary hover:underline"
                  >
                    {authMode === 'signin'
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
