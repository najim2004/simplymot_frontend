"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Printer,
  Phone,
  Mail,
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Hash,
  Fuel,
  Palette,
} from "lucide-react";
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

export interface GarageViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  BOOKED: {
    label: "Booked",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  COMPLETED: {
    label: "Completed",
    color: "text-gray-700",
    bg: "bg-gray-50 border-gray-200",
    dot: "bg-gray-400",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG.BOOKED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="mt-0.5 flex-shrink-0 text-gray-400">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide leading-none mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm text-gray-800 font-medium truncate ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-white">
        <h4 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

export function GarageViewBookingModal({
  isOpen,
  onClose,
  booking,
}: GarageViewBookingModalProps) {
  if (!booking) return null;

  const handlePrint = () => {
    if (!printBooking(booking)) {
      toast.warn("Unable to open print dialog. Please try again.");
    }
  };

  const status = booking.status?.toUpperCase();

  const vehicleName = [booking.vehicle?.make, booking.vehicle?.model]
    .filter(Boolean)
    .join(" ");

  const totalBooked = booking.customer?.total_booked ?? null;
  const totalCancelled = booking.customer?.total_cancelled ?? null;

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      showHeader={false}
      hideClose={true}
      className="max-w-md w-full mx-4"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-[#19CA32] to-[#0fa827] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 opacity-70" />
            <span className="text-sm font-mono font-semibold tracking-wide">
              {booking.booking_number ?? booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer Profile — social-style */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {booking.customer?.avatar ? (
                <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-[#19CA32]/30 ring-offset-2">
                  <Image
                    src={booking.customer.avatar}
                    alt={booking.customer.name || "Customer"}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#19CA32]/20 to-[#19CA32]/40 text-[#19CA32] font-bold text-lg flex items-center justify-center ring-2 ring-[#19CA32]/20 ring-offset-2">
                  {getBookingInitials(booking.customer?.name, "C")}
                </div>
              )}
            </div>

            {/* Name, status & stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {booking.customer?.name || "Customer"}
                </h3>
                <StatusBadge status={status} />
              </div>

              {/* Booking stats */}
              {(totalBooked !== null || totalCancelled !== null) && (
                <div className="flex items-center gap-3 mt-1.5">
                  {totalBooked !== null && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>
                        <span className="font-semibold text-gray-700">
                          {totalBooked}
                        </span>{" "}
                        booked
                      </span>
                    </div>
                  )}
                  {totalCancelled !== null && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span>
                        <span className="font-semibold text-gray-700">
                          {totalCancelled}
                        </span>{" "}
                        cancelled
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact */}
          <SectionCard title="Contact">
            <InfoRow
              icon={<Mail className="w-3.5 h-3.5" />}
              label="Email"
              value={booking.customer?.email || "—"}
            />
            <InfoRow
              icon={<Phone className="w-3.5 h-3.5" />}
              label="Phone"
              value={booking.customer?.phone_number || "—"}
            />
          </SectionCard>

          {/* Appointment */}
          <SectionCard title="Appointment">
            <InfoRow
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="Date"
              value={formatSlotDate(booking.starts_at)}
            />
            <InfoRow
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Time"
              value={formatSlotTimeRange(booking.starts_at, booking.ends_at)}
            />
          </SectionCard>

          {/* Vehicle */}
          <SectionCard title="Vehicle">
            <InfoRow
              icon={<Car className="w-3.5 h-3.5" />}
              label="Make & Model"
              value={vehicleName || "—"}
            />
            <InfoRow
              icon={<Hash className="w-3.5 h-3.5" />}
              label="Registration"
              value={
                booking.vehicle?.registration_number ? (
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-800 tracking-widest uppercase">
                    {booking.vehicle.registration_number}
                  </span>
                ) : (
                  "—"
                )
              }
              mono={false}
            />
            {booking.vehicle?.color && (
              <InfoRow
                icon={<Palette className="w-3.5 h-3.5" />}
                label="Colour"
                value={booking.vehicle.color}
              />
            )}
            {booking.vehicle?.fuel_type && (
              <InfoRow
                icon={<Fuel className="w-3.5 h-3.5" />}
                label="Fuel Type"
                value={booking.vehicle.fuel_type}
              />
            )}
            {booking.vehicle?.year_of_manufacture && (
              <InfoRow
                icon={<Calendar className="w-3.5 h-3.5" />}
                label="Year"
                value={String(booking.vehicle.year_of_manufacture)}
              />
            )}
            {booking.vehicle?.mot_status && (
              <InfoRow
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                label="MOT Status"
                value={
                  <span
                    className={`font-semibold ${
                      booking.vehicle.mot_status?.toLowerCase() === "valid" ||
                      booking.vehicle.mot_status?.toLowerCase() === "pass"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {booking.vehicle.mot_status}
                  </span>
                }
              />
            )}
          </SectionCard>

          {/* Additional Services */}
          {booking.additional_services?.trim() && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
              <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-1">
                Additional Services
              </p>
              <p className="text-sm text-gray-700">{booking.additional_services}</p>
            </div>
          )}

          {/* Cancel reason */}
          {status === "CANCELLED" && booking.cancel_reason && (
            <div className="rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
              <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-1">
                Cancellation Reason
              </p>
              <p className="text-sm text-gray-700">{booking.cancel_reason}</p>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="gap-2 cursor-pointer border-gray-200 text-gray-600 hover:text-gray-900 h-9"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-sm">Print</span>
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="bg-[#19CA32] hover:bg-[#158a26] text-white px-5 cursor-pointer h-9 text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </CustomReusableModal>
  );
}

// Alias for convenience and backwards-compatibility
export { GarageViewBookingModal as ViewBookingModal };
