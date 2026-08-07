"use client";
import React from "react";
import { useForm } from "react-hook-form";
import bgImg from "@/public/Image/home/bannerImage.png";
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
import LargeButtonReuseable from "@/components/reusable/LargeButtonReuseable";
import { useCreateContactMessageMutation } from "@/features/contact";
import { toast } from "react-toastify";

interface ContactFormData {
  name: string;
  email: string;
  contactNumber: string;
  message: string;
}

const inputStyle =
  "py-6 px-4 border border-gray-300 text-base rounded-lg focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32]";

export default function ContactUs() {
  const [createContactMessage, { isLoading }] =
    useCreateContactMessageMutation();

  const form = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await createContactMessage({
        name: data.name,
        email: data.email,
        phone_number: data.contactNumber,
        message: data.message,
        source: "Landing",
      }).unwrap();
      form.reset();
      toast.success("Message sent successfully!");
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${bgImg.src})` }}
      className="w-full bg-cover bg-center bg-no-repeat py-20 lg:py-30 relative overflow-hidden"
    >
      {/* Right Form */}
      <div className="container flex justify-center items-center px-5 2xl:px-0">
        <div className="w-full max-w-sm md:max-w-md bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="bg-[#19CA32] text-white py-5 px-6">
            <h1 className="text-xl font-bold">Contact Us</h1>
          </div>
          <div className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Name */}
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
                      <FormLabel className="text-sm font-medium text-gray-700 block">
                        Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Name"
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
                          type="email"
                          placeholder="Email"
                          className={inputStyle}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                {/* Contact Number */}
                <FormField
                  control={form.control}
                  name="contactNumber"
                  rules={{
                    required: "Contact Number is required",
                    pattern: {
                      value: /^[0-9+-\s()]{7,15}$/,
                      message: "Invalid contact number",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 block">
                        Contact Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Contact Number"
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
                          placeholder="Message"
                          className="p-4 border border-gray-300 text-base rounded-lg focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <LargeButtonReuseable
                    text={isLoading ? "Sending..." : "Send Message"}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#19CA32] hover:bg-green-600 text-white font-semibold py-4 rounded-lg text-base"
                  />
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
