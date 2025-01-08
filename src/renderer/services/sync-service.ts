import { supabase } from '@renderer/lib/supabase'
import path from 'path'
import { useUserStore } from '@renderer/stores/user-store'
import { ItemType } from '@renderer/types/items'
import { addFileOrFolder } from './items-service'
import chokidar from 'chokidar'

interface LocalItem {
  name: string
  path: string
  type: 'file' | 'folder'
  size?: number
  lastModified?: Date
}

interface SyncConfiguration {
  id: number
  userId: string
  localPath: string
  remoteFolderId: string
  lastSyncedAt: Date | null
}

// Configuration Management Functions
export async function createSyncConfiguration(
  localPath: string,
  remoteFolderId: string
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

    // 2. Create sync configuration
    const syncConfig = await createSyncConfiguration(localPath, remoteFolder.id)

    return {
      syncId: syncConfig.id,
      remoteFolderId: remoteFolder.id
    }
  } catch (error) {
    console.error('Sync initialization failed:', error)
    throw error
  }
} 