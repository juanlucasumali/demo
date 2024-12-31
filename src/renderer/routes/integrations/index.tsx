import { PageHeader } from '@renderer/components/page-layout/page-header'
import { PageContent } from '@renderer/components/page-layout/page-content'
import { PageMain } from '@renderer/components/page-layout/page-main'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@renderer/components/ui/button'
import { Music2, Mic2, Radio, Link2 } from 'lucide-react'
import { useToast } from '@renderer/hooks/use-toast'

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
    id: 'logic-pro',
    name: 'Logic Pro',
    icon: Music2,
    connected: false,
    available: false
  },
  {
    id: 'ableton-live',
    name: 'Ableton Live',
    icon: Mic2,
    connected: false,
    available: false
  },
  {
    id: 'fl-studio',
    name: 'FL Studio',
    icon: Radio,
    connected: false,
    available: true
  }
]

export default function Integrations() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleIntegrationClick = (integration: typeof integrations[0]) => {
    if (integration.available) {
      navigate({ to: '/integrations/$integrationId', params: { integrationId: integration.id }})
    } else {
      toast({
        title: "Coming Soon",
        description: `${integration.name} integration is not yet available.`,
        duration: 3000
      })
    }
  }

  return (
    <PageMain>
      <PageHeader
        title="Integrations"
        description="Connect your favorite DAWs and tools"
        icon={Link2}
      />

      <PageContent>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {integrations.map((integration) => {
            const Icon = integration.icon
            
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

                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-24"
                  onClick={() => handleIntegrationClick(integration)}
                >
                  Connect
                </Button>
              </div>
            )
          })}
        </div>
      </PageContent>
    </PageMain>
  )
}
