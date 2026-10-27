export interface SubscriptionPlanItem {
  id: string;
  name: string;
  description: string | null;
  price_pence: number;
  currency: string;
  price_formatted: string;
  period_type?: string;
  trial_period_days?: number | null;
  is_checkout_ready?: boolean;
  is_current_plan?: boolean;
  has_subscription?: boolean;
}

export type SubscriptionPlan = SubscriptionPlanItem;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface GetSubscriptionPlansResponse {
  statusCode?: number;
  success: boolean;
  message?: string;
  data: SubscriptionPlanItem[];
  meta_data?: PaginationMeta;
}

export interface GetSubscriptionPlansQueryArgs {
  page?: number;
  limit?: number;
}

export interface CurrentSubscriptionBilling {
  current_period_start?: string;
  current_period_end?: string;
  next_billing_date?: string;
}

export interface CurrentSubscriptionTrial {
  is_active?: boolean;
  is_trial?: boolean;
  status?: string;
  days_remaining?: number;
  trial_end?: string | null;
}

export interface CurrentSubscriptionCancellation {
  is_cancelled?: boolean;
  is_scheduled_for_cancellation?: boolean;
  cancelled_at?: string | null;
  cancellation_date?: string | null;
  effective_end_date?: string | null;
  days_until_cancellation?: number;
  cancel_at_period_end?: boolean;
  will_cancel_at_period_end?: boolean;
  reason?: string | null;
}

export interface CurrentSubscriptionPromotion {
  code?: string | null;
  stripe_promotion_code_id?: string | null;
  active_until?: string | null;
}

export interface CurrentSubscriptionPlan {
  id?: string;
  name?: string;
  price_pence?: number;
  currency?: string;
  price_formatted?: string;
}

export interface CurrentSubscriptionStatusDetails {
  has_access?: boolean;
  will_renew?: boolean;
  cancellation_scheduled?: boolean;
  cancellation_date?: string | null;
  access_until?: string | null;
  days_remaining?: number;
}

export interface CurrentSubscription {
  id: string;
  status: string;
  plan_id?: string;
  plan_name?: string;
  plan?: CurrentSubscriptionPlan | null;
  price_pence?: number;
  currency?: string;
  price_formatted?: string;
  has_access?: boolean;
  current_period_start?: string;
  current_period_end?: string;
  next_billing_date?: string;
  cancel_at_period_end?: boolean;
  billing?: CurrentSubscriptionBilling;
  status_details?: CurrentSubscriptionStatusDetails;
  status_explanation?: string;
  trial?: CurrentSubscriptionTrial | null;
  trial_information?: CurrentSubscriptionTrial | null;
  cancellation?: CurrentSubscriptionCancellation | null;
  cancellation_information?: CurrentSubscriptionCancellation | null;
  promotion?: CurrentSubscriptionPromotion | null;
  stripe_subscription_id?: string | null;
  subscription_type?: string;
}

export interface SubscriptionStatusSummary {
  id: string;
  status: string;
  plan_id: string;
  plan_name: string;
  price_pence: number;
  currency: string;
  price_formatted: string;
  has_access: boolean;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface SubscriptionStatusData {
  has_subscription: boolean;
  subscription: SubscriptionStatusSummary | null;
}

export interface CurrentSubscriptionResponse {
  statusCode?: number;
  success: boolean;
  message?: string;
  data: SubscriptionStatusData;
}

export interface PlanDetailsData {
  plan: SubscriptionPlanItem;
  subscription: CurrentSubscription | null;
  is_current_plan: boolean;
  has_subscription: boolean;
}

export interface GetSubscriptionPlanDetailsResponse {
  statusCode?: number;
  success: boolean;
  message?: string;
  data: PlanDetailsData;
}

export interface SubscriptionCheckoutData {
  checkout_url: string;
  session_id: string;
  subscription_id: string;
}

export interface CheckoutSubscriptionResponse {
  statusCode?: number;
  success: boolean;
  message?: string;
  data: SubscriptionCheckoutData;
}

export interface CheckoutSubscriptionRequest {
  plan_id: string;
  promo_code?: string;
}

export interface CancelSubscriptionData {
  subscription: CurrentSubscription;
  effective_date: string;
  cancelled_immediately: boolean;
}

export interface CancelSubscriptionResponse {
  statusCode?: number;
  success: boolean;
  message?: string;
  data: CancelSubscriptionData;
}

export interface CancelSubscriptionRequest {
  cancel_type?: "immediate" | "at_period_end";
  reason?: string;
}

export interface VerifySubscriptionSuccessData {
  session_id: string;
  subscription: CurrentSubscription;
}

export interface VerifySubscriptionSuccessResponse {
  statusCode?: number;
  success: boolean;
  message?: string;
  data: VerifySubscriptionSuccessData;
}
