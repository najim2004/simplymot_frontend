"use client";

import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Slot } from "@/features/driver";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BookingDetailsSectionProps {
  selectedDate: Date | undefined;
  date: string;
  onDateChange: (date: string) => void;
  slots: Slot[] | undefined;
  slotsLoading: boolean;
  selectedSlotId: string | null;
  onSlotSelect: (slot: Slot, e?: React.MouseEvent) => void;
  isBooking: boolean;
  formatTime: (time: string) => string;
}

export default function BookingDetailsSection({
  selectedDate,
  date,
  onDateChange,
  slots,
  slotsLoading,
  selectedSlotId,
  onSlotSelect,
  isBooking,
  formatTime,
}: BookingDetailsSectionProps) {
  const [openCalendar, setOpenCalendar] = useState(false);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (!newDate) return;
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, "0");
    const dd = String(newDate.getDate()).padStart(2, "0");
    onDateChange(`${yyyy}-${mm}-${dd}`);
    setOpenCalendar(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-100 min-w-0 overflow-hidden space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <div className="w-1 h-6 bg-[#19CA32] rounded-full"></div>
        Booking Details
      </h3>

      {/* Select Date via Popover Dropdown Calendar */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Select Date <span className="text-red-500">*</span>
        </Label>

        <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              type="button"
              className={cn(
                "w-full h-11 justify-between text-left font-normal bg-white border-gray-300 hover:bg-gray-50 hover:border-[#19CA32] focus:ring-2 focus:ring-[#19CA32]/20 focus:border-[#19CA32] rounded-xl shadow-xs transition-all cursor-pointer",
                !selectedDate && "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CalendarIcon className="h-4 w-4 text-[#19CA32] shrink-0" />
                <span className="truncate text-sm font-medium text-gray-900">
                  {selectedDate
                    ? format(selectedDate, "EEEE, dd MMMM yyyy")
                    : "Select booking date"}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#19CA32] shrink-0">
                Change
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              disabled={(d) => d < todayStart}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Available Slots */}
      {date && (
        <div className="space-y-3 pt-2 border-t border-gray-200/80">
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Available Time Slots <span className="text-red-500">*</span>
          </Label>
          {slotsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-200 min-w-0 overflow-hidden">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-lg border-2 border-gray-200 bg-gray-50 animate-pulse flex flex-col items-center justify-center gap-2 min-h-22 sm:min-h-25"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0" />
                  <div className="h-3.5 bg-gray-200 rounded-xs w-28" />
                </div>
              ))}
            </div>
          ) : slots && Array.isArray(slots) && slots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-200 min-w-0 overflow-hidden">
              {slots.map((slot) => {
                const statuses: string[] = Array.isArray(slot.status)
                  ? slot.status
                  : [];
                const isBooked = statuses.includes("BOOKED");
                const isBlocked = statuses.includes("BLOCKED");
                const isBreak = statuses.includes("BREAK");
                const isHoliday = statuses.includes("HOLIDAY");
                const isUnavailable = statuses.includes("UNAVAILABLE");

                const [hours, minutes] = slot.start_time.split(":").map(Number);
                const slotDateTime = new Date(slot.date);
                slotDateTime.setHours(hours, minutes, 0, 0);
                const isPast = slotDateTime < new Date();

                const isAvailable =
                  !isBooked &&
                  !isBlocked &&
                  !isBreak &&
                  !isHoliday &&
                  !isUnavailable &&
                  !isPast;
                const isDisabled = !isAvailable;
                const unavailableLabel = isBooked
                  ? "BOOKED"
                  : isBlocked
                    ? "BLOCKED"
                    : isBreak
                      ? "BREAK"
                      : isHoliday
                        ? "HOLIDAY"
                        : isUnavailable
                          ? "UNAVAILABLE"
                          : isPast
                            ? "PAST"
                            : null;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={(e) => {
                      if (isAvailable) {
                        onSlotSelect(slot, e);
                      }
                    }}
                    disabled={isBooking || isDisabled}
                    className={cn(
                      "group relative w-full min-w-0 px-3 sm:px-4 py-3 sm:py-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-2 sm:gap-2.5 min-h-22 sm:min-h-25",
                      isDisabled
                        ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:border-[#19CA32] hover:bg-[#19CA32]/10 hover:shadow-md sm:hover:scale-105 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:ring-offset-2",
                      selectedSlotId === slot.id && isAvailable
                        ? "border-[#19CA32] bg-[#19CA32] text-white shadow-lg ring-2 ring-[#19CA32]/30"
                        : isAvailable &&
                            "border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-[#19CA32]/5",
                      (isBooking || isDisabled) && "hover:scale-100",
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        isDisabled
                          ? "bg-gray-200"
                          : selectedSlotId === slot.id
                            ? "bg-white/25"
                            : "bg-[#19CA32]/10 group-hover:bg-[#19CA32]/20",
                      )}
                    >
                      <Clock
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isDisabled
                            ? "text-gray-400"
                            : selectedSlotId === slot.id
                              ? "text-white"
                              : "text-[#19CA32]",
                        )}
                      />
                    </div>
                    <div className="text-center">
                      {unavailableLabel ? (
                        <span className="font-semibold text-sm text-gray-600">
                          {unavailableLabel}
                        </span>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={cn(
                              "font-semibold text-sm",
                              selectedSlotId === slot.id
                                ? "text-white"
                                : "text-gray-800",
                            )}
                          >
                            {formatTime(slot.start_time)}
                          </span>
                          <span
                            className={cn(
                              "text-xs",
                              selectedSlotId === slot.id
                                ? "text-white/70"
                                : "text-gray-400",
                            )}
                          >
                            -
                          </span>
                          <span
                            className={cn(
                              "font-semibold text-sm",
                              selectedSlotId === slot.id
                                ? "text-white"
                                : "text-gray-800",
                            )}
                          >
                            {formatTime(slot.end_time)}
                          </span>
                        </div>
                      )}
                    </div>
                    {selectedSlotId === slot.id && isAvailable && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <svg
                            className="w-3 h-3 text-[#19CA32]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="font-medium text-base">
                {slots
                  ? "No slots available for this date"
                  : "Select a date to view available slots"}
              </p>
              {slots && (
                <p className="text-sm text-gray-400 mt-1">
                  Please try selecting another date from the date dropdown
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
