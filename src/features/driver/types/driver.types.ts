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
  created_at: string;
  updated_at: string;
  user_id: string;
  registration_number: string;
  make: string;
  model: string;
  color: string;
  fuel_type: string;
  year_of_manufacture: number;
  engine_capacity: number;
  co2_emissions: number;
  mot_expiry_date: string;
  dvla_data: string;
  mot_data: string;
  mot_reports: any[];
}

export interface VehiclesResponse {
  success: boolean;
  message: string;
  data: ApiVehicle[];
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

export interface MotReportsResponse {
  registration: string;
  make: string;
  model: string;
  firstUsedDate: string;
  fuelType: string;
  primaryColour: string;
  mot_tests: MotTest[];
}
