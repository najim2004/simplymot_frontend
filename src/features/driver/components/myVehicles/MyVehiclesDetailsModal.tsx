import React from "react";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import type { Vehicle } from "@/features/driver";

interface VehicleDetailsModalProps {
  isOpen: boolean;
  selectedVehicle: Vehicle | null;
  onClose: () => void;
  onBookMyMOT: () => void;
  onMotReports: () => void;
  formatDate: (dateString: string) => string;
  brandColor?: string;
  brandColorHover?: string;
}

export default function VehicleDetailsModal({
  isOpen,
  selectedVehicle,
  onClose,
  onBookMyMOT,
  onMotReports,
  formatDate,
  brandColor = "#19CA32",
  brandColorHover = "#16b82e",
}: VehicleDetailsModalProps) {
  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        selectedVehicle
          ? `MOT Details for ${selectedVehicle.registrationNumber}`
          : "Vehicle Details"
      }
      showHeader={false}
      className="max-w-sm"
    >
      {selectedVehicle && (
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className={`bg-[${brandColor}] text-white p-4 text-center`}>
            <h2 className="text-lg font-semibold">MOT check</h2>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* MOT Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">MOT</span>
              <span className="text-sm text-gray-600">
                Expiry {formatDate(selectedVehicle.expiryDate)}
              </span>
            </div>

            {/* Model Variant */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Model variant</span>
              <span className="text-sm text-gray-600">
                {selectedVehicle.make} {selectedVehicle.model}
              </span>
            </div>

            {/* Action Buttons */}
            <Button
              onClick={onBookMyMOT}
              className={`w-full cursor-pointer bg-[${brandColor}] hover:bg-[${brandColorHover}] text-white font-medium py-3 mt-6 mb-6 rounded-lg`}
            >
              Book My MOT
            </Button>
            <Button
              onClick={onMotReports}
              className={`w-full cursor-pointer bg-[${brandColor}] hover:bg-[${brandColorHover}] text-white font-medium py-3 rounded-lg`}
            >
              MOT Reports
            </Button>
          </div>
        </div>
      )}
    </CustomReusableModal>
  );
}
