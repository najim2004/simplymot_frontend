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

export interface VehiclesResponse {
  success: boolean;
  message: string;
  data: ApiVehicle[];
}

export interface AddVehicleRequest {
  registration_number: string;
}

export interface AddVehicleForm {
  registration_number: string;
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

export interface MOTReport {
  id: number;
  color: string;
  fuelType: string;
  registrationDate: string;
  motTestNumber: string;
  motPassDate: string;
  motExpiryDate: string;
  motStatus: "Pass" | "Fail";
}

export interface MOTReportVehicle {
  id: number;
  apiVehicleId?: string;
  registrationNumber: string;
  expiryDate: string;
  roadTax: string;
  make: string;
  model: string;
  year?: number;
  image: string;
  motReport: MOTReport[];
}

export interface MotReportWithVehicle extends MOTReport {
  vehicleId?: string;
  vehicleReg?: string;
  vehicleImage?: string;
  vehicleMake?: string;
  vehicleModel?: string;
}

export type TabType = "View All";
export const TABS: readonly TabType[] = ["View All"] as const;
