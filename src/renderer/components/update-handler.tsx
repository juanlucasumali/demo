import { useEffect } from 'react'
import { useToast } from '@renderer/hooks/use-toast'

export function UpdateHandler() {
  const { toast } = useToast()

  useEffect(() => {
    // Handle update available
    window.api.onUpdateAvailable((_event, info) => {
      toast({
        title: 'Update Available',
        description: `Version ${info.version} is available. Downloading...`,
        duration: 5000
      })
    })

    // Handle download progress
    window.api.onUpdateProgress((_event, progress) => {
      console.log('Downloading Update', progress)
    })

    // Handle update downloaded
    window.api.onUpdateDownloaded((_event, info) => {
      toast({
        title: 'Update Ready',
        description: `Please quit and restart Demo to update to Version ${info.version}`,
        duration: undefined,
      })
    })

    // Handle update errors
    window.api.onUpdateError((_event, error) => {
      toast({
        title: 'Update Error',
        description: error.message,
        variant: 'destructive',
        duration: 5000
      })
    })

    // Check for updates
    if (!import.meta.env.DEV) {
      window.api.checkForUpdates()
    }
  }, [])

  return null
} 