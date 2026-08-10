import React from "react";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import type { ApiVehicle } from "@/features/driver";

interface VehicleDetailsModalProps {
  isOpen: boolean;
  selectedVehicle: ApiVehicle | null;
  onClose: () => void;
  onBookMyMOT: () => void;
  onMotReports: () => void;
  brandColor?: string;
  brandColorHover?: string;
}

export default function MyVehiclesDetailsModal({
  isOpen,
  selectedVehicle,
  onClose,
  onBookMyMOT,
  onMotReports,
  brandColor = "#19CA32",
  brandColorHover = "#16b82e",
}: VehicleDetailsModalProps) {
  if (!selectedVehicle) return null;

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const isExpired =
    selectedVehicle.is_expired ||
    (selectedVehicle.mot_expiry_date &&
      new Date(selectedVehicle.mot_expiry_date) < new Date());

  const motStatus =
    selectedVehicle.mot_status || (isExpired ? "Expired" : "Valid");

  return (
    <CustomReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vehicle Details - ${selectedVehicle.registration_number}`}
      showHeader={false}
      hideClose={true}
      contentClassName="p-0"
      className="max-w-md sm:max-w-xl"
    >
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Simple Green Header */}
        <div className={`bg-[${brandColor}] text-white p-4 text-center`}>
          <h2 className="text-lg font-semibold">Vehicle Details</h2>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* Registration Number */}
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">
              Registration Number
            </span>
            <div className="font-bold font-mono">
              {selectedVehicle.registration_number}
            </div>
          </div>

          {/* Make & Model */}
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">Make & Model</span>
            <span className="font-semibold text-gray-900 capitalize">
              {selectedVehicle.make.toLowerCase()}{" "}
              <span className="uppercase">{selectedVehicle.model}</span>
            </span>
          </div>

          {/* MOT Status & Expiry */}
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">MOT Expiry Status</span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded font-semibold text-xs uppercase ${
                  isExpired
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {motStatus}
              </span>
              <span className="font-medium text-gray-800">
                {formatDate(selectedVehicle.mot_expiry_date)}
              </span>
            </div>
          </div>

          {/* Tax Status & Tax Due Date */}
          {selectedVehicle.tax_status && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Tax Status</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-xs uppercase">
                  {selectedVehicle.tax_status}
                </span>
                {selectedVehicle.tax_due_date && (
                  <span className="font-medium text-gray-800">
                    {formatDate(selectedVehicle.tax_due_date)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Fuel Type */}
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">Fuel Type</span>
            <span className="font-medium text-gray-800 uppercase">
              {selectedVehicle.fuel_type || "N/A"}
            </span>
          </div>

          {/* Colour */}
          <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
            <span className="text-gray-500 font-medium">Colour</span>
            <span className="font-medium text-gray-800 uppercase">
              {selectedVehicle.color || "N/A"}
            </span>
          </div>

          {/* Engine Capacity */}
          {selectedVehicle.engine_capacity && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Engine Capacity</span>
              <span className="font-medium text-gray-800">
                {selectedVehicle.engine_capacity.toLocaleString()} cc
              </span>
            </div>
          )}

          {/* CO2 Emissions */}
          {selectedVehicle.co2_emissions && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">CO₂ Emissions</span>
              <span className="font-medium text-gray-800">
                {selectedVehicle.co2_emissions} g/km
              </span>
            </div>
          )}

          {/* Year of Manufacture */}
          {selectedVehicle.year_of_manufacture && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">
                Year of Manufacture
              </span>
              <span className="font-medium text-gray-800">
                {selectedVehicle.year_of_manufacture}
              </span>
            </div>
          )}

          {/* Month of First Registration */}
          {selectedVehicle.month_of_first_reg && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">
                First Registered
              </span>
              <span className="font-medium text-gray-800">
                {selectedVehicle.month_of_first_reg}
              </span>
            </div>
          )}

          {/* Wheelplan & Type Approval */}
          {selectedVehicle.wheelplan && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Wheelplan</span>
              <span className="font-medium text-gray-800 uppercase">
                {selectedVehicle.wheelplan}
              </span>
            </div>
          )}

          {/* Last V5C Issued */}
          {selectedVehicle.date_of_last_v5c_issued && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Last V5C Issued</span>
              <span className="font-medium text-gray-800">
                {formatDate(selectedVehicle.date_of_last_v5c_issued)}
              </span>
            </div>
          )}

          {/* Last Synced */}
          {selectedVehicle.mot_last_checked_at && (
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
              <span className="text-gray-500 font-medium">Last Synced At</span>
              <span className="font-medium text-gray-700">
                {formatDate(selectedVehicle.mot_last_checked_at)}
              </span>
            </div>
          )}

          {/* Action Buttons: Close Button Far Left */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5 text-sm rounded-lg cursor-pointer order-last sm:order-first"
            >
              Close
            </Button>

            <Button
              onClick={onMotReports}
              className={`w-full cursor-pointer bg-[${brandColor}] hover:bg-[${brandColorHover}] text-white font-medium py-2.5 text-sm rounded-lg transition-all duration-200`}
            >
              MOT Reports
            </Button>
            <Button
              onClick={onBookMyMOT}
              className={`w-full cursor-pointer bg-[${brandColor}] hover:bg-[${brandColorHover}] text-white font-medium py-2.5 text-sm rounded-lg transition-all duration-200`}
            >
              Book My MOT
            </Button>
          </div>
        </div>
      </div>
    </CustomReusableModal>
  );
}
