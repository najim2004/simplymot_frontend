"use client";

import { useState, useCallback } from "react";
import ManageSlotsModal from "@/features/garage/components/availability/modals/manage-slots-modal";
import CalendarView from "@/features/garage/components/availability/calendar-view";
import {
  useGetScheduleQuery,
  useGetGarageProfileQuery,
  useGetHolidaysQuery,
} from "@/features/garage";
import DefultCalanderView from "@/features/garage/components/availability/DefultCalanderView";
import ManageHolidaysModal from "@/features/garage/components/availability/ManageHolidaysModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function AvailabilityPage() {
  const [showManageSlotsModal, setShowManageSlotsModal] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState<string>("");

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const [showManageHolidaysModal, setShowManageHolidaysModal] = useState(false);

  const { data: profileResponse } = useGetGarageProfileQuery();
  const garageId = profileResponse?.data?.id;

  const { isLoading: isScheduleLoading } = useGetScheduleQuery(garageId!, {
    skip: !garageId,
  });

  const { data: scheduleResponse } = useGetScheduleQuery(garageId!, {
    skip: !garageId,
  });
  const scheduleId = scheduleResponse?.data?.id;

  const { data: holidaysResponse, refetch: refetchHolidays } =
    useGetHolidaysQuery(
      { garageId: garageId!, scheduleId: scheduleId!, year: currentYear },
      { skip: !garageId || !scheduleId },
    );

  const holidays = holidaysResponse?.data || [];

  const handleMonthChange = useCallback((newYear: number, newMonth: number) => {
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
  }, []);

  const handleManageSlots = (date: string) => {
    setSelectedSlotDate(date);
    setShowManageSlotsModal(true);
  };

  const handleSlotManagementSuccess = async () => {
    setShowManageSlotsModal(false);
    setSelectedSlotDate("");
  };

  return (
    <>
      <div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Weekly Schedule */}
          <div>
            <DefultCalanderView isLoading={isScheduleLoading} />
          </div>

          {/* Right Column: Daily Availability Calendar & Manage Holidays */}
          <div className="lg:sticky lg:top-0">
            <CalendarView
              year={currentYear}
              month={currentMonth}
              holidays={holidays}
              onMonthChange={handleMonthChange}
              onDateSelect={(date: string) => {
                if (date) {
                  handleManageSlots(date);
                }
              }}
              onModalClose={() => {
                setShowManageSlotsModal(false);
                setSelectedSlotDate("");
              }}
            />

            {/* Manage Holidays Button - Full Width under Calendar */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManageHolidaysModal(true)}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-4 text-sm"
            >
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Manage Garage Holidays</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Manage Slots Modal */}
      {showManageSlotsModal && selectedSlotDate && (
        <ManageSlotsModal
          isOpen={showManageSlotsModal}
          onClose={() => {
            setShowManageSlotsModal(false);
            setSelectedSlotDate("");
          }}
          date={selectedSlotDate}
          onSuccess={handleSlotManagementSuccess}
        />
      )}

      {/* Manage Holidays Modal */}
      {showManageHolidaysModal && (
        <ManageHolidaysModal
          isOpen={showManageHolidaysModal}
          onClose={() => setShowManageHolidaysModal(false)}
          garageId={garageId}
          scheduleId={scheduleId}
          holidays={holidays}
        />
      )}
    </>
  );
}
