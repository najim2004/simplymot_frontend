import { apiSlice } from "@/lib/api/api-slice";
import {
  VehiclesResponse,
  MotReportsResponse,
  AddVehicleResponse,
  DeleteVehicleResponse,
  RefreshMotReportsResponse,
} from "../types";

export const vehiclesApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addVehicle: builder.mutation<
      AddVehicleResponse,
      { registration_number: string }
    >({
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
    deleteVehicle: builder.mutation<DeleteVehicleResponse, string>({
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
      providesTags: (result, error, { id }) => [
        { type: "Vehicle", id },
        { type: "Vehicle", id: `MOT_${id}` },
      ],
    }),
    refreshMotReports: builder.mutation<RefreshMotReportsResponse, string>({
      query: (id) => ({
        url: `/api/vehicle/${id}/mot_history`,
        method: "GET",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Vehicle", id: `MOT_${id}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddVehicleMutation,
  useGetVehiclesQuery,
  useDeleteVehicleMutation,
  useGetVehicleMotReportsQuery,
  useLazyGetVehicleMotReportsQuery,
  useRefreshMotReportsMutation,
} = vehiclesApis;
