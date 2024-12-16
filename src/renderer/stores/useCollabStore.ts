import { create } from 'zustand'
import { collabService, Collaborator } from '../services/collab-service'

interface CollabState {
  collaborators: Collaborator[]
  isLoading: boolean
  error: Error | null
  
  // Actions
  fetchCollaborators: (projectId: string) => Promise<void>
  addCollaborator: (projectId: string, username: string, inviterId: string) => Promise<void>
  removeCollaborator: (projectId: string, userId: string) => Promise<void>
  checkUsername: (username: string) => Promise<boolean>
}

export const useCollabStore = create<CollabState>((set) => ({
  collaborators: [],
  isLoading: false,
  error: null,

  fetchCollaborators: async (projectId: string) => {
    set({ isLoading: true, error: null })
    try {
      const collaborators = await collabService.getProjectCollaborators(projectId)
      set({ collaborators, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  addCollaborator: async (projectId: string, username: string, inviterId: string) => {
    set({ isLoading: true, error: null })
    try {
      const newCollaborator = await collabService.addCollaborator(projectId, username, inviterId)
      set(state => ({
        collaborators: [...state.collaborators, newCollaborator],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error // Re-throw to handle in the component
    }
  },

  removeCollaborator: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null })
    try {
      await collabService.removeCollaborator(projectId, userId)
      set(state => ({
        collaborators: state.collaborators.filter(c => c.id !== userId),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as Error, isLoading: false })
      throw error
    }
  },

  checkUsername: async (username: string) => {
    try {
      return await collabService.checkUsername(username)
    } catch (error) {
      return false
    }
  }
}))