import { apiSlice } from "@/lib/api/api-slice";

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
  primaryColour: string;
  fuelType: string;
  engineSize: string;
  firstUsedDate: string;
  registrationDate: string;
  manufactureDate: string;
  motExpiryDate: string;
  hasOutstandingRecall: string;
  motTests: MotTest[];
}

export const vehiclesApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addVehicle: builder.mutation<any, { registration_number: string }>({
      query: (body) => ({
        url: `/api/vehicle`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),
    getVehicles: builder.query<VehiclesResponse, void>({
      query: () => ({
        url: `/api/vehicle`,
        method: "GET",
      }),
      providesTags: ["Vehicle"],
    }),
    deleteVehicle: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/vehicle/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicle"],
    }),
    getVehicleMotReports: builder.query<
      MotReportsResponse,
      { id: string; limit: number; page: number; status: string }
    >({
      query: ({ id, limit, page, status }) => ({
        url: `/api/vehicle/${id}/mot_history`,
        method: "GET",
        params: { limit, page, status },
      }),
      providesTags: (result, error, { id }) => [{ type: "Vehicle", id }],
    }),
    refreshMotReports: builder.mutation<any, string>({
      queryFn: async () => {
        return { data: { success: true, message: "MOT history refreshed successfully (simulation)" } };
      },
      invalidatesTags: ["Vehicle"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddVehicleMutation,
  useGetVehiclesQuery,
  useDeleteVehicleMutation,
  useGetVehicleMotReportsQuery,
  useRefreshMotReportsMutation,
} = vehiclesApis;
