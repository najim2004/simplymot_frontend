import { apiSlice } from "@/lib/api/api-slice";
import {
  GetBookingsResponse,
  GetBookingDetailResponse,
  GetBookingsQueryParams,
  RescheduleBookingRequest,
  RescheduleBookingResponse,
  CancelBookingRequest,
  CancelBookingResponse,
} from "../types";

export const bookingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<GetBookingsResponse, GetBookingsQueryParams | void>({
      query: (params) => ({
        url: "/api/bookings",
        params: params || undefined,
      }),
      providesTags: ["Booking"],
    }),

    getBookingById: builder.query<GetBookingDetailResponse, string>({
      query: (id) => `/api/bookings/${id}`,
      providesTags: ["Booking"],
    }),

    rescheduleBooking: builder.mutation<
      RescheduleBookingResponse,
      RescheduleBookingRequest
    >({
      query: ({ booking_id, ...body }) => ({
        url: `/api/bookings/${booking_id}/reschedule`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),

    cancelBooking: builder.mutation<
      CancelBookingResponse,
      CancelBookingRequest
    >({
      query: ({ booking_id, reason }) => ({
        url: `/api/bookings/${booking_id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useRescheduleBookingMutation,
  useCancelBookingMutation,
} = bookingsApi;
