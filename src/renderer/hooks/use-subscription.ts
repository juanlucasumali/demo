import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getCurrentSubscription, 
  createCheckoutSession, 
  createPortalSession,
  getSubscriptionPlans
} from '@renderer/services/subscription-service'
import { Subscription, SubscriptionPlan } from '@renderer/types/subscriptions'
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

  // Get available plans
  const { 
    data: plans = [], 
    isLoading: isLoadingPlans 
  } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getSubscriptionPlans,
  })

  // Subscribe to a plan
  const subscribeToPlan = useMutation({
    mutationFn: (planId: string) => createCheckoutSession(planId),
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Subscription Error",
        description: error instanceof Error ? error.message : "Failed to create subscription",
      })
    }
  })

  // Manage subscription
  const manageSubscription = useMutation({
    mutationFn: createPortalSession,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Portal Error",
        description: error instanceof Error ? error.message : "Failed to open subscription portal",
      })
    }
  })

  // Get current plan details
  const currentPlan = subscription 
    ? plans.find(plan => plan.id === subscription.plan_id) || plans[0] 
    : plans[0]

  // Check if subscription is active
  const isSubscriptionActive = subscription?.status === 'active' || subscription?.status === 'trialing'

  return {
    subscription,
    isLoadingSubscription,
    subscriptionError,
    plans,
    isLoadingPlans,
    currentPlan,
    isSubscriptionActive,
    subscribeToPlan: subscribeToPlan.mutate,
    isSubscribing: subscribeToPlan.isPending,
    manageSubscription: manageSubscription.mutate,
    isManaging: manageSubscription.isPending,
  }
}