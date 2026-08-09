"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TimePickerPopoverProps {
  value: string; // e.g. "13:00" or "09:30"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function TimePickerPopover({
  value,
  onChange,
  className = "",
  disabled = false,
}: TimePickerPopoverProps) {
  const [open, setOpen] = useState(false);

  // Parse "13:00" into 12-hour format: hour (1-12), minute ("00","15","30","45"), period ("AM"|"PM")
  const parseTime = (timeStr: string) => {
    if (!timeStr || !timeStr.includes(":")) {
      return { hour: 12, minute: "00", period: "PM" };
    }
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    const minute = String(m).padStart(2, "0");
    return { hour: hour12, minute, period };
  };

  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");

  useEffect(() => {
    const { hour, minute, period } = parseTime(value);
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period as "AM" | "PM");
  }, [value, open]);

  // Convert 12-hour format back to 24-hour string "13:00"
  const emit24Time = (h12: number, minStr: string, periodStr: "AM" | "PM") => {
    let h24 = h12 % 12;
    if (periodStr === "PM") h24 += 12;
    const formattedH = String(h24).padStart(2, "0");
    onChange(`${formattedH}:${minStr}`);
  };

  const handleHourSelect = (h: number) => {
    setSelectedHour(h);
    emit24Time(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (m: string) => {
    setSelectedMinute(m);
    emit24Time(selectedHour, m, selectedPeriod);
  };

  const handlePeriodSelect = (p: "AM" | "PM") => {
    setSelectedPeriod(p);
    emit24Time(selectedHour, selectedMinute, p);
  };

  const formattedDisplay = () => {
    const { hour, minute, period } = parseTime(value);
    return `${hour}:${minute} ${period}`;
  };

  const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const MINUTES = ["00", "15", "30", "45"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`h-9 w-full justify-between text-left font-medium bg-white border-gray-300 rounded-lg text-xs hover:bg-gray-50 focus:ring-1 focus:ring-[#19CA32] cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#19CA32]" />
            <span className="text-gray-900 font-semibold">{formattedDisplay()}</span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3 bg-white border border-gray-200 shadow-xl rounded-xl" align="start">
        <div className="space-y-3">
          {/* Header AM / PM Toggle */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700">Select Time</span>
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePeriodSelect("AM")}
                className={`h-6 px-2.5 text-[11px] font-bold rounded-md cursor-pointer transition-colors ${
                  selectedPeriod === "AM"
                    ? "bg-[#19CA32] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                AM
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handlePeriodSelect("PM")}
                className={`h-6 px-2.5 text-[11px] font-bold rounded-md cursor-pointer transition-colors ${
                  selectedPeriod === "PM"
                    ? "bg-[#19CA32] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                PM
              </Button>
            </div>
          </div>

          {/* Hour & Minute Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Hours Column */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 text-center">
                Hour
              </span>
              <div className="grid grid-cols-3 gap-1 max-h-36 overflow-y-auto p-1">
                {HOURS.map((h) => (
                  <Button
                    key={h}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleHourSelect(h)}
                    className={`h-7 w-full p-0 text-xs font-semibold rounded-md cursor-pointer ${
                      selectedHour === h
                        ? "bg-emerald-50 border border-emerald-300 text-[#19CA32] font-bold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {h}
                  </Button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 text-center">
                Minute
              </span>
              <div className="grid grid-cols-1 gap-1">
                {MINUTES.map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMinuteSelect(m)}
                    className={`h-7 w-full text-xs font-semibold rounded-md cursor-pointer ${
                      selectedMinute === m
                        ? "bg-emerald-50 border border-emerald-300 text-[#19CA32] font-bold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    :{m}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Done Button */}
          <div className="pt-2 border-t border-gray-100">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full h-8 text-xs font-bold bg-[#19CA32] hover:bg-[#15b02b] text-white rounded-lg shadow-xs cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
