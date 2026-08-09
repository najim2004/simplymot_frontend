import { apiSlice } from "@/lib/api/api-slice";
import {
  GetScheduleResponse,
  UpsertScheduleRequest,
  AddHolidayRequest,
  HolidayItem,
  BreakTimeItem,
  GetGarageSlotsResponse,
  BlockUnblockSlotsDto,
} from "../types";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const scheduleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  overrideExisting: false,
});

export const {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useGetSlotDetailsQuery,
  useBlockSlotMutation,
  useUnblockSlotMutation,
  useAddHolidayMutation,
  useGetHolidaysQuery,
  useDeleteHolidayMutation,
  useCreateBreakTimeMutation,
  useDeleteBreakTimeMutation,
} = scheduleApi;
