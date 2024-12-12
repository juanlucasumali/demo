import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/renderer/lib/supabase'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  hasProfile: boolean 
  setUser: (user: User | null) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string, 
    password: string, 
    profile: {
      username: string
      displayName: string
      profileImage: string | null
    }
  ) => Promise<{ requiresEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  checkProfile: () => Promise<boolean>
  verifyAuth: () => Promise<{ isAuthenticated: boolean; hasProfile: boolean }>
  clearState: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasProfile: false,
      clearState: () => {
        console.log('Clearing auth state')
        set({ user: null, isAuthenticated: false, hasProfile: false })
        localStorage.removeItem('auth-storage') // Forcefully clear persistent storage
      },
      setUser: async (user) => {
        console.log('Setting user:', user)
        // Verify the session is still valid
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('No valid session found, clearing state')
          set({ user: null, isAuthenticated: false, hasProfile: false })
          localStorage.removeItem('auth-storage')
          return
        }

        const isAuthenticated = !!user?.email_confirmed_at
        console.log('Email confirmed:', user?.email_confirmed_at)
        console.log('Setting authenticated:', isAuthenticated)
        
        // Check profile when setting user
        const hasProfile = user ? await get().checkProfile() : false
        console.log('Has profile:', hasProfile)

        set({ 
          user,
          isAuthenticated,
          hasProfile
        })
      },
      verifyAuth: async () => {
        console.log("Verifying auth")

        // Check session
        const { data: { session } } = await supabase.auth.getSession()

        console.log("Session:", session)
        
        if (!session) {
          console.log("No session currently.")
          set({ user: null, isAuthenticated: false, hasProfile: false })
          return { isAuthenticated: false, hasProfile: false }
        }

        console.log("Verifying user...")

        // Verify user
        const currentUser = session.user
        const isAuthenticated = !!currentUser?.email_confirmed_at

        console.log("Checking profile...")

        // Check profile
        let hasProfile = false
        if (currentUser) {
          try {
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('user_id', currentUser.id)
              .single()
            hasProfile = !!data
          } catch (error) {
            console.error('Error checking profile:', error)
          }
        }

        // Update state
        set({
          user: currentUser,
          isAuthenticated,
          hasProfile
        })

        console.log("Updating state:", currentUser, isAuthenticated, hasProfile)

        return { isAuthenticated, hasProfile }
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
      signUp: async (email, password, profile) => {
        console.log('Signing up...')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: profile.username,
              display_name: profile.displayName,
              profile_image: profile.profileImage
            } as object // Type assertion to satisfy Supabase types
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
      checkProfile: async () => {
        const user = get().user
        if (!user) return false

        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .single()

          const hasProfile = !!data
          console.log('Profile check result:', hasProfile)
          set({ hasProfile })
          return hasProfile
        } catch (error) {
          console.error('Error checking profile:', error)
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasProfile: state.hasProfile
      })
    }
  )
)

export const useAuth = () => useAuthStore()