import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseApi";

// get all invoices data /api/garage-dashboard/invoices  query params page, limit, search
export interface InvoicesResponse {
    success: boolean;
    message: string;
    data: Invoice[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface Invoice {
    id: string;
    invoice_number: string;
    garage_id: string;
    membership_period: string;
    issue_date: string;
    due_date: string;
    amount: string;
    status: "PAID" | "PENDING" | "OVERDUE";
    created_at: string;
    pdf_url: string;
}

export interface InvoiceResponse {
    success: boolean;
    message: string;
    data: Invoice;
}


export const invoicesApi = createApi({
    reducerPath: "invoicesApi",
    baseQuery,
    tagTypes: ["Invoices"],
    endpoints: (builder) => ({
        getInvoices: builder.query<InvoicesResponse, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = "" }) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (search) params.append("search", search);
                return `/api/invoice?${params.toString()}`;
            },
            transformResponse: (response: any) => {
                const invoices = response?.data || [];
                const total = response?.meta_data?.total || 0;
                const page = response?.meta_data?.page || 1;
                const limit = response?.meta_data?.limit || 10;
                const totalPages = Math.ceil(total / limit) || 1;

                return {
                    success: true,
                    message: response?.message || "Invoices fetched successfully",
                    data: invoices.map((inv: any) => ({
                        id: inv.id,
                        invoice_number: inv.invoice_number || `INV-${inv.id.slice(0, 8).toUpperCase()}`,
                        garage_id: inv.garage_id || "",
                        membership_period: inv.membership_period || "Monthly",
                        issue_date: inv.issue_date || inv.created_at,
                        due_date: inv.due_date || inv.created_at,
                        amount: inv.amount ? `£${(Number(inv.amount) / 100).toFixed(2)}` : "£0.00",
                        status: inv.status || "PENDING",
                        created_at: inv.created_at,
                        pdf_url: inv.pdf_url || "",
                    })),
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages,
                    },
                };
            },
            providesTags: ["Invoices"],
            keepUnusedDataFor: 0, 
        }),
        // get invoice by id api/invoice/:id
        getInvoiceById: builder.query<InvoiceResponse, string>({
            query: (id) => `/api/invoice/${id}`,
            transformResponse: (response: any) => {
                const inv = response?.data || {};
                return {
                    success: true,
                    message: response?.message || "Invoice fetched successfully",
                    data: {
                        id: inv.id,
                        invoice_number: inv.invoice_number || `INV-${inv.id.slice(0, 8).toUpperCase()}`,
                        garage_id: inv.garage_id || "",
                        membership_period: inv.membership_period || "Monthly",
                        issue_date: inv.issue_date || inv.created_at,
                        due_date: inv.due_date || inv.created_at,
                        amount: inv.amount ? `£${(Number(inv.amount) / 100).toFixed(2)}` : "£0.00",
                        status: inv.status || "PENDING",
                        created_at: inv.created_at,
                        pdf_url: inv.pdf_url || "",
                    },
                };
            },
            providesTags: ["Invoices"],
            keepUnusedDataFor: 0,
        }),

        // download invoice (simulated)
        downloadInvoice: builder.mutation<{
            success: boolean;
            message: string;
            data: {
                pdf_url: string;
                invoice_id: string;
                invoice_number: string;
            };
        }, string>({
            queryFn: async (id) => {
                return {
                    data: {
                        success: true,
                        message: "Invoice download started (simulation)",
                        data: {
                            pdf_url: "#",
                            invoice_id: id,
                            invoice_number: "INV-MOCK",
                        },
                    },
                };
            },
            invalidatesTags: ["Invoices"],
        }),
    }),
});

export const { useGetInvoicesQuery, useGetInvoiceByIdQuery, useDownloadInvoiceMutation } = invoicesApi;