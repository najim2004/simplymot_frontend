"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useRegisterMutation } from "@/features/auth/api/auth.api";
import DriverAuthBanner from "./DriverAuthBanner";
import GarageAuthBanner from "./GarageAuthBanner";

interface RegisterFormData {
  name?: string;
  nameOfGarage?: string;
  vtsNumber?: string;
  primaryContactPerson?: string;
  email: string;
  phoneNumber?: string;
  contactNumber?: string;
  password?: string;
  agreeToTerms: boolean;
}

interface AuthRegisterFormProps {
  userKind: "DRIVER" | "GARAGE";
}

interface FieldConfig {
  id: Exclude<keyof RegisterFormData, "agreeToTerms">;
  label: string;
  type: string;
  placeholder: string;
  required: string;
  userKinds: ("DRIVER" | "GARAGE")[];
  pattern?: { value: RegExp; message: string };
  minLength?: { value: number; message: string };
}

const formFields: FieldConfig[] = [
  {
    id: "name",
    label: "Name",
    type: "text",
    placeholder: "Enter your name",
    required: "Name is required",
    userKinds: ["DRIVER"],
  },
  {
    id: "nameOfGarage",
    label: "Name of Garage",
    type: "text",
    placeholder: "Enter garage name",
    required: "Garage name is required",
    userKinds: ["GARAGE"],
  },
  {
    id: "vtsNumber",
    label: "VTS Number",
    type: "text",
    placeholder: "Enter VTS number",
    required: "VTS number is required",
    userKinds: ["GARAGE"],
  },
  {
    id: "primaryContactPerson",
    label: "Primary Contact Person",
    type: "text",
    placeholder: "Enter contact person name",
    required: "Primary contact person is required",
    userKinds: ["GARAGE"],
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
    required: "Email is required",
    userKinds: ["DRIVER", "GARAGE"],
    pattern: {
      value: /^\S+@\S+$/i,
      message: "Invalid email address",
    },
  },
  {
    id: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    placeholder: "Enter your phone number",
    required: "Phone number is required",
    userKinds: ["DRIVER"],
  },
  {
    id: "contactNumber",
    label: "Contact Number",
    type: "tel",
    placeholder: "Enter your contact number",
    required: "Contact number is required",
    userKinds: ["GARAGE"],
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    required: "Password is required",
    userKinds: ["DRIVER", "GARAGE"],
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  },
];

export default function AuthRegisterForm({ userKind }: AuthRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      agreeToTerms: false,
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const [registerUser, { isLoading }] = useRegisterMutation();

  const agreeToTerms = form.watch("agreeToTerms");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const payload = {
        name:
          userKind === "DRIVER" ? data.name : data.primaryContactPerson || "",
        email: data.email,
        phone_number:
          userKind === "DRIVER" ? data.phoneNumber : data.contactNumber || "",
        password: data.password || "",
        kind: userKind,
        ...(userKind == "GARAGE"
          ? {
              garage_name: data.nameOfGarage || "",
              vts_number: data.vtsNumber || "",
            }
          : {}),
      };

      const response = await registerUser(payload).unwrap();
      if (response.success) {
        toast.success(
          response.message ||
            "Account created successfully! Please verify your email.",
        );
        const redirect = searchParams?.get("redirect");
        const verifyUrl = `/verify-email?email=${encodeURIComponent(data.email)}&userKind=${userKind}${
          redirect ? `&redirect=${encodeURIComponent(redirect)}` : ""
        }`;
        router.push(verifyUrl);
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error.data?.message || error.message || "Registration failed",
      );
    }
  };

  const formHeading =
    userKind === "DRIVER"
      ? "Let's create your account."
      : "Let's set up your membership";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row p-4 gap-4">
      {/* Left Side - Hero Banner */}
      <div className="flex-1 lg:flex-1">
        {userKind === "DRIVER" ? (
          <DriverAuthBanner onBack={() => router.back()} />
        ) : (
          <GarageAuthBanner onBack={() => router.back()} />
        )}
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:flex-1 flex items-center justify-center rounded-2xl">
        <div className="lg:h-[calc(100vh-32px)] lg:overflow-y-auto w-full flex justify-center items-center">
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
                  {formFields
                    .filter((field) => field.userKinds.includes(userKind))
                    .map((field) => (
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={field.id}
                        rules={{
                          required: field.required,
                          pattern: field.pattern,
                          minLength: field.minLength,
                        }}
                        render={({ field: formFieldProps }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700 block">
                              {field.label}{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              {field.id === "password" ? (
                                <div className="relative">
                                  <Input
                                    id={field.id}
                                    type={showPassword ? "text" : "password"}
                                    placeholder={field.placeholder}
                                    className="py-6 pr-12 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                                    {...formFieldProps}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                                    ) : (
                                      <Eye className="h-5 w-5 text-[#19CA32] cursor-pointer" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <Input
                                  id={field.id}
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  className="py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                                  {...formFieldProps}
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}

                  {/* Terms and Privacy Policy Checkbox */}
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    rules={{
                      required:
                        "You must agree to the Terms & Conditions and Privacy Policy.",
                    }}
                    render={({ field: agreeField }) => (
                      <FormItem>
                        <div className="flex items-center space-x-2 pt-2">
                          <FormControl>
                            <Checkbox
                              id="terms"
                              className="h-4 w-4 cursor-pointer"
                              checked={agreeField.value || false}
                              onCheckedChange={agreeField.onChange}
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="terms"
                            className="text-sm text-gray-600 leading-relaxed font-normal cursor-pointer"
                          >
                            I agree to the Terms & Conditions and Privacy
                            Policy.
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || !agreeToTerms}
                    className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#19CA32] disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed text-white py-6 rounded-lg font-medium text-base transition-all duration-200 hover:shadow-lg hover:shadow-green-500 disabled:hover:shadow-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Please wait...</span>
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link
                        href={
                          userKind === "DRIVER"
                            ? `/login/driver${
                                searchParams?.get("redirect")
                                  ? `?redirect=${encodeURIComponent(
                                      searchParams.get("redirect")!,
                                    )}`
                                  : ""
                              }`
                            : "/login/garage"
                        }
                        className="text-[#19CA32] hover:underline font-medium"
                      >
                        Log in
                      </Link>
                    </span>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
