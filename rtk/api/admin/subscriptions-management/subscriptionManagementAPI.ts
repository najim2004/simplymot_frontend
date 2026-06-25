import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price_pence: number;
  price_formatted: string;
  currency: string;
  max_bookings_per_month: number;
  max_vehicles: number;
  priority_support: boolean;
  advanced_analytics: boolean;
  custom_branding: boolean;
  is_active: boolean;
  stripe_price_id: string;
  active_subscriptions_count: number;
  created_at: string;
  updated_at: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type SubscriptionPlanResponseData = {
  data: SubscriptionPlan[];
  pagination: Pagination;
};

export type SubscriptionsAPIResponse = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: SubscriptionPlan[];
};

export type TCreateSubscription = {
  name: string;
  price_pence: number;
  max_vehicles: number;
  max_bookings_per_month: number;
  description?: string;
};

export type TUpdateSubscription = Partial<TCreateSubscription> & {
  is_active?: boolean;
  priority_support?: boolean;
  advanced_analytics?: boolean;
  custom_branding?: boolean;
};

// Migration types
export type MigrationStatus = {
  status: string;
  [key: string]: any;
};

export type MigrationSummary = {
  [key: string]: any;
};

export type MigrationStatistics = {
  [key: string]: any;
};

// Job types
export type JobType = "NOTICE" | "MIGRATION";

export type MigrationJob = {
  id: string;
  job_type: JobType;
  status: string;
  [key: string]: any;
};

export type JobsResponse = {
  // backend may return either `jobs` or `data`
  data?: MigrationJob[];
  jobs?: MigrationJob[];
  pagination?: Pagination;
};

export type JobDetails = MigrationJob & {
  [key: string]: any;
};

// Migration request types
export type CreateMigrationPriceRequest = {
  new_price_pence: number;
};

export type SendMigrationNoticesRequest = {
  notice_period_days?: number;
};

export type BulkMigrateRequest = {
  batch_size?: number;
};

// Garage Subscription types
export type GarageSubscription = {
  id: string;
  garage_id: string;
  garage_name: string;
  garage_email: string;
  hidden_from_drivers: boolean;
  plan_id: string;
  plan_name: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "CANCELLED" | "PAST_DUE";
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string | null;
  promotion_code?: string | null;
  stripe_promotion_code_id?: string | null;
  promotion_active_until?: string | null;
  price_pence: number;
  price_formatted: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
};

