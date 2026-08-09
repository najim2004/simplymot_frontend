"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Line,
  Svg,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { InvoiceDetail } from "../types/invoice.types";

// ─── Colours ────────────────────────────────────────────────────────────────
const GREEN = "#19CA32";
const DARK = "#111827";
const MEDIUM = "#374151";
const MUTED = "#6B7280";
const LIGHT_BG = "#F9FAFB";
const BORDER = "#E5E7EB";
const GREEN_LIGHT = "#ECFDF5";
const AMBER_LIGHT = "#FEF3C7";
const RED_LIGHT = "#FEE2E2";

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: DARK,
    backgroundColor: "#FFFFFF",
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },

  // Header band
  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerBrand: {
    flexDirection: "column",
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  brandTagline: {
    color: "#C6F6D5",
    fontSize: 8,
    marginTop: 3,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  invoiceNumber: {
    color: "#C6F6D5",
    fontSize: 10,
    marginTop: 4,
  },
  invoiceDateRow: {
    color: "#C6F6D5",
    fontSize: 8,
    marginTop: 2,
  },

  // Body
  body: {
    paddingHorizontal: 36,
    paddingTop: 24,
  },

  // Status pill
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
  },

  // Section title
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  // Two-col grid
  grid2: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
  },
  cardLabel: {
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },
  cardValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginTop: 1,
  },
  cardValueMuted: {
    fontSize: 9,
    color: MEDIUM,
    marginTop: 1,
  },

  // Three-col invoice meta
  metaGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  metaBox: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
  },

  // Table
  table: {
    marginBottom: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: GREEN,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  tableHeadCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_BG,
  },
  tableCell: {
    fontSize: 9,
    color: MEDIUM,
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colUnit: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },

  // Totals
  totalsBox: {
    alignSelf: "flex-end",
    width: "45%",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 20,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  totalsLabel: {
    fontSize: 9,
    color: MUTED,
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: MEDIUM,
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: GREEN_LIGHT,
  },
  totalsFinalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#065F46",
  },
  totalsFinalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
  },

  // Transactions
  txRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: LIGHT_BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 10,
    paddingHorizontal: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
  },
  footerBrand: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: GREEN,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : format(dt, "dd MMM yyyy");
  } catch {
    return d;
  }
};

const fmtMoney = (val?: number | null, currency = "GBP") => {
  if (val === undefined || val === null) return "£0.00";
  const sym = currency === "GBP" ? "£" : "$";
  return `${sym}${val.toFixed(2)}`;
};

