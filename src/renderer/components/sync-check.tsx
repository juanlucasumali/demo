import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { useUserStore } from '@renderer/stores/user-store'
import { 
  getSyncConfiguration, 
  compareLocalWithRemote,
  updateExistingSync, 
  updateLocalFromRemote
} from '@renderer/services/sync-service'
import { SyncType } from '@renderer/types/sync'
import { SyncDetailsDialog } from './dialogs/sync-details-dialog'

export function SyncCheck() {
  const [showDetails, setShowDetails] = useState(false)
  const [currentDiff, setCurrentDiff] = useState<any>(null)
  const [currentConfig, setCurrentConfig] = useState<any>(null)
  const hasPendingDiffRef = useRef(false)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    async function checkSync() {
      if (hasPendingDiffRef.current || showDetails) {
        console.log('Skipping sync check due to pending differences or open dialog')
        return
      }

      try {
        const profile = useUserStore.getState().profile
        if (!profile) {
          console.log('No profile found, skipping sync check')
          return
        }

        const existingConfig = await getSyncConfiguration(profile.id)
        
        if (existingConfig?.type === SyncType.FL_STUDIO && existingConfig.localPath && existingConfig.remoteFolderId) {
          const diff = await compareLocalWithRemote(existingConfig.localPath, existingConfig.remoteFolderId)
          const hasDifferences = diff.added.length > 0 || diff.modified.length > 0 || diff.removed.length > 0
          
          if (hasDifferences) {
            hasPendingDiffRef.current = true
            setCurrentDiff(diff)
            setCurrentConfig(existingConfig)
            
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
        }
      } catch (error) {
        console.error('Failed to check sync status:', error)
      }
    }

    // Start initial check
    checkSync()
    
    // Only set up interval if dialog is not shown
    if (!showDetails) {
      intervalId = setInterval(checkSync, 10000) // 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [showDetails]) // Add showDetails as dependency

  const handleSyncDirectionChosen = async (useRemote: boolean) => {
    if (!currentConfig || !currentDiff) return

    try {
      if (useRemote) {
        await updateLocalFromRemote(
          currentConfig.localPath,
          currentConfig.remoteFolderId,
          currentDiff
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
          currentDiff
        )
      }
      
      // Reset state after successful sync
      hasPendingDiffRef.current = false
      setShowDetails(false)
      setCurrentDiff(null)
      toast.dismiss()
      toast.success('Sync completed successfully')
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to sync files. Please try again.')
    }
  }

// Replace the SyncDetailsDialog component render with:
return (
  <>
    <SyncDetailsDialog 
      open={showDetails} 
      onOpenChange={(open) => {
        // Only update dialog visibility
        setShowDetails(open);
        
        // Don't dismiss the toast when closing dialog without resolution
        if (!open && hasPendingDiffRef.current) {
          // Re-show the toast if there are still pending differences
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
    />
  </>
)
} 