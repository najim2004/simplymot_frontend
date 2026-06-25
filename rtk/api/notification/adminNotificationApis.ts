import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// Admin notifications: /api/admin/notifications

export const adminNotificationApis = createApi({
  reducerPath: "adminNotificationApis",
  baseQuery,
  tagTypes: ["AdminNotifications"],
  endpoints: (builder) => ({
    // get all notification /api/notification?limit=&page=
    getNotifications: builder.query<any, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: "/api/notification",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["AdminNotifications"],
      keepUnusedDataFor: 0,
    }),
    // unread
    getUnreadCount: builder.query<any, void>({
      query: () => ({
        url: "/api/notification/unread_count",
        method: "GET",
      }),
      providesTags: ["AdminNotifications"],
      keepUnusedDataFor: 0,
    }),
    // read all
    readAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/api/notification/read_all",
        method: "PATCH",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
    // read
    readNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/notification/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
    // delete all notifications
    deleteAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/api/notification/all",
        method: "DELETE",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
    // delete one notification
    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/notification/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminNotifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery: useGetAdminNotificationsQuery,
  useGetUnreadCountQuery: useGetAdminUnreadCountQuery,
  useReadAllNotificationsMutation: useAdminReadAllNotificationsMutation,
  useReadNotificationMutation: useAdminReadNotificationMutation,
  useDeleteAllNotificationsMutation: useAdminDeleteAllNotificationsMutation,
  useDeleteNotificationMutation: useAdminDeleteNotificationMutation,
} = adminNotificationApis;
