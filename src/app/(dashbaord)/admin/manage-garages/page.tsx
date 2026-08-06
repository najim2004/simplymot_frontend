"use client";
import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  MoreVertical,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { toast } from "react-toastify";
import {
  useApproveAGarageMutation,
  useRejectAGarageMutation,
  useDeleteGarageMutation,
  useGetAGarageByIdQuery,
  useGetAllGaragesQuery,
} from "@/features/admin";

// Garage Details Content Component
const GarageDetailsContent = ({ garageId }: { garageId: string }) => {
  const {
    data: garageData,
    isLoading,
    isError,
  } = useGetAGarageByIdQuery(garageId || "", {
    refetchOnMountOrArgChange: true,
  });

  const garage = garageData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">
          Loading garage details...
        </span>
      </div>
    );
  }

  if (isError || !garage) {
    return (
      <div className="text-sm text-red-500 py-4">
        Failed to load garage details
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Garage Information
        </h3>
        <div className="grid grid-cols-1 gap-y-3">
          <DetailRow label="Garage Name" value={garage.garage_name} />
          <DetailRow
            label="Primary Contact Person"
            value={garage.primary_contact}
          />
          <DetailRow label="VTS Number" value={garage.vts_number} />
          <DetailRow label="Email" value={garage.email} />
          <DetailRow
            label="Phone Number"
            value={garage.phone_number || "N/A"}
          />
          <DetailRow
            label="Address"
            value={
              [
                garage.address,
                garage.city,
                garage.state,
                garage.country,
                garage.zip_code,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"
            }
          />
          <DetailRow label="Status" value={garage.status} />
          <DetailRow
            label="Created At"
            value={
              garage.created_at
                ? new Date(garage.created_at).toLocaleString()
                : "N/A"
            }
          />
          <DetailRow
            label="Verified At"
            value={
              garage.email_verified_at
                ? new Date(garage.email_verified_at).toLocaleString()
                : "Not Verified"
            }
          />
        </div>
      </div>
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
  <div className="border-b border-gray-100 pb-2 last:border-0">
    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
    <div className="font-medium text-sm text-gray-900">{value || "-"}</div>
  </div>
);

const ActionsDropdown = React.memo(
  ({
    garageId,
    onDeleteClick,
    onViewDetails,
    isDeleting,
  }: {
    garageId: string;
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
                onViewDetails(garageId);
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
                onDeleteClick(garageId);
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

// Date formatter helper
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

export default function ManageGarages() {
  const [activeTab, setActiveTab] = useState<string | number>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    garageId: string | null;
  }>({
    isOpen: false,
    garageId: null,
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, startDate, endDate]);

  const garagesInfo = useGetAllGaragesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    status: activeTab ? String(activeTab) : undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const [approveGarage, { isLoading: isApproving }] =
    useApproveAGarageMutation();
  const [rejectGarage, { isLoading: isRejecting }] = useRejectAGarageMutation();
  const [deleteGarage, { isLoading: isDeleting }] = useDeleteGarageMutation();

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    garageId: string | null;
    action: "approve" | "reject" | "delete" | null;
    garageName: string | null;
  }>({ isOpen: false, garageId: null, action: null, garageName: null });

  const garagesData = garagesInfo?.data?.data?.garages || [];
  const pagination = garagesInfo?.data?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };
  const { pages: totalPages, total: totalItems } = pagination;

  // const handleApprove = React.useCallback((id: string, name: string) => {
  //   setConfirmModal({
  //     isOpen: true,
  //     garageId: id,
  //     action: "approve",
  //     garageName: name,
  //   });
  // }, []);

  // const handleReject = React.useCallback((id: string, name: string) => {
  //   setConfirmModal({
  //     isOpen: true,
  //     garageId: id,
  //     action: "reject",
  //     garageName: name,
  //   });
  // }, []);

  const handleDelete = React.useCallback((id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      garageId: id,
      action: "delete",
      garageName: name,
    });
  }, []);

  const handleConfirm = async () => {
    if (!confirmModal.garageId || !confirmModal.action) return;
    try {
      let response: any;
      if (confirmModal.action === "approve") {
        response = await approveGarage(confirmModal.garageId).unwrap();
      } else if (confirmModal.action === "reject") {
        response = await rejectGarage(confirmModal.garageId).unwrap();
      } else if (confirmModal.action === "delete") {
        response = await deleteGarage(confirmModal.garageId).unwrap();
      }
      toast.success(
        response?.message || `Garage ${confirmModal.action}d successfully!`,
      );
      setConfirmModal({
        isOpen: false,
        garageId: null,
        action: null,
        garageName: null,
      });
      garagesInfo.refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message || `Failed to ${confirmModal.action} garage`,
      );
      setConfirmModal({
        isOpen: false,
        garageId: null,
        action: null,
        garageName: null,
      });
    }
  };

  const closeModal = () =>
    setConfirmModal({
      isOpen: false,
      garageId: null,
      action: null,
      garageName: null,
    });

  const handleViewDetails = (garageId: string) => {
    setViewDetailsModal({
      isOpen: true,
      garageId,
    });
  };

  const handleCloseViewDetailsModal = () => {
    setViewDetailsModal({
      isOpen: false,
      garageId: null,
    });
  };

  const tabs = [
    { key: "all", label: "All Garages", count: totalItems },
    {
      key: "active",
      label: "Active",
      count: garagesData.filter((g: any) => g.status === "Active").length,
    },
    {
      key: "pending",
      label: "Pending",
      count: garagesData.filter((g: any) => g.status === "Pending").length,
    },
  ];

  const columns = [
    { key: "garage_name", label: "Garage Name", width: "25%" },
    { key: "primary_contact", label: "Primary Contact", width: "15%" },
    { key: "phone_number", label: "Phone", width: "15%" },
    { key: "email", label: "Email", width: "15%" },
    {
      key: "status",
      label: "Status",
      width: "15%",
      render: (value: any, row: any) => {
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
          garageId={row.id}
          onDeleteClick={() => handleDelete(row.id, row.garage_name)}
          onViewDetails={() => handleViewDetails(row.id)}
          isDeleting={isDeleting}
        />
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 w-full mb-6">
        <h1 className="text-2xl font-semibold">List of All Garages</h1>
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
            placeholder="Search garages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full lg:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <>
        <ReusableTable
          data={garagesData}
          columns={columns}
          className="mt-5"
          isLoading={garagesInfo.isLoading}
          skeletonRows={itemsPerPage}
        />
        {!garagesInfo.isLoading && (
          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage: number) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        )}
      </>

      {/* Approve / Reject Modal */}
      <CustomReusableModal
        isOpen={confirmModal.isOpen && confirmModal.action !== "delete"}
        onClose={closeModal}
        title={
          confirmModal.action === "approve" ? "Approve Garage" : "Reject Garage"
        }
        variant={confirmModal.action === "approve" ? "success" : "danger"}
        icon={
          confirmModal.action === "approve" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )
        }
        description={`Are you sure you want to ${confirmModal.action} this garage?`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to {confirmModal.action} the garage &quot;
            {confirmModal.garageName}&quot;. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={closeModal}
              disabled={isApproving || isRejecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isApproving || isRejecting}
              className={
                confirmModal.action === "approve"
                  ? "bg-green-600 cursor-pointer hover:bg-green-700 text-white"
                  : "bg-red-600 cursor-pointer hover:bg-red-700 text-white"
              }
            >
              {isApproving || isRejecting
                ? "Processing..."
                : confirmModal.action === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </div>
        </div>
      </CustomReusableModal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmModal.isOpen && confirmModal.action === "delete"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              Delete Garage Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the account for{" "}
              <strong>{confirmModal.garageName}</strong>?{" "}
              <span className="block mt-2 text-red-600 font-medium">
                This action cannot be undone. All garage data will be removed.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="cursor-pointer"
            >
              No, keep account
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-700 hover:bg-red-800 text-white cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Yes, Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog
        open={viewDetailsModal.isOpen}
        onOpenChange={handleCloseViewDetailsModal}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Garage Details</DialogTitle>
            <DialogDescription>
              View detailed information about the garage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {viewDetailsModal.garageId && (
              <GarageDetailsContent garageId={viewDetailsModal.garageId} />
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
