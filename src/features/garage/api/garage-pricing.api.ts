import { apiSlice } from "@/lib/api/api-slice";

export interface PricingService {
  id?: string;
  created_at?: string;
  updated_at?: string;
  garage_id?: string;
  name: string;
  type: "MOT" | "RETEST" | "ADDITIONAL";
  price: string | number | null;
  class_number?: number | null;
  userId?: string | null;
}

export interface ClassPricingPayload {
  mot: PricingService | null;
  retest: PricingService | null;
}

export interface Class7PricingPayload extends ClassPricingPayload {
  enabled: boolean;
}

export interface PricingResponsePayload {
  mot: PricingService;
  retest: PricingService;
  class4?: ClassPricingPayload;
  class7?: Class7PricingPayload;
  additionals: PricingService[];
}

export interface CreatePricingRequest {
  mot?: { name: string; price: number };
  retest?: { name: string; price: number };
  class4?: {
    mot: { name: string; price: number };
    retest: { name: string; price: number };
  };
  class7?: {
    enabled: boolean;
    mot?: { name: string; price: number };
    retest?: { name: string; price: number };
  };
  additionals: { name: string }[];
}

export interface CreatePricingResponse {
  success: boolean;
  message: string;
  data: PricingResponsePayload;
}

export const pricingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPricing: builder.mutation<CreatePricingResponse, CreatePricingRequest>({
      queryFn: async (body, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;
        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found" } } as any };
        }

        const services: any[] = [];
        const motObj = body.class4?.mot || body.mot;
        if (motObj) {
          services.push({
            type: "MOT",
            price: Math.round(Number(motObj.price) * 100),
          });
        }
        const retestObj = body.class4?.retest || body.retest;
        if (retestObj) {
          services.push({
            type: "RETEST",
            price: Math.round(Number(retestObj.price) * 100),
          });
        }
        if (body.additionals) {
          body.additionals.forEach((s: any) => {
            services.push({
              id: s.id,
              title: s.name,
              type: "ADDITIONAL",
              price: s.price ? Math.round(Number(s.price) * 100) : 0,
            });
          });
        }

        const upsertRes = await baseQuery({
          url: `/api/garages/${garageId}/services`,
          method: "PUT",
          body: { services },
        });
        if (upsertRes.error) return { error: upsertRes.error };

        const updatedData = (upsertRes.data as any)?.data || [];

        const responseMot = updatedData.find((s: any) => s.type === "MOT") || {};
        const responseRetest = updatedData.find((s: any) => s.type === "RETEST") || {};
        const responseAdditionals = updatedData.filter((s: any) => s.type === "ADDITIONAL").map((s: any) => ({
          id: s.id,
          name: s.title || s.name || "",
          price: s.price !== null && s.price !== undefined ? Number(s.price) / 100 : null,
          type: "ADDITIONAL"
        }));

        return {
          data: {
            success: true,
            message: "Services updated successfully",
            data: {
              mot: { ...responseMot, price: responseMot.price !== null && responseMot.price !== undefined ? Number(responseMot.price) / 100 : null },
              retest: { ...responseRetest, price: responseRetest.price !== null && responseRetest.price !== undefined ? Number(responseRetest.price) / 100 : null },
              class4: {
                mot: { ...responseMot, price: responseMot.price !== null && responseMot.price !== undefined ? Number(responseMot.price) / 100 : null },
                retest: { ...responseRetest, price: responseRetest.price !== null && responseRetest.price !== undefined ? Number(responseRetest.price) / 100 : null },
              },
              class7: {
                enabled: false,
                mot: null,
                retest: null,
              },
              additionals: responseAdditionals,
            },
          },
        };
      },
      invalidatesTags: ["Pricing"],
    }),

    getPricing: builder.query<PricingResponsePayload, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;
        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found" } } as any };
        }

        const servicesRes = await baseQuery({ url: `/api/garages/${garageId}/services`, method: "GET" });
        if (servicesRes.error) return { error: servicesRes.error };

        const data = (servicesRes.data as any)?.data || {};

        const mot = data.mot || { name: "MOT Test", price: null, type: "MOT" };
        const retest = data.mot_retest || { name: "MOT Retest", price: null, type: "RETEST" };
        const additionals = (data.other_services || []).map((s: any) => ({
          id: s.id,
          name: s.title || s.name || "",
          price: s.price !== null && s.price !== undefined ? Number(s.price) / 100 : null,
          type: "ADDITIONAL"
        }));

        const pricingPayload: PricingResponsePayload = {
          mot: { ...mot, price: mot.price !== null && mot.price !== undefined ? Number(mot.price) / 100 : null },
          retest: { ...retest, price: retest.price !== null && retest.price !== undefined ? Number(retest.price) / 100 : null },
          class4: {
            mot: { ...mot, price: mot.price !== null && mot.price !== undefined ? Number(mot.price) / 100 : null },
            retest: { ...retest, price: retest.price !== null && retest.price !== undefined ? Number(retest.price) / 100 : null },
          },
          class7: {
            enabled: false,
            mot: null,
            retest: null,
          },
          additionals,
        };

        return { data: pricingPayload };
      },
      providesTags: ["Pricing"],
      keepUnusedDataFor: 0,
    }),

    deleteService: builder.mutation<any, string>({
      queryFn: async (id, api, extraOptions, baseQuery) => {
        const authRes = await baseQuery({ url: "/api/auth/me", method: "GET" });
        if (authRes.error) return { error: authRes.error };

        const user = (authRes.data as any)?.data || {};
        const garageId = user.garages?.[0]?.id;
        if (!garageId) {
          return { error: { status: 400, data: { message: "Garage ID not found" } } as any };
        }

        const deleteRes = await baseQuery({
          url: `/api/garages/${garageId}/services/${id}`,
          method: "DELETE",
        });
        if (deleteRes.error) return { error: deleteRes.error };

        return { data: deleteRes.data as any };
      },
      invalidatesTags: ["Pricing"],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useCreatePricingMutation, 
  useGetPricingQuery, 
  useDeleteServiceMutation 
} = pricingApi;
