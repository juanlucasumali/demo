import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useUserStore } from '@renderer/stores/user-store'
import { getProfile } from '@renderer/services/user-service'

export interface AuthContextType {
  session: Session | null
  user: User | null
  signIn: (email: string, password: string) => Promise<{ isVerified: boolean; email?: string }>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  hasProfile: boolean
  checkProfile: (userId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const initializationInProgress = useRef(false)
  const lastInitializedUserId = useRef<string | null>(null)
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)
  const setProfile = useUserStore((state) => state.setProfile)

  const initializeUserSession = async (user: User) => {
    // Prevent concurrent initializations
    if (initializationInProgress.current) {
      return
    }

    // Skip if we've already initialized this user
    if (lastInitializedUserId.current === user.id) {
      return
    }

    initializationInProgress.current = true
    setUser(user)

    try {
      const profile = await getProfile(user.id)
      setHasProfile(!!profile)
      if (profile) {
        setProfile(profile)
      }
      lastInitializedUserId.current = user.id
    } catch (error) {
      console.error('Error initializing user session:', error)
      // Reset initialization state on error
      lastInitializedUserId.current = null
    } finally {
      initializationInProgress.current = false
      setIsProfileLoading(false)
    }
  }

  const clearUserSession = () => {
    clearUser()
    setHasProfile(false)
    setIsProfileLoading(false)
    lastInitializedUserId.current = null
    initializationInProgress.current = false
  }

  useEffect(() => {
    let mounted = true

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      setSession(session)
      if (session?.user) {
        initializeUserSession(session.user)
      } else {
        clearUserSession()
      }
      setIsAuthLoading(false)
    })

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return

      setSession(newSession)
      
      // Only initialize if:
      // 1. We have a new session and no previous session
      // 2. The user ID changed
      // 3. The session became null (sign out)
      const shouldInitialize = 
        (newSession && !session) || 
        (newSession?.user.id !== session?.user?.id) ||
        (!newSession && session)

      if (shouldInitialize) {
        if (newSession?.user) {
          initializeUserSession(newSession.user)
        } else {
          clearUserSession()
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [session]) // Add session as dependency to track changes

  const checkProfile = async (userId: string) => {
    const profile = await getProfile(userId)
    setHasProfile(!!profile)
    if (profile) {
      setProfile(profile)
    }
    setIsProfileLoading(false)
  }

  const isLoading = isAuthLoading || isProfileLoading
  const isAuthenticated = !!session && !!session?.user

  const value = {
    session,
    user: session?.user ?? null,
    isLoading,
    hasProfile,
    checkProfile,
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) throw error

      // Check if email is verified
      const { data: userData } = await supabase.auth.getUser()
      const isVerified = userData.user?.email_confirmed_at != null

      if (!isVerified) {
        // Sign out if not verified
        await supabase.auth.signOut()
        return { isVerified: false, email }
      }

      setSession(data.session)
      if (data.session?.user) {
        await initializeUserSession(data.session.user)
      }
      
      return { isVerified: true }
    },
    signUp: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      clearUserSession()
      setSession(null)
    },
    isAuthenticated,
  }

  if (isLoading) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}