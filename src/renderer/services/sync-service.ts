import { supabase } from '@renderer/lib/supabase'
import { useUserStore } from '@renderer/stores/user-store'
import { DemoItem, FileFormat, ItemType } from '@renderer/types/items'
import { addFileOrFolder, getFilesWithSharing, getItemsToDeleteRecursively } from './items-service'
import { LocalItem, LocalItemWithFullPath, UploadProgress, SyncConfiguration, SyncType, EnhancedDiffResult, RemoteItem } from '@renderer/types/sync'
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

  // First, check for and delete any existing configuration
  const { data: existingConfig } = await supabase
    .from('sync_configurations')
    .select()
    .eq('user_id', profile.id)
    .eq('type', type)
    .single()

  if (existingConfig) {
    // // Clean up old remote folder if it exists
    // if (existingConfig.remote_folder_id) {
    //   await cleanupRemoteFolder(existingConfig.remote_folder_id)
    // }
    
    // Delete the existing configuration
    await supabase
      .from('sync_configurations')
      .delete()
      .eq('id', existingConfig.id)
  }

  // Create new configuration
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
  rootFolderId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  const profile = useUserStore.getState().profile
  if (!profile) throw new Error('User not authenticated')
  
  // Track created items for cleanup
  const createdItems: string[] = []

  try {
    const folderMap = new Map<string, string>()
    folderMap.set('', rootFolderId)

    // Create folders first
    const folders = items.filter(item => item.type === 'folder')
    for (const folder of folders) {
      const parentPath = folder.path.split('/').slice(0, -1).join('/')
      const parentId = folderMap.get(parentPath) || rootFolderId

      const newFolder = await addFileOrFolder({
        name: folder.name,
        type: ItemType.FOLDER,
        owner: profile,
        description: null,
        isStarred: false,
        projectIds: [],
        collectionIds: [],
        parentFolderIds: [parentId],
        primaryParentId: parentId,
        tags: null,
        format: null,
        size: null,
        duration: null,
        icon: null,
        filePath: null,
        sharedWith: [],
        createdAt: new Date(),
        lastModified: folder.lastModified || new Date(),
        lastOpened: new Date(),
      })

      createdItems.push(newFolder.id)
      folderMap.set(folder.path, newFolder.id)
    }

    // Handle files
    const files = items.filter(item => item.type === 'file')
    const totalFiles = files.length
    let processedFiles = 0

    for (const file of files) {
      const parentPath = file.path.split('/').slice(0, -1).join('/')
      const parentId = folderMap.get(parentPath) || rootFolderId
      const fileContent = await window.api.readFile(file.fullPath)
      const format = file.name.includes('.') 
        ? file.name.split('.').pop()?.toLowerCase() as FileFormat 
        : null

      const newFile = await addFileOrFolder({
        name: file.name,
        type: ItemType.FILE,
        owner: profile,
        description: null,
        isStarred: false,
        projectIds: [],
        collectionIds: [],
        parentFolderIds: [parentId],
        primaryParentId: parentId,
        tags: null,
        format,
        size: file.size || null,
        duration: null,
        icon: null,
        filePath: null,
        sharedWith: [],
        createdAt: new Date(),
        lastModified: file.lastModified || new Date(),
        lastOpened: new Date(),
      }, [], fileContent)

      createdItems.push(newFile.id)
      processedFiles++
      onProgress?.({
        uploadedFiles: processedFiles,
        totalFiles,
        currentFile: file.name
      })
    }
  } catch (error) {
    console.error('Upload failed:', error)
    
    // Clean up all created items in reverse order (files before folders)
    console.log('🧹 Starting cleanup of created items...')
    for (const itemId of createdItems.reverse()) {
      try {
        await cleanupRemoteFolder(itemId)
      } catch (cleanupError) {
        console.error(`Failed to clean up item ${itemId}:`, cleanupError)
      }
    }
    
    throw error
  }
}

export async function cleanupRemoteFolder(folderId: string): Promise<void> {
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
    createdAt: new Date(),
    lastModified: new Date(),
    lastOpened: new Date(),
    sharedWith: [],
  })

  return folder.id
} 

interface SyncComparisonResult extends EnhancedDiffResult {
  syncAction: 'NO_CHANGE' | 'USE_REMOTE' | 'USE_LOCAL' | 'CONFLICT';
}

