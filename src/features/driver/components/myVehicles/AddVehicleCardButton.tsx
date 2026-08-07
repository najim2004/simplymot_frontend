import React from "react";
import { Plus } from "lucide-react";

interface AddVehicleCardButtonProps {
  onClick: () => void;
  brandColor?: string;
}

export default function AddVehicleCardButton({
  onClick,
  brandColor = "#19CA32",
}: AddVehicleCardButtonProps) {
  return (
    <div
      className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[${brandColor}] hover:bg-green-50 transition-colors`}
      onClick={onClick}
    >
      <div
        className={`w-12 h-12 bg-[${brandColor}] rounded-full flex items-center justify-center mb-4`}
      >
        <Plus className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Add Vehicle
      </h3>
      <p className="text-gray-500 text-center text-sm">
        Click to add a new vehicle to your collection
      </p>
    </div>
  );
}
