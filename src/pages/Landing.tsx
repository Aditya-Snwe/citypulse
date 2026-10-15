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
          const derivedName = email.split('@')[0] || 'Aditi Sharma'
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
      <header className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
            <RadioTower className="h-4 w-4" />
          </div>
          <span className="text-[20px] font-bold tracking-tight">CityPulse</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container px-2.5 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-error" />
          </span>
          <span className="text-[11px] font-semibold">
            {isConfigured ? 'Nashik · live' : 'Nashik · demo'}
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 pb-8">
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-lowest p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#c3c6d7_1px,transparent_1px)] bg-size-[16px_16px] opacity-40" />
          <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/30 bg-linear-to-b from-surface-low to-surface-container">
            <div className="absolute h-36 w-36 animate-pulse rounded-full border border-primary/20" />
            <div className="absolute h-24 w-24 rounded-full border border-primary/30" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/5">
              <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary-fixed" />
            </div>
            <div className="absolute top-7 left-6 flex items-center gap-1.5 rounded-full border border-error/30 bg-surface-lowest/90 px-2 py-0.5 text-[12px]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error" />
              Pothole
            </div>
            <div className="absolute right-6 bottom-8 flex items-center gap-1.5 rounded-full border border-tertiary-container/30 bg-surface-lowest/90 px-2 py-0.5 text-[12px]">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
              Cleared nearby
            </div>
            <p className="absolute bottom-2 left-2 text-[12px] text-on-surface-variant">
              19.9975° N, 73.7898° E
            </p>
          </div>
          <div className="relative mt-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-low p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-error-container text-error">
                !
              </div>
              <div>
                <p className="text-[20px] font-bold leading-none">8</p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant">Hazards tracked</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-low p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-tertiary-fixed text-tertiary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[20px] font-bold leading-none">
                  {user ? 'Citizen' : 'Guest'}
                </p>
                <p className="mt-0.5 text-[11px] text-on-surface-variant">
                  {user ? 'Authenticated' : 'Browsing'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-2.5 py-1 text-[11px] font-semibold text-on-primary-fixed">
            <Shield className="h-3.5 w-3.5" />
            Citizen civic awareness
          </span>
          <h1 className="text-[32px] leading-9 font-bold tracking-tight">CITYPULSE</h1>
          <p className="mt-1 text-[16px] font-semibold text-primary">Your city. Your awareness.</p>
          <p className="mt-2 text-[14px] leading-5 text-on-surface-variant">
            Stay informed about civic issues around you and help your community stay safer.
          </p>
        </div>

        <div className="mt-auto space-y-2">
          {user ? (
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-container text-[13px] font-semibold text-on-primary-container shadow-sm active:scale-[0.98]"
            >
              Enter as {user.email?.split('@')[0]}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-container text-[13px] font-semibold text-on-primary-container shadow-sm active:scale-[0.98]"
              >
                Continue as Guest Citizen
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError(null)
                  setSignupSuccess(false)
                  setAuthModalOpen(true)
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-low text-[13px] font-semibold text-on-surface active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4 text-primary" />
                Sign In / Register
              </button>
            </>
          )}
          <p className="pt-2 text-center text-[11px] text-on-surface-variant">
            {isConfigured
              ? 'Secured with Supabase Authentication & Row Level Security'
              : 'Supabase credentials not set in .env. Running in offline demo mode.'}
          </p>
        </div>
      </main>

      {/* Auth Modal preserving native aesthetic */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-[430px] rounded-t-3xl sm:rounded-2xl border border-outline-variant/60 bg-surface-lowest p-6 shadow-2xl">
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
                      placeholder="e.g. Aditi Sharma"
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
                          simulateDemoAuth('aditi@citypulse.local', 'Aditi Sharma')
                          setAuthModalOpen(false)
                          navigate('/home')
                        }}
                        className="flex-1 rounded-lg border border-primary/30 bg-primary/5 py-1.5 text-[12px] font-semibold text-primary hover:bg-primary/10 active:scale-95"
                      >
                        Citizen 1 (Aditi)
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
