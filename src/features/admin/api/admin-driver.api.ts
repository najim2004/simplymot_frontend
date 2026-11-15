import { apiSlice } from "@/lib/api/api-slice";
import { PAGINATION_CONFIG } from "@/config/pagination.config";
import type { Pagination } from "@/types";

export type Driver = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  avatar?: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
  approved_at?: string | null;
  email_verified_at?: string | null;
  banned_at?: string | null;
  availability?: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  zip_code?: string | null;
  post_code?: string | null;
  gender?: string | null;
  role?: string | null;
  kind?: string | null;
  vehicles_count?: number;
  bookings_count?: number;
  _count?: {
    vehicles?: number;
    bookings?: number;
  };
  vehicle_registration_number?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
};

export type MotDefect = {
  id: string;
  type: string;
  text: string;
  dangerous: boolean;
};

export type MotHistoryItem = {
  id: string;
  test_number: string | null;
  test_date: string | null;
  expiry_date: string | null;
  status: string | null;
  odometer_value: number | null;
  odometer_unit: string | null;
  odometer_result_type?: string | null;
  defects?: MotDefect[];
};

export type DriverVehicle = {
  id: string;
  registration_number: string;
  make: string | null;
  model: string | null;
  color: string | null;
  fuel_type: string | null;
  year_of_manufacture: number | null;
  mot_status: string | null;
  mot_expiry_date: string | null;
  tax_status: string | null;
  tax_due_date: string | null;
  created_at: string;
  mot_history?: MotHistoryItem[];
};

export type DriverBooking = {
  id: string;
  order_date: string;
  status: string;
  total_amount: number | string | null;
  garage?: {
    id: string;
    garage_name: string | null;
    garage_image: string | null;
    contact_email: string | null;
    phone_number: string | null;
    address: string | null;
    city: string | null;
    post_code: string | null;
  } | null;
  vehicle?: {
    id: string;
    registration_number: string;
    make: string | null;
    model: string | null;
  } | null;
};

export type TDriverDetails = Driver & {
  vehicles: DriverVehicle[];
  bookings: DriverBooking[];
  date_of_birth?: string | null;
};

export type DriversResponseData = {
  drivers: Driver[];
  pagination: Pagination;
};

export type DriversAPIResponse = {
  success: boolean;
  data: DriversResponseData;
};

export type TDriversDetailsAPIResponse = {
  success: boolean;
  data: TDriverDetails;
};

export const driversApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllDrivers: builder.query<
      DriversAPIResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        startdate?: string;
        enddate?: string;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append("search", params.search);
        if (params.status && params.status !== "all") {
          queryParams.append("status", params.status.toUpperCase());
        }
        if (params.startdate) queryParams.append("startdate", params.startdate);
        if (params.enddate) queryParams.append("enddate", params.enddate);

        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString()
        );

        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString()
        );

        return {
          url: `/api/admin/drivers?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        const data = response?.data;
        const driversList = Array.isArray(data)
          ? data
          : data?.drivers || [];
        const pagination = data?.pagination || {
          total: response?.meta_data?.total || driversList.length,
          page: response?.meta_data?.page || 1,
          limit: response?.meta_data?.limit || 10,
          totalPages: Math.ceil(
            (response?.meta_data?.total || driversList.length) /
              (response?.meta_data?.limit || 10)
          ) || 1,
        };

        return {
          success: true,
          data: {
            drivers: driversList,
            pagination,
          },
        };
      },
      providesTags: ["Driver"],
    }),

    getADriverDetails: builder.query<TDriversDetailsAPIResponse, string>({
      query: (id) => ({
        url: `/api/admin/drivers/${id}`,
        method: "GET",
      }),
      providesTags: ["Driver"],
    }),

    banDriver: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/admin/drivers/${id}/ban`,
        method: "POST",
      }),
      invalidatesTags: ["Driver"],
    }),

    unbanDriver: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/admin/drivers/${id}/unban`,
        method: "POST",
      }),
      invalidatesTags: ["Driver"],
    }),

    toggleBanDriver: builder.mutation<{ success: boolean; message: string; data?: any }, string>({
      query: (id) => ({
        url: `/api/admin/drivers/${id}/toggle-ban`,
        method: "POST",
      }),
      invalidatesTags: ["Driver"],
    }),

    deleteDriver: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/api/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Driver"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllDriversQuery,
  useGetADriverDetailsQuery,
  useBanDriverMutation,
  useUnbanDriverMutation,
  useToggleBanDriverMutation,
  useDeleteDriverMutation,
} = driversApi;
