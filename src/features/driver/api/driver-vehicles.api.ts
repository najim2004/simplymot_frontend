import { apiSlice } from "@/lib/api/api-slice";
import {
  ApiVehicle,
  VehiclesResponse,
  MotReportsResponse,
} from "../types";

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
