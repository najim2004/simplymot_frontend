"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle, ArrowLeft, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useGetBookingByIdQuery,
  useUpdateBookingNoteMutation,
  RescheduleBookingModal,
  CancelBookingModal,
  BookingDetailsHeader,
  BookingAppointmentCard,
  BookingVehicleCard,
  BookingTimelineCard,
  BookingCustomerCard,
  BookingGarageNoteCard,
  printBooking,
} from "@/features/booking";

export default function GarageBookingDetailsPage() {
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
  const [garageNote, setGarageNote] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(false);

  const [updateBookingNote, { isLoading: isSavingNote }] =
    useUpdateBookingNoteMutation();

  useEffect(() => {
    if (booking?.garage_note !== undefined) {
      setGarageNote(booking.garage_note || "");
    }
  }, [booking?.id, booking?.garage_note]);

  const handleSaveNote = async () => {
    if (!booking) return;
    try {
      await updateBookingNote({
        booking_id: booking.id,
        note: garageNote,
      }).unwrap();
      toast.success("Garage note saved successfully");
    } catch {
      toast.error("Failed to save garage note");
    }
  };

  const handlePrint = () => {
    if (!booking) return;
    if (!printBooking(booking)) {
      toast.warning("Unable to open print dialog. Please try again.");
    }
  };

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
          We couldn&apos;t load this booking. It may have been removed or you
          may not have permission to view it.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
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
  const isCancelled = rawStatus === "CANCELLED";
  const startsAtDate = booking.starts_at || booking.slot?.starts_at;
  const endsAtDate = booking.ends_at || booking.slot?.ends_at;
  const createdDate = booking.created_at || booking.order_date;
  const bookingLabel = booking.booking_number
    ? `Booking ${booking.booking_number}`
    : `Booking #${booking.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-4 pb-10">
      {/* ══ HEADER ══ */}
      <BookingDetailsHeader
        bookingLabel={bookingLabel}
        createdDate={createdDate}
        datePrefix="Placed on"
        status={booking.status}
        onBack={() => router.back()}
        canModify={!isCancelled}
        onPrint={handlePrint}
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
            additionalServices={booking.additional_services}
            notesTitle="Additional Services"
            emptyNotesText="No additional services requested."
          />

          {/* Customer Details (Mobile/Tablet 1-column view, < lg: directly under appointment) */}
          <div className="block lg:hidden">
            <BookingCustomerCard
              customer={booking.customer}
              onAvatarClick={() => setAvatarPreview(true)}
            />
          </div>

          {/* Vehicle */}
          <BookingVehicleCard vehicle={booking.vehicle} />

          {/* Activity Timeline */}
          <BookingTimelineCard booking={booking} actorSelfType="garage" />
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="flex flex-col gap-4">
          {/* Customer Details (Desktop 2-column view, >= lg: top of right column) */}
          <div className="hidden lg:block">
            <BookingCustomerCard
              customer={booking.customer}
              onAvatarClick={() => setAvatarPreview(true)}
            />
          </div>

          {/* Garage Note */}
          <BookingGarageNoteCard
            note={garageNote}
            onChangeNote={setGarageNote}
            onSave={handleSaveNote}
            isSaving={isSavingNote}
            hasUnsavedChanges={garageNote !== (booking.garage_note || "")}
          />
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

      {/* ── Avatar lightbox ── */}
      {avatarPreview && booking.customer?.avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setAvatarPreview(false)}
        >
          <div
            className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden border-4 border-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={booking.customer.avatar}
              alt={booking.customer.name || "Customer"}
              fill
              sizes="384px"
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            onClick={() => setAvatarPreview(false)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
