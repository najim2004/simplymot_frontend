import { apiSlice } from "@/lib/api/api-slice";

export interface ContactMessageRequest {
  name: string;
  email: string;
  phone_number: string;
  message: string;
}

export interface ContactMessageResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const driverContactApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createContactMessage: builder.mutation<ContactMessageResponse, ContactMessageRequest>({
      query: (body) => ({
        url: "/api/contact",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateContactMessageMutation } = driverContactApis;
