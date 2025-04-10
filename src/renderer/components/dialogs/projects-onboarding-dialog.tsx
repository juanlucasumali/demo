import { Dialog, DialogContent } from "@renderer/components/ui/dialog"
import { Button } from "@renderer/components/ui/button"
import onboardingProjectsImage from '@renderer/assets/onboarding-projects.png'
import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@renderer/components/ui/toggle-group"

interface ProjectsOnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectsOnboardingDialog({ open, onOpenChange }: ProjectsOnboardingDialogProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")

  const renderProjects = () => (
    <div 
      className="min-h-[700px] w-full flex flex-col relative overflow-x-auto"
      style={{
        backgroundImage: `url(${onboardingProjectsImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Demo Projects logo in top right */}
      <div className="absolute top-8 right-10 text-right">
        <div className="font-apfel text-7xl leading-none tracking-[-0.1em] text-[#252729]">Demo</div>
        <div className="font-apfel-satt text-4xl tracking-[-0.06em] text-[#6a6a6a]">Projects</div>
      </div>

      {/* Main content area */}
      <div className="absolute right-10 top-72 w-full flex justify-between px-10">
        {/* Main headline text */}
        <div className="w-1/2 text-left">
        </div>

        {/* Bullet points */}
        <div className="w-1/2 text-left">
          <h2 className="font-inter text-2xl font-extrabold text-white leading-tight tracking-tight pb-8">
            For small jobs and huge tasks, projects<br />
            are your go-to for limitless collaboration<br />
            and effortless file management.
          </h2>
          <ul className="space-y-1 text-white font-inter font-extrabold">
            <li className="flex items-start gap-1">
              <span className="text-base">•</span>
              <span className="text-sm">Media within projects use the most recently updated versions.</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-base">•</span>
              <span className="text-sm">Add as many collaborators as you want with real-time file updates.</span>
            </li>
          </ul>

          {/* Frame text and Begin button */}
          <div className="mt-6 text-left">
            <Button 
              variant="default" 
              className="w-1/3 h-10 text-base"
              onClick={() => onOpenChange(false)}
            >
              Begin
            </Button>
          </div>
        </div>
      </div>

      {/* Content Container - Hidden in this design */}
      <div className="hidden">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <ToggleGroup type="single" value={billingCycle} onValueChange={(value) => value && setBillingCycle(value as "monthly" | "yearly")}>
            <ToggleGroupItem value="monthly" className="px-6 py-3 text-white data-[state=on]:bg-white data-[state=on]:text-black">
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="yearly" className="px-6 py-3 text-white data-[state=on]:bg-white data-[state=on]:text-black">
              Yearly
            </ToggleGroupItem>
          </ToggleGroup>
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
        {renderProjects()}
      </DialogContent>
    </Dialog>
  )
} 