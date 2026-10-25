"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetBookingByIdQuery,
  RescheduleBookingModal,
  CancelBookingModal,
  BookingDetailsHeader,
  BookingAppointmentCard,
  BookingVehicleCard,
  BookingTimelineCard,
  BookingGarageCard,
  BookingInspectionGuideCard,
} from "@/features/booking";

export default function DriverBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetBookingByIdQuery(bookingId, { skip: !bookingId });

  const booking = response?.data;

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#19CA32] border-t-transparent" />
        <p className="text-sm text-gray-400">Loading booking details…</p>
      </div>
    );
  }

  /* ── error ── */
  if (isError || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-lg border border-gray-200">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Booking Not Found
        </h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          We couldn&apos;t load this booking. It may have been removed or you may
          not have permission to view it.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/driver/my-bookings")}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
          <Button
            onClick={() => refetch()}
            className="bg-[#19CA32] hover:bg-[#158a26] text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const rawStatus = booking.status?.toUpperCase();
  const canModify = !["CANCELLED", "COMPLETED", "REJECTED"].includes(rawStatus);
  const startsAtDate = booking.starts_at || booking.slot?.starts_at;
  const endsAtDate = booking.ends_at || booking.slot?.ends_at;
  const createdDate = booking.created_at || booking.order_date;
  const bookingLabel = booking.booking_number
    ? `Booking ${booking.booking_number}`
    : `Booking #${booking.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-4 pb-12">
      {/* ══ HEADER ══ */}
      <BookingDetailsHeader
        bookingLabel={bookingLabel}
        createdDate={createdDate}
        datePrefix="Booked on"
        status={booking.status}
        onBack={() => router.push("/driver/my-bookings")}
        canModify={canModify}
        onReschedule={() => setIsRescheduleOpen(true)}
        onCancel={() => setIsCancelOpen(true)}
      />

      {/* ══ BODY ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Appointment */}
          <BookingAppointmentCard
            startsAt={startsAtDate}
            endsAt={endsAtDate}
            price={booking.service_price ?? booking.total_amount}
            additionalServices={booking.additional_services}
            notesTitle="Special Requests & Notes"
            emptyNotesText="No special instructions provided."
          />

          {/* Garage Details (Mobile/Tablet 1-column view, < lg: directly under appointment) */}
          <div className="block lg:hidden">
            <BookingGarageCard garage={booking.garage} />
          </div>

          {/* Vehicle */}
          <BookingVehicleCard vehicle={booking.vehicle} />

          {/* Activity Timeline */}
          <BookingTimelineCard booking={booking} actorSelfType="driver" />
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="flex flex-col gap-4">
          {/* Garage Details (Desktop 2-column view, >= lg: top of right column) */}
          <div className="hidden lg:block">
            <BookingGarageCard garage={booking.garage} />
          </div>

          {/* Inspection Day Guide */}
          <BookingInspectionGuideCard />
        </div>
      </div>

      {/* Modals */}
      {isRescheduleOpen && (
        <RescheduleBookingModal
          isOpen={isRescheduleOpen}
          booking={booking}
          onClose={() => setIsRescheduleOpen(false)}
          onSuccess={() => {
            setIsRescheduleOpen(false);
            refetch();
          }}
        />
      )}
      {isCancelOpen && (
        <CancelBookingModal
          isOpen={isCancelOpen}
          booking={booking}
          onClose={() => setIsCancelOpen(false)}
          onSuccess={() => {
            setIsCancelOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
