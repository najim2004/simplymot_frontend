import { apiSlice } from "@/lib/api/api-slice";
import { PAGINATION_CONFIG } from "@/config/pagination.config";

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

import type { Pagination } from "@/types";

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

export type JobType = "NOTICE" | "MIGRATION";

export type MigrationJob = {
  id: string;
  job_type: JobType;
  status: string;
  [key: string]: any;
};

export type JobsResponse = {
  data?: MigrationJob[];
  jobs?: MigrationJob[];
  pagination?: Pagination;
};

export type JobDetails = MigrationJob & {
  [key: string]: any;
};

export type CreateMigrationPriceRequest = {
  new_price_pence: number;
};

export type SendMigrationNoticesRequest = {
  notice_period_days?: number;
};

export type BulkMigrateRequest = {
  batch_size?: number;
};

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

export const subscriptionsManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
          url: `/api/admin/subscriptions/plan?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        const plans = response?.data || [];
        const total = response?.meta_data?.total || 0;
        const page = response?.meta_data?.page || 1;
        const limit = response?.meta_data?.limit || 10;
        const totalPages = Math.ceil(total / limit) || 1;
        return {
          total,
          page,
          limit,
          totalPages,
          data: plans.map((p: any) => ({
            ...p,
            price_formatted: `£${((p.price_pence || 0) / 100).toFixed(2)}`,
            is_active: p.status === "ACTIVE",
            max_bookings_per_month: p.max_bookings_per_month || 0,
            max_vehicles: p.max_vehicles || 0,
            priority_support: p.priority_support || false,
            advanced_analytics: p.advanced_analytics || false,
            custom_branding: p.custom_branding || false,
            stripe_price_id: p.stripe_price_id || "",
            active_subscriptions_count: p.active_subscriptions_count || 0,
          })),
        };
      },
      providesTags: ["Admin"],
    }),

    getASubscription: builder.query<SubscriptionPlan, string | undefined>({
      query: (id) => ({
        url: `/api/admin/subscriptions/plan/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const p = response?.data || {};
        return {
          ...p,
          price_formatted: `£${((p.price_pence || 0) / 100).toFixed(2)}`,
          is_active: p.status === "ACTIVE",
          max_bookings_per_month: p.max_bookings_per_month || 0,
          max_vehicles: p.max_vehicles || 0,
          priority_support: p.priority_support || false,
          advanced_analytics: p.advanced_analytics || false,
          custom_branding: p.custom_branding || false,
          stripe_price_id: p.stripe_price_id || "",
          active_subscriptions_count: p.active_subscriptions_count || 0,
        } as any;
      },
      providesTags: ["Admin"],
    }),

    createASubscription: builder.mutation<
      SubscriptionPlan,
      Partial<TCreateSubscription>
    >({
      query: (body) => ({
        url: `/api/admin/subscriptions/plan`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),

    updateSubscription: builder.mutation<
      SubscriptionPlan,
      { id: string; body: Partial<TUpdateSubscription> }
    >({
      query: ({ id, body }) => ({
        url: `/api/admin/subscriptions/plan/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),

    deleteSubscription: builder.mutation<
      { success?: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/api/admin/subscriptions/plan/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),

    syncPlanToStripe: builder.mutation<SubscriptionPlan, string>({
      query: (id) => ({
        url: `/api/admin/subscriptions/plan/${id}/stripe/sync`,
        method: "POST",
      }),
      invalidatesTags: ["Admin"],
    }),

    createMigrationPrice: builder.mutation<
      { success?: boolean; message?: string; data?: any },
      { id: string; body: CreateMigrationPriceRequest }
    >({
      queryFn: async ({ id }) => {
        return { data: { success: true, message: `Migration price created for plan ${id} (simulation)` } };
      },
      invalidatesTags: ["Admin"],
    }),

    sendMigrationNotices: builder.mutation<
      { success?: boolean; message?: string; data?: any },
      { id: string; body?: SendMigrationNoticesRequest }
    >({
      queryFn: async ({ id }) => {
        return { data: { success: true, message: `Migration notices sent for plan ${id} (simulation)` } };
      },
      invalidatesTags: ["Admin"],
    }),

    bulkMigrate: builder.mutation<
      { success?: boolean; message?: string; data?: any },
      { id: string; body?: BulkMigrateRequest }
    >({
      queryFn: async ({ id }) => {
        return { data: { success: true, message: `Bulk migration initiated for plan ${id} (simulation)` } };
      },
      invalidatesTags: ["Admin"],
    }),

    getMigrationStatus: builder.query<MigrationStatus, string>({
      queryFn: async () => {
        return {
          data: {
            status: "COMPLETED",
            success: true,
            total_customers: 0,
            migrated_customers: 0,
            failed_customers: 0,
          },
        };
      },
      providesTags: ["Admin"],
    }),

    getMigrationSummary: builder.query<MigrationSummary, string>({
      queryFn: async () => {
        return {
          data: {
            success: true,
            original_price_pence: 0,
            new_price_pence: 0,
            notice_period_days: 30,
          },
        };
      },
      providesTags: ["Admin"],
    }),

    getMigrationStatistics: builder.query<MigrationStatistics, string>({
      queryFn: async () => {
        return {
          data: {
            success: true,
            statistics: {
              active: 0,
              completed: 0,
              failed: 0,
            },
          },
        };
      },
      providesTags: ["Admin"],
    }),

    getMigrationJobs: builder.query<
      JobsResponse,
      { id: string; job_type?: JobType }
    >({
      queryFn: async () => {
        return {
          data: {
            success: true,
            data: [],
            jobs: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 1,
              pages: 1,
            },
          },
        };
      },
      providesTags: ["Admin"],
    }),

    getMigrationJobDetails: builder.query<
      JobDetails,
      { id: string; jobId: string }
    >({
      queryFn: async ({ jobId }) => {
        return {
          data: {
            id: jobId,
            job_type: "MIGRATION",
            status: "COMPLETED",
            success: true,
          },
        };
      },
      providesTags: ["Admin"],
    }),

    cancelMigrationJob: builder.mutation<
      { success?: boolean; message?: string },
      { id: string; jobId: string }
    >({
      queryFn: async ({ jobId }) => {
        return { data: { success: true, message: `Job ${jobId} cancelled (simulation)` } };
      },
      invalidatesTags: ["Admin"],
    }),

    retryMigrationJob: builder.mutation<
      { success?: boolean; message?: string; data?: any },
      { id: string; jobId: string }
    >({
      queryFn: async ({ jobId }) => {
        return { data: { success: true, message: `Job ${jobId} retrying (simulation)` } };
      },
      invalidatesTags: ["Admin"],
    }),

    getGarageSubscriptions: builder.query<
      GarageSubscriptionsResponse,
      GarageSubscriptionsQueryParams
    >({
      queryFn: async () => {
        return {
          data: {
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };
      },
      providesTags: ["Admin"],
    }),

    getGarageSubscriptionDetails: builder.query<GarageSubscription, string>({
      queryFn: async (id) => {
        return {
          data: {
            id,
            garage_id: "",
            garage_name: "Mock Garage",
            garage_email: "mock@garage.com",
            hidden_from_drivers: false,
            plan_id: "",
            plan_name: "Standard",
            status: "ACTIVE",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date().toISOString(),
            next_billing_date: null,
            price_pence: 0,
            price_formatted: "£0.00",
            stripe_subscription_id: "",
            stripe_customer_id: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      },
      providesTags: ["Admin"],
    }),

    updateGarageSubscription: builder.mutation<
      GarageSubscription,
      { id: string; body: UpdateSubscriptionAction }
    >({
      queryFn: async ({ id, body }) => {
        return {
          data: {
            id,
            garage_id: "",
            garage_name: "Mock Garage",
            garage_email: "mock@garage.com",
            hidden_from_drivers: false,
            plan_id: "",
            plan_name: "Standard",
            status: body.action === "ACTIVATE" || body.action === "REACTIVATE" ? "ACTIVE" : body.action === "SUSPEND" ? "SUSPENDED" : "CANCELLED",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date().toISOString(),
            next_billing_date: null,
            price_pence: 0,
            price_formatted: "£0.00",
            stripe_subscription_id: "",
            stripe_customer_id: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      },
      invalidatesTags: ["Admin"],
    }),

    applyGarageSubscriptionPromo: builder.mutation<
      { success: boolean; message: string; data: GarageSubscription },
      { id: string; promo_code: string }
    >({
      queryFn: async ({ id }) => {
        return {
          data: {
            success: true,
            message: "Promo applied (simulation)",
            data: {
              id,
              garage_id: "",
              garage_name: "Mock Garage",
              garage_email: "mock@garage.com",
              hidden_from_drivers: false,
              plan_id: "",
              plan_name: "Standard",
              status: "ACTIVE",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date().toISOString(),
              next_billing_date: null,
              price_pence: 0,
              price_formatted: "£0.00",
              stripe_subscription_id: "",
              stripe_customer_id: "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        };
      },
      invalidatesTags: ["Admin"],
    }),

    setGarageHiddenFromDrivers: builder.mutation<
      { garage_id: string; hidden_from_drivers: boolean },
      { garageId: string; hidden_from_drivers: boolean }
    >({
      queryFn: async ({ garageId, hidden_from_drivers }) => {
        return {
          data: {
            garage_id: garageId,
            hidden_from_drivers,
          },
        };
      },
      invalidatesTags: ["Admin"],
    }),

    getSubscriptionAnalytics: builder.query<SubscriptionAnalytics, void>({
      queryFn: async () => {
        return {
          data: {
            total_active_subscriptions: 0,
            total_monthly_revenue_pence: 0,
            total_monthly_revenue_formatted: "£0.00",
            status_distribution: [],
            plan_distribution: [],
          },
        };
      },
      providesTags: ["Admin"],
    }),

    getSubscriptionHealthSummary: builder.query<
      SubscriptionHealthSummary,
      void
    >({
      queryFn: async () => {
        return {
          data: {
            total_subscriptions: 0,
            active_subscriptions: 0,
            past_due_subscriptions: 0,
            suspended_subscriptions: 0,
            expiring_soon: 0,
            expired_recently: 0,
          },
        };
      },
      providesTags: ["Admin"],
    }),

    getSubscriptionHistory: builder.query<GarageSubscription[], string>({
      queryFn: async () => {
        return { data: [] };
      },
      providesTags: ["Admin"],
    }),

    getStatusBreakdown: builder.query<StatusBreakdown, void>({
      queryFn: async () => {
        return {
          data: {
            active: 0,
            inactive: 0,
            suspended: 0,
            cancelled: 0,
            past_due: 0,
          },
        };
      },
      providesTags: ["Admin"],
    }),

    getRevenueTrend: builder.query<RevenueTrend, void>({
      queryFn: async () => {
        return { data: [] };
      },
      providesTags: ["Admin"],
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
      queryFn: async () => {
        return {
          data: {
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        };
      },
      providesTags: ["Admin"],
    }),

    createPromoCode: builder.mutation<
      SubscriptionPromoCode,
      CreatePromoCodeRequest
    >({
      queryFn: async (body) => {
        return {
          data: {
            id: "promo_mock",
            code: body.code || "MOCK",
            percent_off: body.percent_off || 0,
            duration: body.duration,
            redeemed_count: 0,
            is_active: true,
            status: "ACTIVE",
            display_duration: "Forever",
            stripe_coupon_id: "",
            stripe_promotion_code_id: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      },
      invalidatesTags: ["Admin"],
    }),

    deactivatePromoCode: builder.mutation<SubscriptionPromoCode, string>({
      queryFn: async (id) => {
        return {
          data: {
            id,
            code: "DEACTIVATED",
            percent_off: 0,
            duration: "FOREVER",
            redeemed_count: 0,
            is_active: false,
            status: "INACTIVE",
            display_duration: "Forever",
            stripe_coupon_id: "",
            stripe_promotion_code_id: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      },
      invalidatesTags: ["Admin"],
    }),
  }),
  overrideExisting: false,
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
