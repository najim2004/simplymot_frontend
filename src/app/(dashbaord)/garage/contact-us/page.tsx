"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useCreateContactMessageMutation } from "@/features/contact";
import { useGetGarageProfileQuery } from "@/features/garage";
import { useAppSelector } from "@/store/hooks";

type ContactFormValues = {
  garage_name: string;
  primary_contact_person_name: string;
  email: string;
  phone_number: string;
  message: string;
};

const inputStyle =
  "py-6 px-4 border border-gray-300 text-base rounded-lg focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32]";

export default function ContactUs() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: profileResponse } = useGetGarageProfileQuery();

  const [createContactMessage, { isLoading }] =
    useCreateContactMessageMutation();

  const form = useForm<ContactFormValues>({
    defaultValues: {
      garage_name: "",
      primary_contact_person_name: "",
      email: "",
      phone_number: "",
      message: "",
    },
  });

  // Pre-fill default values from Redux user state & cached garage profile
  useEffect(() => {
    const garageProfile = profileResponse?.data;

    const garageName =
      garageProfile?.garage_name ||
      user?.garages?.[0]?.garage_name ||
      user?.garage_name ||
      "";

    const primaryContact = user?.name || user?.primary_contact || "";

    const userEmail = user?.email || "";
    const userPhone = user?.phone_number || "";

    form.reset({
      garage_name: garageName,
      primary_contact_person_name: primaryContact,
      email: userEmail,
      phone_number: userPhone,
      message: "",
    });
  }, [user, profileResponse, form]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const apiData = {
        garage_name: data.garage_name,
        primary_contact: data.primary_contact_person_name,
        email: data.email,
        phone_number: data.phone_number,
        message: data.message,
        source: "Garage",
      };

      const response = await createContactMessage(apiData).unwrap();
      toast.success(response.message || "Form submitted successfully");
      form.reset({
        garage_name: form.getValues("garage_name"),
        primary_contact_person_name: form.getValues(
          "primary_contact_person_name",
        ),
        email: form.getValues("email"),
        phone_number: form.getValues("phone_number"),
        message: "",
      });
    } catch (err: unknown) {
      const error = err as { data?: { message?: string | string[] } };
      console.error("Error submitting form:", error);
      const errorMessage = Array.isArray(error?.data?.message)
        ? error.data.message.join(", ")
        : error?.data?.message || "Failed to submit form. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-8">
      <div className="w-full max-w-lg rounded-xl border border-[#19CA32] shadow-lg overflow-hidden">
        {/* Form Header */}
        <div className="bg-[#19CA32] text-white p-4">
          <h1 className="text-xl font-semibold">Contact Us</h1>
        </div>

        {/* Form Body using Shadcn UI Form */}
        <div className="p-6 bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Garage Name */}
              <FormField
                control={form.control}
                name="garage_name"
                rules={{
                  required: "Garage name is required",
                  minLength: {
                    value: 2,
                    message: "Garage name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 block">
                      Garage Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter garage name"
                        className={inputStyle}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Primary Contact Person Name */}
              <FormField
                control={form.control}
                name="primary_contact_person_name"
                rules={{
                  required: "Primary contact person name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 block">
                      Primary Contact Person Name{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contact person name"
                        className={inputStyle}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Please enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 block">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        className={inputStyle}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone_number"
                rules={{
                  required: "Phone number is required",
                  minLength: {
                    value: 10,
                    message: "Phone number must be at least 10 digits",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 block">
                      Phone Number <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        className={inputStyle}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                rules={{
                  required: "Message is required",
                  minLength: {
                    value: 10,
                    message: "Message must be at least 10 characters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 block">
                      Message <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here..."
                        className="p-4 border border-gray-300 text-base rounded-lg focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold py-6 rounded-lg text-base mt-6 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
          </Form>
        </div>
      </div>
    </div>
  );
}
