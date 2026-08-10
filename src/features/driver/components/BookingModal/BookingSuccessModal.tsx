"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import type { BookSlotResponse } from "@/features/driver";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingResponse: BookSlotResponse | null;
  /** Fallback: garage info from search result (if not in API response) */
  garageInfo?: {
    garage_name?: string;
    address?: string | null;
    email?: string | null;
    phone_number?: string | null;
  } | null;
  /** Fallback: selected date from booking form */
  selectedDate?: Date;
  /** Fallback: additional services text from booking form */
  additionalServices?: string;
  brandColor?: string;
  brandColorHover?: string;
}

const formatTime = (timeStr?: string | null): string => {
  if (!timeStr) return "";
  if (timeStr.includes("T") || timeStr.includes("-")) {
    try {
      return new Date(timeStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return timeStr;
    }
  }
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
};

export default function BookingSuccessModal({
  isOpen,
  onClose,
  bookingResponse,
  garageInfo,
  selectedDate,
  additionalServices,
}: BookingSuccessModalProps) {
  const data = bookingResponse?.data;

  // Resolve garage details (API response takes priority, fallback to garageInfo prop)
  const garageName = data?.garage?.garage_name || garageInfo?.garage_name;
  const garageAddress = data?.garage?.address || garageInfo?.address;
  const garagePhone = data?.garage?.phone_number || garageInfo?.phone_number;
  const garageEmail = data?.garage?.email || garageInfo?.email;

  // Resolve slot time
  const slotStart =
    data?.slot?.start_time || data?.slot?.starts_at || data?.start_time;
  const slotEnd = data?.slot?.end_time || data?.slot?.ends_at || data?.end_time;

  // Resolve date
  const bookingDateStr = data?.slot?.date || data?.date;
  const bookingDate = bookingDateStr ? new Date(bookingDateStr) : selectedDate;

  // Resolve vehicle reg
  const vehicleReg = data?.vehicle?.registration_number;

  // Resolve additional services
  const services = data?.additional_services || additionalServices;

  // Time display
  const startTimeFormatted = formatTime(slotStart);
  const endTimeFormatted = formatTime(slotEnd);
  const timeDisplay =
    startTimeFormatted && endTimeFormatted
      ? `${startTimeFormatted} - ${endTimeFormatted}`
      : null;

  // Date display
  const dateDisplay = bookingDate
    ? new Date(bookingDate).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Success"
      showHeader={false}
      hideClose={true}
      contentClassName="p-0"
      className="max-w-md sm:max-w-xl"
    >
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Success Icon & Header Message */}
        <div className="p-6 text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-[#19CA32] rounded-full flex items-center justify-center shadow-xs">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#19CA32] mb-1">
            MOT Booking is Complete!
          </h2>
          <p className="text-gray-500 text-sm">Thank you for booking with us.</p>
        </div>

        {/* Content Body: Key-Value Row Details */}
        <div className="px-6 space-y-2.5 max-h-[65vh] overflow-y-auto">
          {/* Order Reference */}
          {data?.order_id && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Order Reference</span>
              <span className="font-bold font-mono text-gray-900">
                #{data.order_id}
              </span>
            </div>
          )}

          {/* Garage Name */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium shrink-0 mr-4">
              Garage Name
            </span>
            <span className="font-semibold text-gray-900 text-right">
              {garageName || "N/A"}
            </span>
          </div>

          {/* Garage Address */}
          {garageAddress && (
            <div className="flex justify-between items-start py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium shrink-0 mr-4">
                Address
              </span>
              <span className="font-medium text-gray-800 text-right max-w-xs">
                {garageAddress}
              </span>
            </div>
          )}

          {/* Phone Number */}
          {garagePhone && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Phone Number</span>
              <a
                href={`tel:${garagePhone}`}
                className="font-medium text-[#19CA32] hover:underline"
              >
                {garagePhone}
              </a>
            </div>
          )}

          {/* Email */}
          {garageEmail && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium shrink-0 mr-4">
                Email
              </span>
              <a
                href={`mailto:${garageEmail}`}
                className="font-medium text-[#19CA32] hover:underline truncate max-w-xs text-right"
              >
                {garageEmail}
              </a>
            </div>
          )}

          {/* Vehicle Registration */}
          {vehicleReg && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">
                Vehicle Registration
              </span>
              <span className="font-bold font-mono bg-yellow-400 text-gray-900 px-2.5 py-0.5 rounded text-xs tracking-wider uppercase border border-yellow-500/30">
                {vehicleReg}
              </span>
            </div>
          )}

          {/* Booking Date */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">Booking Date</span>
            <span className="font-semibold text-gray-900">
              {dateDisplay || "N/A"}
            </span>
          </div>

          {/* Booking Time Slot */}
          <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">Time Slot</span>
            <span className="font-semibold text-gray-900">
              {timeDisplay || "N/A"}
            </span>
          </div>

          {/* Additional Notes */}
          {services && (
            <div className="flex justify-between items-start py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium shrink-0 mr-4">
                Additional Notes
              </span>
              <span className="font-medium text-gray-800 text-right italic max-w-xs">
                {services}
              </span>
            </div>
          )}

          {/* Arrival Clarification Messages */}
          <div className="space-y-1.5 text-xs text-gray-600 text-center pt-3 pb-1">
            <p className="leading-relaxed">
              Please arrive at the start of your selected time slot unless
              agreed otherwise with the garage.
            </p>
            <p className="leading-relaxed text-gray-500">
              You will receive a booking confirmation shortly.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-6 pt-3">
          <Button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold py-3 text-base rounded-lg transition-all duration-200"
          >
            Close
          </Button>
        </div>
      </div>
    </CustomReusableModal>
  );
}
