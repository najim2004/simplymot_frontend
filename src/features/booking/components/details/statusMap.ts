export interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
}

export const STATUS_MAP: Record<string, StatusConfig> = {
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

export function getStatusConfig(status?: string | null): StatusConfig {
  const key = status ? status.toUpperCase() : "PENDING";
  return (
    STATUS_MAP[key] ?? {
      label: status || "Unknown",
      bgClass: "bg-gray-50",
      textClass: "text-gray-600",
      borderClass: "border-gray-200",
      dotClass: "bg-gray-400",
    }
  );
}
