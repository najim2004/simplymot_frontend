"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Clock, Coffee, FileText, Loader2 } from "lucide-react";
import {
  useGetScheduleQuery,
  useCreateBreakTimeMutation,
  useDeleteBreakTimeMutation,
  useGetGarageProfileQuery,
} from "@/features/garage";
import { useToast } from "@/hooks/use-toast";

interface Break {
  id: string;
  fromTime: string;
  toTime: string;
  description?: string;
}

interface BreaksModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayName: string;
  dayIndex: number;
  scheduleIntervalId?: string;
  breaks: Break[];
  onBreaksChange: (breaks: Break[]) => void;
  onSaveSuccess?: () => void;
}

export default function BreaksModal({
  isOpen,
  onClose,
  dayName,
  dayIndex,
  scheduleIntervalId,
  breaks,
  onBreaksChange,
  onSaveSuccess,
}: BreaksModalProps) {
  const { toast } = useToast();
  const [localBreaks, setLocalBreaks] = useState<Break[]>(breaks);
  const [deletingBreakId, setDeletingBreakId] = useState<string | null>(null);

  // New break form inputs state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDescription, setNewDescription] = useState("Lunch Break");
  const [newFromTime, setNewFromTime] = useState("12:00");
  const [newToTime, setNewToTime] = useState("13:00");

  const { data: profileResponse } = useGetGarageProfileQuery();
  const garageId = profileResponse?.data?.id;

  const [createBreakTime, { isLoading: isCreatingBreak }] =
    useCreateBreakTimeMutation();
  const [deleteBreakTime] = useDeleteBreakTimeMutation();

  useEffect(() => {
    if (isOpen) {
      setLocalBreaks([...breaks]);
      setShowAddForm(false);
    }
  }, [isOpen, breaks]);

  const handleConfirmAddBreak = async () => {
    if (!newFromTime || !newToTime) {
      toast({
        title: "Error",
        description: "Please enter start and end time for the break",
        variant: "destructive",
      });
      return;
    }

    if (!garageId || !scheduleIntervalId) {
      toast({
        title: "Error",
        description: "Schedule interval not found for this day",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await createBreakTime({
        garageId,
        scheduleIntervalId,
        body: {
          start_time: newFromTime,
          end_time: newToTime,
          description: newDescription.trim() || "Break",
        },
      }).unwrap();

      toast({
        title: "Success",
        description: res.message || "Break time created successfully",
      });

      setShowAddForm(false);
      setNewDescription("Lunch Break");
      setNewFromTime("12:00");
      setNewToTime("13:00");
      onSaveSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to create break time";

      toast({
        title: "Error",
        description: errorMsg || "Failed to create break time",
        variant: "destructive",
      });
    }
  };

  const handleRemoveBreak = async (breakId: string) => {
    const isRealBackendId = !breakId.startsWith("break-");

    if (isRealBackendId && garageId) {
      setDeletingBreakId(breakId);
      try {
        await deleteBreakTime({
          garageId,
          breakTimeId: breakId,
        }).unwrap();

        toast({
          title: "Success",
          description: "Break time deleted successfully",
        });

        const updatedBreaks = localBreaks.filter((b) => b.id !== breakId);
        setLocalBreaks(updatedBreaks);
        onBreaksChange(updatedBreaks);
        onSaveSuccess?.();
      } catch (err: unknown) {
        const errorMsg =
          typeof err === "object" && err !== null && "data" in err
            ? (err as { data?: { message?: string } }).data?.message
            : "Failed to delete break time";

        toast({
          title: "Error",
          description: errorMsg || "Failed to delete break time",
          variant: "destructive",
        });
      } finally {
        setDeletingBreakId(null);
      }
    } else {
      const updatedBreaks = localBreaks.filter((b) => b.id !== breakId);
      setLocalBreaks(updatedBreaks);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md p-0 overflow-hidden rounded-2xl border border-gray-200 shadow-xl bg-white [&>button]:hidden">
        {/* Brand Green Header */}
        <div className="bg-[#19CA32] text-white p-4 text-center">
          <h2 className="text-base sm:text-lg font-bold">
            Breaks for {dayName}
          </h2>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Form to Add New Break */}
          {showAddForm ? (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#19CA32] flex items-center justify-center flex-shrink-0 font-bold">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <Input
                  type="text"
                  placeholder="Break Description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="h-8 text-xs font-semibold bg-white border-gray-300 focus-visible:ring-1 focus-visible:ring-[#19CA32]"
                />
              </div>

              {/* Native Clean Time Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#19CA32]" />
                    <span>Start Time</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={newFromTime}
                      onChange={(e) => setNewFromTime(e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className="h-8 text-xs font-semibold bg-white border-gray-300 pr-8 cursor-pointer focus-visible:ring-1 focus-visible:ring-[#19CA32] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none"
                    />
                    <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#19CA32] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>End Time</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={newToTime}
                      onChange={(e) => setNewToTime(e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className="h-8 text-xs font-semibold bg-white border-gray-300 pr-8 cursor-pointer focus-visible:ring-1 focus-visible:ring-[#19CA32] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none"
                    />
                    <Clock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#19CA32] pointer-events-none" />
                  </div>
                </div>
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
                  onClick={handleConfirmAddBreak}
                  disabled={isCreatingBreak}
                  className="h-8 text-xs bg-[#19CA32] hover:bg-[#15b02b] text-white font-semibold px-4 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingBreak ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
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
              <span>Add Break Time</span>
            </Button>
          )}

          {/* Created Breaks List - Clean Readonly Cards with Delete Icon ONLY */}
          {localBreaks.length > 0 ? (
            <div className="space-y-2">
              {localBreaks.map((breakItem) => (
                <div
                  key={breakItem.id}
                  className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#19CA32] border border-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        {breakItem.description || "Break"}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#19CA32]" />
                        <span>
                          {breakItem.fromTime} - {breakItem.toTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Break API Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBreak(breakItem.id)}
                    disabled={deletingBreakId === breakItem.id}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg flex-shrink-0 cursor-pointer"
                  >
                    {deletingBreakId === breakItem.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : !showAddForm ? (
            <div className="text-center py-6 text-gray-500">
              <Coffee className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium">No break times added yet</p>
            </div>
          ) : null}
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
