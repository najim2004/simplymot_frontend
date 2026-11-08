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
  Building2,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import type { Garage } from "../../api/admin-garage.api";

export interface ViewOwnerDetailsModalProps {
  isOpen: boolean;
  garage: Garage | null;
  onClose: () => void;
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ViewOwnerDetailsModal({
  isOpen,
  garage,
  onClose,
}: ViewOwnerDetailsModalProps) {
  if (!garage) return null;

  const owner = garage.owner;
  const ownerName = owner?.name || garage.owner_name || "Owner";
  const ownerEmail = owner?.email || garage.owner_email || "-";
  const ownerPhone = owner?.phone_number || garage.owner_phone || "-";
  const ownerAvatar = owner?.avatar || garage.owner_avatar;
  const ownerStatus = (
    owner?.status ||
    garage.owner_status ||
    garage.status ||
    "PENDING"
  ).toUpperCase();

  const ownerAddress =
    [
      owner?.address,
      owner?.city,
      owner?.state,
      owner?.country,
      owner?.post_code,
    ]
      .filter(Boolean)
      .join(", ") || "No address provided";

  const memberSince = owner?.created_at
    ? format(new Date(owner.created_at), "dd MMMM yyyy")
    : garage.created_at
      ? format(new Date(garage.created_at), "dd MMMM yyyy")
      : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <UserIcon className="h-5 w-5 text-gray-700" />
            Garage Owner Details
          </DialogTitle>
          <DialogDescription>
            Account and contact information for {ownerName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-5">
          {/* Header Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <Avatar className="h-16 w-16 rounded-full border-2 border-white shadow-sm shrink-0">
              <AvatarImage
                src={ownerAvatar || undefined}
                alt={ownerName}
                className="object-cover"
              />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-lg">
                {getInitials(ownerName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {ownerName}
                </h3>
                <Badge
                  variant="outline"
                  className={
                    ownerStatus === "ACTIVE"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : ownerStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                  }
                >
                  {ownerStatus}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">
                  {garage.garage_name || "Garage"}
                </span>
              </p>
            </div>
          </div>

          {/* Details List */}
          <div className="grid grid-cols-1 gap-3.5 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white">
              <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium">
                  Email Address
                </div>
                <div className="text-gray-900 font-semibold truncate">
                  {ownerEmail}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white">
              <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium">
                  Phone Number
                </div>
                <div className="text-gray-900 font-semibold">{ownerPhone}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium">
                  Owner Address
                </div>
                <div className="text-gray-900 font-medium">{ownerAddress}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium">
                  Registered Date
                </div>
                <div className="text-gray-900 font-medium">{memberSince}</div>
              </div>
            </div>

            {owner?.email_verified_at && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 font-medium">
                    Email Verification
                  </div>
                  <div className="text-emerald-700 font-semibold text-xs">
                    Verified on{" "}
                    {format(
                      new Date(owner.email_verified_at),
                      "dd/MM/yyyy HH:mm",
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewOwnerDetailsModal;
