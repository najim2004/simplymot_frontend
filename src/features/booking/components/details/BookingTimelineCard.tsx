"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle,
  Calendar,
  XCircle,
  ChevronDown,
} from "lucide-react";
import type { Booking } from "@/features/booking/types";
import { formatSlotDate, formatSlotTimeRange } from "@/features/booking/utils";

export interface BookingTimelineCardProps {
  booking: Booking;
  actorSelfType?: "driver" | "garage";
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp?: string;
  icon: React.ReactNode;
  dotColor: string;
  details?: Array<{ label: string; value: string }>;
}

export function BookingTimelineCard({
  booking,
  actorSelfType = "driver",
}: BookingTimelineCardProps) {
  const [expandedEventIds, setExpandedEventIds] = useState<
    Record<string, boolean>
  >({});

  const toggleEventExpand = (id: string) => {
    setExpandedEventIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];
    const rawStatus = booking.status?.toUpperCase();
    const createdDate = booking.created_at || booking.order_date;
    const startsAtDate = booking.starts_at || booking.slot?.starts_at;
    const endsAtDate = booking.ends_at || booking.slot?.ends_at;

    const garageName =
      booking.garage?.garage_name ||
      booking.garage?.name ||
      "Auto Service Garage";

    // 1. Initial Booking Placed event
    events.push({
      id: "booking-created",
      title: actorSelfType === "garage" ? "Booking Received" : "Booking Placed",
      description:
        actorSelfType === "garage"
          ? `Booking placed by ${booking.customer?.name || "Customer"} for ${booking.vehicle?.registration_number || "vehicle"}`
          : `Confirmed with ${garageName} for ${booking.vehicle?.registration_number || "vehicle"}`,
      timestamp: createdDate
        ? format(new Date(createdDate), "dd MMM yyyy, hh:mm a")
        : undefined,
      icon: <CheckCircle className="w-3 h-3" />,
      dotColor: "bg-emerald-500 text-white",
      details: [
        ...(actorSelfType === "driver"
          ? [{ label: "Booked With", value: garageName }]
          : [
              {
                label: "Customer",
                value: booking.customer?.name || "Customer",
              },
            ]),
        {
          label: "Vehicle",
          value:
            `${booking.vehicle?.make || ""} ${booking.vehicle?.model || ""} (${booking.vehicle?.registration_number || ""})`.trim(),
        },
        { label: "Slot Date", value: formatSlotDate(startsAtDate) },
        {
          label: "Slot Time",
          value: formatSlotTimeRange(startsAtDate, endsAtDate),
        },
        ...(booking.booking_number
          ? [{ label: "Booking Reference", value: booking.booking_number }]
          : []),
      ],
    });

    // 2. Booking Logs (Reschedule / Cancel)
    if (booking.logs && booking.logs.length > 0) {
      booking.logs.forEach((log) => {
        const act = log.action?.toUpperCase();
        if (act === "CREATE") return;

        const isGarageActor = log.actor_type === "garage";
        const actor =
          actorSelfType === "driver"
            ? isGarageActor
              ? "Garage"
              : "You"
            : isGarageActor
              ? "You (Garage)"
              : "Customer";

        const ts = format(new Date(log.created_at), "dd MMM yyyy, hh:mm a");

        if (act === "UPDATE" || act === "RESCHEDULE") {
          const newStart = log.details?.slot_starts_at
            ? format(
                new Date(log.details.slot_starts_at),
                "dd MMM yyyy, hh:mm a",
              )
            : null;
          const prevStart = log.details?.previous_slot_starts_at
            ? format(
                new Date(log.details.previous_slot_starts_at),
                "dd MMM yyyy, hh:mm a",
              )
            : null;

          events.push({
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
          events.push({
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
    } else if (rawStatus === "CANCELLED") {
      // Fallback if logs array is empty
      const isGarageActor = booking.cancelled_by === "garage";
      const actor =
        actorSelfType === "driver"
          ? isGarageActor
            ? "Garage"
            : "You"
          : isGarageActor
            ? "You (Garage)"
            : "Customer";

      events.push({
        id: "booking-cancelled-fallback",
        title: "Cancelled",
        description: `Booking cancelled by ${actor}`,
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

    // 3. Completed event
    if (rawStatus === "COMPLETED") {
      events.push({
        id: "booking-completed",
        title:
          actorSelfType === "garage"
            ? "Service Completed"
            : "MOT Inspection Completed",
        description:
          actorSelfType === "garage"
            ? "MOT inspection completed successfully."
            : "Inspection completed successfully at the garage.",
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

    return events;
  }, [booking, actorSelfType]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#19CA32]" />
          <h2 className="text-sm font-bold text-gray-900">Activity Timeline</h2>
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
                        isExpanded ? "Collapse details" : "Expand full details"
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

                {/* Expanded Details */}
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
  );
}
