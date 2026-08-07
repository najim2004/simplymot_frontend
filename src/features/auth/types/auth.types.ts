export interface LoginRequest {
  email: string;
  password: string;
  type?: "DRIVER" | "GARAGE" | "ADMIN";
  kind?: "DRIVER" | "GARAGE" | "ADMIN";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  authorization: {
    access_token?: string;
    token?: string;
    type: string;
  };
  type: string;
  user: {
    id: string;
    name: string;
    email: string;
    kind: "DRIVER" | "GARAGE" | "ADMIN";
    avatar: string | null;
    phone_number: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
  };
}

export interface GarageItem {
  id: string;
  garage_name: string;
  vts_number: string;
  contact_email: string;
  phone_number: string;
}

export interface PermissionItem {
  id: string;
  title: string;
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
  fields?: string[];
}

export interface RoleItem {
  id: string;
  title: string;
  name: string;
  permissions?: PermissionItem[];
}

export interface SubscriptionItem {
  id: string;
  status: string;
  plan_id: string;
  plan_name: string;
  has_access: boolean;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface AuthMeResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    avatar_url?: string | null;
    address?: string | null;
    phone_number?: string | null;
    kind: string;
    garages?: GarageItem[];
    created_at?: string;
    email_verified_at?: string | null;
    status?: string;
    roles?: RoleItem[];
    subscription?: SubscriptionItem | null;
    type?: string;
    gender?: string | null;
    date_of_birth?: string | null;
    vts_number?: string | null;
    primary_contact?: string | null;
    garage_name?: string | null;
  };
}

export interface CommonResponse {
  success: boolean;
  message: string;
}

export interface RegisterRequest {
  kind: string;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  garage_name?: string;
  vts_number?: string;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface ResendVerificationEmailRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

export interface ChangeEmailRequest {
  email: string;
  token: string;
}
