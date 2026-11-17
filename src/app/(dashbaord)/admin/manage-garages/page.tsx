"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  Warehouse,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import {
  useGetAllGaragesQuery,
  useToggleGarageVisibilityMutation,
  GarageManagementHeader,
  GarageManagementTable,
  ViewOwnerDetailsModal,
  AdminStatsCards,
  type Garage,
} from "@/features/admin";

const DUMMY_GARAGE_STATS = [
  {
    label: "Total Garages",
    value: 128,
    icon: Warehouse,
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Visible",
    value: 96,
    icon: Eye,
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Hidden",
    value: 32,
    icon: EyeOff,
    bgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    label: "Active Owners",
    value: 84,
    icon: CheckCircle,
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

function parseDateParam(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function ManageGaragesContent() {
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
  const [activeTab, setActiveTab] = useState<string>(
    () => searchParams.get("tab") || "all",
  );

  // Modals state
  const [selectedOwnerGarage, setSelectedOwnerGarage] = useState<Garage | null>(
    null,
  );

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
    if (activeTab && activeTab !== "all") {
      params.set("tab", activeTab);
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
    activeTab,
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
      setActiveTab(sp.get("tab") || "all");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Map activeTab to status query parameter
  const apiStatus = useMemo(() => {
    if (activeTab === "active") return "ACTIVE";
    if (activeTab === "pending") return "PENDING";
    return undefined;
  }, [activeTab]);

  // Fetch Garages from API
  const {
    data: garagesData,
    isLoading,
    isError,
    refetch,
  } = useGetAllGaragesQuery({
    search: debouncedSearch.trim() || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    status: apiStatus,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [toggleVisibility, { isLoading: isToggling }] =
    useToggleGarageVisibilityMutation();

  const handleToggleVisibility = async (garage: Garage) => {
    const currentVisible = garage.is_visible !== false;
    const targetVisible = !currentVisible;
    try {
      await toggleVisibility({
        id: garage.id,
        is_visible: targetVisible,
      }).unwrap();
      toast.success(
        `Garage is now ${targetVisible ? "visible to drivers" : "hidden from search"}`,
      );
      refetch();
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Failed to update garage visibility status",
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
    setActiveTab(status);
    setCurrentPage(1);
  };

  // Filter garages client-side for visible / hidden tabs if needed
  const displayedGarages = useMemo(() => {
    const list = garagesData?.data?.garages || [];
    if (activeTab === "visible") {
      return list.filter((g) => g.is_visible !== false);
    }
    if (activeTab === "hidden") {
      return list.filter((g) => g.is_visible === false);
    }
    return list;
  }, [garagesData?.data?.garages, activeTab]);

  const totalGarages = garagesData?.data?.pagination?.total ?? 0;
  const totalPages = garagesData?.data?.pagination?.totalPages
    ? garagesData.data.pagination.totalPages
    : Math.ceil(totalGarages / itemsPerPage) || 1;

  return (
    <div>
      {/* 1. Header with title, date filters, status dropdown and search */}
      <GarageManagementHeader
        title="List of all Garages"
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        filterStatus={activeTab}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onSearchChange={handleSearchChange}
        onFilterStatusChange={handleFilterStatusChange}
      />

      <AdminStatsCards stats={DUMMY_GARAGE_STATS} />

      {/* 2. Direct data rendering: Table and pagination joined with zero gap */}
      <div>
        <GarageManagementTable
          garages={displayedGarages}
          isLoading={isLoading && !garagesData}
          isError={isError}
          skeletonRows={itemsPerPage}
          hasPagination={!isLoading && !isError && totalGarages > 0}
          onRetry={refetch}
          onViewDetails={(garage) =>
            router.push(`/admin/manage-garages/${garage.id}`)
          }
          onToggleVisibility={handleToggleVisibility}
          onViewOwner={(garage) => setSelectedOwnerGarage(garage)}
          isTogglingVisibility={isToggling}
        />

        {/* 3. Pagination */}
        {!isLoading && !isError && totalGarages > 0 && (
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalGarages}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* 4. Owner Details Modal */}
      <ViewOwnerDetailsModal
        isOpen={Boolean(selectedOwnerGarage)}
        garage={selectedOwnerGarage}
        onClose={() => setSelectedOwnerGarage(null)}
      />
    </div>
  );
}

export default function ManageGaragesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="text-gray-500 text-sm font-medium">
            Loading garage management...
          </div>
        </div>
      }
    >
      <ManageGaragesContent />
    </Suspense>
  );
}
