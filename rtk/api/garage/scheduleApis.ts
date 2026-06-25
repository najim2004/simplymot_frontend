import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface DailyHourConfig {
  is_closed?: boolean;
  intervals?: Array<{
    start_time: string;
    end_time: string;
  }>;
  slot_duration?: number;
}

export interface BreakRestriction {
  type: "BREAK";
  day_of_week: number[];
  start_time: string;
  end_time: string;
  description: string;
}

export interface ScheduleRequest {
  daily_hours: Record<string, DailyHourConfig>;
  restrictions: BreakRestriction[];
}

export interface ScheduleResponseData {
  id: string;
  created_at: string;
  updated_at: string;
  garage_id: string;
  start_time: string | null;
  end_time: string | null;
  slot_duration: number;
  restrictions: BreakRestriction[];
  daily_hours: Record<string, DailyHourConfig>;
  is_active: boolean;
}

export interface ScheduleApiResponse {
  success: boolean;
  message: string;
  data: ScheduleResponseData;
  cleanup?: {
    deleted_unbooked_future_slots: number;
    note: string;
  };
}

export interface CalendarViewData {
  current_week: {
    week_number: number;
    start_date: string;
    end_date: string;
  };
  week_schedule: {
    days: Array<{
      date: string;
      day_name: string;
      is_today: boolean;
      is_holiday: boolean;
      start_time?: string;
      end_time?: string;
      breaks: Array<{
        start_time: string;
        end_time: string;
        description: string;
      }>;
      description?: string;
    }>;
  };
  month_holidays: Array<{
    date: string;
    description: string;
    type: string;
  }>;
}

export interface BulkSlotRequest {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  action: "BLOCK" | "UNBLOCK";
  reason?: string;
}

export interface Holiday {
  type: string;
  month: number;
  day: number;
  description: string;
  is_recurring: boolean;
  date?: string; // For display purposes
  id?: string; // For local state management (temp IDs for new holidays)
}

