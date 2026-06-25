"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { 
  useGetMyBookingsQuery,
  useCancelMyBookingMutation,
  useRescheduleMyBookingMutation,
  useGetGarageSlotsQuery
} from "@/rtk/api/driver/bookMyMotApi";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, AlertTriangle, Calendar, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// Booking data interface based on API response
interface BookingData {
  id: string;
  garage_name?: string;
  garageName?: string;
  location?: string;
  address?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  bookingDate?: string;
  date?: string;
  slot_date?: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  totalAmount?: number;
  amount?: number;
  price?: number;
  status: string;
  vehicle_id?: string;
  vehicle_registration?: string;
  registration_number?: string;
  order_id?: string;
  garage_id?: string;
  [key: string]: any;
}

export default function MyBookings() {
  //   const dispatch = useDispatch();
  //   const myBookingsFromSlice = useSelector(selectMyBookings);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    booking: BookingData | null;
  }>({ isOpen: false, booking: null });

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    bookingId: string | null;
    garageName: string | null;
  }>({ isOpen: false, bookingId: null, garageName: null });
  const [cancelReason, setCancelReason] = useState("");

  // Reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    booking: BookingData | null;
  }>({ isOpen: false, booking: null });
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Mutations
  const [cancelBooking, { isLoading: isCancelling }] = useCancelMyBookingMutation();
  const [rescheduleBooking, { isLoading: isRescheduling }] = useRescheduleMyBookingMutation();

  // Fetch slots for selected date (driver perspective)
  const { data: slotResponse, isLoading: slotsLoading } =
    useGetGarageSlotsQuery(
      { id: rescheduleModal.booking?.garage_id || "", date: rescheduleDate },
      {
        skip:
          !rescheduleModal.isOpen ||
          !rescheduleDate ||
          !rescheduleModal.booking?.garage_id,
      },
    );

  // Handle both possible structures (RTK transform result vs potential raw result)
  const slots: any[] = useMemo(() => {
    if (!slotResponse) return [];
    if ((slotResponse as any).slots) return (slotResponse as any).slots;
    if (Array.isArray(slotResponse)) return slotResponse;
    if ((slotResponse as any).data && Array.isArray((slotResponse as any).data)) return (slotResponse as any).data;
    return [];
  }, [slotResponse]);

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

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Determine status for API call - API expects 'all', 'pending', 'accepted', or 'rejected'
  const statusForApi = activeTab;

  // Fetch bookings from API
  const {
    data: bookingsResponse,
    isLoading,
    error,
    refetch,
  } = useGetMyBookingsQuery({
    search: debouncedSearch,
    status: statusForApi,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Store bookings in Redux slice when data is fetched
  // useEffect(() => {
  //     if (bookingsResponse) {
  //         const responseData = (bookingsResponse as any)?.data || bookingsResponse
  //         if (responseData?.bookings) {
  //             dispatch(setMyBookings({
  //                 bookings: responseData.bookings,
  //                 pagination: responseData.pagination || null
  //             }))
  //         }
  //     }
  // }, [bookingsResponse, dispatch])

  // Get response data - use API response or fallback to slice
  const responseData = useMemo(() => {
    if (bookingsResponse) {
      // API response is wrapped in ApiResponse: { success, data: { bookings: [], pagination: {}, filters: {} } }
      return (bookingsResponse as any)?.data || bookingsResponse;
    }
    // Fallback to Redux slice data
    // if (myBookingsFromSlice) {
    //   return {
    //     bookings: myBookingsFromSlice.bookings,
    //     pagination: myBookingsFromSlice.pagination,
    //   };
    // }
    // return null;
  }, [bookingsResponse]);

  // Transform API data to table format
  const bookingsData: BookingData[] = useMemo(() => {
    if (!responseData) return [];

    // API response structure: { bookings: [], pagination: {}, filters: {} }
    const bookings = responseData?.bookings || [];

    return bookings.map((booking: any) => ({
      id: booking.order_id || booking.id || "",
      garageName: booking.garage_name || "N/A",
      location: booking.location || "N/A",
      email: booking.email || "N/A",
      phone: booking.phone_number || booking.phone || "N/A",
      bookingDate: booking.booking_date || "",
      time: booking.time || booking.start_time || "N/A",
      totalAmount: parseFloat(booking.total_amount || booking.amount || 0),
      status: booking.status?.toLowerCase() || "pending",
      vehicle_registration: booking.vehicle_registration || "N/A",
      additional_services: booking.additional_services || null,
      order_id: booking.order_id || booking.id,
      garage_id: booking.garage_id,
    }));
  }, [responseData]);

  // Get total count from pagination object
  const totalCount = responseData?.pagination?.total_count || 0;
  const totalPages =
    responseData?.pagination?.total_pages ||
    Math.ceil(totalCount / itemsPerPage);

  // Define table columns
  const columns = [
    {
      key: "garageName",
      label: "Garage Name",
    },
    {
      key: "vehicle_registration",
      label: "Vehicle Registration",
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Number",
    },
    {
      key: "bookingDate",
      label: "Booking Date",
      render: (value: string) => {
        if (!value) return "N/A";
        try {
          return format(new Date(value), "dd/MM/yyyy");
        } catch {
          return value;
        }
      },
    },
    {
      key: "bookingDate",
      label: "Time",
      render: (value: string) => {
        if (!value) return "N/A";
        try {
          const date = new Date(value);
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } catch {
          return "N/A";
        }
      },
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (value: number, row: BookingData) => (
        <span className={row.status === "cancelled" ? "text-gray-400" : ""}>
          {`£${value?.toFixed(2) || "0.00"}`}
        </span>
      ),
    },
  ];

  // Map other columns to handle grey-out logic if cancelled
  const renderColumns = columns.map(col => {
    const originalRender = col.render;
    (col as any).render = (value: any, row: BookingData) => {
      const content = originalRender ? (originalRender as any)(value, row) : (value || "N/A");
      return (
        <span className={row.status === "cancelled" ? "text-gray-400" : ""}>
          {content}
        </span>
      );
    };
    return col;
  });

  // Actions Dropdown
  const ActionDropdown = ({ row }: { row: BookingData }) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    
    if (["rejected", "cancelled", "completed"].includes(row.status.toLowerCase())) {
      return null;
    }

    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 cursor-pointer w-8 p-0"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(() => {
                setRescheduleModal({ isOpen: true, booking: row });
                const bookingDate = row.bookingDate || row.date || "";
                if (bookingDate) {
                  try {
                    setRescheduleDate(new Date(bookingDate).toISOString().split("T")[0]);
                  } catch {
                    setRescheduleDate("");
                  }
                }
              }, 150);
            }}
            className="cursor-pointer"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              setTimeout(() => {
                if (!isCancelling) {
                  setCancelModal({ isOpen: true, bookingId: row.id, garageName: row.garageName || "Garage" });
                  setCancelReason("");
                }
              }, 150);
            }}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const actionColumn = [{
    label: "Manage",
    render: (row: BookingData) => 
      row.status === "cancelled" ? (
        <span className="text-red-500 font-medium text-sm border border-red-500 rounded p-1">Cancelled</span>
      ) : (
        <ActionDropdown row={row} />
      )
  }];

  // Define tabs with counts
  // Note: API might not provide individual status counts, so we calculate from data
  const statusCounts = useMemo(() => {
    const allBookings = responseData?.bookings || [];
    return {
      all: totalCount,
      pending: allBookings.filter(
        (b: any) => b.status?.toLowerCase() === "pending",
      ).length,
      accepted: allBookings.filter(
        (b: any) => b.status?.toLowerCase() === "accepted",
      ).length,
      rejected: allBookings.filter(
        (b: any) => b.status?.toLowerCase() === "rejected",
      ).length,
    };
  }, [responseData, totalCount]);

  const tabs = [
    {
      key: "all",
      label: "All Order",
      count: totalCount,
    },
    {
      key: "pending",
      label: "Pending",
      count: statusCounts.pending,
    },
    {
      key: "accepted",
      label: "Accepted",
      count: statusCounts.accepted,
    },
    {
      key: "rejected",
      label: "Rejected",
      count: statusCounts.rejected,
    },
  ];

  // Reset to first page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // const handleTabChange = (tabKey: string) => {
  //   setActiveTab(tabKey);
  //   setCurrentPage(1);
  // };

  // Handlers
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
      setCancelModal({ isOpen: false, bookingId: null, garageName: null });
      setCancelReason("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel booking");
    }
  };

  const handleSelectSlot = (slot: any) => {
    const statuses: string[] = Array.isArray(slot.status) ? slot.status : [];
    const isBooked = statuses.includes("BOOKED");
    const isBlocked = statuses.includes("BLOCKED");
    const isBreak = statuses.includes("BREAK");
    const isHoliday = statuses.includes("HOLIDAY");

    // Past check
    const start = slot.start_time || "";
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
    setSelectedSlotId(slot.id || `${slot.start_time}-${slot.end_time}`);
    setSelectedSlot(slot);
  };

  const handleSubmitReschedule = async () => {
    if (!rescheduleModal.booking || !rescheduleDate || !selectedSlot) {
      toast.warn("Please select date and time slot");
      return;
    }

    try {
      // Only pass slot_id if it's a real DB slot (has_id=true).
      // Template slots get a generated composite id - passing that would fail backend lookup.
      await rescheduleBooking({
        id: rescheduleModal.booking.id,
        ...(selectedSlot.has_id ? { slot_id: selectedSlot.id } : {}),
        date: rescheduleDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        reason: rescheduleReason.trim(),
      }).unwrap();
      toast.success("Booking rescheduled successfully");
      setRescheduleModal({ isOpen: false, booking: null });
      setRescheduleDate("");
      setSelectedSlotId(null);
      setSelectedSlot(null);
      setRescheduleReason("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reschedule booking");
    }
  };

  const handleRowClick = (row: any) => {
    setViewModal({ isOpen: true, booking: row });
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-lg text-red-600">
          Failed to load bookings. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          List of all past and upcoming bookings
        </h1>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
        {/* Tabs on the left */}
        {/* <nav className="flex flex-wrap gap-2 sm:gap-6 bg-[#F5F5F6] rounded-[10px] p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-1 rounded-[6px] cursor-pointer font-medium text-sm transition-all duration-200 ${
                activeTab === tab.key
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
            className="block w-full xl:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <>
        <div className="mb-2 text-right text-xs font-bold text-gray-500 md:hidden">
          Swipe to view more &rarr;
        </div>
        <ReusableTable
          data={bookingsData}
          columns={renderColumns}
          actions={actionColumn}
          actionsColumnLabel="Actions"
          actionsPosition="start"
          stickyActionsColumn
          onRowClick={handleRowClick}
          className=""
          isLoading={isLoading}
          skeletonRows={itemsPerPage}
        />

        {!isLoading && (
          <>
            {bookingsData.length === 0 ? (
              <div className="flex justify-center items-center min-h-96">
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-2">
                    No bookings found
                  </p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            ) : (
              <ReusablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalCount}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className=""
              />
            )}
          </>
        )}
      </>

      {/* Cancel Modal */}
      <CustomReusableModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, bookingId: null, garageName: null })}
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
            Are you sure you want to cancel your booking with <span className="font-semibold text-gray-700">{cancelModal.garageName}</span>?
            This will release the time slot and notify the garage.
          </p>

          <div className="mb-6">
            <Label htmlFor="driverCancelReason" className="mb-2 block text-sm font-medium text-gray-700">Reason for Cancellation</Label>
            <textarea
              id="driverCancelReason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a brief reason for cancellation (sent to garage)"
              className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCancelModal({ isOpen: false, bookingId: null, garageName: null })}
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
        onClose={() => {
          setRescheduleModal({ isOpen: false, booking: null });
          setRescheduleDate("");
          setSelectedSlotId(null);
          setSelectedSlot(null);
          setRescheduleReason("");
        }}
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
                        const start = slot.start_time || "";
                        const end = slot.end_time || "";

                        const statuses: string[] = Array.isArray(slot.status)
                          ? slot.status
                          : [];
                        const isBooked = statuses.includes("BOOKED");
                        const isBlocked = statuses.includes("BLOCKED");
                        const isBreak = statuses.includes("BREAK");
                        const isHoliday = statuses.includes("HOLIDAY");
                        
                        // Past check
                        let isPast = false;
                        if (rescheduleDate && start) {
                          const [h, m] = start.split(":").map(Number);
                          const dt = new Date(rescheduleDate);
                          dt.setHours(h || 0, m || 0, 0, 0);
                          isPast = dt < new Date();
                        }

                        const isAvailable = !isBooked && !isBlocked && !isBreak && !isHoliday && !isPast;

                        return (
                          <button
                            key={slot.id || `${start}-${idx}`}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            disabled={!isAvailable || isRescheduling}
                            className={cn(
                              "group relative px-4 py-4 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center justify-center gap-2.5 min-h-[100px]",
                              !isAvailable
                                ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                : "cursor-pointer hover:border-[#19CA32] hover:bg-[#19CA32]/10 hover:shadow-md hover:scale-105 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:ring-offset-2",
                              selectedSlotId === (slot.id || `${start}-${end}`) &&
                                isAvailable
                                ? "border-[#19CA32] bg-[#19CA32] text-white shadow-lg ring-2 ring-[#19CA32]/30 scale-105"
                                : isAvailable &&
                                    "border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-[#19CA32]/5",
                              (isRescheduling || !isAvailable) &&
                                "hover:scale-100",
                            )}
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                !isAvailable
                                  ? "bg-muted"
                                  : selectedSlotId === (slot.id || `${start}-${end}`)
                                    ? "bg-white/25"
                                    : "bg-muted group-hover:bg-accent"
                              }`}
                            >
                              <Clock
                                className={`h-5 w-5 ${
                                  !isAvailable
                                    ? "text-muted-foreground"
                                    : selectedSlotId === (slot.id || `${start}-${end}`)
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
                                      selectedSlotId === (slot.id || `${start}-${end}`)
                                        ? "font-semibold text-primary-foreground"
                                        : "font-semibold text-foreground"
                                    }
                                  >
                                    {formatTime(start)}
                                  </span>
                                  <span
                                    className={
                                      selectedSlotId === (slot.id || `${start}-${end}`)
                                        ? "text-primary-foreground/70 text-xs"
                                        : "text-muted-foreground text-xs"
                                    }
                                  >
                                    -
                                  </span>
                                  <span
                                    className={
                                      selectedSlotId === (slot.id || `${start}-${end}`)
                                        ? "font-semibold text-primary-foreground"
                                        : "font-semibold text-foreground"
                                    }
                                  >
                                    {formatTime(end)}
                                  </span>
                                </div>
                              )}
                            </div>
                            {selectedSlotId === (slot.id || `${start}-${end}`) &&
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
                        {slotResponse
                          ? "No slots available for this date"
                          : "Select a date to view available slots"}
                      </p>
                      {slotResponse && (
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
                  <Label htmlFor="driverRescheduleReason" className="mb-2 block text-sm font-medium text-gray-700">Optional: Reason for Rescheduling</Label>
                  <textarea
                    id="driverRescheduleReason"
                    rows={2}
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="E.g. Something came up, car broke down..."
                    className="w-full flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRescheduleModal({ isOpen: false, booking: null });
                      setRescheduleDate("");
                      setSelectedSlotId(null);
                      setSelectedSlot(null);
                      setRescheduleReason("");
                    }}
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
                  ["Garage", viewModal.booking.garageName],
                  ["Location", viewModal.booking.location],
                  ["Email", viewModal.booking.email],
                  ["Phone", viewModal.booking.phone],
                  ["Vehicle", viewModal.booking.vehicle_registration],
                  [
                    "Date",
                    viewModal.booking.bookingDate
                      ? format(
                          new Date(viewModal.booking.bookingDate),
                          "dd/MM/yyyy",
                        )
                      : "N/A",
                  ],
                  [
                    "Time",
                    viewModal.booking.bookingDate
                      ? new Date(viewModal.booking.bookingDate).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "N/A",
                  ],
                  [
                    "Amount",
                    `£${viewModal.booking.totalAmount?.toFixed(2) || "0.00"}`,
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
            <div className="px-6 pb-6">
              <button
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
