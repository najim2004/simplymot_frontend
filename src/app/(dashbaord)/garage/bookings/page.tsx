"use client";
import React, { useState, useEffect } from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import {
  MoreVertical,
  AlertTriangle,
  Calendar,
  Clock,
  Plus,
  CalendarIcon,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useRescheduleBookingMutation,
  useCancelBookingMutation,
} from "@/features/garage";
import { Booking } from "@/features/garage";
import { toast } from "react-toastify";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetSlotDetailsQuery } from "@/features/garage";
import { cn } from "@/lib/utils";
import { printGarageBookingDetails } from "@/lib/print-garage-booking";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    status: string | null;
    bookingName: string | null;
  }>({
    isOpen: false,
    bookingId: null,
    status: null,
    bookingName: null,
  });

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    bookingName: string | null;
  }>({
    isOpen: false,
    bookingId: null,
    bookingName: null,
  });
  const [cancelReason, setCancelReason] = useState("");

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Reset to first page when search, tab, or date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, startDate, endDate]);

  // Get bookings from API with debounced search
  const {
    data: bookingsData,
    isLoading,
    isError,
    refetch,
  } = useGetBookingsQuery({
    search: debouncedSearch,
    status: activeTab === "all" ? "" : activeTab.toUpperCase(),
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Update status mutation
  const [updateBookingStatus, { isLoading: isUpdating }] =
    useUpdateBookingStatusMutation();

  // Reschedule booking mutation
  const [rescheduleBooking, { isLoading: isRescheduling }] =
    useRescheduleBookingMutation();

  // Cancel booking mutation
  const [cancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation();

  // Reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({ isOpen: false, booking: null });
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");

  // View detail modal state
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({ isOpen: false, booking: null });

  // Fetch slots for selected date (garage perspective)
  const { data: slotResponse, isLoading: slotsLoading } =
    useGetSlotDetailsQuery(rescheduleDate, {
      skip: !rescheduleModal.isOpen || !rescheduleDate,
    });

  const slotData: any = (slotResponse as any)?.success
    ? (slotResponse as any).data
    : null;
  const slots: any[] = slotData?.slots || [];

  const formatTime = (time: string | null | undefined): string => {
    if (!time) return "--:--";
    try {
      const [hours, minutes] = time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return "--:--";
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`;
    } catch (error) {
      return "--:--";
    }
  };

  const formatOrderDateTime = (orderDate: string) =>
    new Date(orderDate).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const openReschedule = (booking: Booking) => {
    setRescheduleModal({ isOpen: true, booking });
    // Set default date to the original booking date instead of today
    const bookingDate = new Date(booking.order_date);
    const bookingDateStr = bookingDate.toISOString().split("T")[0];
    setRescheduleDate(bookingDateStr);
    setSelectedSlotId(null);
    setSelectedSlot(null);
  };

  const closeReschedule = () => {
    setRescheduleModal({ isOpen: false, booking: null });
    setRescheduleDate("");
    setSelectedSlotId(null);
    setSelectedSlot(null);
    setRescheduleReason("");
  };

  const handleSelectSlot = (slot: any) => {
    // Determine if slot is selectable
    const statuses: string[] = Array.isArray(slot.status) ? slot.status : [];
    const isBooked = statuses.includes("BOOKED");
    const isBlocked = statuses.includes("BLOCKED");
    const isBreak = statuses.includes("BREAK");
    const isHoliday = statuses.includes("HOLIDAY");

    // Past check
    const [start] = (slot.time || "").split("-");
    let isPast = false;
    if (rescheduleDate && start) {
      const [h, m] = start.split(":").map(Number);
      const dt = new Date(rescheduleDate);
      dt.setHours(h || 0, m || 0, 0, 0);
      isPast = dt < new Date();
    }

    const isAvailable =
      !isBooked && !isBlocked && !isBreak && !isHoliday && !isPast;
    if (!isAvailable) return;
    setSelectedSlotId(slot.id || slot.time);
    setSelectedSlot(slot);
  };

  const handleSubmitReschedule = async () => {
    if (!rescheduleModal.booking || !rescheduleDate || !selectedSlot) {
      toast.warn("Please select date and time slot");
      return;
    }

    const [startTime, endTime] = (selectedSlot.time || "-").split("-");

    try {
      await rescheduleBooking({
        booking_id: rescheduleModal.booking.id,
        slot_id: selectedSlot.id,
        date: rescheduleDate,
        start_time: startTime,
        end_time: endTime,
        reason: rescheduleReason.trim(),
      }).unwrap();
      toast.success("Booking rescheduled successfully");
      closeReschedule();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reschedule booking");
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
                "h-11 w-full justify-start pr-10 text-left font-normal sm:min-w-[200px]",
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
            <CalendarPicker
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

  const DateFilter = ({
    label,
    date,
    onDateChange,
  }: {
    label: string;
    date: Date | undefined;
    onDateChange: (date: Date | undefined) => void;
  }) => (
    <div className="w-full sm:w-auto">
      <label className="block text-xs font-medium text-gray-700 mb-1 sr-only">
        {label}
      </label>
      <DatePicker
        date={date}
        onDateChange={onDateChange}
        placeholder={label}
      />
    </div>
  );

  // Define table columns
  const columns = [
    {
      key: "__info",
      label: "Info",
      width: "72px",
      truncate: false,
      render: (_: unknown, row: Booking) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setViewModal({ isOpen: true, booking: row });
          }}
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-transparent text-gray-600 transition-all",
            "hover:bg-[#19CA32]/25 hover:text-[#158a26] hover:ring-2 hover:ring-[#19CA32]/60 hover:shadow-sm hover:scale-110 active:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19CA32] focus-visible:ring-offset-2",
          )}
          aria-label="View booking details"
        >
          <Plus className="h-5 w-5" strokeWidth={2.25} />
        </button>
      ),
    },
    {
      key: "driver.name",
      label: "Customer",
      render: (value: any, row: Booking) => (
        <span className={row.status === "CANCELLED" ? "text-gray-400" : ""}>
          {row.driver?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "vehicle.registration_number",
      label: "Vehicle Registration",
      render: (value: any, row: Booking) => (
        <span className={row.status === "CANCELLED" ? "text-gray-400" : ""}>
          {row.vehicle?.registration_number || "N/A"}
        </span>
      ),
    },
    {
      key: "driver.email",
      label: "Email",
      render: (value: any, row: Booking) => (
        <span className={row.status === "CANCELLED" ? "text-gray-400" : ""}>
          {row.driver?.email || "N/A"}
        </span>
      ),
    },
    {
      key: "driver.phone_number",
      label: "Number",
      render: (value: any, row: Booking) => (
        <span className={row.status === "CANCELLED" ? "text-gray-400" : ""}>
          {row.driver?.phone_number || "N/A"}
        </span>
      ),
    },
    {
      key: "order_date",
      label: "Booking Date",
      render: (value: string, row: Booking) => {
        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString().slice(-2);
        return (
          <span className={row.status === "CANCELLED" ? "text-gray-400" : ""}>
            {`${day}/${month}/${year}`}
          </span>
        );
      },
    },
    {
      key: "order_time",
      label: "Time",
      render: (value: any, row: Booking) => {
        const timeStr = formatOrderDateTime(row.order_date);
        return (
          <span className={row.status === "CANCELLED" ? "text-gray-400" : ""}>
            {timeStr}
          </span>
        );
      },
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (value: string, row: Booking) => (
        <span className={row.status === "CANCELLED" ? "text-gray-400" : ""}>
          {`£${parseFloat(value || "0").toFixed(2)}`}
        </span>
      ),
    },
  ];

  // Define tabs with counts
  // const tabs = [
  //   {
  //     key: "all",
  //     label: "All Order",
  //     count: bookingsData?.pagination?.total || 0,
  //   },
  //   {
  //     key: "pending",
  //     label: "Pending",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "PENDING")
  //         .length || 0,
  //   },
  //   {
  //     key: "accepted",
  //     label: "Accepted",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "ACCEPTED")
  //         .length || 0,
  //   },
  //   {
  //     key: "completed",
  //     label: "Completed",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "COMPLETED")
  //         .length || 0,
  //   },
  //   {
  //     key: "cancelled",
  //     label: "Cancelled",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "CANCELLED")
  //         .length || 0,
  //   },
  //   {
  //     key: "rejected",
  //     label: "Rejected",
  //     count:
  //       bookingsData?.data?.filter((booking) => booking.status === "REJECTED")
  //         .length || 0,
  //   },
  // ];

  // Get table data from API response
  const tableData = bookingsData?.data || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  // Handle handleCancelClick
  const handleCancelClick = (id: string, bookingName: string) => {
    setCancelModal({
      isOpen: true,
      bookingId: id,
      bookingName: bookingName,
    });
    setCancelReason("");
  };

  const handleCancelSubmit = async () => {
    if (!cancelModal.bookingId) return;
    if (!cancelReason.trim()) {
      toast.warn("Please provide a reason for cancellation");
      return;
    }

    try {
      await cancelBooking({
        id: cancelModal.bookingId,
        reason: cancelReason.trim(),
      }).unwrap();
      toast.success("Booking cancelled successfully");
      setCancelModal({ isOpen: false, bookingId: null, bookingName: null });
      setCancelReason("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel booking");
    }
  };

  const closeCancelModal = () => {
    setCancelModal({ isOpen: false, bookingId: null, bookingName: null });
    setCancelReason("");
  };

  // Action dropdown component
  const ActionDropdown = ({
    row,
    onReschedule,
  }: {
    row: Booking;
    onReschedule: (row: Booking) => void;
  }) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    const handleActionClick = (
      action: "CANCELLED"
    ) => {
      setDropdownOpen(false);
      setTimeout(() => {
        if (!isCancelling && action === "CANCELLED") {
          handleCancelClick(row.id, row.driver?.name || "Booking");
        }
      }, 150);
    };

    const isPending = row.status === "PENDING";
    const isAccepted = row.status === "ACCEPTED";
    const isRejected = row.status === "REJECTED";
    const isCancelled = row.status === "CANCELLED";
    const isCompleted = row.status === "COMPLETED";

    // If it's a final state, don't show any actions
    if (isRejected || isCancelled || isCompleted) {
      return null;
    }

    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 cursor-pointer text-gray-600 transition-all hover:bg-[#19CA32]/25 hover:text-[#158a26] hover:ring-2 hover:ring-[#19CA32]/60 hover:shadow-sm"
            disabled={isUpdating}
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
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              onReschedule(row);
            }}
            className="cursor-pointer"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick("CANCELLED");
            }}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Cancel
          </DropdownMenuItem>
          {/* actions block end */}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Define actions with dropdown
  const actions = [
    {
      label: "Manage",
      render: (row: Booking) =>
        row.status === "CANCELLED" ? (
          <span className="text-red-500 font-medium text-sm border border-red-500 rounded p-1">Cancelled</span>
        ) : (
          <ActionDropdown row={row} onReschedule={openReschedule} />
        ),
    },
  ];

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          List of all Bookings
        </h1>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-4 mb-4">
        {/* Tabs on the left */}
        {/* <div className="flex flex-wrap gap-2 sm:gap-4 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm overflow-x-auto"> */}
        {/* {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 sm:px-4 py-1 rounded-[6px] cursor-pointer font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div> */}

        {/* Date Filter and Search on the right */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
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
          <div className="relative w-full sm:w-auto sm:max-w-md sm:self-end">
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
              className="block h-11 w-full sm:w-80 pl-10 pr-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && !isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600">
              Error loading bookings. Please try again.
            </p>
            <Button onClick={() => refetch()} className="mt-4 cursor-pointer">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && tableData.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-600 text-lg">No bookings found</p>
            <p className="text-gray-500 text-sm mt-2">
              Bookings will appear here once created
            </p>
          </div>
        </div>
      )}

      {/* Table - show when loading or has data */}
      {(isLoading || (!isError && tableData.length > 0)) && (
        <>
          <ReusableTable
            data={tableData}
            columns={columns}
            actions={actions}
            actionsColumnLabel="Manage"
            className=""
            isLoading={isLoading}
            skeletonRows={itemsPerPage}
          />

          {!isLoading && (
            <ReusablePagination
              currentPage={currentPage}
              totalPages={bookingsData?.pagination?.totalPages || 1}
              itemsPerPage={itemsPerPage}
              totalItems={bookingsData?.pagination?.total || 0}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              className=""
            />
          )}
        </>
      )}

      {/* Cancel Modal */}
      <CustomReusableModal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        title="Cancel Booking"
        showHeader={false}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
            Cancel Booking
          </h3>
          <p className="text-sm text-center text-gray-500 mb-6">
            Are you sure you want to cancel the booking for <span className="font-semibold text-gray-700">{cancelModal.bookingName}</span>?
            This will release the time slot and notify the customer.
          </p>

          <div className="mb-6">
            <Label htmlFor="cancelReason" className="mb-2 block text-sm font-medium text-gray-700">Reason for Cancellation</Label>
            <textarea
              id="cancelReason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a brief reason for cancellation (sent to customer)"
              className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={closeCancelModal}
              disabled={isCancelling}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              variant="default"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCancelSubmit}
              disabled={isCancelling || !cancelReason.trim()}
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </div>
        </div>
      </CustomReusableModal>

      {/* Reschedule Modal */}
      <CustomReusableModal
        isOpen={rescheduleModal.isOpen}
        onClose={closeReschedule}
        title="Reschedule Booking"
        showHeader={false}
        className="max-w-3xl w-full mx-4"
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#19CA32] to-[#16b82e] text-white p-4 shadow-md">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Reschedule Booking</h2>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitReschedule();
            }}
            className="p-6 sm:p-8 overflow-y-auto max-h-[80vh]"
          >
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  Select Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setSelectedSlotId(null);
                    setSelectedSlot(null);
                  }}
                  className="w-full h-11 border-gray-300 focus:border-[#19CA32] focus:ring-[#19CA32] cursor-pointer"
                />
                {rescheduleDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected:{" "}
                    {(() => {
                      const date = new Date(rescheduleDate);
                      const day = date.getDate().toString().padStart(2, "0");
                      const month = (date.getMonth() + 1)
                        .toString()
                        .padStart(2, "0");
                      const year = date.getFullYear().toString().slice(-2);
                      return `${day}/${month}/${year}`;
                    })()}
                  </p>
                )}
              </div>

              {rescheduleDate && (
                <div>
                  <Label className="text-sm font-medium text-foreground mb-3 block">
                    Available Time Slots{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  {slotsLoading ? (
                    <div className="text-center py-6 text-muted-foreground bg-muted rounded-xl border-2 border-dashed border-border">
                      Loading available slots...
                    </div>
                  ) : slots && Array.isArray(slots) && slots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                      {slots.map((slot: any, idx: number) => {
                        const statuses: string[] = Array.isArray(slot.status)
                          ? slot.status
                          : [];
                        const isBooked = statuses.includes("BOOKED");
                        const isBlocked = statuses.includes("BLOCKED");
                        const isBreak = statuses.includes("BREAK");
                        const isHoliday = statuses.includes("HOLIDAY");

                        const [start, end] = (slot.time || "-").split("-");

                        // Past check
                        let isPast = false;
                        if (rescheduleDate && start) {
                          const [h, m] = start.split(":").map(Number);
                          const dt = new Date(rescheduleDate);
                          dt.setHours(h || 0, m || 0, 0, 0);
                          isPast = dt < new Date();
                        }

                        const isAvailable =
                          !isBooked &&
                          !isBlocked &&
                          !isBreak &&
                          !isHoliday &&
                          !isPast;

                        return (
                          <button
                            key={slot.id || `${slot.time}-${idx}`}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            disabled={!isAvailable || isRescheduling}
                            className={cn(
                              "group relative px-4 py-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-2.5 min-h-[100px]",
                              isBooked
                                ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                : isBreak
                                  ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                  : isPast
                                    ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                    : "cursor-pointer hover:border-[#19CA32] hover:bg-[#19CA32]/10 hover:shadow-md hover:scale-105 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:ring-offset-2",
                              selectedSlotId === (slot.id || slot.time) &&
                                isAvailable
                                ? "border-[#19CA32] bg-[#19CA32] text-white shadow-lg ring-2 ring-[#19CA32]/30 scale-105"
                                : isAvailable &&
                                    "border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-[#19CA32]/5",
                              (isRescheduling || isBooked || isBreak) &&
                                "hover:scale-100",
                            )}
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                !isAvailable
                                  ? "bg-muted"
                                  : selectedSlotId === (slot.id || slot.time)
                                    ? "bg-white/25"
                                    : "bg-muted group-hover:bg-accent"
                              }`}
                            >
                              <Clock
                                className={`h-5 w-5 ${
                                  !isAvailable
                                    ? "text-muted-foreground"
                                    : selectedSlotId === (slot.id || slot.time)
                                      ? "text-primary-foreground"
                                      : "text-foreground"
                                }`}
                              />
                            </div>
                            <div className="text-center">
                              {!isAvailable ? (
                                <span className="font-semibold text-sm text-muted-foreground">
                                  {isBooked
                                    ? "BOOKED"
                                    : isBlocked
                                      ? "BLOCKED"
                                      : isBreak
                                        ? "BREAK"
                                        : isHoliday
                                          ? "HOLIDAY"
                                          : "PAST"}
                                </span>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <span
                                    className={
                                      selectedSlotId === (slot.id || slot.time)
                                        ? "font-semibold text-primary-foreground"
                                        : "font-semibold text-foreground"
                                    }
                                  >
                                    {formatTime(start)}
                                  </span>
                                  <span
                                    className={
                                      selectedSlotId === (slot.id || slot.time)
                                        ? "text-primary-foreground/70 text-xs"
                                        : "text-muted-foreground text-xs"
                                    }
                                  >
                                    -
                                  </span>
                                  <span
                                    className={
                                      selectedSlotId === (slot.id || slot.time)
                                        ? "font-semibold text-primary-foreground"
                                        : "font-semibold text-foreground"
                                    }
                                  >
                                    {formatTime(end)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {selectedSlotId === (slot.id || slot.time) &&
                              isAvailable && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <svg
                                      className="w-3 h-3 text-primary"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-200">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="font-medium text-base">
                        {slots
                          ? "No slots available for this date"
                          : "Select a date to view available slots"}
                      </p>
                      {slots && (
                        <p className="text-sm text-gray-400 mt-1">
                          Please try selecting another date
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100">
                <div className="mb-4">
                  <Label htmlFor="rescheduleReason" className="mb-2 block text-sm font-medium text-gray-700">Optional: Reason for Rescheduling</Label>
                  <textarea
                    id="rescheduleReason"
                    rows={2}
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="E.g. Garage unexpectedly closed, mechanic sick..."
                    className="w-full flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeReschedule}
                    className="w-1/3 py-4 text-gray-600 border-gray-200"
                    disabled={isRescheduling}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmitReschedule();
                    }}
                    disabled={!selectedSlotId || isRescheduling}
                    className="w-2/3 cursor-pointer bg-gradient-to-r from-[#19CA32] to-[#16b82e] hover:from-[#16b82e] hover:to-[#14a828] text-white font-semibold py-4 text-base rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isRescheduling ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Rescheduling...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Confirm Reschedule
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </CustomReusableModal>

      {/* Confirmation Modal */}
      {/* <CustomReusableModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        title={
          confirmModal.status === "ACCEPTED"
            ? "Accept Booking"
            : confirmModal.status === "REJECTED"
            ? "Reject Booking"
            : confirmModal.status === "COMPLETED"
            ? "Complete Booking"
            : confirmModal.status === "CANCELLED"
            ? "Cancel Booking"
            : "Unknown"
        }
        variant={
          confirmModal.status === "ACCEPTED"
            ? "success"
            : confirmModal.status === "REJECTED"
            ? "danger"
            : confirmModal.status === "COMPLETED"
            ? "success"
            : confirmModal.status === "CANCELLED"
            ? "danger"
            : "default"
        }
        icon={
          confirmModal.status === "ACCEPTED" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )
        }
        description={`Are you sure you want to ${confirmModal.status?.toLowerCase()} this booking?`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {confirmModal.status === "ACCEPTED"
              ? `You are about to accept the booking for ${confirmModal.bookingName}. This action cannot be undone.`
              : confirmModal.status === "REJECTED"
              ? `You are about to reject the booking for ${confirmModal.bookingName}. This action cannot be undone.`
              : confirmModal.status === "COMPLETED"
              ? `You are about to complete the booking for ${confirmModal.bookingName}. This action cannot be undone.`
              : confirmModal.status === "CANCELLED"
              ? `You are about to cancel the booking for ${confirmModal.bookingName}. This action cannot be undone.`
              : `You are about to ${confirmModal.status?.toLowerCase()} the booking for ${
                  confirmModal.bookingName
                }. This action cannot be undone.`}
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className={
                confirmModal.status === "ACCEPTED"
                  ? "bg-green-600 cursor-pointer hover:bg-green-700 text-white"
                  : "bg-red-600 cursor-pointer hover:bg-red-700 text-white"
              }
            >
              {isUpdating
                ? "Processing..."
                : confirmModal.status === "ACCEPTED"
                ? "Accept"
                : confirmModal.status === "REJECTED"
                ? "Reject"
                : confirmModal.status === "COMPLETED"
                ? "Complete"
                : confirmModal.status === "CANCELLED"
                ? "Cancel"
                : "Unknown"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              disabled={isUpdating}
              className="cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CustomReusableModal> */}
      {/* Booking Detail Modal */}
      <CustomReusableModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, booking: null })}
        title="Booking Details"
        showHeader={false}
        className="max-w-lg w-full mx-4"
      >
        {viewModal.booking && (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#19CA32] to-[#16b82e] text-white p-4 shadow-md">
              <h2 className="text-xl font-semibold text-center">
                Booking Details
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {(
                [
                  ["Customer", viewModal.booking.driver?.name || "N/A"],
                  ["Email", viewModal.booking.driver?.email || "N/A"],
                  ["Contact", viewModal.booking.driver?.phone_number || "N/A"],
                  [
                    "Vehicle",
                    viewModal.booking.vehicle?.registration_number || "N/A",
                  ],
                  [
                    "Date",
                    (() => {
                      const d = new Date(viewModal.booking.order_date);
                      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
                    })(),
                  ],
                  ["Time", formatOrderDateTime(viewModal.booking.order_date)],
                  [
                    "Amount",
                    `£${parseFloat(viewModal.booking.total_amount || "0").toFixed(2)}`,
                  ],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 border-b border-gray-100 text-sm"
                >
                  <span className="text-gray-500 font-medium">{label}</span>
                  <span className="text-gray-900 font-semibold text-right max-w-[60%]">
                    {value}
                  </span>
                </div>
              ))}
              <div className="py-2 text-sm">
                <span className="text-gray-500 font-medium block mb-1">
                  Additional Services
                </span>
                <div className="bg-gray-50 rounded-lg p-3 text-gray-900 border border-gray-200 min-h-[40px]">
                  {viewModal.booking.additional_services || (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (
                    viewModal.booking &&
                    !printGarageBookingDetails(viewModal.booking)
                  ) {
                    toast.warn(
                      "Unable to open print dialog. Please try again.",
                    );
                  }
                }}
                className="w-full py-2 rounded-lg border border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-medium text-sm transition-colors"
              >
                Print
              </button>
              <button
                type="button"
                onClick={() => setViewModal({ isOpen: false, booking: null })}
                className="w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CustomReusableModal>
    </div>
  );
}
