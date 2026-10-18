"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCancelBookingMutation } from "../api";
import type { Booking } from "../types";

export interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

export function CancelBookingModal({
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

  if (!booking) return null;

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancel Booking"
      className="max-w-md w-full mx-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <p className="text-sm">
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </p>
        </div>

        <div>
          <Label
            htmlFor="cancel-reason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason for Cancellation <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why this booking is being cancelled..."
            rows={3}
            className="w-full text-sm resize-none border-gray-300"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Keep Booking
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </div>
      </form>
    </CustomReusableModal>
  );
}
