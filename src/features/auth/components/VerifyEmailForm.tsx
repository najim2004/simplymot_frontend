"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Clock, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { toast } from "sonner";
import {
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} from "@/features/auth/api/auth.api";
import DriverAuthBanner from "./DriverAuthBanner";
import GarageAuthBanner from "./GarageAuthBanner";

interface VerifyEmailFormProps {
  userKind?: "DRIVER" | "GARAGE";
}

export default function VerifyEmailForm({ userKind = "DRIVER" }: VerifyEmailFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams?.get("email") || "";
  const rawKind = (searchParams?.get("userKind") || searchParams?.get("kind") || userKind || "").toUpperCase();
  const paramKind: "DRIVER" | "GARAGE" = rawKind.includes("GARAGE") ? "GARAGE" : "DRIVER";
  const redirectParam = searchParams?.get("redirect");

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending }] = useResendVerificationEmailMutation();

  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("No email address provided");
      return;
    }
    try {
      const response = await resendVerificationEmail({ email }).unwrap();
      if (response.success) {
        toast.success(response?.message || "Verification code sent to your email");
        setTimeLeft(300);
        setIsExpired(false);
        setOtp("");
      } else {
        toast.error(response?.message || "Failed to resend code");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to resend code");
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error("No email address found");
      return;
    }
    if (otp.length !== 5) {
      toast.error("Please enter a valid 5-digit code");
      return;
    }
    if (isExpired) {
      toast.error("Code has expired. Please request a new code.");
      return;
    }

    try {
      const response = await verifyEmail({ email, token: otp }).unwrap();
      if (response.success) {
        toast.success(response?.message || "Email verified successfully!");

        if (paramKind === "DRIVER") {
          const loginPath = redirectParam
            ? `/login/driver?redirect=${encodeURIComponent(redirectParam)}`
            : "/login/driver";
          router.push(loginPath);
        } else {
          router.push("/login/garage");
        }
      } else {
        toast.error(response?.message || "Verification failed");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(error.data?.message || error.message || "Verification failed");
    }
  };

  const loginRoute = paramKind === "DRIVER"
    ? `/login/driver${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ""}`
    : "/login/garage";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 gap-4">
      {/* Left Side Banner */}
      <div className="flex-1 lg:flex-1">
        {paramKind === "DRIVER" ? (
          <DriverAuthBanner onBack={() => router.back()} />
        ) : (
          <GarageAuthBanner onBack={() => router.back()} />
        )}
      </div>

      {/* Right Side Form */}
      <div className="flex-1 lg:flex-1 flex items-center justify-center rounded-2xl">
        <div className="w-full max-w-full lg:max-w-lg xl:max-w-xl">
          <div className="bg-white rounded-xl border border-[#19CA32] p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-[#DEF3E7] text-[#19CA32] flex items-center justify-center mb-4">
                <Mail className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600 text-sm max-w-sm">
                We&apos;ve sent a 5-digit verification code to
              </p>
              {email ? (
                <p className="font-semibold text-gray-900 text-sm mt-1">{email}</p>
              ) : (
                <p className="text-red-500 text-xs mt-1">No email specified</p>
              )}
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <OTPInput value={otp} onChange={setOtp} length={5} />
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-gray-500 px-1 pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    {isExpired ? (
                      <span className="text-red-500 font-medium">Code expired</span>
                    ) : (
                      <>
                        Expires in{" "}
                        <span className="font-semibold text-gray-700">
                          {formatTime(timeLeft)}
                        </span>
                      </>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-semibold text-[#19CA32] hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isVerifying || otp.length !== 5 || isExpired}
                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#19CA32]/90 disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed text-white py-6 rounded-lg font-medium text-base transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 disabled:hover:shadow-none"
              >
                {isVerifying ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify & Continue"
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href={loginRoute}
                  className="inline-flex items-center gap-1 text-sm text-[#19CA32] hover:underline font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Log in</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
