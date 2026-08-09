"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Edit2, Loader2 } from "lucide-react";
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
import { useGetMeQuery, useUpdateProfileMutation } from "@/features/auth";
import ProfileImageUpload from "./CommonImage";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface ApiErrorResponse {
  data?: {
    message?: string;
  };
  message?: string;
}

const profileValidation = {
  name: {
    required: "Name is required",
    minLength: {
      value: 2,
      message: "Name must be at least 2 characters",
    },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  phone: {
    required: "Phone number is required",
  },
};

export default function MyProfile() {
  const {
    data: profileResponse,
    isLoading,
    isError,
    refetch,
  } = useGetMeQuery();
  const profile = profileResponse?.data || null;

  const [updateProfile, { isLoading: isUpdating, error: updateError }] =
    useUpdateProfileMutation();

  // State
  const [profileImage, setProfileImage] = useState<string>(
    "/api/placeholder/96/96",
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile) {
      const formValues = {
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone_number || "",
      };
      profileForm.reset(formValues);
      setProfileImage(
        profile.avatar || "/api/placeholder/96/96",
      );
    }
  }, [profile, profileForm]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = e.target?.result as string;
        setProfileImage(newImage);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      let payload: FormData | { name: string; email: string; phone: string; image?: string };
      if (selectedFile) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("image", selectedFile);
        payload = formData;
      } else {
        const currentAvatar = profile?.avatar;
        const jsonPayload: { name: string; email: string; phone: string; image?: string } = {
          name: data.name,
          email: data.email,
          phone: data.phone,
        };
        if (profileImage && profileImage !== currentAvatar) {
          jsonPayload.image = profileImage;
        }
        payload = jsonPayload;
      }
      await updateProfile(payload).unwrap();
      await refetch();
      setIsEditing(false);
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const apiErr = error as ApiErrorResponse;
      toast.error(
        apiErr.data?.message ||
          apiErr.message ||
          "Failed to update profile. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
          <CardTitle className="text-2xl">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#14A228]" />
            <span className="ml-2 text-gray-600">Loading profile data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5">
          <CardTitle className="text-2xl">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Failed to load profile data.</p>
            <Button
              onClick={refetch}
              className="bg-[#14A228] hover:bg-green-600"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const typedUpdateError = updateError as ApiErrorResponse | undefined;

  return (
    <Card className="shadow-sm">
      {/* Header with single Edit Profile Toggle Button */}
      <CardHeader className="bg-[#14A228] text-white rounded-t-lg p-5 flex flex-row items-center justify-between">
        <CardTitle className="text-xl sm:text-2xl">My Profile</CardTitle>
        <Button
          type="button"
          onClick={() => setIsEditing((prev) => !prev)}
          className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 cursor-pointer border border-white/30 transition-all"
        >
          <Edit2 className="h-3.5 w-3.5" />
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </Button>
      </CardHeader>

      <CardContent className="p-6">
        {/* Profile Image Component */}
        <ProfileImageUpload
          profileImage={profileImage}
          onImageClick={handleImageClick}
          onImageChange={handleImageChange}
          fileInputRef={fileInputRef}
          onImageError={() => setProfileImage("")}
        />

        {typedUpdateError && (
          <p className="text-sm text-red-500 mb-2">
            {typedUpdateError.data?.message || "Failed to update profile"}
          </p>
        )}

        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-5"
          >
            {/* Name Field */}
            <FormField
              control={profileForm.control}
              name="name"
              rules={profileValidation.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      disabled={!isEditing}
                      className={`py-6 border border-gray-300 text-base px-4 rounded-lg focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] transition-colors ${
                        isEditing
                          ? "border-[#19CA32] bg-white ring-1 ring-[#19CA32]"
                          : "border-gray-300 bg-gray-50/80"
                      }`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={profileForm.control}
              name="email"
              rules={profileValidation.email}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      disabled={true}
                      className="py-6 border border-gray-300 text-base px-4 rounded-lg bg-gray-50/80 cursor-not-allowed opacity-80"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={profileForm.control}
              name="phone"
              rules={profileValidation.phone}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      disabled={!isEditing}
                      className={`py-6 border border-gray-300 text-base px-4 rounded-lg focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] transition-colors ${
                        isEditing
                          ? "border-[#19CA32] bg-white ring-1 ring-[#19CA32]"
                          : "border-gray-300 bg-gray-50/80"
                      }`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Single Save Button */}
            <Button
              type="submit"
              disabled={!isEditing && !selectedFile}
              className={`w-full cursor-pointer py-6 font-semibold text-base transition-all rounded-lg ${
                isEditing || selectedFile
                  ? "bg-[#14A228] hover:bg-green-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
