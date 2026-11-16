"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  MoreVertical,
  Trash2,
  Eye,
  User as UserIcon,
  CalendarDays,
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
import { Checkbox } from "@/components/ui/checkbox";

export type VehicleTableRow = {
  id: string;
  driverId: string;
  name: string;
  email: string;
  phone_number: string | null;
  avatar?: string | null;
  owner_status?: string | null;
  vehicle_registration_number: string | null;
  make?: string | null;
  model?: string | null;
  color?: string | null;
  mot_expiry_date: string | null;
  mot_status?: string | null;
  is_expired?: boolean;
  tax_status?: string | null;
  tax_due_date?: string | null;
  created_at?: string | null;
  mot_last_checked_at?: string | null;
};

export interface VehiclesManagementTableProps {
  vehicles?: VehicleTableRow[];
  isLoading: boolean;
  isError: boolean;
  skeletonRows?: number;
  hasPagination?: boolean;
  selectedRows: Set<string>;
  vehiclesNeedingReminder?: Array<{ id: string }>;
  isDeleting?: boolean;
  onRetry: () => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (rowId: string, checked: boolean) => void;
  onDelete: (vehicle: VehicleTableRow) => void;
  onViewDetails: (vehicle: VehicleTableRow) => void;
  onViewOwner: (vehicle: VehicleTableRow) => void;
  onViewBookings: (vehicle: VehicleTableRow) => void;
}

function getInitials(name?: string | null, fallback = "O"): string {
  if (!name || name === "N/A" || name === "-") return fallback;
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  if (!clean || clean.toUpperCase() === "NA") return fallback;
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function formatDisplayDate(value?: string | null): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "—";
    return format(date, "dd MMM yyyy");
  } catch {
    return "—";
  }
}

function getOwnerStatusBadge(status?: string | null) {
  const s = (status || "PENDING").toUpperCase();
  if (s === "ACTIVE") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  }
  if (s === "PENDING") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  }
  if (s === "SUSPENDED") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Suspended
      </span>
    );
  }
  if (s === "BANNED") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Banned
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      {s}
    </span>
  );
}

function getMotExpiryDisplay(row: VehicleTableRow) {
  const dateLabel = formatDisplayDate(row.mot_expiry_date);
  const rawStatus = (row.mot_status || "").toUpperCase();
  const isExpired =
    row.is_expired ||
    rawStatus === "EXPIRED" ||
    (row.mot_expiry_date
      ? new Date(row.mot_expiry_date).getTime() < Date.now()
      : false);

  let statusLabel = rawStatus || (isExpired ? "EXPIRED" : "VALID");
  if (!rawStatus && !isExpired && row.mot_expiry_date) statusLabel = "VALID";
  if (isExpired) statusLabel = "EXPIRED";

  const badgeClass = isExpired
    ? "bg-red-100 text-red-800"
    : statusLabel === "FAILED"
      ? "bg-orange-100 text-orange-800"
      : "bg-green-100 text-green-800";

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
      >
        {statusLabel}
      </span>
      <span className="text-xs text-gray-500">{dateLabel}</span>
    </div>
  );
}

function getTaxStatusDisplay(row: VehicleTableRow) {
  const status = (row.tax_status || "").toUpperCase() || "—";
  const dateLabel = formatDisplayDate(row.tax_due_date);
  const isTaxed = status === "TAXED";

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isTaxed
            ? "bg-green-100 text-green-800"
            : status === "—"
              ? "bg-gray-100 text-gray-600"
              : "bg-amber-100 text-amber-800"
        }`}
      >
        {status}
      </span>
      <span className="text-xs text-gray-500">{dateLabel}</span>
    </div>
  );
}

export function VehiclesManagementTable({
  vehicles,
  isLoading,
  isError,
  skeletonRows = 10,
  hasPagination = true,
  selectedRows,
  isDeleting,
  onRetry,
  onSelectAll,
  onSelectRow,
  onDelete,
  onViewDetails,
  onViewOwner,
  onViewBookings,
}: VehiclesManagementTableProps) {
  const isAllSelected =
    (vehicles?.length ?? 0) > 0 &&
    selectedRows.size === (vehicles?.length ?? 0);

  if (isError && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            Error loading vehicles. Please try again.
          </p>
          <Button onClick={onRetry} className="mt-4 cursor-pointer">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!isLoading && !isError && (!vehicles || vehicles.length === 0)) {
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
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1.5M13 16l2 1.5V9a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16l-2 1.5"
            />
          </svg>
          <p className="text-gray-600 text-lg">No vehicles found</p>
          <p className="text-gray-500 text-sm mt-2">
            Vehicles will appear here once registered
          </p>
        </div>
      </div>
    );
  }

  const skeletonCols = 11;

  return (
    <div
      className={`overflow-x-auto border border-gray-300 bg-white ${
        hasPagination ? "rounded-t-lg" : "rounded-lg"
      }`}
    >
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                aria-label="Select all vehicles"
              />
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehicle
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Colour
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Owner Status
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              MOT Expiry
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tax Status
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Added At
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Sync
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
                  {Array.from({ length: skeletonCols }).map((__, colIdx) => (
                    <TableCell key={colIdx} className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : vehicles?.map((row) => {
                const ownerName = row.name || "Owner";
                const makeModel = [row.make, row.model]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <TableRow key={row.id} className="hover:bg-gray-50/50">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={(checked) =>
                          onSelectRow(row.id, Boolean(checked))
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        aria-label={`Select ${row.vehicle_registration_number || ownerName}`}
                      />
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 font-mono tracking-wide">
                          {row.vehicle_registration_number || "—"}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {makeModel || "—"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {row.color || "—"}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {row.avatar ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200">
                            <Image
                              src={row.avatar}
                              alt={ownerName}
                              fill
                              sizes="36px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs flex items-center justify-center border border-gray-200">
                            {getInitials(ownerName, "O")}
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {ownerName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {row.email || "—"}
                        </span>
                        {row.phone_number && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {row.phone_number}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {getOwnerStatusBadge(row.owner_status)}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {getMotExpiryDisplay(row)}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {getTaxStatusDisplay(row)}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatDisplayDate(row.created_at)}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatDisplayDate(row.mot_last_checked_at)}
                      </span>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 cursor-pointer text-gray-600 transition-all hover:bg-[#19CA32]/25 hover:text-[#158a26] hover:ring-2 hover:ring-[#19CA32]/60 hover:shadow-xs"
                            disabled={isDeleting}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-sm"
                        >
                          <DropdownMenuItem
                            onClick={() => onViewDetails(row)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onViewOwner(row)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <UserIcon className="mr-2 h-4 w-4" />
                            View Owner
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onViewBookings(row)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            View Bookings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(row)}
                            className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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

export default VehiclesManagementTable;
