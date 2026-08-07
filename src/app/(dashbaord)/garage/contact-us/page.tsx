"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useCreateContactMessageMutation } from "@/features/contact";
import { useAppSelector } from "@/store/hooks";
import { useGetMeQuery } from "@/features/auth";

type ContactFormValues = {
  garage_name: string;
  primary_contact_person_name: string;
  email: string;
  phone_number: string;
  message: string;
};

export default function ContactUs() {
  const [createContactMessage, { isLoading }] =
    useCreateContactMessageMutation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: authMeData } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [userData, setUserData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      garage_name: "",
      primary_contact_person_name: "",
      email: "",
      phone_number: "",
      message: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && authMeData?.success && authMeData?.data) {
      const responseData = authMeData.data;
      setUserData(responseData);
      // Pre-fill form with user data
      reset({
        garage_name: responseData.garage_name || "",
        primary_contact_person_name: responseData.primary_contact || "",
        email: responseData.email || "",
        phone_number: responseData.phone_number || "",
        message: "",
      });
    }
  }, [isAuthenticated, authMeData, reset]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const apiData = {
        name: data.garage_name, // Map garage_name to name for DTO
        email: data.email,
        phone_number: data.phone_number,
        message: data.message,
        primary_contact: data.primary_contact_person_name, // Optional field
        source: "Garage",
      };

      const response = await createContactMessage(apiData).unwrap();
      toast.success(response.message || "Form submitted successfully");
      reset();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage = Array.isArray(error?.data?.message)
        ? error.data.message.join(", ")
        : error?.data?.message || "Failed to submit form. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-8">
      <div className="w-full max-w-lg rounded-lg border border-[#14A228] shadow-lg">
        <div className="bg-[#14A228] text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-inder font-semibold ">Contact Us</h1>
        </div>
        <div className="p-6 bg-white rounded-b-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="garage_name"
                className="text-gray-700 font-medium"
              >
                Garage Name
              </Label>
              <Input
                id="garage_name"
                placeholder=""
                {...register("garage_name", {
                  required: "Garage name is required",
                  minLength: {
                    value: 2,
                    message: "Garage name must be at least 2 characters",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.garage_name && (
                <p className="text-red-500 text-sm">
                  {errors.garage_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="primary_contact_person_name"
                className="text-gray-700 font-medium"
              >
                Primary Contact Person Name
              </Label>
              <Input
                id="primary_contact_person_name"
                placeholder=""
                {...register("primary_contact_person_name", {
                  required: "Primary contact person name is required",
                  minLength: {
                    value: 2,
                    message:
                      "Primary contact person name must be at least 2 characters",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.primary_contact_person_name && (
                <p className="text-red-500 text-sm">
                  {errors.primary_contact_person_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder=""
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone_number"
                className="text-gray-700 font-medium"
              >
                Phone Number
              </Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder=""
                {...register("phone_number", {
                  required: "Phone number is required",
                  minLength: {
                    value: 10,
                    message: "Phone number must be at least 10 digits",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-700 font-medium">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder=""
                {...register("message", {
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                })}
                className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[120px] resize-none"
              />
              {errors.message && (
                <p className="text-red-500 text-sm">{errors.message.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-md mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
            <p className="text-sm text-gray-500 text-center mt-4">
              Our support hours are Monday to Friday, from 9:00am to 5:00pm.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
