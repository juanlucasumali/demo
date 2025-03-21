import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'
import Stripe from 'https://esm.sh/stripe@17.7.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
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
    const { data: customerData } = await supabase
      .from('customer_users')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()
    
    console.log('Customer data:', customerData)

    if (!customerData) {
      const customer = await stripe.customers.create({
        metadata: { supabase_user_id: userId }
      })
      customerId = customer.id
      const { data: newCustomerData, error: newCustomerError } = await supabase
        .from('customer_users') 
        .insert({ user_id: userId, stripe_customer_id: customerId })
      console.log('New customer data:', newCustomerData)
    } else {
      customerId = customerData.stripe_customer_id
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