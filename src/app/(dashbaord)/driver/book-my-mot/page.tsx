"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
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
} from "@/features/driver/components/bookMyMot";

function BookMyMOTContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsFromURL = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);

  const registrationFromURL = searchParamsFromURL?.get("registration") || "";
  const postcodeFromURL = searchParamsFromURL?.get("postcode") || "";
  const pageFromURL = Number(searchParamsFromURL?.get("page")) || 1;
  const limitFromURL = Number(searchParamsFromURL?.get("limit")) || 10;
  const sortByFromURL = searchParamsFromURL?.get("sort_by") || GarageSortBy.DISTANCE;

  const shouldShowMotExpiry = Boolean(user?.id);
  const isSearchActive = !!(registrationFromURL && postcodeFromURL);

  const resultsRef = useRef<HTMLDivElement>(null);
  const pendingScrollRestore = useRef<number | null>(null);

  useEffect(() => {
    pendingScrollRestore.current = consumeBookMyMotScrollPosition();
  }, []);

  const formatMotExpiryDate = (date: string) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Discover API Query (API handles sorting, pagination, and vehicle/garage discovery)
  const { data, isLoading, error, refetch, isFetching } =
    useSearchVehiclesAndGaragesQuery(
      {
        registration_number: registrationFromURL,
        postcode: postcodeFromURL,
        page: pageFromURL,
        limit: limitFromURL,
        sort_by: sortByFromURL as GarageSortBy,
      },
      {
        skip: !isSearchActive,
      },
    );

  // Directly derived data from API response to avoid stale local state
  const vehicle = isSearchActive ? (data?.data?.vehicle || null) : null;
  const garages = isSearchActive ? (data?.data?.garages || []) : [];

  // Scroll restoration on search finish
  useEffect(() => {
    if (isSearchActive && data && !isFetching) {
      const savedScroll = pendingScrollRestore.current;
      if (savedScroll !== null) {
        pendingScrollRestore.current = null;
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedScroll, behavior: "auto" });
        });
      } else {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [data, isFetching, isSearchActive]);

  // Handle search errors
  useEffect(() => {
    if (error) {
      let errorMessage = "Failed to search data. Please try again.";
      if ("data" in error && (error.data as any)?.message) {
        const msg = (error.data as any).message;
        if (Array.isArray(msg)) {
          errorMessage = msg.join(", ");
        } else {
          errorMessage =
            typeof msg === "string" ? msg : msg.message || errorMessage;
        }
      }
      toast.error(errorMessage, { toastId: "search-api-error" });
    }
  }, [error]);

  const handleSearchSubmit = (registration: string, postcode: string) => {
    const normalizedReg = normalizeRegistration(registration);
    if (registrationFromURL === normalizedReg && postcodeFromURL === postcode) {
      refetch();
    } else {
      const params = new URLSearchParams(searchParamsFromURL?.toString());
      params.set("registration", normalizedReg);
      params.set("postcode", postcode);
      params.set("page", "1");
      params.set("limit", String(limitFromURL));
      params.set("sort_by", sortByFromURL);

      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    const params = new URLSearchParams(searchParamsFromURL?.toString());
    params.set("sort_by", newSortBy);
    router.push(`${pathname}?${params.toString()}`);
  };

  const showResults = isSearchActive && (vehicle !== null || garages.length > 0);

  return (
    <div className="w-full mx-auto">
      {/* Search Header Form Component */}
      <BookMyMotSearchForm
        defaultRegistration={registrationFromURL}
        defaultPostcode={postcodeFromURL}
        isLoading={isLoading}
        isFetching={isFetching}
        showResults={showResults}
        vehicle={vehicle}
        shouldShowMotExpiry={shouldShowMotExpiry}
        onSearchSubmit={handleSearchSubmit}
        formatMotExpiryDate={formatMotExpiryDate}
      />

      {/* Results Section Component */}
      <BookMyMotResultsSection
        resultsRef={resultsRef}
        showResults={showResults}
        vehicle={vehicle}
        garages={garages}
        currentSortBy={sortByFromURL}
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
