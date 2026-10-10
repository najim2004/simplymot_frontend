"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCancelBookingMutation, type Booking } from "@/features/garage";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [cancelBooking, { isLoading }] = useCancelBookingMutation();

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.warn("Please provide a reason for cancellation");
      return;
    }

    try {
      await cancelBooking({
        booking_id: booking.id,
        reason: trimmedReason,
      }).unwrap();

      toast.success("Booking cancelled successfully");
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
          : "Failed to cancel booking";
      toast.error(errorMsg);
    }
  };

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancel Booking"
      showHeader={false}
      hideClose={true}
      className="max-w-lg flex flex-col"
      contentClassName="p-0 flex flex-col min-h-0 overflow-hidden"
    >
      <div className="bg-white rounded-lg overflow-hidden flex flex-col min-h-0">
        {/* Header matching website theme */}
        <div className="bg-linear-to-r from-[#19CA32] to-[#16b82e] text-white px-5 py-4 shadow-md shrink-0">
          <h2 className="text-lg font-semibold">Cancel Booking</h2>
          {booking?.customer?.name && (
            <p className="text-xs text-white/90 mt-0.5">
              Customer: {booking.customer.name} • Vehicle:{" "}
              {booking.vehicle?.registration_number || "N/A"}
            </p>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              Are you sure you want to cancel the booking for{" "}
              <span className="font-semibold text-gray-900">
                {booking?.customer?.name || "this customer"}
              </span>
              ? This action will release the time slot and notify the customer.
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Reason for Cancellation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide the reason for cancellation..."
              disabled={isLoading}
              className="resize-none h-24 text-sm"
              required
            />
          </div>

          {/* Action Buttons: Cancel Action on left, Keep Booking on right */}
          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
            <Button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md disabled:bg-gray-400 cursor-pointer"
            >
              {isLoading ? "Cancelling..." : "Cancel Booking"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="h-11 font-semibold rounded-lg cursor-pointer"
            >
              Keep Booking
            </Button>
          </div>
        </form>
      </div>
    </CustomReusableModal>
  );
}
