import { apiSlice } from "@/lib/api/api-slice";
import type { ContactMessageRequest, ContactMessageResponse } from "../types";

export type { ContactMessageRequest, ContactMessageResponse };

export const contactApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createContactMessage: builder.mutation<
      ContactMessageResponse,
      ContactMessageRequest
    >({
      query: (body) => ({
        url: "/api/contact",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const { useCreateContactMessageMutation } = contactApi;
