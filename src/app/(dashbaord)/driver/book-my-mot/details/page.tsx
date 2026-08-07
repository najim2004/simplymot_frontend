"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { BookingModal } from "@/features/driver";
import {
  useBookSlotMutation,
  useGetGarageServicesQuery,
} from "@/features/driver";
import {
  GarageData,
  setPendingBooking,
} from "@/features/driver";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import {
  useAddVehicleMutation,
  useGetVehiclesQuery,
} from "@/features/driver";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";
import { BookingSuccessModal } from "@/features/driver";
import { DEFAULT_GARAGE_AVATAR_SRC } from "@/lib/garage-assets";
import { getBookMyMotReturnUrl } from "@/lib/book-my-mot-navigation";
import { trackBookingConversionFromApiData } from "@/lib/tracking";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";

// Helper function to get day name from number
const getDayName = (dayNum: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNum] || "";
};

const formatTime = (time: string): string => {
  const cleanTime = time.replace(/[^0-9:]/g, "");
  const [hours, minutes] = cleanTime.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) return time;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, "0");

  return `${displayHours}:${displayMinutes} ${period}`;
};

// Helper function to split intervals by restrictions (breaks)
const splitIntervalsByRestrictions = (
  intervals: Array<{ start_time: string; end_time: string }>,
  restrictions: Array<{
    start_time: string;
    end_time: string;
    day_of_week: number[];
    description?: string;
  }>,
  dayNum: number,
): Array<{
  start_time: string;
  end_time: string;
  hasBreak?: boolean;
  breakInfo?: string;
}> => {
  // Get restrictions for this specific day
  // Filter out restrictions that don't have day_of_week or where day_of_week is not an array
  const dayRestrictions = (restrictions || []).filter(
    (r) => r && Array.isArray(r.day_of_week) && r.day_of_week.includes(dayNum),
  );

  if (dayRestrictions.length === 0) {
    return intervals.map((interval) => ({ ...interval }));
  }

  const result: Array<{
    start_time: string;
    end_time: string;
    hasBreak?: boolean;
    breakInfo?: string;
  }> = [];

  intervals.forEach((interval) => {
    const intervalStart = interval.start_time;
    const intervalEnd = interval.end_time;

    // Find breaks that overlap with this interval
    const overlappingBreaks = dayRestrictions.filter((breakItem) => {
      return (
        breakItem.start_time < intervalEnd && breakItem.end_time > intervalStart
      );
    });

    if (overlappingBreaks.length === 0) {
      // No breaks, add interval as is
      result.push({ ...interval });
    } else {
      // Sort breaks by start time
      overlappingBreaks.sort((a, b) =>
        a.start_time.localeCompare(b.start_time),
      );

      let currentStart = intervalStart;

      overlappingBreaks.forEach((breakItem, idx) => {
        // Add interval before break
        if (currentStart < breakItem.start_time) {
          result.push({
            start_time: currentStart,
            end_time: breakItem.start_time,
          });
        }

        // Add break info
        result.push({
          start_time: breakItem.start_time,
          end_time: breakItem.end_time,
          hasBreak: true,
          breakInfo: breakItem.description || "Break",
        });

        currentStart = breakItem.end_time;
      });

      // Add remaining interval after last break
      if (currentStart < intervalEnd) {
        result.push({
          start_time: currentStart,
          end_time: intervalEnd,
        });
      }
    }
  });

  return result;
};

function DetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const garageId = searchParams.get("id");
  const vehicleId = searchParams.get("vehicle_id");
  const registrationFromURL = searchParams.get("registration");
  const postcodeFromURL = searchParams.get("postcode");
  const sortByFromURL = searchParams.get("sort_by");
  const isLoggedIn = searchParams.get("is_logged_in");

  const handleBackToResults = () => {
    router.push(
      getBookMyMotReturnUrl({
        registration: registrationFromURL,
        postcode: postcodeFromURL,
        sortBy: sortByFromURL,
        isLoggedIn: isLoggedIn,
      }),
    );
  };
  const pathname = "/driver/book-my-mot/details"; // Fixed pathname for this page

  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const pendingBooking = useSelector(
    (rootState: RootState) => rootState.bookMyMot.pendingBooking,
  );

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const isBookingInitiated = React.useRef(false);

  const [successDetails, setSuccessDetails] = useState<{
    garage_name: string;
    garage_address: string;
    date: string;
    start_time: string;
    end_time: string;
    order_id?: string;
    total_amount?: string | number;
  } | null>(null);

  const { data: vehicles, isFetching: isFetchingVehicles } =
    useGetVehiclesQuery(null, { skip: !user?.id });
  const [addVehicle, { isLoading: isAddingVehicle }] = useAddVehicleMutation();
  const [bookSlot, { isLoading: isBooking }] = useBookSlotMutation();

  // Fetch garage services using RTK Query
  const {
    data: garageData,
    isLoading,
    error,
    refetch,
  } = useGetGarageServicesQuery(garageId || "", {
    skip: !garageId, // Skip query if no garageId
    refetchOnMountOrArgChange: true, // Refetch when component mounts or argument changes
  });

  // Refetch data when garageId changes to ensure fresh data
  useEffect(() => {
    if (garageId) {
      // Force refetch when garageId changes
      refetch();
    }
  }, [garageId, refetch]);

  useEffect(() => {
    if (!garageId) {
      toast.error("No garage ID provided", { toastId: "no-garage-id" });
      router.push("/driver/book-my-mot");
      return;
    }
  }, [garageId, router]);

  useEffect(() => {
    if (error) {
      let errorMessage = "Failed to load garage details";

      if ("data" in error && error.data) {
        const errorData = error.data as any;
        const msg = errorData?.message;
        if (Array.isArray(msg)) {
          errorMessage = msg.join(", ");
        } else if (errorData?.message?.message) {
          errorMessage = errorData.message.message;
        } else if (typeof msg === "string") {
          errorMessage = msg;
        } else if (msg?.message) {
          errorMessage = msg.message;
        }
      }

      toast.error(errorMessage, { toastId: "details-api-error" });
      router.push("/driver/book-my-mot");
    }
  }, [error, router]);

  useEffect(() => {
    const performAutoBooking = async () => {
      // Guard: Ensure everything is ready and we haven't already tried
      if (
        isLoggedIn !== "true" ||
        !user?.id ||
        !pendingBooking.vehicle_registration_number ||
        isFetchingVehicles ||
        isAddingVehicle ||
        isBooking ||
        isBookingInitiated.current
      ) {
        return;
      }

      // Check for expiration
      if (
        !pendingBooking.expires_at ||
        Date.now() > new Date(pendingBooking.expires_at).getTime()
      ) {
        // Expired, clear state and params
        cleanupBookingState();
        return;
      }

      // Mark as initiated to prevent double-runs
      isBookingInitiated.current = true;

      try {
        let finalVehicleId = "";
        const existVehicle = vehicles?.data?.find(
          (v) =>
            v.registration_number ===
            pendingBooking.vehicle_registration_number,
        );

        if (existVehicle) {
          finalVehicleId = existVehicle.id;
        } else {
          const response = await addVehicle({
            registration_number: pendingBooking.vehicle_registration_number,
          }).unwrap();
          if (!response.success || !response?.data?.id)
            throw new Error(response.message || "Failed to add vehicle");
          finalVehicleId = response.data.id;
        }

        const result = await bookSlot({
          vehicle_id: finalVehicleId,
          ...(pendingBooking.slot_id
            ? { slot_id: pendingBooking.slot_id }
            : {
                date: pendingBooking.date,
                start_time: pendingBooking.start_time,
                end_time: pendingBooking.end_time,
              }),
          garage_id: pendingBooking.garage_id,
          service_type: pendingBooking.service_type,
        }).unwrap();

        if (result.success) {
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
          trackBookingConversionFromApiData(result.data);

          // Capture details into local state BEFORE cleanup
          const bookingData = result.data as
            | Record<string, unknown>
            | undefined;
          setSuccessDetails({
            garage_name: pendingBooking.garage_name || "",
            garage_address: pendingBooking.garage_address || "",
            date: String(bookingData?.date ?? pendingBooking.date ?? ""),
            start_time: String(
              bookingData?.start_time ?? pendingBooking.start_time ?? "",
            ),
            end_time: String(
              bookingData?.end_time ?? pendingBooking.end_time ?? "",
            ),
            order_id: bookingData?.order_id
              ? String(bookingData.order_id)
              : undefined,
            total_amount: bookingData?.total_amount as
              | string
              | number
              | undefined,
          });

          setIsSuccessModalOpen(true);
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
      } catch (err: any) {
        const errorMessage =
          err?.data?.message ||
          err?.message ||
          "Failed to book slot. Please try again.";
        toast.error(errorMessage);
      } finally {
        // ALWAYS cleanup after an attempt
        cleanupBookingState();
      }
    };

    const cleanupBookingState = () => {
      // Clear Redux state
      dispatch(
        setPendingBooking({
          slot_id: "",
          garage_id: "",
          vehicle_registration_number: "",
          start_time: "",
          end_time: "",
          date: "",
          service_type: "MOT",
          expires_at: "",
        }),
      );

      // Clear URL params
      const params = new URLSearchParams(searchParams.toString());
      params.delete("is_logged_in");
      router.replace(
        `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
        {
          scroll: false,
        },
      );
    };

    performAutoBooking();
  }, [
    isLoggedIn,
    pendingBooking,
    user,
    vehicles,
    isFetchingVehicles,
    isAddingVehicle,
    isBooking,
    dispatch,
    router,
    addVehicle,
    bookSlot,
    searchParams,
    pathname,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-lg text-gray-600">Loading garage details...</div>
      </div>
    );
  }

  if (!garageData || !garageData.garage) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-lg text-red-600">Garage not found</div>
      </div>
    );
  }

  const { garage, services, additionals, schedule } = garageData;

  // Transform garage data to match BookingModal's expected structure
  const transformedGarage: GarageData = {
    id: garage.id,
    garage_name: garage.garage_name,
    address: garage.address || "",
    postcode: garage.zip_code,
    vts_number: garage.vts_number,
    primary_contact: garage.primary_contact,
    phone_number: garage.phone_number,
    email: garage.email,
  };

  // Old garages may have null class_number; treat those services as Class 4.
  const class4Mot = services.find(
    (service) =>
      service.type === "MOT" &&
      (service.class_number === 4 || service.class_number == null),
  );
  const class4Retest = services.find(
    (service) =>
      service.type === "RETEST" &&
      (service.class_number === 4 || service.class_number == null),
  );
  const class7Mot = services.find(
    (service) => service.type === "MOT" && service.class_number === 7,
  );
  const class7Retest = services.find(
    (service) => service.type === "RETEST" && service.class_number === 7,
  );
  const hasClass7 = Boolean(class7Mot || class7Retest);

  return (
    <div className="w-full mx-auto">
      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Garage Details */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackToResults}
            className="self-start inline-flex h-8 items-center gap-1.5 rounded-sm border-[#19CA32] bg-transparent hover:bg-transparent px-3 py-1 text-[13px] font-medium shadow-none transition-all duration-150 ease-out touch-manipulation select-none active:text-[#16b82e] active:border-[#16b82e] active:shadow-inner focus-visible:ring-[#19CA32]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Back to Results
          </Button>
            <div className="space-y-4 bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
              {/* Garage Title and Avatar */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-32 h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={
                      garage.avatar?.trim()
                        ? garage.avatar
                        : DEFAULT_GARAGE_AVATAR_SRC
                    }
                    alt={garage.garage_name}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    {garage.garage_name}
                  </h1>
                  <div className="mt-2 sm:mt-3 space-y-1 text-sm sm:text-base text-gray-600">
                    <div>{garage.address || "N/A"}</div>
                    <div>
                      <strong>Postcode :</strong> {garage.zip_code || "N/A"}
                    </div>
                    <div>
                      <strong>Contact :</strong> {garage.phone_number || "N/A"}
                    </div>
                    <div>
                      <strong>Email :</strong> {garage.email || "N/A"}
                    </div>
                    <div>
                      <strong>DVSA Approval Number :</strong>{" "}
                      {garage.vts_number || "N/A"}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 text-gray-700">
                      <ShieldCheck className="h-4 w-4 text-[#19CA32]" />
                      <span>DVSA Approved MOT Centre</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Check className="h-4 w-4 text-[#19CA32]" />
                      <span>No hidden fees - Pay at the garage</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              {/* <div className="space-y-2 text-gray-600 text-sm sm:text-base"></div> */}
            </div>

            {/* MOT Fee and Retest Fee */}
            {(class4Mot || class4Retest || hasClass7) &&
              (hasClass7 ? (
                <div className="space-y-3 bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                  <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <div className="mb-3">
                      <div className="text-base sm:text-lg font-bold text-gray-900">
                        Class 4
                      </div>
                      <p className="text-sm text-gray-600">
                        Cars & small vans (including larger family vehicles)
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {class4Mot && (
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">
                            MOT Fee
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#19CA32]">
                            £{class4Mot.price.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {class4Retest && (
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">
                            Retest Fee
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#19CA32]">
                            £{class4Retest.price.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                    <div className="mb-3">
                      <div className="text-base sm:text-lg font-bold text-gray-900">
                        Class 7
                      </div>
                      <p className="text-sm text-gray-600">
                        Large vans / commercial vehicles
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {class7Mot && (
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">
                            MOT Fee
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#19CA32]">
                            £{class7Mot.price.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {class7Retest && (
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">
                            Retest Fee
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#19CA32]">
                            £{class7Retest.price.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-sm italic text-gray-600">
                      This price is for Class 7 vehicles only.
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Not sure? The garage will confirm the correct vehicle
                      class on arrival.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 py-4 gap-3 sm:gap-4 bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                  {class4Mot && (
                    <div className="px-3 sm:px-4 rounded-lg text-center sm:text-left">
                      <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                        MOT Fee
                      </div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#19CA32]">
                        £{class4Mot.price.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {class4Retest && (
                    <div className="px-3 sm:px-4 rounded-lg text-center sm:text-left">
                      <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                        Retest Fee
                      </div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#19CA32]">
                        £{class4Retest.price.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {/* Additional Services */}
            {additionals && additionals.length > 0 && (
              <div className="bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 border-b border-[#D2D2D5] pb-2">
                  Additional services
                </h3>
                <div className="space-y-0">
                  {additionals.map((additional, index) => (
                    <div key={additional.id} className="relative">
                      {index > 0 && (
                        <div className="absolute top-0 left-0 right-0 border-t border-gray-200"></div>
                      )}
                      <div className="flex items-center text-gray-700 text-sm sm:text-base py-2 sm:py-3">
                        <div className="w-5 h-5 mr-3 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M22.7 19.5l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l1.8-1.8c.5-.4.5-1.1.1-1.4z" />
                          </svg>
                        </div>
                        <span>{additional.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {schedule && schedule.daily_hours && (
              <div className="bg-[#F8FAFB] p-3 sm:p-4 rounded-lg border border-[#D2D2D5]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                  Opening Hours
                </h3>
                <div className="text-xs sm:text-sm text-gray-500 mb-3">
                  Opening hours may vary due to public holidays.
                </div>

                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                            Day
                          </th>
                          <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                            Opening
                          </th>
                          <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                            Closing
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
                          const dayName = getDayName(dayNum);
                          const dayHours =
                            schedule.daily_hours[dayNum.toString()];

                          if (dayHours?.is_closed) {
                            return (
                              <tr
                                key={dayNum}
                                className="border-t border-gray-200"
                              >
                                <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap">
                                  {dayName}
                                </td>
                                <td
                                  colSpan={2}
                                  className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base"
                                >
                                  Closed
                                </td>
                              </tr>
                            );
                          }

                          if (
                            dayHours?.intervals &&
                            dayHours.intervals.length > 0
                          ) {
                            return dayHours.intervals.map((interval, idx) => (
                              <tr
                                key={`${dayNum}-${idx}`}
                                className="border-t border-gray-200"
                              >
                                {idx === 0 && (
                                  <td
                                    rowSpan={dayHours.intervals.length}
                                    className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap align-top"
                                  >
                                    {dayName}
                                  </td>
                                )}
                                <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base whitespace-nowrap">
                                  {formatTime(interval.start_time)}
                                </td>
                                <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base whitespace-nowrap">
                                  {formatTime(interval.end_time)}
                                </td>
                              </tr>
                            ));
                          }

                          return (
                            <tr
                              key={dayNum}
                              className="border-t border-gray-200"
                            >
                              <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-900 text-sm sm:text-base whitespace-nowrap">
                                {dayName}
                              </td>
                              <td
                                colSpan={3}
                                className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-sm sm:text-base"
                              >
                                Not Available
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Map and Booking */}
        <div className="space-y-4 sm:space-y-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="relative">
              <div className="h-64 sm:h-80 lg:h-96 relative">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    (garage.address || "") + ", " + garage.zip_code,
                  )}&output=embed&z=15`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  className="rounded-t-lg"
                  title={`Map showing location of ${garage.garage_name}`}
                ></iframe>
              </div>

              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full bg-[#19CA32] text-white shadow-none font-semibold py-4 sm:py-6 text-sm xl:text-base rounded-lg transition-all duration-150 ease-out touch-manipulation select-none hover:bg-[#16b82e] hover:shadow-sm active:scale-[0.97] active:duration-75 active:bg-[#128f24] active:shadow-inner"
                >
                  Book My MOT
                </Button>

                {/* Payment Info */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                  <p className="text-gray-700 font-medium text-sm sm:text-base lg:text-lg leading-relaxed">
                    No upfront payment - pay at the garage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        garage={transformedGarage}
        vehicleId={vehicleId || undefined}
        vehicleRegistrationNumber={registrationFromURL || undefined}
      />

      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        submittedBooking={null}
        selectedSlot={
          successDetails?.start_time && successDetails?.end_time
            ? ({
                slot_id: "",
                garage_id: "",
                vehicle_id: "",
                date: successDetails.date,
                start_time: successDetails.start_time,
                end_time: successDetails.end_time,
                order_id: successDetails.order_id,
              } as any)
            : null
        }
        totalAmount={successDetails?.total_amount}
        selectedDate={
          successDetails?.date ? new Date(successDetails.date) : undefined
        }
        garage={
          successDetails?.garage_name
            ? ({
                garage_name: successDetails.garage_name,
                address: successDetails.garage_address,
              } as any)
            : null
        }
        formatTime={(time: string) => {
          if (!time) return "";
          const [hours, minutes] = time.split(":");
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        }}
      />

      {/* Auto-booking Loading Overlay */}
      {isLoggedIn === "true" &&
        (isAddingVehicle || isBooking || isFetchingVehicles) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl scale-110">
              <LoadingSpinner
                size="lg"
                text="Finalizing Your Booking..."
                fullScreen={false}
              />
            </div>
          </div>
        )}
    </div>
  );
}

export default function Details() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-96">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      }
    >
      <DetailsContent />
    </Suspense>
  );
}
