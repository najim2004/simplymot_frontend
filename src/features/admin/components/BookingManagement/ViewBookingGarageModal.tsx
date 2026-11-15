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
  Building2,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import type { AdminBookingGarage } from "../../api/admin-booking.api";

export interface ViewBookingGarageModalProps {
  isOpen: boolean;
  garage: AdminBookingGarage | null;
  onClose: () => void;
  onViewFullDetails?: (garageId: string) => void;
}

function getInitials(name?: string | null): string {
  if (!name) return "G";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ViewBookingGarageModal({
  isOpen,
  garage,
  onClose,
  onViewFullDetails,
}: ViewBookingGarageModalProps) {
  if (!garage) return null;

  const garageName = garage.garage_name || "Garage";
  const garageEmail = garage.contact_email || "-";
  const garagePhone = garage.phone_number || "-";
  const garageImage = garage.garage_image;

  const fullAddress =
    [garage.address, garage.city, garage.post_code]
      .filter(Boolean)
      .join(", ") || "No address provided";

  const owner = garage.owner;
  const ownerName = owner?.name || "Owner";
  const ownerEmail = owner?.email || "-";
  const ownerPhone = owner?.phone_number || "-";
  const ownerAvatar = owner?.avatar;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="h-5 w-5 text-gray-700" />
            Garage Details
          </DialogTitle>
          <DialogDescription>
            Garage profile and contact information for {garageName}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-5">
          {/* Header Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-white shadow-sm shrink-0">
              <AvatarImage
                src={garageImage || undefined}
                alt={garageName}
                className="object-cover"
              />
              <AvatarFallback className="rounded-xl bg-blue-100 text-blue-700 font-bold text-lg">
                {getInitials(garageName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 text-base truncate">
                  {garageName}
                </h3>
                {garage.vts_number && (
                  <Badge variant="outline" className="text-xs font-mono">
                    VTS: {garage.vts_number}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {garage.city || garage.address || "Automotive Garage"}
              </p>
            </div>
          </div>

          {/* Garage Contact Info */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Garage Contact Information
            </h4>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Contact Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {garageEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {garagePhone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {fullAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Garage Owner Info */}
          {owner && (
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Garage Owner
              </h4>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                <Avatar className="h-10 w-10 rounded-full border border-white shadow-2xs shrink-0">
                  <AvatarImage
                    src={ownerAvatar || undefined}
                    alt={ownerName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-xs">
                    {getInitials(ownerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {ownerName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{ownerEmail}</p>
                </div>
                {ownerPhone !== "-" && (
                  <div className="text-right text-xs text-gray-500 shrink-0">
                    {ownerPhone}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
          {garage.id && onViewFullDetails && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              onClick={() => {
                onClose();
                onViewFullDetails(garage.id!);
              }}
            >
              Full Garage Details
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ViewBookingGarageModal;

