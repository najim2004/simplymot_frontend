import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

// Types for subscription plans
export interface SubscriptionPlan {
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
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PlansResponse {
  success: boolean;
  data: {
    plans: SubscriptionPlan[];
    pagination: Pagination;
  };
}

export interface CurrentSubscription {
  id: string;
  plan_id: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "CANCELLED";
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string;
  can_cancel: boolean;
  created_at: string;
  subscription_type: string;
  trial_information?: {
    is_trial: boolean;
    trial_end: string;
    days_remaining: number;
    is_trial_active: boolean;
    trial_status: string;
  };
  cancellation_information?: any;
  visibility: {
    is_visible_to_drivers: boolean;
    visible_until: string | null;
  };
  promotion?: {
    code?: string | null;
    stripe_promotion_code_id?: string | null;
    active_until?: string | null;
    percent_off?: number;
    duration?: string;
    duration_days?: number | null;
    duration_in_months?: number | null;
  } | null;
  plan: SubscriptionPlan;
}

export interface CurrentSubscriptionResponse {
  success: boolean;
  data: CurrentSubscription;
}

export interface CheckoutRequest {
  plan_id: string;
  promo_code?: string;
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    checkout_url: string;
  };
}

export interface CancelRequest {
  cancel_type: "immediate" | "at_period_end";
  reason?: string;
}

export interface CancelResponse {
  success: boolean;
  message?: string;
  effective_date?: string;
  cancelled_immediately?: boolean;
}

export interface ApplyPromoRequest {
  promo_code: string;
}

export interface ApplyPromoResponse {
  success: boolean;
  message: string;
  data: {
    subscription_id: string;
    status: string;
    promotion?: CurrentSubscription["promotion"];
  };
}

// Subscription API endpoints
export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery,
  tagTypes: ["Subscription", "Plan", "SubscriptionsMe"],
  endpoints: (builder) => ({
    // Get subscription plans
    getSubscriptionPlans: builder.query<
      PlansResponse,
      { page?: number; limit?: number }
    >({
      query: ({
        page = PAGINATION_CONFIG.DEFAULT_PAGE,
        limit = PAGINATION_CONFIG.DEFAULT_LIMIT,
      }) => ({
        url: "/api/subscription/plans",
        params: { page, limit },
      }),
      transformResponse: (response: any) => {
        const plans = response?.data || [];
        const total = response?.meta_data?.total || 0;
        const page = response?.meta_data?.page || 1;
        const limit = response?.meta_data?.limit || 10;
        const totalPages = Math.ceil(total / limit) || 1;

        return {
          success: true,
          data: {
            plans: plans.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description || "",
              price_pence: p.price_pence || 0,
              currency: p.currency || "GBP",
              max_bookings_per_month: p.max_bookings_per_month || 0,
              max_vehicles: p.max_vehicles || 0,
              priority_support: p.priority_support || false,
              advanced_analytics: p.advanced_analytics || false,
              custom_branding: p.custom_branding || false,
              stripe_price_id: p.stripe_price_id || "",
              price_formatted: p.price_formatted || `£${((p.price_pence || 0) / 100).toFixed(2)}`,
              features: [],
            })),
            pagination: {
              page,
              limit,
              total,
              totalPages,
            },
          },
        };
      },
      providesTags: ["Plan"],
    }),

    // Get current subscription
    getCurrentSubscription: builder.query<CurrentSubscriptionResponse, void>({
      query: () => "/api/subscription/status",
      transformResponse: (response: any) => {
        const sub = response?.data?.subscription;
        if (!sub) {
            return {
                success: true,
                data: null
            } as any;
        }
        return {
          success: true,
          data: {
            id: sub.id,
            plan_id: sub.plan_id,
            status: sub.status,
            current_period_start: sub.current_period_start || new Date().toISOString(),
            current_period_end: sub.current_period_end,
            next_billing_date: sub.current_period_end,
            can_cancel: !sub.cancel_at_period_end,
            created_at: sub.created_at || new Date().toISOString(),
            subscription_type: "STRIPE",
            visibility: {
              is_visible_to_drivers: !sub.hidden_from_drivers,
              visible_until: null,
            },
            promotion: null,
            plan: {
              id: sub.plan_id,
              name: sub.plan_name || "",
              description: "",
              price_pence: sub.price_pence || 0,
              currency: sub.currency || "GBP",
              max_bookings_per_month: 0,
              max_vehicles: 0,
              priority_support: false,
              advanced_analytics: false,
              custom_branding: false,
              stripe_price_id: "",
              price_formatted: sub.price_formatted || "",
              features: [],
            },
          },
        };
      },
      providesTags: ["Subscription", "SubscriptionsMe"],
      keepUnusedDataFor: 300,
    }),

    // Checkout subscription
    checkoutSubscription: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (body) => ({
        url: "/api/subscription",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subscription", "SubscriptionsMe"],
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation<CancelResponse, CancelRequest>({
      query: (body) => ({
        url: "/api/subscription/cancel",
        method: "PATCH",
        body: {
          cancel_immediately: body.cancel_type === "immediate",
          reason: body.reason,
        },
      }),
      invalidatesTags: ["Subscription", "Plan", "SubscriptionsMe"],
    }),

    applySubscriptionPromo: builder.mutation<
      ApplyPromoResponse,
      ApplyPromoRequest
    >({
      queryFn: async (body) => {
        return {
          data: {
            success: true,
            message: "Promo applied (simulation)",
            data: {
              subscription_id: "mock_sub",
              status: "ACTIVE",
              promotion: null,
            },
          },
        };
      },
      invalidatesTags: ["Subscription", "SubscriptionsMe"],
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetCurrentSubscriptionQuery,
  useCheckoutSubscriptionMutation,
  useCancelSubscriptionMutation,
  useApplySubscriptionPromoMutation,
  util: subscriptionApiUtil,
} = subscriptionApi;
