export interface VehicleData {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  color?: string | null;
  fuel_type?: string | null;
  engine_capacity?: number | null;
  co2_emissions?: number | null;
  mot_status?: string | null;
  is_expired?: boolean;
  mot_expiry_date?: string | null;
  mot_last_checked_at?: string | null;
  reminder_last_sent_at?: string | null;
  year_of_manufacture?: number | null;
  exists_in_account?: boolean;
  vehicle_id?: string;
}

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
  starts_at: string;
  ends_at: string;
  source?: string;
  status?: string;
  bookable?: boolean;
  description?: string | null;
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

export interface GarageServicesApiResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export interface BookSlotRequest {
  garage_id: string;
  vehicle_id: string;
  service_type: string;
  additional_services?: string;
  slot_id?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
}

export interface BookSlotResponse {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
    order_id?: string;
    total_amount?: number | string;
    status?: string;
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

export interface ApiVehicle {
  id: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  registration_number: string;
  make: string;
  model: string;
  color?: string;
  fuel_type?: string;
  year_of_manufacture?: number | null;
  engine_capacity?: number | null;
  co2_emissions?: number | null;
  mot_status?: string | null;
  is_expired?: boolean | null;
  mot_expiry_date?: string | null;
  mot_last_checked_at?: string | null;
  tax_status?: string | null;
  tax_due_date?: string | null;
  revenue_weight?: number | null;
  wheelplan?: string | null;
  type_approval?: string | null;
  month_of_first_reg?: string | null;
  date_of_last_v5c_issued?: string | null;
  marked_for_export?: boolean | null;
  reminder_last_sent_at?: string | null;
  dvla_data?: string | null;
  mot_data?: string | null;
  mot_reports?: MotTest[];
}

export interface VehiclesResponse {
  success: boolean;
  message: string;
  data: ApiVehicle[];
}

export interface AddVehicleResponse {
  success: boolean;
  message: string;
  data?: ApiVehicle | null;
}

export interface DeleteVehicleResponse {
  success: boolean;
  message: string;
  data?: ApiVehicle | null;
}

export interface RefreshMotReportsResponse {
  success: boolean;
  message: string;
}

export interface MotTestDefect {
  dangerous: boolean;
  text: string;
  type: string;
}

export interface MotTest {
  reportId?: string;
  registrationAtTimeOfTest: string | null;
  motTestNumber: string;
  completedDate: string;
  expiryDate: string | null;
  odometerValue: string;
  odometerUnit: string;
  odometerResultType: string;
  testResult: string;
  dataSource: string;
  defects: MotTestDefect[];
}

export interface MotHistoryItem {
  id: string;
  test_date: string;
  status?: string | null;
  odometer_value?: number | null;
  odometer_unit?: string | null;
  odometer_result_type?: string | null;
  data_source?: string | null;
  registration_at_test?: string | null;
}

export interface MotReportsResponse {
  success: boolean;
  message: string;
  data: MotHistoryItem[];
  meta_data?: {
    total: number;
    page: number;
    limit: number;
    filters?: Record<string, any>;
  };
}
