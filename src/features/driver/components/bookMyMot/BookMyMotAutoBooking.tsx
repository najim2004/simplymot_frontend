"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import {
  setPendingBooking,
  useAddVehicleMutation,
  useGetVehiclesQuery,
  useBookSlotMutation,
  BookingSuccessModal,
} from "@/features/driver";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";
import { trackBookingConversionFromApiData } from "@/lib/tracking";

export const BookMyMotAutoBooking: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const searchParamsFromURL = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  const isLoggedIn = searchParamsFromURL?.get("is_logged_in");

  const pendingBooking = useSelector(
    (rootState: RootState) => rootState.bookMyMot.pendingBooking,
  );

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{
    garage_name: string;
    garage_address: string;
    date: string;
    start_time: string;
    end_time: string;
    order_id?: string;
    total_amount?: string | number;
  } | null>(null);

  const isBookingInitiated = useRef(false);

  const { data: vehicles, isFetching: isFetchingVehicles } = useGetVehiclesQuery(
    null,
    { skip: !user?.id },
  );
  const [addVehicle, { isLoading: isAddingVehicle }] = useAddVehicleMutation();
  const [bookSlot, { isLoading: isBooking }] = useBookSlotMutation();

  useEffect(() => {
    const performAutoBooking = async () => {
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

      if (
        !pendingBooking.expires_at ||
        Date.now() > new Date(pendingBooking.expires_at).getTime()
      ) {
        cleanupBookingState();
        return;
      }

      isBookingInitiated.current = true;

      try {
        let vehicleId = "";
        const existVehicle = vehicles?.data?.find(
          (vehicle) =>
            vehicle.registration_number ===
            pendingBooking.vehicle_registration_number,
        );

        if (existVehicle) {
          vehicleId = existVehicle.id;
        } else {
          const response = await addVehicle({
            registration_number: pendingBooking.vehicle_registration_number,
          }).unwrap();
          if (!response.success || !response?.data?.id)
            throw new Error(response.message || "Failed to add vehicle");
          vehicleId = response.data.id;
        }

        const result = await bookSlot({
          vehicle_id: vehicleId,
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

          const bookingData = result.data as Record<string, unknown> | undefined;
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
      } catch (error: any) {
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Failed to book slot. Please try again.";
        toast.error(errorMessage);
      } finally {
        cleanupBookingState();
      }
    };

    const cleanupBookingState = () => {
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
          garage_name: "",
          garage_address: "",
        }),
      );

      const params = new URLSearchParams(searchParamsFromURL?.toString());
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
    pathname,
    searchParamsFromURL,
  ]);

  return (
    <>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-9999 flex flex-col items-center justify-center">
            <div className="bg-white p-10 rounded-3xl shadow-2xl scale-110">
              <LoadingSpinner
                size="lg"
                text="Finalizing Your Booking..."
                fullScreen={false}
              />
            </div>
          </div>
        )}
    </>
  );
};
