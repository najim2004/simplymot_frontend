export interface VehicleData {
  registration_number: string;
  make: string;
  model: string;
  color: string;
  fuel_type: string;
  mot_expiry_date: string;
  exists_in_account: boolean;
  vehicle_id: string;
}

export interface GarageData {
  id: string;
  garage_name: string;
  address: string;
  postcode: string;
  vts_number: string;
  primary_contact: string;
  phone_number: string;
  avatar?: string;
  email?: string;
  distance_miles?: number;
  mot_price?: number;
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
  data: {
    vehicle: VehicleData;
    garages: GarageData[];
  };
  meta_data: {
    total_count: number;
    search_postcode: string;
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

export interface GarageServicesResponse {
  garage: GarageServiceGarage;
  services: Service[];
  additionals: Additional[];
  schedule: Schedule;
}

export interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  date: string;
  status?: string[];
  has_id: boolean;
}

export interface GarageSlotsResponse {
  slots: Slot[];
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
