import { apiSlice } from "@/lib/api/api-slice";
import {
  ProfileResponse,
  UpdateProfileResponse,
  ServicesBundleResponse,
  UpsertServiceDto,
  UpsertServiceResponse,
  DeleteServiceResponse,
  GetScheduleResponse,
  UpsertScheduleRequest,
  AddHolidayRequest,
  HolidayItem,
  BreakTimeItem,
  GetGarageSlotsResponse,
  BlockUnblockSlotsDto,
  SearchRequest,
  SearchResponse,
  GarageServicesApiResponse,
  GarageSlotsApiResponse,
} from "../types";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const garageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Profile Endpoints ───────────────────────────────────────────────────
    getGarageProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/api/garages",
        method: "GET",
      }),
      providesTags: ["Garage"],
    }),

    updateGarageProfile: builder.mutation<
      UpdateProfileResponse,
      | { id: string; body: FormData | Record<string, unknown> }
      | FormData
      | Record<string, unknown>
    >({
      query: (arg) => {
        if (arg && typeof arg === "object" && "id" in arg && "body" in arg) {
          return {
            url: `/api/garages/${(arg as { id: string; body: unknown }).id}`,
            method: "PATCH",
            body: (arg as { id: string; body: unknown }).body,
          };
        }
        const id =
          arg instanceof FormData
            ? arg.get("id")
            : (arg as Record<string, unknown>)?.id;
        return {
          url: id ? `/api/garages/${id}` : "/api/garages",
          method: "PATCH",
          body: arg,
        };
      },
      invalidatesTags: ["Garage"],
    }),

    // ─── Discover Endpoints ──────────────────────────────────────────────────
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

    // ─── Pricing / Services Endpoints ────────────────────────────────────────
    getServices: builder.query<ServicesBundleResponse, string>({
      query: (garageId) => `/api/garages/${garageId}/services`,
      providesTags: ["Pricing"],
    }),

    upsertServices: builder.mutation<
      UpsertServiceResponse,
      { garageId: string; body: UpsertServiceDto }
    >({
      query: ({ garageId, body }) => ({
        url: `/api/garages/${garageId}/services`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Pricing"],
    }),

    deleteService: builder.mutation<
      DeleteServiceResponse,
      { garageId: string; id: string }
    >({
      query: ({ garageId, id }) => ({
        url: `/api/garages/${garageId}/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pricing"],
    }),

    // ─── Schedule & Slots Endpoints ──────────────────────────────────────────
    getSchedule: builder.query<GetScheduleResponse, string>({
      query: (garageId) => ({
        url: `/api/garages/${garageId}/schedule`,
        method: "GET",
      }),
      providesTags: ["Schedule"],
    }),

    createSchedule: builder.mutation<
      GetScheduleResponse,
      { garageId: string; body: UpsertScheduleRequest }
    >({
      query: ({ garageId, body }) => ({
        url: `/api/garages/${garageId}/schedule`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Schedule"],
    }),

    getSlotDetails: builder.query<
      GetGarageSlotsResponse,
      { garageId: string; date: string }
    >({
      query: ({ garageId, date }) => ({
        url: `/api/garages/${garageId}/slots?date=${date}`,
        method: "GET",
      }),
      providesTags: ["Slots"],
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
      providesTags: ["Slots"],
      keepUnusedDataFor: 0,
    }),

    blockSlot: builder.mutation<
      ApiResponse,
      { garageId: string; body: BlockUnblockSlotsDto }
    >({
      query: ({ garageId, body }) => ({
        url: `/api/garages/${garageId}/slots/block`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Slots"],
    }),

    unblockSlot: builder.mutation<
      ApiResponse,
      { garageId: string; body: BlockUnblockSlotsDto }
    >({
      query: ({ garageId, body }) => ({
        url: `/api/garages/${garageId}/slots/unblock`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Slots"],
    }),

    addHoliday: builder.mutation<
      ApiResponse<HolidayItem>,
      { garageId: string; scheduleId: string; body: AddHolidayRequest }
    >({
      query: ({ garageId, scheduleId, body }) => ({
        url: `/api/garages/${garageId}/schedule/${scheduleId}/holidays`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Holidays"],
    }),

    getHolidays: builder.query<
      ApiResponse<HolidayItem[]>,
      { garageId: string; scheduleId: string; year?: number }
    >({
      query: ({ garageId, scheduleId, year }) => ({
        url: `/api/garages/${garageId}/schedule/${scheduleId}/holidays${
          year ? `?year=${year}` : ""
        }`,
        method: "GET",
      }),
      providesTags: ["Holidays"],
    }),

    deleteHoliday: builder.mutation<
      ApiResponse,
      { garageId: string; scheduleId: string; holidayId: string }
    >({
      query: ({ garageId, scheduleId, holidayId }) => ({
        url: `/api/garages/${garageId}/schedule/${scheduleId}/holidays/${holidayId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Holidays"],
    }),

    createBreakTime: builder.mutation<
      ApiResponse<BreakTimeItem>,
      {
        garageId: string;
        scheduleIntervalId: string;
        body: { start_time: string; end_time: string; description?: string };
      }
    >({
      query: ({ garageId, scheduleIntervalId, body }) => ({
        url: `/api/garages/${garageId}/schedule_interval/${scheduleIntervalId}/break_times`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Schedule"],
    }),

    deleteBreakTime: builder.mutation<
      ApiResponse,
      { garageId: string; breakTimeId: string }
    >({
      query: ({ garageId, breakTimeId }) => ({
        url: `/api/garages/${garageId}/break_times/${breakTimeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Schedule"],
    }),

  }),
});

export const {
  useGetGarageProfileQuery,
  useUpdateGarageProfileMutation,
  useSearchVehiclesAndGaragesQuery,
  useGetGarageServicesQuery,
  useGetServicesQuery,
  useUpsertServicesMutation,
  useDeleteServiceMutation,
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useGetSlotDetailsQuery,
  useGetGarageSlotsQuery,
  useBlockSlotMutation,
  useUnblockSlotMutation,
  useAddHolidayMutation,
  useGetHolidaysQuery,
  useDeleteHolidayMutation,
  useCreateBreakTimeMutation,
  useDeleteBreakTimeMutation,
} = garageApi;

// Backwards-compatible aliases
export { garageApi as profileApi, garageApi as pricingApi, garageApi as scheduleApi };
