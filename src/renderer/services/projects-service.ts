import { Project, TagCategory } from '../components/layout/types'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { collabService } from './collab-service'

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    const userId = useAuthStore.getState().user?.id
    if (!userId) throw new Error('User not authenticated')

    // Get owned projects
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('last_modified', { ascending: false })

    if (ownedError) {
      console.error('Error fetching owned projects:', ownedError)
      throw ownedError
    }

    // Get shared projects
    const { data: sharedData, error: sharedError } = await supabase
      .from('collabs')
      .select('project_id')
      .eq('invitee_id', userId)

    if (sharedError) {
      console.error('Error fetching shared projects:', sharedError)
      throw sharedError
    }

    console.log("sharedData:", sharedData)

    const sharedProjectIds = sharedData.map(collab => collab.project_id)

    const { data: sharedProjects, error: sharedProjectsError } = await supabase
      .from('projects')
      .select('*')
      .in('id', sharedProjectIds)
      .order('last_modified', { ascending: false })

    console.log("sharedProjects:", sharedProjects)
    console.log("sharedProjectsError:", sharedProjectsError)


    if (sharedProjectsError) {
      console.error('Error fetching shared projects:', sharedProjectsError)
      throw sharedProjectsError
    }

    const allProjects = [...ownedProjects, ...sharedProjects]

    // Get collaborators for each project and transform the data

    const projectsWithCollaborators = await Promise.all(
      allProjects.map(async project => {
        const collaborators = await collabService.getProjectCollaborators(project.id)
        return {
          ...project,
          tags: project.tags as { name: string; color: string; category: TagCategory }[] || [],
          createdAt: project.created_at,
          isStarred: project.is_starred,
          lastModified: project.last_modified,
          ownerId: project.owner_id,
          collaborators
        }
      })
    )

    console.log("projectsWithCollaborators:", projectsWithCollaborators)

    // Sort by last_modified
    return projectsWithCollaborators.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  },


  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'lastModified'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        owner_id: project.ownerId,
        name: project.name,
        icon: null,
        description: project.description,
        is_starred: project.isStarred,
        tags: project.tags,
        last_modified: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw error
    }

    return {
      ...data,
      tags: project.tags as { name: string; color: string; category: TagCategory }[] || [],
      createdAt: data.created_at,
      isStarred: data.is_starred,
      lastModified: data.last_modified,
      ownerId: data.owner_id
    }
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        last_modified: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw error
    }

    return {
      ...data,
      tags: data.tags as { name: string; color: string; category: TagCategory }[] || [],
      createdAt: data.created_at,
      isStarred: data.is_starred,
      lastModified: data.last_modified,
      ownerId: data.owner_id
    }
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },

  async toggleStar(id: string, currentValue: boolean): Promise<Project> {
    return this.updateProject(id, { isStarred: !currentValue })
  }
}
