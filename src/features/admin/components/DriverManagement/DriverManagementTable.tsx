"use client";

import React from "react";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
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
import type { Driver } from "../../api/admin-driver.api";

export interface DriverManagementTableProps {
  drivers?: Driver[];
  isLoading: boolean;
  isError: boolean;
  skeletonRows?: number;
  hasPagination?: boolean;
  onRetry: () => void;
  onViewDetails: (driver: Driver) => void;
  onViewDriver: (driver: Driver) => void;
  onToggleBan: (driver: Driver) => void;
  isBanning?: boolean;
}

function getInitials(name?: string | null, fallback = "D"): string {
  if (!name || name === "N/A" || name === "-") return fallback;
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  if (!clean || clean.toUpperCase() === "NA") return fallback;
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "N/A";
  }
}

export function DriverManagementTable({
  drivers,
  isLoading,
  isError,
  skeletonRows = 10,
  hasPagination = true,
  onRetry,
  onViewDetails,
  onViewDriver,
  onToggleBan,
  isBanning,
}: DriverManagementTableProps) {
  // Error state
  if (isError && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            Error loading drivers. Please try again.
          </p>
          <Button onClick={onRetry} className="mt-4 cursor-pointer">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && !isError && (!drivers || drivers.length === 0)) {
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-gray-600 text-lg">No drivers found</p>
          <p className="text-gray-500 text-sm mt-2">
            Drivers will appear here once registered
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto border border-gray-300 bg-white ${
        hasPagination ? "rounded-t-lg" : "rounded-lg"
      }`}
    >
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              DRIVER NAME
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CONTACT
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              VEHICLES
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              BOOKINGS
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              STATUS
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CREATED AT
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              EMAIL VERIFIED AT
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              ACTIONS
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
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : drivers?.map((driver) => {
                const driverAvatar = driver.avatar;
                const driverName = driver.name || "N/A";
                const email = driver.email || "N/A";
                const phone = driver.phone_number || "";
                const vehiclesCount = driver.vehicles_count ?? 0;
                const bookingsCount = driver.bookings_count ?? 0;
                const status = (driver.status || "PENDING").toUpperCase();
                const isBanned = status === "BANNED";

                return (
                  <TableRow key={driver.id} className="hover:bg-gray-50/50">
                    {/* 1. Driver Name with Avatar */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {driverAvatar ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200">
                            <Image
                              src={driverAvatar}
                              alt={driverName}
                              fill
                              sizes="36px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs flex items-center justify-center border border-gray-200">
                            {getInitials(driverName, "D")}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">
                          {driverName}
                        </span>
                      </div>
                    </TableCell>

                    {/* 2. Contact [email, phone] */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{email}</span>
                        {phone && phone !== "N/A" && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {phone}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 3. Vehicles Count */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {vehiclesCount} {vehiclesCount === 1 ? "Vehicle" : "Vehicles"}
                      </span>
                    </TableCell>

                    {/* 4. Bookings Count */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {bookingsCount} {bookingsCount === 1 ? "Booking" : "Bookings"}
                      </span>
                    </TableCell>

                    {/* 5. Status */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        if (status === "ACTIVE") {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          );
                        }
                        if (status === "PENDING") {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          );
                        }
                        if (status === "SUSPENDED") {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Suspended
                            </span>
                          );
                        }
                        if (status === "BANNED") {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Banned
                            </span>
                          );
                        }
                        return (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {status}
                          </span>
                        );
                      })()}
                    </TableCell>

                    {/* 6. Created At */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatDate(driver.created_at)}
                      </span>
                    </TableCell>

                    {/* 7. Email Verified At */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {driver.email_verified_at ? (
                        <span className="text-sm text-gray-900">
                          {formatDate(driver.email_verified_at)}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Not Verified
                        </span>
                      )}
                    </TableCell>

                    {/* 8. Action 3-dot Button */}
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
                        <DropdownMenuContent align="end" className="w-44 rounded-sm">
                          {/* View details */}
                          <DropdownMenuItem
                            onClick={() => onViewDetails(driver)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {/* View owner / driver */}
                          <DropdownMenuItem
                            onClick={() => onViewDriver(driver)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <UserIcon className="mr-2 h-4 w-4" />
                            View Driver
                          </DropdownMenuItem>

                          {/* Ban / Unban */}
                          <DropdownMenuItem
                            onClick={() => onToggleBan(driver)}
                            disabled={isBanning}
                            className={`cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none ${
                              isBanned
                                ? "text-green-600 focus:text-green-600"
                                : "text-red-600 focus:text-red-600"
                            }`}
                          >
                            {isBanned ? (
                              <>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Unban Driver
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Ban Driver
                              </>
                            )}
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

export default DriverManagementTable;

