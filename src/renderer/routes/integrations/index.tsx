import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@renderer/components/ui/button'
import { Radio, Link2 } from 'lucide-react'
import { useToast } from '@renderer/hooks/use-toast'
import { useEffect, useState } from 'react'
import { getSyncConfiguration } from '@renderer/services/sync-service'
import { useUserStore } from '@renderer/stores/user-store'
import { SyncType } from '@renderer/types/sync'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { useDialogState } from '@renderer/hooks/use-dialog-state'
import { useOnboardingStore } from '@renderer/stores/onboarding-store'
import { DialogManager } from '@renderer/components/dialog-manager'

export const Route = createFileRoute('/integrations/')({
  component: Integrations,
  loader: () => ({
    breadcrumb: {
      label: 'Integrations',
      id: 'integrations'
    }
  })
})

const integrations = [
  {
    id: 'daw',
    name: 'DAW',
    icon: Radio,
    connected: false,
    available: true
  }
]

export default function Integrations() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [dawConnected, setDawConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const profile = useUserStore((state) => state.profile)
  const dialogState = useDialogState()
  const { 
    hasSeenIntegrationsOnboarding, 
    showIntegrationsOnboardingOnStartup,
    setHasSeenIntegrationsOnboarding 
  } = useOnboardingStore()

  useEffect(() => {
    async function checkExistingConfig() {
      if (!profile) return

      try {
        const config = await getSyncConfiguration(profile.id)
        if (config?.type === SyncType.DAW) {
          setDawConnected(true)
        }
      } catch (error) {
        console.error('Failed to check configuration:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingConfig()
  }, [profile])

  // Open the onboarding dialog after a small delay to prevent flicker
  useEffect(() => {
    // if (showIntegrationsOnboardingOnStartup) {
    if (!hasSeenIntegrationsOnboarding && showIntegrationsOnboardingOnStartup) {
      const timer = setTimeout(() => {
        dialogState.integrationsOnboarding.onOpen()
        setHasSeenIntegrationsOnboarding(true)
      }, 100)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [hasSeenIntegrationsOnboarding, showIntegrationsOnboardingOnStartup])

  const handleIntegrationClick = (integration: typeof integrations[0]) => {
    if (integration.available) {
      navigate({ 
        to: '/integrations/$integrationId', 
        params: { integrationId: integration.id }
      })
    } else {
      toast({
        title: "Coming Soon",
        description: `${integration.name} integration is not yet available.`,
        duration: 3000
      })
    }
  }

  const IntegrationCardSkeleton = () => (
    <div className="group relative flex flex-col items-center p-4 rounded-lg border">
      <div className="relative">
        <Skeleton className="w-32 h-32 rounded-2xl mb-2" />
      </div>
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32" />
    </div>
  )

  return (
    <PageMain>
      <PageHeader
        title="Integrations"
        description="Connect your favorite DAWs and tools"
        icon={Link2}
      />

      <PageContent>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {isLoading ? (
            // Show skeleton cards while loading
            <>
              <IntegrationCardSkeleton />
              <IntegrationCardSkeleton />
              <IntegrationCardSkeleton />
              <IntegrationCardSkeleton />
            </>
          ) : (
            // Show actual integration cards
            integrations.map((integration) => {
              const Icon = integration.icon
              const isConnected = integration.id === 'daw' && dawConnected
              
              return (
                <div
                  key={integration.id}
                  className="group relative flex flex-col items-center p-4 rounded-lg border hover:shadow-md transition-all duration-200 hover:bg-muted/50"
                >
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl mb-2 flex items-center justify-center">
                      <Icon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  </div>

                  <h3 className="font-normal text-sm mb-3 text-center">
                    {integration.name}
                  </h3>

                  {isConnected && (
                    <div className="text-xs text-muted-foreground mb-2">
                      Already configured
                    </div>
                  )}

                  <Button 
                    variant={isConnected ? "secondary" : "outline"}
                    size="sm"
                    className="w-32"
                    onClick={() => handleIntegrationClick(integration)}
                  >
                    {isConnected ? 'Reconfigure' : 'Connect'}
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </PageContent>

      <DialogManager
        {...dialogState}
        isLoading={{ deleteItem: false, updateItem: false }}
      />
    </PageMain>
  )
}
