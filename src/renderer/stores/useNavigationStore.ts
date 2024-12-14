import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { router } from '../main'

interface NavigationState {
  lastVisitedPath: string
  isNavigationBlocked: boolean
  blockNavigation: () => void
  unblockNavigation: () => void
  setLastVisitedPath: (path: string) => void
  getLastVisitedPath: () => string
  navigate: (to: string, options?: { replace?: boolean }) => void
  goBack: () => void
  goForward: () => void
  getCurrentPath: () => string
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      lastVisitedPath: '/',
      isNavigationBlocked: false,

      blockNavigation: () => set({ isNavigationBlocked: true }),
      unblockNavigation: () => set({ isNavigationBlocked: false }),
      
      setLastVisitedPath: (path: string) => {
        if (!path.includes('sign-in') && 
            !path.includes('sign-up') && 
            !path.includes('complete-profile') && 
            !path.includes('verify-email')) {
          set({ lastVisitedPath: path })
        }
      },
      
      getLastVisitedPath: () => get().lastVisitedPath,
      
      navigate: (to: string, options?: { replace?: boolean }) => {
        if (get().isNavigationBlocked) {
          // You could implement a confirmation dialog here
          console.warn('Navigation is blocked')
          return
        }
        get().setLastVisitedPath(to)
        router.navigate({ to, replace: options?.replace })
      },
      
      goBack: () => {
        if (get().isNavigationBlocked) {
          console.warn('Navigation is blocked')
          return
        }
        router.history.back()
      },
      
      goForward: () => {
        if (get().isNavigationBlocked) {
          console.warn('Navigation is blocked')
          return
        }
        router.history.forward()
      },
      
      getCurrentPath: () => router.state.location.pathname
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({ lastVisitedPath: state.lastVisitedPath })
    }
  )
)

// Modified convenience object
export const navigation = {
  navigate: (...args: Parameters<NavigationState['navigate']>) => 
    useNavigationStore.getState().navigate(...args),
  goBack: () => useNavigationStore.getState().goBack(),
  goForward: () => useNavigationStore.getState().goForward(),
  getCurrentPath: () => useNavigationStore.getState().getCurrentPath(),
  getLastVisitedPath: () => useNavigationStore.getState().getLastVisitedPath(),
  blockNavigation: () => useNavigationStore.getState().blockNavigation(),
  unblockNavigation: () => useNavigationStore.getState().unblockNavigation()
}
