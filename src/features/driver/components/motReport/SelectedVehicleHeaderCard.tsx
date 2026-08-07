import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface SelectedVehicleHeaderCardProps {
  make?: string;
  model?: string;
  registrationNumber?: string;
  color?: string;
  fuelType?: string;
  monthOfFirstReg?: string;
}

export function SelectedVehicleHeaderCard({
  make,
  model,
  registrationNumber,
  color = "",
  fuelType = "",
  monthOfFirstReg = "",
}: SelectedVehicleHeaderCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
      {/* Header Row: Title, Registration Number & Download Reports Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-lg sm:text-xl font-bold text-gray-900 capitalize">
            {make?.toLowerCase()} <span className="uppercase">{model}</span>
          </div>
          <div className="bg-black text-white px-3 py-1 rounded text-xs font-bold font-mono tracking-wider">
            {registrationNumber}
          </div>
        </div>

        <Button
          onClick={() =>
            window.open("https://www.gov.uk/check-mot-history", "_blank")
          }
          size="sm"
          className="bg-[#19CA32] cursor-pointer hover:bg-[#16b82e] text-white px-3.5 py-1.5 flex items-center gap-2 text-xs font-medium rounded-md"
        >
          <Download className="w-4 h-4" />
          Download Reports
        </Button>
      </div>

      {/* 3-Column Layout with Labels and Styled Div Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            Colour
          </Label>
          <div className="bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm uppercase font-medium">
            {color || "N/A"}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            Fuel type
          </Label>
          <div className="bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm uppercase font-medium">
            {fuelType || "N/A"}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            Month of first reg
          </Label>
          <div className="bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            {monthOfFirstReg || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}
