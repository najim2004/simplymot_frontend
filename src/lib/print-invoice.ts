import { jsPDF } from "jspdf";
import { format } from "date-fns";
import type { Invoice, InvoiceDetail } from "@/features/invoice";

/**
 * Formats date safely
 */
function formatDateSafe(val?: string | null): string {
  if (!val) return "N/A";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, "dd/MM/yyyy");
  } catch {
    return "N/A";
  }
}

/**
 * Formats currency amount safely
 */
function formatAmount(val?: number | string | null, currency = "GBP"): string {
  if (val === undefined || val === null || val === "") return "£0.00";
  const num = Number(val);
  if (isNaN(num)) return "£0.00";
  const symbol = currency === "GBP" ? "£" : "$";
  return `${symbol}${num.toFixed(2)}`;
}

/**
 * Generates an A4 standard professional Invoice PDF matching SimplyMOT's branding:
 * - Emerald green header banner (#19CA32)
 * - Brand logo & tagline
 * - Invoice metadata & status badge
 * - From / To billing details
 * - Itemized billing table (Description, Qty, Rate, Total)
 * - Subtotal, VAT, Total breakdown
 * - Payment status & bank transfer information
 * - Loads directly into the target window without popup blockers
 */
export function printInvoice(
  invoice: Invoice | InvoiceDetail | any,
  targetWindow?: Window | null,
): boolean {
  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    const PRIMARY_COLOR = "#19CA32";
    const DARK_COLOR = "#111827";
    const GRAY_COLOR = "#4B5563";
    const LIGHT_GRAY = "#F9FAFB";
    const BORDER_COLOR = "#E5E7EB";

    // ─── 1. HEADER BANNER ───────────────────────────────────────────
    doc.setFillColor(PRIMARY_COLOR);
    doc.rect(0, 0, pageWidth, 42, "F");

    // Brand Logo Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("simplymot.co.uk", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(230, 255, 235);
    doc.text("The UK's Trusted MOT & Garage Services Platform", margin, 24);

    // Decorative underline
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.6);
    doc.line(margin, 28, margin + 45, 28);

    // Right side: INVOICE title & number
    const invoiceNumber =
      invoice.invoice_number || invoice.id?.slice(0, 8).toUpperCase() || "N/A";
    const issueDate = formatDateSafe(
      invoice.issued_at || invoice.created_at || invoice.issue_date,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", pageWidth - margin, 18, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`#${invoiceNumber}`, pageWidth - margin, 24, { align: "right" });
    doc.setFontSize(8.5);
    doc.setTextColor(230, 255, 235);
    doc.text(`Issue Date: ${issueDate}`, pageWidth - margin, 29, {
      align: "right",
    });

    // ─── 2. FROM & BILLED TO SECTION ─────────────────────────────────
    let currentY = 52;

    // Background card for From & Billed To
    doc.setFillColor(LIGHT_GRAY);
    doc.setDrawColor(BORDER_COLOR);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, 38, 2.5, 2.5, "FD");

    // Left: FROM (SimplyMOT)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text("FROM:", margin + 6, currentY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(DARK_COLOR);
    doc.text("SimplyMOT Ltd", margin + 6, currentY + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(GRAY_COLOR);
    doc.text("123 Garage Street, Suite 400", margin + 6, currentY + 18);
    doc.text("London, EC1A 1BB, United Kingdom", margin + 6, currentY + 23);
    doc.text("contact@simplymot.co.uk • www.simplymot.co.uk", margin + 6, currentY + 28);

    // Right: BILLED TO (Customer / Garage)
    const partyName =
      invoice.customer?.name ||
      invoice.garage?.garage_name ||
      invoice.garage_name ||
      "Valued Partner";
    const partyEmail =
      invoice.customer?.email ||
      invoice.garage?.contact_email ||
      invoice.email ||
      "N/A";
    const partyPhone =
      invoice.customer?.phone_number ||
      invoice.garage?.phone_number ||
      "";
    const partyAddress =
      invoice.customer?.address ||
      invoice.garage?.address ||
      "";

    const rightColX = pageWidth / 2 + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text("BILLED TO:", rightColX, currentY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(DARK_COLOR);
    doc.text(partyName.slice(0, 32), rightColX, currentY + 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(GRAY_COLOR);
    doc.text(partyEmail.slice(0, 36), rightColX, currentY + 18);
    if (partyAddress) {
      doc.text(partyAddress.slice(0, 36), rightColX, currentY + 23);
    } else if (partyPhone) {
      doc.text(partyPhone.slice(0, 36), rightColX, currentY + 23);
    }

    currentY += 46;

    // ─── 3. METADATA ROW: STATUS, DUE DATE, PAYMENT METHOD ───────────
    doc.setFillColor("#FFFFFF");
    doc.setDrawColor(BORDER_COLOR);
    doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, "D");

    const statusUpper = (invoice.status || "PENDING").toUpperCase();
    const isPaid = statusUpper === "PAID";
    const dueDate = invoice.due_at ? formatDateSafe(invoice.due_at) : issueDate;
    const kind = invoice.kind || "SUBSCRIPTION";

    // Item 1: Status
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(GRAY_COLOR);
    doc.text("STATUS", margin + 6, currentY + 6);

    const statusBgColor = isPaid
      ? PRIMARY_COLOR
      : statusUpper === "PENDING"
        ? "#F59E0B"
        : "#EF4444";
    doc.setFillColor(statusBgColor);
    doc.roundedRect(margin + 6, currentY + 8, 22, 5.5, 1.2, 1.2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(statusUpper, margin + 17, currentY + 12, { align: "center" });

    // Item 2: Invoice Type
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(GRAY_COLOR);
    doc.text("INVOICE TYPE", margin + 50, currentY + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(DARK_COLOR);
    doc.text(kind.toUpperCase(), margin + 50, currentY + 12);

    // Item 3: Due Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(GRAY_COLOR);
    doc.text("DUE DATE", margin + 105, currentY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(DARK_COLOR);
    doc.text(dueDate, margin + 105, currentY + 12);

    // Item 4: Currency
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(GRAY_COLOR);
    doc.text("CURRENCY", pageWidth - margin - 22, currentY + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(DARK_COLOR);
    doc.text(invoice.currency || "GBP", pageWidth - margin - 22, currentY + 12);

    currentY += 24;

    // ─── 4. INVOICE ITEMS TABLE ─────────────────────────────────────
    // Table Header
    doc.setFillColor("#1F2937");
    doc.rect(margin, currentY, contentWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("#", margin + 4, currentY + 5.5);
    doc.text("DESCRIPTION", margin + 16, currentY + 5.5);
    doc.text("QTY", margin + 105, currentY + 5.5, { align: "center" });
    doc.text("UNIT PRICE", margin + 138, currentY + 5.5, { align: "right" });
    doc.text("TOTAL", pageWidth - margin - 6, currentY + 5.5, {
      align: "right",
    });

    currentY += 8;

    // Table Rows
    const items = invoice.items && invoice.items.length > 0
      ? invoice.items
      : [
          {
            description: `${kind} Membership Plan`,
            quantity: 1,
            unit_price: Number(invoice.total_amount) || 0,
            total_price: Number(invoice.total_amount) || 0,
          },
        ];

    items.forEach((item: any, index: number) => {
      const isEven = index % 2 === 0;
      doc.setFillColor(isEven ? "#FFFFFF" : LIGHT_GRAY);
      doc.rect(margin, currentY, contentWidth, 8, "F");

      doc.setDrawColor(BORDER_COLOR);
      doc.setLineWidth(0.2);
      doc.line(margin, currentY + 8, pageWidth - margin, currentY + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(DARK_COLOR);

      doc.text(String(index + 1), margin + 4, currentY + 5.5);
      doc.text(String(item.description || "Service Item").slice(0, 48), margin + 16, currentY + 5.5);
      doc.text(String(item.quantity || 1), margin + 105, currentY + 5.5, {
        align: "center",
      });
      doc.text(
        formatAmount(item.unit_price, invoice.currency),
        margin + 138,
        currentY + 5.5,
        { align: "right" },
      );
      doc.setFont("helvetica", "bold");
      doc.text(
        formatAmount(item.total_price || item.unit_price, invoice.currency),
        pageWidth - margin - 6,
        currentY + 5.5,
        { align: "right" },
      );

      currentY += 8;
    });

    currentY += 6;

    // ─── 5. SUMMARY / TOTALS SECTION ─────────────────────────────────
    const totalsWidth = 75;
    const totalsX = pageWidth - margin - totalsWidth;

    const totalAmount = Number(invoice.total_amount) || 0;
    const dueAmount = Number(invoice.due_amount) || 0;

    // Subtotal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(GRAY_COLOR);
    doc.text("Subtotal:", totalsX, currentY + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_COLOR);
    doc.text(formatAmount(totalAmount, invoice.currency), pageWidth - margin - 6, currentY + 4, {
      align: "right",
    });

    // VAT (0.00% standard representation)
    doc.setFont("helvetica", "normal");
    doc.setTextColor(GRAY_COLOR);
    doc.text("VAT (0%):", totalsX, currentY + 10);
    doc.setTextColor(DARK_COLOR);
    doc.text("£0.00", pageWidth - margin - 6, currentY + 10, {
      align: "right",
    });

    // Divider line
    doc.setDrawColor(BORDER_COLOR);
    doc.setLineWidth(0.4);
    doc.line(totalsX, currentY + 14, pageWidth - margin, currentY + 14);

    // Total Banner
    doc.setFillColor("#E8FAF0");
    doc.roundedRect(totalsX, currentY + 17, totalsWidth, 11, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text("TOTAL DUE:", totalsX + 4, currentY + 24.5);
    doc.setFontSize(12);
    doc.text(formatAmount(totalAmount, invoice.currency), pageWidth - margin - 6, currentY + 24.5, {
      align: "right",
    });

    // If there's an outstanding balance
    if (dueAmount > 0 && !isPaid) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor("#EF4444");
      doc.text(
        `Outstanding: ${formatAmount(dueAmount, invoice.currency)}`,
        pageWidth - margin - 6,
        currentY + 34,
        { align: "right" },
      );
    }

    // ─── 6. PAYMENT INFO / BANK DETAILS (LEFT SIDE) ───────────────────
    doc.setFillColor(LIGHT_GRAY);
    doc.setDrawColor(BORDER_COLOR);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, 80, 36, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(PRIMARY_COLOR);
    doc.text("PAYMENT INFORMATION", margin + 5, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(GRAY_COLOR);
    doc.text("Payment Method:", margin + 5, currentY + 12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(DARK_COLOR);
    doc.text("Online / Stripe Card Checkout", margin + 5, currentY + 16);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(GRAY_COLOR);
    doc.text("Payment Status:", margin + 5, currentY + 22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isPaid ? PRIMARY_COLOR : "#F59E0B");
    doc.text(isPaid ? "PAID IN FULL" : "PAYMENT PENDING", margin + 5, currentY + 26);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(GRAY_COLOR);
    doc.text("Terms:", margin + 5, currentY + 32);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(DARK_COLOR);
    doc.text("Due upon receipt", margin + 20, currentY + 32);

    // ─── 7. FOOTER ──────────────────────────────────────────────────
    const footerY = pageHeight - 22;
    doc.setDrawColor(BORDER_COLOR);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(DARK_COLOR);
    doc.text("Thank you for choosing SimplyMOT!", pageWidth / 2, footerY + 6, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(GRAY_COLOR);
    doc.text(
      "This is an official computer-generated invoice from SimplyMOT. No physical signature required.",
      pageWidth / 2,
      footerY + 11,
      { align: "center" },
    );
    doc.text(
      "www.simplymot.co.uk  •  support@simplymot.co.uk  •  SimplyMOT Ltd",
      pageWidth / 2,
      footerY + 15,
      { align: "center" },
    );

    // ─── 8. OUTPUT BLOB & OPEN NEW TAB ──────────────────────────────
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
  } catch (err) {
    console.error("Failed to generate invoice PDF:", err);
    return false;
  }
}
