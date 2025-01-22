import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
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
import { beginUpload, createRemoteFolder, createSyncConfiguration, scanLocalDirectory, getSyncConfiguration } from '@renderer/services/sync-service'
import { LocalItem, SyncType, SyncConfiguration } from '@renderer/types/sync'
import { useUserStore } from '@renderer/stores/user-store'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import { AlertCircle } from 'lucide-react'

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
  const [successfulScan, setSuccessfulScan] = useState(false)
  const [scannedItems, setScannedItems] = useState<LocalItem[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [existingConfig, setExistingConfig] = useState<SyncConfiguration | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  const profile = useUserStore((state) => state.profile)

  // Check for existing configuration on mount
  useEffect(() => {
    async function checkExistingConfig() {
      if (!profile) return
      try {
        const config = await getSyncConfiguration(profile.id)
        if (config?.type === SyncType.FL_STUDIO) {
          setExistingConfig(config)
        }
      } catch (error) {
        console.error('Failed to check configuration:', error)
      }
    }

    checkExistingConfig()
  }, [profile])

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

      const items = await scanLocalDirectory(selectedPath)
      setScannedItems(items)
      
      // Allow empty folders but inform the user
      if (items.length === 0) {
        toast({
          title: "Empty Folder",
          description: "Selected folder is empty. You can still proceed with the sync.",
          duration: 5000
        })
      }
      
      setCurrentStep(3)
      setSuccessfulScan(true)
      toast({
        title: "Scan Complete",
        description: `Found ${items.length} items in directory`,
        duration: 3000
      })
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
    if (!selectedPath || !successfulScan) return

    setIsInitializing(true)
    setUploadProgress(0)

    try {
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

  if (integrationId === 'fl-studio') {
    return (
      <PageMain>
        <PageHeader
          title="FL Studio"
          description="Set up two-way sync between FL Studio and Demo"
          icon={Radio}
        />

        <PageContent>
          <div className="max-w-3xl mx-auto space-y-8">
            {existingConfig && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Existing Configuration Found</AlertTitle>
                <AlertDescription>
                  You already have an FL Studio sync configuration. Proceeding will replace your current configuration for "{existingConfig.localPath}".
                </AlertDescription>
              </Alert>
            )}

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

              <Step value={3} title={"Initialize Sync"} canProceedToNext={successfulScan} currentStep={currentStep}>
                <Card>
                  <CardHeader>
                    <CardTitle>Initialize Sync</CardTitle>
                    <CardDescription>
                      Start syncing your files with Demo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={initializeSync}
                      disabled={!successfulScan || isInitializing}
                    >
                      {isInitializing 
                        ? 'Processing...' 
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
  } else {
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
}