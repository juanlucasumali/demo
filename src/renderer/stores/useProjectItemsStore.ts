import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ProjectItem } from '../components/layout/types'
import { projectItemsService } from '../services/project-items-service'

interface ProjectItemsState {
  items: ProjectItem[]
  isLoading: boolean
  error: Error | null
  displayPreferences: {
    size: boolean
    duration: boolean
    createdAt: boolean
    lastModified: boolean
    owner: boolean
  }
  sortPreference: string
  selectedTags: string[]
  currentFolderId: string | null
  
  // Actions
  fetchItems: (projectId: string, folderId: string | null) => Promise<void>
  addItem: (item: Omit<ProjectItem, 'id' | 'createdAt' | 'lastModified'>) => Promise<void>
  updateItem: (id: string, updates: Partial<ProjectItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  toggleStar: (id: string, currentValue: boolean) => Promise<void>
  moveItem: (itemId: string, targetFolderId: string | null) => Promise<void>
  setDisplayPreferences: (preferences: ProjectItemsState['displayPreferences']) => void
  setSortPreference: (sort: string) => void
  setSelectedTags: (tags: string[]) => void
  setCurrentFolder: (folderId: string | null) => void
  breadcrumbs: Array<{ id: string; name: string }> 
  updateBreadcrumbs: (items: ProjectItem[]) => void // Add this
}

export const useProjectItemsStore = create<ProjectItemsState>()(
  persist(
    (set) => ({
      items: [],
      breadcrumbs: [],
      isLoading: false,
      error: null,
      displayPreferences: {
        size: true,
        duration: true,
        createdAt: false,
        lastModified: true,
        owner: true,
      },
      sortPreference: 'lastModified',
      selectedTags: [],
      currentFolderId: null,

      fetchItems: async (projectId, folderId) => {
        set({ isLoading: true, error: null })
        console.log("Fetching items:", projectId, folderId)
        try {
          const items = await projectItemsService.getItems(projectId, folderId)
          set({ 
            items, 
            isLoading: false,
            currentFolderId: folderId ?? null // Ensure null for root
          })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      addItem: async (item) => {
        set({ isLoading: true, error: null })
        try {
          const newItem = await projectItemsService.createItem(item)
          set(state => ({
            items: [...state.items, newItem],
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      updateItem: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          const updated = await projectItemsService.updateItem(id, updates)
          set(state => ({
            items: state.items.map(item => item.id === id ? updated : item),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      deleteItem: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await projectItemsService.deleteItem(id)
          set(state => ({
            items: state.items.filter(item => item.id !== id),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      toggleStar: async (id, currentValue) => {
        try {
          const updated = await projectItemsService.toggleStar(id, currentValue)
          set(state => ({
            items: state.items.map(item => item.id === id ? updated : item)
          }))
        } catch (error) {
          set({ error: error as Error })
        }
      },

      moveItem: async (itemId, targetFolderId) => {
        try {
          const updated = await projectItemsService.moveItem(itemId, targetFolderId)
          set(state => ({
            items: state.items.map(item => item.id === itemId ? updated : item)
          }))
        } catch (error) {
          set({ error: error as Error })
        }
      },

      setDisplayPreferences: (preferences) => set({ displayPreferences: preferences }),
      setSortPreference: (sort) => set({ sortPreference: sort }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      setCurrentFolder: (folderId) => set(state => {
        // If moving to root, clear breadcrumbs
        if (folderId === null) {
          return { 
            currentFolderId: null, 
            breadcrumbs: [] 
          }
        }

        // Find the folder in current items
        const folder = state.items.find(item => item.id === folderId)
        if (!folder) return { currentFolderId: folderId }

        // Update breadcrumbs
        const newBreadcrumbs = [...state.breadcrumbs]
        const existingIndex = newBreadcrumbs.findIndex(b => b.id === folderId)
        
        if (existingIndex >= 0) {
          // If going back in breadcrumbs, remove everything after this point
          newBreadcrumbs.splice(existingIndex + 1)
        } else {
          // Add new folder to breadcrumbs
          newBreadcrumbs.push({ id: folder.id, name: folder.name })
        }

        return {
          currentFolderId: folderId,
          breadcrumbs: newBreadcrumbs
        }
      }),

      updateBreadcrumbs: (items) => set(state => {
        if (!state.currentFolderId) return { breadcrumbs: [] }

        // Reconstruct breadcrumbs based on current folder and its parents
        const breadcrumbs: Array<{ id: string; name: string }> = []
        let currentItem = items.find(item => item.id === state.currentFolderId)

        while (currentItem) {
          breadcrumbs.unshift({ id: currentItem.id, name: currentItem.name })
          currentItem = items.find(item => item.id === currentItem?.parentFolderId)
        }

        return { breadcrumbs }
      }),
    }),
    {
      name: 'project-items-storage',
      partialize: (state) => ({
        displayPreferences: state.displayPreferences,
        sortPreference: state.sortPreference,
        selectedTags: state.selectedTags,
      })
    }
  )
)
