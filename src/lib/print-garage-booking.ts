import type { Booking } from "@/features/booking";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

/**
 * Generates an A4 standard printer-ready service receipt slip matching the authentic receipt layout:
 * - Wide layout (160mm content width on A4 page)
 * - Monospace Courier typography with receipt dividers (=== and ---)
 * - Left-aligned bold labels and right-aligned bold values
 * - NO box around vehicle registration number
 * - NO box around total cost
 * - Complete booking placed date/time, appointment date, and time slot range
 * - Includes additional services (if present)
 * - Clean handwritten manual payment section with checkboxes, signature line, and dashed mechanic notes lines
 */
export function printGarageBookingDetails(
  booking: Booking,
  targetWindow?: Window | null,
): boolean {
  try {
    const bookingRef =
      booking.booking_number || booking.id.slice(0, 8).toUpperCase();

    // Helper to safely parse dates from string, Date, or timestamp
    const toValidDate = (val?: string | Date | number | null): Date | null => {
      if (!val) return null;
      try {
        const d = typeof val === "string" || typeof val === "number" ? new Date(val) : val;
        return isNaN(d.getTime()) ? null : d;
      } catch {
        return null;
      }
    };

    const bookedDate =
      toValidDate(booking.created_at) || toValidDate(booking.order_date);
    const bookedOnStr = bookedDate
      ? format(bookedDate, "dd/MM/yyyy, hh:mm a")
      : "N/A";

    // 1. Resolve appointment start date/time with complete fallbacks:
    // Check slot.starts_at, slot.start_time, booking.starts_at, booking.start_time
    let apptStart =
      toValidDate(booking.slot?.starts_at) ||
      toValidDate((booking.slot as any)?.start_time) ||
      toValidDate(booking.starts_at) ||
      toValidDate((booking as any).start_time);

    // 2. Resolve appointment end date/time:
    let apptEnd =
      toValidDate(booking.slot?.ends_at) ||
      toValidDate((booking.slot as any)?.end_time) ||
      toValidDate(booking.ends_at) ||
      toValidDate((booking as any).end_time);

    // If either is missing, check booking audit logs (especially for RESCHEDULED bookings)
    if ((!apptStart || !apptEnd) && booking.logs && booking.logs.length > 0) {
      for (let i = booking.logs.length - 1; i >= 0; i--) {
        const log = booking.logs[i];
        if (!apptStart && log.details?.slot_starts_at) {
          apptStart = toValidDate(log.details.slot_starts_at);
        }
        if (!apptEnd && log.details?.slot_ends_at) {
          apptEnd = toValidDate(log.details.slot_ends_at);
        }
        if (apptStart && apptEnd) break;
      }
    }

    // Format Appointment Slot Date (strictly from booked slot)
    const apptDateStr = apptStart ? format(apptStart, "dd/MM/yyyy") : "N/A";

    // Format Slot Time Range (e.g. 09:00 AM - 10:00 AM)
    let slotTimeStr = "--:--";
    if (apptStart && apptEnd) {
      const startStr = format(apptStart, "hh:mm a");
      const endStr = format(apptEnd, "hh:mm a");
      if (startStr.toLowerCase() === endStr.toLowerCase()) {
        slotTimeStr = startStr;
      } else {
        slotTimeStr = `${startStr} - ${endStr}`;
      }
    } else if (apptStart) {
      slotTimeStr = format(apptStart, "hh:mm a");
    }

    const status = (booking.status || "BOOKED").toUpperCase();

    const customerName =
      booking.customer?.name || booking.driver?.name || "Customer";
    const customerPhone =
      booking.customer?.phone_number || booking.driver?.phone_number || "N/A";
    const customerEmail =
      booking.customer?.email || booking.driver?.email || "N/A";

    const regNumber =
      booking.vehicle?.registration_number?.toUpperCase() || "N/A";
    const makeModel =
      [booking.vehicle?.make, booking.vehicle?.model].filter(Boolean).join(" ") ||
      "N/A";
    const fuelColor =
      [booking.vehicle?.fuel_type, booking.vehicle?.color]
        .filter(Boolean)
        .join(" / ") || "N/A";

    const engineYearParts = [
      booking.vehicle?.engine_capacity
        ? `${booking.vehicle.engine_capacity} cc`
        : null,
      booking.vehicle?.year_of_manufacture
        ? `Year ${booking.vehicle.year_of_manufacture}`
        : null,
    ].filter(Boolean);
    const engineYearStr =
      engineYearParts.length > 0 ? engineYearParts.join(" · ") : "N/A";

    const motStatus = booking.vehicle?.mot_status || "Valid";
    const services = booking.additional_services?.trim() || "";

    const garageName =
      booking.garage?.garage_name?.toUpperCase() ||
      booking.garage?.name?.toUpperCase() ||
      null;

    // Standard A4 dimensions (210mm x 297mm)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const contentWidth = 160; // Wide receipt width
    const margin = (pageWidth - contentWidth) / 2; // 25mm left & right margins (centered)
    let y = 16;

    // Set font to Courier to measure exact character width for dividers
    doc.setFont("courier", "normal");
    doc.setFontSize(9.5);
    const charWidth = doc.getTextWidth("=");
    const numChars = Math.floor(contentWidth / charWidth);
    const doubleDivider = "=".repeat(numChars);
    const singleDivider = "-".repeat(numChars);
    const noteDashedLine = "- ".repeat(Math.floor(contentWidth / (charWidth * 2)));

    // Helper: Draw single row with left label and right value
    const drawRow = (label: string, value: string) => {
      doc.setFont("courier", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text(label, margin, y);

      doc.setFont("courier", "bold");
      doc.text(value, margin + contentWidth, y, { align: "right" });
      y += 5.5;
    };

    // --- RECEIPT HEADER ---
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    const titleText = garageName ? `*** ${garageName} ***` : "*** SIMPLY MOT ***";
    doc.text(titleText, pageWidth / 2, y, { align: "center" });
    y += 5.5;

    doc.setFont("courier", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(50, 50, 50);
    const subTitle = booking.garage?.vts_number
      ? `GARAGE SERVICE SLIP (VTS: ${booking.garage.vts_number})`
      : "GARAGE SERVICE SLIP";
    doc.text(subTitle, pageWidth / 2, y, { align: "center" });
    y += 5;

    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Printed: ${format(new Date(), "dd/MM/yyyy, HH:mm:ss")}`,
      pageWidth / 2,
      y,
      { align: "center" },
    );
    y += 6;

    // Double Divider
    doc.setFont("courier", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(doubleDivider, margin, y);
    y += 6;

    // --- 1. BOOKING DETAILS ---
    drawRow("BOOKING REF:", bookingRef);
    drawRow("BOOKED ON:", bookedOnStr);
    drawRow("SLOT DATE:", apptDateStr);
    drawRow("SLOT TIME:", slotTimeStr);
    drawRow("STATUS:", status);

    // Single Divider
    y += 1.5;
    doc.setFont("courier", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(singleDivider, margin, y);
    y += 6;

    // --- 2. VEHICLE DETAILS (NO BOX!) ---
    doc.setFont("courier", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text("VEHICLE DETAILS", margin, y);
    y += 6;

    // Clean registration row (no box!)
    drawRow("REG NO:", regNumber);
    drawRow("MAKE/MODEL:", makeModel);
    drawRow("FUEL/COLOR:", fuelColor);
    if (engineYearStr !== "N/A") {
      drawRow("ENGINE/YEAR:", engineYearStr);
    }
    drawRow("MOT STATUS:", motStatus);

    // Single Divider
    y += 1.5;
    doc.setFont("courier", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(singleDivider, margin, y);
    y += 6;

    // --- 3. CUSTOMER DETAILS ---
    doc.setFont("courier", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text("CUSTOMER DETAILS", margin, y);
    y += 6;

    drawRow("NAME:", customerName);
    drawRow("PHONE:", customerPhone);
    drawRow("EMAIL:", customerEmail);

    // --- 4. ADDITIONAL SERVICES (ALWAYS INCLUDED) ---
    y += 1.5;
    doc.setFont("courier", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(singleDivider, margin, y);
    y += 6;

    doc.setFont("courier", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text("ADDITIONAL SERVICES:", margin, y);
    y += 5.5;

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    const serviceContent = services || "N/A";
    const wrapped = doc.splitTextToSize(serviceContent, contentWidth);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 4.5 + 2;

    // Double Divider
    y += 1.5;
    doc.setFont("courier", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    doc.text(doubleDivider, margin, y);
    y += 6.5;

    // --- 5. PAYMENT DETAILS (MANUAL) - NO BOX! ---
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("PAYMENT DETAILS (MANUAL)", pageWidth / 2, y, { align: "center" });
    y += 8;

    // TOTAL COST with clean write-in underline (NO BOX!)
    doc.setFont("courier", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 20, 20);
    doc.text("TOTAL COST:   £", margin, y);
    doc.setFont("courier", "normal");
    doc.text(
      "____________________________________________________________",
      margin + 33,
      y,
    );
    y += 8.5;

    // PAYMENT METHOD checkboxes
    doc.setFont("courier", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text("PAYMENT METHOD:", margin, y);
    y += 5.5;

    doc.setFont("courier", "normal");
    doc.setFontSize(9.5);
    doc.text("[ ] CASH              [ ] CARD", margin + 4, y);
    y += 5.5;
    doc.text("[ ] BANK TRANSFER     [ ] OTHER", margin + 4, y);
    y += 7.5;

    // STATUS & PAID DATE
    doc.setFont("courier", "bold");
    doc.text("STATUS:    [ ] PAID        [ ] UNPAID", margin, y);
    doc.text("PAID DATE: ____ / ____ / 202___", margin + 85, y);
    y += 7.5;

    // GARAGE SIGN
    doc.setFont("courier", "bold");
    doc.text("GARAGE SIGN:  ", margin, y);
    doc.setFont("courier", "normal");
    doc.text(
      "________________________________________________________",
      margin + 30,
      y,
    );
    y += 8.5;

    // MECHANIC / WORK NOTES
    doc.setFont("courier", "bold");
    doc.text("MECHANIC / WORK NOTES:", margin, y);
    y += 7;

    doc.setFont("courier", "normal");
    doc.setTextColor(140, 140, 140);
    doc.text(noteDashedLine, margin, y);
    y += 6.5;
    doc.text(noteDashedLine, margin, y);
    y += 6.5;

    // Double Divider
    doc.setTextColor(60, 60, 60);
    doc.text(doubleDivider, margin, y);
    y += 6.5;

    // --- FOOTER ---
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text("THANK YOU FOR YOUR BUSINESS!", pageWidth / 2, y, {
      align: "center",
    });
    y += 5;

    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text("www.simplymot.co.uk", pageWidth / 2, y, { align: "center" });

    // Output blob & open window
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    let pdfTab = targetWindow;
    if (pdfTab && !pdfTab.closed) {
      pdfTab.location.href = pdfUrl;
    } else {
      pdfTab = window.open(pdfUrl, "_blank");
    }

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
