import { useEffect } from 'react'
import { toast } from 'sonner'
import { useUserStore } from '@renderer/stores/user-store'
import { 
  getSyncConfiguration, 
  compareLocalWithRemote,
  updateExistingSync 
} from '@renderer/services/sync-service'
import { SyncType } from '@renderer/types/sync'

export function SyncCheck() {
  useEffect(() => {
    async function checkSync() {
      try {
        const profile = useUserStore.getState().profile
        if (!profile) {
          console.log('No profile found, skipping sync check')
          return
        }

        console.log('Checking sync configuration...')
        const existingConfig = await getSyncConfiguration(profile.id)
        
        if (existingConfig?.type === SyncType.FL_STUDIO && existingConfig.localPath && existingConfig.remoteFolderId) {
          console.log('Found existing sync configuration:', {
            localPath: existingConfig.localPath,
            remoteFolderId: existingConfig.remoteFolderId
          })

          const diff = await compareLocalWithRemote(existingConfig.localPath, existingConfig.remoteFolderId)
          const hasDifferences = diff.added.length > 0 || diff.modified.length > 0 || diff.removed.length > 0
          
          if (hasDifferences) {
            toast('Files Out of Sync', {
              description: `Local folder "${existingConfig.localPath}" has changes:\n${diff.added.length} new, ${diff.modified.length} modified, and ${diff.removed.length} removed files`,
              action: {
                label: 'Update Remote',
                onClick: async () => {
                  const itemsWithFullPath = [...diff.added, ...diff.modified].map(item => ({
                    ...item,
                    fullPath: `${existingConfig.localPath}/${item.path}`,
                    path: item.path
                  }))

                  toast.promise(
                    updateExistingSync(
                      itemsWithFullPath, 
                      existingConfig.remoteFolderId, 
                      diff
                    ),
                    {
                      loading: `Updating remote folder...`,
                      success: 'Remote folder synchronized successfully',
                      error: 'Failed to update remote folder'
                    }
                  )
                }
              },
              dismissible: true,
              duration: 999999,
              closeButton: true
            })
          } else {
            console.log('No differences found between local and remote folders')
          }
        } else {
          console.log('No valid sync configuration found')
        }
      } catch (error) {
        console.error('Failed to check sync status:', error)
      }
    }

    checkSync()
  }, [])

  return null
} 