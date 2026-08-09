import { apiSlice } from "@/lib/api/api-slice";

export interface CurrentSubscriptionResponse {
  success: boolean;
  data: CurrentSubscription;
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

export type SubscriptionPlan = Plan | any;

export const subscriptionsMeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentSubscription: builder.query<CurrentSubscriptionResponse, void>({
      query: () => "/api/subscription/status",
      transformResponse: (response: any) => {
        const sub = response?.data?.subscription;
        if (!sub) {
          return {
            success: true,
            data: null,
          } as any;
        }
        return {
          success: true,
          data: {
            id: sub.id,
            plan_id: sub.plan_id,
            status: sub.status,
            current_period_start:
              sub.current_period_start || new Date().toISOString(),
            current_period_end: sub.current_period_end,
            next_billing_date: sub.current_period_end,
            promotion: null,
          },
        } as any;
      },
      providesTags: ["Subscription"],
      keepUnusedDataFor: 300,
    }),
    verifySubscriptionSuccess: builder.query<any, { session_id: string }>({
      query: ({ session_id }) => ({
        url: "/api/garage-dashboard/subscription/success",
        params: { session_id },
      }),
      providesTags: ["Subscription"],
    }),
    getSubscriptionPlans: builder.query<
      any,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        const params = arg || {};
        const page = params.page || 1;
        const limit = params.limit || 10;
        return {
          url: "/api/subscription/plans",
          params: { page, limit },
        };
      },
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
              current_subscription: p.current_subscription || null,
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
      providesTags: ["Subscription"],
    }),
    checkoutSubscription: builder.mutation<any, { plan_id: string; promo_code?: string }>({
      query: (body) => ({
        url: "/api/subscription",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),
    cancelSubscription: builder.mutation<any, { cancel_type?: "immediate" | "at_period_end"; reason?: string }>({
      query: (body) => ({
        url: "/api/subscription/cancel",
        method: "PATCH",
        body: {
          cancel_immediately: body.cancel_type === "immediate",
          reason: body.reason,
        },
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCurrentSubscriptionQuery,
  useVerifySubscriptionSuccessQuery,
  useGetSubscriptionPlansQuery,
  useCheckoutSubscriptionMutation,
  useCancelSubscriptionMutation,
} = subscriptionsMeApi;

export { subscriptionsMeApi as subscriptionApi };
