import { supabase } from '@renderer/lib/supabase'
import { useUserStore } from '@renderer/stores/user-store'
import { FileFormat, ItemType } from '@renderer/types/items'
import { addFileOrFolder, getFilesWithSharing, getItemsToDeleteRecursively } from './items-service'
import { LocalItem, LocalItemWithFullPath, UploadProgress, SyncConfiguration, SyncType } from '@renderer/types/sync'
import { b2Service } from '@renderer/services/b2-service'

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
      localPath: null,
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
            localPath: item.path,
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
            filePath: null,
            localPath: item.path,
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
    console.log('🗑️ Cleaning up remote folder:', { folderId, itemsCount: itemsToDelete.length })
    
    // Delete files from B2 first
    for (const itemId of itemsToDelete) {
      const { data } = await supabase
        .from('files')
        .select('file_path, local_path, name')
        .eq('id', itemId)
        .single()
      
      console.log('📄 Processing item for deletion:', {
        itemId,
        name: data?.name,
        filePath: data?.file_path,
        localPath: data?.local_path
      })

      if (data?.file_path) {
        try {
          await b2Service.removeFile(data.file_path, data.name)
          console.log('✅ Successfully removed file from B2:', data.name)
        } catch (error) {
          console.error('❌ Failed to remove file from B2:', {
            filePath: data.file_path,
            localPath: data.local_path,
            error
          })
          throw error
        }
      }
    }

    // Then delete database records for contents
    for (const itemId of itemsToDelete.reverse()) {
      try {
        await supabase
          .from('files')
          .delete()
          .eq('id', itemId)
        console.log('✅ Successfully deleted database record:', itemId)
      } catch (error) {
        console.error('❌ Failed to delete database record:', { itemId, error })
        throw error
      }
    }

    // Finally delete the folder itself
    try {
      await supabase
        .from('files')
        .delete()
        .eq('id', folderId)
      console.log('✅ Successfully deleted folder:', folderId)
    } catch (error) {
      console.error('❌ Failed to delete folder:', { folderId, error })
      throw error
    }
  } catch (error) {
    console.error('❌ Failed to cleanup remote folder:', { folderId, error })
    throw error
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
    filePath: null,
    localPath: localPath,
    createdAt: new Date(),
    lastModified: new Date(),
    lastOpened: new Date(),
    sharedWith: [],
  })

  return folder.id
} 

interface DiffResult {
  added: LocalItem[]
  modified: LocalItem[]
  removed: string[]  // paths of removed files
}

export async function compareLocalWithRemote(
  localPath: string, 
  remoteFolderId: string
): Promise<DiffResult> {
  // Get local items
  const localItems = await scanLocalDirectory(localPath)
  
  // Get remote items
  const remoteItems = await getFilesWithSharing(useUserStore.getState().profile!.id, {
    parentFolderId: remoteFolderId,
    includeNested: true
  })

  console.log('🔍 Comparing local and remote items:', {
    localItems: localItems.map(i => ({ path: i.path, type: i.type })),
    remoteItems: remoteItems.map(i => ({ localPath: i.localPath, type: i.type }))
  })

  // Create maps for easier comparison
  const localMap = new Map(localItems.map(item => [item.path, item]))
  const remoteMap = new Map(remoteItems.map(item => [item.localPath || '', item]))

  const added: LocalItem[] = []
  const modified: LocalItem[] = []
  const removed: string[] = []

  // Find added and modified files
  localMap.forEach((localItem, path) => {
    const remoteItem = remoteMap.get(path)
    if (!remoteItem) {
      console.log('➕ New item found:', path) 
      added.push(localItem)
    } else if (
      localItem.type === 'file' && 
      localItem.lastModified && 
      remoteItem.lastModified && 
      new Date(localItem.lastModified).getTime() > new Date(remoteItem.lastModified).getTime()
    ) {
      console.log('📝 Modified item found:', path)
      modified.push(localItem)
    }
  })

  // Find removed files
  remoteMap.forEach((remoteItem, path) => {
    if (path && !localMap.has(path)) {
      console.log('❌ Removed item found:', path)
      removed.push(path)
    }
  })

  return { added, modified, removed }
} 

export async function updateExistingSync(
  items: LocalItemWithFullPath[],
  remoteFolderId: string,
  diff: DiffResult,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  console.log('🔄 Starting sync update with:', {
    itemsCount: items.length,
    remoteFolderId,
    diff: {
      added: diff.added.length,
      modified: diff.modified.length,
      removed: diff.removed.length
    }
  })

  const profile = useUserStore.getState().profile
  if (!profile) throw new Error('User not authenticated')

  try {
    // Handle deletions first
    console.log('🗑️ Processing deletions:', diff.removed)
    for (const removedPath of diff.removed) {
      console.log(`📄 Processing removal for: ${removedPath}`)
      const { data } = await supabase
        .from('files')
        .select('id, file_path')
        .eq('local_path', removedPath)
        .single()
      
      if (data) {
        if (data.file_path) {
          console.log(`🗑️ Removing from B2: ${data.file_path}`)
          await b2Service.removeFile(data.file_path, removedPath)
        }
        console.log(`🗑️ Cleaning up folder: ${data.id}`)
        await cleanupRemoteFolder(data.id)
      }
    }

    const totalChanges = diff.added.length + diff.modified.length + diff.removed.length
    let processedChanges = 0
    const folderIdMap = new Map<string, string>()
    folderIdMap.set('', remoteFolderId)

    // 2. Handle additions and modifications
    const itemsToProcess = items.filter(item => 
      diff.added.some(a => a.path === item.path) || 
      diff.modified.some(m => m.path === item.path)
    )

    const sortedItems = [...itemsToProcess].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.path.split('/').length - b.path.split('/').length
    })

    for (const item of sortedItems) {
      const parentPath = item.path.split('/').slice(0, -1).join('/')
      const parentId = folderIdMap.get(parentPath || '') || remoteFolderId

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
          filePath: null,
          localPath: item.path,
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

        // Upload to B2 first
        const b2FileId = await b2Service.storeFile(
          profile.id,
          crypto.randomUUID(),
          item.name,
          fileContent
        )

        // Then create database record
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
          filePath: b2FileId,
          localPath: item.path,
          sharedWith: [],
          createdAt: new Date(),
          lastModified: item.lastModified || new Date(),
          lastOpened: new Date(),
        }, [], fileContent)
      }

      processedChanges++
      onProgress?.({
        uploadedFiles: processedChanges,
        totalFiles: totalChanges,
        currentFile: item.name
      })
    }
  } catch (error) {
    console.error('Failed to update sync:', error)
    throw error
  }
} 