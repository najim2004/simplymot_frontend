"use client";

import React, { useState, useEffect, useRef } from "react";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  useGetInvoicesQuery,
  useLazyGetInvoiceByIdQuery,
  InvoicesHeader,
  GarageInvoicesTable,
  type Invoice,
} from "@/features/invoice";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import { toast } from "react-toastify";

function parseDateParam(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export default function InvoicesPage() {
  // Read initial params from window location if on client
  const [searchTerm, setSearchTerm] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("page")) || 1;
  });

  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    if (typeof window === "undefined") return 10;
    const params = new URLSearchParams(window.location.search);
    return Number(params.get("limit")) || 10;
  });

  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    return parseDateParam(params.get("from_date"));
  });

  const [endDate, setEndDate] = useState<Date | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    return parseDateParam(params.get("to_date"));
  });

  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  // Debounce search input by 400ms for API querying
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Track if this is the initial mount to avoid resetting page on mount
  const isFirstMount = useRef(true);

  // Reset page to 1 when search or date filters change (after mount)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate]);

  // Update URL query string smoothly without triggering route reload / flash
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();
    const trimmed = debouncedSearch.trim();
    if (trimmed) params.set("search", trimmed);
    if (startDate) params.set("from_date", format(startDate, "yyyy-MM-dd"));
    if (endDate) params.set("to_date", format(endDate, "yyyy-MM-dd"));
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (itemsPerPage !== 10) params.set("limit", itemsPerPage.toString());

    const qs = params.toString();
    const newRelativePath = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", newRelativePath);
  }, [debouncedSearch, startDate, endDate, currentPage, itemsPerPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchTerm(params.get("search") || "");
      setCurrentPage(Number(params.get("page")) || 1);
      setItemsPerPage(Number(params.get("limit")) || 10);
      setStartDate(parseDateParam(params.get("from_date")));
      setEndDate(parseDateParam(params.get("to_date")));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // RTK Query: fetch invoices directly from API with search and date filters
  const {
    data: invoicesData,
    isLoading,
    isError,
    refetch,
  } = useGetInvoicesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch.trim() || undefined,
    from_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    to_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const [fetchInvoiceById] = useLazyGetInvoiceByIdQuery();

  const handleOpenPdf = async (row: Invoice) => {
    if (!row?.id) return;
    setLoadingInvoiceId(row.id);
    try {
      const result = await fetchInvoiceById(row.id).unwrap();
      const invoiceDetail = result?.data;
      if (!invoiceDetail) {
        toast.error("Failed to load invoice details");
        return;
      }
      const { pdf } = await import("@react-pdf/renderer");
      const { default: InvoicePdfDocument } =
        await import("@/features/invoice/components/InvoicePdfDocument");
      const blob = await pdf(
        <InvoicePdfDocument invoice={invoiceDetail} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, "_blank");
      if (!tab)
        toast.error("Pop-up blocked! Please allow pop-ups to view PDF.");
      else toast.success("Invoice PDF opened in new tab");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : null;
      toast.error(msg || "Failed to generate invoice PDF");
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  const invoices = invoicesData?.data || [];
  const metaData = invoicesData?.meta_data;
  const totalItems = metaData?.total ?? invoices.length;
  const totalPages =
    metaData?.pages ??
    (totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1);

  return (
    <div>
      {/* 1. Header with title, date filters and search in one row (like BookingsHeader) */}
      <InvoicesHeader
        title="List of all Invoices"
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearchChange={setSearchTerm}
      />

      {/* 2. Direct data rendering with dedicated table (like BookingsTable) */}
      <GarageInvoicesTable
        invoices={invoices}
        isLoading={isLoading}
        isError={isError}
        skeletonRows={itemsPerPage}
        onRetry={refetch}
        onViewPdf={handleOpenPdf}
        loadingInvoiceId={loadingInvoiceId}
        searchTerm={debouncedSearch}
      />

      {/* 3. Pagination with shadcn Select component (like Bookings page) */}
      {!isLoading && !isError && totalItems > 0 && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
