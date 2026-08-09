"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Coffee } from "lucide-react";
import BreaksModal from "./BreaksModal";
import DefultCalanderViewShimmer from "./DefultCalanderViewShimmer";
import {
  useGetScheduleQuery,
  useCreateScheduleMutation,
  useGetGarageProfileQuery,
  type UpsertScheduleRequest,
} from "@/features/garage";
import { useToast } from "@/hooks/use-toast";

interface DaySchedule {
  day: string;
  isClosed: boolean;
  fromTime: string;
  toTime: string;
  duration: number;
  breaks: Array<{
    id: string;
    fromTime: string;
    toTime: string;
    description?: string;
  }>;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getApiDayOfWeek = (componentIndex: number): number => {
  return (componentIndex + 1) % 7;
};

interface DefultCalanderViewProps {
  isLoading?: boolean;
  onScheduleUpdate?: () => void;
}

export default function DefultCalanderView({
  isLoading = false,
  onScheduleUpdate,
}: DefultCalanderViewProps) {
  const { toast } = useToast();
  const [openBreaksModalIndex, setOpenBreaksModalIndex] = useState<
    number | null
  >(null);
  const originalSchedulesRef = useRef<DaySchedule[] | null>(null);

  const { data: profileResponse } = useGetGarageProfileQuery();
  const garageId = profileResponse?.data?.id;

  const { data: scheduleResponse, isLoading: isFetching } =
    useGetScheduleQuery(garageId!, { skip: !garageId });
  const [createSchedule, { isLoading: isSaving }] = useCreateScheduleMutation();

  const [schedules, setSchedules] = useState<DaySchedule[]>(() => {
    return DAYS.map((day) => ({
      day,
      isClosed: false,
      fromTime: "09:00",
      toTime: "17:00",
      duration: 60,
      breaks: [],
    }));
  });

  useEffect(() => {
    if (scheduleResponse?.success && scheduleResponse.data) {
      const apiData = scheduleResponse.data;
      const intervals = apiData.schedule_intervals || [];

      const newSchedules: DaySchedule[] = DAYS.map((day) => {
        const intervalItem = intervals.find(
          (item) => item.day_of_week.toUpperCase() === day.toUpperCase(),
        );

        const dayBreaks = (intervalItem?.break_times || []).map((b) => ({
          id: b.id,
          fromTime: b.start_time || "",
          toTime: b.end_time || "",
          description: b.description || "",
        }));

        return {
          day,
          isClosed: intervalItem?.is_closed ?? false,
          fromTime: intervalItem?.open_time || "09:00",
          toTime: intervalItem?.close_time || "17:00",
          duration: intervalItem?.slot_duration || 60,
          breaks: dayBreaks,
        };
      });

      setSchedules(newSchedules);
      originalSchedulesRef.current = JSON.parse(JSON.stringify(newSchedules));
    }
  }, [scheduleResponse]);

  const hasChanges = () => {
    if (!originalSchedulesRef.current) return false;
    return (
      JSON.stringify(schedules) !== JSON.stringify(originalSchedulesRef.current)
    );
  };

  const handleClosedToggle = (index: number, checked: boolean) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, isClosed: checked } : schedule,
      ),
    );
  };

  const handleTimeChange = (
    index: number,
    field: "fromTime" | "toTime",
    value: string,
  ) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, [field]: value } : schedule,
      ),
    );
  };

  const handleDurationChange = (index: number, value: number) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, duration: value } : schedule,
      ),
    );
  };

  const handleBreaksChange = (index: number, breaks: DaySchedule["breaks"]) => {
    setSchedules((prev) =>
      prev.map((schedule, i) =>
        i === index ? { ...schedule, breaks } : schedule,
      ),
    );
  };

  const handleOpenBreaksModal = (index: number) => {
    setOpenBreaksModalIndex(index);
  };

  const handleCloseBreaksModal = () => {
    setOpenBreaksModalIndex(null);
  };

  const transformToApiFormat = (): UpsertScheduleRequest => {
    const existingIntervals = scheduleResponse?.data?.schedule_intervals || [];

    const schedule_intervals = schedules.map((schedule) => {
      const dayUpper = schedule.day.toUpperCase();
      const existingItem = existingIntervals.find(
        (i) => i.day_of_week.toUpperCase() === dayUpper,
      );

      return {
        ...(existingItem?.id ? { id: existingItem.id } : {}),
        day_of_week: dayUpper,
        is_closed: schedule.isClosed,
        open_time: schedule.isClosed ? null : schedule.fromTime,
        close_time: schedule.isClosed ? null : schedule.toTime,
        slot_duration: schedule.duration,
        buffer_time: 0,
        break_times: schedule.isClosed
          ? []
          : schedule.breaks.map((b) => ({
              start_time: b.fromTime,
              end_time: b.toTime,
              description: b.description || "Break",
            })),
      };
    });

    return { schedule_intervals };
  };

  const handleSave = async () => {
    try {
      if (!garageId) {
        toast({
          title: "Error",
          description: "Garage ID not found",
          variant: "destructive",
        });
        return;
      }
      const requestData = transformToApiFormat();
      const result = await createSchedule({
        garageId,
        body: requestData,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Schedule updated successfully",
        });
        originalSchedulesRef.current = JSON.parse(JSON.stringify(schedules));
        onScheduleUpdate?.();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update schedule",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.data?.message || error?.message || "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  if (isLoading || isFetching) {
    return <DefultCalanderViewShimmer />;
  }

  return (
    <>
      <Card className="w-full bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-gray-900">
                Weekly Operating Hours
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Set opening times, closing times, and slot durations
              </p>
            </div>

            {hasChanges() && (
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#19CA32] hover:bg-[#15b02b] text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 divide-y divide-gray-100">
          {schedules.map((schedule, index) => (
            <div key={schedule.day} className="py-3.5 first:pt-1 last:pb-1">
              {/* Day Header */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {schedule.day}
                  </span>
                  {schedule.isClosed ? (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                      Closed
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-[#19CA32]">
                      Open
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`closed-${index}`}
                    className="text-xs text-gray-600 cursor-pointer"
                  >
                    Closed
                  </Label>
                  <Switch
                    id={`closed-${index}`}
                    checked={schedule.isClosed}
                    onCheckedChange={(checked) =>
                      handleClosedToggle(index, checked)
                    }
                    className="data-[state=checked]:bg-gray-300 data-[state=unchecked]:bg-[#19CA32]"
                  />
                </div>
              </div>

              {/* Time Inputs & Slot Controls Row - 1 row on big screens (xl:grid-cols-4), 2 rows on smaller screens (grid-cols-2) */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-2.5 items-end">
                <div>
                  <Label
                    htmlFor={`from-${index}`}
                    className="text-[11px] font-semibold text-gray-600 mb-1 block"
                  >
                    From
                  </Label>
                  <Input
                    id={`from-${index}`}
                    type="time"
                    value={schedule.fromTime}
                    onChange={(e) =>
                      handleTimeChange(index, "fromTime", e.target.value)
                    }
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    disabled={schedule.isClosed}
                    className={`h-9 text-xs rounded-lg border-gray-300 px-2 cursor-pointer focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] ${
                      schedule.isClosed
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "bg-white font-medium text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`to-${index}`}
                    className="text-[11px] font-semibold text-gray-600 mb-1 block"
                  >
                    To
                  </Label>
                  <Input
                    id={`to-${index}`}
                    type="time"
                    value={schedule.toTime}
                    onChange={(e) =>
                      handleTimeChange(index, "toTime", e.target.value)
                    }
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    disabled={schedule.isClosed}
                    className={`h-9 text-xs rounded-lg border-gray-300 px-2 cursor-pointer focus-visible:border-[#19CA32] focus-visible:ring-1 focus-visible:ring-[#19CA32] ${
                      schedule.isClosed
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "bg-white font-medium text-gray-900"
                    }`}
                  />
                </div>

                <div>
                  <Label
                    htmlFor={`duration-${index}`}
                    className="text-[11px] font-semibold text-gray-600 mb-1 block"
                  >
                    Slot Duration
                  </Label>
                  <Select
                    value={String(schedule.duration)}
                    onValueChange={(val) =>
                      handleDurationChange(index, parseInt(val) || 60)
                    }
                    disabled={schedule.isClosed}
                  >
                    <SelectTrigger className="h-9 w-full text-xs font-semibold border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-[#19CA32] whitespace-nowrap overflow-hidden text-ellipsis px-2">
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15" className="text-xs">
                        15 mins
                      </SelectItem>
                      <SelectItem value="30" className="text-xs">
                        30 mins
                      </SelectItem>
                      <SelectItem value="45" className="text-xs">
                        45 mins
                      </SelectItem>
                      <SelectItem value="60" className="text-xs">
                        60 mins (1 hr)
                      </SelectItem>
                      <SelectItem value="90" className="text-xs">
                        90 mins (1.5 hr)
                      </SelectItem>
                      <SelectItem value="120" className="text-xs">
                        120 mins (2 hrs)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-gray-600 mb-1 block opacity-0 hidden xl:block">
                    Breaks
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenBreaksModal(index)}
                    disabled={schedule.isClosed}
                    className={`w-full h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border-gray-300 cursor-pointer whitespace-nowrap px-2 ${
                      schedule.isClosed
                        ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                        : schedule.breaks.length > 0
                        ? "bg-emerald-50 text-[#19CA32] border-emerald-200 hover:bg-emerald-100"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <Coffee className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {schedule.breaks.length > 0
                        ? `Breaks (${schedule.breaks.length})`
                        : "Add Break"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Breaks Modal */}
      {openBreaksModalIndex !== null && (
        <BreaksModal
          isOpen={openBreaksModalIndex !== null}
          onClose={handleCloseBreaksModal}
          dayName={schedules[openBreaksModalIndex]?.day || ""}
          dayIndex={getApiDayOfWeek(openBreaksModalIndex)}
          scheduleIntervalId={
            scheduleResponse?.data?.schedule_intervals?.find(
              (item) =>
                item.day_of_week.toUpperCase() ===
                (schedules[openBreaksModalIndex]?.day || "").toUpperCase(),
            )?.id
          }
          breaks={schedules[openBreaksModalIndex]?.breaks || []}
          onBreaksChange={(breaks) =>
            handleBreaksChange(openBreaksModalIndex, breaks)
          }
          onSaveSuccess={() => {
            onScheduleUpdate?.();
          }}
        />
      )}
    </>
  );
}
