import { format } from "date-fns";
import type { Invoice } from "@/features/garage";

export const formatDate = (value: string | null | undefined): string => {
  if (!value || value === "N/A") return "N/A";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "dd/MM/yyyy");
  } catch {
    return "N/A";
  }
};

export const formatAmount = (
  val: number | string | undefined | null,
  currency = "GBP",
): string => {
  if (val === undefined || val === null || val === "") return "£0.00";
  const num = Number(val);
  if (isNaN(num)) return "£0.00";
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${num.toFixed(2)}`;
};

export const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-[#E7F4F3] text-[#19CA32] border-[#0E9384]",
  PENDING: "bg-yellow-50 text-yellow-800 border-yellow-500",
  OVERDUE: "bg-red-50 text-red-600 border-red-500",
};

export const INVOICE_COLUMNS = [
  { key: "invoice_number", label: "Invoice Number" },
  { key: "kind", label: "Type", render: (v?: string) => v || "SUBSCRIPTION" },
  {
    key: "issued_at",
    label: "Issue Date",
    render: (v?: string) => formatDate(v),
  },
  {
    key: "total_amount",
    label: "Amount",
    render: (v?: number | string, row?: Invoice) =>
      formatAmount(v ?? row?.total_amount, row?.currency),
  },
  {
    key: "status",
    label: "Status",
    render: (v?: string) => {
      const key = (v || "PENDING").toUpperCase();
      return (
        <span
          className={`capitalize px-3 py-1 rounded-md border text-xs font-semibold ${
            STATUS_COLORS[key] || "bg-gray-50 text-gray-600 border-gray-500"
          }`}
        >
          {(v || "pending").toLowerCase()}
        </span>
      );
    },
  },
];
