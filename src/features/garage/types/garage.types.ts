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
