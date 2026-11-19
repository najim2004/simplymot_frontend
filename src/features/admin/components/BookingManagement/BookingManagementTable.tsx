"use client";

import React from "react";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  Calendar,
  XCircle,
  User as UserIcon,
  Building2,
} from "lucide-react";
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
import type { AdminBooking } from "../../api/admin-booking.api";
import {
  formatSlotDate,
  formatSlotTimeRange,
} from "@/features/booking";

export interface BookingManagementTableProps {
  bookings?: AdminBooking[];
  isLoading: boolean;
  isError: boolean;
  skeletonRows?: number;
  hasPagination?: boolean;
  onRetry: () => void;
  onView: (booking: AdminBooking) => void;
  onReschedule: (booking: AdminBooking) => void;
  onCancel: (booking: AdminBooking) => void;
  onViewCustomer: (booking: AdminBooking) => void;
  onViewGarage: (booking: AdminBooking) => void;
}

function getInitials(name?: string | null, fallback = "U"): string {
  if (!name || name === "N/A" || name === "-") return fallback;
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  if (!clean || clean.toUpperCase() === "NA") return fallback;
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function getStatusBadge(status?: string | null) {
  const s = (status || "BOOKED").toUpperCase();
  switch (s) {
    case "BOOKED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          Booked
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          Completed
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Cancelled
        </span>
      );
    case "RESCHEDULED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          Rescheduled
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          Pending
        </span>
      );
    case "ACCEPTED":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
          Accepted
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 capitalize">
          {s.toLowerCase()}
        </span>
      );
  }
}

export function BookingManagementTable({
  bookings,
  isLoading,
  isError,
  skeletonRows = 10,
  hasPagination = true,
  onRetry,
  onView,
  onReschedule,
  onCancel,
  onViewCustomer,
  onViewGarage,
}: BookingManagementTableProps) {
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
            Bookings will appear here once placed by drivers
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border border-gray-300 bg-white overflow-x-auto ${
        hasPagination ? "rounded-t-lg" : "rounded-lg"
      }`}
    >
      <Table className="w-full">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Booking #
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Customer
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Garage
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Garage Owner
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Vehicle
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Slot
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="bg-white divide-y divide-gray-200">
          {isLoading
            ? Array.from({ length: skeletonRows }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-8 w-8 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : bookings?.map((booking) => {
                const customer = booking.customer;
                const customerName = customer?.name || "Customer";
                const customerEmail = customer?.email || "-";
                const customerPhone = customer?.phone_number || "-";
                const customerAvatar = customer?.avatar;

                const garage = booking.garage;
                const garageName = garage?.garage_name || "Garage";
                const garageEmail = garage?.contact_email || "-";
                const garagePhone = garage?.phone_number || "-";
                const garageCity = garage?.city || garage?.address || "";
                const garageImage = garage?.garage_image;

                const owner = garage?.owner;
                const ownerName = owner?.name || "Owner";
                const ownerEmail = owner?.email || "-";
                const ownerPhone = owner?.phone_number || "-";
                const ownerAvatar = owner?.avatar;

                const vehicle = booking.vehicle;
                const slotStartsAt =
                  booking.slot?.starts_at || booking.order_date;
                const slotEndsAt = booking.slot?.ends_at;

                const isCancelled =
                  booking.status?.toUpperCase() === "CANCELLED";

                return (
                  <TableRow
                    key={booking.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* 1. Booking Number */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {booking.booking_number ?? "—"}
                      </span>
                    </TableCell>

                    {/* 2. Customer: Name, Avatar, Contact */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {customerAvatar ? (
                          <div className="relative h-10 w-10 shrink-0">
                            <Image
                              src={customerAvatar}
                              alt={customerName}
                              fill
                              sizes="40px"
                              className="rounded-full object-cover border border-gray-200"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                            <span className="text-xs font-bold text-emerald-700">
                              {getInitials(customerName, "C")}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {customerName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {customerEmail}
                          </p>
                          {customerPhone !== "-" && (
                            <p className="text-xs text-gray-400">
                              {customerPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* 3. Garage: Name, Image, Contact */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {garageImage ? (
                          <div className="relative h-10 w-10 shrink-0">
                            <Image
                              src={garageImage}
                              alt={garageName}
                              fill
                              sizes="40px"
                              className="rounded-full object-cover border border-gray-200"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                            <span className="text-xs font-bold text-blue-700">
                              {getInitials(garageName, "G")}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {garageName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {garageEmail}
                          </p>
                          {(garagePhone !== "-" || garageCity) && (
                            <p className="text-xs text-gray-400 truncate">
                              {[garagePhone !== "-" ? garagePhone : null, garageCity]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* 4. Garage Owner: Name, Avatar, Contact */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {ownerAvatar ? (
                          <div className="relative h-10 w-10 shrink-0">
                            <Image
                              src={ownerAvatar}
                              alt={ownerName}
                              fill
                              sizes="40px"
                              className="rounded-full object-cover border border-gray-200"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
                            <span className="text-xs font-bold text-purple-700">
                              {getInitials(ownerName, "O")}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {ownerName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {ownerEmail}
                          </p>
                          {ownerPhone !== "-" && (
                            <p className="text-xs text-gray-400">
                              {ownerPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* 5. Vehicle */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {vehicle?.make ?? "N/A"}
                        </span>
                        <span className="text-xs text-gray-500 font-mono mt-0.5">
                          {vehicle?.registration_number ?? "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    {/* 6. Slot */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {formatSlotDate(slotStartsAt)}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {formatSlotTimeRange(slotStartsAt, slotEndsAt)}
                        </span>
                      </div>
                    </TableCell>

                    {/* 7. Status */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </TableCell>

                    {/* 8. Actions (3-dot Menu) */}
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
                          className="w-48 rounded-sm"
                        >
                          {/* View details */}
                          <DropdownMenuItem
                            onClick={() => onView(booking)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {/* Reschedule */}
                          <DropdownMenuItem
                            onClick={() => onReschedule(booking)}
                            disabled={isCancelled}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Reschedule
                          </DropdownMenuItem>

                          {/* Cancel */}
                          <DropdownMenuItem
                            onClick={() => onCancel(booking)}
                            disabled={isCancelled}
                            className={`cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none ${
                              isCancelled
                                ? "text-gray-400"
                                : "text-red-600 focus:text-red-600"
                            }`}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Booking
                          </DropdownMenuItem>

                          {/* View Customer */}
                          <DropdownMenuItem
                            onClick={() => onViewCustomer(booking)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <UserIcon className="mr-2 h-4 w-4" />
                            View Customer
                          </DropdownMenuItem>

                          {/* View Garage */}
                          <DropdownMenuItem
                            onClick={() => onViewGarage(booking)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <Building2 className="mr-2 h-4 w-4" />
                            View Garage
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
    </div>
  );
}

export default BookingManagementTable;

