"use client";

import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  User as UserIcon,
} from "lucide-react";
import type { Driver } from "../../api/admin-driver.api";

export interface ViewDriverDetailsModalProps {
  isOpen: boolean;
  driver: Driver | null;
  onClose: () => void;
  onViewFullDetails?: (driverId: string) => void;
}

function getInitials(name?: string | null): string {
  if (!name || name === "N/A" || name === "-") return "D";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ViewDriverDetailsModal({
  isOpen,
  driver,
  onClose,
  onViewFullDetails,
}: ViewDriverDetailsModalProps) {
  if (!driver) return null;

  const driverName = driver.name || "Driver";
  const driverEmail = driver.email || "-";
  const driverPhone = driver.phone_number || "-";
  const driverAvatar = driver.avatar;
  const status = (driver.status || "PENDING").toUpperCase();

  const driverAddress =
    [
      driver.address,
      driver.city,
      driver.state,
      driver.country,
      driver.post_code,
    ]
      .filter(Boolean)
      .join(", ") || "No address provided";

  const memberSince = driver.created_at
    ? format(new Date(driver.created_at), "dd MMMM yyyy")
    : "N/A";

  const emailVerifiedAt = driver.email_verified_at
    ? format(new Date(driver.email_verified_at), "dd MMM yyyy, hh:mm a")
    : null;

  const vehicleCount = driver._count?.vehicles ?? driver.vehicles_count ?? 0;
  const bookingCount = driver._count?.bookings ?? driver.bookings_count ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <UserIcon className="h-5 w-5 text-gray-700" />
            Driver Details
          </DialogTitle>
          <DialogDescription>
            Account overview and contact information for {driverName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-5">
          {/* Header Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <Avatar className="h-16 w-16 rounded-full border-2 border-white shadow-sm shrink-0">
              <AvatarImage
                src={driverAvatar || undefined}
                alt={driverName}
                className="object-cover"
              />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-lg">
                {getInitials(driverName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-base truncate">
                  {driverName}
                </h3>
                <Badge
                  variant={
                    status === "ACTIVE"
                      ? "default"
                      : status === "BANNED" || status === "SUSPENDED"
                        ? "destructive"
                        : "secondary"
                  }
                  className={`text-xs px-2 py-0.5 capitalize ${
                    status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                      : ""
                  }`}
                >
                  {status.toLowerCase()}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Role:{" "}
                <span className="font-medium text-gray-700">
                  {driver.role || driver.kind || "DRIVER"}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Stats: Vehicles & Bookings */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-100 flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Vehicles</p>
                <p className="text-base font-bold text-gray-900">{vehicleCount}</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50/80 rounded-lg border border-gray-100 flex items-center gap-3">
              <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Bookings</p>
                <p className="text-base font-bold text-gray-900">{bookingCount}</p>
              </div>
            </div>
          </div>

          {/* Contact & Verification Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Contact & Account Info
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {driverEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {driverPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {driverAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <ShieldCheck className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email Verification</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {emailVerifiedAt ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">
                          Verified ({emailVerifiedAt})
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">
                          Not Verified
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
          {onViewFullDetails && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              onClick={() => {
                onClose();
                onViewFullDetails(driver.id);
              }}
            >
              Full Details Page
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewDriverDetailsModal;

