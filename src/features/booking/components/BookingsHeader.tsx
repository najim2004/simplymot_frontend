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
import { cn } from "@/lib/utils";

export interface BookingsHeaderProps {
  title?: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  searchTerm: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onSearchChange: (search: string) => void;
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
              "h-11 w-full justify-start px-2.5 sm:px-4 text-xs sm:text-sm font-normal sm:min-w-47.5 border-gray-300",
              !date ? "text-muted-foreground" : "pr-8 sm:pr-10",
            )}
          >
            <CalendarIcon className="mr-1.5 sm:mr-2 h-4 w-4 shrink-0" />
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
          className="absolute right-1.5 sm:right-2 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          aria-label={`Clear ${placeholder}`}
          title={`Clear ${placeholder}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function BookingsHeader({
  title = "List of all Bookings",
  startDate,
  endDate,
  searchTerm,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
}: BookingsHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">
        {title}
      </h1>

      {/* Date Filter and Search on the right */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block h-11 w-full sm:w-72 pl-10 pr-9 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
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
      </div>
    </div>
  );
}
