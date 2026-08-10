"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  useSearchVehiclesAndGaragesQuery,
  GarageSortBy,
} from "@/features/driver";
import { useAppSelector } from "@/store/hooks";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";
import { consumeBookMyMotScrollPosition } from "@/lib/book-my-mot-navigation";
import { normalizeRegistration } from "@/lib/helper/vehicle.helper";
import {
  BookMyMotSearchForm,
  BookMyMotResultsSection,
  BookMyMotAutoBooking,
} from "@/features/driver/components/bookMyMot";

// --- Helper Utilities ---
function formatMotExpiryDate(date: string) {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function parseApiErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const msg = (error as { data?: { message?: string | string[] } }).data
      ?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }
  return "Failed to search data. Please try again.";
}

function BookMyMOTContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  // Extract search parameters from URL
  const registration = searchParams?.get("registration") || "";
  const postcode = searchParams?.get("postcode") || "";
  const page = Number(searchParams?.get("page")) || 1;
  const limit = Number(searchParams?.get("limit")) || 10;
  const sortBy = (searchParams?.get("sort_by") ||
    GarageSortBy.DISTANCE) as GarageSortBy;

  const shouldShowMotExpiry = Boolean(user?.id);
  const isSearchActive = Boolean(registration && postcode);

  const resultsRef = useRef<HTMLDivElement>(null);
  const pendingScrollRestore = useRef<number | null>(null);

  useEffect(() => {
    pendingScrollRestore.current = consumeBookMyMotScrollPosition();
  }, []);

  // Discover API Query (handles sorting, pagination, vehicle & garage discovery)
  const { data, isLoading, error, refetch, isFetching } =
    useSearchVehiclesAndGaragesQuery(
      {
        registration_number: registration,
        postcode,
        page,
        limit,
        sort_by: sortBy,
      },
      { skip: !isSearchActive },
    );

  const vehicle = isSearchActive ? data?.data?.vehicle || null : null;
  const garages = isSearchActive ? data?.data?.garages || [] : [];
  const showResults =
    isSearchActive && (vehicle !== null || garages.length > 0);

  // Scroll restoration on search finish
  useEffect(() => {
    if (!isSearchActive || !data || isFetching) return;

    const savedScroll = pendingScrollRestore.current;
    if (savedScroll !== null) {
      pendingScrollRestore.current = null;
      requestAnimationFrame(() =>
        window.scrollTo({ top: savedScroll, behavior: "auto" }),
      );
    } else {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [data, isFetching, isSearchActive]);

  // Handle search errors
  useEffect(() => {
    if (error) {
      toast.error(parseApiErrorMessage(error), { toastId: "search-api-error" });
    }
  }, [error]);

  // Helper to push URL param changes cleanly
  const updateURLParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString());
    Object.entries(updates).forEach(([key, val]) => params.set(key, val));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (newReg: string, newPostcode: string) => {
    const normalizedReg = normalizeRegistration(newReg);
    if (registration === normalizedReg && postcode === newPostcode) {
      refetch();
    } else {
      updateURLParams({
        registration: normalizedReg,
        postcode: newPostcode,
        page: "1",
        limit: String(limit),
        sort_by: sortBy,
      });
    }
  };

  const handleSortChange = (newSortBy: string) => {
    updateURLParams({ sort_by: newSortBy });
  };

  return (
    <div className="w-full mx-auto">
      {/* Auto-booking handler for guest users returning after login */}
      <BookMyMotAutoBooking />

      <BookMyMotSearchForm
        defaultRegistration={registration}
        defaultPostcode={postcode}
        isLoading={isLoading}
        isFetching={isFetching}
        showResults={showResults}
        vehicle={vehicle}
        shouldShowMotExpiry={shouldShowMotExpiry}
        onSearchSubmit={handleSearchSubmit}
        formatMotExpiryDate={formatMotExpiryDate}
      />

      <BookMyMotResultsSection
        resultsRef={resultsRef}
        showResults={showResults}
        vehicle={vehicle}
        garages={garages}
        currentSortBy={sortBy}
        onSortChange={handleSortChange}
      />
    </div>
  );
}

export default function BookMyMOT() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." fullScreen={false} />
        </div>
      }
    >
      <BookMyMOTContent />
    </Suspense>
  );
}
