"use client";

import React from "react";
import Image from "next/image";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Printer, X } from "lucide-react";
import { toast } from "react-toastify";
import { printGarageBookingDetails } from "@/lib/print-garage-booking";
import type { Booking } from "@/features/garage";

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

function formatSlotDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "EEEE, dd MMMM yyyy");
  } catch {
    return "N/A";
  }
}

function formatSlotTimeRange(startsAt: string, endsAt: string | null): string {
  try {
    const start = new Date(startsAt);
    if (isNaN(start.getTime())) return "--:--";
    const startTimeStr = format(start, "hh:mm a");

    if (!endsAt) return startTimeStr;

    const end = new Date(endsAt);
    if (isNaN(end.getTime())) return startTimeStr;
    const endTimeStr = format(end, "hh:mm a");

    return `${startTimeStr} - ${endTimeStr}`;
  } catch {
    return "--:--";
  }
}

function getInitials(name?: string | null): string {
  if (!name) return "C";
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ViewBookingModal({
  isOpen,
  onClose,
  booking,
}: ViewBookingModalProps) {
  if (!booking) return null;

  const isCancelled = booking.status?.toUpperCase() === "CANCELLED";

  const handlePrint = () => {
    if (!printGarageBookingDetails(booking)) {
      toast.warn("Unable to open print dialog. Please try again.");
    }
  };

  const details: [string, string][] = [
    ["Customer Name", booking.customer?.name || "N/A"],
    ["Customer Email", booking.customer?.email || "N/A"],
    ["Contact Number", booking.customer?.phone_number || "N/A"],
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
          {/* Customer Avatar & Status */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {booking.customer?.avatar ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200">
                  <Image
                    src={booking.customer.avatar}
                    alt={booking.customer.name || "Customer"}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-12 w-12 shrink-0 rounded-full bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center border border-gray-200">
                  {getInitials(booking.customer?.name)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  {booking.customer?.name || "Customer"}
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
                <span className="text-gray-900 font-semibold text-xs text-right max-w-[65%]">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-800"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-transparent"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </CustomReusableModal>
  );
}
