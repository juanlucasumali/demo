import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import { Check, X } from 'lucide-react'
import { useSubscription } from '@renderer/hooks/use-subscription'
import { format } from 'date-fns'
import { useState } from 'react'

export function SubscriptionManagement() {
  const [showPricing, setShowPricing] = useState(false)
  const { 
    subscription, 
    isLoadingSubscription,
    isLoadingPlans,
    currentPlan,
    plans,
    manageSubscription,
    subscribeToPlan,
    isSubscriptionActive
  } = useSubscription()

  if (isLoadingSubscription || isLoadingPlans) {
    return <div className="flex justify-center p-4">Loading...</div>
  }

  if (showPricing) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={() => setShowPricing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">
            Select the plan that best fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id
            const isFree = plan.id === 'free'

            return (
              <Card key={plan.id} className={isCurrentPlan ? 'border-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrentPlan && <Badge>Current Plan</Badge>}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    {!isFree && <span className="text-muted-foreground">/month</span>}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    disabled={isCurrentPlan}
                    onClick={() => subscribeToPlan(plan.id)}
                  >
                    {isCurrentPlan ? 'Current Plan' : isFree ? 'Get Started' : 'Subscribe'}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Subscription status view
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Free Plan</CardTitle>
          <CardDescription>You are currently on the free plan</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Upgrade to access premium features.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setShowPricing(true)}>
            View Plans
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const periodEnd = new Date(subscription.current_period_end)
  const formattedPeriodEnd = format(periodEnd, 'MMMM d, yyyy')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentPlan?.name || 'Current Subscription'}</CardTitle>
        <CardDescription>
          {isSubscriptionActive 
            ? `Your subscription is active until ${formattedPeriodEnd}`
            : 'Your subscription is inactive'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Plan Details</p>
            <p className="text-muted-foreground">
              ${subscription.price}/month
            </p>
          </div>
          {currentPlan && (
            <div>
              <p className="font-medium">Features</p>
              <ul className="space-y-2 mt-2">
                {currentPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setShowPricing(true)}>
          Change Plan
        </Button>
        <Button onClick={() => manageSubscription()}>
          Manage Subscription
        </Button>
      </CardFooter>
    </Card>
  )
}