import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { persist } from 'zustand/middleware'
import { UserProfile } from '@renderer/types/users'
import * as userService from '@renderer/services/user-service'
import { DemoItem } from '@renderer/types/items'

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
  highlights: DemoItem[]
  favorites: {
    movie: string | null
    song: string | null
    place: string | null
  }
  updateHighlights: (items: DemoItem[]) => Promise<void>
  fetchHighlights: () => Promise<void>
  updateFavorites: (data: {
    movie: string | null
    song: string | null
    place: string | null
  }) => Promise<void>
  fetchFavorites: () => Promise<void>
  updateProfile: (profile: UserProfile) => Promise<void>
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      avatarUrls: new Map(),
      highlights: [],
      favorites: {
        movie: null,
        song: null,
        place: null
      },
      setUser: (user) => set({ user }),
      clearUser: () => {
        // Cleanup existing avatar URLs
        get().avatarUrls.forEach(url => URL.revokeObjectURL(url))
        set({ user: null, profile: null, avatarUrls: new Map(), highlights: [], favorites: { movie: null, song: null, place: null } })
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
      },
      updateHighlights: async (items) => {
        const userId = get().user?.id
        if (!userId) throw new Error('User not authenticated')
        await userService.updateHighlights(userId, items)
        set({ highlights: items })
      },
      fetchHighlights: async () => {
        const userId = get().user?.id
        if (!userId) throw new Error('User not authenticated')
        const highlights = await userService.getHighlights(userId)
        set({ highlights })
      },
      updateFavorites: async (data) => {
        const userId = get().user?.id
        if (!userId) throw new Error('User not authenticated')
        await userService.updateFavorites(userId, data)
        set({ favorites: data })
      },
      fetchFavorites: async () => {
        const userId = get().user?.id
        if (!userId) throw new Error('User not authenticated')
        const favorites = await userService.getFavorites(userId)
        set({ favorites })
      },
      updateProfile: async (profile) => {
        await userService.updateProfile(profile)
        set({ profile })
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        highlights: state.highlights,
        favorites: state.favorites
      })
    }
  )
) 