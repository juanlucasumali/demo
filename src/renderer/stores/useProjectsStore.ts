import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project } from '../components/layout/types'
import { projectsService } from '../services/projects-service'

interface ProjectsState {
  projects: Project[]
  isLoading: boolean
  error: Error | null
  displayPreferences: {
    tags: boolean
    createdAt: boolean
    lastModified: boolean
  }
  sortPreference: string
  selectedTags: string[]
  
  // Actions
  fetchProjects: () => Promise<void>
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'last_modified'>) => Promise<void>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  toggleStar: (id: string, currentValue: boolean) => Promise<void>
  setDisplayPreferences: (preferences: ProjectsState['displayPreferences']) => void
  setSortPreference: (sort: string) => void
  setSelectedTags: (tags: string[]) => void
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      isLoading: false,
      error: null,
      displayPreferences: {
        tags: true,
        createdAt: false,
        lastModified: false,
      },
      sortPreference: 'lastModified',
      selectedTags: [],

      fetchProjects: async () => {
        set({ isLoading: true, error: null })
        try {
          const projects = await projectsService.getProjects()
          set({ projects, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      addProject: async (project) => {
        set({ isLoading: true, error: null })
        try {
          const newProject = await projectsService.createProject(project)
          set(state => ({
            projects: [...state.projects, newProject],
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      updateProject: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          const updated = await projectsService.updateProject(id, updates)
          set(state => ({
            projects: state.projects.map(p => p.id === id ? updated : p),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      deleteProject: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await projectsService.deleteProject(id)
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            isLoading: false
          }))
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      toggleStar: async (id, currentValue) => {
        try {
          const updated = await projectsService.toggleStar(id, currentValue)
          set(state => ({
            projects: state.projects.map(p => p.id === id ? updated : p)
          }))
        } catch (error) {
          set({ error: error as Error })
        }
      },

      setDisplayPreferences: (preferences) => set({ displayPreferences: preferences }),
      setSortPreference: (sort) => set({ sortPreference: sort }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
    }),
    {
      name: 'projects-storage',
      partialize: (state) => ({
        displayPreferences: state.displayPreferences,
        sortPreference: state.sortPreference,
        selectedTags: state.selectedTags,
      })
    }
  )
)
