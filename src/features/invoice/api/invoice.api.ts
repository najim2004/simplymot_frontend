import { apiSlice } from "@/lib/api/api-slice";
import type {
  InvoicesResponse,
  DetailedInvoiceResponse,
  GetInvoicesQueryParams,
} from "../types";

export const invoiceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<InvoicesResponse, GetInvoicesQueryParams | void>({
      query: (params) => ({
        url: "/api/invoice",
        params: params || undefined,
      }),
      providesTags: ["Invoice"],
    }),

    getInvoiceById: builder.query<DetailedInvoiceResponse, string>({
      query: (id) => `/api/invoice/${id}`,
      providesTags: ["Invoice"],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useLazyGetInvoiceByIdQuery,
} = invoiceApi;

// Alias for backwards compatibility
export { invoiceApi as invoicesApi };
