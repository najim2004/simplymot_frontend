import { apiSlice } from "@/lib/api/api-slice";
import {
  SearchRequest,
  SearchResponse,
  GarageServicesResponse,
  GarageSlotsResponse,
  Slot,
  Service,
  Additional,
  DailyHours,
} from "../types";

export * from "../types";

export const bookMyMotApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchVehiclesAndGarages: builder.query<SearchResponse, SearchRequest>({
      query: (params) => ({
        url: `/api/garages/discover`,
        method: "GET",
        params: {
          vehicle_registration_number: params.registration_number,
          post_code: params.postcode,
          page: params.page,
          limit: params.limit,
          sort:
            params.sort_by === "PRICE_LOW_TO_HIGH"
              ? "price"
              : params.sort_by === "PRICE_HIGH_TO_LOW"
                ? "price"
                : "distance",
          sort_order: params.sort_by === "PRICE_HIGH_TO_LOW" ? "desc" : "asc",
        },
      }),
      providesTags: ["Booking"],
    }),

    getGarageServices: builder.query<GarageServicesResponse, string>({
      query: (id) => ({
        url: `/api/garages/discover/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        const garage = response?.data || {};
        const servicesData = garage.services || {};
        const scheduleData = garage.schedule || {};

        const services: Service[] = [];
        if (servicesData.mot) {
          services.push({
            id: servicesData.mot.id,
            name: servicesData.mot.title || "MOT Test",
            type: "MOT",
            price: servicesData.mot.price ? servicesData.mot.price / 100 : 0,
            class_number: 4,
          });
        }
        if (servicesData.mot_retest) {
          services.push({
            id: servicesData.mot_retest.id,
            name: servicesData.mot_retest.title || "MOT Retest",
            type: "RETEST",
            price: servicesData.mot_retest.price
              ? servicesData.mot_retest.price / 100
              : 0,
            class_number: 4,
          });
        }

        const additionals: Additional[] = (
          servicesData.other_services || []
        ).map((s: any) => ({
          id: s.id,
          name: s.title || s.name || "",
          type: "ADDITIONAL",
          price: s.price ? s.price / 100 : 0,
        }));

        const intervals = scheduleData.schedule_intervals || [];
        const daily_hours: Record<string, DailyHours> = {};
        intervals.forEach((item: any) => {
          const dayKey = item.day_of_week.toLowerCase();
          daily_hours[dayKey] = {
            is_closed: item.is_closed,
            slot_duration: item.slot_duration,
            intervals: [
              {
                start_time: item.open_time,
                end_time: item.close_time,
              },
            ],
          };
        });

        return {
          garage: {
            id: garage.id,
            garage_name: garage.garage_name,
            address: garage.address,
            zip_code: garage.post_code,
            vts_number: garage.vts_number,
            primary_contact: garage.primary_contact || "",
            phone_number: garage.phone_number,
            email: garage.contact_email,
            avatar: garage.garage_image || undefined,
          },
          services,
          additionals,
          schedule: {
            id: scheduleData.id || "",
            start_time: "",
            end_time: "",
            slot_duration: intervals[0]?.slot_duration || 60,
            restrictions: [],
            daily_hours,
            is_active: true,
          },
        };
      },
      providesTags: ["Booking"],
      keepUnusedDataFor: 0,
    }),

    getGarageSlots: builder.query<
      GarageSlotsResponse,
      { id: string; date: string }
    >({
      query: ({ id, date }) => ({
        url: `/api/garages/${id}/slots?date=${date}`,
        method: "GET",
      }),
      transformResponse: (response: any, _meta, arg) => {
        const toSlot = (slot: any, index: number): Slot => ({
          id:
            slot?.id ||
            `${slot?.date || arg.date || "date"}-${
              slot?.start_time || "start"
            }-${slot?.end_time || "end"}-${index}`,
          start_time: slot?.start_time || "",
          end_time: slot?.end_time || "",
          date: slot?.date || arg.date,
          status: slot?.status,
          has_id: !!slot?.id,
        });

        if (Array.isArray(response)) {
          return { slots: response.map(toSlot) };
        }

        if (
          response?.success &&
          response?.data &&
          Array.isArray(response.data)
        ) {
          return { slots: response.data.map(toSlot) };
        }

        if (response?.slots && Array.isArray(response.slots)) {
          return { slots: response.slots.map(toSlot) };
        }

        if (response?.data && Array.isArray(response.data)) {
          return { slots: response.data.map(toSlot) };
        }

        return { slots: [] };
      },
      providesTags: ["Booking"],
      keepUnusedDataFor: 0,
    }),

    bookSlot: builder.mutation<
      any,
      {
        garage_id: string;
        vehicle_id: string;
        service_type: string;
        additional_services?: string;
        slot_id?: string;
        start_time?: string;
        end_time?: string;
        date?: string;
      }
    >({
      query: (body) => ({
        url: `/api/bookings`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Booking"],
    }),

    getMyBookings: builder.query<
      any,
      { search: string; status: string; page: number; limit: number }
    >({
      query: ({ search, status, page, limit }) => {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status && status !== "all")
          params.append("status", status.toUpperCase());
        params.append("page", page.toString());
        params.append("limit", limit.toString());
        return {
          url: `/api/bookings?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        const bookings = response?.data || [];
        const total = response?.meta_data?.total || 0;
        const page = response?.meta_data?.page || 1;
        const limit = response?.meta_data?.limit || 10;
        const pages = Math.ceil(total / limit) || 1;

        return {
          success: true,
          message: response?.message || "Bookings fetched successfully",
          bookings: bookings.map((b: any) => ({
            id: b.id,
            created_at: b.created_at,
            order_date: b.order_date || b.created_at,
            status: b.status,
            total_amount: b.total_amount
              ? `£${(Number(b.total_amount) / 100).toFixed(2)}`
              : "£0.00",
            garage_id: b.garage_id,
            additional_services: b.additional_services,
            vehicle: {
              id: b.vehicle?.id || "",
              registration_number: b.vehicle?.registration_number || "",
              make: b.vehicle?.make || "",
              model: b.vehicle?.model || "",
            },
            garage: {
              id: b.garage?.id || "",
              garage_name: b.garage?.garage_name || "Garage",
              address: b.garage?.address || "",
              phone_number: b.garage?.phone_number || "",
              avatar: b.garage?.garage_image || "",
            },
            slot: b.slot,
          })),
          pagination: {
            page,
            limit,
            total,
            pages,
          },
        } as any;
      },
      providesTags: ["Booking"],
    }),

    cancelMyBooking: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/api/bookings/${id}/cancel`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["Booking"],
    }),

    rescheduleMyBooking: builder.mutation<
      any,
      {
        id: string;
        slot_id?: string;
        date?: string;
        start_time?: string;
        end_time?: string;
        reason?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/bookings/${id}/reschedule`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Booking"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchVehiclesAndGaragesQuery,
  useGetGarageServicesQuery,
  useGetGarageSlotsQuery,
  useBookSlotMutation,
  useGetMyBookingsQuery,
  useCancelMyBookingMutation,
  useRescheduleMyBookingMutation,
} = bookMyMotApi;
