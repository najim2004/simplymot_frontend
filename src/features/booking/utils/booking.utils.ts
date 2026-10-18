import { format } from "date-fns";
import type { Booking } from "../types";
import { printGarageBookingDetails } from "@/lib/print-garage-booking";

export function formatSlotDate(isoDate?: string | null): string {
  if (!isoDate) return "N/A";
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "EEEE, dd MMM yyyy");
  } catch {
    return "N/A";
  }
}

export function formatSlotTimeRange(
  startsAt?: string | null,
  endsAt?: string | null,
): string {
  if (!startsAt) return "--:--";
  try {
    const start = new Date(startsAt);
    if (isNaN(start.getTime())) return "--:--";
    const startTimeStr = format(start, "hh:mm a");

    if (!endsAt) return startTimeStr;

    const end = new Date(endsAt);
    if (isNaN(end.getTime())) return startTimeStr;
    const endTimeStr = format(end, "hh:mm a");

    return `${startTimeStr} - ${endTimeStr}`;
  } catch {
    return "--:--";
  }
}

export function formatSlotTime(iso?: string | null): string {
  if (!iso) return "--:--";
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "--:--";
    return format(date, "hh:mm a");
  } catch {
    return "--:--";
  }
}

export function getBookingInitials(name?: string | null, fallback = "B"): string {
  if (!name) return fallback;
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || fallback;
}

export function printBooking(booking: Booking): boolean {
  return printGarageBookingDetails(booking);
}
