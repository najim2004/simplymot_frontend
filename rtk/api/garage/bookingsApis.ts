import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";
import { Pagination } from "@/types";

// Driver interface
export interface Driver {
  id: string;
  name: string;
  email: string;
  phone_number: string;
}

// Booking interface
export interface Booking {
  id: string;
  created_at: string;
  order_date: string;
  status: string;
  total_amount: string;
  garage_id: string;
  additional_services?: string | null;
  vehicle: {
    id: string;
    registration_number: string;
  };
  driver: Driver;
  slot: any | null;
}

// Bookings response interface
export interface BookingsResponse {
  success: boolean;
  message: string;
  data: Booking[];
  pagination: Pagination;
}

// Single booking response interface
export interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

// Update status response interface
export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: Booking;
}

export const bookingsApi = createApi({
  reducerPath: "bookingsApi",
  baseQuery,
  tagTypes: ["Bookings"],
  endpoints: (builder) => ({
    // query params search, status, page, limit, date_filter, startdate, enddate
    getBookings: builder.query<
      BookingsResponse,
      {
        search?: string;
        status?: string;
        page?: number;
        limit?: number;
        date_filter?: string;
        startdate?: string;
        enddate?: string;
      }
    >({
      query: ({
        search = "",
        status = "",
        page = 1,
        limit = 10,
        date_filter,
        startdate,
        enddate,
      }) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        if (date_filter) params.append("date_filter", date_filter);
        if (startdate) params.append("from_date", startdate);
        if (enddate) params.append("to_date", enddate);
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return `/api/bookings?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        const bookings = response?.data || [];
        const total = response?.meta_data?.total || 0;
        const page = response?.meta_data?.page || 1;
        const limit = response?.meta_data?.limit || 10;
        const pages = Math.ceil(total / limit) || 1;

        return {
          success: true,
          message: response?.message || "Bookings fetched successfully",
          data: bookings.map((b: any) => ({
            id: b.id,
            created_at: b.created_at,
            order_date: b.order_date || b.created_at,
            status: b.status,
            total_amount: b.total_amount ? `£${(Number(b.total_amount) / 100).toFixed(2)}` : "£0.00",
            garage_id: b.garage_id,
            additional_services: b.additional_services,
            vehicle: {
              id: b.vehicle?.id || "",
              registration_number: b.vehicle?.registration_number || "",
            },
            driver: {
              id: b.driver?.id || b.user_id || "",
              name: b.driver?.name || "Driver",
              email: b.driver?.email || "",
              phone_number: b.driver?.phone_number || "",
            },
            slot: b.slot,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: pages,
          },
        };
      },
      providesTags: ["Bookings"],
    }),
    // get booking by id
    getBookingById: builder.query<BookingResponse, string>({
      query: (id) => `/api/bookings/${id}`,
      transformResponse: (response: any) => {
        const b = response?.data || {};
        return {
          success: true,
          message: response?.message || "Booking fetched successfully",
          data: {
            id: b.id,
            created_at: b.created_at,
            order_date: b.order_date || b.created_at,
            status: b.status,
            total_amount: b.total_amount ? `£${(Number(b.total_amount) / 100).toFixed(2)}` : "£0.00",
            garage_id: b.garage_id,
            additional_services: b.additional_services,
            vehicle: {
              id: b.vehicle?.id || "",
              registration_number: b.vehicle?.registration_number || "",
            },
            driver: {
              id: b.driver?.id || b.user_id || "",
              name: b.driver?.name || "Driver",
              email: b.driver?.email || "",
              phone_number: b.driver?.phone_number || "",
            },
            slot: b.slot,
          },
        };
      },
      providesTags: ["Bookings"],
    }),
    // status update (simulated)
    updateBookingStatus: builder.mutation<
      UpdateStatusResponse,
      { id: string; status: string }
    >({
      queryFn: async ({ id, status }) => {
        return {
          data: {
            success: true,
            message: `Booking status updated to ${status} (simulation)`,
            data: { id, status } as any,
          },
        };
      },
      invalidatesTags: ["Bookings"],
    }),
    // reschedule booking
    rescheduleBooking: builder.mutation<
      UpdateStatusResponse,
      {
        booking_id: string;
        slot_id?: string;
        date?: string;
        start_time?: string;
        end_time?: string;
        reason?: string;
      }
    >({
      query: ({ booking_id, ...body }) => ({
        url: `/api/bookings/${booking_id}/reschedule`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Bookings"],
    }),
    // cancel booking
    cancelBooking: builder.mutation<
      UpdateStatusResponse,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/api/bookings/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Bookings"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useRescheduleBookingMutation,
  useCancelBookingMutation,
} = bookingsApi;

