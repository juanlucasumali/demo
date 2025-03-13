import { supabase } from '@renderer/lib/supabase'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.RENDERER_VITE_STRIPE_PUBLISHABLE_KEY)

// Get the current user's subscription
export async function getCurrentSubscription() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching subscription:', error)
    throw error
  }

  return data
}

export async function createCheckoutSession(planId: string) {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Call the Edge Function
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      userId: user.id,
      planId: planId
    },
    method: 'POST',
  })

  if (error) throw error
  
  // Redirect to Stripe Checkout
  if (data.url) {
    window.location.href = data.url
  }
}

export async function createPortalSession() {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Call the Edge Function
  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: {
      userId: user.id
    },
    method: 'POST',
  })

  if (error) throw error
  
  // Redirect to Stripe Customer Portal
  if (data.url) {
    window.location.href = data.url
  }
}

// Check if user has access to a specific feature based on their plan
export async function hasFeatureAccess(featureKey: string): Promise<boolean> {
  const subscription = await getCurrentSubscription()
  
  // If no subscription, user is on free plan
  if (!subscription) {
    // Check if feature is available on free plan
    return isFeatureInPlan('free', featureKey)
  }
  
  // Check if subscription is active
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false
  }
  
  return isFeatureInPlan(subscription.plan_id, featureKey)
}

// Helper function to check if a feature is available in a plan
function isFeatureInPlan(planId: string, featureKey: string): boolean {
  // Implement your feature access logic here
  // This is a simplified example
  const featureMatrix: Record<string, string[]> = {
    'free': ['basic_storage', 'basic_projects', 'file_sync', 'file_conversion'],
    'price_essentials': ['advanced_storage', 'unlimited_projects', 'ai_filtering', 'share_lists'],
    'price_pro': ['unlimited_storage', 'exclusive_cosmetics', 'file_analytics', 'early_access']
  }
  
  const planFeatures = featureMatrix[planId] || []
  return planFeatures.includes(featureKey)
}