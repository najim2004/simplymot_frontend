export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export interface BookingCustomer {
  name: string | null;
  email: string | null;
  phone_number: string | null;
  avatar: string | null;
}

export interface BookingGarage {
  name: string | null;
  email: string | null;
  phone_number: string | null;
  image: string | null;
}

export interface BookingVehicle {
  registration_number: string;
  make: string | null;
  model: string | null;
}

export interface Booking {
  id: string;
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
