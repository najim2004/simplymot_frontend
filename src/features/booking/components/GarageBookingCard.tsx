"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  AlertTriangle,
  Eye,
  Printer,
  Phone,
  Mail,
  Car,
  Clock,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "../types";
import {
  formatSlotDate,
  formatSlotTimeRange,
  getBookingInitials,
  printBooking,
} from "../utils";

export interface GarageBookingCardProps {
  booking: Booking;
  onView: (booking: Booking) => void;
  onPrint?: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

export function GarageBookingCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200/70 p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex items-center gap-4">
        {/* Circular avatar skeleton with same height as garage image */}
        <Skeleton className="h-20 w-20 sm:h-22 sm:w-22 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <div className="border-t border-gray-100 my-4" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="border-t border-gray-100 my-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Skeleton className="h-11 rounded-2xl" />
        <Skeleton className="h-11 rounded-2xl" />
        <Skeleton className="h-11 rounded-2xl" />
        <Skeleton className="h-11 rounded-2xl" />
      </div>
    </div>
  );
}

export function GarageBookingCard({
  booking,
  onView,
  onPrint,
  onReschedule,
  onCancel,
}: GarageBookingCardProps) {
  const isCancelled = booking?.status?.toUpperCase() === "CANCELLED";
  const isRescheduled = booking?.status?.toUpperCase() === "RESCHEDULED";
  const isCompleted = booking?.status?.toUpperCase() === "COMPLETED";
  const bookingRef =
    booking.booking_number || `#${booking.id.slice(0, 8).toUpperCase()}`;

  return (
    <div
      className={`bg-white rounded-3xl border transition-all duration-200 p-5 sm:p-6 shadow-xs hover:shadow-md flex flex-col justify-between ${
        isCancelled
          ? "border-gray-200 bg-gray-50/40 opacity-80"
          : "border-gray-200/80 hover:border-gray-300"
      }`}
    >
      <div>
        {/* 1. Header: Reference & Status Pill */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500 font-medium text-sm sm:text-base tracking-tight">
            {bookingRef}
          </span>

          {isCancelled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              Cancelled
            </span>
          ) : isRescheduled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              Rescheduled
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Booked
            </span>
          )}
        </div>

        {/* 2. Main Identity: Customer Image (Circular with same height) + Details */}
        <div className="flex items-center gap-4 mt-4">
          {booking?.customer?.avatar ? (
            <div className="relative h-20 w-20 sm:h-22 sm:w-22 rounded-full overflow-hidden shrink-0 border border-gray-100 shadow-2xs">
              <Image
                src={booking.customer.avatar}
                alt={booking?.customer?.name || "Customer"}
                fill
                sizes="88px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-full bg-emerald-50 text-[#19CA32] font-bold text-2xl flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
              {getBookingInitials(booking?.customer?.name, "C")}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-bold text-gray-900 text-lg sm:text-xl leading-snug truncate">
              {booking?.customer?.name || "Customer"}
            </h3>

            {booking?.customer?.address && (
              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 truncate">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{booking.customer.address}</span>
              </p>
            )}

            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 flex-wrap pt-0.5">
              {booking?.customer?.phone_number && (
                <a
                  href={`tel:${booking.customer.phone_number}`}
                  className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{booking.customer.phone_number}</span>
                </a>
              )}
              {booking?.customer?.email && (
                <a
                  href={`mailto:${booking.customer.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors truncate max-w-44"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{booking.customer.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 3. Hairline Divider */}
        <div className="border-t border-gray-100 my-4" />

        {/* 4. Vehicle & Slot Section (2 Columns, matching reference image) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left Column: Vehicle */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <Car className="w-4 h-4 text-gray-400 shrink-0" />
              <span>VEHICLE</span>
            </div>
            <p className="font-bold text-gray-900 text-sm sm:text-base mt-1.5 uppercase truncate">
              {booking?.vehicle?.make || "Vehicle"} {booking?.vehicle?.model || ""}
            </p>
            <p className="text-gray-500 font-semibold text-xs sm:text-sm mt-0.5 tracking-wider uppercase font-mono truncate">
              {booking?.vehicle?.registration_number || "N/A"}
            </p>
          </div>

          {/* Right Column: Slot */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>SLOT</span>
            </div>
            <p className="font-bold text-gray-900 text-sm sm:text-base mt-1.5 truncate">
              {formatSlotDate(booking?.starts_at)}
            </p>
            <p className="text-gray-500 font-medium text-xs sm:text-sm mt-0.5 flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{formatSlotTimeRange(booking?.starts_at, booking?.ends_at)}</span>
            </p>
          </div>
        </div>

        {/* Note if any */}
        {booking?.additional_services?.trim() && (
          <div className="mt-3.5 bg-gray-50/80 rounded-xl px-3 py-2 border border-gray-100 text-xs text-gray-600">
            <span className="font-semibold text-gray-700">Note: </span>
            {booking.additional_services}
          </div>
        )}
      </div>

      {/* 5. Hairline Divider & 4 Action Buttons */}
      <div>
        <div className="border-t border-gray-100 my-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* 1. Cancel */}
          <button
            type="button"
            disabled={isCancelled}
            onClick={() => onCancel(booking)}
            className={`h-11 rounded-2xl border font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isCancelled
                ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200"
                : "bg-white text-gray-700 border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 active:scale-98"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          {/* 2. Reschedule */}
          <button
            type="button"
            disabled={isCancelled}
            onClick={() => onReschedule(booking)}
            className={`h-11 rounded-2xl border font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isCancelled
                ? "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200"
                : "bg-white text-gray-700 border-gray-200 hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50/50 active:scale-98"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Reschedule</span>
          </button>

          {/* 3. Print */}
          <button
            type="button"
            onClick={() => (onPrint ? onPrint(booking) : printBooking(booking))}
            className="h-11 rounded-2xl border font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-white text-gray-700 border-gray-200 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          {/* 4. View */}
          <button
            type="button"
            onClick={() => onView(booking)}
            className="h-11 rounded-2xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#19CA32] hover:bg-[#16b82e] text-white shadow-2xs active:scale-98"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export interface GarageBookingsCardsProps {
  bookings?: Booking[];
  isLoading: boolean;
  skeletonCount?: number;
  onView: (booking: Booking) => void;
  onPrint?: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  className?: string;
}

export function GarageBookingsCards({
  bookings,
  isLoading,
  skeletonCount = 4,
  onView,
  onPrint,
  onReschedule,
  onCancel,
  className = "",
}: GarageBookingsCardsProps) {
  if (!isLoading && (!bookings || bookings.length === 0)) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden ${className}`}>
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <GarageBookingCardSkeleton key={`skeleton-card-${index}`} />
          ))
        : bookings?.map((booking) => (
            <GarageBookingCard
              key={booking.id}
              booking={booking}
              onView={onView}
              onPrint={onPrint}
              onReschedule={onReschedule}
              onCancel={onCancel}
            />
          ))}
    </div>
  );
}
