import { supabase } from '@renderer/lib/supabase'

// Start a Stripe Checkout session (for creating new subscriptions)
// Find the priceId from the pricing table for each subscription in the Stripe Dashboard (also in the Notion)
export async function createCheckoutSession(priceId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Call the Edge Function (see supabase/functions/manage-subscriptions/index.ts)
  // The function in that index file was deployed to supabase server using the supabase CLI
  const { error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      userId: user.id,
      priceId: priceId
    },
    method: 'POST',
  })

  if (error) throw error
}

// Start a Stripe Customer Portal session (for managing existing subscriptions)
export async function createPortalSession() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Call the Edge Function (see supabase/functions/manage-subscriptions/index.ts)
  // The function in that index file was deployed to supabase server using the supabase CLI
  const { error } = await supabase.functions.invoke('create-portal-session', {
    body: {
      userId: user.id
    },
    method: 'POST',
  })

  if (error) throw error
}