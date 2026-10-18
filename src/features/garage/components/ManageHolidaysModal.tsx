"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  Trash2,
  Plus,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  useAddHolidayMutation,
  useDeleteHolidayMutation,
  type HolidayItem,
} from "@/features/garage";
import { useToast } from "@/hooks/use-toast";

interface ManageHolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  garageId?: string;
  scheduleId?: string;
  holidays?: HolidayItem[];
  onSuccess?: () => void;
}

export default function ManageHolidaysModal({
  isOpen,
  onClose,
  garageId,
  scheduleId,
  holidays = [],
  onSuccess,
}: ManageHolidaysModalProps) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState<string>("");
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(
    null
  );

  const [addHoliday, { isLoading: isAdding }] = useAddHolidayMutation();
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation();

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined);
      setDescription("");
      setShowAddForm(false);
    }
  }, [isOpen]);

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return format(d, "dd/MM/yy");
    } catch {
      return dateStr;
    }
  };

  const handleAddHoliday = async () => {
    if (!selectedDate || !garageId || !scheduleId) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    if (holidays.some((h) => h.date === dateStr)) {
      toast({
        title: "Error",
        description: "This date is already added as a holiday",
        variant: "destructive",
      });
      return;
    }

    try {
      await addHoliday({
        garageId,
        scheduleId,
        body: {
          date: dateStr,
          name: description.trim() || undefined,
        },
      }).unwrap();

      toast({
        title: "Success",
        description: "Holiday added successfully",
      });

      setSelectedDate(undefined);
      setDescription("");
      setShowAddForm(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to add holiday";

      toast({
        title: "Error",
        description: errorMsg || "Failed to add holiday",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHoliday = async (holiday: HolidayItem) => {
    if (!holiday || !garageId || !scheduleId) return;

    setDeletingHolidayId(holiday.id);

    try {
      await deleteHoliday({
        garageId,
        scheduleId,
        holidayId: holiday.id,
      }).unwrap();

      toast({
        title: "Success",
        description: "Holiday deleted successfully",
      });
      setDeletingHolidayId(null);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to delete holiday";

      toast({
        title: "Error",
        description: errorMsg || "Failed to delete holiday",
        variant: "destructive",
      });
      setDeletingHolidayId(null);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isAdding && !isDeleting) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-sm sm:max-w-md p-0 overflow-hidden rounded-2xl border border-gray-200 shadow-xl bg-white [&>button]:hidden">
        {/* Brand Green Header Banner */}
        <div className="bg-[#19CA32] text-white p-4 text-center">
          <h2 className="text-base sm:text-lg font-bold">
            Manage Garage Holidays
          </h2>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Add Holiday Toggle / Form */}
          {showAddForm ? (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 space-y-3">
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Select Holiday Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full h-9 text-xs justify-start text-left font-normal bg-white border-gray-300 rounded-lg cursor-pointer ${
                        !selectedDate ? "text-gray-400" : "text-gray-900 font-semibold"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#19CA32]" />
                      {selectedDate
                        ? format(selectedDate, "dd/MM/yy")
                        : "Pick a date..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Description (Optional)
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Christmas Day, Bank Holiday"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && selectedDate) {
                      e.preventDefault();
                      handleAddHoliday();
                    }
                  }}
                  className="h-9 text-xs bg-white border-gray-300 rounded-lg focus-visible:ring-1 focus-visible:ring-[#19CA32]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-emerald-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="h-8 text-xs text-gray-600 hover:bg-gray-100 px-3 rounded-lg cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddHoliday}
                  disabled={!selectedDate || isAdding}
                  className="h-8 text-xs bg-[#19CA32] hover:bg-[#15b02b] text-white font-semibold px-4 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add</span>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full border-dashed border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-[#19CA32] hover:text-[#19CA32] text-xs font-semibold h-9 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 mb-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </Button>
          )}

          {/* Holidays List - Clean Readonly Cards */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-700">
              Scheduled Holidays
            </Label>

            {holidays.length > 0 ? (
              <div className="space-y-2">
                {holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0 font-bold">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">
                          {holiday.name || holiday.description || "Garage Holiday"}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                          {formatDisplayDate(holiday.date)}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteHoliday(holiday)}
                      disabled={deletingHolidayId === holiday.id}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex-shrink-0 cursor-pointer"
                    >
                      {deletingHolidayId === holiday.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : !showAddForm ? (
              <div className="text-center py-6 text-gray-400">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-medium text-gray-500">
                  No holidays added yet
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer Actions: Single Full-Width Action Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full h-10 text-sm font-semibold border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
