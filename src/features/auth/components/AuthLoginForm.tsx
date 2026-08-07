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
import { useLoginMutation, useLazyGetMeQuery, useResendVerificationEmailMutation } from "@/features/auth/api/auth.api";
import { setUser, setLoading as setAuthLoading, User } from "@/features/auth/store/auth.slice";
import { useAppDispatch } from "@/store/hooks";
import { EmailVerificationModal } from "@/components/reusable/EmailVerificationModal";

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
  const [login] = useLoginMutation();
  const [triggerAuthMe] = useLazyGetMeQuery();
  const [resendVerificationEmail] = useResendVerificationEmailMutation();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
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
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    if (!email) {
      toast.error("Please enter your email first to verify");
      return;
    }
    setIsSendingOtp(true);
    try {
      const response = await resendVerificationEmail({ email }).unwrap();
      if (response.success || (response as any).status === "success") {
        toast.success(response?.message || "Verification code sent to your email");
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
              registration
            )}&postcode=${encodeURIComponent(postcode)}`
          );
        } else {
          router.replace("/driver/book-my-mot");
        }
      } else {
        router.push("/garage/garage-profile");
      }
    } catch (error: any) {
      const msg = error.data?.message || error.message || "Login failed";
      if (msg.toLowerCase().includes("verify") || msg.toLowerCase().includes("verification")) {
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

  const highlights = userKind === "DRIVER" ? driverHighlights : garageHighlights;
  const leftSideTitle =
    userKind === "DRIVER"
      ? "All Your MOT Needs In One Place."
      : "More MOT Bookings. One Simple System.";
  const formHeading = userKind === "DRIVER" ? "Let's get you signed in" : "Member Login";

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
            <button
              onClick={() => router.back()}
              className="flex justify-start cursor-pointer border border-white rounded-full p-2 w-fit group mb-4"
            >
              <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 text-white shrink-0" />
              </div>
            </button>

            <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center">
              <Link href="/">simplymot.co.uk</Link>
            </div>

            <div className="mt-8 space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold font-arial-rounded leading-tight text-[#DEF3E7]">
                {leftSideTitle}
              </h1>

              <div className="space-y-3">
                {highlights.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-[#092C23] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    </div>
                    <span className="text-sm font-medium text-white/90">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center items-center">
            <Image
              src={carImage}
              alt="Car Illustration"
              className="w-full max-w-[500px] h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 lg:flex-1 bg-white rounded-2xl p-6 lg:p-12 flex flex-col justify-center min-h-[50vh] lg:h-[calc(100vh-32px)]">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arial-rounded">
              {formHeading}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Enter your details to sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#006644] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="text-xs text-right">
              Need to verify your email?{" "}
              <button
                type="button"
                onClick={handleVerifyLinkClick}
                disabled={isSendingOtp}
                className="font-semibold text-[#006644] hover:underline bg-transparent border-0 p-0 cursor-pointer"
              >
                {isSendingOtp ? "Sending code..." : "Enter verification code"}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#006644] hover:bg-[#005236] text-white py-2.5 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 pt-2">
              Don&apos;t have an account?{" "}
              <Link
                href={userKind === "DRIVER" ? "/create-account/driver" : "/create-account/garage"}
                className="font-semibold text-[#006644] hover:underline"
              >
                Create an account
              </Link>
            </div>
          </form>
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
