import { supabase } from '@renderer/lib/supabase'
import { DemoItem, ItemType } from '@renderer/types/items'
import { UserProfile } from '@renderer/types/users'
import { useUserStore } from '@renderer/stores/user-store'
import { createShareNotification } from './notifications-service'
import { deleteShareNotifications } from './notifications-service'

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = useUserStore.getState().user
  if (!user) throw new Error('User not authenticated')
  return user.id
}

// Helper function to create share records
const createShareRecords = (itemId: string, itemType: 'file' | 'folder' | 'project', users: UserProfile[], currentUserId: string) => {
  return users.map(user => ({
    file_id: itemType === 'file' || itemType === 'folder' ? itemId : null,
    project_id: itemType === 'project' ? itemId : null,
    shared_with_id: user.id,
    shared_by_id: currentUserId,
  }))
}

// Helper function to insert share records
const insertShareRecords = async (records: any[], type: 'file' | 'folder' | 'project') => {
  const { error } = await supabase
    .from('shared_items')
    .upsert(records, {
      onConflict: type !== 'project' ? 'file_id,shared_with_id' : 'project_id,shared_with_id',
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
    const folderItems = items.filter(item => item.type === ItemType.FOLDER)
    const projectItems = items.filter(item => item.type === ItemType.PROJECT)

    // Create share records
    const fileShares = fileItems.flatMap(item => 
      createShareRecords(item.id, 'file', users, currentUserId)
    )
    const folderShares = folderItems.flatMap(item => 
      createShareRecords(item.id, 'folder', users, currentUserId)
    )

    const projectShares = projectItems.flatMap(item => 
      createShareRecords(item.id, 'project', users, currentUserId)
    )

    // Insert share records
    const promises: Promise<void>[] = []
    if (fileShares.length > 0) {
      promises.push(insertShareRecords(fileShares, 'file'))
    }
    if (folderShares.length > 0) {
      promises.push(insertShareRecords(folderShares, 'folder'))
    }
    if (projectShares.length > 0) {
      promises.push(insertShareRecords(projectShares, 'project'))
    }

    await Promise.all(promises)

    // Filter out notifications where sender and receiver are the same
    const notificationPromises = items.flatMap(item =>
      users
        .filter(user => user.id !== currentUserId) // Filter out self-notifications
        .map(user =>
          createShareNotification(
            currentUserId,
            user.id,
            item.id,
            item.type === ItemType.PROJECT ? 'project' : 'file'
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
  itemType: 'file' | 'folder' | 'project', 
  users?: UserProfile[]
) {
  if (!users || users.length === 0) return

  const currentUserId = getCurrentUserId()
  
  try {
    // Create and insert share records
    const shareRecords = createShareRecords(itemId, itemType, users, currentUserId)
    await insertShareRecords(shareRecords, itemType)

    // Filter out notifications where sender and receiver are the same
    const notificationPromises = users
      .filter(user => user.id !== currentUserId) // Filter out self-notifications
      .map(user =>
        createShareNotification(
          currentUserId,
          user.id,
          itemId,
          itemType
        )
      )

    await Promise.all(notificationPromises)
  } catch (error) {
    console.error('Error in shareNewItem:', error)
    throw new Error('Failed to share item and create notifications')
  }
}

export async function unshareItems(items: DemoItem[], users: UserProfile[]) {
  const userIds = users.map(user => user.id);
  
  try {
    // Split items into files and projects
    const fileItems = items.filter(item => item.type === ItemType.FILE);
    const projectItems = items.filter(item => item.type === ItemType.PROJECT);
    
    const promises: Promise<any>[] = [];

    // Delete file shares and notifications
    if (fileItems.length > 0) {
      const { error: fileError } = await supabase
        .from('shared_items')
        .delete()
        .in('file_id', fileItems.map(item => item.id))
        .in('shared_with_id', userIds);

      if (fileError) throw fileError;

      // Delete associated notifications
      await Promise.all(fileItems.map(item => 
        deleteShareNotifications(item.id, userIds, 'file')
      ));
    }

    // Delete project shares and notifications
    if (projectItems.length > 0) {
      const { error: projectError } = await supabase
        .from('shared_items')
        .delete()
        .in('project_id', projectItems.map(item => item.id))
        .in('shared_with_id', userIds);

      if (projectError) throw projectError;

      // Delete associated notifications
      await Promise.all(projectItems.map(item => 
        deleteShareNotifications(item.id, userIds, 'project')
      ));
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('Error in unshareItems:', error);
    throw new Error('Failed to unshare items');
  }
} 