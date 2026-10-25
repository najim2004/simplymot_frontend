"use client";

import React from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarCheck,
  XCircle,
  Printer,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStatusConfig } from "./statusMap";

export interface BookingDetailsHeaderProps {
  bookingLabel: string;
  createdDate?: string | null;
  datePrefix?: string;
  status?: string | null;
  onBack: () => void;
  canModify?: boolean;
  onReschedule?: () => void;
  onCancel?: () => void;
  onPrint?: () => void;
}

export function BookingDetailsHeader({
  bookingLabel,
  createdDate,
  datePrefix = "Booked on",
  status,
  onBack,
  canModify = true,
  onReschedule,
  onCancel,
  onPrint,
}: BookingDetailsHeaderProps) {
  const statusCfg = getStatusConfig(status);
  const isCancelled = status?.toUpperCase() === "CANCELLED";

  const hasAnyAction = Boolean(onPrint || onReschedule || onCancel);

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 sm:px-5 py-3 shadow-xs flex items-center justify-between gap-3 min-w-0">
      {/* Left: back button + title + date */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer shrink-0"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate tracking-tight">
            {bookingLabel}
          </h1>
          {createdDate && (
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 truncate">
              {datePrefix}{" "}
              {format(new Date(createdDate), "MMMM d, yyyy · hh:mm a")}
            </p>
          )}
        </div>
      </div>

      {/* Right: status badge + actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Status badge */}
        <div
          className={`inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md border text-xs font-semibold whitespace-nowrap select-none pointer-events-none ${statusCfg.bgClass} ${statusCfg.textClass} ${statusCfg.borderClass}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
          <span>{statusCfg.label}</span>
        </div>

        {/* Desktop action buttons: visible on md+, hidden on mobile/tablet */}
        {hasAnyAction && (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="w-px h-5 bg-gray-200" />

            {/* Print action (if provided, e.g. Garage side) */}
            {onPrint && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrint}
                className="cursor-pointer text-gray-600 border-gray-200 hover:bg-gray-50 h-8 px-3 text-xs gap-1.5 whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </Button>
            )}

            {/* Reschedule */}
            {onReschedule && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => canModify && !isCancelled && onReschedule()}
                disabled={!canModify || isCancelled}
                className="text-gray-600 border-gray-200 hover:bg-gray-50 h-8 px-3 text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                Reschedule
              </Button>
            )}

            {/* Cancel */}
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => canModify && !isCancelled && onCancel()}
                disabled={!canModify || isCancelled}
                className="border-red-200 text-red-500 hover:bg-red-50 h-8 px-3 text-xs gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* Mobile 3-dot Action Menu: visible on < md, hidden on md+ */}
        {hasAnyAction && (
          <div className="md:hidden flex items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-pointer text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center justify-center rounded-lg"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 rounded-md shadow-lg border-gray-200"
              >
                {onPrint && (
                  <DropdownMenuItem
                    onClick={onPrint}
                    className="cursor-pointer text-xs"
                  >
                    <Printer className="mr-2 h-3.5 w-3.5 text-gray-500" />
                    Print Receipt Slip
                  </DropdownMenuItem>
                )}

                {canModify && !isCancelled && (
                  <>
                    {onReschedule && (
                      <DropdownMenuItem
                        onClick={onReschedule}
                        className="cursor-pointer text-xs"
                      >
                        <CalendarCheck className="mr-2 h-3.5 w-3.5 text-gray-500" />
                        Reschedule
                      </DropdownMenuItem>
                    )}

                    {onCancel && (
                      <DropdownMenuItem
                        onClick={onCancel}
                        className="cursor-pointer text-xs text-red-600 focus:text-red-600"
                      >
                        <XCircle className="mr-2 h-3.5 w-3.5 text-red-500" />
                        Cancel Booking
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {(!canModify || isCancelled) && !onPrint && (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">
                    No actions available
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
