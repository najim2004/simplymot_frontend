"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  useGetAllDriversQuery,
  useToggleBanDriverMutation,
  DriverManagementHeader,
  DriverManagementTable,
  ViewDriverDetailsModal,
  type Driver,
} from "@/features/admin";

function parseDateParam(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function ManageDriversContent() {
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
  const [activeStatus, setActiveStatus] = useState<string>(
    () => searchParams.get("status") || "all",
  );

  // Modals state
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

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
    if (activeStatus && activeStatus !== "all") {
      params.set("status", activeStatus);
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
    activeStatus,
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
      setActiveStatus(sp.get("status") || "all");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Map activeStatus to API status query parameter
  const apiStatus = useMemo(() => {
    if (activeStatus === "active") return "ACTIVE";
    if (activeStatus === "pending") return "PENDING";
    if (activeStatus === "suspended") return "SUSPENDED";
    if (activeStatus === "banned") return "BANNED";
    return undefined;
  }, [activeStatus]);

  // Fetch Drivers from API
  const {
    data: driversData,
    isLoading,
    isError,
    refetch,
  } = useGetAllDriversQuery({
    search: debouncedSearch.trim() || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    status: apiStatus,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [toggleBanDriver, { isLoading: isTogglingBan }] =
    useToggleBanDriverMutation();

  const handleToggleBan = async (driver: Driver) => {
    try {
      const isCurrentlyBanned =
        driver.status?.toUpperCase() === "BANNED" || Boolean(driver.banned_at);
      const res = await toggleBanDriver(driver.id).unwrap();
      const updatedStatus = res?.data?.status?.toUpperCase();

      if (
        updatedStatus === "BANNED" ||
        (!updatedStatus && !isCurrentlyBanned)
      ) {
        toast.warning(
          res.message || `${driver.name || "Driver"} has been banned`,
        );
      } else {
        toast.success(
          res.message || `${driver.name || "Driver"} has been unbanned`,
        );
      }
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update driver status",
      );
    }
  };

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
    setActiveStatus(status);
    setCurrentPage(1);
  };

  const driversList = driversData?.data?.drivers || [];
  const totalDrivers = driversData?.data?.pagination?.total ?? 0;
  const totalPages = driversData?.data?.pagination?.totalPages
    ? driversData.data.pagination.totalPages
    : Math.ceil(totalDrivers / itemsPerPage) || 1;

  return (
    <div>
      {/* 1. Header with title, date filters, status dropdown and search */}
      <DriverManagementHeader
        title="List of all Drivers"
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        filterStatus={activeStatus}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onSearchChange={handleSearchChange}
        onFilterStatusChange={handleFilterStatusChange}
      />

      {/* 2. Direct data rendering: Table and pagination joined with zero gap */}
      <div>
        <DriverManagementTable
          drivers={driversList}
          isLoading={isLoading && !driversData}
          isError={isError}
          skeletonRows={itemsPerPage}
          hasPagination={!isLoading && !isError && totalDrivers > 0}
          onRetry={refetch}
          onViewDetails={(driver) =>
            router.push(`/admin/manage-drivers/${driver.id}`)
          }
          onViewDriver={(driver) => setSelectedDriver(driver)}
          onToggleBan={handleToggleBan}
          isBanning={isTogglingBan}
        />

        {/* 3. Pagination */}
        {!isLoading && !isError && totalDrivers > 0 && (
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalDrivers}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* 4. Driver Details Modal (Quick View) */}
      <ViewDriverDetailsModal
        isOpen={Boolean(selectedDriver)}
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
        onViewFullDetails={(id) => router.push(`/admin/manage-drivers/${id}`)}
      />
    </div>
  );
}

export default function ManageDriversPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="text-gray-500 text-sm font-medium">
            Loading driver management...
          </div>
        </div>
      }
    >
      <ManageDriversContent />
    </Suspense>
  );
}
