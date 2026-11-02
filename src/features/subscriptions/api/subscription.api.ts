import { apiSlice } from "@/lib/api/api-slice";
import {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  CheckoutSubscriptionRequest,
  CheckoutSubscriptionResponse,
  CurrentSubscriptionResponse,
  GetSubscriptionPlanDetailsResponse,
  GetSubscriptionPlansQueryArgs,
  GetSubscriptionPlansResponse,
  VerifySubscriptionSuccessResponse,
  ValidatePromoCodeRequest,
  ValidatePromoCodeResponse,
} from "../types";

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentSubscription: builder.query<CurrentSubscriptionResponse, void>({
      query: () => "/api/subscription/status",
      providesTags: ["Subscription"],
      keepUnusedDataFor: 300,
    }),

    verifySubscriptionSuccess: builder.query<
      VerifySubscriptionSuccessResponse,
      { session_id: string }
    >({
      query: ({ session_id }) => ({
        url: "/api/subscription/success",
        params: { session_id },
      }),
      providesTags: ["Subscription"],
    }),

    getSubscriptionPlans: builder.query<
      GetSubscriptionPlansResponse,
      GetSubscriptionPlansQueryArgs | void
    >({
      query: (params) => ({
        url: "/api/subscription/plans",
        params: params
          ? { page: params.page, limit: params.limit }
          : undefined,
      }),
      providesTags: ["Subscription"],
    }),

    getSubscriptionPlanDetails: builder.query<
      GetSubscriptionPlanDetailsResponse,
      string | void
    >({
      query: (planId) => `/api/subscription/plans/${planId || "current"}`,
      providesTags: ["Subscription"],
    }),

    validatePromoCode: builder.mutation<
      ValidatePromoCodeResponse,
      ValidatePromoCodeRequest
    >({
      query: (body) => ({
        url: "/api/subscription/validate-promo",
        method: "POST",
        body,
      }),
    }),

    checkoutSubscription: builder.mutation<
      CheckoutSubscriptionResponse,
      CheckoutSubscriptionRequest
    >({
      query: (body) => ({
        url: "/api/subscription",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),

    cancelSubscription: builder.mutation<
      CancelSubscriptionResponse,
      CancelSubscriptionRequest
    >({
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
});

export const {
  useGetCurrentSubscriptionQuery,
  useVerifySubscriptionSuccessQuery,
  useGetSubscriptionPlansQuery,
  useGetSubscriptionPlanDetailsQuery,
  useValidatePromoCodeMutation,
  useCheckoutSubscriptionMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;

export { subscriptionApi as subscriptionsMeApi };
