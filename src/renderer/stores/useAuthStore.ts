import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/renderer/lib/supabase'
import { UserProfile } from '../components/layout/types'
import { mediaService } from '../services/b2Service'

interface AuthState {
  user: User | null
  userProfile: UserProfile | null
  isAuthenticated: boolean
  hasProfile: boolean 
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string, 
    password: string, 
    profile: {
      username: string
      displayName: string
      avatarPath: string | null
    }
  ) => Promise<{ requiresEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  checkProfile: () => Promise<boolean>
  verifyAuth: () => Promise<{ isAuthenticated: boolean; hasProfile: boolean }>
  clearState: () => void
  getUserProfile: () => Promise<UserProfile | null>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userProfile: null,
      isAuthenticated: false,
      hasProfile: false,
      clearState: () => {
        console.log('Clearing auth state')
        set({ user: null, userProfile: null, isAuthenticated: false, hasProfile: false })
        localStorage.removeItem('auth-storage') // Forcefully clear persistent storage
      },
      verifyAuth: async () => {
        console.log("Verifying auth")
      
        // Check session
        const { data: { session } } = await supabase.auth.getSession()
      
        console.log("Session:", session)
        
        if (!session) {
          console.log("No session currently.")
          set({ 
            user: null, 
            userProfile: null, 
            isAuthenticated: false, 
            hasProfile: false 
          })
          return { isAuthenticated: false, hasProfile: false }
        }
      
        console.log("Verifying user...")
      
        // Verify user
        const currentUser = session.user
        const isAuthenticated = !!currentUser?.email_confirmed_at
      
        console.log("Checking profile...")
      
        // Check profile and get profile data
        let hasProfile = false
        let userProfile = null
        
        if (currentUser) {
          try {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', currentUser.id)
              .single()
      
            if (error) throw error
      
            if (data) {
              hasProfile = true
              userProfile = {
                username: data.username,
                email: data.email,
                displayName: data.display_name,
                localPath: data.local_path ?? null,
                // Wait for the avatar URL
                avatar: data.avatar_path ? await mediaService.getAvatarUrl(data.avatar_path) : null
              }
              console.log("Profile found:", userProfile)
            }
          } catch (error) {
            console.error('Error checking profile:', error)
          }
        }
      
        // Update state
        set({
          user: currentUser,
          userProfile,
          isAuthenticated,
          hasProfile
        })
      
        console.log("Updating state:", {
          user: currentUser,
          userProfile,
          isAuthenticated,
          hasProfile
        })
      
        return { isAuthenticated, hasProfile }
      },
      getUserProfile: async () => {
        const user = get().user
        if (!user) return null
      
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
      
          if (error) throw error
      
          const profile = {
            username: data.username,
            email: data.email,
            localPath: data.local_path ?? null,
            displayName: data.display_name,
            // Wait for the avatar URL
            avatar: data.avatar_path ? await mediaService.getAvatarUrl(data.avatar_path) : null
          }
      
          set({ userProfile: profile })
          return profile
        } catch (error) {
          console.error('Error fetching user profile:', error)
          return null
        }
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
              avatar_pathpty: profile.avatarPath
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
          userProfile: null,
          isAuthenticated: false,
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
            .eq('id', user.id)
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
        userProfile: state.userProfile,
        isAuthenticated: state.isAuthenticated,
        hasProfile: state.hasProfile
      })
    }
  )
)

export const useAuth = () => useAuthStore()