"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { CalendarIcon } from "lucide-react";
import { toast } from "react-toastify";
import {
  useGetGarageSlotsQuery,
  useBookSlotMutation,
} from "@/features/driver";
import { useAuth } from "@/features/auth";
import { useGetMeQuery } from "@/features/auth";
import PersonalInformationSection from "./BookingModal/PersonalInformationSection";
import BookingDetailsSection from "./BookingModal/BookingDetailsSection";
import AdditionalServicesSection from "./BookingModal/AdditionalServicesSection";
import BookingSuccessModal from "./BookingModal/BookingSuccessModal";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import { trackBookingConversionFromApiData } from "@/lib/tracking";

import {
  GarageData,
  setPendingBooking,
} from "@/features/driver";
import { useDispatch } from "react-redux";

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  additionalServices: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  garage: GarageData | null;
  vehicleId?: string; // Optional vehicle_id prop for cases where vehicle is not in Redux
  vehicleRegistrationNumber?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  garage,
  vehicleId: propVehicleId,
  vehicleRegistrationNumber,
}: BookingModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { data: profileResponse } = useGetMeQuery();
  const profile = profileResponse?.data || null;

  // Use vehicle_id from prop if vehicle is not in Redux
  const vehicleId = propVehicleId || null;

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    additionalServices: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotData, setSelectedSlotData] = useState<{
    start_time: string;
    end_time: string;
    date: string;
    id: string;
    has_id: boolean;
  } | null>(null);
  const [submittedBooking, setSubmittedBooking] =
    useState<BookingFormData | null>(null);
  const [successDetails, setSuccessDetails] = useState<{
    order_id: string;
    date: string;
    start_time: string;
    end_time: string;
    total_amount?: string | number;
  } | null>(null);

  const dispatch = useDispatch();

  // Fetch slots when date is selected
  const { data: slotsData, isLoading: slotsLoading } = useGetGarageSlotsQuery(
    { id: garage?.id || "", date: bookingForm.date },
    { skip: !garage?.id || !bookingForm.date },
  );

  // Book slot mutation
  const [bookSlot, { isLoading: isBooking }] = useBookSlotMutation();

  // Auto-fill form with user info when modal opens
  useEffect(() => {
    if (isOpen && (user || profile)) {
      setBookingForm((prev) => ({
        ...prev,
        name: user?.name || profile?.name || prev.name || "",
        email: user?.email || profile?.email || prev.email || "",
        phone: profile?.phone_number || prev.phone || "",
      }));
    } else {
      setBookingForm((prev) => ({
        ...prev,
        name: "guest",
        email: "guest@example.com",
        phone: "**********",
      }));
    }
  }, [isOpen, user, profile]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        additionalServices: "",
      });
      setSelectedDate(undefined);
      setSelectedSlotId(null);
      setSelectedSlotData(null);
      setSelectedSlotId(null);
      setSelectedSlotData(null);
    }
  }, [isOpen]);

  // Sync selectedDate with bookingForm.date when form date changes externally
  useEffect(() => {
    if (bookingForm.date) {
      const parsedDate = new Date(bookingForm.date);
      if (!isNaN(parsedDate.getTime())) {
        // Only update if dates are different
        const currentDateString = selectedDate?.toDateString();
        const newDateString = parsedDate.toDateString();
        if (currentDateString !== newDateString) {
          setSelectedDate(parsedDate);
        }
      }
    } else if (!bookingForm.date && selectedDate) {
      // Clear selectedDate if form date is cleared
      setSelectedDate(undefined);
    }
  }, [bookingForm.date, selectedDate]);

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
    // Reset selected slot when date changes
    if (field === "date") {
      setSelectedSlotId(null);
      setSelectedSlotData(null);
    }
  };

  // Handle slot selection (just select, don't book yet)
  const handleSlotSelect = (
    slot: {
      id: string;
      start_time: string;
      end_time: string;
      date: string;
      status?: string[];
      has_id: boolean;
    },
    e?: React.MouseEvent,
  ) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const statuses: string[] = Array.isArray(slot.status) ? slot.status : [];
    const isBooked = statuses.includes("BOOKED");
    const isBlocked = statuses.includes("BLOCKED");
    const isBreak = statuses.includes("BREAK");
    const isHoliday = statuses.includes("HOLIDAY");
    const isUnavailable = statuses.includes("UNAVAILABLE");

    let isPast = false;
    if (slot.date && slot.start_time) {
      const [h, m] = slot.start_time.split(":").map(Number);
      const dt = new Date(slot.date);
      dt.setHours(h || 0, m || 0, 0, 0);
      isPast = dt < new Date();
    }

    if (
      isBooked ||
      isBlocked ||
      isBreak ||
      isHoliday ||
      isUnavailable ||
      isPast
    ) {
      return;
    }

    // Just select the slot, validation will happen on submit
    setSelectedSlotId(slot.id);
    setSelectedSlotData({
      id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      date: slot.date,
      has_id: slot.has_id,
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone) {
      toast.error("Please fill in all required fields (Name, Email, Phone)");
      return;
    }

    // Get garage_id and vehicle_id
    // vehicle_id can come from Redux state (from search) or from prop (from URL params)
    const garageId = garage?.id;
    const finalVehicleId = vehicleId;

    if ((!user || !finalVehicleId) && vehicleRegistrationNumber) {
      if (!selectedSlotData) return;
      dispatch(
        setPendingBooking({
          slot_id: selectedSlotData.has_id ? selectedSlotData.id : "",
          garage_id: garage?.id || "",
          vehicle_registration_number: vehicleRegistrationNumber || "",
          start_time: selectedSlotData.has_id
            ? ""
            : selectedSlotData.start_time,
          end_time: selectedSlotData.has_id ? "" : selectedSlotData.end_time,
          date: selectedSlotData.has_id ? "" : selectedSlotData.date,
          service_type: "MOT",
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          garage_name: garage?.garage_name || "",
          garage_address: garage?.address || "",
        }),
      );
      const params = new URLSearchParams(searchParams.toString());
      params.set("is_logged_in", "true");
      const currentUrl = `${pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      router.push(
        `/create-account/driver?redirect=${encodeURIComponent(currentUrl)}`,
      );

      return;
    } else if (
      !selectedSlotId ||
      !garageId ||
      !finalVehicleId ||
      !selectedSlotData
    ) {
      if (!garageId) {
        toast.error("Garage information is missing. Please search again.");
      } else if (!finalVehicleId) {
        toast.error("Vehicle information is missing. Please search again.");
      } else if (!selectedSlotData) {
        toast.error("Slot information is missing. Please select a time slot.");
      } else {
        toast.error("Please select a time slot");
      }
      return;
    }

    try {
      // Book slot with garage_id, vehicle_id, start_time, end_time, date, and service_type
      // vehicle_id can be from Redux state (from search) or from prop (from URL params)
      const bookingBody = {
        garage_id: garageId,
        vehicle_id: finalVehicleId,
        service_type: "MOT",
        additional_services: bookingForm.additionalServices || undefined,
        ...(selectedSlotData.has_id
          ? { slot_id: selectedSlotData.id }
          : {
              start_time: selectedSlotData.start_time,
              end_time: selectedSlotData.end_time,
              date: selectedSlotData.date,
            }),
      };

      const result = await bookSlot(bookingBody).unwrap();

      if (result.success) {
        trackBookingConversionFromApiData(result.data);

        let successMessage = "Slot booked successfully!";
        if (typeof result.message === "string") {
          successMessage = result.message;
        } else if (
          result.message &&
          typeof result.message === "object" &&
          "message" in result.message
        ) {
          const msgObj = result.message as { message?: string };
          if (typeof msgObj.message === "string") {
            successMessage = msgObj.message;
          }
        }
        toast.success(successMessage);
        setSubmittedBooking(bookingForm);

        // Save success details BEFORE resetting
        setSuccessDetails({
          order_id: result.data?.order_id || "",
          date: selectedSlotData.date,
          start_time: selectedSlotData.start_time,
          end_time: selectedSlotData.end_time,
          total_amount: result.data?.total_amount,
        });

        onClose();
        setIsSuccessModalOpen(true);

        // Reset form
        setBookingForm({
          name: "",
          email: "",
          phone: "",
          date: "",
          additionalServices: "",
        });
        setSelectedDate(undefined);
        setSelectedSlotId(null);
        setSelectedSlotData(null);
      } else {
        let errorMessage = "Failed to book slot";
        if (typeof result.message === "string") {
          errorMessage = result.message;
        } else if (
          result.message &&
          typeof result.message === "object" &&
          "message" in result.message
        ) {
          const msgObj = result.message as { message?: string };
          if (typeof msgObj.message === "string") {
            errorMessage = msgObj.message;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to book slot. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Format time to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    setSubmittedBooking(null);
    setSuccessDetails(null);
  };

  return (
    <>
      {/* Booking Modal */}
      <CustomReusableModal
        isOpen={isOpen}
        onClose={onClose}
        title="Garage Booking"
        showHeader={false}
        className="max-w-3xl flex flex-col"
        contentClassName="p-0 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="bg-white rounded-lg overflow-hidden flex flex-col min-h-0 max-h-[min(90dvh,calc(100vh-2rem))]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#19CA32] to-[#16b82e] text-white px-4 py-4 pr-12 shadow-md shrink-0">
            <div className="flex items-center justify-between min-w-0 gap-3">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold truncate">
                  Book Your MOT
                </h2>
              </div>
              <div className="hidden sm:block shrink-0">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleBookingSubmit}
            className="p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden flex-1 min-h-0 overscroll-contain"
          >
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Personal Information Section */}
              {user && (
                <PersonalInformationSection
                  name={bookingForm.name}
                  email={bookingForm.email}
                  phone={bookingForm.phone}
                />
              )}

              {/* Booking Details Section */}
              <BookingDetailsSection
                selectedDate={selectedDate}
                date={bookingForm.date}
                onDateChange={(dateValue) => {
                  handleInputChange("date", dateValue);
                  if (dateValue) {
                    const parsedDate = new Date(dateValue);
                    if (!isNaN(parsedDate.getTime())) {
                      setSelectedDate(parsedDate);
                    }
                  } else {
                    setSelectedDate(undefined);
                  }
                }}
                slots={slotsData?.slots}
                slotsLoading={slotsLoading}
                selectedSlotId={selectedSlotId}
                onSlotSelect={(slot) => handleSlotSelect(slot)}
                isBooking={isBooking}
                formatTime={formatTime}
              />

              {/* Additional Services Section */}
              <AdditionalServicesSection
                value={bookingForm.additionalServices}
                onChange={(value) =>
                  handleInputChange("additionalServices", value)
                }
              />

              {/* Submit Button */}
              <div className="pt-4 pb-1 sm:pb-0 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={!selectedSlotId || isBooking}
                  className="w-full cursor-pointer bg-gradient-to-r from-[#19CA32] to-[#16b82e] hover:from-[#16b82e] hover:to-[#14a828] text-white font-semibold py-4 text-base rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isBooking ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Booking...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Book My MOT
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </CustomReusableModal>
      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        submittedBooking={submittedBooking}
        selectedSlot={
          successDetails
            ? {
                slot_id: "",
                order_id: successDetails.order_id,
                garage_id: garage?.id || "",
                vehicle_id: vehicleId || "",
                date: successDetails.date,
                start_time: successDetails.start_time,
                end_time: successDetails.end_time,
              }
            : null
        }
        selectedDate={selectedDate}
        garage={garage}
        formatTime={formatTime}
        totalAmount={successDetails?.total_amount}
      />
    </>
  );
}
