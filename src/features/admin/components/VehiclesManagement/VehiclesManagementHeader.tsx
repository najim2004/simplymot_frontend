"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import AutoReminder from "./AutoRemainder";

export interface VehiclesManagementHeaderProps {
  title?: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  searchTerm: string;
  expiryStatus?: string;
  sortByExpiry?: "asc" | "desc" | undefined;
  selectedRowsCount?: number;
  needsReminderCount?: number;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onSearchChange: (search: string) => void;
  onExpiryStatusChange: (status: string) => void;
  onSortByExpiryChange: (value: string) => void;
  onSendReminderClick?: () => void;
}

interface DatePickerInputProps {
  placeholder: string;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

function DatePickerInput({
  placeholder,
  date,
  onDateChange,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-11 w-full justify-start px-2.5 sm:px-4 text-xs sm:text-sm font-normal sm:min-w-42.5 border-gray-300 bg-white hover:bg-gray-50",
              !date ? "text-muted-foreground" : "pr-8 sm:pr-10",
            )}
          >
            <CalendarIcon className="mr-1.5 sm:mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <span className="truncate">
              {date ? format(date, "dd/MM/yyyy") : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarPicker
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
          className="absolute right-1.5 sm:right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          aria-label={`Clear ${placeholder}`}
          title={`Clear ${placeholder}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function VehiclesManagementHeader({
  title = "List of all Vehicles",
  startDate,
  endDate,
  searchTerm,
  expiryStatus = "all",
  sortByExpiry,
  selectedRowsCount = 0,
  needsReminderCount = 0,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
  onExpiryStatusChange,
  onSortByExpiryChange,
  onSendReminderClick,
}: VehiclesManagementHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
          {title}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
          <div className="w-full sm:w-40">
            <Select value={expiryStatus} onValueChange={onExpiryStatusChange}>
              <SelectTrigger className="h-11 w-full border-gray-300 bg-white text-xs sm:text-sm cursor-pointer">
                <SelectValue placeholder="All Vehicles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="expired_soon">Expired Soon</SelectItem>
                <SelectItem value="not_expired">Not Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40">
            <Select
              value={sortByExpiry || "none"}
              onValueChange={onSortByExpiryChange}
            >
              <SelectTrigger className="h-11 w-full border-gray-300 bg-white text-xs sm:text-sm cursor-pointer">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Sort</SelectItem>
                <SelectItem value="asc">Earliest First</SelectItem>
                <SelectItem value="desc">Latest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:flex-row sm:w-auto">
            <DatePickerInput
              placeholder="Start Date"
              date={startDate}
              onDateChange={onStartDateChange}
            />
            <DatePickerInput
              placeholder="End Date"
              date={endDate}
              onDateChange={onEndDateChange}
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block h-11 w-full sm:w-64 pl-9 pr-9 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs sm:text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <AutoReminder vehiclesNeedingReminder={needsReminderCount} />
        </div>
      </div>

      {selectedRowsCount > 0 && onSendReminderClick && (
        <div className="flex items-center">
          <Button
            onClick={onSendReminderClick}
            className="bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold px-4 h-10 cursor-pointer"
          >
            Send Reminder ({selectedRowsCount})
          </Button>
        </div>
      )}
    </div>
  );
}

export default VehiclesManagementHeader;
