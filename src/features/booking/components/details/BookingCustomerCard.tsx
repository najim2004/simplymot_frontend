"use client";

import React from "react";
import Image from "next/image";
import { User, Mail, Phone } from "lucide-react";
import type { BookingCustomer } from "@/features/booking/types";
import { getBookingInitials } from "@/features/booking/utils";

export interface BookingCustomerCardProps {
  customer?: BookingCustomer | null;
  onAvatarClick?: () => void;
}

export function BookingCustomerCard({
  customer,
  onAvatarClick,
}: BookingCustomerCardProps) {
  const meritScore = customer?.merit_score ?? 100;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-[#19CA32]" />
        <h2 className="text-sm font-bold text-gray-900">Customer</h2>
      </div>

      {/* Avatar with dynamic Merit Score ring */}
      <div className="flex flex-col items-center mb-4 pb-4 border-b border-gray-100">
        <div className="relative w-27.5 h-27.5 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 110 110"
          >
            {/* Track ring */}
            <circle
              cx="55"
              cy="55"
              r="50"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="4"
            />
            {/* Progress ring */}
            <circle
              cx="55"
              cy="55"
              r="50"
              fill="none"
              stroke={
                meritScore >= 85
                  ? "#19CA32"
                  : meritScore >= 70
                    ? "#0d9488"
                    : meritScore >= 50
                      ? "#f59e0b"
                      : "#ef4444"
              }
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={314.16}
              strokeDashoffset={
                314.16 -
                (Math.min(100, Math.max(0, meritScore)) / 100) * 314.16
              }
              className="transition-all duration-700 ease-out"
            />
          </svg>

          <button
            type="button"
            onClick={() => customer?.avatar && onAvatarClick?.()}
            className={`relative w-23 h-23 rounded-full overflow-hidden border-2 border-white shadow-xs transition-transform ${
              customer?.avatar
                ? "cursor-pointer hover:scale-105"
                : "cursor-default"
            }`}
            title={customer?.avatar ? "Click to preview" : undefined}
          >
            {customer?.avatar ? (
              <Image
                src={customer.avatar}
                alt={customer.name || "Customer"}
                fill
                sizes="92px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-emerald-50 text-[#19CA32] font-bold text-2xl flex items-center justify-center">
                {getBookingInitials(customer?.name, "C")}
              </div>
            )}
          </button>
        </div>

        {/* Dynamic Score Value above Customer Name */}
        <p
          className={`text-[11px] font-bold mt-2 mb-0.5 tracking-wide leading-none ${
            meritScore >= 85
              ? "text-[#19CA32]"
              : meritScore >= 70
                ? "text-teal-600"
                : meritScore >= 50
                  ? "text-amber-500"
                  : "text-red-500"
          }`}
          title="Customer Merit Score"
        >
          {meritScore}/100
        </p>

        <p className="text-sm font-bold text-gray-900 text-center">
          {customer?.name || "Customer"}
        </p>
        <p className="text-[11px] text-gray-400">Registered Driver</p>
      </div>

      {/* Contact Details */}
      <div className="space-y-0">
        {/* Email */}
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-50">
          <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Email
            </p>
            {customer?.email ? (
              <a
                href={`mailto:${customer.email}`}
                className="text-sm font-medium text-gray-800 hover:text-[#19CA32] transition-colors wrap-break-word"
              >
                {customer.email}
              </a>
            ) : (
              <p className="text-sm text-gray-400">N/A</p>
            )}
          </div>
        </div>
        {/* Phone */}
        <div className="flex items-start gap-3 py-2.5">
          <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Phone
            </p>
            {customer?.phone_number ? (
              <a
                href={`tel:${customer.phone_number}`}
                className="text-sm font-medium text-gray-800 hover:text-[#19CA32] transition-colors"
              >
                {customer.phone_number}
              </a>
            ) : (
              <p className="text-sm text-gray-400">N/A</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
