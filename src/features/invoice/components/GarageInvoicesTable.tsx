"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Invoice } from "../types";
import {
  formatInvoiceDate,
  formatInvoiceAmount,
} from "../utils";
import InvoiceViewPdfButton from "./InvoiceViewPdfButton";

export interface GarageInvoicesTableProps {
  invoices?: Invoice[];
  isLoading: boolean;
  isError: boolean;
  skeletonRows?: number;
  onRetry: () => void;
  onViewPdf: (invoice: Invoice) => void;
  loadingInvoiceId?: string | null;
  searchTerm?: string;
}

export function GarageInvoicesTable({
  invoices,
  isLoading,
  isError,
  skeletonRows = 10,
  onRetry,
  onViewPdf,
  loadingInvoiceId,
  searchTerm,
}: GarageInvoicesTableProps) {
  // Error state
  if (isError && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            Error loading invoices. Please try again.
          </p>
          <Button onClick={onRetry} className="mt-4 cursor-pointer">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && !isError && (!invoices || invoices.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 text-lg">No invoices found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Invoices will appear here once generated"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block overflow-x-auto rounded-t-lg border border-gray-300 bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice Number
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Issue Date
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, index) => (
                <TableRow key={`skeleton-row-${index}`}>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Skeleton className="h-8 w-20 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : invoices?.map((row) => {
                const statusUpper = (row.status || "PENDING").toUpperCase();
                const statusColor =
                  statusUpper === "PAID"
                    ? "text-[#19CA32]"
                    : statusUpper === "PENDING"
                      ? "text-amber-500"
                      : statusUpper === "OVERDUE" || statusUpper === "CANCELLED"
                        ? "text-red-500"
                        : "text-gray-700";

                return (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* 1. Invoice Number */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 text-sm">
                        {row.invoice_number || "N/A"}
                      </span>
                    </TableCell>

                    {/* 2. Type */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">
                        {row.kind || "SUBSCRIPTION"}
                      </span>
                    </TableCell>

                    {/* 3. Issue Date */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatInvoiceDate(row.issued_at || row.created_at)}
                      </span>
                    </TableCell>

                    {/* 4. Amount */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatInvoiceAmount(row.total_amount, row.currency)}
                      </span>
                    </TableCell>

                    {/* 5. Status: Plain text, all uppercase, green for PAID */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold text-sm ${statusColor}`}>
                        {statusUpper}
                      </span>
                    </TableCell>

                    {/* 6. Action (View PDF) */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end">
                        <InvoiceViewPdfButton
                          row={row}
                          isGenerating={loadingInvoiceId === row.id}
                          onClick={onViewPdf}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}

// Alias for convenience and backwards-compatibility
export { GarageInvoicesTable as InvoicesTable };
export { GarageInvoicesTable as InvoiceTable };
export default GarageInvoicesTable;
