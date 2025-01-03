import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { persist } from 'zustand/middleware'
import { UserProfile } from '@renderer/types/users'
import * as userService from '@renderer/services/user-service'

interface UserStore {
  user: User | null
  profile: UserProfile | null
  setUser: (user: User | null) => void
  clearUser: () => void
  createProfile: (data: UserProfile, avatarInfo?: { b2FileId: string, fileName: string }) => Promise<void>
  uploadAvatar: (userId: string, file: File) => Promise<{ b2FileId: string, fileName: string }>
  fetchProfile: (userId: string) => Promise<void>
  getAvatar: (b2FileId: string) => Promise<ArrayBuffer>
  avatarUrls: Map<string, string>
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      avatarUrls: new Map(),
      setUser: (user) => set({ user }),
      clearUser: () => {
        // Cleanup existing avatar URLs
        get().avatarUrls.forEach(url => URL.revokeObjectURL(url))
        set({ user: null, profile: null, avatarUrls: new Map() })
      },
      createProfile: async (data, avatarInfo) => {
        await userService.createProfile(data, avatarInfo)
        await get().fetchProfile(data.id)
      },
      uploadAvatar: async (userId, file) => {
        return await userService.uploadAvatar(userId, file)
      },
      fetchProfile: async (userId) => {
        const profile = await userService.getProfile(userId)
        
        if (profile.avatar && !get().avatarUrls.has(profile.avatar)) {
          try {
            const avatarUrl = await userService.getAvatarUrl(profile.avatar)
            set(state => ({
              avatarUrls: new Map(state.avatarUrls).set(profile.avatar!, avatarUrl)
            }))
            profile.avatar = avatarUrl
          } catch (error) {
            console.error('Failed to load avatar:', error)
            profile.avatar = null
          }
        } else if (profile.avatar) {
          profile.avatar = get().avatarUrls.get(profile.avatar)!
        }
        
        set({ profile })
      },
      getAvatar: async (b2FileId) => {
        return await userService.getAvatar(b2FileId)
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile
      })
    }
  )
) 