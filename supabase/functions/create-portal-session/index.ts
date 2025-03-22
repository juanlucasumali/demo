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

    const { userId } = await req.json()
    console.log('User ID:', userId)

    const { data: customerId, error } = await supabase.rpc('get_customer_match', { p_user_id: userId })
    console.log('Customer ID:', customerId)

    if (!customerId) {
      console.log('No customer found for user:', userId)
      return new Response(JSON.stringify({ error: 'Customer not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
    
    console.log('Creating portal session for customer:', customerId)
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${Deno.env.get('APP_DOMAIN')}/success`,
    })
    console.log('Portal session created:', session)

    return new Response(JSON.stringify({ sessionUrl: session.url }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Detailed error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
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