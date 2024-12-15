import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { router } from '../main'

interface NavigationState {
  lastVisitedPath: string
  isNavigationBlocked: boolean
  isSidebarOpen: boolean
  currentProjectId: string | null
  currentFolderId: string | null

  // Navigation control
  blockNavigation: () => void
  unblockNavigation: () => void

  // Sidebar controls
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Path management
  setLastVisitedPath: (path: string) => void
  getLastVisitedPath: () => string
  getCurrentPath: () => string
  parsePathIds: () => { projectId: string | null, folderId: string | null }

  // Navigation actions
  navigate: (to: string, options?: { replace?: boolean }) => void
  goBack: () => void
  goForward: () => void

  // Project/Folder navigation
  navigateToProject: (projectId: string) => void
  navigateToFolder: (projectId: string, folderId: string) => void
  navigateToProjectRoot: (projectId: string) => void

  // Current location getters/setters
  getCurrentProjectId: () => string | null
  getCurrentFolderId: () => string | null
  setCurrentProjectId: (projectId: string | null) => void
  setCurrentFolderId: (folderId: string | null) => void
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      lastVisitedPath: '/',
      isNavigationBlocked: false,
      isSidebarOpen: true,
      currentProjectId: null,
      currentFolderId: null,

      // Navigation control
      blockNavigation: () => set({ isNavigationBlocked: true }),
      unblockNavigation: () => set({ isNavigationBlocked: false }),

      // Sidebar controls
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

      // Path management
      setLastVisitedPath: (path: string) => {
        if (!path.includes('sign-in') && 
            !path.includes('sign-up') && 
            !path.includes('complete-profile') && 
            !path.includes('verify-email')) {
          set({ lastVisitedPath: path })
        }
      },
      
      getLastVisitedPath: () => get().lastVisitedPath,
      
      getCurrentPath: () => router.state.location.pathname,

      parsePathIds: () => {
        const path = get().getCurrentPath()
        const parts = path.split('/').filter(Boolean)
        
        // If parts[0] is 'projects', then parts[1] is the projectId
        const projectId = parts[0] === 'projects' ? parts[1] : null
        const folderId = parts[2] || null
      
        console.log("PARSING PATHIDS:", {
          path,
          parts,
          projectId,
          folderId
        })
        
        set({ 
          currentProjectId: projectId, 
          currentFolderId: folderId 
        })
        
        return { projectId, folderId }
      },      

      // Navigation actions
      navigate: (to: string, options?: { replace?: boolean }) => {
        if (get().isNavigationBlocked) {
          console.warn('Navigation is blocked')
          return
        }
        get().setLastVisitedPath(to)
        router.navigate({ to, replace: options?.replace })
        get().parsePathIds()
      },
      
      goBack: () => {
        if (get().isNavigationBlocked) {
          console.warn('Navigation is blocked')
          return
        }
        router.history.back()
        get().parsePathIds()
      },
      
      goForward: () => {
        if (get().isNavigationBlocked) {
          console.warn('Navigation is blocked')
          return
        }
        router.history.forward()
        get().parsePathIds()
      },

      // Project/Folder navigation
      navigateToProject: (projectId: string) => {
        get().navigate(`/projects/${projectId}`)
      },

      navigateToFolder: (projectId: string, folderId: string) => {
        get().navigate(`/projects/${projectId}/${folderId}`)
      },

      navigateToProjectRoot: (projectId: string) => {
        get().navigate(`/projects/${projectId}`)
      },

      // Current location getters/setters
      getCurrentProjectId: () => get().currentProjectId,
      getCurrentFolderId: () => get().currentFolderId,
      setCurrentProjectId: (projectId: string | null) => 
        set({ currentProjectId: projectId }),
      setCurrentFolderId: (folderId: string | null) => 
        set({ currentFolderId: folderId }),
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({ 
        lastVisitedPath: state.lastVisitedPath,
        isSidebarOpen: state.isSidebarOpen,
        currentProjectId: state.currentProjectId,
        currentFolderId: state.currentFolderId
      })
    }
  )
)

// Convenience object for direct state access
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
  isSidebarOpen: () => useNavigationStore.getState().isSidebarOpen,
  getCurrentProjectId: () => useNavigationStore.getState().getCurrentProjectId(),
  getCurrentFolderId: () => useNavigationStore.getState().getCurrentFolderId(),
  parsePathIds: () => useNavigationStore.getState().parsePathIds(),
  navigateToProject: (projectId: string) => 
    useNavigationStore.getState().navigateToProject(projectId),
  navigateToFolder: (projectId: string, folderId: string) => 
    useNavigationStore.getState().navigateToFolder(projectId, folderId),
  navigateToProjectRoot: (projectId: string) => 
    useNavigationStore.getState().navigateToProjectRoot(projectId),
}
