"use client";

import React from "react";
import { FileText, SearchX, AlertCircle } from "lucide-react";

interface InvoiceEmptyStateProps {
  type: "empty" | "no-results" | "error";
}

export default function InvoiceEmptyState({ type }: InvoiceEmptyStateProps) {
  if (type === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-14">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-red-600 text-base font-semibold mb-1">Error loading invoices</p>
        <p className="text-gray-500 text-sm">Please try again later</p>
      </div>
    );
  }

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-14 bg-gray-50 rounded-lg border border-gray-200">
        <SearchX className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-700 text-base font-semibold mb-1">No results found</p>
        <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 bg-gray-50 rounded-lg border border-gray-200">
      <FileText className="w-12 h-12 text-gray-300 mb-3" />
      <p className="text-gray-700 text-base font-semibold mb-1">No invoices found</p>
      <p className="text-gray-500 text-sm">Invoices will appear here once generated</p>
    </div>
  );
}
