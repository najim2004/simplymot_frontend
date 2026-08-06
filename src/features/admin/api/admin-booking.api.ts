import { apiSlice } from "@/lib/api/api-slice";
import { PAGINATION_CONFIG } from "@/config/pagination.config";

export const bookingManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBookings: builder.query<any, { page?: number; limit?: number; search?: string; status?: string; startdate?: string; enddate?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString());
        queryParams.append("limit", (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);
        if (params.startdate) queryParams.append("startdate", params.startdate);
        if (params.enddate) queryParams.append("enddate", params.enddate);
        return {
          url: `/api/admin/bookings?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Admin"],
    }),

    getSingleBooking: builder.query<any, string>({
      query: (id) => ({
        url: `/api/admin/bookings/${id}`,
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),

    deleteBooking: builder.mutation<any, string>({
      queryFn: async (id) => {
        return { data: { success: true, message: `Booking ${id} deleted successfully (simulation)` } };
      },
      invalidatesTags: ["Admin"],
    }),

    cancelBooking: builder.mutation<any, string>({
      queryFn: async (id) => {
        return { data: { success: true, message: `Booking ${id} cancelled successfully (simulation)` } };
      },
      invalidatesTags: ["Admin"],
    }),

    updateBookingStatus: builder.mutation<any, { id: string; status: string }>({
      queryFn: async ({ id, status }) => {
        return { data: { success: true, message: `Booking ${id} status updated to ${status} (simulation)` } };
      },
      invalidatesTags: ["Admin"],
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
