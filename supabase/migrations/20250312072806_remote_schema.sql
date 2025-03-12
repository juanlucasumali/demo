create extension if not exists "wrappers" with schema "extensions";

create schema if not exists "stripe";

-- Create subscription related tables
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');

create foreign table stripe.subscriptions (
  id text,
  customer text,
  currency text,
  current_period_start timestamp,
  current_period_end timestamp,
  attrs jsonb
)
  server stripe_server
  options (
    object 'subscriptions',
    rowid_column 'id'
  );

create foreign table if not exists stripe.products (
  id text,
  name text,
  active bool,
  default_price text,
  description text,
  created timestamp,
  updated timestamp,
  attrs jsonb
)
  server stripe_server
  options (
    object 'products',
    rowid_column 'id'
  );


-- Create RLS policies
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can view their own subscriptions"
--   ON subscriptions
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own subscriptions"
--   ON subscriptions
--   FOR UPDATE
--   USING (auth.uid() = user_id);


-- Add function to check subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_plan(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_id text;
BEGIN
  SELECT s.plan_id INTO plan_id
  FROM subscriptions s
  WHERE s.user_id = get_subscription_plan.user_id
  AND (s.status = 'active' OR s.status = 'trialing')
  LIMIT 1;
  
  RETURN COALESCE(plan_id, 'free');
END;
$$;

-- Add function to check if user has access to a feature
CREATE OR REPLACE FUNCTION public.has_feature_access(user_id uuid, feature_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan text;
BEGIN
  -- Get the user's current plan
  user_plan := public.get_subscription_plan(user_id);
  
  -- Define feature access based on plans
  -- This is a simplified example
END;
$$; 