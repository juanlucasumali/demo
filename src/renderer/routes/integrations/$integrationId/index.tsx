import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Radio } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Progress } from '@renderer/components/ui/progress'
import { useState, useEffect } from 'react'
import { useToast } from '@renderer/hooks/use-toast'
import { Steps, Step } from '@renderer/components/ui/steps'
import { beginUpload, createRemoteFolder, createSyncConfiguration, scanLocalDirectory, compareLocalWithRemote, updateExistingSync } from '@renderer/services/sync-service'
import { LocalItem, SyncType } from '@renderer/types/sync'
import { useUserStore } from '@renderer/stores/user-store'
import { getSyncConfiguration } from '@renderer/services/sync-service'

// Define route params interface
export interface IntegrationParams {
  integrationId: string
}

// Create the route with params validation
export const Route = createFileRoute('/integrations/$integrationId/')({
  parseParams: (params): IntegrationParams => ({
    integrationId: params.integrationId,
  }),
  component: IntegrationDetail,
  loader: ({ params }) => {
    return {
      integrationId: params.integrationId,
      breadcrumb: {
        label: 'FL Studio Integration',
        id: 'integration-detail'
      }
    }
  },
})

function IntegrationDetail() {
  const { integrationId } = useParams({ from: '/integrations/$integrationId/' })
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState(0)
  const [scannedItems, setScannedItems] = useState<LocalItem[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [existingRemoteFolderId, setExistingRemoteFolderId] = useState<string | null>(null)
  const { toast } = useToast()

  // Check for existing configuration on component mount
  useEffect(() => {
    async function checkExistingConfig() {
      try {
        const profile = useUserStore.getState().profile
        if (!profile) return

        const existingConfig = await getSyncConfiguration(profile.id)
        
        if (existingConfig && existingConfig.type === SyncType.FL_STUDIO) {
          if (existingConfig.localPath) {
            setSelectedPath(existingConfig.localPath)
            setCurrentStep(2)
          }
          if (existingConfig.remoteFolderId) {
            setExistingRemoteFolderId(existingConfig.remoteFolderId)
          }
          toast({
            title: "Existing Configuration Found",
            description: "Found an existing FL Studio sync configuration",
            duration: 3000
          })
        }
      } catch (error) {
        console.error('Failed to check existing configuration:', error)
      }
    }

    checkExistingConfig()
  }, [])

  // Step 1: Select Local Folder
  const selectFolder = async () => {
    try {
      const path = await window.api.selectFolder()
      if (path) {
        setSelectedPath(path)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
      toast({
        title: "Folder Selection Failed",
        description: "Unable to select folder",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  // Step 2: Scan Directory
  const scanDirectory = async () => {
    if (!selectedPath) return

    setIsScanning(true)
    try {
      const profile = useUserStore.getState().profile
      if (!profile) throw new Error('User not authenticated')

      const existingConfig = await getSyncConfiguration(profile.id)
      
      if (existingConfig?.type === SyncType.FL_STUDIO && existingConfig.remoteFolderId) {
        // Compare local with remote
        const diff = await compareLocalWithRemote(selectedPath, existingConfig.remoteFolderId)
        
        const hasDifferences = diff.added.length > 0 || diff.modified.length > 0 || diff.removed.length > 0

        console.log('📊 Sync differences found:', {
          added: diff.added.length,
          modified: diff.modified.length,
          removed: diff.removed.length,
          details: {
            added: diff.added.map(i => i.path),
            modified: diff.modified.map(i => i.path),
            removed: diff.removed
          }
        })

        toast({
          title: hasDifferences ? "Changes Detected" : "No Changes",
          description: hasDifferences 
            ? `Found ${diff.added.length} new, ${diff.modified.length} modified, and ${diff.removed.length} removed files`
            : "Your files are up to date",
          duration: 5000
        })

        setScannedItems(hasDifferences ? [...diff.added, ...diff.modified] : [])
        setCurrentStep(hasDifferences ? 3 : 2)
      } else {
        // Regular scan for new configuration
        const items = await scanLocalDirectory(selectedPath)
        setScannedItems(items)
        console.log('📂 Scanned directory structure:', {
          totalItems: items.length,
          files: items.filter(i => i.type === 'file').length,
          folders: items.filter(i => i.type === 'folder').length,
          items: items.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type,
            size: item.size,
            lastModified: item.lastModified
          }))
        })
        
        setCurrentStep(3)
        toast({
          title: "Scan Complete",
          description: `Found ${items.length} items in directory`,
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Directory scan failed:', error)
      toast({
        title: "Scan Failed",
        description: "Failed to scan directory structure",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Step 3: Initialize Sync
  const initializeSync = async () => {
    if (!selectedPath || !scannedItems.length) return

    setIsInitializing(true)
    setUploadProgress(0)

    try {
      if (existingRemoteFolderId) {
        // Get the diff result again
        const diff = await compareLocalWithRemote(selectedPath, existingRemoteFolderId)
        const itemsWithFullPath = scannedItems.map(item => ({
          ...item,
          fullPath: `${selectedPath}/${item.path}`,
          path: item.path
        }))

        setTotalFiles(diff.added.length + diff.modified.length + diff.removed.length)

        await updateExistingSync(itemsWithFullPath, existingRemoteFolderId, diff, (progress) => {
          setUploadedFiles(progress.uploadedFiles)
          setUploadProgress((progress.uploadedFiles / progress.totalFiles) * 100)
        })

        toast({
          title: "Sync Updated",
          description: "Your changes have been synced successfully",
          duration: 3000
        })
      } else {
        // Original initialization logic
        const remoteFolderId = await createRemoteFolder(selectedPath)
        const itemsWithFullPath = scannedItems.map(item => ({
          ...item,
          fullPath: `${selectedPath}/${item.path}`,
          path: item.path
        }))
        
        setTotalFiles(itemsWithFullPath.filter(item => item.type === 'file').length)

        await beginUpload(itemsWithFullPath, remoteFolderId, (progress) => {
          setUploadedFiles(progress.uploadedFiles)
          setUploadProgress((progress.uploadedFiles / progress.totalFiles) * 100)
        })

        await createSyncConfiguration(selectedPath, remoteFolderId, SyncType.FL_STUDIO)

        toast({
          title: "Sync Initialized",
          description: "Your folder has been synced successfully",
          duration: 3000
        })
      }
    } catch (error: any) {
      console.error('Sync failed:', error)
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync changes",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsInitializing(false)
    }
  }

  if (integrationId !== 'fl-studio') {
    return (
      <PageMain>
        <PageHeader
          title="Integration Not Found"
          description="The requested integration is not available."
          icon={Radio}
        />
      </PageMain>
    )
  }

  return (
    <PageMain>
      <PageHeader
        title="FL Studio"
        description="Set up two-way sync between FL Studio and Demo"
        icon={Radio}
      />

      <PageContent>
        <div className="max-w-3xl mx-auto space-y-8">
          <Steps currentStep={currentStep}>
            <Step value={1} title="Select Folder" currentStep={currentStep}>
              <Card>
                <CardHeader>
                  <CardTitle>Select Local Folder</CardTitle>
                  <CardDescription>Choose the folder you want to sync with Demo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button onClick={selectFolder} disabled={isScanning || isInitializing}>
                      Select Folder
                    </Button>
                    {selectedPath && (
                      <span className="text-sm text-muted-foreground">
                        Selected: {selectedPath}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Step>

            <Step value={2} title="Scan Directory" canProceedToNext={selectedPath !== null} currentStep={currentStep}>
              <Card>
                <CardHeader>
                  <CardTitle>Scan Directory</CardTitle>
                  <CardDescription>Analyze the contents of the selected folder</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={scanDirectory} 
                    disabled={!selectedPath || isScanning || isInitializing}
                  >
                    {isScanning ? 'Scanning...' : 'Scan Directory'}
                  </Button>
                </CardContent>
              </Card>
            </Step>

            <Step value={3} title={existingRemoteFolderId ? "Update Sync" : "Initialize Sync"} canProceedToNext={scannedItems.length > 0} currentStep={currentStep}>
              <Card>
                <CardHeader>
                  <CardTitle>{existingRemoteFolderId ? "Update Sync" : "Initialize Sync"}</CardTitle>
                  <CardDescription>
                    {existingRemoteFolderId 
                      ? "Update your synced files with Demo" 
                      : "Start syncing your files with Demo"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={initializeSync}
                    disabled={!scannedItems.length || isInitializing}
                  >
                    {isInitializing 
                      ? 'Processing...' 
                      : existingRemoteFolderId 
                        ? 'Update Files'
                        : 'Initialize Sync'
                    }
                  </Button>

                  {isInitializing && (
                    <div className="space-y-2 mt-4">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground">
                        Uploading: {uploadedFiles} / {totalFiles} files
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Step>
          </Steps>
        </div>
      </PageContent>
    </PageMain>
  )
}
