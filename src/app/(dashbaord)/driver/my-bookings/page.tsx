"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  useGetBookingsQuery,
  BookingsHeader,
  DriverBookingsTable,
  DriverBookingsCards,
  DriverViewBookingModal,
  RescheduleBookingModal,
  CancelBookingModal,
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
  const [filterStatus, setFilterStatus] = useState<string>(
    () => searchParams.get("status") || "all",
  );

  // Modals state
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null,
  );
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  // Debounce search input by 400ms
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Sync state to URL search params silently without router refresh
  useEffect(() => {
    if (typeof window === "undefined") return;

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
    if (filterStatus && filterStatus !== "all") {
      params.set("status", filterStatus);
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }
    if (itemsPerPage !== 10) {
      params.set("limit", itemsPerPage.toString());
    }

    const newQueryString = params.toString();
    const newRelativePathQuery = `${pathname}${newQueryString ? `?${newQueryString}` : ""}`;
    const currentPathQuery = `${window.location.pathname}${window.location.search}`;

    if (newRelativePathQuery !== currentPathQuery) {
      window.history.replaceState(null, "", newRelativePathQuery);
    }
  }, [
    debouncedSearch,
    startDate,
    endDate,
    filterStatus,
    currentPage,
    itemsPerPage,
    pathname,
  ]);

  // Sync state when navigating back/forward with browser history
  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      setSearchTerm(sp.get("search") || "");
      setCurrentPage(Number(sp.get("page")) || 1);
      setItemsPerPage(Number(sp.get("limit")) || 10);
      setStartDate(parseDateParam(sp.get("from_date")));
      setEndDate(parseDateParam(sp.get("to_date")));
      setFilterStatus(sp.get("status") || "all");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // RTK Query: fetch current customer's bookings with search, status and date filters
  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
  } = useGetBookingsQuery({
    search: debouncedSearch.trim() || undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
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

  const handleFilterStatusChange = (status: string) => {
    setFilterStatus(status);
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
      {/* 1. Header with title, status dropdown, date filters and search in one clean row */}
      <BookingsHeader
        title="My Bookings"
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onSearchChange={handleSearchChange}
        onFilterStatusChange={handleFilterStatusChange}
      />

      {/* 2. Driver-specific data cards and table */}
      <div className="space-y-4">
        {/* Mobile & Tablet Card View (< lg: visible on phone/tablet) */}
        <DriverBookingsCards
          bookings={bookingsData?.data}
          isLoading={isLoading && !bookingsData}
          skeletonCount={itemsPerPage}
          onView={(booking) => router.push(`/driver/my-bookings/${booking.id}`)}
          onReschedule={setRescheduleBooking}
          onCancel={setCancelBooking}
        />

        {/* Desktop Table View (lg and above) */}
        <DriverBookingsTable
          bookings={bookingsData?.data}
          isLoading={isLoading && !bookingsData}
          isError={isError}
          skeletonRows={itemsPerPage}
          onRetry={refetch}
          onView={(booking) => router.push(`/driver/my-bookings/${booking.id}`)}
          onReschedule={setRescheduleBooking}
          onCancel={setCancelBooking}
        />
      </div>

      {/* 3. Pagination with Shadcn Select component */}
      {!isLoading && !isError && (bookingsData?.meta_data?.total ?? 0) > 0 && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={
            Math.ceil((bookingsData?.meta_data?.total || 0) / itemsPerPage) || 1
          }
          itemsPerPage={itemsPerPage}
          totalItems={bookingsData?.meta_data?.total || 0}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* 4. Action Modals */}
      <DriverViewBookingModal
        isOpen={Boolean(viewBooking)}
        onClose={() => setViewBooking(null)}
        booking={viewBooking}
      />

      <RescheduleBookingModal
        isOpen={Boolean(rescheduleBooking)}
        onClose={() => setRescheduleBooking(null)}
        booking={rescheduleBooking}
        onSuccess={() => {
          setRescheduleBooking(null);
          refetch();
        }}
      />

      <CancelBookingModal
        isOpen={Boolean(cancelBooking)}
        onClose={() => setCancelBooking(null)}
        booking={cancelBooking}
        onSuccess={() => {
          setCancelBooking(null);
          refetch();
        }}
      />
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="text-gray-500 text-sm font-medium">
            Loading your bookings...
          </div>
        </div>
      }
    >
      <DriverBookingsContent />
    </Suspense>
  );
}
