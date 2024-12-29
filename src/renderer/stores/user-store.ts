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
  createProfile: (data: UserProfile) => Promise<void>
  uploadAvatar: (userId: string, file: File) => Promise<string>
  fetchProfile: (userId: string) => Promise<void>
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, profile: null }),
      createProfile: async (data) => {
        await userService.createProfile(data)
        const profile = await userService.getProfile(data.id)
        set({ profile })
      },
      uploadAvatar: async (userId, file) => {
        return await userService.uploadAvatar(userId, file)
      },
      fetchProfile: async (userId) => {
        const profile = await userService.getProfile(userId)
        set({ profile })
      }
    }),
    {
      name: 'user-storage',
    }
  )
) 