"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Eye, EyeOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import bgImage from "@/public/Image/register/bgImage.png";
import carImage from "@/public/Image/register/registerLargeImg.png";
import { toast } from "sonner";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationEmailMutation,
} from "@/features/auth/api/auth.api";

interface EmailFormData {
  email: string;
}

interface TokenPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

type FormStep = "email" | "tokenPassword";

export default function ForgotPassword() {
  const [forgotPassword] = useForgotPasswordMutation();
  const [resetPassword] = useResetPasswordMutation();
  const [resendVerificationEmail] = useResendVerificationEmailMutation();

  const [currentStep, setCurrentStep] = useState<FormStep>("email");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect");

  const emailForm = useForm<EmailFormData>();
  const tokenPasswordForm = useForm<TokenPasswordFormData>();

  const startTimer = useCallback(() => {
    setTimeLeft(600);
    setIsTimerRunning(true);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeLeft(600);
    setIsTimerRunning(false);
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsTimerRunning(false);
            toast.error("Token has expired. Please request a new one.");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const response = await forgotPassword({ email: data.email }).unwrap();
      setUserEmail(data.email);
      setCurrentStep("tokenPassword");
      startTimer();
      toast.success(response.message || "Reset link sent to your email");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error?.data?.message || error?.message || "Failed to send reset email",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onTokenPasswordSubmit = async (data: TokenPasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      tokenPasswordForm.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    if (timeLeft <= 0) {
      toast.error("Token has expired. Please request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword({
        email: userEmail,
        token: data.token,
        password: data.newPassword,
      }).unwrap();
      toast.success(response.message || "Password reset successfully");
      resetTimer();
      const loginPath = redirectParam
        ? `/login/driver?redirect=${encodeURIComponent(redirectParam)}`
        : "/login/driver";
      router.push(loginPath);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error?.data?.message || error?.message || "Failed to reset password",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const response = await resendVerificationEmail({
        email: userEmail,
      }).unwrap();
      startTimer();
      toast.success(response.message || "Reset code resent to your email");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error?.data?.message || error?.message || "Failed to resend code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackStep = () => {
    setCurrentStep("email");
    resetTimer();
    tokenPasswordForm.reset();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 gap-4">
      <div
        className="flex-1 lg:flex-1 text-white relative overflow-hidden rounded-2xl min-h-[50vh] lg:min-h-full"
        style={{
          backgroundImage: `url(${bgImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 p-6 lg:p-12 flex flex-col h-full">
          <div className="shrink-0">
            <button
              onClick={() =>
                currentStep === "tokenPassword"
                  ? handleBackStep()
                  : router.back()
              }
              className="flex justify-start cursor-pointer border border-white rounded-full p-2 w-fit group mb-4"
            >
              <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center group-hover:scale-150 transition-all duration-300">
                <ArrowLeft className="w-4 h-4 text-white shrink-0" />
              </div>
            </button>

            <div className="text-white font-bold text-4xl md:text-5xl xl:text-6xl font-arial-rounded text-center">
              <Link href="/">simplymot.co.uk</Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center min-h-0">
            <Image
              src={carImage}
              alt="Car Illustration"
              className="w-full max-w-125 h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <div className="flex-1 lg:flex-1 bg-white rounded-2xl p-6 lg:p-12 flex flex-col justify-center min-h-[50vh] lg:min-h-full">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arial-rounded">
              {currentStep === "email" ? "Forgot Password" : "Reset Password"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {currentStep === "email"
                ? "Enter your email to receive a password reset code."
                : `Enter the code sent to ${userEmail} and your new password.`}
            </p>
          </div>

          {currentStep === "email" ? (
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...emailForm.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={
                    emailForm.formState.errors.email ? "border-red-500" : ""
                  }
                />
                {emailForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#006644] hover:bg-[#005236] text-white py-2.5 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  "Send Code"
                )}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={tokenPasswordForm.handleSubmit(onTokenPasswordSubmit)}
              className="space-y-4"
            >
              {isTimerRunning && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Code expires in:
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-700 font-mono">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              <div>
                <Label
                  htmlFor="token"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Reset Code
                </Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Enter 6-digit code"
                  {...tokenPasswordForm.register("token", {
                    required: "Reset code is required",
                  })}
                  className={
                    tokenPasswordForm.formState.errors.token
                      ? "border-red-500"
                      : ""
                  }
                />
                {tokenPasswordForm.formState.errors.token && (
                  <p className="text-red-500 text-xs mt-1">
                    {tokenPasswordForm.formState.errors.token.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New password"
                    {...tokenPasswordForm.register("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className={
                      tokenPasswordForm.formState.errors.newPassword
                        ? "border-red-500 pr-10"
                        : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {tokenPasswordForm.formState.errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {tokenPasswordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700 block mb-1"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    {...tokenPasswordForm.register("confirmPassword", {
                      required: "Please confirm your password",
                    })}
                    className={
                      tokenPasswordForm.formState.errors.confirmPassword
                        ? "border-red-500 pr-10"
                        : "pr-10"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {tokenPasswordForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {tokenPasswordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="text-xs text-right">
                Didn&apos;t receive code?{" "}
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="font-semibold text-[#006644] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                >
                  Resend code
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
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-gray-600 pt-2">
            Remembered your password?{" "}
            <Link
              href={
                redirectParam
                  ? `/login/driver?redirect=${encodeURIComponent(redirectParam)}`
                  : "/login/driver"
              }
              className="font-semibold text-[#006644] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
