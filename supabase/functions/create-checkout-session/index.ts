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
      console.log('Old customer ID:', customerId)
    }
    
    const session = await stripe.checkout.sessions.create({
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