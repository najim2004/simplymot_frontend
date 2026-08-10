"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown, Loader, Search } from "lucide-react";
import imgMot from "@/public/Image/admin/cardMot.png";
import { getBrandLogo } from "@/lib/helper/vehicle.helper";
import { cx } from "class-variance-authority";
import type { VehicleData } from "@/features/driver/types/driver.types";

interface SearchFormData {
  registrationNumber: string;
  postcode: string;
}

interface BookMyMotSearchFormProps {
  defaultRegistration: string;
  defaultPostcode: string;
  isLoading: boolean;
  isFetching: boolean;
  showResults: boolean;
  vehicle: VehicleData | null;
  shouldShowMotExpiry: boolean;
  onSearchSubmit: (registration: string, postcode: string) => void;
  formatMotExpiryDate: (date: string) => string;
}

export const BookMyMotSearchForm: React.FC<BookMyMotSearchFormProps> = ({
  defaultRegistration,
  defaultPostcode,
  isLoading,
  isFetching,
  showResults,
  vehicle,
  shouldShowMotExpiry,
  onSearchSubmit,
  formatMotExpiryDate,
}) => {
  const [isVehicleDetailsExpanded, setIsVehicleDetailsExpanded] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    defaultValues: {
      registrationNumber: defaultRegistration,
      postcode: defaultPostcode,
    },
    values: {
      registrationNumber: defaultRegistration,
      postcode: defaultPostcode,
    },
  });

  const onSubmit = (formData: SearchFormData) => {
    onSearchSubmit(formData.registrationNumber, formData.postcode);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="overflow-hidden">
      <div
        className={`relative ${showResults ? "h-auto" : "h-[calc(100vh-115px)] overflow-hidden"}`}
      >
        <div
          className={`relative z-10 w-full max-w-4xl xl:max-w-5xl mx-auto ${showResults ? "pt-0" : "pt-16 lg:pt-20"}`}
        >
          {!showResults && (
            <h1 className="text-[30px] sm:text-[36px] lg:text-[46px] font-semibold text-[#19CA32] leading-[1.15] font-inder text-center">
              Find MOT garages near you in seconds
            </h1>
          )}

          <div
            className={`items-end justify-center lg:grid-cols-3 gap-2 md:gap-4 w-full ${showResults ? "mt-0 flex lg:grid" : "grid mt-6 sm:mt-8 lg:mt-10"}`}
          >
            {/* Registration Number Input */}
            <div>
              <Label
                htmlFor="registrationNumber"
                className="text-sm mb-2 font-medium text-gray-700 lg:block sr-only"
              >
                Registration Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="registrationNumber"
                type="text"
                placeholder="Registration Number"
                className="h-11 bg-white text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-sm"
                {...register("registrationNumber", {
                  required: "Registration number is required",
                  pattern: {
                    value: /^[A-Z0-9\s]{2,9}$/i,
                    message: "Invalid registration number format",
                  },
                })}
              />
              <div className="min-h-4">
                {errors.registrationNumber && (
                  <p className="text-red-500 text-xs">
                    {errors.registrationNumber.message}
                  </p>
                )}
              </div>
            </div>

            {/* Postcode Input */}
            <div>
              <Label
                htmlFor="postcode"
                className="text-sm mb-2 font-medium text-gray-700 lg:block sr-only"
              >
                Postcode <span className="text-red-500">*</span>
              </Label>
              <Input
                id="postcode"
                type="text"
                placeholder="Postcode"
                className="h-11 bg-white text-base border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] rounded-sm"
                {...register("postcode", {
                  required: "Postcode is required",
                })}
              />
              <div className="min-h-4">
                {errors.postcode && (
                  <p className="text-red-500 text-xs">
                    {errors.postcode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 lg:col-span-1 lg:pt-7">
              <Button
                type="submit"
                disabled={isLoading || isFetching}
                className="w-full h-11 bg-[#19CA32] hover:bg-[#16b82e] text-white font-medium text-sm xl:text-base rounded-sm transition-all duration-200 hover:shadow-lg cursor-pointer disabled:bg-[#19CA32]/70 disabled:cursor-not-allowed"
              >
                {isLoading || isFetching ? (
                  <>
                    <p className="lg:block hidden">Searching...</p>
                    <Loader className="w-4 h-4 animate-spin text-white" />
                  </>
                ) : (
                  <>
                    <span className={showResults ? "hidden lg:block" : ""}>
                      Find Garage
                    </span>{" "}
                    <Search className="size-4 text-white" />
                  </>
                )}
              </Button>
              <div className="min-h-4"></div>
            </div>
          </div>

          {!showResults && (
            <p className="flex items-center justify-center lg:justify-start gap-2 text-sm sm:text-base text-gray-700">
              <Check className="h-5 w-5 shrink-0 text-[#19CA32]" />
              <span>No upfront payment - pay at the garage</span>
            </p>
          )}

          {/* Vehicle Info Card */}
          {vehicle && (
            <div
              className={cx(
                "mx-auto w-full max-w-155 rounded-md transition-all duration-200",
                isVehicleDetailsExpanded
                  ? "bg-[#f4f8f5] border border-[#dce9df]"
                  : "bg-transparent border border-transparent hover:bg-[#f4f8f5] hover:border-[#dce9df]",
              )}
            >
              <button
                type="button"
                onClick={() => setIsVehicleDetailsExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Image
                    src={getBrandLogo(vehicle.make)}
                    alt={`${vehicle.make} logo`}
                    width={34}
                    height={34}
                    className="rounded-full border border-[#dce9df] bg-white p-1 object-contain"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#202020]">
                      {vehicle.make || "Vehicle"}
                    </p>
                    <p className="truncate text-xs text-[#5d5d5d]">
                      {vehicle.registration_number}
                      {shouldShowMotExpiry && vehicle.mot_expiry_date && (
                        <>
                          <span className="mx-1 text-[#b8b8b8]">•</span>
                          MOT: {formatMotExpiryDate(vehicle.mot_expiry_date)}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={cx(
                    "h-4 w-4 text-[#1c1c1c] transition-transform duration-200",
                    isVehicleDetailsExpanded && "rotate-180",
                  )}
                />
              </button>

              <div
                className={cx(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isVehicleDetailsExpanded
                    ? "max-h-70 opacity-100 border-t border-[#e7ece8] px-3 py-2.5"
                    : "max-h-0 opacity-0 px-3 py-0",
                )}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div className="rounded-md bg-white px-2.5 py-2">
                    <p className="text-[#7a7a7a]">Model</p>
                    <p className="mt-0.5 font-medium text-[#202020]">
                      {vehicle.model || "Unknown"}
                    </p>
                  </div>
                  <div className="rounded-md bg-white px-2.5 py-2">
                    <p className="text-[#7a7a7a]">Color</p>
                    <p className="mt-0.5 font-medium text-[#202020]">
                      {vehicle.color || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-md bg-white px-2.5 py-2 col-span-2 sm:col-span-1">
                    <p className="text-[#7a7a7a]">Fuel</p>
                    <p className="mt-0.5 font-medium text-[#202020]">
                      {vehicle.fuel_type || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Image */}
        <div
          className={`absolute bottom-0 right-1/2 translate-x-1/2 md:right-0 md:translate-x-0 z-0 mt-4 flex justify-center md:justify-end lg:absolute lg:bottom-0 lg:right-8 lg:mt-0 w-[60%] md:w-[50%] lg:w-[60%] xl:w-[40%] ${showResults ? "hidden" : "block"}`}
        >
          <Image
            src={imgMot}
            alt="MOT garage illustration"
            className="h-auto w-full object-contain"
            priority
          />
        </div>
      </div>
    </form>
  );
};
