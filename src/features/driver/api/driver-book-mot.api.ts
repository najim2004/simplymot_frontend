import { apiSlice } from "@/lib/api/api-slice";
import {
  SearchRequest,
  SearchResponse,
  GarageServicesApiResponse,
  GarageSlotsApiResponse,
  BookSlotRequest,
  BookSlotResponse,
  GetMyBookingsRequest,
  GetMyBookingsResponse,
  CancelMyBookingRequest,
  RescheduleMyBookingRequest,
  BookingMutationResponse,
} from "../types";

export * from "../types";

export const bookMyMotApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchVehiclesAndGarages: builder.query<SearchResponse, SearchRequest>({
      query: (params) => ({
        url: `/api/garages/discover`,
        method: "GET",
        params: {
          vehicle_registration_number: params.registration_number,
          post_code: params.postcode,
          page: params.page,
          limit: params.limit,
          sort:
            params.sort_by === "PRICE_LOW_TO_HIGH"
              ? "price"
              : params.sort_by === "PRICE_HIGH_TO_LOW"
                ? "price"
                : "distance",
          sort_order: params.sort_by === "PRICE_HIGH_TO_LOW" ? "desc" : "asc",
        },
      }),
      providesTags: ["Booking"],
    }),

    getGarageServices: builder.query<GarageServicesApiResponse, string>({
      query: (id) => ({
        url: `/api/garages/discover/${id}`,
        method: "GET",
      }),
      providesTags: ["Booking"],
      keepUnusedDataFor: 0,
    }),

    getGarageSlots: builder.query<
      GarageSlotsApiResponse,
      { id: string; date: string }
    >({
      query: ({ id, date }) => ({
        url: `/api/garages/${id}/slots?date=${date}`,
        method: "GET",
      }),
      providesTags: ["Booking"],
      keepUnusedDataFor: 0,
    }),

    bookSlot: builder.mutation<BookSlotResponse, BookSlotRequest>({
      query: (body) => ({
        url: `/api/bookings`,
        method: "POST",
        body: body,
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
  }),
  overrideExisting: false,
});

export const {
  useSearchVehiclesAndGaragesQuery,
  useGetGarageServicesQuery,
  useGetGarageSlotsQuery,
  useBookSlotMutation,
  useGetMyBookingsQuery,
  useCancelMyBookingMutation,
  useRescheduleMyBookingMutation,
} = bookMyMotApi;