export interface AddHolidayRequest {
  type: string;
  month: number;
  day: number;
  description: string;
  is_recurring: boolean;
}

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
  baseQuery,
  tagTypes: ["Schedule", "Slots", "Calendar"],
  endpoints: (builder) => ({
    getSchedule: builder.query<ScheduleApiResponse, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;
        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found" } } as any };
        }

        const scheduleRes = await baseQuery({ url: `/api/garages/${garageId}/schedule`, method: "GET" });
        if (scheduleRes.error) return { error: scheduleRes.error };

        const scheduleData = (scheduleRes.data as any)?.data || {};
        const intervals = scheduleData.schedule_intervals || [];
        const daily_hours: Record<string, DailyHourConfig> = {};
        intervals.forEach((item: any) => {
          const dayKey = item.day_of_week.toLowerCase();
          daily_hours[dayKey] = {
            is_closed: item.is_closed,
            slot_duration: item.slot_duration,
            intervals: [
              {
                start_time: item.open_time,
                end_time: item.close_time,
              },
            ],
          };
        });

        return {
          data: {
            success: true,
            message: "Schedule fetched successfully",
            data: {
              id: scheduleData.id || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              garage_id: garageId,
              start_time: null,
              end_time: null,
              slot_duration: intervals[0]?.slot_duration || 60,
              restrictions: [],
              daily_hours,
              is_active: true,
            },
          },
        };
      },
      providesTags: ["Schedule"],
    }),

    createSchedule: builder.mutation<ScheduleApiResponse, ScheduleRequest>({
      queryFn: async (body, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;
        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found" } } as any };
        }

        const intervals: any[] = [];
        const daysMap: Record<string, string> = {
          monday: "MONDAY",
          tuesday: "TUESDAY",
          wednesday: "WEDNESDAY",
          thursday: "THURSDAY",
          friday: "FRIDAY",
          saturday: "SATURDAY",
          sunday: "SUNDAY",
        };

        for (const [dayKey, dayConfig] of Object.entries(body.daily_hours)) {
          const dayOfWeek = daysMap[dayKey.toLowerCase()];
          if (!dayOfWeek) continue;

          const isClosed = dayConfig.is_closed ?? false;
          const firstInterval = dayConfig.intervals?.[0];
          const openTime = firstInterval?.start_time || "09:00";
          const closeTime = firstInterval?.end_time || "17:00";
          const slotDuration = dayConfig.slot_duration || 60;

          intervals.push({
            day_of_week: dayOfWeek,
            is_closed: isClosed,
            open_time: openTime,
            close_time: closeTime,
            slot_duration: slotDuration,
            buffer_time: 10,
          });
        }

        const upsertRes = await baseQuery({
          url: `/api/garages/${garageId}/schedule`,
          method: "PUT",
          body: { schedule_intervals: intervals },
        });
        if (upsertRes.error) return { error: upsertRes.error };

        const scheduleData = (upsertRes.data as any)?.data || {};
        const returnedIntervals = scheduleData.schedule_intervals || [];
        const daily_hours: Record<string, DailyHourConfig> = {};
        returnedIntervals.forEach((item: any) => {
          const dayKey = item.day_of_week.toLowerCase();
          daily_hours[dayKey] = {
            is_closed: item.is_closed,
            slot_duration: item.slot_duration,
            intervals: [
              {
                start_time: item.open_time,
                end_time: item.close_time,
              },
            ],
          };
        });

        return {
          data: {
            success: true,
            message: "Schedule updated successfully",
            data: {
              id: scheduleData.id || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              garage_id: garageId,
              start_time: null,
              end_time: null,
              slot_duration: returnedIntervals[0]?.slot_duration || 60,
              restrictions: [],
              daily_hours,
              is_active: true,
            },
          },
        };
      },
      invalidatesTags: ["Schedule", "Calendar"],
    }),

    getScheduleList: builder.query<ScheduleApiResponse[], void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;
        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found" } } as any };
        }

        const scheduleRes = await baseQuery({ url: `/api/garages/${garageId}/schedule`, method: "GET" });
        if (scheduleRes.error) return { error: scheduleRes.error };

        const scheduleData = (scheduleRes.data as any)?.data || {};
        const intervals = scheduleData.schedule_intervals || [];
        const daily_hours: Record<string, DailyHourConfig> = {};
        intervals.forEach((item: any) => {
          const dayKey = item.day_of_week.toLowerCase();
          daily_hours[dayKey] = {
            is_closed: item.is_closed,
            slot_duration: item.slot_duration,
            intervals: [
              {
                start_time: item.open_time,
                end_time: item.close_time,
              },
            ],
          };
        });

        return {
          data: [
            {
              success: true,
              message: "Schedule list fetched successfully",
              data: {
                id: scheduleData.id || "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                garage_id: garageId,
                start_time: null,
                end_time: null,
                slot_duration: intervals[0]?.slot_duration || 60,
                restrictions: [],
                daily_hours,
                is_active: true,
              },
            },
          ],
        };
      },
      providesTags: ["Schedule"],
      keepUnusedDataFor: 0,
    }),

    getCalendarView: builder.query<
      ApiResponse<CalendarViewData>,
      { year: number; month: number; weekNumber?: number }
    >({
      queryFn: async () => {
        return {
          data: {
            success: true,
            data: {
              current_week: {
                week_number: 1,
                start_date: new Date().toISOString(),
                end_date: new Date().toISOString(),
              },
              week_schedule: {
                days: [],
              },
              month_holidays: [],
            },
          },
        };
      },
      providesTags: ["Calendar"],
      keepUnusedDataFor: 0,
    }),

    getSlotDetails: builder.query<ApiResponse, string>({
      queryFn: async (date, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;
        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found" } } as any };
        }

        const slotsRes = await baseQuery({ url: `/api/garages/${garageId}/slots?date=${date}`, method: "GET" });
        if (slotsRes.error) return { error: slotsRes.error };

        return { data: slotsRes.data as any };
      },
      providesTags: ["Slots"],
      keepUnusedDataFor: 0,
    }),

    bulkSlotOperation: builder.mutation<ApiResponse, BulkSlotRequest>({
      queryFn: async (request, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;
        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found" } } as any };
        }

        const actionPath = request.action === "BLOCK" ? "block" : "unblock";
        const start_time = `${request.start_date}T${request.start_time}:00`;
        const end_time = `${request.end_date}T${request.end_time}:00`;

        const actionRes = await baseQuery({
          url: `/api/garages/${garageId}/slots/${actionPath}`,
          method: "PATCH",
          body: {
            start_time: new Date(start_time).toISOString(),
            end_time: new Date(end_time).toISOString(),
            description: request.reason || "Blocked slots",
          },
        });
        if (actionRes.error) return { error: actionRes.error };

        return { data: actionRes.data as any };
      },
      invalidatesTags: ["Slots", "Calendar"],
    }),

    addHoliday: builder.mutation<ApiResponse, AddHolidayRequest>({
      queryFn: async () => {
        return { data: { success: true, message: "Holiday added successfully (simulation)" } };
      },
      invalidatesTags: ["Schedule", "Calendar"],
    }),

    getHolidays: builder.query<ApiResponse<Holiday[]>, void>({
      queryFn: async () => {
        return { data: { success: true, data: [] } };
      },
      providesTags: ["Schedule"],
      keepUnusedDataFor: 0,
    }),

    deleteHoliday: builder.mutation<
      ApiResponse,
      { month: number; day: number }
    >({
      queryFn: async () => {
        return { data: { success: true, message: "Holiday deleted successfully (simulation)" } };
      },
      invalidatesTags: ["Schedule", "Calendar"],
    }),
  }),
});

export const {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useGetScheduleListQuery,
  useGetCalendarViewQuery,
  useGetSlotDetailsQuery,
  useBulkSlotOperationMutation,
  useAddHolidayMutation,
  useGetHolidaysQuery,
  useDeleteHolidayMutation,
} = scheduleApi;
