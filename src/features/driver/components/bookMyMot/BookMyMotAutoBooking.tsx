"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  useBookSlotMutation,
  BookingSuccessModal,
  type BookSlotResponse,
} from "@/features/driver";
import { trackBookingConversionFromApiData } from "@/lib/tracking";

/**
 * Handles auto-booking after a guest user logs in.
 *
 * Flow:
 *  1. Guest selects a slot → BookingModal encodes booking params into URL
 *     and redirects to /create-account/driver?redirect=<url-with-bk_*-params>
 *  2. After Register → Verify → Login, AuthLoginForm appends is_logged_in=true
 *     to the redirect URL and pushes back to the book-my-mot page.
 *  3. This component detects is_logged_in=true + bk_* params and calls the
 *     booking API directly with vehicle_registration_number — the backend
 *     handles vehicle find-or-create automatically.
 *  4. After booking (success or error), all bk_* and is_logged_in params are
 *     cleaned from the URL.
 */
export const BookMyMotAutoBooking: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  const isLoggedIn = searchParams?.get("is_logged_in");

  // Read booking params from URL
  const bkGarageId = searchParams?.get("bk_garage_id") || "";
  const bkSlotId = searchParams?.get("bk_slot_id") || "";
  const bkStartsAt = searchParams?.get("bk_starts_at") || "";
  const bkEndsAt = searchParams?.get("bk_ends_at") || "";
  const bkReg = searchParams?.get("bk_reg") || "";
  const bkServices = searchParams?.get("bk_services") || "";
  const bkGarageName = searchParams?.get("bk_garage_name") || "";
  const bkGarageAddress = searchParams?.get("bk_garage_address") || "";
  const bkGarageEmail = searchParams?.get("bk_garage_email") || "";
  const bkGaragePhone = searchParams?.get("bk_garage_phone") || "";

  const hasPendingBooking =
    isLoggedIn === "true" && !!bkGarageId && (!!bkSlotId || !!bkStartsAt);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [bookingResponse, setBookingResponse] =
    useState<BookSlotResponse | null>(null);

  const isBookingInitiated = useRef(false);

  // Single mutation — backend handles vehicle find-or-create via vehicle_registration_number
  const [bookSlot, { isLoading: isBooking }] = useBookSlotMutation();

  // Clean booking params from URL silently without triggering Next.js page re-navigation
  const cleanupBookingParams = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const bookingKeys = [
      "is_logged_in",
      "bk_garage_id",
      "bk_slot_id",
      "bk_starts_at",
      "bk_ends_at",
      "bk_reg",
      "bk_services",
      "bk_garage_name",
      "bk_garage_address",
      "bk_garage_email",
      "bk_garage_phone",
    ];
    bookingKeys.forEach((k) => params.delete(k));
    const newQuery = params.toString();
    const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
    window.history.replaceState(null, "", newUrl);
  };

  useEffect(() => {
    const performAutoBooking = async () => {
      if (
        !hasPendingBooking ||
        !user?.id ||
        isBooking ||
        isBookingInitiated.current
      ) {
        return;
      }

      // Deduplication guard using sessionStorage to prevent duplicate API executions
      const bookingKey = `auto_booked_${bkGarageId}_${bkSlotId || bkStartsAt}_${bkReg}`;
      if (sessionStorage.getItem(bookingKey)) {
        cleanupBookingParams();
        return;
      }

      isBookingInitiated.current = true;
      sessionStorage.setItem(bookingKey, "true");

      try {
        const result = await bookSlot({
          garage_id: bkGarageId,
          vehicle_registration_number: bkReg || undefined,
          additional_services: bkServices || undefined,
          ...(bkSlotId
            ? { slot_id: bkSlotId }
            : {
                starts_at: bkStartsAt || undefined,
                ends_at: bkEndsAt || undefined,
              }),
        }).unwrap();

        if (result.success !== false) {
          trackBookingConversionFromApiData(result.data);
          toast.success(result.message || "MOT Slot booked successfully!");

          // Enrich response with garage info from URL params (API may not return it)
          const enrichedResponse: BookSlotResponse = {
            ...result,
            data: {
              ...result.data,
              garage: result.data?.garage ?? {
                garage_name: bkGarageName || undefined,
                address: bkGarageAddress || undefined,
                email: bkGarageEmail || undefined,
                phone_number: bkGaragePhone || undefined,
              },
            },
          };

          setBookingResponse(enrichedResponse);
          setIsSuccessModalOpen(true);
        } else {
          sessionStorage.removeItem(bookingKey);
          toast.error(result.message || "Failed to book slot");
        }
      } catch (error: unknown) {
        sessionStorage.removeItem(bookingKey);
        const err = error as {
          data?: { message?: string; error?: string };
          message?: string;
        };
        const errorMessage =
          err?.data?.message ||
          err?.data?.error ||
          err?.message ||
          "Failed to book slot. Please try again.";
        toast.error(errorMessage);
      } finally {
        cleanupBookingParams();
      }
    };

    performAutoBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPendingBooking, user, isBooking]);

  return (
    <>
      <BookingSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        bookingResponse={bookingResponse}
        garageInfo={{
          garage_name: bkGarageName || undefined,
          address: bkGarageAddress || undefined,
          email: bkGarageEmail || undefined,
          phone_number: bkGaragePhone || undefined,
        }}
      />

      {/* Full screen blurred loading overlay while auto-booking */}
      {hasPendingBooking &&
        (isBooking || isBookingInitiated.current) &&
        !isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-99999 flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="w-16 h-16 rounded-full bg-[#19CA32]/20 flex items-center justify-center mb-5 ring-8 ring-[#19CA32]/10">
              <Loader2 className="w-10 h-10 text-[#19CA32] animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Finalizing Your MOT Booking...
            </h3>
            <p className="text-sm text-gray-300 mt-2 max-w-md leading-relaxed">
              Please wait a moment while we confirm your appointment and vehicle
              details with the garage.
            </p>
          </div>
        )}
    </>
  );
};
