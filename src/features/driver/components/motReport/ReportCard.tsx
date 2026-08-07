import React from "react";
import { Label } from "@/components/ui/label";
import { MotHistoryItem } from "../../types/driver.types";
import { formatDate } from "../../utils/mot-report.utils";

interface ReportCardProps {
  report: MotHistoryItem;
}

export default function ReportCard({ report }: ReportCardProps) {
  const isPassed =
    !report.status ||
    report.status.toUpperCase() === "PASSED" ||
    report.status.toUpperCase() === "PASS";

  const statusText = report.status ? report.status.toUpperCase() : "PASSED";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Pass / Fail Badge */}
        <div className="flex-shrink-0">
          <span
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${
              isPassed
                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {statusText}
          </span>
        </div>

        {/* MOT Test Number */}
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            MOT test number
          </Label>
          <div className="bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm font-mono truncate">
            {report.id}
          </div>
        </div>

        {/* MOT Test Date */}
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            MOT Test Date
          </Label>
          <div className="bg-green-50 border border-green-300 text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            {formatDate(report.test_date)}
          </div>
        </div>

        {/* MOT Expiry */}
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            MOT expiry
          </Label>
          <div className="bg-gray-50 border border-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            {formatDate(report.test_date)}
          </div>
        </div>
      </div>
    </div>
  );
}
