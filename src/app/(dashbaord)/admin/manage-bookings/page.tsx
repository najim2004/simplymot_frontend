"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  useGetAllBookingsQuery,
  useCancelBookingMutation,
  BookingManagementHeader,
  BookingManagementTable,
  ViewDriverDetailsModal,
  ViewBookingGarageModal,
  type AdminBooking,
  type AdminBookingCustomer,
  type AdminBookingGarage,
  type Driver,
} from "@/features/admin";
import {
  RescheduleBookingModal,
  CancelBookingModal,
  type Booking,
} from "@/features/booking";

function parseDateParam(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function ManageBookingsContent() {
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
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null,
  );
  const [cancelTargetBooking, setCancelTargetBooking] =
    useState<AdminBooking | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Driver | null>(null);
  const [selectedGarage, setSelectedGarage] =
    useState<AdminBookingGarage | null>(null);

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

  // Fetch Bookings from Admin API
  const {
    data: bookingsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAllBookingsQuery({
    search: debouncedSearch.trim() || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [cancelBookingApi, { isLoading: isCancelling }] =
    useCancelBookingMutation();

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

  const bookingsList: AdminBooking[] = bookingsResponse?.data || [];
  const totalBookings = bookingsResponse?.meta_data?.total ?? bookingsList.length;
  const totalPages =
    bookingsResponse?.meta_data?.totalPages ||
    Math.ceil(totalBookings / itemsPerPage) ||
    1;

  // View Customer handler: format AdminBookingCustomer to Driver type for ViewDriverDetailsModal
  const handleViewCustomer = (booking: AdminBooking) => {
    if (!booking.customer) {
      toast.info("No customer information available for this booking");
      return;
    }
    const customer = booking.customer;
    const formattedDriver: Driver = {
      id: customer.id || booking.id,
      name: customer.name || "Customer",
      email: customer.email || "-",
      phone_number: customer.phone_number || null,
      avatar: customer.avatar || null,
      status: customer.status || "ACTIVE",
      created_at: customer.created_at || booking.order_date,
      address: customer.address || null,
      city: customer.city || null,
      post_code: customer.post_code || null,
      email_verified_at: customer.email_verified_at || null,
      role: customer.role || customer.kind || "DRIVER",
    };
    setSelectedCustomer(formattedDriver);
  };

  // View Garage handler
  const handleViewGarage = (booking: AdminBooking) => {
    if (!booking.garage) {
      toast.info("No garage information available for this booking");
      return;
    }
    setSelectedGarage(booking.garage);
  };

  // Convert AdminBooking to Booking format for RescheduleModal
  const handleReschedule = (booking: AdminBooking) => {
    const formattedBooking: Booking = {
      id: booking.id,
      garage_id: booking.garage?.id || "",
      order_date: booking.order_date,
      status: booking.status as any,
      starts_at: booking.slot?.starts_at || null,
      ends_at: booking.slot?.ends_at || null,
      garage: {
        garage_name: booking.garage?.garage_name || "Garage",
        garage_image: booking.garage?.garage_image || null,
        address: booking.garage?.address || null,
        city: booking.garage?.city || null,
        phone_number: booking.garage?.phone_number || null,
        contact_email: booking.garage?.contact_email || null,
      },
      customer: {
        id: booking.customer?.id || "",
        name: booking.customer?.name || "Customer",
        email: booking.customer?.email || "",
        phone_number: booking.customer?.phone_number || "",
        avatar: booking.customer?.avatar || null,
      },
      vehicle: {
        id: booking.vehicle?.id || "",
        registration_number: booking.vehicle?.registration_number || "",
        make: booking.vehicle?.make || "",
        model: booking.vehicle?.model || "",
        color: booking.vehicle?.color || "",
      },
      slot: booking.slot
        ? {
            id: booking.slot.id || "",
            starts_at: booking.slot.starts_at || "",
            ends_at: booking.slot.ends_at || "",
            status: "BOOKED" as any,
          }
        : undefined,
    };
    setRescheduleBooking(formattedBooking);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelTargetBooking) return;
    try {
      const res = await cancelBookingApi({
        id: cancelTargetBooking.id,
        reason,
      }).unwrap();
      toast.success(res.message || "Booking cancelled successfully");
      setCancelTargetBooking(null);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to cancel booking",
      );
    }
  };

  return (
    <div>
      {/* 1. Header with title, date filters, status dropdown, and search */}
      <BookingManagementHeader
        title="List of all Bookings"
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onSearchChange={handleSearchChange}
        onFilterStatusChange={handleFilterStatusChange}
      />

      {/* 2. Direct data rendering: Table and pagination joined with zero gap */}
      <div>
        <BookingManagementTable
          bookings={bookingsList}
          isLoading={isLoading && !bookingsResponse}
          isError={isError}
          skeletonRows={itemsPerPage}
          hasPagination={!isLoading && !isError && totalBookings > 0}
          onRetry={refetch}
          onView={(booking) => {
            // Navigate to garage details with booking or garage view
            if (booking.garage?.id) {
              router.push(`/admin/manage-garages/${booking.garage.id}`);
            } else if (booking.customer?.id) {
              router.push(`/admin/manage-drivers/${booking.customer.id}`);
            } else {
              toast.info(`Viewing booking #${booking.booking_number || booking.id.slice(0, 8)}`);
            }
          }}
          onReschedule={handleReschedule}
          onCancel={(booking) => setCancelTargetBooking(booking)}
          onViewCustomer={handleViewCustomer}
          onViewGarage={handleViewGarage}
        />

        {/* 3. Pagination */}
        {!isLoading && !isError && totalBookings > 0 && (
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalBookings}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* 4. Action Modals */}
      {/* Reschedule Modal */}
      <RescheduleBookingModal
        isOpen={Boolean(rescheduleBooking)}
        onClose={() => setRescheduleBooking(null)}
        booking={rescheduleBooking}
        onSuccess={() => {
          setRescheduleBooking(null);
          refetch();
        }}
      />

      {/* Cancel Modal */}
      <CancelBookingModal
        isOpen={Boolean(cancelTargetBooking)}
        onClose={() => setCancelTargetBooking(null)}
        bookingId={cancelTargetBooking?.id}
        onConfirm={handleConfirmCancel}
      />

      {/* View Customer Modal */}
      <ViewDriverDetailsModal
        isOpen={Boolean(selectedCustomer)}
        driver={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onViewFullDetails={(customerId) =>
          router.push(`/admin/manage-drivers/${customerId}`)
        }
      />

      {/* View Garage Modal */}
      <ViewBookingGarageModal
        isOpen={Boolean(selectedGarage)}
        garage={selectedGarage}
        onClose={() => setSelectedGarage(null)}
        onViewFullDetails={(garageId) =>
          router.push(`/admin/manage-garages/${garageId}`)
        }
      />
    </div>
  );
}

export default function ManageBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="text-gray-500 text-sm font-medium">
            Loading booking management...
          </div>
        </div>
      }
    >
      <ManageBookingsContent />
    </Suspense>
  );
}
