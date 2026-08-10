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
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginMutation } from "@/features/auth/api/auth.api";
import { setLoading as setAuthLoading } from "@/features/auth/store/auth.slice";
import { useAppDispatch } from "@/store/hooks";
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
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [login] = useLoginMutation();

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      dispatch(setAuthLoading(true));
      const response = await login({
        email: data.email,
        password: data.password,
        type: userKind,
      }).unwrap();
      toast.success("Login successful");
      const kind = response.user?.kind || userKind;

      if (kind === "DRIVER") {
        // Check for redirect param (used in guest booking flow)
        const redirectParam = searchParams?.get("redirect");
        if (redirectParam) {
          // Append is_logged_in=true so auto-booking triggers
          const redirectUrl = new URL(redirectParam, window.location.origin);
          redirectUrl.searchParams.set("is_logged_in", "true");
          router.push(redirectUrl.pathname + redirectUrl.search);
        } else {
          router.push("/driver/book-my-mot");
        }
      } else if (kind === "GARAGE") {
        router.push("/garage/garage-profile");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      const msg = error.data?.message || error.message || "Login failed";
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
                      <FormLabel className="text-sm font-medium text-gray-700 block">
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
                      <FormMessage className="text-red-500 text-sm" />
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-medium text-gray-700 block">
                          Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <Link
                          href={`/forgot-password${
                            searchParams?.get("redirect")
                              ? `?redirect=${encodeURIComponent(
                                  searchParams.get("redirect")!,
                                )}`
                              : ""
                          }`}
                          className="text-xs font-semibold text-[#19CA32] hover:underline"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
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
                  <Link
                    href={`/verify-email?userKind=${userKind}${
                      searchParams?.get("redirect")
                        ? `&redirect=${encodeURIComponent(
                            searchParams.get("redirect")!,
                          )}`
                        : ""
                    }`}
                    className="font-semibold text-[#19CA32] hover:underline cursor-pointer"
                  >
                    Enter verification code
                  </Link>
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
                          ? `/create-account/driver${
                              searchParams?.get("redirect")
                                ? `?redirect=${encodeURIComponent(
                                    searchParams.get("redirect")!,
                                  )}`
                                : ""
                            }`
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
    </div>
  );
}
