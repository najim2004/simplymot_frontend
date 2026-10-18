"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  useGetBookingsQuery,
  BookingsHeader,
  DriverBookingsTable,
  DriverViewBookingModal,
  RescheduleBookingModal,
  CancelBookingModal,
  type Booking,
} from "@/features/booking";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";

function parseDateParam(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function DriverBookingsContent() {
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
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null,
  );
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

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

  // RTK Query: fetch current customer's bookings with search and date filters
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
      {/* 1. Header with title, date filters and search in one clean row */}
      <BookingsHeader
        title="My Bookings"
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onSearchChange={handleSearchChange}
      />

      {/* 2. Driver-specific data table */}
      <DriverBookingsTable
        bookings={bookingsData?.data}
        isLoading={isLoading}
        isError={isError}
        skeletonRows={itemsPerPage}
        onRetry={refetch}
        onView={setViewBooking}
        onReschedule={setRescheduleBooking}
        onCancel={setCancelBooking}
      />

      {/* 3. Pagination with Shadcn Select component */}
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

      {/* 4. Driver View Detail Modal */}
      {viewBooking && (
        <DriverViewBookingModal
          key={viewBooking.id}
          isOpen={Boolean(viewBooking)}
          booking={viewBooking}
          onClose={() => setViewBooking(null)}
        />
      )}

      {/* 5. Common Reschedule Modal */}
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

export default function MyBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <DriverBookingsContent />
    </Suspense>
  );
}
