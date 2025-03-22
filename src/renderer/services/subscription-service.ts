import { supabase } from '@renderer/lib/supabase'

// Start a Stripe Checkout session (for creating new subscriptions)
// Find the priceId from the pricing table for each subscription in the Stripe Dashboard (also in the Notion)
export async function createCheckoutSession(priceId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Call corresponding edge function in supabase/functions
  const { error, data } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      userId: user.id,
      priceId: priceId
    },
    method: 'POST',
  })

  window.api.openExternalUrl(data.sessionUrl);

  if (error) {
    console.log('Function returned an error', error)
  }
}

// Start a Stripe Customer Portal session (for managing existing subscriptions)
export async function createPortalSession() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Call corresponding edge function in supabase/functions
  const { error, data } = await supabase.functions.invoke('create-portal-session', {
    body: {
      userId: user.id
    },
    method: 'POST',
  })

  window.api.openExternalUrl(data.sessionUrl);

  if (error) {
    console.log('Function returned an error', error)
  }
}

// Gets the Stripe customer object from the database
export async function getCustomerMatch(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .rpc('get_customer_match', {
      p_user_id: user.id
    })
  
  console.log('Customer data:', data)

  if (error) {
    console.error('❌ Error fetching Stripe customer:', error)
    throw error
  }

  return data
} 

// Gets the Stripe subscription object from the database
export async function getSubscription(customerId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_subscription', {
    customer_id: customerId
  })
  console.log('Subscription data:', data)

  if (error) {
    console.error('❌ Error fetching Stripe subscription:', error)
    throw error
  }

  return data
}

// Refreshes subscription data for a customer
export async function refreshSubscription(): Promise<string | null> {
  const customer = await getCustomerMatch()
  if (!customer) return null
  
  return await getSubscription(customer)
}