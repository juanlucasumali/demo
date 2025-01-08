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
            localPath: item.fullPath,
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
            localPath: item.fullPath,
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
        .select('file_path, local_path, name, type')
        .eq('id', itemId)
        .single()
      
      console.log('📄 Processing item for deletion:', {
        itemId,
        name: data?.name,
        filePath: data?.file_path,
        localPath: data?.local_path,
        type: data?.type
      })

      if (data?.file_path && data.type === ItemType.FILE) {
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
  const localMap = new Map(localItems.map(item => [
    `${localPath}/${item.path}`, // Use full path for comparison
    item
  ]))
  const remoteMap = new Map(remoteItems.map(item => [item.localPath || '', item]))

  const added: LocalItem[] = []
  const modified: LocalItem[] = []
  const removed: string[] = []

  // Find added and modified files
  localMap.forEach((localItem, fullPath) => {
    const remoteItem = remoteMap.get(fullPath)
    if (!remoteItem) {
      console.log('➕ New item found:', fullPath)
      added.push(localItem)
    } else if (
      localItem.type === 'file' && 
      localItem.lastModified && 
      remoteItem.lastModified && 
      new Date(localItem.lastModified).getTime() > new Date(remoteItem.lastModified).getTime()
    ) {
      console.log('📝 Modified item found:', fullPath)
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

// Add new interface for folder mapping
interface FolderMapping {
  localPath: string;
  remoteFolderId: string;
  parentPath: string | null;
}

// New helper function to build folder mapping
async function buildFolderMapping(
  items: LocalItemWithFullPath[],
  basePath: string,
  rootFolderId: string
): Promise<Map<string, string>> {
  const folderMap = new Map<string, string>();
  folderMap.set(basePath, rootFolderId);

  // First, get all existing remote folders
  const remoteItems = await getFilesWithSharing(useUserStore.getState().profile!.id, {
    parentFolderId: rootFolderId,
    includeNested: true
  });

  // Map existing remote folders
  const remoteFolders = remoteItems.filter(item => item.type === ItemType.FOLDER);
  for (const folder of remoteFolders) {
    if (folder.localPath) {
      folderMap.set(folder.localPath, folder.id);
      console.log('📂 Mapped existing remote folder:', {
        localPath: folder.localPath,
        remoteFolderId: folder.id
      });
    }
  }

  // Then process any new folders
  const folders = items
    .filter(item => item.type === 'folder')
    .sort((a, b) => a.path.split('/').length - b.path.split('/').length);

  for (const folder of folders) {
    const fullPath = `${basePath}/${folder.path}`;
    
    // Skip if folder already exists in remote
    if (folderMap.has(fullPath)) {
      console.log('📂 Folder already exists in remote:', fullPath);
      continue;
    }

    // Get parent folder path by removing the last segment from the full path
    const parentPath = fullPath.split('/').slice(0, -1).join('/');
    const parentId = parentPath === basePath ? rootFolderId : folderMap.get(parentPath);

    console.log('📂 Processing folder:', {
      fullPath,
      parentPath,
      parentId
    });

    if (!parentId) {
      console.error('Parent folder not found:', {
        folderPath: folder.path,
        parentPath,
        availablePaths: Array.from(folderMap.keys())
      });
      throw new Error(`Parent folder not found for: ${folder.path}`);
    }

    // Create new folder
    const remoteFolder = await addFileOrFolder({
      name: folder.name,
      type: ItemType.FOLDER,
      owner: useUserStore.getState().profile!,
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
      localPath: fullPath,
      createdAt: new Date(),
      lastModified: folder.lastModified || new Date(),
      lastOpened: new Date(),
      sharedWith: [],
    });

    folderMap.set(fullPath, remoteFolder.id);
    console.log('📂 Created and mapped new folder:', {
      fullPath,
      parentPath,
      remoteFolderId: remoteFolder.id
    });
  }

  return folderMap;
}

// Update the updateExistingSync function
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
  });

  const profile = useUserStore.getState().profile;
  if (!profile) throw new Error('User not authenticated');

  try {
    // Handle deletions first
    console.log('🗑️ Processing deletions:', diff.removed)
    for (const removedPath of diff.removed) {
      console.log(`📄 Processing removal for: ${removedPath}`)
      const { data } = await supabase
        .from('files')
        .select('id, file_path, type')
        .eq('local_path', removedPath)
        .single()
      
      if (data) {
        if (data.file_path && data.type === ItemType.FILE) {
          console.log(`🗑️ Removing from B2: ${data.file_path}`)
          await b2Service.removeFile(data.file_path, removedPath)
        }
        console.log(`🗑️ Cleaning up folder: ${data.id}`)
        await cleanupRemoteFolder(data.id)
      }
    }

    const totalChanges = diff.added.length + diff.modified.length + diff.removed.length;
    let processedChanges = 0;

    // Build complete folder mapping first
    console.log("items:", items)
    const getBasePath = (item: LocalItemWithFullPath) => {
      const relativePath = item.path;
      const fullPath = item.fullPath;
      // Remove the relative path from the full path to get the base
      return fullPath.slice(0, fullPath.length - relativePath.length - 1); // -1 for the trailing slash
    };

    const basePath = items[0] ? getBasePath(items[0]) : '';
    console.log("basePath:", basePath)
    const folderMap = await buildFolderMapping(items, basePath, remoteFolderId);

    // Process files with correct folder hierarchy
    const files = items.filter(item => 
      item.type === 'file' && (
        diff.added.some(a => a.path === item.path) || 
        diff.modified.some(m => m.path === item.path)
      )
    );

    // In updateExistingSync
    for (const file of files) {
        const parentPath = file.path.split('/').slice(0, -1).join('/');
        const fullParentPath = `${basePath}/${parentPath}`;
        const parentId = folderMap.get(fullParentPath) || remoteFolderId;
    
        console.log("file:", file)
        console.log("parentPath:", parentPath)
        console.log("basePath:", basePath)
        console.log("fullParentPath:", fullParentPath)
        console.log("parentId:", parentId)

      console.log('📄 Processing file:', {
        name: file.name,
        parentPath: fullParentPath,
        parentId
      });

      const fileContent = await window.api.readFile(file.fullPath);
      const format = file.name.includes('.') 
        ? file.name.split('.').pop()?.toLowerCase() as FileFormat 
        : null;

      // Upload to B2 first
      const b2FileId = await b2Service.storeFile(
        profile.id,
        crypto.randomUUID(),
        file.name,
        fileContent
      );

      // Create database record with correct parent folder
      await addFileOrFolder({
        name: file.name,
        type: ItemType.FILE,
        owner: profile,
        description: null,
        isStarred: false,
        projectIds: [],
        collectionIds: [],
        parentFolderIds: [parentId], // Use correct parent folder ID
        tags: null,
        format,
        size: file.size || null,
        duration: null,
        icon: null,
        filePath: b2FileId,
        localPath: file.fullPath,
        sharedWith: [],
        createdAt: new Date(),
        lastModified: file.lastModified || new Date(),
        lastOpened: new Date(),
      }, [], fileContent);

      processedChanges++;
      onProgress?.({
        uploadedFiles: processedChanges,
        totalFiles: totalChanges,
        currentFile: file.name
      });
    }
  } catch (error) {
    console.error('Failed to update sync:', error);
    throw error;
  }
}

export async function updateLocalFromRemote(
  localPath: string,
  remoteFolderId: string,
  diff: DiffResult
): Promise<void> {
  const profile = useUserStore.getState().profile
  if (!profile) throw new Error('User not authenticated')

  try {
    // 1. Handle local files/folders that don't exist in remote (delete them)
    console.log('🗑️ Processing local deletions:', diff.added)
    for (const localItem of diff.added) {
      const fullPath = `${localPath}/${localItem.path}`
      console.log(`🗑️ Deleting local item: ${fullPath}`)
      
      try {
        if (localItem.type === 'folder') {
          await window.api.deleteDirectory(fullPath)
        } else {
          await window.api.deleteFile(fullPath)
        }
      } catch (error) {
        console.error(`Failed to delete local item: ${fullPath}`, error)
        throw error
      }
    }

    // 2. Get all remote files that need to be synced locally
    const remoteItems = await getFilesWithSharing(profile.id, {
      parentFolderId: remoteFolderId,
      includeNested: true
    })

    // Create a map of local paths to remote items for easier lookup
    const remoteMap = new Map(remoteItems.map(item => [item.localPath || '', item]))

    // 3. Process modified files (download from remote)
    console.log('📥 Processing modified files:', diff.modified)
    for (const modifiedItem of diff.modified) {
      const fullPath = `${localPath}/${modifiedItem.path}`
      const remoteItem = remoteMap.get(fullPath)

      if (remoteItem?.filePath) {
        console.log(`📥 Downloading modified file: ${fullPath}`)
        try {
          const fileContent = await b2Service.downloadFile(remoteItem.filePath)
          await window.api.writeLocalFile(fullPath, Buffer.from(fileContent))
        } catch (error) {
          console.error(`Failed to download/write modified file: ${fullPath}`, error)
          throw error
        }
      }
    }

    // 4. Process files that exist in remote but not local (download them)
    console.log('📥 Processing remote-only files:', diff.removed)
    for (const removedPath of diff.removed) {
      const remoteItem = remoteMap.get(removedPath)

      if (remoteItem?.filePath && remoteItem.type === ItemType.FILE) {
        console.log(`📥 Downloading new file: ${removedPath}`)
        try {
          const fileContent = await b2Service.downloadFile(remoteItem.filePath)
          await window.api.writeLocalFile(removedPath, Buffer.from(fileContent))
        } catch (error) {
          console.error(`Failed to download/write new file: ${removedPath}`, error)
          throw error
        }
      } else if (remoteItem?.type === ItemType.FOLDER) {
        console.log(`📁 Creating local folder: ${removedPath}`)
        try {
          await window.api.createLocalDirectory(removedPath)
        } catch (error) {
          console.error(`Failed to create local folder: ${removedPath}`, error)
          throw error
        }
      }
    }

    console.log('✅ Local directory successfully synchronized with remote')
  } catch (error) {
    console.error('Failed to update local from remote:', error)
    throw error
  }
}