import { supabase } from '@renderer/lib/supabase'
import { addFileOrFolder } from './items-service'
import { useUserStore } from '@renderer/stores/user-store'
import { ItemType } from '@renderer/types/items'

export async function initializeSync(localPath: string): Promise<{ 
  syncId: number, 
  remoteFolderId: string 
}> {
  const profile = useUserStore.getState().profile

  if (!profile) {
    throw new Error('User not authenticated')
  }
  
  try {
    // 1. Create remote folder in Demo
    const remoteFolder = await addFileOrFolder({
      name: 'FL Studio Projects',
      type: ItemType.FOLDER,
      owner: profile,
      description: 'Synced FL Studio projects folder',
      isStarred: false,
      projectIds: [],
      collectionIds: [],
      parentFolderIds: [], // Root level in Home
      tags: null,
      format: null,
      size: null,
      duration: null,
      icon: null,
      filePath: null,
      sharedWith: [],
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
    })

    console.log('profile', profile)
    console.log('localPath', localPath)
    console.log('remoteFolder', remoteFolder)

    // 2. Store sync configuration
    const { data: syncConfig, error } = await supabase
      .from('sync_configurations')
      .insert({
        user_id: profile.id,
        local_path: localPath,
        remote_folder_id: remoteFolder.id,
      })
      .select()
      .single()

    if (error) throw error

    return {
      syncId: syncConfig.id,
      remoteFolderId: remoteFolder.id
    }
  } catch (error) {
    console.error('Failed to initialize sync:', error)
    throw error
  }
} 