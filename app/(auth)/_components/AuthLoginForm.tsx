"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bgImage from "@/public/Image/register/bgImage.png";
import carImage from "@/public/Image/register/registerLargeImg.png";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { EmailVerificationModal } from "@/components/reusable/EmailVerificationModal";
import { useResendVerificationEmailMutation } from "@/rtk/api/auth/authApis";

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthLoginFormProps {
  userKind: "DRIVER" | "GARAGE";
}

const driverHighlights = [
  { id: 1, title: "Book your MOT in just a few taps" },
  { id: 2, title: "Reschedule or cancel your bookings" },
  { id: 3, title: "Get automatic MOT reminders" },
  { id: 4, title: "Keep track of past MOTs" },
  { id: 5, title: "Stay road-legal with zero stress" },
];

const garageHighlights = [
  { id: 1, title: "Get more bookings from drivers in your area" },
  { id: 2, title: "No commission - you keep 100%" },
  { id: 3, title: "Manage your bookings in one place" },
  { id: 4, title: "Never miss a booking" },
];

export default function AuthLoginForm({ userKind }: AuthLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [resendVerificationEmail] = useResendVerificationEmailMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithType } = useAuth();

  // Verification modal state
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
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
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
      const result = await loginWithType(data.email, data.password, userKind);
      if (result.success) {
        toast.success(result.message);

        if (userKind === "DRIVER") {
          // Check if there's a redirect URL with form data
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
      } else {
        if (
          result.message.toLowerCase().includes("verify") ||
          result.message.toLowerCase().includes("verification")
        ) {
          try {
            await resendVerificationEmail({ email: data.email }).unwrap();
          } catch (resendError) {
            console.error("Failed to auto-send OTP:", resendError);
          }
          openVerificationModal(data.email);
        }
        toast.error(result.message);
      }
    } catch (error: any) {
      if (
        error.message?.toLowerCase().includes("verify") ||
        error.message?.toLowerCase().includes("verification")
      ) {
        try {
          await resendVerificationEmail({ email: data.email }).unwrap();
        } catch (resendError) {
          console.error("Failed to auto-send OTP:", resendError);
        }
        openVerificationModal(data.email);
      }
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBack = () => {
    router.back();
  };

  const highlights =
    userKind === "DRIVER" ? driverHighlights : garageHighlights;
  const leftSideTitle =
    userKind === "DRIVER"
      ? "All Your MOT Needs In One Place."
      : "More MOT Bookings. One Simple System.";
  const formHeading =
    userKind === "DRIVER" ? "Let's get you signed in" : "Member Login";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 gap-4">
      {/* Left Side */}
      <div
        className="flex-1 lg:flex-1 text-white relative overflow-hidden rounded-2xl h-auto min-h-[50vh] lg:h-[calc(100vh-32px)]"
        style={{
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 p-6 lg:p-12 flex flex-col justify-between h-full">
          <div>
            {/* back button */}
            <button
              onClick={handleBack}
              className="flex justify-start cursor-pointer border border-white rounded-full p-2 w-fit group mb-4"
            >
              <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 text-white shrink-0" />
              </div>
            </button>

            <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center">
              <Link href="/">simplymot.co.uk</Link>
            </div>

            {/* Feature List */}
            <div className="space-y-3 lg:space-y-4 mt-20">
              <h2 className="text-lg md:text-xl lg:text-[28px] font-semibold font-inder">
                {leftSideTitle}
              </h2>
              {highlights.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Check className="w-4 h-4 lg:w-5 lg:h-5 text-white shrink-0" />
                  <span className="text-sm md:text-base lg:text-lg font-normal">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Car Image */}
          <div className="flex justify-end mt-4 lg:mt-0">
            <Image
              src={carImage}
              alt="Car with people illustration"
              className="max-w-xs sm:max-w-sm md:max-w-md w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:flex-1 flex items-center justify-center rounded-2xl">
        <div className="w-full max-w-full lg:max-w-lg xl:max-w-xl">
          <div className="bg-white rounded-xl border border-[#19CA32] p-8 sm:p-10 lg:p-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 sm:mb-10 text-center">
              {formHeading}
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-5"
            >
              {/* Email Field */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="mt-2 py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="py-6 pr-12 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                    )}
                  </button>
                </div>
                {/* forget password */}
                <div className="flex justify-between">
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.password.message}
                    </p>
                  )}
                  <Link
                    href="/forgot-password"
                    className="text-[#19CA32] underline text-sm hover:scale-105 transition-all duration-300 ml-auto mt-2"
                  >
                    Forgot Password
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#19CA32] disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed text-white py-6 rounded-lg font-medium text-base transition-all duration-200 hover:shadow-lg hover:shadow-green-500"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Please wait...</span>
                  </div>
                ) : (
                  "Log In"
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href={
                      userKind === "DRIVER"
                        ? `/create-account/driver${
                            searchParams?.get("redirect")
                              ? `?redirect=${encodeURIComponent(
                                  searchParams.get("redirect")!,
                                )}`
                              : ""
                          }`
                        : "/create-account/garage"
                    }
                    className="text-[#19CA32] underline font-medium"
                  >
                    Create Account
                  </Link>
                </span>
              </div>

              {/* Resend Verification Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleVerifyLinkClick}
                  disabled={isSendingOtp}
                  className="text-sm text-gray-500 hover:text-[#19CA32] hover:underline transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSendingOtp
                    ? "Sending..."
                    : "Need to verify your email? Click here"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        email={verifyEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
