import { apiSlice } from "@/lib/api/api-slice";
import {
  ProfileResponse,
  UpdateProfileResponse,
} from "../types";

export * from "../types";

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/api/garages",
        method: "GET",
      }),
      providesTags: ["Garage"],
    }),
    updateProfile: builder.mutation<
      UpdateProfileResponse,
      { id: string; body: FormData | Record<string, any> } | FormData | Record<string, any>
    >({
      query: (arg) => {
        if (arg && typeof arg === "object" && "id" in arg && "body" in arg) {
          return {
            url: `/api/garages/${arg.id}`,
            method: "PATCH",
            body: arg.body,
          };
        }
        const id = arg instanceof FormData ? arg.get("id") : (arg as any)?.id;
        return {
          url: id ? `/api/garages/${id}` : "/api/garages",
          method: "PATCH",
          body: arg,
        };
      },
      invalidatesTags: ["Garage"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== "production",
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
