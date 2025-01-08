import { supabase } from '@renderer/lib/supabase'
import { useUserStore } from '@renderer/stores/user-store'
import { FileFormat, ItemType } from '@renderer/types/items'
import { addFileOrFolder, getItemsToDeleteRecursively } from './items-service'
import { LocalItem, LocalItemWithFullPath, UploadProgress, SyncConfiguration, SyncType } from '@renderer/types/sync'

// Configuration Management Functions
export async function createSyncConfiguration(
  localPath: string,
  remoteFolderId: string,
  type: SyncType
): Promise<SyncConfiguration> {
  const profile = useUserStore.getState().profile

  if (!profile) {
    throw new Error('Profile not found')
  }

  const { data, error } = await supabase
    .from('sync_configurations')
    .insert({
      user_id: profile.id,
      local_path: localPath,
      remote_folder_id: remoteFolderId,
      type: type,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create sync configuration:', error)
    throw error
  }

  return {
    id: data.id,
    userId: data.user_id,
    localPath: data.local_path,
    remoteFolderId: data.remote_folder_id,
    lastSyncedAt: data.last_synced_at,
    type: type,
  }
}

export async function getSyncConfiguration(userId: string): Promise<SyncConfiguration | null> {
  const { data, error } = await supabase
    .from('sync_configurations')
    .select()
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null
    }
    throw error
  }

  return {
    id: data.id,
    userId: data.user_id,
    localPath: data.local_path,
    remoteFolderId: data.remote_folder_id,
    lastSyncedAt: data.last_synced_at,
    type: data.type,
  }
}

export async function updateLastSyncedAt(configId: number): Promise<void> {
  const { error } = await supabase
    .from('sync_configurations')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', configId)

  if (error) {
    console.error('Failed to update last_synced_at:', error)
    throw error
  }
}

// Scan Directory Function
export async function scanLocalDirectory(directoryPath: string): Promise<LocalItem[]> {
  try {
    const items = await window.api.scanDirectory(directoryPath)
    return items
  } catch (error) {
    console.error('Failed to scan directory:', error)
    throw error
  }
}

export async function initializeSync(localPath: string, type: SyncType): Promise<{ 
  syncId: number, 
  remoteFolderId: string,
  type: SyncType
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

    // 2. Create sync configuration
    const syncConfig = await createSyncConfiguration(localPath, remoteFolder.id, type)

    return {
      syncId: syncConfig.id,
      remoteFolderId: remoteFolder.id,
      type: type
    }
  } catch (error) {
    console.error('Sync initialization failed:', error)
    throw error
  }
}

export async function beginUpload(
  items: LocalItemWithFullPath[], 
  remoteFolderId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  const profile = useUserStore.getState().profile
  if (!profile) throw new Error('User not authenticated')

  const totalFiles = items.filter(item => item.type === 'file').length
  let uploadedFiles = 0
  const folderIdMap = new Map<string, string>()
  folderIdMap.set('', remoteFolderId)

  try {
    const sortedItems = [...items].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.path.split('/').length - b.path.split('/').length
    })

    for (const item of sortedItems) {
      
      const parentPath = item.path.split('/').slice(0, -1).join('/')
      const parentId = folderIdMap.get(parentPath || '')

      if (!parentId) {
        throw new Error(`Parent folder ID not found for path: ${item.path}`)
      }

      try {
        if (item.type === 'folder') {
          const folder = await addFileOrFolder({
            name: item.name,
            type: ItemType.FOLDER,
            owner: profile,
            description: null,
            isStarred: false,
            projectIds: [],
            collectionIds: [],
            parentFolderIds: [parentId],
            tags: null,
            format: null,
            size: null,
            duration: null,
            icon: null,
            filePath: item.path,
            createdAt: new Date(),
            lastModified: item.lastModified || new Date(),
            lastOpened: new Date(),
            sharedWith: [],
          })
          folderIdMap.set(item.path, folder.id)
        } else {
          const fileContent = await window.api.readFile(item.fullPath)
          const format = item.name.includes('.') 
            ? item.name.split('.').pop()?.toLowerCase() as FileFormat 
            : null
          
          await addFileOrFolder({
            name: item.name,
            type: ItemType.FILE,
            owner: profile,
            description: null,
            isStarred: false,
            projectIds: [],
            collectionIds: [],
            parentFolderIds: [parentId],
            tags: null,
            format,
            size: item.size || null,
            duration: null,
            icon: null,
            filePath: item.path,
            sharedWith: [],
            createdAt: new Date(),
            lastModified: item.lastModified || new Date(),
            lastOpened: new Date(),
          }, [], fileContent)

          uploadedFiles++

          onProgress?.({
            uploadedFiles,
            totalFiles,
            currentFile: item.name
          })
        }
      } catch (error: any) {
        console.error('❌ Failed to process item:', {
          path: item.path,
          error,
          stack: error.stack
        })
        throw new Error(`Failed to process ${item.type}: ${item.path}`)
      }
    }
  } catch (error: any) {
    console.error('❌ Upload process failed:', {
      error,
      stack: error.stack
    })
    await cleanupRemoteFolder(remoteFolderId)
    throw error
  }
}

async function cleanupRemoteFolder(folderId: string): Promise<void> {
  try {
    const itemsToDelete = await getItemsToDeleteRecursively(folderId)
    
    for (const itemId of itemsToDelete.reverse()) {
      await supabase
        .from('files')
        .delete()
        .eq('id', itemId)
    }

    await supabase
      .from('files')
      .delete()
      .eq('id', folderId)
  } catch (error) {
    console.error('Failed to cleanup remote folder:', error)
  }
}

export async function createRemoteFolder(localPath: string): Promise<string> {
  const profile = useUserStore.getState().profile
  if (!profile) throw new Error('User not authenticated')

  const folderName = localPath.split('/').pop() || 'Synced Folder'
  
  const folder = await addFileOrFolder({
    name: folderName,
    type: ItemType.FOLDER,
    owner: profile,
    description: null,
    isStarred: false,
    projectIds: [],
    collectionIds: [],
    parentFolderIds: [],
    tags: null,
    format: null,
    size: null,
    duration: null,
    icon: null,
    filePath: localPath,
    createdAt: new Date(),
    lastModified: new Date(),
    lastOpened: new Date(),
    sharedWith: [],
  })

  return folder.id
} 