"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lock,
  Unlock,
  AlertTriangle,
  Loader2,
  Clock,
  CalendarDays,
  Coffee,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  useGetSlotDetailsQuery,
  useBlockSlotMutation,
  useUnblockSlotMutation,
  useGetGarageProfileQuery,
  type SlotItem,
} from "@/features/garage";

interface ManageSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onSuccess?: () => void;
}

export default function ManageSlotsModal({
  isOpen,
  onClose,
  date,
  onSuccess,
}: ManageSlotsModalProps) {
  const { toast } = useToast();
  const [actionSlotId, setActionSlotId] = useState<string | null>(null);

  const { data: profileResponse } = useGetGarageProfileQuery();
  const garageId = profileResponse?.data?.id;

  const {
    data: slotResponse,
    isLoading: isSlotsLoading,
    isFetching: isSlotsFetching,
    error: slotQueryError,
  } = useGetSlotDetailsQuery(
    { garageId: garageId!, date },
    { skip: !isOpen || !garageId || !date }
  );

  const [blockSlot, { isLoading: isBlocking }] = useBlockSlotMutation();
  const [unblockSlot, { isLoading: isUnblocking }] = useUnblockSlotMutation();

  const slotData = slotResponse?.data;
  const slotsList: SlotItem[] = slotData?.slots || [];
  const summary = slotData?.summary;

  const formatTimeRange = (startsAtStr: string, endsAtStr: string) => {
    try {
      const start = new Date(startsAtStr);
      const end = new Date(endsAtStr);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return `${startsAtStr} - ${endsAtStr}`;
      }
      return `${format(start, "hh:mm a")} - ${format(end, "hh:mm a")}`;
    } catch {
      return `${startsAtStr} - ${endsAtStr}`;
    }
  };

  const handleToggleBlock = async (slot: SlotItem) => {
    if (!garageId || !slot) return;

    if (slot.status === "BOOKED") {
      toast({
        title: "Action Not Allowed",
        description: "Cannot block or unblock booked slots",
        variant: "destructive",
      });
      return;
    }

    const isBlocked = slot.status === "BLOCKED";
    setActionSlotId(slot.id);

    try {
      if (isBlocked) {
        await unblockSlot({
          garageId,
          body: { id: slot.id, start_time: slot.starts_at, end_time: slot.ends_at },
        }).unwrap();

        toast({
          title: "Slot Unblocked",
          description: "Slot has been unblocked successfully",
        });
      } else {
        await blockSlot({
          garageId,
          body: {
            id: slot.id,
            start_time: slot.starts_at,
            end_time: slot.ends_at,
            description: "Blocked by garage manager",
          },
        }).unwrap();

        toast({
          title: "Slot Blocked",
          description: "Slot has been blocked successfully",
        });
      }
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : "Failed to update slot status";

      toast({
        title: "Error",
        description: errorMsg || "Failed to update slot status",
        variant: "destructive",
      });
    } finally {
      setActionSlotId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return (
          <Badge className="bg-emerald-50 text-[#19CA32] border border-emerald-200 hover:bg-emerald-100 text-[11px] font-bold px-2 py-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Available</span>
          </Badge>
        );
      case "BOOKED":
        return (
          <Badge className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold px-2 py-0.5 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            <span>Booked</span>
          </Badge>
        );
      case "BLOCKED":
        return (
          <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2 py-0.5 flex items-center gap-1">
            <Ban className="w-3 h-3" />
            <span>Blocked</span>
          </Badge>
        );
      case "BREAK":
        return (
          <Badge className="bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold px-2 py-0.5 flex items-center gap-1">
            <Coffee className="w-3 h-3" />
            <span>Break</span>
          </Badge>
        );
      case "PAST":
        return (
          <Badge className="bg-gray-100 text-gray-500 border border-gray-200 text-[11px] font-bold px-2 py-0.5">
            Past
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] font-bold">
            {status}
          </Badge>
        );
    }
  };

  const formattedDate = () => {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      return format(d, "EEEE, MMMM dd, yyyy");
    } catch {
      return date;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-2xl p-0 overflow-hidden rounded-2xl border border-gray-200 shadow-xl bg-white [&>button]:hidden">
        {/* Brand Green Header */}
        <div className="bg-[#19CA32] text-white p-4 text-center relative">
          <h2 className="text-base sm:text-lg font-bold">Manage Time Slots</h2>
          <p className="text-xs text-emerald-100 mt-0.5 font-medium">
            {formattedDate()}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Summary Badges Header Bar */}
          {summary && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-600">Total:</span>
                <span className="font-bold text-gray-900">
                  {summary.total_slots}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Available:</span>
                <span className="font-bold text-[#19CA32]">
                  {summary.available_slots}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Booked:</span>
                <span className="font-bold text-amber-700">
                  {summary.booked_slots}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Blocked:</span>
                <span className="font-bold text-rose-600">
                  {summary.blocked_slots}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Breaks:</span>
                <span className="font-bold text-orange-600">
                  {summary.break_slots}
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSlotsLoading ? (
            <div className="py-12 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#19CA32]" />
              <p className="text-xs font-semibold">Loading time slots...</p>
            </div>
          ) : slotsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {slotsList.map((slot) => {
                const isBlocked = slot.status === "BLOCKED";
                const isBooked = slot.status === "BOOKED";
                const isBreak = slot.status === "BREAK";
                const isPast = slot.status === "PAST";
                const isActionLoading = actionSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    className={`border rounded-xl p-3.5 shadow-xs transition-all flex items-center justify-between gap-3 ${
                      isBlocked
                        ? "bg-rose-50/50 border-rose-200"
                        : isBooked
                        ? "bg-amber-50/40 border-amber-200"
                        : isBreak
                        ? "bg-orange-50/40 border-orange-200 opacity-90"
                        : isPast
                        ? "bg-gray-50 border-gray-200 opacity-75"
                        : "bg-white border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <Clock className="w-3.5 h-3.5 text-[#19CA32]" />
                        <span>{formatTimeRange(slot.starts_at, slot.ends_at)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {renderStatusBadge(slot.status)}
                      </div>

                      {slot.description && (
                        <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                          {slot.description}
                        </p>
                      )}
                    </div>

                    {/* Block / Unblock Action Button */}
                    {!isBooked && !isBreak && !isPast ? (
                      <Button
                        type="button"
                        variant={isBlocked ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleBlock(slot)}
                        disabled={isActionLoading || isBlocking || isUnblocking}
                        className={`h-8 px-3 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors ${
                          isBlocked
                            ? "border-rose-300 text-rose-700 hover:bg-rose-100 bg-white"
                            : "bg-[#19CA32] hover:bg-[#15b02b] text-white shadow-xs"
                        }`}
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isBlocked ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Unblock</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Block</span>
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium text-gray-500">
                No time slots available for this date
              </p>
            </div>
          )}
        </div>

        {/* Single Full-Width Close Footer */}
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
