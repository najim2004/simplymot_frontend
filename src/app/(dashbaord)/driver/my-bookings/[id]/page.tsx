"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Car,
  Mail,
  Phone,
  CheckCircle,
  FileText,
  RefreshCw,
  XCircle,
  AlertCircle,
  Fuel,
  Gauge,
  Palette,
  NotebookText,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  Hash,
  MapPin,
  Building2,
  ShieldCheck,
  Info,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetBookingByIdQuery,
  RescheduleBookingModal,
  CancelBookingModal,
  formatSlotDate,
  formatSlotTimeRange,
  getBookingInitials,
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
  const [logoError, setLogoError] = useState(false);
  const [expandedEventIds, setExpandedEventIds] = useState<
    Record<string, boolean>
  >({});

  const toggleEventExpand = React.useCallback((id: string) => {
    setExpandedEventIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#19CA32] border-t-transparent" />
        <p className="text-sm text-gray-400">Loading your booking details…</p>
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

  const rawStatus = booking.status?.toUpperCase() || "BOOKED";
  const statusCfg = STATUS_MAP[rawStatus] ?? {
    label: rawStatus,
    bgClass: "bg-gray-50",
    textClass: "text-gray-600",
    borderClass: "border-gray-200",
    dotClass: "bg-gray-400",
  };
  const isCancelled = rawStatus === "CANCELLED";
  const isCompleted = rawStatus === "COMPLETED";
  const canModify = !isCancelled && !isCompleted;

  const startsAtDate = booking.starts_at || booking.slot?.starts_at;
  const endsAtDate = booking.ends_at || booking.slot?.ends_at;
  const createdDate = booking.created_at || booking.order_date;
  const bookingLabel = booking.booking_number
    ? `Booking ${booking.booking_number}`
    : `Booking #${booking.id.slice(0, 8).toUpperCase()}`;

  const vehicleLogo = getBrandLogo(booking.vehicle?.make);

  const garageName =
    booking.garage?.garage_name ||
    booking.garage?.name ||
    "Auto Service Garage";
  const garageEmail =
    booking.garage?.contact_email || booking.garage?.email || "N/A";
  const garagePhone = booking.garage?.phone_number || "N/A";
  const garageImage =
    booking.garage?.garage_image || booking.garage?.image || null;
  const garageAddress = [
    booking.garage?.address,
    booking.garage?.city,
    booking.garage?.post_code,
  ]
    .filter(Boolean)
    .join(", ");

  /* ── timeline ── */
  const timelineEvents: Array<{
    id: string;
    title: string;
    description: string;
    timestamp?: string;
    icon: React.ReactNode;
    dotColor: string;
    details?: Array<{ label: string; value: string }>;
  }> = [];

  timelineEvents.push({
    id: "booking-created",
    title: "Booking Placed",
    description: `Confirmed with ${garageName} for ${booking.vehicle?.registration_number || "vehicle"}`,
    timestamp: createdDate
      ? format(new Date(createdDate), "dd MMM yyyy, hh:mm a")
      : undefined,
    icon: <CheckCircle className="w-3 h-3" />,
    dotColor: "bg-emerald-500 text-white",
    details: [
      { label: "Booked With", value: garageName },
      {
        label: "Vehicle",
        value: `${booking.vehicle?.make || ""} ${booking.vehicle?.model || ""} (${booking.vehicle?.registration_number || ""})`,
      },
      { label: "Initial Slot Date", value: formatSlotDate(startsAtDate) },
      {
        label: "Initial Slot Time",
        value: formatSlotTimeRange(startsAtDate, endsAtDate),
      },
      ...(booking.booking_number
        ? [{ label: "Booking Reference", value: booking.booking_number }]
        : []),
    ],
  });

  if (booking.logs && booking.logs.length > 0) {
    booking.logs.forEach((log) => {
      const act = log.action?.toUpperCase();
      if (act === "CREATE") return;
      const actor = log.actor_type === "garage" ? "Garage" : "You";
      const ts = format(new Date(log.created_at), "dd MMM yyyy, hh:mm a");
      if (act === "UPDATE" || act === "RESCHEDULE") {
        const newStart = log.details?.slot_starts_at
          ? format(new Date(log.details.slot_starts_at), "dd MMM yyyy, hh:mm a")
          : null;
        const prevStart = log.details?.previous_slot_starts_at
          ? format(
              new Date(log.details.previous_slot_starts_at),
              "dd MMM yyyy, hh:mm a",
            )
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
          details: [
            {
              label: "Action By",
              value: `${actor} (${log.actor_type || "User"})`,
            },
            ...(prevStart
              ? [{ label: "Previous Slot", value: prevStart }]
              : []),
            ...(newStart ? [{ label: "New Slot", value: newStart }] : []),
            { label: "Logged At", value: ts },
          ],
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
          details: [
            {
              label: "Cancelled By",
              value: `${actor} (${log.details?.cancelled_by || log.actor_type || "N/A"})`,
            },
            {
              label: "Cancellation Reason",
              value: reason || "No reason specified",
            },
            { label: "Logged At", value: ts },
          ],
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
        details: [
          {
            label: "New Appointment Slot",
            value: `${formatSlotDate(startsAtDate)} (${formatSlotTimeRange(startsAtDate, endsAtDate)})`,
          },
          {
            label: "Updated At",
            value: booking.updated_at
              ? format(new Date(booking.updated_at), "dd MMM yyyy, hh:mm a")
              : "N/A",
          },
        ],
      });
    }
    if (isCancelled) {
      const actor =
        booking.cancelled_by?.toUpperCase() === "GARAGE" ? "Garage" : "You";
      timelineEvents.push({
        id: "booking-cancelled",
        title: "Cancelled",
        description: `Cancelled by ${actor}${booking.cancel_reason ? ` — "${booking.cancel_reason}"` : ""}`,
        timestamp: booking.updated_at
          ? format(new Date(booking.updated_at), "dd MMM yyyy, hh:mm a")
          : undefined,
        icon: <XCircle className="w-3 h-3" />,
        dotColor: "bg-red-500 text-white",
        details: [
          { label: "Cancelled By", value: actor },
          {
            label: "Cancellation Reason",
            value: booking.cancel_reason || "No reason specified",
          },
          {
            label: "Logged At",
            value: booking.updated_at
              ? format(new Date(booking.updated_at), "dd MMM yyyy, hh:mm a")
              : "N/A",
          },
        ],
      });
    }
  }

  if (rawStatus === "COMPLETED") {
    timelineEvents.push({
      id: "booking-completed",
      title: "MOT Inspection Completed",
      description: "Inspection completed successfully at the garage.",
      timestamp: booking.updated_at
        ? format(new Date(booking.updated_at), "dd MMM yyyy, hh:mm a")
        : undefined,
      icon: <CheckCircle className="w-3 h-3" />,
      dotColor: "bg-emerald-500 text-white",
      details: [
        { label: "Final Status", value: "COMPLETED" },
        {
          label: "Result",
          value: "MOT inspection completed successfully.",
        },
        {
          label: "Completed At",
          value: booking.updated_at
            ? format(new Date(booking.updated_at), "dd MMM yyyy, hh:mm a")
            : "N/A",
        },
      ],
    });
  }

  return (
    <div className="space-y-4 pb-12">
      {/* ══ HEADER ══ */}
      <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: back button + title + date */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <button
            onClick={() => router.push("/driver/my-bookings")}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
            title="Back to My Bookings"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">
              {bookingLabel}
            </h1>
            {createdDate && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                Booked on{" "}
                {format(new Date(createdDate), "MMMM d, yyyy · hh:mm a")}
              </p>
            )}
          </div>
        </div>

        {/* Right: status badge + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status badge */}
          <div
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-semibold select-none pointer-events-none ${statusCfg.bgClass} ${statusCfg.textClass} ${statusCfg.borderClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
            {statusCfg.label}
          </div>

          {/* Desktop action buttons: visible on sm+, hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-px h-5 bg-gray-200" />

            {/* Reschedule */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => canModify && setIsRescheduleOpen(true)}
              disabled={!canModify}
              className="text-gray-600 border-gray-200 hover:bg-gray-50 h-8 px-3 text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Reschedule
            </Button>

            {/* Cancel */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => canModify && setIsCancelOpen(true)}
              disabled={!canModify}
              className="border-red-200 text-red-500 hover:bg-red-50 h-8 px-3 text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </Button>
          </div>

          {/* Mobile 3-dot Action Menu: visible on mobile, hidden on sm+ */}
          <div className="sm:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center justify-center"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-md">
                {canModify && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setIsRescheduleOpen(true)}
                      className="cursor-pointer text-xs"
                    >
                      <CalendarCheck className="mr-2 h-3.5 w-3.5 text-gray-500" />
                      Reschedule
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setIsCancelOpen(true)}
                      className="cursor-pointer text-xs text-red-600 focus:text-red-600"
                    >
                      <XCircle className="mr-2 h-3.5 w-3.5 text-red-500" />
                      Cancel Booking
                    </DropdownMenuItem>
                  </>
                )}
                {!canModify && (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">
                    No actions available
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* ── Left (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* ── Appointment ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#19CA32]" />
                <h2 className="text-sm font-bold text-gray-900">Appointment</h2>
              </div>
              {booking.service_price != null ? (
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  £{Number(booking.service_price).toFixed(2)}
                </span>
              ) : booking.total_amount != null ? (
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  £{Number(booking.total_amount).toFixed(2)}
                </span>
              ) : null}
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

            {/* Additional Services */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Special Requests & Notes
              </p>
              <div className="flex items-start gap-2.5 bg-gray-50 rounded-lg p-3.5 border border-gray-100 min-h-14">
                <NotebookText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                {booking.additional_services?.trim() ? (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {booking.additional_services}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No special instructions provided.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Vehicle ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
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

          {/* ── Activity / History ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#19CA32]" />
                <h2 className="text-sm font-bold text-gray-900">
                  Activity Timeline
                </h2>
              </div>
              <span className="text-[11px] text-gray-400">
                {timelineEvents.length}{" "}
                {timelineEvents.length === 1 ? "event" : "events"}
              </span>
            </div>

            <div className="relative pl-5 space-y-5 before:absolute before:left-2.25 before:top-1 before:bottom-1 before:w-px before:bg-gray-200">
              {timelineEvents.map((evt) => {
                const isExpanded = Boolean(expandedEventIds[evt.id]);
                const hasDetails = evt.details && evt.details.length > 0;

                return (
                  <div key={evt.id} className="relative flex gap-3">
                    <div
                      className={`absolute -left-5 top-0 flex items-center justify-center w-4.5 h-4.5 rounded-full shrink-0 ${evt.dotColor}`}
                    >
                      {evt.icon}
                    </div>
                    <div className="pl-1.5 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
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

                        {/* Expand / Collapse Button */}
                        {hasDetails && (
                          <button
                            type="button"
                            onClick={() => toggleEventExpand(evt.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer shrink-0 mt-0.5"
                            title={
                              isExpanded
                                ? "Collapse details"
                                : "Expand full details"
                            }
                          >
                            <span className="text-[10px]">
                              {isExpanded ? "Less" : "Details"}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? "rotate-180 text-[#19CA32]" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Expanded Details Card */}
                      {isExpanded && hasDetails && (
                        <div className="mt-2 p-2.5 bg-gray-50/90 rounded-md border border-gray-200/80 text-[11px] space-y-1.5">
                          {evt.details!.map((detail, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-0.5 border-b border-gray-200/50 last:border-0"
                            >
                              <span className="text-gray-500 font-medium">
                                {detail.label}
                              </span>
                              <span className="text-gray-900 font-semibold text-left sm:text-right wrap-break-word">
                                {detail.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right (1/3) ── */}
        <div className="flex flex-col gap-4">
          {/* ── Garage Details ── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#19CA32]" />
              <h2 className="text-sm font-bold text-gray-900">
                Testing Station
              </h2>
            </div>

            {/* Garage Logo/Image & Name */}
            <div className="flex flex-col items-center mb-4 pb-4 border-b border-gray-100">
              <div
                className="mb-3 relative shrink-0 rounded-xl overflow-hidden border-2 border-gray-100 shadow-xs"
                style={{ width: 80, height: 80 }}
              >
                {garageImage ? (
                  <Image
                    src={garageImage}
                    alt={garageName}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-50 text-[#19CA32] font-bold text-2xl flex items-center justify-center">
                    {getBookingInitials(garageName, "G")}
                  </div>
                )}
              </div>
              <p className="text-base font-bold text-gray-900 text-center">
                {garageName}
              </p>
              {booking.garage?.vts_number && (
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  VTS #{booking.garage.vts_number}
                </p>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-0">
              {/* Address */}
              {garageAddress && (
                <div className="flex items-start gap-3 py-2.5 border-b border-gray-50">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                      Address
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {garageAddress}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              <div className="flex items-start gap-3 py-2.5 border-b border-gray-50">
                <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                    Phone
                  </p>
                  {garagePhone !== "N/A" ? (
                    <a
                      href={`tel:${garagePhone}`}
                      className="text-xs font-semibold text-gray-800 hover:text-[#19CA32] transition-colors"
                    >
                      {garagePhone}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">N/A</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 py-2.5">
                <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                    Email
                  </p>
                  {garageEmail !== "N/A" ? (
                    <a
                      href={`mailto:${garageEmail}`}
                      className="text-xs font-medium text-gray-800 hover:text-[#19CA32] transition-colors break-all"
                    >
                      {garageEmail}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">N/A</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Driver Information & Instructions ── */}
          <div className="bg-linear-to-br from-emerald-50/60 to-white border border-emerald-100 rounded-lg p-5 shadow-xs flex-1">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#19CA32]" />
              <h3 className="text-xs font-bold text-gray-900">
                Inspection Day Guide
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Please arrive <strong>10–15 minutes</strong> before your
                  scheduled slot.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Payment is made <strong>in-person</strong> directly at the
                  testing station.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Ensure your vehicle boot and bonnet are accessible and
                  fuel/fluids are topped up.
                </span>
              </li>
            </ul>
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
    </div>
  );
}
