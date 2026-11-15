import { apiSlice } from "@/lib/api/api-slice";
import { PAGINATION_CONFIG } from "@/config/pagination.config";

export type AdminBookingCustomer = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  avatar?: string | null;
  address?: string | null;
  city?: string | null;
  post_code?: string | null;
  status?: string | null;
  role?: string | null;
  kind?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
};

export type AdminBookingVehicle = {
  id?: string;
  registration_number: string;
  make?: string | null;
  model?: string | null;
  color?: string | null;
  fuel_type?: string | null;
  year_of_manufacture?: number | null;
  mot_status?: string | null;
  mot_expiry_date?: string | null;
};

export type AdminBookingOwner = {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  avatar?: string | null;
  status?: string | null;
  address?: string | null;
  city?: string | null;
  post_code?: string | null;
  created_at?: string;
};

export type AdminBookingGarage = {
  id?: string;
  garage_name?: string | null;
  garage_image?: string | null;
  contact_email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  city?: string | null;
  post_code?: string | null;
  vts_number?: string | null;
  status?: string | null;
  owner?: AdminBookingOwner | null;
};

export type AdminBookingSlot = {
  id?: string;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type AdminBooking = {
  id: string;
  booking_number?: string | null;
  order_date: string;
  status: string;
  total_amount?: number | string | null;
  cancel_reason?: string | null;
  cancelled_by?: string | null;
  customer?: AdminBookingCustomer | null;
  vehicle?: AdminBookingVehicle | null;
  garage?: AdminBookingGarage | null;
  slot?: AdminBookingSlot | null;
  additional_services?: string | null;
  garage_note?: string | null;
  items?: Array<{
    service?: {
      title?: string;
      type?: string;
    };
    quantity?: number;
    unit_price?: number;
  }>;
};

export type AdminBookingsResponse = {
  success: boolean;
  message: string;
  data: AdminBooking[];
  meta_data?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    search?: string;
    filters?: any;
  };
};

export const bookingManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBookings: builder.query<
      AdminBookingsResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        startdate?: string;
        enddate?: string;
        id?: string;
      }
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
        if (params.id) queryParams.append("id", params.id);
        if (params.search) queryParams.append("search", params.search);
        if (params.status && params.status !== "all") {
          queryParams.append("status", params.status.toUpperCase());
        }
        if (params.startdate) queryParams.append("startdate", params.startdate);
        if (params.enddate) queryParams.append("enddate", params.enddate);
        return {
          url: `/api/admin/bookings?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Booking", "Admin"],
    }),

    getSingleBooking: builder.query<{ success: boolean; data: AdminBooking }, string>({
      query: (id) => ({
        url: `/api/admin/bookings/${id}`,
        method: "GET",
      }),
      providesTags: ["Booking", "Admin"],
    }),

    deleteBooking: builder.mutation<any, string>({
      queryFn: async (id) => {
        return {
          data: {
            success: true,
            message: `Booking ${id} deleted successfully`,
          },
        };
      },
      invalidatesTags: ["Booking", "Admin"],
    }),

    cancelBooking: builder.mutation<
      { success: boolean; message: string; data?: any },
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/api/admin/bookings/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Booking", "Admin"],
    }),

    updateBookingStatus: builder.mutation<
      { success: boolean; message: string; data?: any },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/api/admin/bookings/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Booking", "Admin"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllBookingsQuery,
  useGetSingleBookingQuery,
  useDeleteBookingMutation,
  useCancelBookingMutation,
  useUpdateBookingStatusMutation,
} = bookingManagementApi;
