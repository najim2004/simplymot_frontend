"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { PAGINATION_CONFIG } from "@/config/pagination.config";
import {
  useDismissReviewRequestMutation,
  useGetEligibleReviewsQuery,
  useSendReviewRequestMutation,
} from "@/features/admin";

const BRAND_COLOR = "#19CA32";

const DateFilter = ({
  label,
  date,
  onDateChange,
}: {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[200px] justify-start pr-10 text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {date ? format(date, "dd/MM/yyyy") : "Pick a date"}
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
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDateChange(undefined);
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label={`Clear ${label}`}
            title={`Clear ${label}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    PAGINATION_CONFIG.DEFAULT_LIMIT,
  );
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    type: "send" | "dismiss";
    customerName: string;
  } | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, startDate, endDate]);

  const { data, isLoading, refetch } = useGetEligibleReviewsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    startdate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
    enddate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
  });

  const [sendReviewRequest, { isLoading: isSending }] =
    useSendReviewRequestMutation();
  const [dismissReviewRequest, { isLoading: isDismissing }] =
    useDismissReviewRequestMutation();

  const reviews = data?.data?.reviews || [];
  const totalPages = data?.data?.pagination?.pages || 1;
  const totalItems = data?.data?.pagination?.total || 0;
  const actionBusy = isSending || isDismissing;

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "send") {
        const result = await sendReviewRequest(confirmAction.id).unwrap();
        toast.success(result?.message || "Review request sent successfully.");
      } else {
        const result = await dismissReviewRequest(confirmAction.id).unwrap();
        toast.success(result?.message || "Removed from review list.");
      }
      setConfirmAction(null);
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to process review action.",
      );
    }
  };

  const columns = [
    {
      key: "driver_name",
      label: "Customer Name",
      width: "14%",
      render: (_: string, row: any) => (
        <span className="text-sm text-gray-900">
          {row?.driver?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "registration_number",
      label: "Registration Number",
      width: "12%",
      render: (_: string, row: any) => (
        <span className="text-sm text-gray-900">
          {row?.vehicle?.registration_number || "N/A"}
        </span>
      ),
    },
    {
      key: "driver_email",
      label: "Email",
      width: "16%",
      render: (_: string, row: any) => (
        <span className="text-sm text-gray-900">
          {row?.driver?.email || "N/A"}
        </span>
      ),
    },
    {
      key: "driver_phone",
      label: "Contact Number",
      width: "12%",
      render: (_: string, row: any) => (
        <span className="text-sm text-gray-900">
          {row?.driver?.phone_number || "N/A"}
        </span>
      ),
    },
    {
      key: "garage_name",
      label: "Garage",
      width: "14%",
      render: (_: string, row: any) => (
        <span className="text-sm text-gray-900">
          {row?.garage?.garage_name || "N/A"}
        </span>
      ),
    },
    {
      key: "order_date",
      label: "Booking Date",
      width: "10%",
      render: (_: string, row: any) => {
        const dateValue = row?.order_date;
        if (!dateValue) return "N/A";
        try {
          return new Date(dateValue).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        } catch {
          return "N/A";
        }
      },
    },
    {
      key: "total_amount",
      label: "Total",
      width: "8%",
      render: (_: number | string, row: any) => {
        const amount = row?.total_amount;
        if (!amount) return "£0.00";
        const numValue =
          typeof amount === "string" ? parseFloat(amount) : Number(amount);
        return `£${numValue.toFixed(2)}`;
      },
    },
    {
      key: "actions",
      label: "Manage",
      width: "14%",
      truncate: false,
      render: (_: string, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 cursor-pointer text-white"
            style={{ backgroundColor: BRAND_COLOR }}
            disabled={actionBusy}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmAction({
                id: row.id,
                type: "send",
                customerName: row?.driver?.name || "this customer",
              });
            }}
          >
            Send
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer text-red-600 border-red-300 hover:bg-red-50"
            disabled={actionBusy}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmAction({
                id: row.id,
                type: "dismiss",
                customerName: row?.driver?.name || "this customer",
              });
            }}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bookings appear here the day after the booking date. Sending a
            review request emails the driver and removes the row from this list.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
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

      <div className="flex justify-end mb-4">
        <div className="relative w-full max-w-md">
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
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />
        </div>
      </div>

      <ReusableTable
        data={reviews}
        columns={columns}
        className="mt-2"
        isLoading={isLoading}
        skeletonRows={itemsPerPage}
      />

      {!isLoading && (
        <ReusablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
        />
      )}

      <ConfirmationModal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction?.type === "send"
            ? "Send Review Request"
            : "Remove from Reviews"
        }
        description={
          confirmAction?.type === "send"
            ? `Send a Trustpilot review request email to ${confirmAction?.customerName}?`
            : `Remove ${confirmAction?.customerName} from the review list without sending any email?`
        }
        confirmText={confirmAction?.type === "send" ? "Send" : "Remove"}
        isLoading={actionBusy}
        variant={confirmAction?.type === "send" ? "success" : "danger"}
      />

      {actionBusy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      )}
    </>
  );
}