const statusStyle = (status: string) => {
  const s = status.toUpperCase();
  if (s === "PAID")
    return { ...styles.statusPill, backgroundColor: GREEN_LIGHT, color: GREEN };
  if (s === "OVERDUE")
    return { ...styles.statusPill, backgroundColor: RED_LIGHT, color: "#DC2626" };
  return {
    ...styles.statusPill,
    backgroundColor: AMBER_LIGHT,
    color: "#B45309",
  };
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function InvoicePdfDocument({ invoice }: { invoice: InvoiceDetail }) {
  const currency = invoice.currency || "GBP";
  const status = (invoice.status || "PENDING").toUpperCase();

  const garageName = invoice.garage?.garage_name || "SimplyMOT Garage";
  const garageEmail = invoice.garage?.contact_email || "—";
  const garagePhone = invoice.garage?.phone_number || "—";
  const garageAddress = [invoice.garage?.address, invoice.garage?.post_code]
    .filter(Boolean)
    .join(", ") || "United Kingdom";

  const customerName = invoice.customer?.name || "—";
  const customerEmail = invoice.customer?.email || "—";
  const customerPhone = invoice.customer?.phone_number || "—";

  const items = invoice.items || [];
  const transactions = invoice.transactions || [];

  return (
    <Document title={`Invoice-${invoice.invoice_number}`}>
      <Page size="A4" style={styles.page}>

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <Text style={styles.brandName}>simplymot</Text>
            <Text style={styles.brandTagline}>Your trusted MOT booking platform</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
            <Text style={styles.invoiceDateRow}>Issued: {fmtDate(invoice.issued_at)}</Text>
            {invoice.due_at && (
              <Text style={styles.invoiceDateRow}>Due: {fmtDate(invoice.due_at)}</Text>
            )}
          </View>
        </View>

        {/* ── BODY ───────────────────────────────────────────────────────── */}
        <View style={styles.body}>

          {/* Status */}
          <View style={styles.statusRow}>
            <Text style={statusStyle(status)}>{status}</Text>
            {invoice.paid_at && (
              <Text style={{ ...styles.cardLabel, marginLeft: 8 }}>
                Paid on {fmtDate(invoice.paid_at)}
              </Text>
            )}
          </View>

          {/* From / Bill To */}
          <View style={styles.grid2}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>From</Text>
              <Text style={styles.cardValue}>{garageName}</Text>
              <Text style={styles.cardLabel}>{garageAddress}</Text>
              <Text style={styles.cardLabel}>{garageEmail}</Text>
              <Text style={styles.cardLabel}>{garagePhone}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Billed To</Text>
              <Text style={styles.cardValue}>{customerName}</Text>
              <Text style={styles.cardLabel}>{customerEmail}</Text>
              <Text style={styles.cardLabel}>{customerPhone}</Text>
            </View>
          </View>

          {/* Invoice Meta */}
          <View style={styles.metaGrid}>
            <View style={styles.metaBox}>
              <Text style={styles.sectionTitle}>Type</Text>
              <Text style={styles.cardValue}>{invoice.kind}</Text>
            </View>
            <View style={styles.metaBox}>
              <Text style={styles.sectionTitle}>Currency</Text>
              <Text style={styles.cardValue}>{currency}</Text>
            </View>
            <View style={styles.metaBox}>
              <Text style={styles.sectionTitle}>Amount Due</Text>
              <Text style={{ ...styles.cardValue, color: invoice.due_amount === 0 ? GREEN : "#DC2626" }}>
                {fmtMoney(invoice.due_amount, currency)}
              </Text>
            </View>
          </View>

          {/* ── Items Table ──────────────────────────────────────────────── */}
          <Text style={{ ...styles.sectionTitle, marginBottom: 8 }}>Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHead}>
              <Text style={[styles.tableHeadCell, styles.colDesc]}>Description</Text>
              <Text style={[styles.tableHeadCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeadCell, styles.colUnit]}>Unit Price</Text>
              <Text style={[styles.tableHeadCell, styles.colTotal]}>Total</Text>
            </View>

            {items.length > 0 ? items.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>
                  {fmtMoney(item.unit_price, currency)}
                </Text>
                <Text style={[styles.tableCell, styles.colTotal]}>
                  {fmtMoney(item.total_price, currency)}
                </Text>
              </View>
            )) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDesc]}>
                  {invoice.kind === "SUBSCRIPTION" ? "Garage Subscription Fee" : "Service"}
                </Text>
                <Text style={[styles.tableCell, styles.colQty]}>1</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>
                  {fmtMoney(invoice.total_amount, currency)}
                </Text>
                <Text style={[styles.tableCell, styles.colTotal]}>
                  {fmtMoney(invoice.total_amount, currency)}
                </Text>
              </View>
            )}
          </View>

          {/* ── Totals ───────────────────────────────────────────────────── */}
          <View style={styles.totalsBox}>
            <View style={styles.totalsFinalRow}>
              <Text style={styles.totalsFinalLabel}>Total</Text>
              <Text style={styles.totalsFinalValue}>
                {fmtMoney(invoice.total_amount, currency)}
              </Text>
            </View>
            {invoice.due_amount !== undefined && invoice.due_amount !== null && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Amount Due</Text>
                <Text style={styles.totalsValue}>
                  {fmtMoney(invoice.due_amount, currency)}
                </Text>
              </View>
            )}
          </View>

          {/* ── Transactions ─────────────────────────────────────────────── */}
          {transactions.length > 0 && (
            <>
              <Text style={{ ...styles.sectionTitle, marginBottom: 8 }}>Transactions</Text>
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.tableHeadCell, { flex: 1 }]}>Provider</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1 }]}>Reference</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1 }]}>Status</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1, textAlign: "right" }]}>Paid</Text>
                  <Text style={[styles.tableHeadCell, { flex: 1.5, textAlign: "right" }]}>Date</Text>
                </View>
                {transactions.map((tx, idx) => (
                  <View
                    key={tx.id}
                    style={[styles.txRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                  >
                    <Text style={[styles.tableCell, { flex: 1, textTransform: "capitalize" }]}>
                      {tx.provider}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>
                      {tx.reference_number || "—"}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{tx.status}</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                      {fmtMoney(tx.paid_amount, tx.paid_currency || currency)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>
                      {fmtDate(tx.created_at)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Note */}
          <View
            style={{
              backgroundColor: "#ECFDF5",
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#A7F3D0",
              padding: 10,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 8, color: "#065F46" }}>
              This is an official, computer-generated invoice — no signature required.
            </Text>
          </View>
        </View>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>simplymot.co.uk</Text>
          <Text style={styles.footerText}>
            Invoice #{invoice.invoice_number} • Generated on {format(new Date(), "dd MMM yyyy")}
          </Text>
          <Text style={styles.footerText}>SimplyMOT Ltd. • Registered in the United Kingdom</Text>
        </View>
      </Page>
    </Document>
  );
}
