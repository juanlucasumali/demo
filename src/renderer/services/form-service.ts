import { supabase } from '@renderer/lib/supabase'
import { useUserStore } from '@renderer/stores/user-store'

export interface TeamsContactFormData {
  name: string
  email: string
  company: string
  teamSize: string
  message: string
}

export const formService = {
  async submitTeamsContactForm(data: TeamsContactFormData) {
    // Get the current user
    const user = useUserStore.getState().profile
    
    if (!user) {
      throw new Error('User not found')
    }

    const { error } = await supabase
      .from('teams_contact_requests')
      .insert([
        {
          name: data.name,
          email: data.email,
          company: data.company,
          team_size: data.teamSize,
          message: data.message,
          status: 'pending',
          created_at: new Date().toISOString(),
          user_id: user.id
        }
      ])

    if (error) {
      throw new Error(error.message)
    }
  }
} 