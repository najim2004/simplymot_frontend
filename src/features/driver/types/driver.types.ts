import type { VehicleData } from "@/features/vehicle";

export interface GarageData {
  id: string;
  garage_name: string;
  address?: string | null;
  post_code?: string | null;
  postcode?: string | null;
  vts_number?: string | null;
  primary_contact?: string | null;
  phone_number?: string | null;
  email?: string | null;
  garage_image?: string | null;
  avatar?: string | null;
  mot_price?: number | null;
  total_bookings?: number;
  exact_post_code_match?: boolean;
  distance_miles?: number | null;
  has_class7?: boolean;
}

export enum GarageSortBy {
  DISTANCE = "DISTANCE",
  PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH",
  PRICE_HIGH_TO_LOW = "PRICE_HIGH_TO_LOW",
}

export interface SearchRequest {
  registration_number: string;
  postcode: string;
  page?: number;
  limit?: number;
  sort_by?: GarageSortBy;
}

export interface SearchResponse {
  success: boolean;
  message?: string;
  data: {
    vehicle: VehicleData;
    garages: GarageData[];
  };
  meta_data: {
    page?: number;
    limit?: number;
    total?: number;
    total_count?: number;
    vehicle_registration_number?: string;
    post_code?: string;
    search_postcode?: string;
    filters?: {
      sort?: string;
      sort_order?: string;
    };
  };
}

export interface GarageServiceGarage {
  id: string;
  garage_name: string;
  address: string | null;
  zip_code: string;
  vts_number: string;
  primary_contact: string;
  phone_number: string;
  email: string;
  avatar?: string;
}

export interface ScheduleRestriction {
  type: string;
  end_time: string;
  start_time: string;
  day_of_week: number[];
  description: string;
}

export interface DailyHoursInterval {
  end_time: string;
  start_time: string;
}

export interface DailyHours {
  is_closed?: boolean;
  intervals?: DailyHoursInterval[];
  slot_duration?: number;
}

export interface Schedule {
  id: string;
  start_time: string;
  end_time: string;
  slot_duration: number;
  restrictions: ScheduleRestriction[];
  daily_hours: {
    [key: string]: DailyHours;
  };
  is_active: boolean;
}

export interface Service {
  id: string;
  name: string;
  type: string;
  price: number;
  class_number?: number | null;
}

export interface Additional {
  id: string;
  name: string;
  type: string;
}

export interface SlotItem {
  id?: string;
  starts_at?: string;
  ends_at?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  source?: string;
  status?: string;
  bookable?: boolean;
  description?: string | null;
}

export type Slot = SlotItem;

export interface BookSlotRequest {
  garage_id: string;
  slot_id?: string;
  starts_at?: string;
  ends_at?: string;
  additional_services?: string;
  service_type?: string;
  vehicle_id?: string;
  /** Pass registration number directly — backend will find-or-create the vehicle */
  vehicle_registration_number?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

export interface GarageSlotsData {
  garage_id?: string;
  schedule_id?: string;
  date?: string;
  day_of_week?: string;
  is_closed?: boolean;
  is_holiday?: boolean;
  holiday_name?: string | null;
  slot_duration?: number;
  buffer_time?: number;
  open_time?: string;
  close_time?: string;
  slots: SlotItem[];
  summary?: {
    total_slots?: number;
    past_slots?: number;
    break_slots?: number;
    available_slots?: number;
    booked_slots?: number;
    blocked_slots?: number;
    bookable_slots?: number;
  };
}

export interface GarageSlotsApiResponse {
  success: boolean;
  message?: string;
  data?: GarageSlotsData;
}

export interface MotServiceItem {
  id: string;
  title: string;
  price: string | number;
  type: string;
  vehicle_class?: string;
}

export interface MotClassGroup {
  vehicle_class: string;
  mot?: MotServiceItem;
  mot_retest?: MotServiceItem;
}

export interface OtherServiceItem {
  id: string;
  title: string;
  price: string | number;
  type: string;
  vehicle_class?: string | null;
}

export interface ScheduleIntervalItem {
  id: string;
  day_of_week: string;
  is_closed: boolean;
  slot_duration: number;
  buffer_time?: number;
  open_time: string | null;
  close_time: string | null;
}

export interface GarageDetailsData {
  id: string;
  garage_name: string;
  vts_number?: string;
  contact_email?: string;
  phone_number?: string;
  address?: string;
  post_code?: string;
  garage_image?: string | null;
  services?: {
    mot_services?: MotClassGroup[];
    other_services?: OtherServiceItem[];
  };
  schedule?: {
    id?: string;
    schedule_intervals?: ScheduleIntervalItem[];
  };
}

export interface GarageServicesApiResponse {
  success: boolean;
  message?: string;
  data?: GarageDetailsData;
}




export interface BookSlotResponse {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
    order_id?: string;
    total_amount?: number | string;
    status?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
    additional_services?: string;
    garage?: {
      id?: string;
      garage_name?: string;
      address?: string;
      phone_number?: string;
      email?: string;
      avatar?: string;
    };
    vehicle?: {
      id?: string;
      registration_number?: string;
      make?: string;
      model?: string;
    };
    slot?: {
      starts_at?: string;
      ends_at?: string;
      start_time?: string;
      end_time?: string;
      date?: string;
    };
    [key: string]: unknown;
  };
}

export interface GetMyBookingsRequest {
  search: string;
  status: string;
  page: number;
  limit: number;
}

export interface BookingRecord {
  id: string;
  created_at: string;
  order_date?: string;
  status: string;
  total_amount?: number | string;
  garage_id: string;
  additional_services?: string;
  vehicle?: {
    id: string;
    registration_number: string;
    make?: string;
    model?: string;
  };
  garage?: {
    id: string;
    garage_name: string;
    address?: string;
    phone_number?: string;
    avatar?: string;
    garage_image?: string;
  };
  slot?: {
    starts_at?: string;
    ends_at?: string;
    start_time?: string;
    end_time?: string;
    date?: string;
  };
}

export interface GetMyBookingsResponse {
  success: boolean;
  message?: string;
  data?: BookingRecord[];
  meta_data?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CancelMyBookingRequest {
  id: string;
  reason: string;
}

export interface RescheduleMyBookingRequest {
  id: string;
  slot_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface BookingMutationResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}


