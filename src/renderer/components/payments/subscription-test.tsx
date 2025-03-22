import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useSubscription } from "@renderer/hooks/use-subscription"
import { Skeleton } from "../ui/skeleton"

export function SubscriptionTest() {
  const {
    subscription,
    startCheckoutSession,
    openCustomerPortal,
    isLoading,
  } = useSubscription()

  // Plans to test checkout
  const testPlans = [
    { id: 'price_1R1XpUEw6kqX5Y2Bsl9d1SNf', name: 'Essentials' },
    { id: 'price_1R1XqbEw6kqX5Y2BbIq85VhW', name: 'Pro' }
  ]

  const handleTestSubscription = async () => {
    console.log('Test subscription result:', subscription)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Subscription Test</CardTitle>
        <CardDescription>Test your subscription implementation</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Subscription Status */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Subscription Status</h3>
          {isLoading.subscription ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="bg-muted p-4 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Plan:</span>
                <span>{testPlans.find(plan => plan.id === subscription)?.name || "Free"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Test Direct Subscription Call */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Test Subscription Update</h3>
          <Button 
            onClick={handleTestSubscription}
            variant="outline"
          >
            Test Subscription Update
          </Button>
        </div>

        {/* Checkout Test */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Test Checkout</h3>
          <div className="flex flex-wrap gap-2">
            {testPlans.map(plan => (
              <Button 
                key={plan.id}
                onClick={() => startCheckoutSession(plan.id)}
                disabled={isLoading.subscribing || subscription === plan.id}
                variant="outline"
              >
                Subscribe to {plan.name}
              </Button>
            ))}
            <Button
              onClick={() => openCustomerPortal()}
              disabled={isLoading.managing || !subscription}
              variant="outline"
            >
              Manage Existing Subscription
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
      </CardFooter>
    </Card>
  )
}