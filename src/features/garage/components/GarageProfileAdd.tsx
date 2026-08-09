"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, X, Tag, Camera, Check } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { DEFAULT_GARAGE_AVATAR_SRC } from "@/lib/garage-assets";

import { useUpdateGarageProfileMutation } from "@/features/garage";
import type { GarageProfile } from "../types";

interface GarageProfileFormData {
  garageName: string;
  vtsNumber: string;
  postcode: string;
  email: string;
  contactNumber: string;
  address: string;
}

interface GarageProfileAddProps {
  profile: GarageProfile;
}

export default function GarageProfileAdd({ profile }: GarageProfileAddProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateGarageProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GarageProfileFormData>({
    defaultValues: {
      garageName: profile?.garage_name || "",
      vtsNumber: profile?.vts_number || "",
      postcode: profile?.post_code || "",
      email: profile?.contact_email || "",
      contactNumber: profile?.phone_number || "",
      address: profile?.address || "",
    },
  });

  useEffect(() => {
    reset({
      garageName: profile?.garage_name || "",
      vtsNumber: profile?.vts_number || "",
      postcode: profile?.post_code || "",
      email: profile?.contact_email || "",
      contactNumber: profile?.phone_number || "",
      address: profile?.address || "",
    });
  }, [profile, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImagePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const onSubmit = async (data: GarageProfileFormData) => {
    try {
      const formData = new FormData();
      if (data.garageName) formData.append("garage_name", data.garageName);
      if (data.vtsNumber) formData.append("vts_number", data.vtsNumber);
      if (data.email) formData.append("contact_email", data.email);
      if (data.contactNumber)
        formData.append("phone_number", data.contactNumber);
      if (data.postcode) formData.append("post_code", data.postcode);
      if (data.address) formData.append("address", data.address);
      if (selectedFile) {
        formData.append("garage_image", selectedFile);
      }

      const garageId = profile?.id;
      if (garageId) {
        await updateProfile({ id: garageId, body: formData }).unwrap();
      } else {
        await updateProfile(formData).unwrap();
      }

      toast.success("Garage profile updated successfully!");
      if (!selectedFile) {
        reset(data);
      }
      setSelectedFile(null);
      setImagePreview(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update garage profile. Please try again.");
    }
  };

  const handleCancel = () => {
    reset({
      garageName: profile?.garage_name || "",
      vtsNumber: profile?.vts_number || "",
      postcode: profile?.post_code || "",
      email: profile?.contact_email || "",
      contactNumber: profile?.phone_number || "",
      address: profile?.address || "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setIsEditing(false);
  };

  const avatarSrc =
    imagePreview ||
    (profile?.garage_image && !imageError
      ? profile.garage_image.trim()
      : DEFAULT_GARAGE_AVATAR_SRC);

  const motPrice = profile?.mot_price ? profile.mot_price.toString() : "00.00";

  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-xl overflow-hidden">
        {/* Hidden File Input */}
        <input
          id={fileInputId}
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Card Top Header (Logo + Price + Edit / Cancel Button) */}
        <div className="p-5 border-b border-gray-200 bg-gray-50/50 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Absolutely Positioned Edit / Cancel Button at Top Right Corner */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
            {!isEditing ? (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-[#19CA32] hover:bg-[#16b82e] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
              >
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            )}
          </div>

          {/* Top Left: Enlarged Garage Logo Image */}
          <div className="flex items-center gap-5 pt-4 sm:pt-0">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 sm:w-56 sm:h-56 rounded-xl border bg-white p-2.5 flex items-center justify-center overflow-hidden">
                <Image
                  width={160}
                  height={160}
                  src={avatarSrc}
                  alt="Garage logo"
                  className="w-full h-full object-contain rounded-lg"
                  onError={() => setImageError(true)}
                  unoptimized={Boolean(imagePreview)}
                />
              </div>

              {/* Edit Mode: Camera Replace Icon Badge on Image */}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-[#19CA32] hover:bg-[#16b82e] text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center border-2 border-white"
                  title="Replace garage logo"
                >
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>

            {selectedFile && isEditing && (
              <div className="flex items-center gap-1.5 text-xs text-[#19CA32] font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <Check className="w-4 h-4" />
                <span>New logo ready</span>
              </div>
            )}
          </div>

          {/* Right Header Area: Price Display below the Edit button */}
          <div className="mt-8 sm:mt-10 self-end sm:self-auto pr-2">
            <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-extrabold text-[#19CA32]">
              <Tag className="w-6 h-6 text-[#19CA32]" />
              <span>£{motPrice}</span>
            </div>
          </div>
        </div>

        {/* Card Main Body (Full Width Form Fields) */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name of Garage - Full Width */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 block">
                Name of Garage{" "}
                {isEditing && <span className="text-red-500">*</span>}
              </Label>

              {isEditing ? (
                <Input
                  {...register("garageName", {
                    required: "Garage name is required",
                    minLength: {
                      value: 2,
                      message: "Garage name must be at least 2 characters",
                    },
                  })}
                  placeholder="Enter garage name"
                  className="py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                />
              ) : (
                <div className="py-3 px-4 border border-gray-200 bg-gray-50/50 text-base font-semibold text-gray-900 rounded-lg">
                  {profile?.garage_name || "N/A"}
                </div>
              )}

              {errors.garageName && isEditing && (
                <p className="text-sm text-red-500">
                  {errors.garageName.message}
                </p>
              )}
            </div>

            {/* VTS Number & Postcode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 block">
                  VTS Number{" "}
                  {isEditing && <span className="text-red-500">*</span>}
                </Label>

                {isEditing ? (
                  <Input
                    {...register("vtsNumber", {
                      required: "VTS Number is required",
                    })}
                    placeholder="Enter VTS number"
                    className="py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                  />
                ) : (
                  <div className="py-3 px-4 border border-gray-200 bg-gray-50/50 text-base font-semibold font-mono text-[#19CA32] rounded-lg">
                    {profile?.vts_number || "N/A"}
                  </div>
                )}

                {errors.vtsNumber && isEditing && (
                  <p className="text-sm text-red-500">
                    {errors.vtsNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 block">
                  Postcode{" "}
                  {isEditing && <span className="text-red-500">*</span>}
                </Label>

                {isEditing ? (
                  <Input
                    {...register("postcode", {
                      required: "Postcode is required",
                    })}
                    placeholder="Enter postcode"
                    className="py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                  />
                ) : (
                  <div className="py-3 px-4 border border-gray-200 bg-gray-50/50 text-base font-semibold font-mono text-gray-900 rounded-lg">
                    {profile?.post_code || "N/A"}
                  </div>
                )}

                {errors.postcode && isEditing && (
                  <p className="text-sm text-red-500">
                    {errors.postcode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Garage Contact Email & Garage Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 block">
                  Garage Contact Email{" "}
                  {isEditing && <span className="text-red-500">*</span>}
                </Label>

                {isEditing ? (
                  <Input
                    {...register("email", {
                      required: "Garage contact email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    type="email"
                    placeholder="Enter garage contact email"
                    className="py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                  />
                ) : (
                  <div className="py-3 px-4 border border-gray-200 bg-gray-50/50 text-base font-semibold text-gray-900 rounded-lg">
                    {profile?.contact_email || "N/A"}
                  </div>
                )}

                {errors.email && isEditing && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 block">
                  Garage Phone Number{" "}
                  {isEditing && <span className="text-red-500">*</span>}
                </Label>

                {isEditing ? (
                  <Input
                    {...register("contactNumber", {
                      required: "Garage phone number is required",
                      minLength: {
                        value: 10,
                        message: "Contact number must be at least 10 digits",
                      },
                    })}
                    type="tel"
                    placeholder="Enter garage phone number"
                    className="py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                  />
                ) : (
                  <div className="py-3 px-4 border border-gray-200 bg-gray-50/50 text-base font-semibold text-gray-900 rounded-lg">
                    {profile?.phone_number || "N/A"}
                  </div>
                )}

                {errors.contactNumber && isEditing && (
                  <p className="text-sm text-red-500">
                    {errors.contactNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 block">
                Address {isEditing && <span className="text-red-500">*</span>}
              </Label>

              {isEditing ? (
                <Input
                  {...register("address", {
                    required: "Address is required",
                  })}
                  placeholder="Enter address"
                  className="py-6 border border-gray-300 focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] text-base px-4 rounded-lg"
                />
              ) : (
                <div className="py-3 px-4 border border-gray-200 bg-gray-50/50 text-base font-semibold text-gray-900 rounded-lg">
                  {profile?.address || "N/A"}
                </div>
              )}

              {errors.address && isEditing && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* Submit & Cancel Buttons (Only visible in Edit mode) */}
            {isEditing && (
              <div className="flex items-center justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="py-6 px-6 text-base font-semibold rounded-lg border-gray-300 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="py-6 px-8 bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-base rounded-lg transition-all cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
