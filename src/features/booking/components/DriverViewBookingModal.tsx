"use client";

import React from "react";
import Image from "next/image";
import { X, Printer } from "lucide-react";
import { toast } from "react-toastify";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import type { Booking } from "../types";
import {
  formatSlotDate,
  formatSlotTimeRange,
  getBookingInitials,
  printBooking,
} from "../utils";

export interface DriverViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function DriverViewBookingModal({
  isOpen,
  onClose,
  booking,
}: DriverViewBookingModalProps) {
  if (!booking) return null;

  const isCancelled = booking.status?.toUpperCase() === "CANCELLED";

  const handlePrint = () => {
    if (!printBooking(booking)) {
      toast.warn("Unable to open print dialog. Please try again.");
    }
  };

  const garageName = booking.garage?.name || "N/A";
  const garageEmail = booking.garage?.email || "N/A";
  const garagePhone = booking.garage?.phone_number || "N/A";
  const garageAddress = booking.garage?.address || "N/A";
  const garageImage = booking.garage?.image;

  const details: [string, string][] = [
    ["Garage Name", garageName],
    ["Garage Email", garageEmail],
    ["Garage Contact", garagePhone],
    ["Garage Address", garageAddress],
    [
      "Vehicle",
      `${booking.vehicle?.make || "N/A"}${
        booking.vehicle?.model ? ` - ${booking.vehicle.model}` : ""
      }`,
    ],
    ["Registration", booking.vehicle?.registration_number || "N/A"],
    ["Date & Day", formatSlotDate(booking.starts_at)],
    ["Time Slot", formatSlotTimeRange(booking.starts_at, booking.ends_at)],
    [
      "Price / Amount",
      booking.service_price != null
        ? `£${Number(booking.service_price).toFixed(2)}`
        : booking.total_amount != null
          ? `£${Number(booking.total_amount).toFixed(2)}`
          : "N/A",
    ],
  ];

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      showHeader={false}
      hideClose={true}
      className="max-w-lg w-full mx-4"
    >
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#19CA32] to-[#16b82e] text-white p-4 flex items-center justify-between shadow-xs">
          <h2 className="text-lg font-semibold">Booking Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Garage Image & Status */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {garageImage ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200">
                  <Image
                    src={garageImage}
                    alt={garageName}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-full bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center border border-gray-200">
                  {getBookingInitials(garageName, "G")}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  {garageName}
                </h3>
                <p className="text-xs text-gray-500">ID: {booking.id}</p>
              </div>
            </div>

            {(() => {
              const status = booking.status?.toUpperCase();
              if (status === "CANCELLED") {
                return (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    Cancelled
                  </span>
                );
              }
              if (status === "RESCHEDULED") {
                return (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    Rescheduled
                  </span>
                );
              }
              return (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Booked
                </span>
              );
            })()}
          </div>

          {/* Details list */}
          <div className="space-y-2.5">
            {details.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between py-1.5 border-b border-gray-100 text-sm"
              >
                <span className="text-gray-500 text-xs font-medium">
                  {label}
                </span>
                <span className="text-gray-900 font-semibold text-right max-w-[65%] truncate">
                  {value}
                </span>
              </div>
            ))}

            {/* Additional Services */}
            <div className="pt-2">
              <span className="text-gray-500 text-xs font-medium block mb-1">
                Additional Services
              </span>
              <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-800 border border-gray-100">
                {booking.additional_services?.trim() ? (
                  booking.additional_services
                ) : (
                  <span className="text-gray-400 italic">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="gap-2 cursor-pointer border-gray-300"
            >
              <Printer className="w-4 h-4 text-gray-600" />
              <span>Print Details</span>
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-[#19CA32] hover:bg-[#158a26] text-white px-6 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </CustomReusableModal>
  );
}
