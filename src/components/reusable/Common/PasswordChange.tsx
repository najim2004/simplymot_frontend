"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useChangePasswordMutation } from "@/features/auth";

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function CommonPasswordChangeComponent() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordValidation = {
    required: "This field is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }

      await changePassword({
        old_password: data.oldPassword,
        new_password: data.newPassword,
      }).unwrap();

      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      toast.error(
        error.data?.message ||
          error.message ||
          "Failed to change password. Please try again.",
      );
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
        <CardTitle className="text-xl sm:text-2xl">Password</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-6"
          >
            {/* Old Password */}
            <FormField
              control={passwordForm.control}
              name="oldPassword"
              rules={passwordValidation}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium block">
                    Old Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Enter your old password"
                        className="py-6 pr-12 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 cursor-pointer text-gray-500"
                        onClick={() => setShowOldPassword((prev) => !prev)}
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={passwordForm.control}
              name="newPassword"
              rules={passwordValidation}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium block">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New Password"
                        className="py-6 pr-12 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 cursor-pointer text-gray-500"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              rules={passwordValidation}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium block">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className="py-6 pr-12 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 cursor-pointer text-gray-500"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full py-6 text-base font-semibold transition-all rounded-lg cursor-pointer ${
                isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#14A228] hover:bg-green-600 text-white"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Changing Password...
                </div>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
