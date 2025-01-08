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
import { initializeSync } from '@renderer/services/sync-service'

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
  const [currentStep, setCurrentStep] = useState(1)
  const [syncProgress, setSyncProgress] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [syncId, setSyncId] = useState<number | null>(null)
  const { toast } = useToast()

  // Function to handle folder selection
  const handleSelectFolder = async () => {
    try {
      const path = await window.api.selectFolder()
      if (path) {
        setSelectedPath(path)
        setCurrentStep(2) // Automatically move to next step
        toast({
          title: "Folder Selected",
          description: `Selected path: ${path}`,
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
      toast({
        title: "Error",
        description: "Failed to select folder",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  const startSync = async () => {
    if (!selectedPath) return

    setIsSyncing(true)
    setSyncProgress(0)

    try {
      // Initialize sync and create remote folder
      const { syncId, remoteFolderId } = await initializeSync(selectedPath)
      setSyncId(syncId)
      
      // Update progress for folder creation
      setSyncProgress(100)
      
      toast({
        title: "Sync Initialized",
        description: "Remote folder created and sync configured",
        duration: 3000
      })

      // Move to next step or show success state
      setCurrentStep(3)
    } catch (error) {
      console.error('Sync initialization failed:', error)
      toast({
        title: "Sync Failed",
        description: "Failed to initialize sync configuration",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const canProceedToStep2 = selectedPath !== null

  const resetStep1 = () => {
    setSelectedPath(null)
    if (currentStep > 1) {
      setCurrentStep(1)
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
          <Steps>
            <Step value={1} title="Choose FL Studio Folder" canProceedToStep2={canProceedToStep2}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Step 1: Choose FL Studio Project Folder</span>
                    {selectedPath && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetStep1}
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
                  <Button onClick={handleSelectFolder}>
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

            <Step value={2} title="Start Sync" canProceedToStep2={canProceedToStep2}>
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Start Synchronization</CardTitle>
                  <CardDescription>
                    Begin the initial sync between FL Studio and Demo. Files will be synced to Home.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={startSync} 
                    disabled={!canProceedToStep2 || isSyncing}
                  >
                    {isSyncing ? 'Initializing Sync...' : 'Start Sync'}
                  </Button>
                  {isSyncing && (
                    <Progress value={syncProgress} className="w-full" />
                  )}
                  {syncId && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      ✓ Sync configured successfully
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
