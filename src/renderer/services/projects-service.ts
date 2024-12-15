import { Project, TagCategory } from '../components/layout/types'
import { supabase } from '../lib/supabase'

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('last_modified', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      throw error
    }

    return data.map(project => ({
      ...project,
      tags: project.tags as { name: string; color: string; category: TagCategory }[] || []
    }))
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'last_modified'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw error
    }

    return {
      ...data,
      tags: project.tags as { name: string; color: string; category: TagCategory }[] || []
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
      tags: data.tags as { name: string; color: string; category: TagCategory }[] || []
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
    return this.updateProject(id, { is_starred: !currentValue })
  }
}
