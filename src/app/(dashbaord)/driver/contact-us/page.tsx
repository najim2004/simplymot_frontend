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
import { useAppSelector } from "@/store/hooks";

type ContactFormValues = {
  name: string;
  email: string;
  phone_number: string;
  message: string;
};

export default function ContactUs() {
  const { user } = useAppSelector((state) => state.auth);

  const [createContactMessage, { isLoading }] =
    useCreateContactMessageMutation();

  const form = useForm<ContactFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      message: "",
    },
  });

  // Pre-fill default values from current user profile, while allowing edits
  useEffect(() => {
    if (user) {
      const u = user as any;
      const fullName =
        u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "";
      const phone = u.phone_number || u.phone || u.contactNo || "";

      form.reset({
        name: fullName,
        email: u.email || "",
        phone_number: phone,
        message: "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const response = await createContactMessage({
        ...data,
        source: "Driver",
      }).unwrap();
      toast.success(response.message || "Form submitted successfully");
      form.reset({
        name: form.getValues("name"),
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
      <div className="w-full max-w-lg rounded-lg border border-[#14A228] shadow-lg overflow-hidden">
        {/* Form Header */}
        <div className="bg-[#14A228] text-white p-4">
          <h1 className="text-xl font-semibold">Contact Us</h1>
        </div>

        {/* Form Body using Shadcn UI Form */}
        <div className="p-6 bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                rules={{
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
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
                    <FormLabel className="text-gray-700 font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number Field */}
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
                    <FormLabel className="text-gray-700 font-medium">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        {...field}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message Field */}
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
                    <FormLabel className="text-gray-700 font-medium">
                      Message
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your message here..."
                        {...field}
                        className="border-gray-300 focus:border-green-500 focus:ring-green-500 min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full cursor-pointer bg-[#14A228] hover:bg-[#118821] text-white font-medium py-3 rounded-md mt-6"
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
          </Form>
        </div>
      </div>
    </div>
  );
}
