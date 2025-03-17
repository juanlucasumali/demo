import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import Stripe from 'https://esm.sh/stripe@17.7.0'

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Domain for success/cancel URLs
const APP_DOMAIN = Deno.env.get('APP_DOMAIN') || 'http://localhost:3000'

serve(async (req, res) => {
  const { url, method } = req
  const path = new URL(url).pathname

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    // Create checkout session endpoint
    if (path === '/create-checkout-session' && method === 'POST') {
      const { userId, planId } = await req.json()
      
      if (!userId || !planId) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }

      // Get user from Supabase
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
      if (userError || !userData.user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }

      // Get or create Stripe customer
      let customerId
      const { data: customerData } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      if (customerData?.stripe_customer_id) {
        customerId = customerData.stripe_customer_id
      } else {
        // Create a new customer in Stripe
        const customer = await stripe.customers.create({
          email: userData.user.email,
          metadata: { supabase_user_id: userId }
        })
        customerId = customer.id
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        billing_address_collection: 'auto',
        line_items: [
          {
            price: planId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${APP_DOMAIN}/settings/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_DOMAIN}/settings/subscription?canceled=true`,
        metadata: {
          userId
        }
      })

      res.redirect(303, session.url);

      return new Response(
        JSON.stringify({ sessionId: session.id, url: session.url }),
        { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    // Create portal session endpoint
    if (path === '/create-portal-session' && method === 'POST') {
      const { userId } = await req.json()
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId parameter' }),
          { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }

      // Get customer ID from database
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      if (subscriptionError || !subscription?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ error: 'No subscription found for this user' }),
          { status: 404, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }

      // Create portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${APP_DOMAIN}/settings/subscription`,
      })

      res.redirect(303, portalSession.url);

      return new Response(
        JSON.stringify({ url: portalSession.url }),
        { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    // Add error handling here
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  }
})