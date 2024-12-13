import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NavigationState {
  lastVisitedPath: string
  setLastVisitedPath: (path: string) => void
  getLastVisitedPath: () => string
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      lastVisitedPath: '/',
      setLastVisitedPath: (path: string) => {
        // Don't store auth-related paths
        if (!path.includes('sign-in') && !path.includes('sign-up') && !path.includes('complete-profile')) {
          set({ lastVisitedPath: path })
        }
      },
      getLastVisitedPath: () => get().lastVisitedPath
    }),
    {
      name: 'navigation-storage'
    }
  )
)
