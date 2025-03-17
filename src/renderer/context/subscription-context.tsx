import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './auth-context'

export interface Subscription {
  id: string
  status: string
  plan_id: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export interface SubscriptionContextType {
  subscription: Subscription | null
  isLoading: boolean
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// TODO: Add customer_id to the user table
export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', user.customer_id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error)
      }

      setSubscription(data)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscription()
    } else {
      setSubscription(null)
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.id])

  // Listen for subscription changes
  useEffect(() => {
    if (!user?.customer_id) return

    const channel = supabase
      .channel(`subscription-${user.customer_id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `id=eq.${user.customer_id}`,
      }, () => {
        fetchSubscription()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.customer_id])

  const value = {
    subscription,
    isLoading,
    refreshSubscription: fetchSubscription
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider')
  }
  return context
}