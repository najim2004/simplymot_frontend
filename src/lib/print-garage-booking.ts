import type { Booking } from "@/features/garage";
import { jsPDF } from "jspdf";

function formatBookingDate(orderDate: string) {
  const d = new Date(orderDate);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

function formatBookingTime(orderDate: string) {
  return new Date(orderDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Generates a PDF and opens it in a new tab. */
export function printGarageBookingDetails(booking: Booking): boolean {
  const amount = `£${parseFloat(booking.total_amount || "0").toFixed(2)}`;
  const services = booking.additional_services?.trim() || "None";

  const rows: [string, string][] = [
    ["Customer", booking.driver?.name || "N/A"],
    ["Email", booking.driver?.email || "N/A"],
    ["Contact", booking.driver?.phone_number || "N/A"],
    ["Vehicle", booking.vehicle?.registration_number || "N/A"],
    ["Date", formatBookingDate(booking.order_date)],
    ["Time", formatBookingTime(booking.order_date)],
    ["Amount", amount],
  ];

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;

    let y = 18;

    // Header card
    doc.setFillColor(22, 163, 74);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Booking Details", margin + 6, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Booking ID: ${booking.id}`, margin + 6, y + 14);
    y += 28;

    // Details section
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Booking Information", margin, y);
    y += 4;

    rows.forEach(([key, value]) => {
      const rowHeight = 9;
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, margin + contentWidth, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(10.5);
      doc.text(key, margin + 1, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 24, 39);
      const valueWidth = doc.getTextWidth(value);
      doc.text(value, margin + contentWidth - valueWidth - 1, y);
      y += rowHeight - 3;
    });

    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, margin + contentWidth, y);
    y += 10;

    // Additional services section
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(11);
    doc.text("Additional Services", margin, y);
    y += 4;

    const wrappedServices = doc.splitTextToSize(
      services,
      contentWidth - 10,
    ) as string[];
    const servicesHeight = Math.max(14, wrappedServices.length * 6 + 6);

    if (y + servicesHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y, contentWidth, servicesHeight, 2, 2, "FD");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(10.5);
    doc.text(wrappedServices, margin + 5, y + 8);

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const pdfTab = window.open(pdfUrl, "_blank");

    if (!pdfTab) {
      URL.revokeObjectURL(pdfUrl);
      return false;
    }

    window.setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 60_000);

    return true;
  } catch {
    return false;
  }
}
