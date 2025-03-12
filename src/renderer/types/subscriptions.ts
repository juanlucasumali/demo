export type SubscriptionStatus = 
  | 'trialing' 
  | 'active' 
  | 'canceled' 
  | 'incomplete'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_id: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  cancel_at: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
}