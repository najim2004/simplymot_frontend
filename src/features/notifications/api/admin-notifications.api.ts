import { apiSlice } from "@/lib/api/api-slice";

export const adminNotificationApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminNotifications: builder.query<any, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: "/api/notification",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Notification"],
      keepUnusedDataFor: 0,
    }),
    getAdminUnreadCount: builder.query<any, void>({
      query: () => ({
        url: "/api/notification/unread_count",
        method: "GET",
      }),
      providesTags: ["Notification"],
      keepUnusedDataFor: 0,
    }),
    adminReadAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/api/notification/read_all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    adminReadNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/notification/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    adminDeleteAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/api/notification/all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
    adminDeleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminNotificationsQuery,
  useGetAdminUnreadCountQuery,
  useAdminReadAllNotificationsMutation,
  useAdminReadNotificationMutation,
  useAdminDeleteAllNotificationsMutation,
  useAdminDeleteNotificationMutation,
} = adminNotificationApis;
