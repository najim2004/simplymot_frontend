import { apiSlice } from "@/lib/api/api-slice";

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
    token: string;
    type: string;
  };
  type: string;
}

export interface AuthMeResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    address: string | null;
    phone_number: string | null;
    type: string;
    gender: string | null;
    date_of_birth: string | null;
    created_at: string;
    vts_number: string | null;
    primary_contact: string | null;
    garage_name: string | null;
  };
}

export interface CommonResponse {
  success: boolean;
  message: string;
}

export interface RegisterRequest {
  name: string;
  garage_name?: string;
  vts_number?: string;
  primary_contact?: string;
  email: string;
  phone_number: string;
  password: string;
  kind: string;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<AuthMeResponse, void>({
      query: () => "/api/auth/me",
      providesTags: ["Auth"],
    }),
    register: builder.mutation<CommonResponse, RegisterRequest>({
      query: (body) => ({
        url: "/api/auth/register",
        method: "POST",
        body,
      }),
    }),
    verifyEmail: builder.mutation<
      CommonResponse,
      { email: string; token: string }
    >({
      query: (body) => ({
        url: "/api/auth/verify-email",
        method: "POST",
        body,
      }),
    }),
    resendVerificationEmail: builder.mutation<
      CommonResponse,
      { email: string }
    >({
      query: (body) => ({
        url: "/api/auth/resend-verification-email",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<CommonResponse, { email: string }>({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      CommonResponse,
      { email: string; token: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<CommonResponse, PasswordChangeRequest>({
      query: (body) => ({
        url: "/api/auth/change-password",
        method: "POST",
        body,
      }),
    }),
    requestEmailChange: builder.mutation<CommonResponse, { email: string }>({
      query: (body) => ({
        url: "/api/auth/request-email-change",
        method: "POST",
        body,
      }),
    }),
    changeEmail: builder.mutation<
      CommonResponse,
      { email: string; token: string }
    >({
      query: (body) => ({
        url: "/api/auth/change-email",
        method: "POST",
        body,
      }),
    }),
    updateProfile: builder.mutation<CommonResponse, any>({
      query: (body) => {
        const isFormData = body instanceof FormData;
        const requestBody =
          !isFormData && body && "data" in body ? body.data : body;
        return {
          url: "/api/auth/update",
          method: "PATCH",
          body: requestBody,
        };
      },
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useRequestEmailChangeMutation,
  useChangeEmailMutation,
  useUpdateProfileMutation,
} = authApi;
