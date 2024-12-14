import { Project } from '../components/layout/types'
import { projects } from '../components/layout/data/projects-data'

export const projectsService = {
  getProjects: async (): Promise<Project[]> => {
    // This will be replaced with actual API call later
    return Promise.resolve(projects) // Your dummy data
  },
  
  createProject: async (project: Project): Promise<Project> => {
    // Implementation for creating a project
    return Promise.resolve(project)
  },
  
  updateProject: async (project: Project): Promise<Project> => {
    // Implementation for updating a project
    return Promise.resolve(project)
  },
  
  deleteProject: async (projectId: string): Promise<void> => {
    // Implementation for deleting a project
    return Promise.resolve()
  },
}
