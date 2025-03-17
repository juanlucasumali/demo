import { useMutation } from '@tanstack/react-query'
import * as subscriptionService from '@renderer/services/subscription-service'
import { useSubscriptionContext } from '@renderer/context/subscription-context'
import { useToast } from '@renderer/hooks/use-toast'

export function useSubscriptions() {
  const { subscription, isLoading, refreshSubscription } = useSubscriptionContext()
  // const queryClient = useQueryClient()
  const { toast } = useToast()

  // Subscribe to a plan
  const subscribeToPlan = useMutation({
    mutationFn: async (planId: string) => {
      try {
        await subscriptionService.createCheckoutSession(planId)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Subscription Checkout Failed",
          description: error instanceof Error ? error.message : "Failed to start checkout",
        })
        throw error
      }
    },
    onSuccess: () => {
      // We don't immediately refresh as the subscription won't be updated until
      // the user completes the checkout flow in their browser
      toast({
        title: "Checkout Started",
        description: "Please complete the checkout in your browser",
      })
    }
  })

  // Manage subscription
  const manageSubscription = useMutation({
    mutationFn: async () => {
      try {
        await subscriptionService.createPortalSession()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Subscription Portal Failed",
          description: error instanceof Error ? error.message : "Failed to open customer portal",
        })
        throw error
      }
    },
    onSuccess: () => {
      toast({
        title: "Customer Portal Opened",
        description: "Please manage your subscription in your browser",
      })
    }
  })

  // Check if subscription is active
  const isSubscriptionActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  
  // Get current plan ID from subscription
  const currentPlanId = subscription?.plan_id || 'free'

  // Feature matrix defining which features are available in each plan
  // TODO: Move to server side for security reasons
  const FEATURE_MATRIX: Record<string, string[]> = {
    'free': ['basic_storage', 'basic_projects', 'file_sync', 'file_conversion'],
    'price_essentials': ['advanced_storage', 'unlimited_projects', 'ai_filtering', 'share_lists'],
    'price_pro': ['unlimited_storage', 'exclusive_cosmetics', 'file_analytics', 'early_access']
  }
  
  // Check feature access
  const hasFeatureAccess = (featureKey: string) => {
    // Check if subscription is active
    if (!subscription || subscription.status !== 'active' && subscription.status !== 'trialing') return false
    
    // Get features for the user's plan
    const planFeatures = FEATURE_MATRIX[subscription.plan_id] || []
    
    // Check if the requested feature is included in the plan
    return planFeatures.includes(featureKey)
  }

  return {
    // Data
    subscription,
    isSubscriptionActive,
    currentPlanId,
    
    // Feature access
    hasFeatureAccess,
    
    // Actions
    startCheckoutSession: subscribeToPlan.mutate,
    openCustomerPortal: manageSubscription.mutate,
    refreshSubscription,
    
    // Loading states
    isLoading: {
      subscription: isLoading,
      subscribing: subscribeToPlan.isPending,
      managing: manageSubscription.isPending
    }
  }
}