export async function compareLocalWithRemote(
  localPath: string,
  remoteFolderId: string,
  lastSyncedAt: Date | null
): Promise<SyncComparisonResult> {
  console.log('🔄 Starting sync comparison:', {
    localPath,
    remoteFolderId,
    lastSyncedAt: lastSyncedAt?.toISOString()
  });

  const localItems = await scanLocalDirectory(localPath);
  const localMap = new Map(localItems.map(item => [item.path, item]));

  const remoteItems = await getFilesWithSharing(useUserStore.getState().profile!.id, {
    parentFolderId: remoteFolderId,
    includeNested: true
  });

  console.log('📊 Found items:', {
    localCount: localItems.length,
    remoteCount: remoteItems.length
  });

  const remoteMap = new Map();
  
  const buildRemotePath = async (item: DemoItem): Promise<string> => {
    const pathParts: string[] = [item.name];
    let currentItem = item;
    
    while (true) {
      const { data: parentRelation } = await supabase
        .from('file_folders')
        .select('folder_id')
        .eq('file_id', currentItem.id)
        .eq('primary_parent', true)
        .single();
      
      if (!parentRelation || parentRelation.folder_id === remoteFolderId) break;
      
      const { data: parent } = await supabase
        .from('files')
        .select('*')
        .eq('id', parentRelation.folder_id)
        .single();
      
      if (!parent) break;
      pathParts.unshift(parent.name);
      currentItem = parent;
    }
    
    return pathParts.join('/');
  };

  // Build remote paths using only primary parent relationships
  for (const item of remoteItems) {
    const relativePath = await buildRemotePath(item);
    remoteMap.set(relativePath, item);
  }

  const added: LocalItem[] = [];
  const modified: LocalItem[] = [];
  const removed: RemoteItem[] = [];
  let syncAction: 'NO_CHANGE' | 'USE_REMOTE' | 'USE_LOCAL' | 'CONFLICT' = 'NO_CHANGE';

  // Check for added/modified files
  localMap.forEach((localItem, path) => {
    const remoteItem = remoteMap.get(path);
    if (!remoteItem) {
      console.log('📝 Found new local item:', { path, type: localItem.type });
      added.push(localItem);
    } else if (localItem.type === 'file') {
      const localTimestamp = localItem.lastModified?.getTime() || 0;
      const remoteTimestamp = new Date(remoteItem.lastModified).getTime();
      const lastSyncTimestamp = lastSyncedAt?.getTime() || 0;

      console.log('⏰ Comparing timestamps:', {
        path,
        localTime: new Date(localTimestamp).toISOString(),
        remoteTime: new Date(remoteTimestamp).toISOString(),
        lastSyncTime: lastSyncedAt?.toISOString()
      });

      if (Math.abs(localTimestamp - remoteTimestamp) > 1000) {
        modified.push(localItem);
        
        // Determine sync action
        if (localTimestamp === lastSyncTimestamp && remoteTimestamp > lastSyncTimestamp) {
          console.log('🔄 Remote changes detected:', { path });
          syncAction = 'USE_REMOTE';
        } else if (remoteTimestamp === lastSyncTimestamp && localTimestamp > lastSyncTimestamp) {
          console.log('🔄 Local changes detected:', { path });
          syncAction = 'USE_LOCAL';
        } else if (localTimestamp !== lastSyncTimestamp && remoteTimestamp !== lastSyncTimestamp) {
          console.log('⚠️ Conflict detected:', { path });
          syncAction = 'CONFLICT';
        }
      }
    }
  });

  console.log("Local Items", localItems)
  console.log("Remote Items", remoteMap)

  // Check for removed files (exist in remote but not local)
  remoteMap.forEach((remoteItem, path) => {
    if (path && !localMap.has(path)) {
      removed.push({
        id: remoteItem.id,
        name: remoteItem.name,
        type: remoteItem.type,
        filePath: remoteItem.filePath,
        localPath: path, // Include the constructed path
        lastModified: remoteItem.lastModified
      });
    }
  });

  console.log('🔄 Comparison complete:', {
    added: added.length,
    modified: modified.length,
    removed: removed.length,
    syncAction
  });

  return { added, modified, removed, syncAction };
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

  // Build paths for existing remote folders using primary parent relationships
  const remoteFolders = remoteItems.filter(item => item.type === ItemType.FOLDER);
  for (const folder of remoteFolders) {
    const pathParts: string[] = [folder.name];
    let currentItem = folder;
    
    while (true) {
      const { data: parentRelation } = await supabase
        .from('file_folders')
        .select('folder_id')
        .eq('file_id', currentItem.id)
        .eq('primary_parent', true)
        .single();
      
      if (!parentRelation || parentRelation.folder_id === rootFolderId) break;
      
      const { data: parent } = await supabase
        .from('files')
        .select('*')
        .eq('id', parentRelation.folder_id)
        .single();
      
      if (!parent) break;
      pathParts.unshift(parent.name);
      currentItem = parent;
    }
    
    const remotePath = `${basePath}/${pathParts.join('/')}`;
    folderMap.set(remotePath, folder.id);
    console.log('📂 Mapped existing remote folder:', {
      remotePath,
      remoteFolderId: folder.id
    });
  }

  // Process new folders in order of path depth
  const folders = items
    .filter(item => item.type === 'folder')
    .sort((a, b) => a.path.split('/').length - b.path.split('/').length);

  for (const folder of folders) {
    const fullPath = `${basePath}/${folder.path}`;
    
    if (folderMap.has(fullPath)) {
      console.log('📂 Folder already exists in remote:', fullPath);
      continue;
    }

    const parentPath = fullPath.split('/').slice(0, -1).join('/');
    const parentId = parentPath === basePath ? rootFolderId : folderMap.get(parentPath);

    console.log('📂 Processing new folder:', {
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

    const remoteFolder = await addFileOrFolder({
      name: folder.name,
      type: ItemType.FOLDER,
      owner: useUserStore.getState().profile!,
      description: null,
      isStarred: false,
      projectIds: [],
      collectionIds: [],
      parentFolderIds: [parentId],
      primaryParentId: parentId, // Add primary parent designation
      tags: null,
      format: null,
      size: null,
      duration: null,
      icon: null,
      filePath: null,
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
      
      // Find the file by name and parent folder relationship instead
      const { data, error } = await supabase
        .from('files')
        .select(`
          id, 
          file_path, 
          type,
          file_folders!file_folders_file_id_fkey(*)
        `)
        .eq('name', removedPath.name)
        .eq('file_folders.primary_parent', true)
        .single();

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
        sharedWith: [],
        createdAt: new Date(),
        lastModified: file.lastModified || new Date(),
        lastOpened: new Date(),
        primaryParentId: parentId,
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
    // Helper function to build local path from remote item
    const buildLocalPath = async (remoteItem: RemoteItem): Promise<string> => {
      const pathParts: string[] = [remoteItem.name];
      let currentItem = remoteItem;
      
      while (true) {
        const { data: parentRelation } = await supabase
          .from('file_folders')
          .select('folder_id')
          .eq('file_id', currentItem.id)
          .eq('primary_parent', true)
          .single();
        
        if (!parentRelation || parentRelation.folder_id === remoteFolderId) break;
        
        const { data: parent } = await supabase
          .from('files')
          .select('*')
          .eq('id', parentRelation.folder_id)
          .single();
        
        if (!parent) break;
        pathParts.unshift(parent.name);
        currentItem = parent;
      }
      
      return window.api.joinPath(localPath, pathParts.join('/'));
    };

    const verifyModificationTime = async (fullPath: string, expectedTime: number) => {
      const stats = await window.api.getFileStats(fullPath);
      const actualTime = stats.mtime.getTime();
      
      console.log('⏰ Verifying modification time:', {
        path: fullPath,
        expected: new Date(expectedTime).toISOString(),
        actual: new Date(actualTime).toISOString(),
        difference: Math.abs(actualTime - expectedTime),
        success: Math.abs(actualTime - expectedTime) <= 1000 // Allow 1s difference
      });

      return Math.abs(actualTime - expectedTime) <= 1000;
    };

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
      const fullPath = await buildLocalPath(remoteItem);
      
      if (remoteItem.type === ItemType.FOLDER) {
        await window.api.createLocalDirectory(fullPath);
        if (remoteItem.lastModified) {
          const remoteModTime = new Date(remoteItem.lastModified).getTime();
          console.log('⏰ Setting folder modification time:', {
            path: fullPath,
            time: new Date(remoteModTime).toISOString()
          });
          
          await window.api.setFileTime(fullPath, remoteModTime);
          const success = await verifyModificationTime(fullPath, remoteModTime);
          if (!success) {
            console.warn('⚠️ Failed to set folder modification time correctly');
          }
        }
      } else if (remoteItem.filePath) {
        const fileContent = await b2Service.downloadFile(remoteItem.filePath);
        await window.api.writeLocalFile(fullPath, Buffer.from(fileContent));
        
        if (remoteItem.lastModified) {
          const remoteModTime = new Date(remoteItem.lastModified).getTime();
          console.log('⏰ Setting file modification time:', {
            path: fullPath,
            time: new Date(remoteModTime).toISOString()
          });
          
          await window.api.setFileTime(fullPath, remoteModTime);
          const success = await verifyModificationTime(fullPath, remoteModTime);
          if (!success) {
            console.warn('⚠️ Failed to set file modification time correctly');
          }
        }
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
      
      // Specify the foreign key relationship explicitly
      const { data: remoteItem, error } = await supabase
        .from('files')
        .select(`
          *,
          file_folders!file_folders_file_id_fkey(*)
        `)
        .eq('name', modifiedItem.name)
        .eq('file_folders.primary_parent', true)
        .single();

      console.log("remoteItem:", remoteItem);
      console.log("error:", error);
      
      if (remoteItem?.file_path) {
        const fileContent = await b2Service.downloadFile(remoteItem.file_path);
        await window.api.writeLocalFile(fullPath, Buffer.from(fileContent));
        
        // Set the file's modification time to match remote
        const remoteModTime = new Date(remoteItem.last_modified).getTime();
        await window.api.setFileTime(fullPath, remoteModTime);
        const success = await verifyModificationTime(fullPath, remoteModTime);
        if (!success) {
          console.warn('⚠️ Failed to set modified file time correctly:', {
            path: fullPath,
            expectedTime: new Date(remoteModTime).toISOString()
          });
        }
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