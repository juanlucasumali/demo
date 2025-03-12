import { supabase } from '@renderer/lib/supabase'
import { loadStripe } from '@stripe/stripe-js'
import { SubscriptionPlan } from '@renderer/types/subscriptions'

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

// Create a checkout session for a new subscription
export async function createCheckoutSession(planId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Call Supabase function to create a checkout session
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { planId, userId: user.id }
  })

  if (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }

  // Redirect to Stripe Checkout
  const stripe = await stripePromise
  if (!stripe) throw new Error('Failed to load Stripe')

  const { error: stripeError } = await stripe.redirectToCheckout({
    sessionId: data.sessionId
  })

  if (stripeError) {
    console.error('Stripe redirect error:', stripeError)
    throw stripeError
  }
}

// Create a portal session for managing existing subscription
export async function createPortalSession() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Call Supabase function to create a portal session
  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: { userId: user.id }
  })

  if (error) {
    console.error('Error creating portal session:', error)
    throw error
  }

  // Redirect to Stripe Customer Portal
  window.location.href = data.url
}

// Get available subscription plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  // This could be fetched from Stripe or stored in your database
  // For simplicity, we'll hardcode the plans here
  return [
    {
      id: 'free',
      name: 'Free',
      description: 'Basic features for personal use',
      price: 0,
      features: [
        '10GB storage',
        'Up to 3 Projects',
        'Seamless file sync',
        'File conversion',
        'Access to all integrations',
        'Collaboration tools'
      ]
    },
    {
      id: 'price_essentials', // This should match your Stripe price ID
      name: 'Essentials',
      description: 'Enhanced features for professionals',
      price: 10,
      features: [
        'Everything in Free',
        '5TB storage',
        'Unlimited Projects',
        'AI-driven filtering system',
        'Share lists',
        'Stem splitter',
        'Advanced collaboration',
        'Customizable showcases'
      ]
    },
    {
      id: 'price_pro', // This should match your Stripe price ID
      name: 'Pro',
      description: 'All features for power users',
      price: 15,
      features: [
        'Everything in Essentials',
        'Unlimited storage',
        'Exclusive cosmetics',
        'File analytics',
        'Early access to updates',
        'Verification badge',
        'Private Discord access',
        'Priority email support',
        'PDF eSignatures',
        'AI audio analysis'
      ]
    }
  ]
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