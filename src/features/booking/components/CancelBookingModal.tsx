"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCancelBookingMutation } from "../api";
import type { Booking } from "../types";

export interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  bookingId?: string;
  title?: string;
  subtitle?: string;
  message?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (reason: string) => Promise<void> | void;
  onSuccess?: () => void;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  booking,
  bookingId,
  title = "Cancel Booking",
  subtitle,
  message = "Are you sure you want to cancel this booking? This action cannot be undone.",
  placeholder = "Please explain why this booking is being cancelled...",
  confirmText = "Confirm Cancellation",
  cancelText = "Keep Booking",
  onConfirm,
  onSuccess,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [cancelBooking, { isLoading: isApiLoading }] =
    useCancelBookingMutation();
  const [isCustomLoading, setIsCustomLoading] = useState(false);

  const isLoading = isApiLoading || isCustomLoading;

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isLoading) return;
    setReason("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.warning("Please provide a reason for cancellation");
      return;
    }

    // Custom onConfirm handler if provided
    if (onConfirm) {
      try {
        setIsCustomLoading(true);
        await onConfirm(trimmedReason);
        handleClose();
        onSuccess?.();
      } catch (err: unknown) {
        const errorMsg =
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message: string }).message === "string"
            ? (err as { message: string }).message
            : "Failed to process cancellation";
        toast.error(errorMsg);
      } finally {
        setIsCustomLoading(false);
      }
      return;
    }

    // Default booking cancellation via API
    const targetBookingId = booking?.id || bookingId;
    if (!targetBookingId) return;

    try {
      await cancelBooking({
        booking_id: targetBookingId,
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

  if (!booking && !bookingId && !onConfirm) return null;

  const bookingNumber =
    booking?.booking_number ||
    (booking?.id ? `#${booking.id.slice(0, 8).toUpperCase()}` : "");
  const partnerName =
    booking?.customer?.name ||
    booking?.garage?.garage_name ||
    booking?.garage?.name;

  const resolvedSubtitle =
    subtitle ??
    (bookingNumber
      ? `Booking ${bookingNumber}${partnerName ? ` • ${partnerName}` : ""}`
      : undefined);

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      showHeader={false}
      hideClose={true}
      className="max-w-md w-full flex flex-col"
      contentClassName="p-0 flex flex-col min-h-0 overflow-hidden"
    >
      <div className="bg-white rounded-xl overflow-hidden flex flex-col min-h-0">
        {/* ── Header: Reschedule Modal style with Red/Rose Gradient (not green) ── */}
        <div className="bg-linear-to-r from-red-600 to-rose-600 text-white px-5 py-4 shadow-sm shrink-0 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight">
              {title}
            </h2>
            {resolvedSubtitle && (
              <p className="text-xs text-white/90 mt-0.5 truncate">
                {resolvedSubtitle}
              </p>
            )}
          </div>
          <AlertTriangle className="h-5 w-5 text-white/90 shrink-0" />
        </div>

        {/* ── Content Form ── */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Warning Message */}
          {message && (
            <div className="p-3 bg-red-50/80 border border-red-200/70 rounded-lg text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{message}</p>
            </div>
          )}

          {/* Reason Textarea (Styled like Reschedule Modal) */}
          <div className="space-y-1.5">
            <Label
              htmlFor="cancel-reason"
              className="text-sm font-medium text-gray-700"
            >
              Reason for Cancellation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={placeholder}
              className="resize-none h-20 text-sm rounded-lg"
              required
            />
          </div>

          {/* Actions: Confirm on left, Keep on right (rounded-lg like Reschedule Modal) */}
          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-3">
            <Button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Cancelling...</span>
                </div>
              ) : (
                confirmText
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="h-11 font-semibold rounded-lg border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {cancelText}
            </Button>
          </div>
        </form>
      </div>
    </CustomReusableModal>
  );
}
