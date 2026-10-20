"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Printer,
  Car,
  User,
  Mail,
  Phone,
  CheckCircle,
  FileText,
  Wrench,
  RefreshCw,
  XCircle,
  AlertCircle,
  Fuel,
  Gauge,
  Palette,
  NotebookText,
  CalendarCheck,
  ShoppingBag,
  Ban,
  CalendarX,
  CalendarClock,
  Hash,
  StickyNote,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  useGetBookingByIdQuery,
  RescheduleBookingModal,
  CancelBookingModal,
  type Booking,
  formatSlotDate,
  formatSlotTimeRange,
  getBookingInitials,
  printBooking,
} from "@/features/booking";
import { getBrandLogo } from "@/features/vehicle";

/* ─────────────────── status config ─────────────────── */
const STATUS_MAP: Record<
  string,
  {
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  BOOKED: {
    label: "Booked",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
    borderClass: "border-green-200",
    dotClass: "bg-green-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  ACCEPTED: {
    label: "Accepted",
    bgClass: "bg-teal-50",
    textClass: "text-teal-700",
    borderClass: "border-teal-200",
    dotClass: "bg-teal-500",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200",
    dotClass: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completed",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    bgClass: "bg-red-50",
    textClass: "text-red-600",
    borderClass: "border-red-200",
    dotClass: "bg-red-500",
  },
  REJECTED: {
    label: "Rejected",
    bgClass: "bg-gray-50",
    textClass: "text-gray-500",
    borderClass: "border-gray-200",
    dotClass: "bg-gray-400",
  },
  PENDING: {
    label: "Pending",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-700",
    borderClass: "border-yellow-200",
    dotClass: "bg-yellow-500",
  },
};

