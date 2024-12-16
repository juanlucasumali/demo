import { UserProfile } from '../components/layout/types'
import { supabase } from '../lib/supabase'
import { mediaService } from './b2Service'

export interface Collaborator extends UserProfile {
  id: string
  createdAt: string
}

export const collabService = {
  /**
   * Transform database user to Collaborator type with avatar URL
   */
   async transformUser(data: any): Promise<Collaborator> {
    return {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      email: data.email,
      avatar: data.avatar_path ? await mediaService.getAvatarUrl(data.avatar_path) : null,
      localPath: data.local_path,
      createdAt: data.created_at
    }
  },

  /**
   * Get all collaborators for a project
   */
  async getProjectCollaborators(projectId: string): Promise<Collaborator[]> {
    const { data, error } = await supabase
      .from('collabs')
      .select(`
        id,
        created_at,
        invitee_id,
        inviter_id,
        users:invitee_id (
          id,
          username,
          display_name,
          email,
          avatar_path,
          local_path
        ),
        inviters:inviter_id (
          id,
          username,
          display_name,
          email,
          avatar_path,
          local_path
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    // First, get unique inviters
    const inviters = [...new Map(
      data.map(collab => [
        collab.inviters.id,
        {
          ...collab.inviters,
          created_at: collab.created_at
        }
      ])
    ).values()]

    // Then, get unique invitees
    const invitees = [...new Map(
      data.map(collab => [
        collab.users.id,
        {
          ...collab.users,
          created_at: collab.created_at
        }
      ])
    ).values()]

    // Combine inviters and invitees, maintaining order
    const allUsers = [...inviters, ...invitees]

    return Promise.all(allUsers.map(user => this.transformUser(user)))
  },

  /**
   * Add a collaborator to a project
   */
  async addCollaborator(projectId: string, username: string, inviterId: string): Promise<Collaborator> {
    // First, get the user ID from the username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    // Then create the collaboration
    const { data, error } = await supabase
      .from('collabs')
      .insert({
        project_id: projectId,
        inviter_id: inviterId,
        invitee_id: userData.id
      })
      .select(`
        id,
        created_at,
        users:invitee_id (
          id,
          username,
          display_name,
          email,
          avatar_path,
          local_path
        )
      `)
      .single()

    if (error) throw new Error(error.message)

    // Transform user with avatar URL
    return this.transformUser({
      ...data.users,
      created_at: data.created_at
    })
  },

  /**
   * Remove a collaborator from a project
   */
  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('collabs')
      .delete()
      .eq('project_id', projectId)
      .eq('invitee_id', userId)

    if (error) throw new Error(error.message)
  },

  /**
   * Check if a username exists
   */
  async checkUsername(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (error) return false
    return !!data
  }
}
