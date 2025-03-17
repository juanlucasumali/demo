import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useSubscriptions } from "@renderer/hooks/use-subscription"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"

export function SubscriptionTest() {
  const {
    subscription,
    isSubscriptionActive,
    currentPlanId,
    hasFeatureAccess,
    startCheckoutSession,
    openCustomerPortal,
    refreshSubscription,
    isLoading
  } = useSubscriptions()

  // Test features to check access for
  const testFeatures = [
    'basic_storage',
    'advanced_storage',
    'unlimited_storage',
    'basic_projects',
    'unlimited_projects',
    'file_sync',
    'file_conversion',
    'ai_filtering',
    'share_lists',
    'exclusive_cosmetics',
    'file_analytics',
    'early_access'
  ]

  // Plans to test checkout
  const testPlans = [
    { id: 'price_essentials', name: 'Essentials' },
    { id: 'price_pro', name: 'Pro' }
  ]

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
                <span className="font-medium">Status:</span>
                <Badge variant={isSubscriptionActive ? "default" : "destructive"}>
                  {subscription?.status || "No subscription"}
                </Badge>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Plan:</span>
                <span>{currentPlanId}</span>
              </div>
              {subscription && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Expires:</span>
                  <span>
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature Access */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Feature Access</h3>
          <div className="grid grid-cols-2 gap-2">
            {testFeatures.map(feature => (
              <div 
                key={feature}
                className={`p-2 rounded-md border ${
                  hasFeatureAccess(feature) 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                    : 'border-red-500 bg-red-50 dark:bg-red-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{feature}</span>
                  <Badge variant={hasFeatureAccess(feature) ? "default" : "destructive"}>
                    {hasFeatureAccess(feature) ? "Access" : "No Access"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Test */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Test Checkout</h3>
          <div className="flex flex-wrap gap-2">
            {testPlans.map(plan => (
              <Button 
                key={plan.id}
                onClick={() => startCheckoutSession(plan.id)}
                disabled={isLoading.subscribing}
                variant="outline"
              >
                Subscribe to {plan.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          onClick={() => refreshSubscription()}
          variant="outline"
          disabled={isLoading.subscription}
        >
          Refresh Subscription
        </Button>
        
        <Button 
          onClick={() => openCustomerPortal()}
          disabled={isLoading.managing || !subscription}
        >
          Manage Subscription
        </Button>
      </CardFooter>
    </Card>
  )
}