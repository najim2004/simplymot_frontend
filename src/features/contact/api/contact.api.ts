import { apiSlice } from "@/lib/api/api-slice";

export interface ContactMessageRequest {
  garage_name?: string;
  primary_contact_person_name?: string;
  primary_contact?: string;
  name?: string;
  email: string;
  phone_number: string;
  message: string;
  source?: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;
  data?: any;
}

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
