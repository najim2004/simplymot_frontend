"use client";

import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  MoreVertical,
  Loader2,
  CalendarIcon,
  X,
  Trash2,
  Eye,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formatDate = (value: string | null | undefined) => {
  if (!value || value === "N/A") return "N/A";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return format(date, "dd/MM/yyyy");
  } catch {
    return "N/A";
  }
};
import {
  useGetADriverDetailsQuery,
  useGetAllDriversQuery,
  useDeleteDriverMutation,
} from "@/rtk/api/admin/driverManagement/driver-managementApis";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

// Driver Details Content Component
const DriverDetailsContent = ({ driverId }: { driverId: string }) => {
  const {
    data: driverData,
    isLoading,
    isError,
  } = useGetADriverDetailsQuery(driverId || "", {
    refetchOnMountOrArgChange: true,
  });

  const singleDriver = driverData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">
          Loading driver details...
        </span>
      </div>
    );
  }

  if (isError || !singleDriver) {
    return (
      <div className="text-sm text-red-500 py-4">
        Failed to load driver details
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Driver Information
        </h3>
        <div className="space-y-2">
          <DetailRow label="Driver Name" value={singleDriver.name} />
          <DetailRow label="Email" value={singleDriver.email} />
          <DetailRow
            label="Phone Number"
            value={singleDriver.phone_number || "N/A"}
          />
          <DetailRow
            label="Address"
            value={
              [
                singleDriver.address,
                singleDriver.city,
                singleDriver.state,
                singleDriver.country,
                singleDriver.zip_code,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"
            }
          />
          <DetailRow label="Status" value={singleDriver.status} />
          <DetailRow
            label="Created At"
            value={
              singleDriver.created_at
                ? format(new Date(singleDriver.created_at), "dd/MM/yyyy HH:mm")
                : "N/A"
            }
          />
          <DetailRow
            label="Verified At"
            value={
              singleDriver.email_verified_at
                ? format(
                    new Date(singleDriver.email_verified_at),
                    "dd/MM/yyyy HH:mm",
                  )
                : "Not Verified"
            }
          />
        </div>
      </div>
      {singleDriver.vehicles && singleDriver.vehicles.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Vehicles ({singleDriver.vehicles.length})
          </h3>
          <div className="space-y-3">
            {singleDriver.vehicles.map((vehicle: any, index: number) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div className="font-semibold text-sm text-gray-900">
                  {vehicle.registration_number ||
                    vehicle.vehicle_registration_number}
                </div>
                <div className="text-xs text-gray-500">
                  {vehicle.make || vehicle.vehicle_make}{" "}
                  {vehicle.model || vehicle.vehicle_model}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => (
  <>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="font-medium text-sm mb-2">{value || "-"}</div>
  </>
);

// Actions Dropdown Component
const ActionsDropdown = React.memo(
  ({
    driverId,
    onDeleteClick,
    onViewDetails,
    isDeleting,
  }: {
    driverId: string;
    onDeleteClick: (id: string) => void;
    onViewDetails: (id: string) => void;
    isDeleting: boolean;
  }) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 cursor-pointer w-8 p-0"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
          onEscapeKeyDown={() => {
            setDropdownOpen(false);
          }}
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(() => {
                onViewDetails(driverId);
              }, 150);
            }}
            className="cursor-pointer"
            disabled={isDeleting}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(() => {
                onDeleteClick(driverId);
              }, 150);
            }}
            className="cursor-pointer text-red-600 focus:text-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

ActionsDropdown.displayName = "ActionsDropdown";

const DatePicker = ({
  date,
  onDateChange,
  placeholder,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full min-w-[200px] justify-start pr-10 text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {date ? format(date, "dd/MM/yyyy") : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {date && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDateChange(undefined);
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label={`Clear ${placeholder}`}
          title={`Clear ${placeholder}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default function DriversManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string | number>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    driverId: string | null;
    driverName: string | null;
  }>({
    isOpen: false,
    driverId: null,
    driverName: null,
  });
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    driverId: string | null;
  }>({
    isOpen: false,
    driverId: null,
  });

  const debouncedSearch = useDebounce(searchTerm, 500);
  const [deleteDriver, { isLoading: isDeleting }] = useDeleteDriverMutation();

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, startDate, endDate]);

  const {
    data: apiData,
    isLoading,
    refetch,
  } = useGetAllDriversQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    status: activeTab ? String(activeTab) : undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const driversData = apiData?.data?.drivers || [];
  const tableData = driversData.map((driver: any) => ({
    id: driver.id,
    name: driver.name || "",
    email: driver.email || "",
    phone_number: driver.phone_number || null,
    status: driver.status,
    created_at: driver.created_at || null,
    approved_at: driver.approved_at || null,
    email_verified_at: driver.email_verified_at || null,
  }));

  const pagination = apiData?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const handleDeleteClick = (driverId: string) => {
    const driver = tableData.find((d: any) => d.id === driverId);
    setDeleteModal({
      isOpen: true,
      driverId,
      driverName: driver?.name || "Driver",
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.driverId) return;

    try {
      await deleteDriver(deleteModal.driverId).unwrap();
      toast.success("Driver deleted successfully!");
      setDeleteModal({
        isOpen: false,
        driverId: null,
        driverName: null,
      });
      refetch();
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.data?.message)
        ? error.data.message.join(", ")
        : error?.data?.message || "Failed to delete driver";
      toast.error(errorMessage);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      driverId: null,
      driverName: null,
    });
  };

  const handleViewDetails = (driverId: string) => {
    setViewDetailsModal({
      isOpen: true,
      driverId,
    });
  };

  const handleCloseViewDetailsModal = () => {
    setViewDetailsModal({
      isOpen: false,
      driverId: null,
    });
  };

  const tabs = [
    { key: "all", label: "All Drivers", count: pagination.total },
    {
      key: "active",
      label: "Active",
      count: driversData.filter((d: any) => d.status === "Active").length,
    },
    {
      key: "pending",
      label: "Pending",
      count: driversData.filter((d: any) => d.status === "Pending").length,
    },
  ];

  const columns = [
    { key: "name", label: "Driver Name", width: "20%" },
    {
      key: "phone_number",
      label: "Phone",
      width: "15%",
      render: (value: any) => value || "—",
    },
    { key: "email", label: "Email", width: "20%" },
    {
      key: "status",
      label: "Status",
      width: "10%",
      render: (value: string, row: any) => {
        let label = value || "Pending";
        let colorClass =
          "bg-yellow-100 text-yellow-800 border border-yellow-300";

        if (value === "Active" || value === "Approved") {
          label = "Active";
          colorClass = "bg-green-100 text-green-800 border border-green-300";
        } else if (value === "Banned") {
          label = "Banned";
          colorClass = "bg-red-100 text-red-800 border border-red-300";
        } else if (row?.email_verified_at) {
          label = "Verified";
          colorClass = "bg-blue-100 text-blue-800 border border-blue-300";
        }

        return (
          <span
            className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Created At",
      width: "15%",
      render: formatDate,
    },
    {
      key: "email_verified_at",
      label: "Verified At",
      width: "15%",
      render: formatDate,
    },
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      render: (_: string, row: any) => (
        <ActionsDropdown
          driverId={row.id}
          onDeleteClick={handleDeleteClick}
          onViewDetails={handleViewDetails}
          isDeleting={isDeleting}
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 w-full mb-6">
        <h1 className="text-2xl font-semibold">List of All Drivers</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 lg:flex-initial min-w-0">
          <DateFilter
            label="Start Date"
            date={startDate}
            onDateChange={setStartDate}
          />
          <DateFilter
            label="End Date"
            date={endDate}
            onDateChange={setEndDate}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <nav className="flex flex-wrap gap-2 lg:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key === "all" ? "" : tab.key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${
                (activeTab === "" && tab.key === "all") || activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="relative w-full lg:w-auto lg:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full lg:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <>
        <ReusableTable
          data={tableData}
          columns={columns}
          className="mt-5"
          isLoading={isLoading}
          skeletonRows={itemsPerPage}
        />
        {!isLoading && (
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
      </>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Driver"
        description={`Are you sure you want to delete driver ${deleteModal.driverName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* View Details Modal */}
      <Dialog
        open={viewDetailsModal.isOpen}
        onOpenChange={handleCloseViewDetailsModal}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>
              View detailed information about the driver
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewDetailsModal.driverId && (
              <DriverDetailsContent driverId={viewDetailsModal.driverId} />
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseViewDetailsModal}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const DateFilter = ({
  label,
  date,
  onDateChange,
}: {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}) => (
  <div className="flex-1 min-w-0 max-w-full sm:max-w-[280px]">
    <DatePicker
      date={date}
      onDateChange={onDateChange}
      placeholder={label}
    />
  </div>
);
