import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { router } from '../main'

interface NavigationState {
  lastVisitedPath: string
  isNavigationBlocked: boolean
  isSidebarOpen: boolean // New state
  blockNavigation: () => void
  unblockNavigation: () => void
  setLastVisitedPath: (path: string) => void
  getLastVisitedPath: () => string
  navigate: (to: string, options?: { replace?: boolean }) => void
  goBack: () => void
  goForward: () => void
  getCurrentPath: () => string
  toggleSidebar: () => void // New method
  setSidebarOpen: (open: boolean) => void  // Fixed: added return type
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      lastVisitedPath: '/',
      isNavigationBlocked: false,
      isSidebarOpen: true, // Default state

      blockNavigation: () => set({ isNavigationBlocked: true }),
      unblockNavigation: () => set({ isNavigationBlocked: false }),
      
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
      
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
      partialize: (state) => ({ 
        lastVisitedPath: state.lastVisitedPath,
        isSidebarOpen: state.isSidebarOpen // Add to persisted state
      })
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
  unblockNavigation: () => useNavigationStore.getState().unblockNavigation(),
  toggleSidebar: () => useNavigationStore.getState().toggleSidebar(),
  setSidebarOpen: (open: boolean) => useNavigationStore.getState().setSidebarOpen(open),
  isSidebarOpen: () => useNavigationStore.getState().isSidebarOpen
}
