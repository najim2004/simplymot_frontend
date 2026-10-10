"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "react-toastify";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useRescheduleBookingMutation,
  useGetGarageProfileQuery,
  useGetSlotDetailsQuery,
  type Booking,
  type SlotItem,
} from "@/features/garage";

interface RescheduleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

const formatTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

const getInitialBookingDate = (booking: Booking | null): Date => {
  if (booking?.starts_at) {
    const parsed = new Date(booking.starts_at);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (!isNaN(parsed.getTime()) && parsed >= now) {
      return parsed;
    }
  }
  return new Date();
};

export default function RescheduleBookingModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: RescheduleBookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getInitialBookingDate(booking),
  );
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [reason, setReason] = useState<string>("");
  const [openCalendar, setOpenCalendar] = useState(false);

  const { data: profileResponse } = useGetGarageProfileQuery();
  const garageId = profileResponse?.data?.id;

  const formattedDateString = useMemo(() => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [selectedDate]);

  const { data: slotsResponse, isLoading: isSlotsLoading } =
    useGetSlotDetailsQuery(
      { garageId: garageId ?? "", date: formattedDateString },
      { skip: !isOpen || !garageId || !formattedDateString },
    );

  const [rescheduleBooking, { isLoading: isRescheduling }] =
    useRescheduleBookingMutation();

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (isOpen && booking) {
      const initialDate = getInitialBookingDate(booking);
      setSelectedDate(initialDate);
      setSelectedSlot(null);
      setReason("");
      setOpenCalendar(false);
    }
  }, [isOpen, booking?.id, booking?.starts_at]);

  const slotsList: SlotItem[] = slotsResponse?.data?.slots || [];

  const handleClose = () => {
    setSelectedSlot(null);
    setReason("");
    setOpenCalendar(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    if (!selectedSlot) {
      toast.warn("Please select an available time slot");
      return;
    }

    try {
      await rescheduleBooking({
        booking_id: booking.id,
        slot_id: selectedSlot.id || undefined,
        start_time: selectedSlot.starts_at,
        end_time: selectedSlot.ends_at,
        reason: reason.trim() || undefined,
      }).unwrap();

      toast.success("Booking rescheduled successfully");
      handleClose();
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data: { message?: string } }).data === "object" &&
        (err as { data: { message?: string } }).data?.message
          ? (err as { data: { message?: string } }).data.message
          : "Failed to reschedule booking";
      toast.error(errorMsg);
    }
  };

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reschedule Booking"
      showHeader={false}
      hideClose={true}
      className="max-w-xl flex flex-col"
      contentClassName="p-0 flex flex-col min-h-0 overflow-hidden"
    >
      <div className="bg-white rounded-lg overflow-hidden flex flex-col min-h-0 max-h-[90vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-[#19CA32] to-[#16b82e] text-white px-5 py-4 shadow-md shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Reschedule Booking</h2>
            {booking?.customer?.name && (
              <p className="text-xs text-white/90 mt-0.5">
                Customer: {booking.customer.name} • Vehicle:{" "}
                {booking.vehicle?.registration_number || "N/A"}
              </p>
            )}
          </div>
          <CalendarIcon className="h-5 w-5 opacity-90" />
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-5"
        >
          {/* Select Date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Select Date <span className="text-red-500">*</span>
            </Label>
            <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full h-11 justify-between text-left bg-white border-gray-300 hover:border-[#19CA32] rounded-md cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-[#19CA32]" />
                    <span className="text-sm font-medium text-gray-900">
                      {format(selectedDate, "EEEE, dd MMMM yyyy")}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#19CA32]">
                    Change
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (d) {
                      setSelectedDate(d);
                      setSelectedSlot(null);
                      setOpenCalendar(false);
                    }
                  }}
                  disabled={(d) => d < todayStart}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Available Time Slots */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Available Time Slots <span className="text-red-500">*</span>
            </Label>
            {isSlotsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="py-3 px-2 rounded-md min-h-16 border border-gray-200 bg-gray-100/70 animate-pulse flex flex-col items-center justify-center gap-2 select-none"
                  >
                    <div className="flex items-center gap-1.5 w-full justify-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-gray-300/80 shrink-0" />
                      <div className="h-3 bg-gray-300/80 rounded-xs w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : slotsList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                {slotsList.map((slot) => {
                  const slotTime = slot.starts_at
                    ? new Date(slot.starts_at).getTime()
                    : 0;
                  const isPast = slotTime > 0 && slotTime < Date.now();
                  const isDisabled =
                    !slot.bookable ||
                    slot.status !== "AVAILABLE" ||
                    isPast ||
                    isRescheduling;
                  const isSelected =
                    selectedSlot?.starts_at === slot.starts_at;

                  return (
                    <button
                      key={slot.id || slot.starts_at}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "relative py-3 px-2 rounded-md min-h-16 border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer select-none",
                        isDisabled &&
                          "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50 shadow-none",
                        !isDisabled &&
                          isSelected &&
                          "bg-linear-to-r from-[#19CA32] to-[#16b82e] border-[#19CA32] text-white shadow-md scale-[1.02] ring-2 ring-[#19CA32]/30",
                        !isDisabled &&
                          !isSelected &&
                          "bg-white border-gray-200 text-gray-800 hover:border-[#19CA32] hover:bg-[#19CA32]/5 hover:shadow-xs",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock
                          className={cn(
                            "w-3.5 h-3.5 shrink-0",
                            isSelected
                              ? "text-white"
                              : isDisabled
                                ? "text-gray-300"
                                : "text-[#19CA32]",
                          )}
                        />
                        <span className={cn(isDisabled && "line-through")}>
                          {formatTime(slot.starts_at)} -{" "}
                          {formatTime(slot.ends_at)}
                        </span>
                      </div>
                      {isPast && (
                        <span className="text-[10px] font-medium text-gray-400 no-underline">
                          Expired
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No slots available for this date.
              </div>
            )}
          </div>

          {/* Reason / Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Reason for Rescheduling (Optional)
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer requested a different time slot..."
              className="resize-none h-20 text-sm"
            />
          </div>

          {/* Actions: Reschedule on left, Cancel on right */}
          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
            <Button
              type="submit"
              disabled={!selectedSlot || isRescheduling}
              className="h-11 bg-linear-to-r from-[#19CA32] to-[#16b82e] text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 cursor-pointer"
            >
              {isRescheduling ? "Rescheduling..." : "Reschedule Booking"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isRescheduling}
              className="h-11 font-semibold rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </CustomReusableModal>
  );
}
