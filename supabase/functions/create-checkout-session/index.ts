import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import Stripe from 'https://esm.sh/stripe@17.7.0'
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-02-24.acacia',
})

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'apikey, X-Client-Info, Authorization',
        },
      })
    }

    const { userId, priceId } = await req.json()

    let customerId
    const { data: customerIdMatch, error } = await supabase.rpc('get_customer_match', { p_user_id: userId })
    if (!customerIdMatch) {
      const customer = await stripe.customers.create({
        metadata: { supabase_user_id: userId }
      })
      customerId = customer.id
      console.log('New customer ID:', customerId)
    } else {
      customerId = customerIdMatch
      console.log('Existing customer ID:', customerId)
    }

    // Check for existing subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    })

    let session
    if (subscriptions.data.length > 0) {
      // Customer has an active subscription, handle upgrade/downgrade
      const subscription = subscriptions.data[0]
      const subscriptionItem = subscription.items.data[0]

      // Update the existing subscription
      await stripe.subscriptions.update(subscription.id, {
        items: [{
          id: subscriptionItem.id,
          price: priceId,
        }],
        proration_behavior: 'always_invoice', // This will prorate the change
      })

      // Create a portal session for the customer to review changes
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${Deno.env.get('APP_DOMAIN')}/success`,
      })

      return new Response(JSON.stringify({ sessionUrl: portalSession.url }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    } else {
      // No active subscription, create a new checkout session
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${Deno.env.get('APP_DOMAIN')}/success`,
        cancel_url: `${Deno.env.get('APP_DOMAIN')}/cancel`,
      })

      return new Response(JSON.stringify({ sessionUrl: session.url }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
})