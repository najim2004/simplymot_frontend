"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  useGetBookingsQuery,
  useLazyGetBookingByIdQuery,
  BookingsHeader,
  BookingsTable,
  GarageBookingsCards,
  CancelBookingModal,
  RescheduleBookingModal,
  printBooking,
  type Booking,
} from "@/features/booking";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";

function parseDateParam(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function BookingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL search params
  const [searchTerm, setSearchTerm] = useState<string>(
    () => searchParams.get("search") || "",
  );
  const [currentPage, setCurrentPage] = useState<number>(
    () => Number(searchParams.get("page")) || 1,
  );
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    () => Number(searchParams.get("limit")) || 10,
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    parseDateParam(searchParams.get("from_date")),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() =>
    parseDateParam(searchParams.get("to_date")),
  );

  // Modals state
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null,
  );
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  // Lazy query to fetch complete booking data on-demand when printing
  const [fetchBookingDetail] = useLazyGetBookingByIdQuery();

  const handlePrint = async (booking: Booking) => {
    // 1. If full details already present, print immediately
    if (booking.vehicle?.fuel_type || booking.additional_services !== undefined) {
      if (!printBooking(booking)) {
        toast.warning("Unable to open print dialog. Please check pop-up permissions.");
      }
      return;
    }

    // 2. Open tab synchronously on click to bypass browser popup blockers
    const printWindow = typeof window !== "undefined" ? window.open("", "_blank") : null;
    if (printWindow) {
      try {
        printWindow.document.write(
          "<!DOCTYPE html><html><head><title>Generating Slip...</title></head><body style='font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:90vh;margin:0;color:#555;'><div style='text-align:center;'><p style='font-size:16px;font-weight:600;'>Preparing Service Receipt Slip...</p><p style='font-size:13px;color:#888;'>Please wait a moment while details are loaded.</p></div></body></html>",
        );
      } catch {
        // Safe check
      }
    }

    // 3. Fetch full details on-demand via cached RTK Query for complete A4 receipt
    try {
      const res = await fetchBookingDetail(booking.id, true).unwrap();
      const fullBooking = res?.data || booking;
      if (!printBooking(fullBooking, printWindow)) {
        printWindow?.close();
        toast.warning("Unable to open print dialog. Please check pop-up permissions.");
      }
    } catch {
      // Graceful fallback to printing available data
      if (!printBooking(booking, printWindow)) {
        printWindow?.close();
        toast.warning("Unable to open print dialog. Please check pop-up permissions.");
      }
    }
  };

  // Debounce search input by 400ms
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Sync state to URL search params whenever filters or pagination change
  useEffect(() => {
    const params = new URLSearchParams();

    const trimmedSearch = debouncedSearch.trim();
    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }
    if (startDate) {
      params.set("from_date", format(startDate, "yyyy-MM-dd"));
    }
    if (endDate) {
      params.set("to_date", format(endDate, "yyyy-MM-dd"));
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }
    if (itemsPerPage !== 10) {
      params.set("limit", itemsPerPage.toString());
    }

    const newQueryString = params.toString();
    const currentQueryString = searchParams.toString();

    if (newQueryString !== currentQueryString) {
      router.replace(
        `${pathname}${newQueryString ? `?${newQueryString}` : ""}`,
        { scroll: false },
      );
    }
  }, [
    debouncedSearch,
    startDate,
    endDate,
    currentPage,
    itemsPerPage,
    pathname,
    router,
    searchParams,
  ]);

  // Sync state when navigating back/forward in browser history
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlFromDate = parseDateParam(searchParams.get("from_date"));
    const urlToDate = parseDateParam(searchParams.get("to_date"));
    const urlPage = Number(searchParams.get("page")) || 1;
    const urlLimit = Number(searchParams.get("limit")) || 10;

    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
    if (urlPage !== currentPage) {
      setCurrentPage(urlPage);
    }
    if (urlLimit !== itemsPerPage) {
      setItemsPerPage(urlLimit);
    }

    const fromChanged =
      (urlFromDate && !startDate) ||
      (!urlFromDate && startDate) ||
      (urlFromDate &&
        startDate &&
        format(urlFromDate, "yyyy-MM-dd") !== format(startDate, "yyyy-MM-dd"));

    if (fromChanged) {
      setStartDate(urlFromDate);
    }

    const toChanged =
      (urlToDate && !endDate) ||
      (!urlToDate && endDate) ||
      (urlToDate &&
        endDate &&
        format(urlToDate, "yyyy-MM-dd") !== format(endDate, "yyyy-MM-dd"));

    if (toChanged) {
      setEndDate(urlToDate);
    }
  }, [currentPage, endDate, itemsPerPage, searchParams, searchTerm, startDate]);

  // RTK Query: fetch bookings directly from API with search and date filters
  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
  } = useGetBookingsQuery({
    search: debouncedSearch.trim() || undefined,
    from_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    to_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    setCurrentPage(1);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* 1. Header with title, date filters and search in one row */}
      <BookingsHeader
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onSearchChange={handleSearchChange}
      />

      {/* 2. Direct data rendering with optional chaining */}
      <div className="space-y-4">
        {/* Mobile & Tablet Card View (< lg: visible on phone/tablet) */}
        <GarageBookingsCards
          bookings={bookingsData?.data}
          isLoading={isLoading}
          skeletonCount={itemsPerPage}
          onView={(booking) => router.push(`/garage/bookings/${booking.id}`)}
          onPrint={handlePrint}
          onReschedule={setRescheduleBooking}
          onCancel={setCancelBooking}
        />

        {/* Desktop Table View (lg and above) */}
        <BookingsTable
          bookings={bookingsData?.data}
          isLoading={isLoading}
          isError={isError}
          skeletonRows={itemsPerPage}
          onRetry={refetch}
          onView={(booking) => router.push(`/garage/bookings/${booking.id}`)}
          onPrint={handlePrint}
          onReschedule={setRescheduleBooking}
          onCancel={setCancelBooking}
        />
      </div>

      {/* 3. Pagination with shadcn Select component */}
      {!isLoading && !isError && (bookingsData?.meta_data?.total ?? 0) > 0 && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={
            bookingsData?.meta_data?.total
              ? Math.ceil(bookingsData.meta_data.total / itemsPerPage)
              : 1
          }
          itemsPerPage={itemsPerPage}
          totalItems={bookingsData?.meta_data?.total ?? 0}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* 5. Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleBookingModal
          key={rescheduleBooking.id}
          isOpen={Boolean(rescheduleBooking)}
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* 6. Cancel Modal */}
      {cancelBooking && (
        <CancelBookingModal
          key={cancelBooking.id}
          isOpen={Boolean(cancelBooking)}
          booking={cancelBooking}
          onClose={() => setCancelBooking(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}

export default function Bookings() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="text-gray-500 text-sm">Loading bookings...</div>
        </div>
      }
    >
      <BookingsContent />
    </Suspense>
  );
}
