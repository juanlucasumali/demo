import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { router } from '../main'

interface NavigationState {
  lastVisitedPath: string
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
      
      setLastVisitedPath: (path: string) => {
        // Don't store auth-related paths
        if (!path.includes('sign-in') && 
            !path.includes('sign-up') && 
            !path.includes('complete-profile')) {
          set({ lastVisitedPath: path })
        }
      },
      
      getLastVisitedPath: () => get().lastVisitedPath,
      
      navigate: (to: string, options?: { replace?: boolean }) => {
        get().setLastVisitedPath(to)
        router.navigate({ to, replace: options?.replace })
      },
      
      goBack: () => {
        router.history.back()
      },
      
      goForward: () => {
        router.history.forward()
      },
      
      getCurrentPath: () => {
        return router.state.location.pathname
      }
    }),
    {
      name: 'navigation-storage',
      // Only persist the lastVisitedPath
      partialize: (state) => ({ lastVisitedPath: state.lastVisitedPath })
    }
  )
)

// Export a convenience function for direct navigation usage
export const navigation = {
  navigate: (...args: Parameters<NavigationState['navigate']>) => 
    useNavigationStore.getState().navigate(...args),
  goBack: () => useNavigationStore.getState().goBack(),
  goForward: () => useNavigationStore.getState().goForward(),
  getCurrentPath: () => useNavigationStore.getState().getCurrentPath(),
  getLastVisitedPath: () => useNavigationStore.getState().getLastVisitedPath()
}
