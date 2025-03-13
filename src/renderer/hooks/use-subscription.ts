import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getCurrentSubscription, 
  createCheckoutSession, 
  createPortalSession,
} from '@renderer/services/subscription-service'
import { useToast } from '@renderer/hooks/use-toast'

export function useSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Get current subscription
  const { 
    data: subscription, 
    isLoading: isLoadingSubscription,
    error: subscriptionError 
  } = useQuery({
    queryKey: ['subscription'],
    queryFn: getCurrentSubscription,
  })

  // Subscribe to a plan
  const subscribeToPlan = useMutation({
    mutationFn: async (planId: string) => {
      try {
        await createCheckoutSession(planId)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Subscription Error",
          description: error instanceof Error ? error.message : "Failed to create subscription",
        })
        throw error
      }
    }
  })

  // Manage subscription
  const manageSubscription = useMutation({
    mutationFn: async () => {
      try {
        await createPortalSession()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Portal Error",
          description: error instanceof Error ? error.message : "Failed to open subscription portal",
        })
        throw error
      }
    }
  })

  // Check if subscription is active
  const isSubscriptionActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  
  // Get current plan ID from subscription
  const currentPlanId = subscription?.plan_id || 'free'

  return {
    subscription,
    isLoadingSubscription,
    subscriptionError,
    isSubscriptionActive,
    currentPlanId,
    startCheckoutSession: subscribeToPlan.mutate,
    isSubscribing: subscribeToPlan.isPending,
    openCustomerPortal: manageSubscription.mutate,
    isManaging: manageSubscription.isPending,
  }
}