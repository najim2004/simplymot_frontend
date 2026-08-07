"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import VehiclesCardReusble from "@/components/reusable/Dashboard/Driver/VehiclesCardReusble";
import {
  useGetVehiclesQuery,
  useLazyGetVehicleMotReportsQuery,
  ErrorDisplay,
  SelectedVehicleHeaderCard,
  MotReportsHeaderSection,
  MotReportsContentSection,
  MotHistoryItem,
  ApiVehicle,
} from "@/features/driver";

export default function MotReportsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawUrlId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id || null;

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const limitFromUrl = Number(searchParams.get("limit")) || 10;

  const {
    data: vehiclesResponse,
    isLoading: isLoadingVehicles,
    error: vehiclesError,
  } = useGetVehiclesQuery();

  const [
    getMotReports,
    {
      data: motReportsData,
      isLoading: isLoadingMotReports,
      error: motReportsError,
    },
  ] = useLazyGetVehicleMotReportsQuery();

  const apiVehicles: ApiVehicle[] = vehiclesResponse?.data || [];
  const selectedVehicleId = rawUrlId || apiVehicles[0]?.id || "";

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const limit = limitFromUrl;

  // Keep currentPage in sync with URL search params
  useEffect(() => {
    if (pageFromUrl && pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
  }, [pageFromUrl, currentPage]);

  // Update URL if no vehicle ID in URL params
  useEffect(() => {
    if (!rawUrlId && selectedVehicleId) {
      router.replace(
        `/driver/mot-reports/${selectedVehicleId}?page=${currentPage}&limit=${limit}`,
      );
    }
  }, [rawUrlId, selectedVehicleId, currentPage, limit, router]);

  // Trigger lazy query when selectedVehicleId, currentPage or limit changes
  useEffect(() => {
    if (selectedVehicleId) {
      getMotReports({
        id: selectedVehicleId,
        page: currentPage,
        limit,
        status: "",
      });
    }
  }, [selectedVehicleId, currentPage, limit, getMotReports]);

  // Selected vehicle & direct MOT reports from API
  const selectedVehicle: ApiVehicle | null =
    apiVehicles.find((v: ApiVehicle) => v.id === selectedVehicleId) || null;

  const motReports: MotHistoryItem[] = motReportsData?.data || [];
  const totalReports = motReportsData?.meta_data?.total || 0;

  // Handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (selectedVehicleId) {
      router.push(
        `/driver/mot-reports/${selectedVehicleId}?page=${newPage}&limit=${limit}`,
      );
    }
  };

  const handleVehicleClick = (vehicle: ApiVehicle) => {
    if (vehicle?.id) {
      setCurrentPage(1);
      router.push(`/driver/mot-reports/${vehicle.id}?page=1&limit=${limit}`);
    }
  };

  const errorMessage =
    vehiclesError && "data" in vehiclesError
      ? (vehiclesError.data as { message?: string })?.message
      : motReportsError && "data" in motReportsError
        ? (motReportsError.data as { message?: string })?.message
        : vehiclesError
          ? "Failed to load vehicles"
          : motReportsError
            ? "Failed to load MOT reports"
            : null;

  return (
    <div className="w-full mx-auto">
      <ErrorDisplay error={errorMessage} />

      {!vehiclesError && (
        <>
          {/* Vehicle Selector Cards */}
          <div className="mb-4 sm:mb-6">
            <VehiclesCardReusble
              vehicles={apiVehicles}
              onVehicleClick={handleVehicleClick}
              selectedVehicleId={selectedVehicleId}
              isLoading={isLoadingVehicles}
            />
          </div>

          {/* Selected Vehicle Header Card */}
          {selectedVehicle && (
            <SelectedVehicleHeaderCard
              make={selectedVehicle?.make}
              model={selectedVehicle?.model}
              registrationNumber={selectedVehicle?.registration_number}
              color={selectedVehicle?.color || ""}
              fuelType={selectedVehicle?.fuel_type || ""}
              monthOfFirstReg={selectedVehicle?.month_of_first_reg || "N/A"}
            />
          )}

          {/* MOT Reports Header Section */}
          <MotReportsHeaderSection />

          {/* MOT Reports Content List with URL-synced Page Pagination */}
          <MotReportsContentSection
            isLoadingMotReports={isLoadingMotReports}
            isLoadingDetails={false}
            showDetails={Boolean(selectedVehicle)}
            selectedVehicle={selectedVehicle}
            filteredReports={motReports}
            totalReports={totalReports}
            currentPage={currentPage}
            limit={limit}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
