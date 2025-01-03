import { useEffect } from 'react'
import { Progress } from '@renderer/components/ui/progress'
import { Button } from '@renderer/components/ui/button'
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
      toast({
        title: 'Downloading Update',
        description: (
          <Progress value={progress.percent} className="w-full mt-2" />
        ),
        duration: undefined
      })
    })

    // Handle update downloaded
    window.api.onUpdateDownloaded((_event, info) => {
      toast({
        title: 'Update Ready',
        description: `Version ${info.version} will be installed on restart`,
        duration: undefined,
        action: (
          <Button variant="default" size="sm" onClick={() => window.close()}>
            Restart Now
          </Button>
        )
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