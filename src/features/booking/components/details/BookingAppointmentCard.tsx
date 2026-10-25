"use client";

import React from "react";
import { Clock, Calendar, NotebookText } from "lucide-react";
import { formatSlotDate, formatSlotTimeRange } from "@/features/booking/utils";

export interface BookingAppointmentCardProps {
  startsAt?: string | null;
  endsAt?: string | null;
  price?: number | string | null;
  additionalServices?: string | null;
  notesTitle?: string;
  emptyNotesText?: string;
}

export function BookingAppointmentCard({
  startsAt,
  endsAt,
  price,
  additionalServices,
  notesTitle = "Special Requests & Notes",
  emptyNotesText = "No special instructions provided.",
}: BookingAppointmentCardProps) {
  const numericPrice = price != null ? Number(price) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#19CA32]" />
          <h2 className="text-sm font-bold text-gray-900">Appointment</h2>
        </div>
        {numericPrice != null && !isNaN(numericPrice) && (
          <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            £{numericPrice.toFixed(2)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3.5 border border-gray-100">
          <div className="p-2 bg-white rounded-lg border border-gray-100 shrink-0">
            <Calendar className="w-4 h-4 text-[#19CA32]" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
              Appointment Date
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {formatSlotDate(startsAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3.5 border border-gray-100">
          <div className="p-2 bg-white rounded-lg border border-gray-100 shrink-0">
            <Clock className="w-4 h-4 text-[#19CA32]" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
              Time Slot
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {formatSlotTimeRange(startsAt, endsAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Services & Special Notes */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {notesTitle}
        </p>
        <div className="flex items-start gap-2.5 bg-gray-50 rounded-lg p-3.5 border border-gray-100 min-h-14">
          <NotebookText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
          {additionalServices?.trim() ? (
            <p className="text-sm text-gray-700 leading-relaxed">
              {additionalServices}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">{emptyNotesText}</p>
          )}
        </div>
      </div>
    </div>
  );
}
