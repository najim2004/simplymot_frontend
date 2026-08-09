"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
} from "lucide-react";
import { HolidayItem } from "../../types";

interface CalendarViewProps {
  year: number;
  month: number;
  holidays?: HolidayItem[];
  isLoading?: boolean;
  onMonthChange: (year: number, month: number) => void;
  onDateSelect: (date: string) => void;
  onModalClose?: () => void;
}

export default function CalendarView({
  year,
  month,
  holidays = [],
  isLoading = false,
  onMonthChange,
  onDateSelect,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(year);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const shortMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  React.useEffect(() => {
    setPickerYear(year);
  }, [year]);

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (month === 1) {
        onMonthChange(year - 1, 12);
      } else {
        onMonthChange(year, month - 1);
      }
    } else {
      if (month === 12) {
        onMonthChange(year + 1, 1);
      } else {
        onMonthChange(year, month + 1);
      }
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    onMonthChange(today.getFullYear(), today.getMonth() + 1);
  };

  const handleSelectMonth = (monthIndex: number) => {
    onMonthChange(pickerYear, monthIndex + 1);
    setIsPickerOpen(false);
  };

  const handleDateClick = (dateStr: string, isCurrentMonth: boolean) => {
    if (isCurrentMonth) {
      setSelectedDate(dateStr);
      onDateSelect(dateStr);
    }
  };

  const formatLocalISO = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(year, month - 1, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const todayStr = formatLocalISO(new Date());

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = formatLocalISO(currentDate);
      const isCurrentMonth = currentDate.getMonth() === month - 1;
      const isToday = dateStr === todayStr;
      const isSelected = selectedDate === dateStr;
      const holidayItem = holidays.find((h) => {
        if (!h.date) return false;
        const hDate = new Date(h.date);
        return formatLocalISO(hDate) === dateStr;
      });

      days.push({
        date: currentDate.getDate(),
        dateStr,
        isCurrentMonth,
        isToday,
        isSelected,
        isHoliday: Boolean(holidayItem),
        holidayName: holidayItem?.name || holidayItem?.description || null,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Card className="w-full bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      <CardHeader className="border-b border-gray-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">
              Slots & Holiday Calendar
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Click any date to manage or block/unblock MOT slots
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {/* Navigation Bar: Far Left Arrow, Center Month/Year/Today, Far Right Arrow */}
        <div className="flex items-center justify-between mb-5">
          {/* Far Left Arrow */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50 rounded-lg cursor-pointer flex-shrink-0"
            onClick={() => navigateMonth("prev")}
            disabled={isLoading}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </Button>

          {/* Center Month/Year & Today */}
          <div className="flex items-center gap-2">
            <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 px-3 py-1 text-sm font-bold text-gray-900 hover:bg-gray-100/80 rounded-lg border border-gray-200 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-[#19CA32]" />
                  <span>
                    {months[month - 1]} {year}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-64 p-3 bg-white border border-gray-200 shadow-xl rounded-xl"
                align="center"
              >
                {/* Year Header Navigator */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md cursor-pointer"
                    onClick={() => setPickerYear((prev) => prev - 1)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                  </Button>
                  <span className="text-sm font-bold text-gray-900">
                    {pickerYear}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md cursor-pointer"
                    onClick={() => setPickerYear((prev) => prev + 1)}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                  </Button>
                </div>

                {/* Month 3x4 Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {shortMonths.map((m, idx) => {
                    const isCurrent =
                      pickerYear === year && idx === month - 1;
                    return (
                      <Button
                        key={m}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectMonth(idx)}
                        className={`h-8 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                          isCurrent
                            ? "bg-[#19CA32] text-white hover:bg-[#15b02b] shadow-xs"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {m}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Today Jump Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTodayClick}
              className="h-9 px-2.5 text-xs font-semibold border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 cursor-pointer"
            >
              Today
            </Button>
          </div>

          {/* Far Right Arrow */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50 rounded-lg cursor-pointer flex-shrink-0"
            onClick={() => navigateMonth("next")}
            disabled={isLoading}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-semibold text-gray-500 uppercase py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={`${day.dateStr}-${index}`}
              onClick={() => handleDateClick(day.dateStr, day.isCurrentMonth)}
              title={
                day.holidayName ? `Holiday: ${day.holidayName}` : undefined
              }
              className={`h-10 w-full flex items-center justify-center text-xs cursor-pointer transition-all relative rounded-lg ${
                !day.isCurrentMonth
                  ? "text-gray-300 pointer-events-none"
                  : "text-gray-700"
              }`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all relative font-medium ${
                  day.isToday
                    ? "border-2 border-[#19CA32] text-[#19CA32] bg-emerald-50 font-bold"
                    : ""
                } ${
                  day.isSelected && !day.isToday
                    ? "bg-[#19CA32] text-white font-bold"
                    : ""
                } ${
                  day.isHoliday && !day.isToday && !day.isSelected
                    ? "border border-rose-300 bg-rose-50 text-rose-600 font-bold"
                    : ""
                } ${
                  !day.isToday &&
                  !day.isSelected &&
                  !day.isHoliday &&
                  day.isCurrentMonth
                    ? "hover:bg-gray-100"
                    : ""
                }`}
              >
                {day.date}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-[#19CA32] bg-emerald-50" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#19CA32]" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span>Holiday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
