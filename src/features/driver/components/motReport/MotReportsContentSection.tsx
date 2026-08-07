import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReportCard from "./ReportCard";
import ReportCardShimmer from "./ReportCardShimmer";
import VehicleHeaderShimmer from "./VehicleHeaderShimmer";
import NoReportsMessage from "./NoReportsMessage";
import NoVehicleSelected from "./NoVehicleSelected";
import type { ApiVehicle, MotHistoryItem } from "../../types";

interface MotReportsContentSectionProps {
  isLoadingMotReports: boolean;
  isLoadingDetails: boolean;
  showDetails: boolean;
  selectedVehicle: ApiVehicle | null;
  filteredReports: MotHistoryItem[];
  totalReports: number;
  currentPage: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function MotReportsContentSection({
  isLoadingMotReports,
  isLoadingDetails,
  showDetails,
  selectedVehicle,
  filteredReports,
  totalReports,
  currentPage,
  limit,
  onPageChange,
}: MotReportsContentSectionProps) {
  const totalPages = Math.ceil(totalReports / limit) || 1;

  // Show shimmer when loading MOT reports
  if ((isLoadingMotReports || isLoadingDetails) && showDetails) {
    return (
      <div>
        <VehicleHeaderShimmer />
        <div className="flex items-center justify-between gap-2 mb-3">
          <Skeleton className="h-6 sm:h-7 w-32 bg-gray-200" />
          <Skeleton className="h-8 w-20 rounded bg-gray-200" />
        </div>
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <ReportCardShimmer key={`shimmer-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  // Show actual reports when loaded
  if (!isLoadingMotReports && !isLoadingDetails && showDetails && selectedVehicle) {
    const startCount = (currentPage - 1) * limit + 1;
    const endCount = Math.min(currentPage * limit, totalReports);

    return (
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}

        {filteredReports.length === 0 && !isLoadingMotReports && (
          <NoReportsMessage />
        )}

        {/* Standard Page-limit / Numbered Pagination Controls */}
        {totalReports > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 mt-6">
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{startCount}</span> to{" "}
              <span className="font-bold text-gray-900">{endCount}</span> of{" "}
              <span className="font-bold text-gray-900">{totalReports}</span> reports
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoadingMotReports}
                  className="flex items-center gap-1 cursor-pointer text-xs h-8 px-2.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        disabled={isLoadingMotReports}
                        className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer transition-colors ${
                          currentPage === pageNum
                            ? "bg-[#19CA32] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoadingMotReports}
                  className="flex items-center gap-1 cursor-pointer text-xs h-8 px-2.5"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show message when no vehicle selected
  if (!isLoadingDetails && !showDetails && !isLoadingMotReports) {
    return <NoVehicleSelected />;
  }

  return null;
}
