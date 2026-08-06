import { apiSlice } from "@/lib/api/api-slice";

export interface GarageProfile {
  id: string;
  garage_name: string;
  address: string;
  zip_code: string;
  email: string;
  vts_number: string;
  primary_contact: string;
  phone_number: string;
  avatar: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  mot_price: number;
  avatar_url: string | null;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: GarageProfile;
}

export interface UpdateProfileRequest {
  garage_name: string;
  address?: string;
  zip_code?: string;
  email?: string;
  vts_number?: string;
  primary_contact?: string;
  phone_number?: string;
  avatar?: File | null | string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: GarageProfile;
}

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const [authRes, garageRes] = await Promise.all([
          baseQuery({ url: "/api/auth/me", method: "GET" }),
          baseQuery({ url: "/api/garages", method: "GET" }),
        ]);

        if (authRes.error) return { error: authRes.error };
        if (garageRes.error) return { error: garageRes.error };

        const user = (authRes.data as any)?.data || {};
        const garage = (garageRes.data as any)?.data || {};

        const nameParts = (user.name || "").split(" ");
        const first_name = nameParts[0] || null;
        const last_name = nameParts.slice(1).join(" ") || null;

        return {
          data: {
            success: true,
            message: "Profile fetched successfully",
            data: {
              id: garage.id || user.id,
              garage_name: garage.garage_name || "Garage Name",
              address: garage.address || user.address || "",
              zip_code: user.zip_code || "",
              email: user.email || garage.contact_email || "",
              vts_number: garage.vts_number || "",
              primary_contact: user.name || "",
              phone_number: garage.phone_number || user.phone_number || "",
              avatar: user.avatar || null,
              avatar_url: user.avatar_url || null,
              first_name,
              last_name,
              created_at: user.created_at || new Date().toISOString(),
              updated_at: user.updated_at || new Date().toISOString(),
              mot_price: garage.mot_price || 0,
            },
          },
        };
      },
      providesTags: ["Garage"],
    }),
    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileRequest | FormData
    >({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;

        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found for current user" } } as any };
        }

        let fields: any = {};
        let avatarFile: any = null;

        if (arg instanceof FormData) {
          const formDataObj: any = {};
          arg.forEach((value, key) => {
            formDataObj[key] = value;
          });
          fields = formDataObj;
          avatarFile = arg.get("avatar");
        } else {
          fields = arg;
          avatarFile = arg.avatar;
        }

        const authUpdateBody = new FormData();
        const primaryContactName = fields.primary_contact || (fields.first_name || fields.last_name ? `${fields.first_name || ""} ${fields.last_name || ""}`.trim() : null);
        if (primaryContactName) {
          authUpdateBody.append("name", primaryContactName);
        }
        if (fields.phone_number) {
          authUpdateBody.append("phone_number", fields.phone_number);
        }
        if (avatarFile && (avatarFile instanceof File || typeof avatarFile === "object")) {
          authUpdateBody.append("avatar", avatarFile);
        }

        const authUpdateRes = await baseQuery({
          url: "/api/auth/update",
          method: "PATCH",
          body: authUpdateBody,
        });

        const garageUpdateBody = new FormData();
        if (fields.garage_name) {
          garageUpdateBody.append("garage_name", fields.garage_name);
        }
        if (fields.address) {
          garageUpdateBody.append("address", fields.address);
        }
        if (fields.phone_number) {
          garageUpdateBody.append("phone_number", fields.phone_number);
        }
        if (fields.vts_number) {
          garageUpdateBody.append("vts_number", fields.vts_number);
        }
        if (fields.email) {
          garageUpdateBody.append("contact_email", fields.email);
        }

        const garageUpdateRes = await baseQuery({
          url: `/api/garages/${garageId}`,
          method: "PATCH",
          body: garageUpdateBody,
        });

        const updatedGarage = (garageUpdateRes.data as any)?.data || {};
        const updatedUser = (authUpdateRes.data as any)?.data || user;

        const nameParts = (updatedUser.name || "").split(" ");
        const first_name = nameParts[0] || null;
        const last_name = nameParts.slice(1).join(" ") || null;

        return {
          data: {
            success: true,
            message: "Profile updated successfully",
            data: {
              id: updatedGarage.id || garageId,
              garage_name: updatedGarage.garage_name || fields.garage_name || "Garage Name",
              address: updatedGarage.address || fields.address || "",
              zip_code: updatedUser.zip_code || fields.zip_code || "",
              email: updatedUser.email || fields.email || "",
              vts_number: updatedGarage.vts_number || fields.vts_number || "",
              primary_contact: updatedUser.name || primaryContactName || "",
              phone_number: updatedGarage.phone_number || fields.phone_number || "",
              avatar: updatedUser.avatar || null,
              avatar_url: updatedUser.avatar_url || null,
              first_name,
              last_name,
              created_at: updatedUser.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              mot_price: updatedGarage.mot_price || fields.mot_price || 0,
            },
          },
        };
      },
      invalidatesTags: ["Garage"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
