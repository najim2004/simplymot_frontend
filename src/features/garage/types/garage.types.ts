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
