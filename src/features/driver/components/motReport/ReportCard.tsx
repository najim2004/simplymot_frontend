import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOTReport } from "../../types/mot-report.types";
import {
  formatDate,
  getStatusStyles,
} from "../../utils/mot-report.utils";

interface ReportCardProps {
  report: MOTReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  const styles = getStatusStyles(report.motStatus);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Pass Badge */}
        <div className="flex-shrink-0">
          <span
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${styles.badge} whitespace-nowrap`}
          >
            {report.motStatus}
          </span>
        </div>

        {/* MOT Test Number */}
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            MOT test number
          </Label>
          <Input
            value={report.motTestNumber}
            readOnly
            className="bg-gray-50 border-gray-300 text-gray-900"
          />
        </div>

        {/* MOT Test Date */}
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            MOT Test Date
          </Label>
          <Input
            value={formatDate(report.motPassDate)}
            readOnly
            className={`bg-green-50 border-green-300 text-gray-900 ${styles.passDate}`}
          />
        </div>

        {/* MOT Expired On */}
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-medium text-gray-700 mb-2 block capitalize">
            MOT expiry
          </Label>
          <Input
            value={formatDate(report.motExpiryDate)}
            readOnly
            className="bg-gray-50 border-gray-300 text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}
