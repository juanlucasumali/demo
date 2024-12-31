import { supabase } from '@renderer/lib/supabase'
import { DemoItem, ItemType } from '@renderer/types/items'
import { UserProfile } from '@renderer/types/users'
import { useUserStore } from '@renderer/stores/user-store'

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = useUserStore.getState().user
  if (!user) throw new Error('User not authenticated')
  return user.id
}

export async function shareItems(items: DemoItem[], users: UserProfile[]) {
  const currentUserId = getCurrentUserId()
  
  // Split items into files and projects
  const fileShares = items
    .filter(item => item.type === ItemType.FILE)
    .flatMap(item => 
      users.map(user => ({
        file_id: item.id,
        project_id: null,
        shared_with_id: user.id,
        shared_by_id: currentUserId,
      }))
    )

  const projectShares = items
    .filter(item => item.type === ItemType.PROJECT)
    .flatMap(item => 
      users.map(user => ({
        file_id: null,
        project_id: item.id,
        shared_with_id: user.id,
        shared_by_id: currentUserId,
      }))
    )

  // Insert file shares
  if (fileShares.length > 0) {
    const { error: fileError } = await supabase
      .from('shared_items')
      .upsert(fileShares, {
        onConflict: 'file_id,shared_with_id',
        ignoreDuplicates: true
      })

    if (fileError) {
      console.error('Error sharing files:', fileError)
      throw fileError
    }
  }

  // Insert project shares
  if (projectShares.length > 0) {
    const { error: projectError } = await supabase
      .from('shared_items')
      .upsert(projectShares, {
        onConflict: 'project_id,shared_with_id',
        ignoreDuplicates: true
      })

    if (projectError) {
      console.error('Error sharing projects:', projectError)
      throw projectError
    }
  }
} 