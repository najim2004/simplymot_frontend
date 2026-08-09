import { apiSlice } from "@/lib/api/api-slice";
import {
  ServicesBundleResponse,
  UpsertServiceDto,
  UpsertServiceResponse,
  DeleteServiceResponse,
} from "../types";

export const pricingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<ServicesBundleResponse, string>({
      query: (garageId) => `/api/garages/${garageId}/services`,
      providesTags: ["Pricing"],
    }),
    upsertServices: builder.mutation<
      UpsertServiceResponse,
      { garageId: string; body: UpsertServiceDto }
    >({
      query: ({ garageId, body }) => ({
        url: `/api/garages/${garageId}/services`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Pricing"],
    }),
    deleteService: builder.mutation<
      DeleteServiceResponse,
      { garageId: string; id: string }
    >({
      query: ({ garageId, id }) => ({
        url: `/api/garages/${garageId}/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pricing"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const {
  useGetServicesQuery,
  useUpsertServicesMutation,
  useDeleteServiceMutation,
} = pricingApi;
