import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// Current subscription response interface
export interface CurrentSubscriptionResponse {
  success: boolean;
  data: CurrentSubscription;
}

// Current subscription interface
export interface CurrentSubscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string;
  promotion?: {
    code?: string | null;
    stripe_promotion_code_id?: string | null;
    active_until?: string | null;
  } | null;
}

// Plan interface
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
}

// check subscription /api/subscription/status
export const subscriptionsMeApi = createApi({
  reducerPath: "subscriptionsMeApi",
  baseQuery,
  tagTypes: ["SubscriptionsMe"],
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
      providesTags: ["SubscriptionsMe"],
      keepUnusedDataFor: 300, // Keep cache for 5 minutes
    }),
    verifySubscriptionSuccess: builder.query<any, { session_id: string }>({
      query: ({ session_id }) => ({
        url: "/api/garage-dashboard/subscription/success",
        params: { session_id },
      }),
      providesTags: ["SubscriptionsMe"],
    }),
  }),
});

export const {
  useGetCurrentSubscriptionQuery,
  useVerifySubscriptionSuccessQuery,
} = subscriptionsMeApi;
