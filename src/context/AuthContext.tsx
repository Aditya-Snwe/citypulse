import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { dbService, type Profile } from '../lib/dbService'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isConfigured: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  simulateDemoAuth: (email: string, fullName: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (!isSupabaseConfigured && typeof window !== 'undefined') {
      const saved = localStorage.getItem('citypulse.demoUser')
      if (saved) {
        try {
          return JSON.parse(saved).user || null
        } catch {
          return null
        }
      }
    }
    return null
  })
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(() => {
    if (!isSupabaseConfigured && typeof window !== 'undefined') {
      const saved = localStorage.getItem('citypulse.demoUser')
      if (saved) {
        try {
          return JSON.parse(saved).profile || null
        } catch {
          return null
        }
      }
    }
    return null
  })
  const [loading, setLoading] = useState(() => isSupabaseConfigured)

  const fetchProfileForUser = async (userId: string) => {
    try {
      const p = await dbService.getProfile(userId)
      setProfile(p)
    } catch (err) {
      console.warn('Failed to load profile:', err)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }


    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileForUser(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        fetchProfileForUser(currentSession.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase credentials are not configured in .env') }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase credentials are not configured in .env') }
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error ? new Error(error.message) : null }
  }

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('citypulse.demoUser')
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const simulateDemoAuth = (email: string, fullName: string) => {
    const fakeId = 'demo-citizen-uuid-' + Math.random().toString(36).substring(2, 9)
    const fakeUser = {
      id: fakeId,
      email,
      app_metadata: {},
      user_metadata: { full_name: fullName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User

    const fakeProfile: Profile = {
      id: fakeId,
      full_name: fullName,
      area_label: 'College Road, Nashik',
      avatar_url: null,
      role: 'Citizen',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    localStorage.setItem('citypulse.demoUser', JSON.stringify({ user: fakeUser, profile: fakeProfile }))
    setUser(fakeUser)
    setProfile(fakeProfile)
  }

  const refreshProfile = async () => {
    if (user && isSupabaseConfigured) {
      await fetchProfileForUser(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        simulateDemoAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
