import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";


// get all bookings /api/admin/bookings?page=&limit=&search=&status=&startdate=&enddate=
export const bookingManagementApi = createApi({
    reducerPath: "bookingManagementApi",
    baseQuery,
    tagTypes: ["Bookings"],
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
            providesTags: ["Bookings"],
        }),
        // single booking details /api/admin/bookings/:id
        getSingleBooking: builder.query<any, string>({
            query: (id) => ({
                url: `/api/admin/bookings/${id}`,
                method: "GET",
            }),
            providesTags: ["Bookings"],
        }),

        // delete a booking (simulated)
        deleteBooking: builder.mutation<any, string>({
            queryFn: async (id) => {
                return { data: { success: true, message: `Booking ${id} deleted successfully (simulation)` } };
            },
            invalidatesTags: ["Bookings"],
        }),

        // cancel a booking (simulated)
        cancelBooking: builder.mutation<any, string>({
            queryFn: async (id) => {
                return { data: { success: true, message: `Booking ${id} cancelled successfully (simulation)` } };
            },
            invalidatesTags: ["Bookings"],
        }),
        updateBookingStatus: builder.mutation<any, { id: string; status: string }>({
            queryFn: async ({ id, status }) => {
                return { data: { success: true, message: `Booking ${id} status updated to ${status} (simulation)` } };
            },
            invalidatesTags: ["Bookings"],
        }),
    }),
});

export const { 
    useGetAllBookingsQuery,
    useGetSingleBookingQuery,
    useDeleteBookingMutation,
    useCancelBookingMutation,
    useUpdateBookingStatusMutation,
} = bookingManagementApi;