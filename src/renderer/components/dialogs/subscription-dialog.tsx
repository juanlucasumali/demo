import { Dialog, DialogContent } from "@renderer/components/ui/dialog"
import { Button } from "@renderer/components/ui/button"
import { Check } from "lucide-react"
import demoSubscriptionsScreen from '@renderer/assets/demo-subscriptions-screen.png'
import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@renderer/components/ui/toggle-group"
import { cn } from "@renderer/lib/utils"

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  name: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  isPopular?: boolean
  isCurrent?: boolean
}

const plans: Plan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isCurrent: true,
    features: [
      { text: "10GB storage", included: true },
      { text: "Up to 3 projects", included: true },
      { text: "Access to all integrations", included: true },
      { text: "Collaboration tools", included: true },
    ]
  },
  {
    name: "Essentials",
    monthlyPrice: 10,
    yearlyPrice: 8,
    features: [
      { text: "5TB storage", included: true },
      { text: "Unlimited projects", included: true },
      { text: "AI-driven filtering system", included: true },
      { text: "Advanced collaboration", included: true },
    ]
  },
  {
    name: "Pro",
    monthlyPrice: 15,
    yearlyPrice: 12,
    isPopular: true,
    features: [
      { text: "Unlimited storage", included: true },
      { text: "File analytics", included: true },
      { text: "PDF eSignatures", included: true },
      { text: "AI media analysis", included: true },
    ]
  },
  {
    name: "Teams",
    monthlyPrice: -1, // Contact for pricing
    yearlyPrice: -1, // Contact for pricing
    features: [
      { text: "Administrative management", included: true },
      { text: "Customizable showcases", included: true },
      { text: "Community spaces", included: true },
      { text: "Feedback center", included: true },
    ]
  }
]

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden" showCloseButton={false}>
        <div 
          className="min-h-[700px] w-full flex flex-col relative overflow-x-auto"
          style={{
            backgroundImage: `url(${demoSubscriptionsScreen})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Add spacing for the Demo Subscriptions title */}
          <div className="h-44" />

          {/* Content Container */}
          <div className="flex flex-col px-12 pb-12 min-w-[900px]">
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

            {/* Pricing Cards */}
            <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto w-full">
              {plans.map((plan) => (
                <div 
                  key={plan.name}
                  className={cn(
                    "bg-white/10 backdrop-blur-sm rounded-lg p-5 relative",
                    plan.isPopular && "border-2 border-white"
                  )}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-xs">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    {plan.monthlyPrice === -1 ? (
                      <div className="text-white">
                        <div className="text-xl font-bold">Contact for pricing</div>
                        <div className="text-xs text-white/80">For studios, agencies, and institutions</div>
                      </div>
                    ) : (
                      <div className="text-white">
                        <span className="text-2xl font-bold">
                          ${billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                        </span>
                        <span className="text-xs text-white/80 block">per user/month, billed {billingCycle}</span>
                      </div>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-white gap-2">
                        <Check className="h-3 w-3 mt-1 flex-shrink-0" />
                        <span className="text-xs">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.isCurrent ? "outline" : "default"}
                    size="sm"
                    className={cn(
                      "w-full text-sm",
                      plan.isCurrent && "bg-white/10 text-white hover:bg-white/20 border-white/20"
                    )}
                    disabled={plan.isCurrent}
                  >
                    {plan.isCurrent ? "Current plan" : plan.monthlyPrice === -1 ? "Contact us" : "Get Started"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 