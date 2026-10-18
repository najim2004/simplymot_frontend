import React from "react";
import { format } from "date-fns";
import type { Invoice, InvoiceDetail } from "../types";
import { jsPDF } from "jspdf";

export const formatInvoiceDate = (value: string | null | undefined): string => {
  if (!value || value === "N/A") return "N/A";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "dd/MM/yyyy");
  } catch {
    return "N/A";
  }
};

export const formatInvoiceAmount = (
  val: number | string | undefined | null,
  currency = "GBP",
): string => {
  if (val === undefined || val === null || val === "") return "£0.00";
  const num = Number(val);
  if (isNaN(num)) return "£0.00";
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${num.toFixed(2)}`;
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
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
    render: (v?: string) => formatInvoiceDate(v),
  },
  {
    key: "total_amount",
    label: "Amount",
    render: (v?: number | string, row?: Invoice) =>
      formatInvoiceAmount(v ?? row?.total_amount, row?.currency),
  },
  {
    key: "status",
    label: "Status",
    render: (v?: string) => {
      const key = (v || "PENDING").toUpperCase();
      return (
        <span
          className={`capitalize px-3 py-1 rounded-md border text-xs font-semibold ${
            INVOICE_STATUS_COLORS[key] || "bg-gray-50 text-gray-600 border-gray-500"
          }`}
        >
          {(v || "pending").toLowerCase()}
        </span>
      );
    },
  },
];

/** Generates and downloads a styled PDF for the invoice */
export function generateInvoicePdf(invoice: InvoiceDetail | Invoice | any): void {
  const doc = new jsPDF();
  const primaryColor = "#19CA32";
  const textColor = "#1f2937";

  // Add header banner
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, "F");

  // Add logo text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("simplymot.co.uk", 20, 20);

  // Decorative line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(20, 25, 60, 25);

  // Invoice ID & Date
  const invoiceNumber = invoice.invoice_number || invoice.invoice_id || invoice.id;
  const issueDate = formatInvoiceDate(invoice.issued_at || invoice.issue_date || invoice.created_at);
  doc.setFontSize(11);
  doc.text(`Invoice #${invoiceNumber}`, 140, 20);
  doc.text(`Issue Date: ${issueDate}`, 140, 28);

  // Body text color
  doc.setTextColor(textColor);

  // Company info box
  doc.setFillColor(249, 250, 251);
  doc.rect(10, 50, 190, 45, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("From:", 20, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("SimplyMOT", 20, 70);
  doc.text("United Kingdom", 20, 80);

  // Status
  const statusStr = (invoice.status || invoice.invoice_status || "PENDING").toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 140, 60);
  const statusBg = statusStr === "PAID" ? "#19CA32" : "#d97706";
  doc.setFillColor(statusBg);
  doc.roundedRect(140, 65, 35, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(statusStr, 157, 73, { align: "center" });

  // Invoice details box
  doc.setTextColor(textColor);
  doc.setFillColor(249, 250, 251);
  doc.rect(10, 105, 190, 35, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Invoice Details", 20, 120);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Customer / Garage:", 20, 130);
  const partyName = invoice.customer?.name || invoice.garage?.garage_name || "Valued Partner";
  doc.text(partyName, 20, 138);

  const amountStr = formatInvoiceAmount(invoice.total_amount ?? invoice.invoice_amount, invoice.currency);
  doc.text("Total Amount:", 140, 130);
  doc.setFont("helvetica", "bold");
  doc.text(amountStr, 140, 138);

  // Save / open PDF
  doc.save(`invoice_${invoiceNumber}.pdf`);
}
