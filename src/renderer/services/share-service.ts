import { supabase } from '@renderer/lib/supabase'
import { DemoItem, ItemType } from '@renderer/types/items'
import { UserProfile } from '@renderer/types/users'
import { useUserStore } from '@renderer/stores/user-store'
import { createShareNotification } from './notifications-service'

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = useUserStore.getState().user
  if (!user) throw new Error('User not authenticated')
  return user.id
}

// Helper function to create share records
const createShareRecords = (itemId: string, itemType: 'file' | 'project', users: UserProfile[], currentUserId: string) => {
  return users.map(user => ({
    file_id: itemType === 'file' ? itemId : null,
    project_id: itemType === 'project' ? itemId : null,
    shared_with_id: user.id,
    shared_by_id: currentUserId,
  }))
}

// Helper function to insert share records
const insertShareRecords = async (records: any[], type: 'file' | 'project') => {
  const { error } = await supabase
    .from('shared_items')
    .upsert(records, {
      onConflict: type === 'file' ? 'file_id,shared_with_id' : 'project_id,shared_with_id',
      ignoreDuplicates: true
    })

  if (error) {
    console.error(`Error sharing ${type}s:`, error)
    throw error
  }
}

export async function shareItems(items: DemoItem[], users: UserProfile[]) {
  const currentUserId = getCurrentUserId()
  
  try {
    // Split items into files and projects
    const fileItems = items.filter(item => item.type === ItemType.FILE)
    const projectItems = items.filter(item => item.type === ItemType.PROJECT)

    // Create share records
    const fileShares = fileItems.flatMap(item => 
      createShareRecords(item.id, 'file', users, currentUserId)
    )

    const projectShares = projectItems.flatMap(item => 
      createShareRecords(item.id, 'project', users, currentUserId)
    )

    // Insert share records
    const promises: Promise<void>[] = []
    if (fileShares.length > 0) {
      promises.push(insertShareRecords(fileShares, 'file'))
    }
    if (projectShares.length > 0) {
      promises.push(insertShareRecords(projectShares, 'project'))
    }

    await Promise.all(promises)

    // Create notifications for each shared item and user
    const notificationPromises = items.flatMap(item =>
      users.map(user =>
        createShareNotification(
          currentUserId,
          user.id,
          item.id,
        )
      )
    )

    await Promise.all(notificationPromises)
  } catch (error) {
    console.error('Error in shareItems:', error)
    throw new Error('Failed to share items and create notifications')
  }
}

export async function shareNewItem(
  itemId: string, 
  itemType: 'file' | 'project', 
  users?: UserProfile[]
) {
  if (!users || users.length === 0) return

  const currentUserId = getCurrentUserId()
  
  try {
    // Create and insert share records
    const shareRecords = createShareRecords(itemId, itemType, users, currentUserId)
    await insertShareRecords(shareRecords, itemType)

    // Create notifications for each user
    const notificationPromises = users.map(user =>
      createShareNotification(
        currentUserId,
        user.id,
        itemId,
      )
    )

    await Promise.all(notificationPromises)
  } catch (error) {
    console.error('Error in shareNewItem:', error)
    throw new Error('Failed to share item and create notifications')
  }
} 