/* ─────────────────── page ─────────────────── */
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
  const [logoError, setLogoError] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(false);

  const handlePrint = () => {
    if (!booking) return;
    if (!printBooking(booking)) {
      toast.warn("Unable to open print dialog. Please try again.");
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
  const statusCfg = STATUS_MAP[rawStatus] ?? {
    label: rawStatus,
    bgClass: "bg-gray-50",
    textClass: "text-gray-600",
    borderClass: "border-gray-200",
    dotClass: "bg-gray-400",
  };
  const isCancelled = rawStatus === "CANCELLED";
  const startsAtDate = booking.slot?.starts_at || booking.starts_at;
  const endsAtDate = booking.slot?.ends_at || booking.ends_at;
  const createdDate = booking.created_at || booking.order_date;
  const bookingLabel = booking.booking_number
    ? `Booking ${booking.booking_number}`
    : `Booking #${booking.id.slice(0, 8).toUpperCase()}`;

  const vehicleLogo = getBrandLogo(booking.vehicle?.make);

  // Customer stats
  const totalBooked = booking.customer?.total_booked ?? 0;
  const totalCancelled = booking.customer?.total_cancelled ?? 0;
  const cancelPct =
    totalBooked > 0 ? Math.round((totalCancelled / totalBooked) * 100) : 0;
  const bookPct = 100 - cancelPct;

  /* ── timeline ── */
  const timelineEvents: Array<{
    id: string;
    title: string;
    description: string;
    timestamp?: string;
    icon: React.ReactNode;
    dotColor: string;
  }> = [];

  timelineEvents.push({
    id: "booking-created",
    title: "Booking Placed",
    description: `Confirmed for ${booking.customer?.name || "Customer"} — ${booking.vehicle?.registration_number || ""}`,
    timestamp: createdDate
      ? format(new Date(createdDate), "dd MMM yyyy, hh:mm a")
      : undefined,
    icon: <CheckCircle className="w-3 h-3" />,
    dotColor: "bg-emerald-500 text-white",
  });

  if (booking.logs && booking.logs.length > 0) {
    booking.logs.forEach((log) => {
      const act = log.action?.toUpperCase();
      if (act === "CREATE") return;
      const actor = log.actor_type === "garage" ? "Garage" : "Customer";
      const ts = format(new Date(log.created_at), "dd MMM yyyy, hh:mm a");
      if (act === "UPDATE" || act === "RESCHEDULE") {
        const newStart = log.details?.slot_starts_at
          ? format(new Date(log.details.slot_starts_at), "dd MMM yyyy, hh:mm a")
          : null;
        timelineEvents.push({
          id: log.id,
          title: "Rescheduled",
          description: newStart
            ? `Rescheduled by ${actor} to ${newStart}`
            : `Slot updated by ${actor}`,
          timestamp: ts,
          icon: <Calendar className="w-3 h-3" />,
          dotColor: "bg-blue-500 text-white",
        });
      } else if (act === "CANCELLATION" || act === "CANCEL") {
        const reason = log.details?.cancel_reason || booking.cancel_reason;
        timelineEvents.push({
          id: log.id,
          title: "Cancelled",
          description: `Cancelled by ${actor}${reason ? ` — "${reason}"` : ""}`,
          timestamp: ts,
          icon: <XCircle className="w-3 h-3" />,
          dotColor: "bg-red-500 text-white",
        });
      }
    });
  } else {
    if (rawStatus === "RESCHEDULED") {
      timelineEvents.push({
        id: "booking-rescheduled",
        title: "Rescheduled",
        description: `Updated to ${formatSlotDate(startsAtDate)} (${formatSlotTimeRange(startsAtDate, endsAtDate)})`,
        timestamp: booking.updated_at
          ? format(new Date(booking.updated_at), "dd MMM yyyy, hh:mm a")
          : undefined,
        icon: <Calendar className="w-3 h-3" />,
        dotColor: "bg-blue-500 text-white",
      });
    }
    if (isCancelled) {
      const actor =
        booking.cancelled_by?.toUpperCase() === "GARAGE"
          ? "Garage"
          : "Customer";
      timelineEvents.push({
        id: "booking-cancelled",
        title: "Cancelled",
        description: `Cancelled by ${actor}${booking.cancel_reason ? ` — "${booking.cancel_reason}"` : ""}`,
        timestamp: booking.updated_at
          ? format(new Date(booking.updated_at), "dd MMM yyyy, hh:mm a")
          : undefined,
        icon: <XCircle className="w-3 h-3" />,
        dotColor: "bg-red-500 text-white",
      });
    }
  }

  if (rawStatus === "COMPLETED") {
    timelineEvents.push({
      id: "booking-completed",
      title: "Service Completed",
      description: "MOT inspection completed successfully.",
      timestamp: booking.updated_at
        ? format(new Date(booking.updated_at), "dd MMM yyyy, hh:mm a")
        : undefined,
      icon: <CheckCircle className="w-3 h-3" />,
      dotColor: "bg-emerald-500 text-white",
    });
  }

  /* ─────────────── render ─────────────── */
  return (
    <div className="space-y-4 pb-10">
      {/* ══ HEADER ══ */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: back + title + date */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">
              {bookingLabel}
            </h1>
            {createdDate && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                Placed on{" "}
                {format(new Date(createdDate), "MMMM d, yyyy · hh:mm a")}
              </p>
            )}
          </div>
        </div>

        {/* Right: status (read-only) + action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status — read-only, button-shaped, leftmost in group */}
          <div
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-semibold select-none pointer-events-none ${statusCfg.bgClass} ${statusCfg.textClass} ${statusCfg.borderClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
            {statusCfg.label}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Print */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="cursor-pointer text-gray-600 border-gray-200 hover:bg-gray-50 h-8 px-3 text-xs gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>

          {/* Reschedule — disabled when cancelled */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => !isCancelled && setIsRescheduleOpen(true)}
            disabled={isCancelled}
            className="text-gray-600 border-gray-200 hover:bg-gray-50 h-8 px-3 text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Reschedule
          </Button>

          {/* Cancel */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCancelOpen(true)}
            disabled={isCancelled}
            className="border-red-200 text-red-500 hover:bg-red-50 h-8 px-3 text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel
          </Button>
        </div>
      </div>

      {/* ══ BODY — equal-height columns ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* ── Left (2/3) — flex column so last card fills ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* ── Appointment ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#19CA32]" />
              <h2 className="text-sm font-bold text-gray-900">Appointment</h2>
            </div>

            {/* Date tiles — just the appointment slot, no extra date confusion */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3.5 border border-gray-100">
                <div className="p-2 bg-white rounded-lg border border-gray-100 shrink-0">
                  <Calendar className="w-4 h-4 text-[#19CA32]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                    Appointment Date
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatSlotDate(startsAtDate)}
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
                    {formatSlotTimeRange(startsAtDate, endsAtDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Services only */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Additional Services
              </p>
              <div className="flex items-start gap-2.5 bg-gray-50 rounded-lg p-3.5 border border-gray-100 min-h-15">
                <NotebookText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                {booking.additional_services?.trim() ? (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {booking.additional_services}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No additional services requested.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Vehicle ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            {/* Header: logo + title (no UK plate) */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0 p-1.5">
                {vehicleLogo && !logoError ? (
                  <Image
                    src={vehicleLogo}
                    alt={booking.vehicle?.make || "Vehicle"}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full"
                    onError={() => setLogoError(true)}
                    unoptimized
                  />
                ) : (
                  <Car className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Vehicle</h2>
                {booking.vehicle?.make && booking.vehicle?.model && (
                  <p className="text-[11px] text-gray-400">
                    {booking.vehicle.make} {booking.vehicle.model}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: <Hash className="w-3.5 h-3.5" />,
                  label: "Registration",
                  value: booking.vehicle?.registration_number,
                  mono: true,
                },
                {
                  icon: <Car className="w-3.5 h-3.5" />,
                  label: "Make",
                  value: booking.vehicle?.make,
                },
                {
                  icon: <Car className="w-3.5 h-3.5" />,
                  label: "Model",
                  value: booking.vehicle?.model,
                },
                {
                  icon: <Palette className="w-3.5 h-3.5" />,
                  label: "Color",
                  value: booking.vehicle?.color,
                },
                {
                  icon: <Fuel className="w-3.5 h-3.5" />,
                  label: "Fuel",
                  value: booking.vehicle?.fuel_type,
                },
                {
                  icon: <Gauge className="w-3.5 h-3.5" />,
                  label: "Engine",
                  value: booking.vehicle?.engine_capacity
                    ? `${booking.vehicle.engine_capacity} cc`
                    : null,
                },
                booking.vehicle?.year_of_manufacture
                  ? {
                      icon: <CalendarClock className="w-3.5 h-3.5" />,
                      label: "Year",
                      value: String(booking.vehicle.year_of_manufacture),
                    }
                  : null,
                {
                  icon: <CheckCircle className="w-3.5 h-3.5" />,
                  label: "MOT Status",
                  value: booking.vehicle?.mot_status || "Valid",
                  highlight: true,
                },
                booking.vehicle?.mot_expiry_date
                  ? {
                      icon: <CalendarX className="w-3.5 h-3.5" />,
                      label: "MOT Expiry",
                      value: format(
                        new Date(booking.vehicle.mot_expiry_date),
                        "dd MMM yyyy",
                      ),
                    }
                  : null,
              ]
                .filter(Boolean)
                .map((f) => (
                  <div
                    key={f!.label}
                    className="bg-gray-50 rounded-lg border border-gray-100 px-3.5 py-3"
                  >
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                      {f!.icon}
                      <span className="text-[10px] uppercase tracking-wider">
                        {f!.label}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        (f as { highlight?: boolean })?.highlight
                          ? "text-emerald-600"
                          : "text-gray-900"
                      } ${(f as { mono?: boolean })?.mono ? "font-mono tracking-wider" : ""}`}
                    >
                      {f!.value || "N/A"}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* ── Activity — below Vehicle in left column ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex-1">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-[#19CA32]" />
              <h2 className="text-sm font-bold text-gray-900">Activity</h2>
            </div>

            <div className="relative pl-5 space-y-5 before:absolute before:left-2.25 before:top-1 before:bottom-1 before:w-px before:bg-gray-200">
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="relative flex gap-3">
                  <div
                    className={`absolute -left-5 top-0 flex items-center justify-center w-4.5 h-4.5 rounded-full shrink-0 ${evt.dotColor}`}
                  >
                    {evt.icon}
                  </div>
                  <div className="pl-1.5">
                    <p className="text-xs font-semibold text-gray-900">
                      {evt.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                      {evt.description}
                    </p>
                    {evt.timestamp && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {evt.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right (1/3) — flex column so last card fills ── */}
        <div className="flex flex-col gap-4">
          {/* ── Customer ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#19CA32]" />
              <h2 className="text-sm font-bold text-gray-900">Customer</h2>
            </div>

            {/* Avatar — centered, large, clickable */}
            <div className="flex flex-col items-center mb-4 pb-4 border-b border-gray-100">
              <button
                type="button"
                onClick={() =>
                  booking.customer?.avatar && setAvatarPreview(true)
                }
                className={`mb-3 relative shrink-0 rounded-full overflow-hidden border-[3px] border-white ring-2 ring-gray-100 shadow-sm transition-transform ${booking.customer?.avatar ? "cursor-pointer hover:scale-105 hover:ring-[#19CA32]" : "cursor-default"}`}
                style={{ width: 100, height: 100 }}
                title={
                  booking.customer?.avatar ? "Click to preview" : undefined
                }
              >
                {booking.customer?.avatar ? (
                  <Image
                    src={booking.customer.avatar}
                    alt={booking.customer.name || "Customer"}
                    fill
                    sizes="100px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-50 text-[#19CA32] font-bold text-3xl flex items-center justify-center">
                    {getBookingInitials(booking.customer?.name, "C")}
                  </div>
                )}
              </button>
              <p className="text-sm font-bold text-gray-900 text-center">
                {booking.customer?.name || "Customer"}
              </p>
              <p className="text-[11px] text-gray-400">Registered Driver</p>
            </div>

            {/* Stats: total booked & cancelled with percentage */}
            {(booking.customer?.total_booked !== undefined ||
              booking.customer?.total_cancelled !== undefined) && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5 text-center">
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-0.5">
                    {bookPct}% completion
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 leading-none mb-1">
                    {totalBooked}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Bookings
                    </span>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-center">
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-0.5">
                    {cancelPct}% cancelled
                  </p>
                  <p className="text-2xl font-bold text-red-600 leading-none mb-1">
                    {totalCancelled}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <Ban className="w-3 h-3 text-red-400" />
                    <span className="text-[10px] text-red-500 font-medium">
                      Cancelled
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact — no address */}
            <div className="space-y-0">
              {/* Email */}
              <div className="flex items-start gap-3 py-2.5 border-b border-gray-50">
                <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                    Email
                  </p>
                  {booking.customer?.email ? (
                    <a
                      href={`mailto:${booking.customer.email}`}
                      className="text-sm font-medium text-gray-800 hover:text-[#19CA32] transition-colors wrap-break-word"
                    >
                      {booking.customer.email}
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
                  {booking.customer?.phone_number ? (
                    <a
                      href={`tel:${booking.customer.phone_number}`}
                      className="text-sm font-medium text-gray-800 hover:text-[#19CA32] transition-colors"
                    >
                      {booking.customer.phone_number}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">N/A</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* ── Garage Note — flex-1 fills remaining right column height ── */}
          {/* TODO: Wire up API to save/load garage note for this booking */}
          {/* API endpoint: POST /api/bookings/:id/garage-note  body: { note: string } */}
          {/* API endpoint: GET  /api/bookings/:id  → data.garage_note */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex-1">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-[#19CA32]" />
              <h2 className="text-sm font-bold text-gray-900">Garage Note</h2>
            </div>
            <textarea
              rows={4}
              placeholder="Add a private note about this booking (visible to garage only)…"
              className="w-full text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-[#19CA32] focus:border-[#19CA32] transition-colors"
              // TODO: bind to state + call save API on blur/button
              // defaultValue={(booking as any).garage_note ?? ""}
              // onChange={(e) => setGarageNote(e.target.value)}
            />
            {/* TODO: Add save button once API is ready */}
            {/* <Button size="sm" className="mt-2 h-7 text-xs bg-[#19CA32] text-white hover:bg-[#158a26]">Save Note</Button> */}
          </div>
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
