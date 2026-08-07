"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useLoginMutation,
  useLazyGetMeQuery,
  useResendVerificationEmailMutation,
} from "@/features/auth/api/auth.api";
import {
  setUser,
  setLoading as setAuthLoading,
  User,
} from "@/features/auth/store/auth.slice";
import { useAppDispatch } from "@/store/hooks";
import { EmailVerificationModal } from "@/components/reusable/EmailVerificationModal";
import DriverAuthBanner from "./DriverAuthBanner";
import GarageAuthBanner from "./GarageAuthBanner";

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthLoginFormProps {
  userKind: "DRIVER" | "GARAGE";
}

export default function AuthLoginForm({ userKind }: AuthLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useLoginMutation();
  const [triggerAuthMe] = useLazyGetMeQuery();
  const [resendVerificationEmail] = useResendVerificationEmailMutation();
  const dispatch = useAppDispatch();

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleVerificationSuccess = () => {
    setShowVerifyModal(false);
    setVerifyEmail("");
  };

  const openVerificationModal = (email: string) => {
    setVerifyEmail(email);
    setShowVerifyModal(true);
  };

  const handleVerifyLinkClick = async () => {
    const email =
      form.getValues("email") ||
      (document.getElementById("email") as HTMLInputElement)?.value;
    if (!email) {
      toast.error("Please enter your email first to verify");
      return;
    }
    setIsSendingOtp(true);
    try {
      const response = await resendVerificationEmail({ email }).unwrap();
      if (response.success || (response as any).status === "success") {
        toast.success(
          response?.message || "Verification code sent to your email",
        );
        openVerificationModal(email);
      } else {
        toast.error(response?.message || "Failed to send verification code");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      dispatch(setAuthLoading(true));
      const loginResponse = await login({
        email: data.email,
        password: data.password,
        type: userKind,
      } as any).unwrap();

      if (loginResponse.authorization?.token) {
        localStorage.setItem("token", loginResponse.authorization.token);
      }

      let userDetails = null;
      try {
        userDetails = await triggerAuthMe().unwrap();
      } catch (e) {
        console.warn("AuthMe failed, fallback");
      }

      const userObj: User = userDetails?.data
        ? {
            id: userDetails.data.id,
            email: userDetails.data.email,
            name: userDetails.data.name,
            type: userDetails.data.type,
            avatar_url: userDetails.data.avatar_url || undefined,
            garage_name: userDetails.data.garage_name || undefined,
          }
        : {
            id: "temp-id",
            email: data.email,
            name: "User",
            type: userKind,
          };

      dispatch(setUser(userObj));
      toast.success("Login successful");

      if (userKind === "DRIVER") {
        const redirectParam = searchParams?.get("redirect");
        const registration = searchParams?.get("registration");
        const postcode = searchParams?.get("postcode");

        if (redirectParam) {
          const decodedRedirect = decodeURIComponent(redirectParam);
          const separator = decodedRedirect.includes("?") ? "&" : "?";
          const finalRedirect = `${decodedRedirect}${separator}is_logged_in=true`;
          router.replace(finalRedirect);
        } else if (registration && postcode) {
          router.replace(
            `/driver/book-my-mot?registration=${encodeURIComponent(
              registration,
            )}&postcode=${encodeURIComponent(postcode)}`,
          );
        } else {
          router.replace("/driver/book-my-mot");
        }
      } else {
        router.push("/garage/garage-profile");
      }
    } catch (error: any) {
      const msg = error.data?.message || error.message || "Login failed";
      if (
        msg.toLowerCase().includes("verify") ||
        msg.toLowerCase().includes("verification")
      ) {
        try {
          await resendVerificationEmail({ email: data.email }).unwrap();
        } catch (resendError) {
          console.error("Failed to auto-send OTP:", resendError);
        }
        openVerificationModal(data.email);
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  const formHeading =
    userKind === "DRIVER" ? "Let's get you signed in" : "Member Login";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 gap-4">
      {/* Left Side Component */}
      {userKind === "DRIVER" ? (
        <DriverAuthBanner onBack={() => router.back()} />
      ) : (
        <GarageAuthBanner onBack={() => router.back()} />
      )}

      {/* Right Side - Form */}
      <div className="flex-1 lg:flex-1 flex items-center justify-center rounded-2xl">
        <div className="w-full max-w-full lg:max-w-lg xl:max-w-xl">
          <div className="bg-white rounded-xl border border-[#19CA32] p-8 sm:p-10 lg:p-12">
            <h2 className="text-xl text-center sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 sm:mb-10">
              {formHeading}
            </h2>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          className="mt-2 py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-2" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: "Password is required",
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel className="text-sm font-medium text-gray-700 block">
                          Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-semibold text-[#19CA32] hover:underline"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative mt-2">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="py-6 pr-12 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                            ) : (
                              <Eye className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-2" />
                    </FormItem>
                  )}
                />

                <div className="text-xs text-right pt-1">
                  Need to verify your email?{" "}
                  <button
                    type="button"
                    onClick={handleVerifyLinkClick}
                    disabled={isSendingOtp}
                    className="font-semibold text-[#19CA32] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {isSendingOtp ? "Sending code..." : "Enter verification code"}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#19CA32]/90 disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed text-white py-6 rounded-lg font-medium text-base transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <span className="text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      href={
                        userKind === "DRIVER"
                          ? "/create-account/driver"
                          : "/create-account/garage"
                      }
                      className="text-[#19CA32] hover:underline font-medium"
                    >
                      Create an account
                    </Link>
                  </span>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        email={verifyEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
