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