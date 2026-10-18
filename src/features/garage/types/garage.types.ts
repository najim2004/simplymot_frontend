export interface GarageProfile {
  id: string;
  garage_name: string;
  vts_number: string | null;
  contact_email: string | null;
  phone_number: string | null;
  address: string | null;
  garage_image: string | null;
  mot_price: string | number | null;
  post_code: string | null;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: GarageProfile;
}

export interface UpdateProfileRequest {
  garage_name?: string;
  vts_number?: string;
  contact_email?: string;
  phone_number?: string;
  address?: string;
  post_code?: string;
  garage_image?: File | null | string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: GarageProfile;
}

export enum GarageSortBy {
  DISTANCE = "DISTANCE",
  PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH",
  PRICE_HIGH_TO_LOW = "PRICE_HIGH_TO_LOW",
}

export interface SearchRequest {
  registration_number: string;
  postcode: string;
  page?: number;
  limit?: number;
  sort_by?: GarageSortBy;
}

export interface SearchResponse {
  success: boolean;
  message?: string;
  data: {
    vehicle: any;
    garages: any[];
  };
  meta_data: {
    page?: number;
    limit?: number;
    total?: number;
    total_count?: number;
    vehicle_registration_number?: string;
    post_code?: string;
    search_postcode?: string;
    filters?: {
      sort?: string;
      sort_order?: string;
    };
  };
}

export interface GarageServicesApiResponse {
  success: boolean;
  message?: string;
  data: any;
}

export interface GarageSlotsApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}
