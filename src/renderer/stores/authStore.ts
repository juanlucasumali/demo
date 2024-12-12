import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/renderer/lib/supabase'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  clearState: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      clearState: () => {
        console.log('Clearing auth state')
        set({ user: null, isAuthenticated: false })
        localStorage.removeItem('auth-storage') // Forcefully clear persistent storage
      },
      setUser: async (user) => {
        console.log('Setting user:', user)
        // Verify the session is still valid
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('No valid session found, clearing state')
          set({ user: null, isAuthenticated: false })
          localStorage.removeItem('auth-storage')
          return
        }

        const isAuthenticated = !!user?.email_confirmed_at
        console.log('Email confirmed:', user?.email_confirmed_at)
        console.log('Setting authenticated:', isAuthenticated)
        set({ 
          user,
          isAuthenticated
        })
      },
      signIn: async (email, password) => {
        console.log('Signing in...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        if (!data.user.email_confirmed_at) {
          throw new Error('Please verify your email before signing in.')
        }
        
        console.log('Sign in successful:', data.user)
        set({ 
          user: data.user,
          isAuthenticated: true 
        })
      },
      signUp: async (email, password) => {
        console.log('Signing up...')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        if (error) throw error
        console.log('Sign up successful:', data.user)
        
        set({ 
          user: data.user,
          isAuthenticated: false
        })
        
        return { requiresEmailConfirmation: data.session === null }
      },
      signOut: async () => {
        console.log('Signing out...')
        await supabase.auth.signOut()
        localStorage.removeItem('auth-storage') // Clear storage on sign out
        set({ 
          user: null,
          isAuthenticated: false 
        })
        console.log('Sign out complete')
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export const useAuth = () => useAuthStore()
