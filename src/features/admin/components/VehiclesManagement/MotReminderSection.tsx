"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import AutoReminder from "./AutoRemainder";
import { useAutoReminderSettings } from "./useAutoReminder";
import { toast } from "react-toastify";

interface MotReminderSectionProps {
  selectedRowsCount: number;
  needsReminderCount: number;
  onSendReminderClick: () => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

const DatePicker = ({ date, onDateChange, placeholder }: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder: string;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full min-w-[200px] justify-start pr-10 text-left font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {date ? format(date, "dd/MM/yyyy") : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              setOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {date && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDateChange(undefined);
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label={`Clear ${placeholder}`}
          title={`Clear ${placeholder}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const DateFilter = ({ label, date, onDateChange }: {
  label: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}) => (
  <div className="flex-1 min-w-0 max-w-full sm:max-w-[280px]">
    <DatePicker date={date} onDateChange={onDateChange} placeholder={label} />
  </div>
);

export default function MotReminderSection({
  selectedRowsCount,
  needsReminderCount,
  onSendReminderClick,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: MotReminderSectionProps) {
  const { autoReminderEnabled } = useAutoReminderSettings();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">MOT Reminder</h1>
          <p className="text-sm text-gray-500">Manage and send MOT reminders to Customers</p>
        </div>
        <div className="flex items-center gap-3">
          <AutoReminder vehiclesNeedingReminder={needsReminderCount} />
        </div>
      </div>

      {/* Action Buttons and Filters Section */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <Button
            onClick={onSendReminderClick}
            disabled={selectedRowsCount === 0}
            className="bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-10"
          >
            Send Reminder ({selectedRowsCount})
          </Button>
          {autoReminderEnabled && needsReminderCount > 0 && (
            <Button
              onClick={() => {
                // UI only - no API call
                toast.info(`Auto reminder will be sent to ${needsReminderCount} driver(s) based on your settings`);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md h-10"
            >
              Send Auto Reminder ({needsReminderCount})
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3">
          <DateFilter label="Start Date" date={startDate} onDateChange={onStartDateChange} />
          <DateFilter label="End Date" date={endDate} onDateChange={onEndDateChange} />
        </div>
      </div>
    </div>
  );
}

