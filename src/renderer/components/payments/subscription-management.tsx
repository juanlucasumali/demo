import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { CreditCard, Settings } from 'lucide-react'
import { useSubscription } from '@renderer/hooks/use-subscription'
import { format } from 'date-fns'
import { createCheckoutSession, createPortalSession } from '@renderer/services/subscription-service'

export function SubscriptionManagement() {
  const { 
    subscription, 
    isLoadingSubscription,
    isSubscriptionActive
  } = useSubscription()

  const handleCheckout = async (planId: string = 'price_essentials') => {
    try {
      await createCheckoutSession(planId)
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  const handlePortal = async () => {
    try {
      await createPortalSession()
    } catch (error) {
      console.error('Error creating portal session:', error)
    }
  }

  if (isLoadingSubscription) {
    return <div className="flex justify-center p-4">Loading...</div>
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
          <Button 
            onClick={() => handleCheckout()}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Upgrade Now
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
        <CardTitle>Current Subscription</CardTitle>
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
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 w-full">
        <Button 
          variant="outline" 
          onClick={() => handleCheckout()}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Change Plan
        </Button>
        <Button 
          onClick={() => handlePortal()}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Manage Subscription
        </Button>
      </CardFooter>
    </Card>
  )
}