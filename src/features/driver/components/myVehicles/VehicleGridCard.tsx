import React from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { ApiVehicle } from "../../types";
import { getBrandLogo } from "@/lib/helper/vehicle.helper";

interface VehicleGridCardProps {
  vehicle: ApiVehicle;
  isDeleting?: boolean;
  onVehicleClick: (vehicle: ApiVehicle) => void;
  onDeleteClick: () => void;
}

export default function VehicleGridCard({
  vehicle,
  isDeleting = false,
  onVehicleClick,
  onDeleteClick,
}: VehicleGridCardProps) {
  const logo = getBrandLogo(vehicle?.make) || null;
  return (
    <div
      className="bg-[#F8FAFB] relative rounded-lg p-6 border border-[#B8EFBF] cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => onVehicleClick(vehicle)}
    >
      {/* Delete Button */}
      <button
        onClick={() => onDeleteClick()}
        disabled={isDeleting}
        className="absolute cursor-pointer top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove Vehicle"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Vehicle Image or Brand Name Fallback */}
      <div className="flex justify-center mb-4">
        <div className="rounded-lg flex items-center justify-center w-[120px] h-[120px]">
          {!logo ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="w-16 h-16 bg-linear-to-br from-[#19CA32] to-[#16b82e] rounded-full flex items-center justify-center mb-2 shadow-md">
                <span className="text-white text-2xl font-bold">
                  {vehicle.make.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 font-semibold text-sm text-center px-2">
                {vehicle.make}
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image
                src={logo}
                alt={`${vehicle.make} ${vehicle.model}`}
                width={120}
                height={120}
                className="object-contain w-full h-full"
                style={{ maxWidth: "70px", maxHeight: "70px" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Registration Number */}
      <div className="text-center mb-4">
        <div className="bg-black text-white px-3 py-1 rounded inline-block text-sm font-bold">
          {vehicle.registration_number}
        </div>
        <div className="lg:hidden mt-2 text-xs text-gray-500 flex items-center justify-center gap-1">
          <span>Tap to manage</span>
        </div>
      </div>
    </div>
  );
}
