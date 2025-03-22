import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as subscriptionService from '@renderer/services/subscription-service'
import { useToast } from '@renderer/hooks/use-toast'
import { useUserStore } from '@renderer/stores/user-store'

export function useSubscription() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const user = useUserStore((state) => state.user)

  // Query for customer match
  const { data: customer, isLoading: isCustomerLoading } = useQuery({
    queryKey: ['customer', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      return subscriptionService.getCustomerMatch()
    },
    enabled: !!user?.id,
    staleTime: Infinity
  })

  // Query for subscription data using refreshSubscription
  const { data: subscription, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ['subscription', customer],
    queryFn: subscriptionService.refreshSubscription,
    enabled: !!customer,
    staleTime: Infinity
  })

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

  const findCustomerMatch = useMutation({
    mutationFn: async () => {
      await subscriptionService.getCustomerMatch()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', user?.id] })
    }
  })
  return {
    // Data
    subscription,
    
    // Actions
    startCheckoutSession: subscribeToPlan.mutate,
    openCustomerPortal: manageSubscription.mutate,
    findCustomerMatch: findCustomerMatch.mutate,
    
    // Loading states
    isLoading: {
      subscription: isCustomerLoading || isSubscriptionLoading,
      subscribing: subscribeToPlan.isPending,
      managing: manageSubscription.isPending
    }
  }
}