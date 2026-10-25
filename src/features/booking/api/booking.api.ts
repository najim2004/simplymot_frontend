import { apiSlice } from "@/lib/api/api-slice";
import {
  GetBookingsResponse,
  GetBookingDetailResponse,
  GetBookingsQueryParams,
  RescheduleBookingRequest,
  RescheduleBookingResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  BookSlotRequest,
  BookSlotResponse,
  GetMyBookingsRequest,
  GetMyBookingsResponse,
  CancelMyBookingRequest,
  RescheduleMyBookingRequest,
  BookingMutationResponse,
  UpdateBookingNoteRequest,
  UpdateBookingNoteResponse,
} from "../types";

export const bookingApi = apiSlice.injectEndpoints({
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

    createBooking: builder.mutation<CreateBookingResponse, CreateBookingRequest>({
      query: (body) => ({
        url: "/api/bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),

    bookSlot: builder.mutation<BookSlotResponse, BookSlotRequest>({
      query: (body) => ({
        url: "/api/bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),

    getMyBookings: builder.query<GetMyBookingsResponse, GetMyBookingsRequest>({
      query: ({ search, status, page, limit }) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status && status !== "all")
          params.append("status", status.toUpperCase());
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return {
          url: `/api/bookings?${params.toString()}`,
          method: "GET",
        };
      },
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

    rescheduleMyBooking: builder.mutation<
      BookingMutationResponse,
      RescheduleMyBookingRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/api/bookings/${id}/reschedule`,
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

    cancelMyBooking: builder.mutation<
      BookingMutationResponse,
      CancelMyBookingRequest
    >({
      query: ({ id, reason }) => ({
        url: `/api/bookings/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Booking"],
    }),

    updateBookingNote: builder.mutation<
      UpdateBookingNoteResponse,
      UpdateBookingNoteRequest
    >({
      query: ({ booking_id, note }) => ({
        url: `/api/bookings/${booking_id}/note`,
        method: "PATCH",
        body: { note },
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useLazyGetBookingByIdQuery,
  useCreateBookingMutation,
  useBookSlotMutation,
  useGetMyBookingsQuery,
  useRescheduleBookingMutation,
  useRescheduleMyBookingMutation,
  useCancelBookingMutation,
  useCancelMyBookingMutation,
  useUpdateBookingNoteMutation,
} = bookingApi;

