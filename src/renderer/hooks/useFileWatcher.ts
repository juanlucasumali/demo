import { useEffect, useCallback } from 'react'
import { useUserStore } from '@renderer/stores/user-store'
import { getSyncConfiguration, updateExistingSync } from '@renderer/services/sync-service'
import { toast } from 'sonner'
import path from 'path'

interface FileSystemEvent {
  type: string
  syncId: number
  data: {
    name: string
    path: string
    type: 'file' | 'folder'
  }
}

export function useFileWatcher() {
  const handleFileSystemEvent = useCallback(async (event: FileSystemEvent) => {
    const profile = useUserStore.getState().profile
    if (!profile) return

    try {
      const config = await getSyncConfiguration(profile.id)
      if (!config || event.syncId !== config.id) return

      console.log('📝 File system event:', event)

      // Create a minimal diff result based on the event type
      const diff = {
        added: [],
        modified: [],
        removed: []
      }

      // Create item with full path
      const fullPath = await window.api.joinPath(config.localPath, event.data.path)
      const item = {
        ...event.data,
        fullPath,
        path: event.data.path
      }

      // Categorize the change based on event type
      switch (event.type) {
        case 'file-added':
        case 'folder-added':
          diff.added.push(item as never)
          break
        case 'file-modified':
          diff.modified.push(item as never)
          break
        case 'file-removed':
        case 'folder-removed':
          diff.removed.push(item as never)
          break
      }

      // Update remote based on the change
      if (diff.added.length || diff.modified.length || diff.removed.length) {
        await updateExistingSync(
          [item],
          config.remoteFolderId,
          diff,
          (progress) => {
            console.log('Sync progress:', progress)
          }
        )
      }

    } catch (error) {
      console.error('Failed to handle file system event:', error)
      toast.error('Failed to sync changes')
    }
  }, [])

  useEffect(() => {
    const profile = useUserStore.getState().profile
    if (!profile) return

    // Start watching when component mounts
    const setupWatcher = async () => {
      try {
        const config = await getSyncConfiguration(profile.id)
        if (!config?.localPath) return

        await window.api.startWatching(config.id, config.localPath)
        console.log('👀 Started watching directory:', config.localPath)
      } catch (error) {
        console.error('Failed to setup file watcher:', error)
        toast.error('Failed to initialize file watcher')
      }
    }

    setupWatcher()

    // Setup event listener
    window.api.onFileSystemEvent(handleFileSystemEvent)

    // Cleanup
    return () => {
      const cleanup = async () => {
        const config = await getSyncConfiguration(profile.id)
        if (config?.id) {
          await window.api.stopWatching(config.id)
          console.log('🛑 Stopped watching directory')
        }
      }
      cleanup()
    }
  }, [handleFileSystemEvent])
} 