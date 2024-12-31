import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Radio, Folder, FolderSync, Upload } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import { Progress } from '@renderer/components/ui/progress'
import { useState } from 'react'
import { SelectFilesDialog } from '@renderer/components/dialogs/select-files'
import { DemoItem } from '@renderer/types/items'
import { useToast } from '@renderer/hooks/use-toast'
import { Steps, Step } from '@renderer/components/ui/steps'

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
  const [isSelectingDemoLocation, setIsSelectingDemoLocation] = useState(false)
  const [selectedDemoLocations, setSelectedDemoLocations] = useState<DemoItem[] | null>(null)
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

  // Mock function to simulate sync
  const startSync = () => {
    setIsSyncing(true)
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSyncing(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleDemoLocationSelect = (locations: DemoItem[]) => {
    setSelectedDemoLocations(locations)
    if (locations.length > 0 || locations.length === 0) { // Only set if explicitly chosen
      toast({
        title: "Location Selected",
        description: locations.length > 0 
          ? `Selected ${locations.length} location(s) in Demo`
          : "Files will be synced to Home",
        duration: 3000
      })
    }
  }

  const canProceedToStep2 = selectedPath !== null
  const canProceedToStep3 = selectedPath !== null && selectedDemoLocations !== null
  
  const handleStepChange = (step: number) => {
    if (step === 2 && !canProceedToStep2) {
      toast({
        title: "Complete Step 1",
        description: "Please select an FL Studio folder first",
        variant: "destructive"
      })
      return
    }
    if (step === 3 && !canProceedToStep3) {
      toast({
        title: "Complete Step 2",
        description: "Please select a Demo location first",
        variant: "destructive"
      })
      return
    }
    setCurrentStep(step)
  }

  const resetStep1 = () => {
    setSelectedPath(null)
    setSelectedDemoLocations(null)
    if (currentStep > 1) {
      setCurrentStep(1)
    }
  }

  const resetStep2 = () => {
    setSelectedDemoLocations(null)
    if (currentStep > 2) {
      setCurrentStep(2)
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
          <Steps value={currentStep} onChange={handleStepChange}>
            <Step value={1} title="Choose FL Studio Folder">
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

            <Step value={2} title="Choose Demo Location">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Step 2: Choose Demo Location</span>
                    {selectedDemoLocations && selectedDemoLocations?.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetStep2}
                      >
                        Reset
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Select where you want your FL Studio projects to appear in Demo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setIsSelectingDemoLocation(true)}
                    disabled={!canProceedToStep2}
                  >
                    <FolderSync className="mr-2 h-4 w-4" />
                    Select Demo Location
                  </Button>
                  {selectedDemoLocations?.length ? (
                    <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-md">
                      Selected {selectedDemoLocations.length} location(s):
                      <ul className="list-disc list-inside mt-1">
                        {selectedDemoLocations.map(location => (
                          <li key={location.id}>{location.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : selectedDemoLocations?.length === 0 ? (
                    <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded-md">
                      Files will be synced to Home
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </Step>

            <Step value={3} title="Start Sync">
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Start Synchronization</CardTitle>
                  <CardDescription>
                    Begin the initial sync between FL Studio and Demo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={startSync} 
                    disabled={!canProceedToStep3 || isSyncing}
                  >
                    {isSyncing ? 'Syncing...' : 'Start Sync'}
                  </Button>
                  {isSyncing && (
                    <Progress value={syncProgress} className="w-full" />
                  )}
                </CardContent>
              </Card>
            </Step>
          </Steps>

          <Card>
            <CardHeader>
              <CardTitle>Download Manager</CardTitle>
              <CardDescription>
                Active downloads and uploads will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                No active transfers
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>

      <SelectFilesDialog
        open={isSelectingDemoLocation}
        onOpenChange={setIsSelectingDemoLocation}
        onConfirm={handleDemoLocationSelect}
        initialSelections={selectedDemoLocations ?? []}
        location="save-items"
      />
    </PageMain>
  )
}
