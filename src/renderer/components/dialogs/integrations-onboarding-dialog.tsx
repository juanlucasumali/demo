import { Dialog, DialogContent } from "@renderer/components/ui/dialog"
import { Button } from "@renderer/components/ui/button"
import onboardingIntegrationsImage from '@renderer/assets/onboarding-integrations.png'

interface IntegrationsOnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IntegrationsOnboardingDialog({ open, onOpenChange }: IntegrationsOnboardingDialogProps) {

  const renderIntegrations = () => (
    <div 
      className="min-h-[700px] w-full flex flex-col relative overflow-x-auto"
      style={{
        backgroundImage: `url(${onboardingIntegrationsImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Demo Integrations logo in top right */}
      <div className="absolute top-8 right-10 text-right">
        <div className="font-apfel text-7xl leading-none tracking-[-0.1em] text-[#252729]">Demo</div>
        <div className="font-apfel-satt text-4xl tracking-[-0.06em] text-[#6a6a6a]">Integrations</div>
      </div>

      {/* Main content area */}
      <div className="absolute right-10 top-72 w-full flex justify-between px-10">
        {/* Main headline text */}

        {/* Bullet points */}
        <div className="w-1/2 text-left pl-10">
          <h2 className="font-inter text-2xl font-extrabold text-white leading-tight tracking-tight pb-8">
            Integrate with any creative tools <br />
            that you use
          </h2>

          {/* Frame text and Begin button */}
          <div className="text-left">
            <Button 
              variant="default" 
              className="w-1/3 h-10 text-base"
              onClick={() => onOpenChange(false)}
            >
              Begin
            </Button>
          </div>

          <div className="w-1/2 text-left">
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="p-0 overflow-hidden sm:max-w-[1000px]" 
        showCloseButton={false}
      >
        {renderIntegrations()}
      </DialogContent>
    </Dialog>
  )
} 