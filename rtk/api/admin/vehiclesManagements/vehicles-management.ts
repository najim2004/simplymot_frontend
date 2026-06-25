import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type VehicleUser = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
};

export type Vehicle = {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  color: string;
  mot_expiry_date: string;
  user: VehicleUser;
  created_at?: string;
  updated_at?: string;
};

export type VehiclesResponseData = {
  vehicles: Vehicle[];
  pagination: Pagination;
};

export type VehiclesAPIResponse = {
  success: boolean;
  data: VehiclesResponseData;
};

export type TVehicleDetails = {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  color: string;
  mot_expiry_date: string;
  user: VehicleUser;
  created_at?: string;
  updated_at?: string;
};

export type TVehicleDetailsAPIResponse = {
  success: boolean;
  data: TVehicleDetails;
};

export const vehiclesApi = createApi({
  reducerPath: "vehiclesApi",
  baseQuery,
  tagTypes: ["Vehicles", "AutoReminderSettings"],
  endpoints: (builder) => ({
    // GET ALL VEHICLES
    getAllVehicles: builder.query<
      VehiclesAPIResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        startdate?: string;
        enddate?: string;
        sort_by_expiry?: "asc" | "desc";
        expiry_status?: "all" | "expired" | "expired_soon" | "not_expired";
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        // optional filters
        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);

        // date filters
        if (params.startdate) queryParams.append("from_date", params.startdate);
        if (params.enddate) queryParams.append("to_date", params.enddate);

        // sort and expiry status filters
        if (params.sort_by_expiry) queryParams.append("sort_by_expiry", params.sort_by_expiry);
        if (params.expiry_status) queryParams.append("expiry_status", params.expiry_status);

        // pagination
        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString()
        );

        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString()
        );

        return {
          url: `/api/admin/vehicles?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        const list = response?.data || [];
        const total = response?.meta_data?.total || 0;
        const page = response?.meta_data?.page || 1;
        const limit = response?.meta_data?.limit || 10;
        const pages = Math.ceil(total / limit) || 1;

        return {
          success: true,
          data: {
            vehicles: list.map((item: any) => ({
              id: item.id,
              registration_number: item.registration_number,
              make: item.make || "N/A",
              model: item.model || "N/A",
              color: item.color || "N/A",
              mot_expiry_date: item.mot_expiry_date,
              user: {
                id: item.vehicle_owner_id,
                name: item.vehicle_owner_name || "N/A",
                email: item.vehicle_owner_email || "N/A",
                phone_number: item.vehicle_owner_phone_number || "N/A",
              },
            })),
            pagination: {
              page,
              limit,
              total,
              pages,
            },
          },
        };
      },
      providesTags: ["Vehicles"],
      keepUnusedDataFor: 0,
    }),

    // Get a vehicle details
    getAVehicleDetails: builder.query<
      TVehicleDetailsAPIResponse,
      string
    >({
      query: (id) => ({
        url: `/api/admin/vehicles/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const item = response?.data || {};
        return {
          success: true,
          data: {
            id: item.id,
            registration_number: item.registration_number,
            make: item.make || "N/A",
            model: item.model || "N/A",
            color: item.color || "N/A",
            mot_expiry_date: item.mot_expiry_date,
            user: {
              id: item.vehicle_owner?.id || "",
              name: item.vehicle_owner?.name || "N/A",
              email: item.vehicle_owner?.email || "N/A",
              phone_number: item.vehicle_owner?.phone_number || "N/A",
            },
            created_at: item.created_at,
            updated_at: item.updated_at,
          },
        } as any;
      },
      providesTags: ["Vehicles"],
      keepUnusedDataFor: 0,
    }),


    // delete (simulated)
    deleteVehicle: builder.mutation<any, string>({
      queryFn: async (id) => {
        return { data: { success: true, message: `Vehicle ${id} deleted successfully (simulation)` } };
      },
      invalidatesTags: ["Vehicles"],
    }),
 
    // auto reminder (simulated)
    patchAutoReminderSettings: builder.mutation<
      any,
      { reminderPeriods: number[]; autoReminder: boolean; reminderMessage: string }
    >({
      queryFn: async (body) => {
        return { data: { success: true, message: "Reminder settings updated (simulation)" } };
      },
      invalidatesTags: ["AutoReminderSettings"],
    }),

    // get auto reminder settings (simulated)
    getAutoReminderSettings: builder.query<any, void>({
      queryFn: async () => {
        return {
          data: {
            success: true,
            data: {
              reminderPeriods: [1, 7, 30],
              autoReminder: true,
              reminderMessage: "Your MOT is expiring soon.",
            },
          },
        };
      },
      providesTags: ["AutoReminderSettings"],
      keepUnusedDataFor: 0,
    }), 

  }),
});

export const {
  useGetAllVehiclesQuery,
  useGetAVehicleDetailsQuery,
  useDeleteVehicleMutation,
  usePatchAutoReminderSettingsMutation,
  useGetAutoReminderSettingsQuery,
} = vehiclesApi;
