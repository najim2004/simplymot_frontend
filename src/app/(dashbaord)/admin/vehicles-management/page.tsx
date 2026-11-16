"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useDebounce } from "@/hooks/useDebounce";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import {
  useGetAllVehiclesQuery,
  useDeleteVehicleMutation,
  useAutoReminderSettings,
  useVehicleReminders,
  SendReminderModal,
  VehiclesManagementHeader,
  VehiclesManagementTable,
  type VehicleTableRow,
} from "@/features/admin";

type ExpiryStatus = "all" | "expired" | "expired_soon" | "not_expired";
type SortByExpiry = "asc" | "desc" | undefined;

function parseDateParam(dateStr: string | null): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseExpiryStatus(value: string | null): ExpiryStatus {
  if (
    value === "expired" ||
    value === "expired_soon" ||
    value === "not_expired"
  ) {
    return value;
  }
  return "all";
}

function parseSortByExpiry(value: string | null): SortByExpiry {
  if (value === "asc" || value === "desc") return value;
  return undefined;
}

function VehiclesManagementContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("search") || "",
  );
  const [currentPage, setCurrentPage] = useState(
    () => Number(searchParams.get("page")) || 1,
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    () => Number(searchParams.get("limit")) || 10,
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    parseDateParam(searchParams.get("from_date")),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(() =>
    parseDateParam(searchParams.get("to_date")),
  );
  const [sortByExpiry, setSortByExpiry] = useState<SortByExpiry>(() =>
    parseSortByExpiry(searchParams.get("sort_by_expiry")),
  );
  const [expiryStatus, setExpiryStatus] = useState<ExpiryStatus>(() =>
    parseExpiryStatus(searchParams.get("expiry_status")),
  );

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    vehicleId: string | null;
    vehicleRegistration: string | null;
  }>({
    isOpen: false,
    vehicleId: null,
    vehicleRegistration: null,
  });

  const { autoReminderEnabled, reminderDaysInAdvance } =
    useAutoReminderSettings();
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams();
    const trimmedSearch = debouncedSearch.trim();
    if (trimmedSearch) params.set("search", trimmedSearch);
    if (startDate) params.set("from_date", format(startDate, "yyyy-MM-dd"));
    if (endDate) params.set("to_date", format(endDate, "yyyy-MM-dd"));
    if (expiryStatus && expiryStatus !== "all") {
      params.set("expiry_status", expiryStatus);
    }
    if (sortByExpiry) params.set("sort_by_expiry", sortByExpiry);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (itemsPerPage !== 10) params.set("limit", itemsPerPage.toString());

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
    expiryStatus,
    sortByExpiry,
    currentPage,
    itemsPerPage,
    pathname,
  ]);

  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      setSearchTerm(sp.get("search") || "");
      setCurrentPage(Number(sp.get("page")) || 1);
      setItemsPerPage(Number(sp.get("limit")) || 10);
      setStartDate(parseDateParam(sp.get("from_date")));
      setEndDate(parseDateParam(sp.get("to_date")));
      setExpiryStatus(parseExpiryStatus(sp.get("expiry_status")));
      setSortByExpiry(parseSortByExpiry(sp.get("sort_by_expiry")));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  const handleExpiryStatusChange = (status: string) => {
    setExpiryStatus(parseExpiryStatus(status));
    setCurrentPage(1);
  };

  const handleSortByExpiryChange = (value: string) => {
    setSortByExpiry(value === "none" ? undefined : (value as "asc" | "desc"));
    setCurrentPage(1);
  };

  const {
    data: apiData,
    isLoading,
    isError,
    refetch,
  } = useGetAllVehiclesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch.trim() || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    sort_by_expiry: sortByExpiry,
    expiry_status: expiryStatus !== "all" ? expiryStatus : undefined,
  });

  const vehiclesData = (apiData?.data as any)?.vehicles || [];
  const driverData: VehicleTableRow[] = vehiclesData.map((vehicle: any) => ({
    id: vehicle.id,
    driverId: vehicle.user?.id || vehicle.id,
    name: vehicle.user?.name || "",
    email: vehicle.user?.email || "",
    phone_number: vehicle.user?.phone_number || null,
    avatar: vehicle.user?.avatar || null,
    owner_status: vehicle.user?.status || null,
    vehicle_registration_number: vehicle.registration_number || null,
    make: vehicle.make || null,
    model: vehicle.model || null,
    color: vehicle.color || null,
    mot_expiry_date: vehicle.mot_expiry_date || null,
    mot_status: vehicle.mot_status || null,
    is_expired: Boolean(vehicle.is_expired),
    tax_status: vehicle.tax_status || null,
    tax_due_date: vehicle.tax_due_date || null,
    created_at: vehicle.created_at || null,
    mot_last_checked_at: vehicle.mot_last_checked_at || null,
  }));

  const { needsReminderCount, vehiclesNeedingReminder } = useVehicleReminders({
    vehicles: driverData,
    autoReminderEnabled,
    reminderDaysInAdvance,
  });

  const pagination = apiData?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedRows(
      checked ? new Set(driverData.map((row) => row.id)) : new Set(),
    );
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      checked ? next.add(rowId) : next.delete(rowId);
      return next;
    });
  };

  const handleSendReminderClick = () => {
    if (selectedRows.size === 0) {
      toast.error("Please select at least one driver");
      return;
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (vehicle: VehicleTableRow) => {
    setDeleteModal({
      isOpen: true,
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.vehicle_registration_number || "Vehicle",
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.vehicleId) return;

    try {
      await deleteVehicle(deleteModal.vehicleId).unwrap();
      toast.success("Vehicle deleted successfully!");
      setDeleteModal({
        isOpen: false,
        vehicleId: null,
        vehicleRegistration: null,
      });
      setSelectedRows((prev) => {
        const next = new Set(prev);
        next.delete(deleteModal.vehicleId!);
        return next;
      });
      refetch();
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.data?.message)
        ? error.data.message.join(", ")
        : error?.data?.message || "Failed to delete vehicle";
      toast.error(errorMessage);
      setDeleteModal({
        isOpen: false,
        vehicleId: null,
        vehicleRegistration: null,
      });
    }
  };

  return (
    <div>
      <VehiclesManagementHeader
        title="List of all Vehicles"
        startDate={startDate}
        endDate={endDate}
        searchTerm={searchTerm}
        expiryStatus={expiryStatus}
        sortByExpiry={sortByExpiry}
        selectedRowsCount={selectedRows.size}
        needsReminderCount={needsReminderCount}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onSearchChange={handleSearchChange}
        onExpiryStatusChange={handleExpiryStatusChange}
        onSortByExpiryChange={handleSortByExpiryChange}
        onSendReminderClick={handleSendReminderClick}
      />

      <div>
        <VehiclesManagementTable
          vehicles={driverData}
          isLoading={isLoading && !apiData}
          isError={isError}
          skeletonRows={itemsPerPage}
          hasPagination={!isLoading && !isError && pagination.total > 0}
          selectedRows={selectedRows}
          vehiclesNeedingReminder={vehiclesNeedingReminder}
          isDeleting={isDeleting}
          onRetry={refetch}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          onDelete={handleDeleteClick}
          onViewDetails={(vehicle) =>
            router.push(`/admin/vehicles-management/${vehicle.id}`)
          }
          onViewOwner={(vehicle) => {
            if (!vehicle.driverId) {
              toast.info("No owner linked to this vehicle");
              return;
            }
            router.push(`/admin/manage-drivers/${vehicle.driverId}`);
          }}
          onViewBookings={(vehicle) => {
            const search =
              vehicle.vehicle_registration_number || vehicle.name || "";
            router.push(
              `/admin/manage-bookings${search ? `?search=${encodeURIComponent(search)}` : ""}`,
            );
          }}
        />

        {!isLoading && !isError && pagination.total > 0 && (
          <ReusablePagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            itemsPerPage={itemsPerPage}
            totalItems={pagination.total}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      <SendReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRowsCount={selectedRows.size}
        selectedDriverData={driverData.filter((row) =>
          selectedRows.has(row.id),
        )}
        onSuccess={() => setSelectedRows(new Set())}
      />

      <ConfirmationModal
        open={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            vehicleId: null,
            vehicleRegistration: null,
          })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle"
        description={`Are you sure you want to delete vehicle with registration number ${deleteModal.vehicleRegistration}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function VehiclesManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="text-gray-500 text-sm font-medium">
            Loading vehicle management...
          </div>
        </div>
      }
    >
      <VehiclesManagementContent />
    </Suspense>
  );
}
