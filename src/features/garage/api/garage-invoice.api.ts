import { apiSlice } from "@/lib/api/api-slice";
import { InvoicesResponse, DetailedInvoiceResponse } from "../types";

export const invoicesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<
      InvoicesResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        if (search) params.append("search", search);
        return `/api/invoice?${params.toString()}`;
      },
      providesTags: ["Invoice"],
      keepUnusedDataFor: 0,
    }),

    getInvoiceById: builder.query<DetailedInvoiceResponse, string>({
      query: (id) => `/api/invoice/${id}`,
      providesTags: ["Invoice"],
      keepUnusedDataFor: 0,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useLazyGetInvoiceByIdQuery,
} = invoicesApi;
