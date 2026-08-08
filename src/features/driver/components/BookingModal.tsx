"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import LoadingSpinner from "@/components/reusable/LoadingSpinner";
import { cn } from "@/lib/utils";
import {
  useGetGarageSlotsQuery,
  useBookSlotMutation,
  type SlotItem,
} from "@/features/driver";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  garage: { id: string } | null;
  vehicleId?: string;
  vehicleRegistrationNumber?: string;
}

const formatTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export default function BookingModal({
  isOpen,
  onClose,
  garage,
  vehicleId,
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedSlot, setSelectedSlot] = useState<SlotItem | null>(null);
  const [additionalServices, setAdditionalServices] = useState("");
  const [openCalendar, setOpenCalendar] = useState(false);

  const formattedDateString = useMemo(() => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [selectedDate]);

  const { data: slotsResponse, isLoading: slotsLoading } =
    useGetGarageSlotsQuery(
      { id: garage?.id || "", date: formattedDateString },
      { skip: !garage?.id || !isOpen },
    );

  const slotsList: SlotItem[] = slotsResponse?.data?.slots || [];
  const [bookSlot, { isLoading: isBooking }] = useBookSlotMutation();

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date());
      setSelectedSlot(null);
      setAdditionalServices("");
    }
  }, [isOpen]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!garage?.id || !selectedSlot) {
      toast.error(
        !garage?.id ? "Garage details missing." : "Please select a slot.",
      );
      return;
    }

    try {
      const res = await bookSlot({
        garage_id: garage.id,
        additional_services: additionalServices || undefined,
        ...(selectedSlot.id
          ? { slot_id: selectedSlot.id }
          : {
              starts_at: selectedSlot.starts_at,
              ends_at: selectedSlot.ends_at,
            }),
      }).unwrap();

      if (res?.success !== false) {
        toast.success(res?.message || "MOT Booked successfully!");
        onClose();
      } else {
        toast.error(res?.message || "Failed to book slot");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      toast.error(
        errorObj?.data?.message || errorObj?.message || "Failed to book slot",
      );
    }
  };

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Your MOT"
      showHeader={false}
      hideClose={true}
      className="max-w-xl flex flex-col"
      contentClassName="p-0 flex flex-col min-h-0 overflow-hidden"
    >
      <div className="bg-white rounded-lg overflow-hidden flex flex-col min-h-0 max-h-[90vh]">
        <div className="bg-gradient-to-r from-[#19CA32] to-[#16b82e] text-white px-5 py-4 shadow-md shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Book Your MOT</h2>
          <CalendarIcon className="h-5 w-5 opacity-90" />
        </div>

        <form
          onSubmit={handleBookingSubmit}
          className="p-5 overflow-y-auto space-y-5"
        >
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

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Available Time Slots <span className="text-red-500">*</span>
            </Label>
            {slotsLoading ? (
              <div className="py-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <LoadingSpinner
                  size="md"
                  text="Loading slots..."
                  fullScreen={false}
                />
              </div>
            ) : slotsList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                {slotsList.map((slot) => {
                  const slotTime = slot.starts_at
                    ? new Date(slot.starts_at).getTime()
                    : 0;
                  const isPast = slotTime > 0 && slotTime < Date.now();
                  const isDisabled = !slot.bookable || isPast || isBooking;
                  const isSelected = selectedSlot?.starts_at === slot.starts_at;

                  return (
                    <button
                      key={slot.starts_at}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "relative py-3 px-2 rounded-md min-h-16 border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer select-none",
                        isDisabled &&
                          "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-50 shadow-none",
                        !isDisabled &&
                          isSelected &&
                          "bg-gradient-to-r from-[#19CA32] to-[#16b82e] border-[#19CA32] text-white shadow-md scale-[1.02] ring-2 ring-[#19CA32]/30",
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

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Additional Services / Notes (Optional)
            </Label>
            <Textarea
              value={additionalServices}
              onChange={(e) => setAdditionalServices(e.target.value)}
              placeholder="Any special requirements or extra services..."
              className="resize-none h-20 text-sm"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 font-semibold rounded-lg cursor-pointer"
            >
              Close
            </Button>
            <Button
              type="submit"
              disabled={!selectedSlot || isBooking}
              className="h-11 bg-gradient-to-r from-[#19CA32] to-[#16b82e] text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 cursor-pointer"
            >
              {isBooking ? "Booking..." : "Book My MOT"}
            </Button>
          </div>
        </form>
      </div>
    </CustomReusableModal>
  );
}
