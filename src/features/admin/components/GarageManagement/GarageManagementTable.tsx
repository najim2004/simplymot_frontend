"use client";

import React from "react";
import Image from "next/image";
import { MoreVertical, Eye, EyeOff, User as UserIcon } from "lucide-react";
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
import type { Garage } from "../../api/admin-garage.api";

export interface GarageManagementTableProps {
  garages?: Garage[];
  isLoading: boolean;
  isError: boolean;
  skeletonRows?: number;
  hasPagination?: boolean;
  onRetry: () => void;
  onViewDetails: (garage: Garage) => void;
  onToggleVisibility: (garage: Garage) => void;
  onViewOwner: (garage: Garage) => void;
  isTogglingVisibility?: boolean;
}

function getInitials(name?: string | null, fallback = "G"): string {
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

export function GarageManagementTable({
  garages,
  isLoading,
  isError,
  skeletonRows = 10,
  hasPagination = true,
  onRetry,
  onViewDetails,
  onToggleVisibility,
  onViewOwner,
  isTogglingVisibility,
}: GarageManagementTableProps) {
  // Error state - matching booking tables
  if (isError && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            Error loading garages. Please try again.
          </p>
          <Button onClick={onRetry} className="mt-4 cursor-pointer">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - matching booking tables
  if (!isLoading && !isError && (!garages || garages.length === 0)) {
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-gray-600 text-lg">No garages found</p>
          <p className="text-gray-500 text-sm mt-2">
            Garages will appear here once registered
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
              GARAGE NAME
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GARAGE CONTACT
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GARAGE STATUS
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              OWNER NAME
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              OWNER CONTACT
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              OWNER STATUS
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CREATED AT
            </TableHead>
            <TableHead className="px-6 py-3 whitespace-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SUBSCRIPTION
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
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-3 w-28" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            : garages?.map((garage) => {
                const isVisible = garage.is_visible !== false;
                const garageImage = garage.garage_image;
                const garageName = garage.garage_name || "N/A";

                const rawOwnerName = garage.owner?.name || garage.owner_name;
                const ownerName =
                  rawOwnerName && rawOwnerName.trim() ? rawOwnerName : "N/A";
                const ownerAvatar = garage.owner?.avatar || garage.owner_avatar;
                const ownerEmail =
                  garage.owner?.email || garage.owner_email || "N/A";
                const ownerPhone =
                  garage.owner?.phone_number || garage.owner_phone || "";
                const ownerStatus = (
                  garage.owner?.status ||
                  garage.owner_status ||
                  garage.status ||
                  "PENDING"
                ).toUpperCase();

                const contactEmail =
                  garage.contact_email || garage.email || "N/A";
                const contactPhone = garage.phone_number || "";
                const contactAddress = [
                  garage.address,
                  garage.city,
                  garage.post_code,
                ]
                  .filter(Boolean)
                  .join(", ");

                const subStatus = (
                  garage.subscription_status || "NO_SUBSCRIPTION"
                ).toUpperCase();
                const subPlan = garage.subscription_plan;

                return (
                  <TableRow key={garage.id} className="hover:bg-gray-50/50">
                    {/* 1. Garage Name with image */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {garageImage ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200">
                            <Image
                              src={garageImage}
                              alt={garageName}
                              fill
                              sizes="36px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100 text-gray-700 font-semibold text-xs flex items-center justify-center border border-gray-200">
                            {getInitials(garageName, "G")}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {garageName}
                          </span>
                          {garage.vts_number && (
                            <span className="text-xs text-gray-500 font-mono mt-0.5">
                              VTS: {garage.vts_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Garage Contact [email, phone, address] */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {contactEmail}
                        </span>
                        {contactPhone && contactPhone !== "N/A" && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {contactPhone}
                          </span>
                        )}
                        {contactAddress && contactAddress !== "N/A" && (
                          <span
                            className="text-xs text-gray-500 mt-0.5 truncate max-w-50"
                            title={contactAddress}
                          >
                            {contactAddress}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 3. Garage Status [visibled, hidden] */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {isVisible ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Visible
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Hidden
                        </span>
                      )}
                    </TableCell>

                    {/* 4. Owner Name with avatar */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {ownerAvatar ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-gray-200">
                            <Image
                              src={ownerAvatar}
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
                        <span className="font-medium text-gray-900">
                          {ownerName}
                        </span>
                      </div>
                    </TableCell>

                    {/* 5. Owner Contact [email, phone] */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">
                          {ownerEmail}
                        </span>
                        {ownerPhone && ownerPhone !== "N/A" && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {ownerPhone}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 6. Owner Status */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        if (ownerStatus === "ACTIVE") {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          );
                        }
                        if (ownerStatus === "PENDING") {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          );
                        }
                        if (ownerStatus === "SUSPENDED") {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Suspended
                            </span>
                          );
                        }
                        if (ownerStatus === "BANNED") {
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Banned
                            </span>
                          );
                        }
                        return (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {ownerStatus}
                          </span>
                        );
                      })()}
                    </TableCell>

                    {/* 7. Garage Created At */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatDate(garage.created_at)}
                      </span>
                    </TableCell>

                    {/* 8. Subscription Status */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        {(() => {
                          if (subStatus === "ACTIVE") {
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 w-fit">
                                Active
                              </span>
                            );
                          }
                          if (
                            subStatus === "TRIALING" ||
                            subStatus === "TRIAL"
                          ) {
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-fit">
                                Trial
                              </span>
                            );
                          }
                          if (subStatus === "PAST_DUE") {
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                                Past Due
                              </span>
                            );
                          }
                          if (
                            subStatus === "CANCELED" ||
                            subStatus === "CANCELLED"
                          ) {
                            return (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                                Canceled
                              </span>
                            );
                          }
                          return (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit">
                              No Plan
                            </span>
                          );
                        })()}
                        {subPlan && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            {subPlan}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 9. Action 3-dot button */}
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
                          className="w-44 rounded-sm"
                        >
                          {/* View details */}
                          <DropdownMenuItem
                            onClick={() => onViewDetails(garage)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {/* Hide or visibled garage */}
                          <DropdownMenuItem
                            onClick={() => onToggleVisibility(garage)}
                            disabled={isTogglingVisibility}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            {isVisible ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Hide Garage
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Make Visible
                              </>
                            )}
                          </DropdownMenuItem>

                          {/* View owner details */}
                          <DropdownMenuItem
                            onClick={() => onViewOwner(garage)}
                            className="cursor-pointer hover:bg-transparent focus:bg-transparent hover:font-bold focus:font-bold transition-none"
                          >
                            <UserIcon className="mr-2 h-4 w-4" />
                            View Owner Details
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

export default GarageManagementTable;
