import React, { memo, useMemo, useState } from "react";
import Image from "next/image";
import { ApiVehicle } from "@/features/driver/types/driver.types";
import { getBrandLogo } from "@/lib/helper/vehicle.helper";

interface VehiclesCardReusbleProps {
  vehicles?: ApiVehicle[];
  motReports?: any[]; // Backward compatibility
  onVehicleClick?: (vehicle: ApiVehicle) => void;
  selectedVehicleId?: string | null;
  isLoading?: boolean;
}

const SkeletonCard = memo(() => (
  <div className="bg-[#F8FAFB] rounded-lg p-6 border border-[#B8EFBF] animate-pulse">
    <div className="flex justify-center mb-4">
      <div className="w-[100px] h-[100px] bg-gray-200 rounded-lg"></div>
    </div>
    <div className="text-center mb-4">
      <div className="bg-gray-300 px-3 py-1 rounded inline-block text-sm font-bold w-20 h-6"></div>
    </div>
  </div>
));

const VehicleCardItem = memo(
  ({
    vehicle,
    isSelected,
    onVehicleClick,
  }: {
    vehicle: ApiVehicle;
    isSelected: boolean;
    onVehicleClick?: (vehicle: ApiVehicle) => void;
  }) => {
    const [imageError, setImageError] = useState(false);
    const logo = getBrandLogo(vehicle.make);

    return (
      <div
        className={`bg-[#F8FAFB] rounded-lg p-6 border border-[#B8EFBF] cursor-pointer hover:shadow-md transition-all duration-200 group ${isSelected ? "ring-2 ring-[#19CA32]" : ""}`}
        onClick={() => onVehicleClick?.(vehicle)}
      >
        {/* Vehicle Image or Brand Logo */}
        <div className="flex justify-center mb-4">
          <div className="rounded-lg flex items-center justify-center w-[120px] h-[120px]">
            {imageError || !logo ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-16 h-16 bg-linear-to-br from-[#19CA32] to-[#16b82e] rounded-full flex items-center justify-center mb-2 shadow-md">
                  <span className="text-white text-2xl font-bold">
                    {vehicle.make?.charAt(0).toUpperCase() || "V"}
                  </span>
                </div>
                <span className="text-gray-700 font-semibold text-sm text-center px-2 capitalize">
                  {vehicle.make || "Vehicle"}
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
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Registration Number */}
        <div className="text-center mb-4">
          <div className="bg-black text-white px-3 py-1 rounded inline-block text-sm font-bold font-mono tracking-wider">
            {vehicle.registration_number}
          </div>
        </div>
      </div>
    );
  },
);

const VehiclesCardReusble = memo(
  ({
    vehicles,
    motReports,
    onVehicleClick,
    selectedVehicleId,
    isLoading = false,
  }: VehiclesCardReusbleProps) => {
    // Resolve vehicles array directly from vehicles or legacy motReports
    const list: ApiVehicle[] = useMemo(() => {
      if (vehicles && vehicles.length > 0) return vehicles;
      if (motReports && motReports.length > 0) {
        return motReports.map((v: any) => ({
          id: v.vehicleId || v.id,
          registration_number: v.vehicleReg || v.registration_number,
          make: v.vehicleMake || v.make,
          model: v.vehicleModel || v.model,
        }));
      }
      return [];
    }, [vehicles, motReports]);

    const vehicleCards = useMemo(() => {
      if (isLoading) {
        return (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        );
      }

      if (list.length === 0) {
        return (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 text-lg">No vehicles found.</p>
            <p className="text-gray-500 text-sm mt-2">
              Add vehicles to see MOT reports here.
            </p>
          </div>
        );
      }

      return list.map((vehicle) => {
        const isSelected = selectedVehicleId === vehicle.id;
        return (
          <VehicleCardItem
            key={vehicle.id}
            vehicle={vehicle}
            isSelected={isSelected}
            onVehicleClick={onVehicleClick}
          />
        );
      });
    }, [list, selectedVehicleId, onVehicleClick, isLoading]);

    return (
      <div className="bg-white rounded-md shadow-xs p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicleCards}
        </div>
      </div>
    );
  },
);

SkeletonCard.displayName = "SkeletonCard";
VehicleCardItem.displayName = "VehicleCardItem";
VehiclesCardReusble.displayName = "VehiclesCardReusble";

export default VehiclesCardReusble;
