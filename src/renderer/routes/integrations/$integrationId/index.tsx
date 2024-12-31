import { createFileRoute, useParams } from '@tanstack/react-router'
import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { Radio, Folder, FolderSync, Download, Upload } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert'
import { Progress } from '@renderer/components/ui/progress'
import { useState } from 'react'

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

  // Mock function to simulate folder selection
  const handleSelectFolder = () => {
    // In real implementation, this would open a folder picker
    console.log('Selecting folder...')
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
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Choose FL Studio Project Folder</CardTitle>
              <CardDescription>
                Select the folder where your FL Studio projects are stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleSelectFolder}>
                <Folder className="mr-2 h-4 w-4" />
                Choose Folder
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Choose Demo Location</CardTitle>
              <CardDescription>
                Select where you want your FL Studio projects to appear in Demo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleSelectFolder}>
                <FolderSync className="mr-2 h-4 w-4" />
                Select Demo Folder
              </Button>
            </CardContent>
          </Card>

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
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Start Sync'}
              </Button>
              {isSyncing && (
                <Progress value={syncProgress} className="w-full" />
              )}
            </CardContent>
          </Card>

          <Alert>
            <Upload className="h-4 w-4" />
            <AlertTitle>Two-Way Sync Enabled</AlertTitle>
            <AlertDescription>
              Once set up, any changes made in either location will automatically sync:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Files added to your FL Studio folder appear in Demo</li>
                <li>Files uploaded to Demo appear in your FL Studio folder</li>
                <li>Background sync runs while Demo is open</li>
              </ul>
            </AlertDescription>
          </Alert>

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
    </PageMain>
  )
}
