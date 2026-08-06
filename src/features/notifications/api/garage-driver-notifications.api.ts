import { apiSlice } from "@/lib/api/api-slice";

export const garageDriverApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: "/api/notification",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Notification"],
      keepUnusedDataFor: 0,
    }),
    getUnreadCount: builder.query<any, void>({
      query: () => ({
        url: "/api/notification/unread_count",
        method: "GET",
      }),
      providesTags: ["Notification"],
      keepUnusedDataFor: 0,
    }),
    readAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/api/notification/read_all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    readNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/notification/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: `/api/notification/all`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotification: builder.mutation<any, string>({
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
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useDeleteAllNotificationsMutation,
  useDeleteNotificationMutation,
} = garageDriverApis;
