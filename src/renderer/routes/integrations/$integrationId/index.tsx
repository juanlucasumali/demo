import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Radio, Folder } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Progress } from '@renderer/components/ui/progress'
import { useState } from 'react'
import { useToast } from '@renderer/hooks/use-toast'
import { Steps, Step } from '@renderer/components/ui/steps'
import { beginUpload, createRemoteFolder, createSyncConfiguration, initializeSync, scanLocalDirectory, updateLastSyncedAt } from '@renderer/services/sync-service'

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
  const [isInitializing, setIsInitializing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState(0)
  const { toast } = useToast()

  // Step 1: Select Local Folder
  const selectFolder = async () => {
    try {
      const path = await window.api.selectFolder()
      if (path) {
        setSelectedPath(path)
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

  // Step 2: Initialize Sync
  const initializeSync = async () => {
    if (!selectedPath) return

    setIsInitializing(true)
    setUploadProgress(0)

    try {
      // 1. Scan directory
      console.log('📂 Scanning directory:', selectedPath)
      const items = await scanLocalDirectory(selectedPath)
      
      // 2. Create remote folder
      console.log('📁 Creating remote folder')
      const remoteFolderId = await createRemoteFolder(selectedPath)
      
      // 3. Add base path to all items
      const itemsWithFullPath = items.map(item => ({
        ...item,
        fullPath: `${selectedPath}/${item.path}`,
        path: item.path
      }))
      
      setTotalFiles(itemsWithFullPath.filter(item => item.type === 'file').length)

      // 4. Begin upload process
      console.log('📤 Starting upload process')
      await beginUpload(itemsWithFullPath, remoteFolderId, (progress) => {
        setUploadedFiles(progress.uploadedFiles)
        setUploadProgress((progress.uploadedFiles / progress.totalFiles) * 100)
      })

      // 5. Create sync configuration
      console.log('⚙️ Creating sync configuration')
      await createSyncConfiguration(selectedPath, remoteFolderId)

      toast({
        title: "Sync Initialized",
        description: "Your folder has been synced successfully",
        duration: 3000
      })
    } catch (error: any) {
      console.error('Sync initialization failed:', error)
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to initialize sync",
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
          <Steps currentStep={1}>
            <Step 
              value={1} 
              title="Choose FL Studio Folder" 
              canProceedToNext={selectedPath !== null}
              currentStep={1}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Step 1: Choose FL Studio Project Folder</span>
                    {selectedPath && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedPath(null)}
                      >
                        Reset
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Select the folder where your FL Studio projects are stored
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={selectFolder}>
                    <Folder className="mr-2 h-4 w-4" />
                    Choose Folder
                  </Button>
                  {selectedPath && (
                    <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-md">
                      Selected: {selectedPath}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Step>

            <Step 
              value={2} 
              title="Initialize Sync" 
              canProceedToNext={selectedPath !== null}
              currentStep={1}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Initialize Sync Configuration</CardTitle>
                  <CardDescription>
                    Create remote folder and set up sync configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={initializeSync} 
                    disabled={!selectedPath || isInitializing}
                  >
                    {isInitializing ? 'Initializing...' : 'Initialize Sync'}
                  </Button>
                  {selectedPath && (
                    <div className="space-y-2">
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
