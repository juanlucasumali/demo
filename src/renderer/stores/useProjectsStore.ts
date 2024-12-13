import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project } from '../components/layout/types'

interface ProjectsState {
  projects: Project[]
  displayPreferences: {
    tags: boolean
    dateCreated: boolean
    dateModified: boolean
  }
  sortPreference: string
  selectedTags: string[]
  setProjects: (projects: Project[]) => void
  setDisplayPreferences: (preferences: {
    tags: boolean
    dateCreated: boolean
    dateModified: boolean
  }) => void
  setSortPreference: (sort: string) => void
  setSelectedTags: (tags: string[]) => void
  toggleStar: (projectName: string) => void
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      displayPreferences: {
        tags: true,
        dateCreated: false,
        dateModified: false,
      },
      sortPreference: 'dateModified',
      selectedTags: [],
      
      setProjects: (projects: Project[]) => set({ projects }),
      toggleStar: (projectName: string) => 
        set((state) => ({
          projects: state.projects.map(project => 
            project.name === projectName
              ? { ...project, isStarred: !project.isStarred }
              : project
          )
        })),
      setDisplayPreferences: (preferences) => 
        set({ displayPreferences: preferences }),
      setSortPreference: (sort) => 
        set({ sortPreference: sort }),
      setSelectedTags: (tags) => 
        set({ selectedTags: tags }),
    }),
    {
      name: 'projects-storage',
    }
  )
)
