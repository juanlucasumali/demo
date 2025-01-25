import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { useUserStore } from '@renderer/stores/user-store'
import { 
  getSyncConfiguration, 
  compareLocalWithRemote,
  updateExistingSync, 
  updateLocalFromRemote,
  cleanupRemoteFolder
} from '@renderer/services/sync-service'
import { SyncType } from '@renderer/types/sync'
import { SyncDetailsDialog } from './dialogs/sync-details-dialog'

export function SyncCheck() {
  const [showDetails, setShowDetails] = useState(false)
  const [currentDiff, setCurrentDiff] = useState<any>(null)
  const [currentConfig, setCurrentConfig] = useState<any>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const hasPendingDiffRef = useRef(false)
  const createdItemsRef = useRef<string[]>([])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    async function checkSync() {
      if (hasPendingDiffRef.current || showDetails || isSyncing) {
        // console.log('⏭️ Skipping sync check: pending changes or dialog open');
        return
      }

      try {
        const profile = useUserStore.getState().profile
        if (!profile) {
          console.log('👤 No profile found, skipping sync check');
          return
        }

        const existingConfig = await getSyncConfiguration(profile.id)
        
        if (existingConfig?.type === SyncType.FL_STUDIO && 
            existingConfig.localPath && 
            existingConfig.remoteFolderId) {
          
          // console.log('🔍 Checking sync status:', {
          //   localPath: existingConfig.localPath,
          //   remoteFolderId: existingConfig.remoteFolderId,
          //   lastSyncedAt: existingConfig.lastSyncedAt
          // });

          const comparison = await compareLocalWithRemote(
            existingConfig.localPath, 
            existingConfig.remoteFolderId,
            existingConfig.lastSyncedAt ? new Date(existingConfig.lastSyncedAt) : null
          )
          
          const hasDifferences = comparison.added.length > 0 || 
                               comparison.modified.length > 0 || 
                               comparison.removed.length > 0;

          if (hasDifferences) {
            // console.log('📢 Differences detected:', {
            //   action: comparison.syncAction,
            //   changes: {
            //     added: comparison.added.length,
            //     modified: comparison.modified.length,
            //     removed: comparison.removed.length
            //   }
            // });

            hasPendingDiffRef.current = true;
            setCurrentDiff(comparison);
            setCurrentConfig(existingConfig);
            
            // Show different messages based on sync action
            const message = comparison.syncAction === 'CONFLICT' 
              ? 'Sync conflict detected'
              : 'Files out of sync';

            toast(message, {
              description: comparison.syncAction === 'CONFLICT'
                ? 'Changes detected in both local and remote files'
                : 'Local and remote files have differences',
              action: {
                label: 'View Details',
                onClick: () => setShowDetails(true)
              },
              dismissible: false,
              duration: Infinity,
              closeButton: false,
              position: 'bottom-left'
            });
          }
        }
      } catch (error) {
        console.error('❌ Failed to check sync status:', error);
      }
    }

    checkSync();
    intervalId = setInterval(checkSync, 5000);

    return () => clearInterval(intervalId);
  }, [showDetails, isSyncing]);

  const handleSyncDirectionChosen = async (useRemote: boolean) => {
    if (!currentConfig || !currentDiff) return
    setIsSyncing(true)
    createdItemsRef.current = []

    try {
      if (useRemote) {
        await updateLocalFromRemote(
          currentConfig.localPath,
          currentConfig.remoteFolderId,
          currentDiff,
          (progress) => {
            toast.info(`Updating local files: ${progress.currentFile}`)
          }
        )
      } else {
        const itemsWithFullPath = [...currentDiff.added, ...currentDiff.modified].map(item => ({
          ...item,
          fullPath: `${currentConfig.localPath}/${item.path}`,
          path: item.path
        }))

        await updateExistingSync(
          itemsWithFullPath,
          currentConfig.remoteFolderId,
          currentDiff,
          (progress) => {
            toast.info(`Updating remote files: ${progress.currentFile}`)
          }
        )
      }
      
      hasPendingDiffRef.current = false
      setShowDetails(false)
      setCurrentDiff(null)
      toast.dismiss()
      toast.success('Sync completed successfully')
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to sync files. Please try again.')

      // Clean up any created items if sync failed
      if (createdItemsRef.current.length > 0) {
        toast.info('Cleaning up created items...')
        for (const itemId of createdItemsRef.current.reverse()) {
          try {
            await cleanupRemoteFolder(itemId)
          } catch (cleanupError) {
            console.error(`Failed to clean up item ${itemId}:`, cleanupError)
          }
        }
      }
    } finally {
      setIsSyncing(false)
      createdItemsRef.current = []
    }
  }

  return (
    <>
      <SyncDetailsDialog 
        open={showDetails} 
        onOpenChange={(open) => {
          setShowDetails(open)
          if (!open && hasPendingDiffRef.current) {
            toast('Files Out of Sync', {
              description: 'Local and remote files have differences',
              action: {
                label: 'View Details',
                onClick: () => setShowDetails(true)
              },
              dismissible: false,
              duration: Infinity,
              closeButton: false,
              position: 'bottom-left'
            })
          }
        }}
        diff={currentDiff || { added: [], modified: [], removed: [] }}
        localPath={currentConfig?.localPath || ''}
        remoteFolderId={currentConfig?.remoteFolderId || ''}
        onSyncDirectionChosen={handleSyncDirectionChosen}
        isSyncing={isSyncing}
      />
    </>
  )
} 