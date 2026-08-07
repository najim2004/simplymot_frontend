"use client";

import React, { RefObject } from "react";
import { Check } from "lucide-react";
import { GarageCard } from "@/features/driver";
import {
  GarageSortBy,
  type GarageData,
  type VehicleData,
} from "@/features/driver/types/driver.types";

interface BookMyMotResultsSectionProps {
  resultsRef: RefObject<HTMLDivElement | null>;
  showResults: boolean;
  vehicle: VehicleData | null;
  garages: GarageData[];
  currentSortBy: string;
  onSortChange: (newSortBy: string) => void;
}

export const BookMyMotResultsSection: React.FC<
  BookMyMotResultsSectionProps
> = ({
  resultsRef,
  showResults,
  vehicle,
  garages,
  currentSortBy,
  onSortChange,
}) => {
  if (!showResults) return null;

  return (
    <>
      {/* Vehicle Not Found Error */}
      {showResults && vehicle === null && (
        <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mb-4">
          <div className="text-center py-6">
            <div className="text-red-500 text-lg font-medium mb-2">
              Vehicle Not Found
            </div>
            <p className="text-gray-600">
              No vehicle found with the registration number you provided. Please
              check and try again.
            </p>
          </div>
        </div>
      )}

      {/* Search Results Section */}
      <div ref={resultsRef} className="relative w-full mx-auto">
        {garages.length > 0 ? (
          <div className="mt-2">
            {/* Payment Message & Sort Dropdown */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex flex-col lg:flex-row justify-between items-start md:items-center gap-3">
              <p className="flex items-center gap-2 text-gray-700 text-sm xl:text-base font-medium">
                <Check className="h-5 w-5 shrink-0 text-[#19CA32]" />
                <span>No upfront payment - pay at the garage.</span>
              </p>

              {/* Sorting Dropdown (Triggers API sort via URL parameter) */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Sort by:
                </span>
                <select
                  value={currentSortBy || GarageSortBy.DISTANCE}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="border border-gray-300 rounded-md text-sm h-9 px-3 focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:border-transparent bg-white cursor-pointer"
                >
                  <option value={GarageSortBy.DISTANCE}>Distance</option>
                  <option value={GarageSortBy.PRICE_LOW_TO_HIGH}>
                    Price: Low to High
                  </option>
                  <option value={GarageSortBy.PRICE_HIGH_TO_LOW}>
                    Price: High to Low
                  </option>
                </select>
              </div>
            </div>

            {/* Garage List - Raw API Data directly */}
            <GarageCard foundGarages={garages} vehicle={vehicle as any} />
          </div>
        ) : vehicle && garages.length === 0 ? (
          <div className="bg-white rounded-md shadow-sm p-4 sm:p-6 mt-8">
            <div className="text-center py-6">
              <div className="text-red-500 text-lg font-medium mb-2">
                Garage Not Found
              </div>
              <p className="text-gray-600">
                No garage found with the postcode you provided. Please check and
                try again.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};
