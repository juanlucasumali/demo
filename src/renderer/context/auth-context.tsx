import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useUserStore } from '@renderer/stores/user-store'

export interface AuthContextType {
  session: Session | null
  user: User | null
  signIn: (email: string, password: string) => Promise<{ isVerified: boolean; email?: string }>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  hasProfile: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)

  const checkProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()
    
    setHasProfile(!!data && !error)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        checkProfile(session.user.id)
      } else {
        clearUser()
        setHasProfile(false)
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user)
        checkProfile(session.user.id)
      } else {
        clearUser()
        setHasProfile(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    isLoading,
    hasProfile,
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
        setUser(data.session.user)
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
      clearUser()
      setSession(null)
    },
    isAuthenticated: !!session && !!session?.user,
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