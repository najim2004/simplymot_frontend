import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

export type Garage = {
  id: string;
  garage_name: string;
  email: string;
  phone_number: string;
  address: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  email_verified_at: string | null;
  vts_number: string;
  primary_contact: string;
};
export type SingleGarage = {
  id: string;
  garage_name: string;
  email: string;
  phone_number: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip_code: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  email_verified_at: string | null;
  vts_number: string;
  primary_contact: string;
};

export type IAGarageResponse = {
  data: SingleGarage;
  pagination: Pagination;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type GaragesResponseData = {
  garages: Garage[];
  pagination: Pagination;
};

export type GaragesAPIResponse = {
  success: boolean;
  data: GaragesResponseData;
};

export const garagesApi = createApi({
  reducerPath: "garagesApi",
  baseQuery,
  tagTypes: ["Garages"],
  endpoints: (builder) => ({
    // Get all garages api/admin/garage?status=&page=&limit=
    getAllGarages: builder.query<
      GaragesAPIResponse,
      { page?: number; limit?: number; status?: string; search?: string; startdate?: string; enddate?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.status) queryParams.append("status", params.status);
        if (params.search) queryParams.append("search", params.search);
        if (params.startdate) queryParams.append("from_date", params.startdate);
        if (params.enddate) queryParams.append("to_date", params.enddate);

        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString()
        );
        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString()
        );

        return {
          url: `/api/admin/garages?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        const garagesList = response?.data || [];
        const total = response?.meta_data?.total || 0;
        const page = response?.meta_data?.page || 1;
        const limit = response?.meta_data?.limit || 10;
        const pages = Math.ceil(total / limit) || 1;
        return {
          success: true,
          data: {
            garages: garagesList,
            pagination: {
              page,
              limit,
              total,
              pages,
            }
          }
        } as any;
      },
      providesTags: ["Garages"],
    }),

    // Get a garage by ID
    getAGarageById: builder.query<IAGarageResponse, string>({
      query: (id) => ({
        url: `/api/admin/garages/${id}`,
        method: "GET",
      }),
      providesTags: ["Garages"],
    }),

    // Approve a garage
    approveAGarage: builder.mutation<
      { success?: boolean; message?: string },
      string
    >({
      queryFn: async (id, api, extraOptions, baseQuery) => {
        const garageRes = await baseQuery({ url: `/api/admin/garages/${id}`, method: "GET" });
        if (garageRes.error) return { error: garageRes.error };
        const ownerEmail = (garageRes.data as any)?.data?.owner?.email;
        if (!ownerEmail) {
          return { error: { status: 400, data: { message: "Owner email not found" } } as any };
        }

        const usersRes = await baseQuery({ url: `/api/admin/users?search=${encodeURIComponent(ownerEmail)}`, method: "GET" });
        if (usersRes.error) return { error: usersRes.error };
        const user = (usersRes.data as any)?.data?.[0];
        if (!user) {
          return { error: { status: 404, data: { message: "Owner user not found" } } as any };
        }

        const approveRes = await baseQuery({
          url: `/api/admin/users/${user.id}/approve`,
          method: "POST",
        });
        if (approveRes.error) return { error: approveRes.error };
        return { data: approveRes.data as any };
      },
      invalidatesTags: ["Garages"],
    }),

    // reject a garage /api/admin/garage/:id/reject
    rejectAGarage: builder.mutation<
      { success?: boolean; message?: string },
      string
    >({
      queryFn: async (id, api, extraOptions, baseQuery) => {
        const garageRes = await baseQuery({ url: `/api/admin/garages/${id}`, method: "GET" });
        if (garageRes.error) return { error: garageRes.error };
        const ownerEmail = (garageRes.data as any)?.data?.owner?.email;
        if (!ownerEmail) {
          return { error: { status: 400, data: { message: "Owner email not found" } } as any };
        }

        const usersRes = await baseQuery({ url: `/api/admin/users?search=${encodeURIComponent(ownerEmail)}`, method: "GET" });
        if (usersRes.error) return { error: usersRes.error };
        const user = (usersRes.data as any)?.data?.[0];
        if (!user) {
          return { error: { status: 404, data: { message: "Owner user not found" } } as any };
        }

        const rejectRes = await baseQuery({
          url: `/api/admin/users/${user.id}/reject`,
          method: "POST",
        });
        if (rejectRes.error) return { error: rejectRes.error };
        return { data: rejectRes.data as any };
      },
      invalidatesTags: ["Garages"],
    }),

    // Create a garage
    createGarage: builder.mutation<Garage, Partial<Garage>>({
      query: (body) => ({
        url: `/api/admin/users`,
        method: "POST",
        body: {
          email: body.email,
          name: body.garage_name || body.primary_contact || "Garage Owner",
          password: "Password123!",
          kind: "GARAGE",
          phone_number: body.phone_number,
        },
      }),
      invalidatesTags: ["Garages"],
    }),

    // Delete a garage
    deleteGarage: builder.mutation<
      { success?: boolean; message?: string },
      string
    >({
      queryFn: async (id, api, extraOptions, baseQuery) => {
        const garageRes = await baseQuery({ url: `/api/admin/garages/${id}`, method: "GET" });
        if (garageRes.error) return { error: garageRes.error };
        const ownerEmail = (garageRes.data as any)?.data?.owner?.email;
        if (!ownerEmail) {
          return { error: { status: 400, data: { message: "Owner email not found" } } as any };
        }

        const usersRes = await baseQuery({ url: `/api/admin/users?search=${encodeURIComponent(ownerEmail)}`, method: "GET" });
        if (usersRes.error) return { error: usersRes.error };
        const user = (usersRes.data as any)?.data?.[0];
        if (!user) {
          return { error: { status: 404, data: { message: "Owner user not found" } } as any };
        }

        const deleteRes = await baseQuery({
          url: `/api/admin/users/${user.id}`,
          method: "DELETE",
        });
        if (deleteRes.error) return { error: deleteRes.error };
        return { data: deleteRes.data as any };
      },
      invalidatesTags: ["Garages"],
    }),
  }),
});

export const {
  useGetAllGaragesQuery,
  useGetAGarageByIdQuery,
  useCreateGarageMutation,
  useApproveAGarageMutation,
  useRejectAGarageMutation,
  useDeleteGarageMutation,
} = garagesApi;
