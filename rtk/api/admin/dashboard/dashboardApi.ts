import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";

export type DashboardOverview = {
  total_garages: number;
  total_drivers: number;
  total_bookings: number;
  total_payments: number;
  active_subscriptions: number;
};

export type DashboardResponse = {
  success: boolean;
  data: {
    overview: DashboardOverview;
    last_updated: string;
  };
};

export type DashboardAnalyticsMetrics = {
  revenue: number;
  bookings: number;
  active_garages: number;
  active_drivers: number;
};

export type DashboardAnalyticsResponse = {
  success: boolean;
  data: {
    period: string;
    metrics: DashboardAnalyticsMetrics;
    charts: any[];
  };
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery,
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardResponse, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const [garagesRes, driversRes, bookingsRes] = await Promise.all([
          baseQuery({ url: "/api/admin/garages?limit=1", method: "GET" }),
          baseQuery({ url: "/api/admin/users?kind=DRIVER&limit=1", method: "GET" }),
          baseQuery({ url: "/api/admin/bookings?limit=1", method: "GET" }),
        ]);

        const totalGarages = (garagesRes.data as any)?.meta_data?.total || 0;
        const totalDrivers = (driversRes.data as any)?.meta_data?.total || 0;
        const totalBookings = (bookingsRes.data as any)?.meta_data?.total || 0;

        return {
          data: {
            success: true,
            data: {
              overview: {
                total_garages: totalGarages,
                total_drivers: totalDrivers,
                total_bookings: totalBookings,
                total_payments: 0,
                active_subscriptions: 0,
              },
              last_updated: new Date().toISOString(),
            },
          },
        };
      },
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardOverviewQuery } = dashboardApi;
