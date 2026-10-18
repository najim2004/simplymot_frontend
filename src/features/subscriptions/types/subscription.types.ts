export interface CurrentSubscriptionResponse {
  success: boolean;
  data: CurrentSubscription | null;
}

export interface CurrentSubscription {
  id: string;
  plan_id: string;
  plan?: {
    id?: string;
    name?: string;
  } | null | any;
  status: string;
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string;
  promotion?: {
    code?: string | null;
    stripe_promotion_code_id?: string | null;
    active_until?: string | null;
  } | null;
  trial_information?: {
    days_remaining?: number;
  } | null | any;
  subscription_type?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  description: string;
  price_pence: number;
  currency: string;
  max_bookings_per_month: number;
  max_vehicles: number;
  priority_support: boolean;
  advanced_analytics: boolean;
  custom_branding: boolean;
  stripe_price_id: string;
  price_formatted: string;
  features: string[];
  current_subscription: any | null;
}

export interface GetSubscriptionPlansResponse {
  success: boolean;
  data: {
    plans: SubscriptionPlanItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export type SubscriptionPlan = Plan | SubscriptionPlanItem | any;
