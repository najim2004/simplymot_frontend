"use client";

import React from "react";
import { Check, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Invoice } from "../types";
import { formatInvoiceDate, formatInvoiceAmount } from "../utils";

export interface GarageInvoiceCardProps {
  invoice: Invoice;
  onViewPdf: (invoice: Invoice) => void;
  loadingInvoiceId?: string | null;
}

function PdfIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" />
      <polyline points="14 2 14 8 20 8" />
      <text
        x="7"
        y="18"
        fontSize="6"
        fontWeight="800"
        fill="currentColor"
        stroke="none"
        letterSpacing="-0.5"
      >
        PDF
      </text>
    </svg>
  );
}

export function GarageInvoiceCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Row 1: Invoice Number & Status */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-6 w-36 sm:w-44" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="border-t border-gray-100" />

      {/* Row 2: Type & Issue Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Row 3: Total Amount & View PDF button */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export function GarageInvoiceCard({
  invoice,
  onViewPdf,
  loadingInvoiceId,
}: GarageInvoiceCardProps) {
  const statusUpper = (invoice?.status || "PENDING").toUpperCase();
  const isGenerating = loadingInvoiceId === invoice?.id;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/85 hover:border-gray-300 transition-all duration-200 p-5 sm:p-6 shadow-xs hover:shadow-sm">
      {/* 1. Row 1: INVOICE NUMBER on Left, Status Pill on Right */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            INVOICE NUMBER
          </span>
          <p className="text-base sm:text-lg font-bold text-gray-900 mt-1 tracking-tight">
            {invoice.invoice_number || "—"}
          </p>
        </div>

        {/* Status Pill matching the design */}
        {statusUpper === "PAID" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8FAF0] text-[#19CA32] border border-[#A7F3D0] shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>PAID</span>
          </span>
        ) : statusUpper === "PENDING" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-300 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING</span>
          </span>
        ) : statusUpper === "OVERDUE" ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-300 shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>OVERDUE</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 shrink-0">
            <span>{statusUpper}</span>
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* 2. Row 2: Type and Issue Date (2 Columns) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs sm:text-sm text-gray-400 font-medium block">
            Type
          </span>
          <p className="text-sm sm:text-base font-bold text-gray-800 mt-0.5 uppercase truncate">
            {invoice.kind || "SUBSCRIPTION"}
          </p>
        </div>

        <div>
          <span className="text-xs sm:text-sm text-gray-400 font-medium block">
            Issue Date
          </span>
          <p className="text-sm sm:text-base font-bold text-gray-800 mt-0.5 truncate">
            {formatInvoiceDate(invoice.issued_at || invoice.created_at)}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* 3. Row 3: TOTAL AMOUNT on Left, View PDF Button on Right */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            TOTAL AMOUNT
          </span>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
            {formatInvoiceAmount(invoice.total_amount, invoice.currency)}
          </p>
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={() => onViewPdf(invoice)}
          className="h-10 px-4 rounded-xl border border-[#A7F3D0] bg-[#E8FAF0] hover:bg-[#D5F5E3] text-[#19CA32] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer transition-colors shadow-2xs active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#19CA32]" />
              <span>Opening...</span>
            </>
          ) : (
            <>
              <PdfIcon className="w-4 h-4 text-[#19CA32]" />
              <span>View PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export interface GarageInvoicesCardsProps {
  invoices?: Invoice[];
  isLoading: boolean;
  skeletonCount?: number;
  onViewPdf: (invoice: Invoice) => void;
  loadingInvoiceId?: string | null;
  className?: string;
}

export function GarageInvoicesCards({
  invoices,
  isLoading,
  skeletonCount = 4,
  onViewPdf,
  loadingInvoiceId,
  className = "",
}: GarageInvoicesCardsProps) {
  if (!isLoading && (!invoices || invoices.length === 0)) {
    return null;
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden ${className}`}
    >
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <GarageInvoiceCardSkeleton key={`skeleton-card-${index}`} />
          ))
        : invoices?.map((invoice) => (
            <GarageInvoiceCard
              key={invoice.id}
              invoice={invoice}
              onViewPdf={onViewPdf}
              loadingInvoiceId={loadingInvoiceId}
            />
          ))}
    </div>
  );
}

// Aliases for convenience and consistency
export { GarageInvoicesCards as GarageInvoiceCards };
export { GarageInvoicesCards as InvoicesCards };
export { GarageInvoiceCard as InvoiceCard };
export default GarageInvoiceCard;
