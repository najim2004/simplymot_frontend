"use client";
import React, { useState } from "react";
import Image from "next/image";
import { DEFAULT_GARAGE_AVATAR_SRC } from "@/lib/garage-assets";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BookingModal from "./BookingModal";
import type { GarageData, VehicleData } from "@/features/driver";
import {
  MapPin,
  Navigation,
  ShieldCheck,
  BadgeCheck,
  Hash,
  Info,
} from "lucide-react";
import { saveBookMyMotResultsContext } from "@/lib/book-my-mot-navigation";

interface GarageCardProps {
  foundGarages: GarageData[];
  vehicle: VehicleData | null;
}

const bookMotButtonClass =
  "bg-[#19CA32] text-white shadow-none transition-all duration-150 ease-out touch-manipulation select-none hover:bg-[#16b82e] hover:shadow-sm active:scale-[0.97] active:duration-75 active:bg-[#128f24] active:shadow-inner";

const moreDetailsButtonClass =
  "border-[#19CA32] text-[#19CA32] hover:text-[#16b82f] bg-transparent hover:bg-transparent shadow-none transition-all duration-150 ease-out touch-manipulation select-none hover:border-[#19CA32] active:scale-[0.97] active:duration-75 active:border-[#16b82e] active:shadow-inner";

export default function GarageCard({ foundGarages, vehicle }: GarageCardProps) {
  const router = useRouter();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedGarage, setSelectedGarage] = useState<GarageData | null>(null);

  const handleMoreDetails = (garageId: string) => {
    const params = new URLSearchParams({ id: garageId });
    const reg = vehicle?.registration_number;
    if (reg) params.set("registration", reg);
    router.push(`/driver/book-my-mot/details?${params.toString()}`);
  };

  const handleBookNow = (garage: GarageData) => {
    setSelectedGarage(garage);
    setIsBookingModalOpen(true);
  };

  const formatDistance = (distance?: number) => {
    if (typeof distance !== "number" || Number.isNaN(distance)) return null;
    return `${distance.toFixed(1)} miles away`;
  };

  return (
    <div className="space-y-3 grid grid-cols-1 3xl:grid-cols-2 gap-2 md:gap-4">
      {foundGarages.map((garage) => (
        <div
          key={garage.id}
          className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm"
        >
          {/* ── Mobile layout (< lg) ── */}
          <div className="lg:hidden">
            {/* Top section */}
            <div className="flex items-start gap-3 p-3.5">
              <div className="relative h-20 w-24 shrink-0 rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Image
                  src={
                    (garage.garage_image || garage.avatar)?.trim()
                      ? (garage.garage_image || garage.avatar)!
                      : DEFAULT_GARAGE_AVATAR_SRC
                  }
                  alt={garage.garage_name}
                  width={72}
                  height={72}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between min-h-20">
                <h3 className="text-[15px] font-semibold text-gray-900 truncate leading-tight mb-1">
                  {garage.garage_name}
                </h3>
                <p className="flex items-center gap-1 text-[12px] text-gray-500 truncate">
                  <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                  {garage.address}
                </p>
                <p className="flex items-center gap-1 text-[12px] text-gray-400 mt-0.5">
                  <Navigation className="w-3 h-3 shrink-0" />
                  {formatDistance(garage.distance_miles)
                    ? `${formatDistance(garage.distance_miles)} · ${garage.post_code || garage.postcode}`
                    : garage.post_code || garage.postcode}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                  MOT Fee
                </span>
                <span className="text-[18px] font-bold text-[#19CA32] leading-tight">
                  £{garage.mot_price || "0.00"}
                </span>
              </div>
            </div>
            {garage.has_class7 && (
              <div className="px-3.5 pb-1 border-t border-gray-100 bg-white text-center">
                <span className="text-[11px] font-medium text-gray-600">
                  Also offers Class 7 MOTs (large vans & commercial)
                </span>
              </div>
            )}

            {/* VTS */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 border-t border-gray-100 bg-gray-50/60">
              <Hash className="w-3 h-3 text-gray-300 shrink-0" />
              <span className="text-[11px] text-gray-400">
                VTS: {garage.vts_number}
              </span>
            </div>

            {/* Trust badges */}
            <div className="flex items-center border-t border-gray-100">
              <div className="flex items-center gap-1.5 px-3.5 py-2 flex-1 border-r border-gray-100">
                <ShieldCheck className="w-3.5 h-3.5 text-[#19CA32] shrink-0" />
                <span className="text-[11px] text-gray-500">DVSA Approved</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-2 flex-1">
                <BadgeCheck className="w-3.5 h-3.5 text-[#19CA32] shrink-0" />
                <span className="text-[11px] text-gray-500">Pay at garage</span>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex items-center justify-end gap-2 p-3 border-t border-gray-100">
              <Button
                className={`${bookMotButtonClass} text-[13px] font-medium h-9 rounded-sm px-5 flex-1`}
                onClick={() => handleBookNow(garage)}
              >
                Book My MOT
              </Button>
              <Button
                variant="outline"
                className={`${moreDetailsButtonClass} text-[13px] font-medium h-9 rounded-sm px-5 flex-1`}
                onClick={() => handleMoreDetails(garage.id)}
              >
                More Details
              </Button>
            </div>
          </div>

          {/* ── Desktop layout (lg+) ── */}
          <div className="hidden lg:flex items-stretch">
            {/* Left: image — stretches to full card height */}
            <div className="shrink-0 w-52 relative bg-gray-50 border-r border-gray-100">
              <Image
                src={
                  garage.avatar?.trim()
                    ? garage.avatar
                    : DEFAULT_GARAGE_AVATAR_SRC
                }
                alt={garage.garage_name}
                fill
                className="object-cover"
              />
            </div>

            {/* Middle: info + trust + VTS */}
            <div className="flex flex-1 min-w-0 flex-col justify-center gap-2 px-5 py-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 truncate leading-tight mb-1">
                  {garage.garage_name}
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-gray-500 truncate mb-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  {garage.address}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
                  <Navigation className="w-3.5 h-3.5 shrink-0" />
                  {formatDistance(garage.distance_miles)
                    ? `${formatDistance(garage.distance_miles)} · ${garage.postcode}`
                    : garage.postcode}
                </p>
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-gray-300 shrink-0" />
                  <span className="text-sm text-gray-400">
                    VTS: {garage.vts_number}
                  </span>
                </div>
                {garage.has_class7 && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-2">
                    <Info className="size-3.5 shrink-0" />
                    <p className="text-sm text-gray-500">
                      Also offers Class 7 MOTs (large vans & commercial)
                    </p>
                  </div>
                )}
              </div>

              {/* Trust + VTS */}
              <div className="flex items-center gap-5 pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-5 text-[#19CA32] shrink-0" />
                  <span className="text-sm text-gray-500">DVSA Approved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="size-5 text-[#19CA32] shrink-0" />
                  <span className="text-sm text-gray-500">Pay at garage</span>
                </div>
              </div>
            </div>
            {/* Right: price + buttons — no border, vertically centered */}
            <div className="shrink-0 w-48 flex flex-col items-center justify-center gap-3 px-5 py-4">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  MOT Fee
                </span>
                <span className="text-[26px] font-bold text-[#19CA32] leading-tight">
                  £{garage.mot_price || "0.00"}
                </span>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button
                  className={`${bookMotButtonClass} w-full text-[13px] font-medium h-9 rounded-sm`}
                  onClick={() => handleBookNow(garage)}
                >
                  Book My MOT
                </Button>
                <Button
                  variant="outline"
                  className={`${moreDetailsButtonClass} w-full text-[13px] font-medium h-9 rounded-sm`}
                  onClick={() => handleMoreDetails(garage.id)}
                >
                  More Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        garage={
          selectedGarage
            ? {
                id: selectedGarage.id,
                garage_name: selectedGarage.garage_name,
                address: selectedGarage.address,
                email: selectedGarage.email,
                phone_number: selectedGarage.phone_number,
              }
            : null
        }
        vehicleId={vehicle?.id || vehicle?.vehicle_id}
        vehicleRegistrationNumber={vehicle?.registration_number}
      />
    </div>
  );
}
