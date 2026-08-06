"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import bgImage from "@/public/Image/register/bgImage.png";
import carImage from "@/public/Image/register/registerLargeImg.png";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegisterMutation } from "@/features/auth";
import { EmailVerificationModal } from "@/components/reusable/EmailVerificationModal";

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

export default function AuthRegisterForm({ userKind }: AuthRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RegisterFormData>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [registerUser, { isLoading }] = useRegisterMutation();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const agreeToTerms = watch("agreeToTerms");

  const onVerificationSuccess = () => {
    setShowVerificationModal(false);
    setRegisteredEmail("");
    reset();
    if (userKind === "DRIVER") {
      const redirectPath = searchParams?.get("redirect")
        ? `/login/driver?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
        : "/login/driver";
      router.push(redirectPath);
    } else {
      router.push("/login/garage");
    }
  };

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setRegisteredEmail("");
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      let payload;
      if (userKind === "DRIVER") {
        payload = {
          name: data.name || "",
          email: data.email,
          phone_number: data.phoneNumber || "",
          password: data.password || "",
          kind: "DRIVER",
        };
      } else {
        payload = {
          garage_name: data.nameOfGarage || "",
          vts_number: data.vtsNumber || "",
          primary_contact: data.primaryContactPerson || "",
          email: data.email,
          phone_number: data.contactNumber || "",
          password: data.password || "",
          kind: "GARAGE",
          name: data.primaryContactPerson || "",
        };
      }

      const response = await registerUser(payload).unwrap();
      if (response.success || (response as any).status === "success") {
        setRegisteredEmail(data.email);
        setShowVerificationModal(true);
        toast.success(response.message || "Account created successfully");
      }
    } catch (err: any) {
      toast.error(err.data?.message || err.message || "Registration failed");
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
    userKind === "DRIVER"
      ? "Let's create your account."
      : "Let's set up your membership";

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
            <h2 className="text-xl text-center sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-8 sm:mb-10">
              {formHeading}
            </h2>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-5"
            >
              {formFields
                .filter((field) => field.userKinds.includes(userKind))
                .map((field) => (
                  <div key={field.id}>
                    <Label
                      htmlFor={field.id}
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      {field.label} <span className="text-red-500">*</span>
                    </Label>
                    {field.id === "password" ? (
                      <div className="relative mt-2">
                        <Input
                          id={field.id}
                          type={showPassword ? "text" : "password"}
                          placeholder={field.placeholder}
                          className="py-6 pr-12 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                          {...register(field.id, {
                            required: field.required,
                            minLength: field.minLength,
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
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="mt-2 py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                        {...register(field.id, {
                          required: field.required,
                          pattern: field.pattern,
                        })}
                      />
                    )}
                    {errors[field.id] && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors[field.id]?.message}
                      </p>
                    )}
                  </div>
                ))}

              {/* Terms and Privacy Policy Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  className="h-4 w-4 cursor-pointer"
                  checked={agreeToTerms || false}
                  onCheckedChange={(checked) => {
                    setValue("agreeToTerms", checked === true);
                  }}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  I agree to the Terms & Conditions and Privacy Policy.
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.agreeToTerms.message}
                </p>
              )}

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
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        onClose={closeVerificationModal}
        email={registeredEmail}
        onVerificationSuccess={onVerificationSuccess}
      />
    </div>
  );
}
