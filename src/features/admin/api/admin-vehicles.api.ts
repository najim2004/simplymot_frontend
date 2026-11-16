import { apiSlice } from "@/lib/api/api-slice";
import { PAGINATION_CONFIG } from "@/config/pagination.config";

import type { Pagination } from "@/types";

export type VehicleUser = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  avatar?: string | null;
  status?: string | null;
};

export type Vehicle = {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  color?: string | null;
  mot_expiry_date: string | null;
  mot_status?: string | null;
  is_expired?: boolean;
  tax_status?: string | null;
  tax_due_date?: string | null;
  created_at?: string | null;
  mot_last_checked_at?: string | null;
  user: VehicleUser;
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

export type VehicleMotDefectItem = {
  id: string;
  type?: string | null;
  text?: string | null;
  dangerous?: boolean;
};

export type VehicleMotHistoryItem = {
  id: string;
  test_number?: string | null;
  test_date?: string | null;
  expiry_date?: string | null;
  status?: string | null;
  odometer_value?: number | null;
  odometer_unit?: string | null;
  odometer_result_type?: string | null;
  data_source?: string | null;
  registration_at_test?: string | null;
  defects?: VehicleMotDefectItem[];
};

export type TVehicleDetails = {
  id: string;
  registration_number: string;
  make?: string | null;
  model?: string | null;
  color?: string | null;
  fuel_type?: string | null;
  engine_capacity?: number | null;
  co2_emissions?: number | null;
  year_of_manufacture?: number | null;
  month_of_first_reg?: string | null;
  wheelplan?: string | null;
  mot_expiry_date?: string | null;
  mot_status?: string | null;
  is_expired?: boolean;
  tax_status?: string | null;
  tax_due_date?: string | null;
  date_of_last_v5c_issued?: string | null;
  mot_last_checked_at?: string | null;
  reminder_last_sent_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user: VehicleUser;
};

export type TVehicleDetailsAPIResponse = {
  success: boolean;
  data: TVehicleDetails;
};

export type VehicleHistoryAPIResponse = {
  success: boolean;
  data: VehicleMotHistoryItem[];
  meta_data?: {
    total?: number;
    page?: number;
    limit?: number;
  };
};

export const vehiclesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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

        if (params.search) queryParams.append("search", params.search);
        if (params.status) queryParams.append("status", params.status);
        if (params.startdate) queryParams.append("from_date", params.startdate);
        if (params.enddate) queryParams.append("to_date", params.enddate);
        if (params.sort_by_expiry)
          queryParams.append("sort_by_expiry", params.sort_by_expiry);
        if (params.expiry_status)
          queryParams.append("expiry_status", params.expiry_status);

        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString(),
        );

        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString(),
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
              make: item.make || "",
              model: item.model || "",
              color: item.color || null,
              mot_expiry_date: item.mot_expiry_date || null,
              mot_status: item.mot_status || null,
              is_expired: Boolean(item.is_expired),
              tax_status: item.tax_status || null,
              tax_due_date: item.tax_due_date || null,
              created_at: item.created_at || null,
              mot_last_checked_at: item.mot_last_checked_at || null,
              user: {
                id: item.vehicle_owner_id,
                name: item.vehicle_owner_name || "N/A",
                email: item.vehicle_owner_email || "N/A",
                phone_number: item.vehicle_owner_phone_number || null,
                avatar: item.vehicle_owner_avatar || null,
                status: item.vehicle_owner_status || null,
              },
            })),
            pagination: {
              page,
              limit,
              total,
              totalPages: pages,
              pages,
            },
          },
        };
      },
      providesTags: ["Vehicle"],
      keepUnusedDataFor: 0,
    }),

    getAVehicleDetails: builder.query<TVehicleDetailsAPIResponse, string>({
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
            make: item.make || null,
            model: item.model || null,
            color: item.color || null,
            fuel_type: item.fuel_type || null,
            engine_capacity: item.engine_capacity ?? null,
            co2_emissions: item.co2_emissions ?? null,
            year_of_manufacture: item.year_of_manufacture ?? null,
            month_of_first_reg: item.month_of_first_reg || null,
            wheelplan: item.wheelplan || null,
            mot_expiry_date: item.mot_expiry_date || null,
            mot_status: item.mot_status || null,
            is_expired: Boolean(item.is_expired),
            tax_status: item.tax_status || null,
            tax_due_date: item.tax_due_date || null,
            date_of_last_v5c_issued: item.date_of_last_v5c_issued || null,
            mot_last_checked_at: item.mot_last_checked_at || null,
            reminder_last_sent_at: item.reminder_last_sent_at || null,
            created_at: item.created_at || null,
            updated_at: item.updated_at || null,
            user: {
              id: item.vehicle_owner?.id || "",
              name: item.vehicle_owner?.name || "N/A",
              email: item.vehicle_owner?.email || "N/A",
              phone_number: item.vehicle_owner?.phone_number || null,
              avatar: item.vehicle_owner?.avatar || null,
              status: item.vehicle_owner?.status || null,
            },
          },
        };
      },
      providesTags: ["Vehicle"],
      keepUnusedDataFor: 0,
    }),

    getVehicleMotHistory: builder.query<
      VehicleHistoryAPIResponse,
      { id: string; page?: number; limit?: number; search?: string }
    >({
      query: ({ id, page = 1, limit = 20, search }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));
        if (search) queryParams.append("search", search);
        return {
          url: `/api/admin/vehicles/${id}/history?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => ({
        success: true,
        data: response?.data || [],
        meta_data: response?.meta_data || {},
      }),
      providesTags: ["Vehicle"],
      keepUnusedDataFor: 0,
    }),

    deleteVehicle: builder.mutation<any, string>({
      queryFn: async (id) => {
        return {
          data: {
            success: true,
            message: `Vehicle ${id} deleted successfully (simulation)`,
          },
        };
      },
      invalidatesTags: ["Vehicle"],
    }),

    patchAutoReminderSettings: builder.mutation<
      any,
      {
        reminderPeriods: number[];
        autoReminder: boolean;
        reminderMessage: string;
      }
    >({
      queryFn: async () => {
        return {
          data: {
            success: true,
            message: "Reminder settings updated (simulation)",
          },
        };
      },
      invalidatesTags: ["Vehicle"],
    }),

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
      providesTags: ["Vehicle"],
      keepUnusedDataFor: 0,
    }),
    sendReminderToDrivers: builder.mutation<
      any,
      {
        receivers: Array<{ receiver_id: string; entity_id: string }>;
        message?: string;
      }
    >({
      queryFn: async () => {
        return {
          data: {
            success: true,
            message: "Reminders sent successfully (simulation)",
          },
        };
      },
      invalidatesTags: ["Vehicle"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllVehiclesQuery,
  useGetAVehicleDetailsQuery,
  useGetVehicleMotHistoryQuery,
  useDeleteVehicleMutation,
  usePatchAutoReminderSettingsMutation,
  useGetAutoReminderSettingsQuery,
  useSendReminderToDriversMutation,
} = vehiclesApi;
