export type BookingStatus =
  | "BOOKED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "PENDING"
  | "ACCEPTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "REJECTED";

export interface BookingCustomer {
  name: string | null;
  email: string | null;
  phone_number: string | null;
  avatar: string | null;
}

export interface BookingGarage {
  id?: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  address?: string | null;
  image: string | null;
}

export interface BookingVehicle {
  registration_number: string;
  make: string | null;
  model: string | null;
}

export interface Booking {
  id: string;
  garage_id?: string | null;
  status: BookingStatus | string;
  starts_at: string;
  ends_at: string | null;
  service_price: number | null;
  customer: BookingCustomer | null;
  garage: BookingGarage | null;
  vehicle: BookingVehicle | null;
  order_date?: string;
  total_amount?: string | number | null;
  additional_services?: string | null;
  driver?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone_number?: string | null;
  } | null;
}

export interface BookingsPaginationFilters {
  garage_id: string | null;
  from_date: string | null;
  to_date: string | null;
  status: string | null;
  search: string | null;
}

export interface BookingsPaginationMeta {
  total: number;
  page: number;
  limit: number;
  filters: BookingsPaginationFilters;
}

export interface GetBookingsResponse {
  success: boolean;
  message: string;
  data: Booking[];
  meta_data: BookingsPaginationMeta;
}

export interface GetBookingDetailResponse {
  success: boolean;
  message: string;
  data: Booking;
}

export interface GetBookingsQueryParams {
  garage_id?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface RescheduleBookingRequest {
  booking_id: string;
  slot_id?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface RescheduleBookingResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    garage_id: string;
    slot_id: string;
    order_date: string;
    status: string;
    updated_at: string;
  };
}

export interface CancelBookingRequest {
  booking_id: string;
  reason: string;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: string;
    cancel_reason: string;
    cancelled_by: string;
    updated_at: string;
  };
}

export interface SlotItem {
  id?: string;
  starts_at?: string;
  ends_at?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  source?: string;
  status?: string;
  bookable?: boolean;
  description?: string | null;
}

export type Slot = SlotItem;

export interface GetGarageSlotsResponse {
  success: boolean;
  message: string;
  data: {
    garage_id: string;
    date: string;
    is_closed: boolean;
    is_holiday: boolean;
    holiday_name?: string | null;
    slots: SlotItem[];
  };
}

export interface CreateBookingRequest {
  garage_id: string;
  vehicle_registration_number: string;
  starts_at: string;
  ends_at?: string;
  slot_id?: string;
  additional_services?: string;
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    order_id: string;
    status: string;
    garage_id: string;
    starts_at: string;
    ends_at: string;
  };
}

export interface BookSlotRequest {
  garage_id: string;
  slot_id?: string;
  starts_at?: string;
  ends_at?: string;
  additional_services?: string;
  service_type?: string;
  vehicle_id?: string;
  vehicle_registration_number?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

export interface BookSlotResponse {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
    order_id?: string;
    total_amount?: number | string;
    status?: string;
    date?: string;
    start_time?: string;
    end_time?: string;
    additional_services?: string;
    garage?: {
      id?: string;
      garage_name?: string;
      address?: string;
      phone_number?: string;
      email?: string;
      avatar?: string;
    };
    vehicle?: {
      id?: string;
      registration_number?: string;
      make?: string;
      model?: string;
    };
    slot?: {
      starts_at?: string;
      ends_at?: string;
      start_time?: string;
      end_time?: string;
      date?: string;
    };
    [key: string]: unknown;
  };
}

export interface GetMyBookingsRequest {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface BookingRecord {
  id: string;
  created_at: string;
  order_date?: string;
  status: string;
  total_amount?: number | string;
  garage_id: string;
  additional_services?: string;
  vehicle?: {
    id: string;
    registration_number: string;
    make?: string;
    model?: string;
  };
  garage?: {
    id: string;
    garage_name: string;
    address?: string;
    phone_number?: string;
    avatar?: string;
    garage_image?: string;
  };
  slot?: {
    starts_at?: string;
    ends_at?: string;
    start_time?: string;
    end_time?: string;
    date?: string;
  };
}

export interface GetMyBookingsResponse {
  success: boolean;
  message?: string;
  data?: BookingRecord[];
  meta_data?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CancelMyBookingRequest {
  id: string;
  reason: string;
}

export interface RescheduleMyBookingRequest {
  id: string;
  slot_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface BookingMutationResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}
