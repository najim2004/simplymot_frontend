"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/rtk";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Check,
  CalendarIcon,
  X,
  Eye,
  Trash2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  useGetAllBookingsQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
  useGetSingleBookingQuery,
} from "@/rtk/api/admin/booking-management/bookingManagementApis";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import {
  setSearchFilter,
  setStatusFilter,
  setCurrentPage,
  setItemsPerPage,
  setPagination,
} from "@/rtk/slices/admin/bookingManagementSlice";

const BRAND_COLOR = "#19CA32";
const BRAND_COLOR_HOVER = "#16b82e";
const STATUS_OPTIONS = [
  {
    value: "PENDING",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  {
    value: "ACCEPTED",
    label: "Accepted",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  {
    value: "REJECTED",
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-300",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
] as const;

// Actions Dropdown Component
const ActionsDropdown = React.memo(
  ({
    row,
    onStatusUpdate,
    onViewDetails,
    onDeleteClick,
    isUpdating,
    isDeleting,
  }: {
    row: any;
    onStatusUpdate: (id: string, status: string) => void;
    onViewDetails: (id: string) => void;
    onDeleteClick: (id: string) => void;
    isUpdating: boolean;
    isDeleting: boolean;
  }) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const currentStatus = row.status?.toUpperCase() || "PENDING";

    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 cursor-pointer w-8 p-0"
            disabled={isUpdating || isDeleting}
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
        >
          <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              onViewDetails(row.id);
            }}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>

          {/* <DropdownMenuSeparator /> */}
          {/* <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
            Update Status
          </div>
          {STATUS_OPTIONS.map((status) => {
            if (status.value === currentStatus) return null;
            return (
              <DropdownMenuItem
                key={status.value}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropdownOpen(false);
                  setTimeout(() => {
                    onStatusUpdate(row.id, status.value);
                  }, 150);
                }}
                className="cursor-pointer pl-8"
                disabled={isUpdating}
              >
                {status.label}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator /> */}
          {/* <DropdownMenuItem
            onClick={() => {
              setDropdownOpen(false);
              onDeleteClick(row.id);
            }}
            className="cursor-pointer text-red-600 focus:text-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Booking
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

ActionsDropdown.displayName = "ActionsDropdown";

// DatePicker Component
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

// DateFilter Component
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

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <div className="mb-3">
    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
    <div className="font-medium text-sm">{value || "-"}</div>
  </div>
);

const BookingDetailsModal = ({
  isOpen,
  onClose,
  bookingId,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | null;
}) => {
  const { data, isLoading } = useGetSingleBookingQuery(bookingId || "", {
    skip: !isOpen || !bookingId,
  });
  const booking = data?.data;
    const orderHistories = booking?.order_histories || [];

    const formatDate = (d: any) => {
      if (!d) return "N/A";
      const dt = new Date(d);
      return Number.isNaN(dt.getTime())
        ? "N/A"
        : dt.toLocaleDateString("en-GB");
    };

    const formatTime = (d: any) => {
      if (!d) return "N/A";
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? "N/A" : format(dt, "HH:mm");
    };

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : booking ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 gap-1">
              <DetailRow label="Name" value={booking.driver?.name} />
              <DetailRow label="Email" value={booking.driver?.email} />
              <DetailRow label="Phone" value={booking.driver?.phone_number} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
              Vehicle & Garage
            </h3>
            <div className="grid grid-cols-1 gap-1">
              <DetailRow
                label="Registration"
                value={booking.vehicle?.registration_number}
              />
              <DetailRow label="Garage" value={booking.garage?.garage_name} />
              {/* <DetailRow label="Status" value={booking.status} /> */}
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">
              Booking Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              <div>
                <DetailRow
                  label="Status"
                  value={booking.status ? String(booking.status) : "N/A"}
                />
                <DetailRow
                  label="Date"
                  value={
                    booking.order_date
                      ? new Date(booking.order_date).toLocaleDateString("en-GB")
                      : "N/A"
                  }
                />
                <DetailRow
                  label="Time"
                  value={
                    booking.slot?.start_datetime && booking.slot?.end_datetime
                      ? `${format(new Date(booking.slot.start_datetime), "HH:mm")} - ${format(new Date(booking.slot.end_datetime), "HH:mm")}`
                      : booking.order_time || "N/A"
                  }
                />
                {booking.cancel_reason || booking.cancelled_by ? (
                  <>
                    <DetailRow
                      label="Cancelled By"
                      value={
                        booking.cancelled_by
                          ? String(booking.cancelled_by)
                          : "N/A"
                      }
                    />
                    <DetailRow
                      label="Cancel Reason"
                      value={
                        booking.cancel_reason
                          ? String(booking.cancel_reason)
                          : "N/A"
                      }
                    />
                  </>
                ) : null}
              </div>
              <div>
                <DetailRow
                  label="Total Amount"
                  value={`£${booking.total_amount}`}
                />
                <DetailRow
                  label="Created At"
                  value={
                    booking.created_at
                      ? new Date(booking.created_at).toLocaleString("en-GB")
                      : "N/A"
                  }
                />
              </div>
            </div>

            {orderHistories.length > 0 ? (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Booking History
                </h4>

                <div className="space-y-3">
                  {orderHistories.map((h: any) => {
                    const actor = h.actor_type
                      ? String(h.actor_type).toLowerCase()
                      : "unknown";
                    const actorLabel =
                      actor === "driver"
                        ? "Driver"
                        : actor === "garage"
                          ? "Garage"
                          : actor === "admin"
                            ? "Admin"
                            : String(h.actor_type || "Unknown");

                    const eventType =
                      h.event_type === "RESCHEDULED"
                        ? "Rescheduled"
                        : h.event_type === "CANCELLED"
                          ? "Cancelled"
                          : h.event_type || "Updated";

                    return (
                      <div
                        key={h.id || `${h.event_type}-${h.created_at}`}
                        className="rounded-lg bg-gray-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-gray-900">
                            {eventType} by {actorLabel}
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDate(h.created_at)} {formatTime(h.created_at)}
                          </div>
                        </div>

                        {h.event_type === "RESCHEDULED" ? (
                          <div className="mt-2 text-xs text-gray-700 space-y-1">
                            <div>
                              <span className="font-medium">Original:</span>{" "}
                              {formatDate(h.old_start_datetime)}{" "}
                              {formatTime(h.old_start_datetime)} -{" "}
                              {formatDate(h.old_end_datetime)} {formatTime(h.old_end_datetime)}
                            </div>
                            <div>
                              <span className="font-medium">New:</span>{" "}
                              {formatDate(h.new_start_datetime)}{" "}
                              {formatTime(h.new_start_datetime)} -{" "}
                              {formatDate(h.new_end_datetime)} {formatTime(h.new_end_datetime)}
                            </div>
                            {h.reason ? (
                              <div>
                                <span className="font-medium">Reason:</span>{" "}
                                {String(h.reason)}
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {h.event_type === "CANCELLED" ? (
                          <div className="mt-2 text-xs text-gray-700 space-y-1">
                            {h.old_start_datetime || h.old_end_datetime ? (
                              <div>
                                <span className="font-medium">Booking time:</span>{" "}
                                {formatDate(h.old_start_datetime)}{" "}
                                {formatTime(h.old_start_datetime)} -{" "}
                                {formatDate(h.old_end_datetime)} {formatTime(h.old_end_datetime)}
                              </div>
                            ) : null}
                            {h.reason ? (
                              <div>
                                <span className="font-medium">Reason:</span>{" "}
                                {String(h.reason)}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No booking details found.
        </div>
      )}
      <div className="flex justify-end mt-6">
        <Button
          onClick={onClose}
          className="cursor-pointer bg-[#19CA32] hover:bg-[#16b82e]"
        >
          Close
        </Button>
      </div>
    </CustomReusableModal>
  );
};

export default function ManageBookings() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector(
    (state) => state.bookingManagement,
  );

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [activeTab, setActiveTab] = useState<string>(filters.status || "");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    bookingId: string | null;
    newStatus: string | null;
    bookingName: string | null;
  }>({
    isOpen: false,
    bookingId: null,
    newStatus: null,
    bookingName: null,
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    bookingName: string | null;
  }>({
    isOpen: false,
    bookingId: null,
    bookingName: null,
  });
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
  }>({
    isOpen: false,
    bookingId: null,
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Update Redux when search changes
  useEffect(() => {
    dispatch(setSearchFilter(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Reset to first page when search, tab, or date changes
  useEffect(() => {
    dispatch(setCurrentPage(1));
  }, [debouncedSearch, activeTab, startDate, endDate, dispatch]);

  // Fetch bookings data
  const {
    data: bookingsData,
    isLoading,
    refetch,
  } = useGetAllBookingsQuery({
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
    search: debouncedSearch || undefined,
    status: activeTab || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateBookingStatusMutation();
  const [deleteBooking, { isLoading: isDeleting }] = useDeleteBookingMutation();

  const handleViewDetails = (id: string) => {
    setDetailsModal({
      isOpen: true,
      bookingId: id,
    });
  };

  const handleDeleteClick = (id: string) => {
    const booking = bookings.find((b: any) => b.id === id);
    setDeleteModal({
      isOpen: true,
      bookingId: id,
      bookingName: booking?.driver?.name
        ? `for ${booking.driver.name}`
        : "this booking",
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.bookingId) return;
    try {
      await deleteBooking(deleteModal.bookingId).unwrap();
      toast.success("Booking deleted successfully");
      setDeleteModal({ isOpen: false, bookingId: null, bookingName: null });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete booking");
    }
  };

  // Update Redux pagination when API data changes
  useEffect(() => {
    if (bookingsData?.data?.pagination) {
      dispatch(
        setPagination({
          totalItems: bookingsData.data.pagination.total || 0,
          totalPages: bookingsData.data.pagination.pages || 1,
        }),
      );
    }
  }, [bookingsData, dispatch]);

  const bookings = bookingsData?.data?.bookings || [];
  const totalPages = bookingsData?.data?.pagination?.pages || 1;
  const totalItems = bookingsData?.data?.pagination?.total || 0;

  const handleTabChange = (tabKey: string) => {
    const status = tabKey === "all" ? "" : tabKey;
    setActiveTab(status);
    dispatch(setStatusFilter(status));
    dispatch(setCurrentPage(1));
  };

  const handleStatusUpdateClick = (id: string, newStatus: string) => {
    const booking = bookings.find((b: any) => b.id === id);
    const statusValue = String(newStatus).trim().toUpperCase();
    setConfirmModal({
      isOpen: true,
      bookingId: id,
      newStatus: statusValue,
      bookingName: booking?.driver?.name || "Booking",
    });
  };

  const handleConfirmStatusUpdate = async () => {
    if (!confirmModal.bookingId || !confirmModal.newStatus) return;

    try {
      const statusToSend = String(confirmModal.newStatus).trim().toUpperCase();

      const validStatuses = [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "COMPLETED",
        "CANCELLED",
      ];
      if (!validStatuses.includes(statusToSend)) {
        toast.error(`Invalid status: ${statusToSend}`);
        return;
      }

      const response = await updateStatus({
        id: confirmModal.bookingId,
        status: statusToSend,
      }).unwrap();

      toast.success(
        response?.message || "Booking status updated successfully!",
      );
      setConfirmModal({
        isOpen: false,
        bookingId: null,
        newStatus: null,
        bookingName: null,
      });
      refetch();
    } catch (error: any) {
      const errorMessage = Array.isArray(error?.data?.message)
        ? error.data.message.join(", ")
        : error?.data?.message || "Failed to update booking status";
      toast.error(errorMessage);
      setConfirmModal({
        isOpen: false,
        bookingId: null,
        newStatus: null,
        bookingName: null,
      });
    }
  };

  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      bookingId: null,
      newStatus: null,
      bookingName: null,
    });
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    dispatch(setItemsPerPage(itemsPerPage));
  };

  // Define tabs with counts
  const tabs = [
    {
      key: "all",
      label: "All Bookings",
      count: totalItems,
    },
    ...STATUS_OPTIONS.map((status) => ({
      key: status.value,
      label: status.label,
      count: bookings.filter(
        (b: any) => b.status?.toUpperCase() === status.value,
      ).length,
    })),
  ];

  const columns = [
    {
      key: "driver_name",
      label: "Customer Name",
      width: "15%",
      render: (value: string, row: any) => (
        <span className={row?.status?.toUpperCase() === "CANCELLED" ? "text-gray-400" : ""}>
          {row?.driver?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "registration_number",
      label: "Registration Number",
      width: "15%",
      render: (value: string, row: any) => (
        <span className={row?.status?.toUpperCase() === "CANCELLED" ? "text-gray-400" : ""}>
          {row?.vehicle?.registration_number || "N/A"}
        </span>
      ),
    },
    {
      key: "driver_email",
      label: "Email",
      width: "15%",
      render: (value: string, row: any) => (
        <span className={row?.status?.toUpperCase() === "CANCELLED" ? "text-gray-400" : ""}>
          {row?.driver?.email || "N/A"}
        </span>
      ),
    },
    {
      key: "driver_phone",
      label: "Contact Number",
      width: "15%",
      render: (value: string, row: any) => (
        <span className={row?.status?.toUpperCase() === "CANCELLED" ? "text-gray-400" : ""}>
          {row?.driver?.phone_number || "N/A"}
        </span>
      ),
    },
    {
      key: "garage_name",
      label: "Garage",
      width: "15%",
      render: (value: string, row: any) => (
        <span className={row?.status?.toUpperCase() === "CANCELLED" ? "text-gray-400" : ""}>
          {row?.garage?.garage_name || "N/A"}
        </span>
      ),
    },
    {
      key: "order_date",
      label: "Booking Date",
      width: "12%",
      render: (value: string, row: any) => {
        const dateValue = row?.order_date || value;
        if (!dateValue) return "N/A";
        try {
          const formatted = new Date(dateValue).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          return (
            <span className={row?.status?.toUpperCase() === "CANCELLED" ? "text-gray-400" : ""}>
              {formatted}
            </span>
          );
        } catch {
          return dateValue;
        }
      },
    },
    {
      key: "total_amount",
      label: "Total",
      width: "10%",
      render: (value: number | string, row: any) => {
        const amount = row?.total_amount || value;
        if (!amount) return "$0.00";
        const numValue =
          typeof amount === "string" ? parseFloat(amount) : amount;
        return (
          <span className={row?.status?.toUpperCase() === "CANCELLED" ? "text-gray-400" : ""}>
            {`£${numValue.toFixed(2)}`}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Manage",
      width: "10%",
      truncate: false,
      render: (value: string, row: any) => (
        row?.status?.toUpperCase() === "CANCELLED" ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded border border-red-500 px-2 py-1 text-sm font-medium text-red-500">
              Cancelled
            </span>
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-8 cursor-pointer p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(row.id);
              }}
              aria-label="View booking details"
              title="View booking details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <ActionsDropdown
            row={row}
            onStatusUpdate={handleStatusUpdateClick}
            onViewDetails={handleViewDetails}
            onDeleteClick={handleDeleteClick}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        )
      ),
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED":
        return <CheckCircle2 className="h-5 w-5" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5" />;
      case "PENDING":
        return <Clock className="h-5 w-5" />;
      case "CANCELLED":
        return <Ban className="h-5 w-5" />;
      case "COMPLETED":
        return <Check className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED":
      case "COMPLETED":
        return "success";
      case "REJECTED":
      case "CANCELLED":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">View All Bookings</h1>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mb-4">
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

      {/* Tabs and Search */}
      <div className="flex flex-col w-full xl:flex-row xl:items-center xl:justify-end gap-4 mb-4">
        {/* Tabs on the left */}
        {/* <nav className="flex flex-wrap gap-2 lg:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-1 rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${
                (activeTab === "" && tab.key === "all") || activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav> */}

        {/* Search on the right */}
        <div className="relative w-full xl:w-auto xl:max-w-md">
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
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full xl:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <>
        <ReusableTable
          data={bookings}
          columns={columns}
          className="mt-5"
          isLoading={isLoading}
          skeletonRows={pagination.itemsPerPage}
        />
        {!isLoading && (
          <ReusablePagination
            currentPage={pagination.currentPage}
            totalPages={totalPages}
            itemsPerPage={pagination.itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            className=""
          />
        )}
      </>

      {/* Status Update Confirmation Modal */}
      <CustomReusableModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        title={`Update Booking Status`}
        variant={getStatusVariant(confirmModal.newStatus || "")}
        icon={
          confirmModal.newStatus
            ? getStatusIcon(confirmModal.newStatus)
            : undefined
        }
        description={`Are you sure you want to update the booking status?`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to change the status of booking "
            {confirmModal.bookingName}" to{" "}
            <span className="font-semibold">
              {STATUS_OPTIONS.find((s) => s.value === confirmModal.newStatus)
                ?.label || confirmModal.newStatus}
            </span>
            .
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isUpdating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusUpdate}
              disabled={isUpdating}
              className={`cursor-pointer ${
                getStatusVariant(confirmModal.newStatus || "") === "success"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : getStatusVariant(confirmModal.newStatus || "") === "danger"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
              }`}
            >
              {isUpdating ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </span>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </CustomReusableModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, bookingId: null, bookingName: null })
        }
        onConfirm={handleConfirmDelete}
        title="Delete Booking"
        description={`Are you sure you want to delete the booking ${deleteModal.bookingName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, bookingId: null })}
        bookingId={detailsModal.bookingId}
      />
    </>
  );
}