export type GarageSubscriptionsResponse = {
  data: GarageSubscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GarageSubscriptionsQueryParams = {
  plan_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  created_after?: string;
  created_before?: string;
  include_history?: boolean;
};

export type UpdateSubscriptionAction = {
  action: "ACTIVATE" | "SUSPEND" | "CANCEL" | "REACTIVATE";
};

export type SubscriptionAnalytics = {
  total_active_subscriptions: number;
  total_monthly_revenue_pence: number;
  total_monthly_revenue_formatted: string;
  status_distribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  plan_distribution: Array<{
    plan_name: string;
    count: number;
    percentage: number;
    revenue_pence: number;
  }>;
};

export type SubscriptionHealthSummary = {
  total_subscriptions: number;
  active_subscriptions: number;
  past_due_subscriptions: number;
  suspended_subscriptions: number;
  expiring_soon: number;
  expired_recently: number;
};

export type StatusBreakdown = {
  active: number;
  inactive: number;
  suspended: number;
  cancelled: number;
  past_due: number;
};

export type RevenueTrend = Array<{
  month: string;
  revenue: number;
  subscriptions: number;
}>;

export type PromoCodeDuration = "ONCE" | "REPEATING" | "FOREVER";
export type PromoCodeStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export type SubscriptionPromoCode = {
  id: string;
  code: string;
  name?: string;
  percent_off: number;
  duration: PromoCodeDuration;
  duration_days?: number | null;
  duration_in_months?: number | null;
  max_redemptions?: number | null;
  redeemed_count: number;
  remaining_redemptions?: number | null;
  expires_at?: string | null;
  is_active: boolean;
  status: PromoCodeStatus;
  display_duration: string;
  stripe_coupon_id: string;
  stripe_promotion_code_id: string;
  created_at: string;
  updated_at: string;
};

export type PromoCodesResponse = {
  data: SubscriptionPromoCode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreatePromoCodeRequest = {
  name?: string;
  code?: string;
  prefix?: string;
  percent_off?: number;
  duration: PromoCodeDuration;
  duration_in_months?: number;
  max_redemptions?: number;
  expires_at?: string;
};

export const subscriptionsManagementApi = createApi({
  reducerPath: "allSubscriptionsApi",
  baseQuery,
  tagTypes: ["all-subscriptions", "promo-codes"],
  endpoints: (builder) => ({
    // Get all subscriptions
    getAllSubscriptions: builder.query<
      SubscriptionsAPIResponse,
      { page?: number; limit?: number }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString(),
        );
        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString(),
        );

        return {
          url: `/api/admin/subscription/plans?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["all-subscriptions"],
    }),

    // Get a subscription by ID
    getASubscription: builder.query<SubscriptionPlan, string | undefined>({
      query: (id) => ({
        url: `/api/admin/subscription/plans/${id}`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Create a subscription plan
    createASubscription: builder.mutation<
      SubscriptionPlan,
      Partial<TCreateSubscription>
    >({
      query: (body) => ({
        url: `/api/admin/subscription/plans`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Update a subscription plan
    updateSubscription: builder.mutation<
      SubscriptionPlan,
      { id: string; body: Partial<TUpdateSubscription> }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/subscription/plans/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Delete a subscription plan
    deleteSubscription: builder.mutation<
      { success?: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/api/admin/subscription/plans/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Sync plan to stripe
    syncPlanToStripe: builder.mutation<SubscriptionPlan, string>({
      query: (id) => ({
        url: `/api/admin/subscription/plans/${id}/stripe/sync`,
        method: "POST",
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Migration: Create new price
    createMigrationPrice: builder.mutation<
      { success?: boolean; message?: string; data?: any },
      { id: string; body: CreateMigrationPriceRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/subscription/plans/${id}/migration/price`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Migration: Send notices
    sendMigrationNotices: builder.mutation<
      { success?: boolean; message?: string; data?: any },
      { id: string; body?: SendMigrationNoticesRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/subscription/plans/${id}/migration/notices`,
        method: "POST",
        body: body || {},
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Migration: Bulk migrate
    bulkMigrate: builder.mutation<
      { success?: boolean; message?: string; data?: any },
      { id: string; body?: BulkMigrateRequest }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/subscription/plans/${id}/migration/bulk`,
        method: "POST",
        body: body || {},
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Migration: Get status
    getMigrationStatus: builder.query<MigrationStatus, string>({
      query: (id) => ({
        url: `/api/admin/subscription/plans/${id}/migration/status`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Migration: Get summary
    getMigrationSummary: builder.query<MigrationSummary, string>({
      query: (id) => ({
        url: `/api/admin/subscription/plans/${id}/migration/summary`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Migration: Get statistics
    getMigrationStatistics: builder.query<MigrationStatistics, string>({
      query: (id) => ({
        url: `/api/admin/subscription/plans/${id}/migration/statistics`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Migration Jobs: Get jobs
    getMigrationJobs: builder.query<
      JobsResponse,
      { id: string; job_type?: JobType }
    >({
      query: ({ id, job_type }) => {
        const queryParams = new URLSearchParams();
        if (job_type) {
          queryParams.append("job_type", job_type);
        }
        const queryString = queryParams.toString();
        return {
          url: `/api/admin/subscription/plans/${id}/migration/jobs${
            queryString ? `?${queryString}` : ""
          }`,
          method: "GET",
        };
      },
      providesTags: ["all-subscriptions"],
    }),

    // Migration Jobs: Get job details
    getMigrationJobDetails: builder.query<
      JobDetails,
      { id: string; jobId: string }
    >({
      query: ({ id, jobId }) => ({
        url: `/api/admin/subscription/plans/${id}/migration/jobs/${jobId}`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Migration Jobs: Cancel job
    cancelMigrationJob: builder.mutation<
      { success?: boolean; message?: string },
      { id: string; jobId: string }
    >({
      query: ({ id, jobId }) => ({
        url: `/api/admin/subscription/plans/${id}/migration/jobs/${jobId}`,
        method: "PUT",
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Migration Jobs: Retry job
    retryMigrationJob: builder.mutation<
      { success?: boolean; message?: string; data?: any },
      { id: string; jobId: string }
    >({
      query: ({ id, jobId }) => ({
        url: `/api/admin/subscription/plans/${id}/migration/jobs/${jobId}/retry`,
        method: "POST",
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Garage Subscriptions: Get all subscriptions
    getGarageSubscriptions: builder.query<
      GarageSubscriptionsResponse,
      GarageSubscriptionsQueryParams
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.plan_id) queryParams.append("plan_id", params.plan_id);
        if (params.status) queryParams.append("status", params.status);
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.created_after)
          queryParams.append("created_after", params.created_after);
        if (params.created_before)
          queryParams.append("created_before", params.created_before);
        if (params.include_history)
          queryParams.append(
            "include_history",
            params.include_history.toString(),
          );

        return {
          url: `/api/admin/subscription/garages?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["all-subscriptions"],
    }),

    // Garage Subscriptions: Get subscription details
    getGarageSubscriptionDetails: builder.query<GarageSubscription, string>({
      query: (id) => ({
        url: `/api/admin/subscription/garages/${id}`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Garage Subscriptions: Update subscription
    updateGarageSubscription: builder.mutation<
      GarageSubscription,
      { id: string; body: UpdateSubscriptionAction }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/subscription/garages/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    applyGarageSubscriptionPromo: builder.mutation<
      { success: boolean; message: string; data: GarageSubscription },
      { id: string; promo_code: string }
    >({
      query: ({ id, promo_code }) => ({
        url: `/api/admin/subscription/garages/${id}/apply-promo`,
        method: "POST",
        body: { promo_code },
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    setGarageHiddenFromDrivers: builder.mutation<
      { garage_id: string; hidden_from_drivers: boolean },
      { garageId: string; hidden_from_drivers: boolean }
    >({
      query: ({ garageId, hidden_from_drivers }) => ({
        url: `/api/admin/subscription/garages/garage/${garageId}/hidden-from-drivers`,
        method: "PATCH",
        body: { hidden_from_drivers },
      }),
      invalidatesTags: ["all-subscriptions"],
    }),

    // Garage Subscriptions: Get analytics
    getSubscriptionAnalytics: builder.query<SubscriptionAnalytics, void>({
      query: () => ({
        url: `/api/admin/subscription/garages/analytics`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Garage Subscriptions: Get health summary
    getSubscriptionHealthSummary: builder.query<
      SubscriptionHealthSummary,
      void
    >({
      query: () => ({
        url: `/api/admin/subscription/garages/health`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Garage Subscriptions: Get subscription history
    getSubscriptionHistory: builder.query<GarageSubscription[], string>({
      query: (garageId) => ({
        url: `/api/admin/subscription/garages/${garageId}/history`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Garage Subscriptions: Get status breakdown
    getStatusBreakdown: builder.query<StatusBreakdown, void>({
      query: () => ({
        url: `/api/admin/subscription/garages/analytics/status-breakdown`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    // Garage Subscriptions: Get revenue trend
    getRevenueTrend: builder.query<RevenueTrend, void>({
      query: () => ({
        url: `/api/admin/subscription/garages/analytics/revenue-trend`,
        method: "GET",
      }),
      providesTags: ["all-subscriptions"],
    }),

    getPromoCodes: builder.query<
      PromoCodesResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: "active" | "inactive" | "expired" | "archived";
        date_from?: string;
        date_to?: string;
      }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        const status = params.status || "active";
        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString(),
        );
        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString(),
        );
        if (params.search) queryParams.append("search", params.search);
        queryParams.append("status", status);
        if (params.date_from) queryParams.append("date_from", params.date_from);
        if (params.date_to) queryParams.append("date_to", params.date_to);

        return {
          url: `/api/admin/subscription/promo-codes?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["promo-codes"],
    }),

    createPromoCode: builder.mutation<
      SubscriptionPromoCode,
      CreatePromoCodeRequest
    >({
      query: (body) => ({
        url: `/api/admin/subscription/promo-codes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["promo-codes"],
    }),

    deactivatePromoCode: builder.mutation<SubscriptionPromoCode, string>({
      query: (id) => ({
        url: `/api/admin/subscription/promo-codes/${id}/deactivate`,
        method: "PATCH",
      }),
      invalidatesTags: ["promo-codes"],
    }),
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useGetASubscriptionQuery,
  useCreateASubscriptionMutation,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useSyncPlanToStripeMutation,
  useCreateMigrationPriceMutation,
  useSendMigrationNoticesMutation,
  useBulkMigrateMutation,
  useGetMigrationStatusQuery,
  useGetMigrationSummaryQuery,
  useGetMigrationStatisticsQuery,
  useGetMigrationJobsQuery,
  useGetMigrationJobDetailsQuery,
  useCancelMigrationJobMutation,
  useRetryMigrationJobMutation,
  useGetGarageSubscriptionsQuery,
  useGetGarageSubscriptionDetailsQuery,
  useUpdateGarageSubscriptionMutation,
  useApplyGarageSubscriptionPromoMutation,
  useSetGarageHiddenFromDriversMutation,
  useGetSubscriptionAnalyticsQuery,
  useGetSubscriptionHealthSummaryQuery,
  useGetSubscriptionHistoryQuery,
  useGetStatusBreakdownQuery,
  useGetRevenueTrendQuery,
  useGetPromoCodesQuery,
  useCreatePromoCodeMutation,
  useDeactivatePromoCodeMutation,
} = subscriptionsManagementApi;
