import { apiSlice } from "@/lib/api/api-slice";
import {
  ProfileResponse,
  UpdateProfileResponse,
} from "../types";

export * from "../types";

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGarageProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/api/garages",
        method: "GET",
      }),
      providesTags: ["Garage"],
    }),
    updateGarageProfile: builder.mutation<
      UpdateProfileResponse,
      { id: string; body: FormData | Record<string, unknown> } | FormData | Record<string, unknown>
    >({
      query: (arg) => {
        if (arg && typeof arg === "object" && "id" in arg && "body" in arg) {
          return {
            url: `/api/garages/${(arg as { id: string; body: unknown }).id}`,
            method: "PATCH",
            body: (arg as { id: string; body: unknown }).body,
          };
        }
        const id = arg instanceof FormData ? arg.get("id") : (arg as Record<string, unknown>)?.id;
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

export const { useGetGarageProfileQuery, useUpdateGarageProfileMutation } = profileApi;
