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

interface RemoteItem {
  id: string;
  name: string;
  type: ItemType;
  filePath: string | null;
  localPath: string | null;
}

interface EnhancedDiffResult {
  added: LocalItem[];      // exists in local but not in remote
  modified: LocalItem[];   // exists in both but different
  removed: RemoteItem[];   // exists in remote but not in local
}

export async function compareLocalWithRemote(
  localPath: string,
  remoteFolderId: string
): Promise<EnhancedDiffResult> {
  // Get local items
  const localItems = await scanLocalDirectory(localPath);
  const localMap = new Map(localItems.map(item => [item.path, item]));

  // Get remote items with full details
  const remoteItems = await getFilesWithSharing(useUserStore.getState().profile!.id, {
    parentFolderId: remoteFolderId,
    includeNested: true
  });

  const remoteMap = new Map(await Promise.all(remoteItems.map(async item => {
    const relativePath = item.localPath 
      ? await window.api.joinPath(item.localPath.replace(localPath, ''))
      : '';
    return [relativePath.replace(/^[/\\]/, ''), item] as [string, typeof item]; // Type assertion to fix Map constructor
  })));

  const added: LocalItem[] = [];
  const modified: LocalItem[] = [];
  const removed: RemoteItem[] = [];

  console.log("remoteMap:", remoteMap)
  console.log("localMap:", localMap)

  // Check for added/modified files
  localMap.forEach((localItem, path) => {
    const remoteItem = remoteMap.get(path);
    if (!remoteItem) {
      added.push(localItem);
    } 
    // else if (localItem.type === 'file') {
    //   if (localItem.lastModified !== remoteItem.lastModified) {
    //     modified.push(localItem);
    //   }
    // }
  });

  // Check for removed files (exist in remote but not local)
  remoteMap.forEach((remoteItem, path) => {
    if (path && !localMap.has(path)) {
      removed.push({
        id: remoteItem.id,
        name: remoteItem.name,
        type: remoteItem.type,
        filePath: remoteItem.filePath,
        localPath: remoteItem.localPath
      });
    }
  });

  console.log("remoteItems:", remoteItems)
  console.log("localItems:", localItems)

  console.log('🔄 Comparison result:', { added, modified, removed });

  return { added, modified, removed };
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
  diff: EnhancedDiffResult,
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
      console.log("removedPath:", removedPath)
      console.log(`📄 Processing removal for: ${removedPath}`)
      const { data, error } = await supabase
        .from('files')
        .select('id, file_path, type')
        .eq('local_path', removedPath.localPath)
        .single()

      console.log("data:", data)
      console.log("error:", error)
      
      if (data) {
        if (data.file_path && data.type === ItemType.FILE) {
          console.log(`🗑️ Removing from B2: ${data.file_path}`)
          await b2Service.removeFile(data.file_path, removedPath.name)
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
  diff: EnhancedDiffResult,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  const profile = useUserStore.getState().profile;
  if (!profile) throw new Error('User not authenticated');

  const totalChanges = diff.added.length + diff.modified.length + diff.removed.length;
  let processedChanges = 0;

  try {
    // 1. Handle local files that don't exist in remote (delete them)
    for (const localItem of diff.added) {
      const fullPath = await window.api.joinPath(localPath, localItem.path);
      await (localItem.type === 'folder' 
        ? window.api.deleteDirectory(fullPath)
        : window.api.deleteFile(fullPath));
      
      processedChanges++;
      onProgress?.({
        uploadedFiles: processedChanges,
        totalFiles: totalChanges,
        currentFile: localItem.name
      });
    }

    // 2. Process remote-only items (create them locally)
    for (const remoteItem of diff.removed) {
      console.log("remoteItem:", remoteItem)
      const fullPath = remoteItem.localPath || await window.api.joinPath(localPath, remoteItem.name);
      console.log("fullPath:", fullPath)
      
      if (remoteItem.type === ItemType.FOLDER) {
        await window.api.createLocalDirectory(fullPath);
      } else if (remoteItem.filePath) {
        // Download file from B2
        console.log("downloading file from B2 to local")
        console.log("remoteItem.filePath:", remoteItem.filePath)
        const fileContent = await b2Service.downloadFile(remoteItem.filePath);
        console.log("fileContent:", fileContent)
        await window.api.writeLocalFile(fullPath, Buffer.from(fileContent));
        console.log("file written to local")
      }

      processedChanges++;
      onProgress?.({
        uploadedFiles: processedChanges,
        totalFiles: totalChanges,
        currentFile: remoteItem.name
      });
    }

    // 3. Process modified files
    for (const modifiedItem of diff.modified) {
      const fullPath = await window.api.joinPath(localPath, modifiedItem.path);
      const remoteItems = await getFilesWithSharing(profile.id, {
        parentFolderId: remoteFolderId,
        includeNested: true
      });
      
      const remoteItem = remoteItems.find(item => item.localPath === fullPath);
      
      if (remoteItem?.filePath) {
        const fileContent = await b2Service.downloadFile(remoteItem.filePath);
        await window.api.writeLocalFile(fullPath, Buffer.from(fileContent));
      }

      processedChanges++;
      onProgress?.({
        uploadedFiles: processedChanges,
        totalFiles: totalChanges,
        currentFile: modifiedItem.name
      });
    }

  } catch (error) {
    console.error('Failed to update local from remote:', error);
    throw error;
  }
}