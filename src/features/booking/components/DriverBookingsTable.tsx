"use client";

import React from "react";
import Image from "next/image";
import { MoreVertical, Calendar, AlertTriangle, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Booking } from "../types";
import {
  formatSlotDate,
  formatSlotTimeRange,
  getBookingInitials,
} from "../utils";

export interface DriverBookingsTableProps {
  bookings?: Booking[];
  isLoading: boolean;
  isError: boolean;
  skeletonRows?: number;
  onRetry: () => void;
  onView: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

export function DriverBookingsTable({
  bookings,
  isLoading,
  isError,
  skeletonRows = 10,
  onRetry,
  onView,
  onReschedule,
  onCancel,
}: DriverBookingsTableProps) {
  // Error state
  if (isError && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            Error loading bookings. Please try again.
          </p>
          <Button onClick={onRetry} className="mt-4 cursor-pointer">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && !isError && (!bookings || bookings.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-100">
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
            Your booked services will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-t-lg border border-gray-300 bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Garage
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Garage Contact
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Slot
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200">
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, index) => (
                <TableRow key={`skeleton-row-${index}`}>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-36 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : bookings?.map((row) => (
                <TableRow
                  key={row?.id}
                  className={
                    row?.status?.toUpperCase() === "CANCELLED"
                      ? "bg-gray-50/50"
                      : ""
                  }
                >
                  {/* 1. Garage: Name & Image */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {row?.garage?.image ? (
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200">
                          <Image
                            src={row.garage.image}
                            alt={row?.garage?.name || "Garage"}
                            fill
                            sizes="36px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs flex items-center justify-center border border-gray-200">
                          {getBookingInitials(row?.garage?.name, "G")}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span
                          className={`font-medium ${
                            row?.status?.toUpperCase() === "CANCELLED"
                              ? "text-gray-400"
                              : "text-gray-900"
                          }`}
                        >
                          {row?.garage?.name ?? "N/A"}
                        </span>
                        {row?.garage?.address && (
                          <span className="text-xs text-gray-500 truncate max-w-50">
                            {row.garage.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* 2. Garage Contact: Email & Phone */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span
                        className={`text-sm ${
                          row?.status?.toUpperCase() === "CANCELLED"
                            ? "text-gray-400"
                            : "text-gray-900"
                        }`}
                      >
                        {row?.garage?.email ?? "N/A"}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {row?.garage?.phone_number ?? "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  {/* 3. Vehicle: Make & Registration */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${
                          row?.status?.toUpperCase() === "CANCELLED"
                            ? "text-gray-400"
                            : "text-gray-900"
                        }`}
                      >
                        {row?.vehicle?.make ?? "N/A"}
                      </span>
                      <span className="text-xs text-gray-500 font-mono mt-0.5">
                        {row?.vehicle?.registration_number ?? "N/A"}
                      </span>
                    </div>
                  </TableCell>

                  {/* 4. Slot: Date & Day, Start time to End time */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span
                        className={`text-sm ${
                          row?.status?.toUpperCase() === "CANCELLED"
                            ? "text-gray-400"
                            : "text-gray-900"
                        }`}
                      >
                        {formatSlotDate(row?.starts_at)}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {formatSlotTimeRange(row?.starts_at, row?.ends_at)}
                      </span>
                    </div>
                  </TableCell>

                  {/* 5. Status: Booked, Rescheduled, and Cancelled */}
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const status = row?.status?.toUpperCase();
                      if (status === "CANCELLED") {
                        return (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        );
                      }
                      if (status === "RESCHEDULED") {
                        return (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Rescheduled
                          </span>
                        );
                      }
                      return (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Booked
                        </span>
                      );
                    })()}
                  </TableCell>

                  {/* 6. Action buttons */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer text-gray-600 transition-all hover:bg-[#19CA32]/25 hover:text-[#158a26] hover:ring-2 hover:ring-[#19CA32]/60 hover:shadow-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-36 rounded-sm"
                      >
                        {/* View Action Button */}
                        <DropdownMenuItem
                          onClick={() => onView(row)}
                          className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>

                        {row?.status?.toUpperCase() !== "CANCELLED" && (
                          <>
                            {/* Reschedule Action Button */}
                            <DropdownMenuItem
                              onClick={() => onReschedule(row)}
                              className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Reschedule
                            </DropdownMenuItem>

                            {/* Cancel Action Button */}
                            <DropdownMenuItem
                              onClick={() => onCancel(row)}
                              className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold text-red-600 focus:text-red-600 transition-none"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
