export interface BreakTimeItem {
  id: string;
  start_time: string;
  end_time: string;
  description: string | null;
  schedule_interval_id: string;
}

export interface ScheduleIntervalItem {
  id: string;
  day_of_week: string;
  is_closed: boolean;
  slot_duration: number;
  buffer_time: number;
  open_time: string | null;
  close_time: string | null;
  break_times: BreakTimeItem[];
}

export interface GarageScheduleData {
  id: string;
  garage_id: string;
  schedule_intervals: ScheduleIntervalItem[];
}

export interface GetScheduleResponse {
  success: boolean;
  message: string;
  data: GarageScheduleData;
}

export interface UpsertScheduleIntervalInput {
  id?: string;
  day_of_week: string;
  is_closed: boolean;
  slot_duration: number;
  buffer_time?: number;
  open_time: string | null;
  close_time: string | null;
  break_times?: Array<{
    start_time: string;
    end_time: string;
    description?: string;
  }>;
}

export interface UpsertScheduleRequest {
  schedule_intervals: UpsertScheduleIntervalInput[];
}

export type ScheduleRequest = UpsertScheduleRequest;

export interface SlotItem {
  id: string;
  starts_at: string;
  ends_at: string;
  source: string; // "REGULAR" | "BREAK" | "HOLIDAY"
  status: string; // "AVAILABLE" | "BOOKED" | "BLOCKED" | "BREAK" | "PAST"
  bookable: boolean;
  description: string | null;
}

export interface SlotsSummary {
  total_slots: number;
  past_slots: number;
  break_slots: number;
  available_slots: number;
  booked_slots: number;
  blocked_slots: number;
  bookable_slots: number;
}

export interface GarageSlotsData {
  garage_id: string;
  schedule_id: string;
  date: string;
  day_of_week: string;
  is_closed: boolean;
  is_holiday: boolean;
  holiday_name: string | null;
  slot_duration: number;
  buffer_time: number;
  open_time: string;
  close_time: string;
  slots: SlotItem[];
  summary: SlotsSummary;
}

export interface GetGarageSlotsResponse {
  success: boolean;
  message?: string;
  data?: GarageSlotsData;
}

export interface BlockUnblockSlotsDto {
  id?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
}

export interface BulkSlotRequest {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  action: "BLOCK" | "UNBLOCK";
  reason?: string;
}

export interface HolidayItem {
  id: string;
  schedule_id?: string;
  date: string;
  name?: string | null;
  description?: string | null;
  month?: number;
  day?: number;
}

export type Holiday = HolidayItem;

export interface AddHolidayRequest {
  date: string;
  name?: string;
}
