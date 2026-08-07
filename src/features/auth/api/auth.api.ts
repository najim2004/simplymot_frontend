import { apiSlice } from "@/lib/api/api-slice";
import { setUser, User } from "../store/auth.slice";
import {
  LoginRequest,
  LoginResponse,
  AuthMeResponse,
  CommonResponse,
  RegisterRequest,
  PasswordChangeRequest,
} from "../types";

export * from "../types";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.authorization?.access_token || data.authorization?.token;
          if (token && typeof window !== "undefined") {
            localStorage.setItem("token", token);
            localStorage.setItem("access_token", token);
          }
          if (data.user) {
            const userObj: User = {
              ...(data.user as unknown as User),
              type: data.user.kind || data.type || "DRIVER",
              kind: data.user.kind || data.type || "DRIVER",
            };
            dispatch(setUser(userObj));
          }
        } catch (error) {
          console.error("Login query failed:", error);
        }
      },
    }),
    getMe: builder.query<AuthMeResponse, void>({
      query: () => "/api/auth/me",
      providesTags: ["Auth"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data) {
            const userData = data.data;
            const userObj: User = {
              ...(userData as unknown as User),
              type: userData.kind || userData.type || "DRIVER",
              kind: userData.kind || userData.type || "DRIVER",
            };
            dispatch(setUser(userObj));
          } else {
            dispatch(setUser(null));
          }
        } catch {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("access_token");
          }
          dispatch(setUser(null));
        }
      },
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
        url: "/api/auth/verify_email",
        method: "POST",
        body,
      }),
    }),
    resendVerificationEmail: builder.mutation<
      CommonResponse,
      { email: string }
    >({
      query: (body) => ({
        url: "/api/auth/resend_verification_email",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation<CommonResponse, { email: string }>({
      query: (body) => ({
        url: "/api/auth/forgot_password",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      CommonResponse,
      { email: string; token: string; password: string }
    >({
      query: (body) => ({
        url: "/api/auth/reset_password",
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<CommonResponse, PasswordChangeRequest>({
      query: (body) => ({
        url: "/api/auth/change_password",
        method: "POST",
        body,
      }),
    }),
    requestEmailChange: builder.mutation<CommonResponse, { email: string }>({
      query: (body) => ({
        url: "/api/auth/request_email_change",
        method: "POST",
        body,
      }),
    }),
    changeEmail: builder.mutation<
      CommonResponse,
      { email: string; token: string }
    >({
      query: (body) => ({
        url: "/api/auth/change_email",
        method: "POST",
        body,
      }),
    }),
    updateProfile: builder.mutation<
      CommonResponse,
      FormData | Record<string, unknown>
    >({
      query: (body) => {
        const isFormData = body instanceof FormData;
        const requestBody =
          !isFormData && body && typeof body === "object" && "data" in body
            ? (body as { data: unknown }).data
            : body;
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
