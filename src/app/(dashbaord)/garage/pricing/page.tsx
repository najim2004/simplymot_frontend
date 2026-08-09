"use client";

import React, { useState } from "react";
import {
  MotFeeAdd,
  AdditionalServicesAdd,
  useGetGarageProfileQuery,
  useGetServicesQuery,
  useUpsertServicesMutation,
  ServiceItem,
} from "@/features/garage";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

export default function PricingPage() {
  // 1. Get Garage Profile to extract Garage ID
  const { data: profileRes, isLoading: isProfileLoading } = useGetGarageProfileQuery();
  const garageId = profileRes?.data?.id;

  // 2. Fetch Garage Services using Garage ID
  const {
    data: servicesRes,
    isLoading: isServicesLoading,
    isError,
    refetch,
  } = useGetServicesQuery(garageId!, { skip: !garageId });

  // 3. Upsert Services Mutation
  const [upsertServices, { isLoading: isSaving }] = useUpsertServicesMutation();

  // State to hold updated service items ready for submit
  const [motPayload, setMotPayload] = useState<ServiceItem[]>([]);
  const [othersPayload, setOthersPayload] = useState<ServiceItem[]>([]);

  const isLoading = isProfileLoading || isServicesLoading;
  const servicesBundle = servicesRes?.data;
  const motServices = servicesBundle?.mot_services || [];
  const otherServices = servicesBundle?.other_services || [];

  const handleSave = async () => {
    if (!garageId) {
      toast.error("Garage ID not found. Please try again.");
      return;
    }

    const payload: ServiceItem[] = [...motPayload, ...othersPayload];

    if (payload.length === 0) {
      toast.info("No service changes to save.");
      return;
    }

    try {
      const res = await upsertServices({ garageId, body: { services: payload } }).unwrap();
      toast.success(res.message || "Services updated successfully");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : null;
      toast.error(msg || "Failed to update services. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-[#19CA32] p-6 animate-pulse space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#19CA32] p-6 animate-pulse space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-11 w-full rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <p className="text-red-500 text-sm">Unable to load pricing data.</p>
        <Button onClick={() => refetch()} className="bg-[#19CA32] hover:bg-[#16b82e]">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <MotFeeAdd motServices={motServices} onChange={setMotPayload} />
      <AdditionalServicesAdd
        garageId={garageId || ""}
        otherServices={otherServices}
        onChange={setOthersPayload}
      />

      <div className="mb-10">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-10 bg-[#19CA32] cursor-pointer hover:bg-[#16b82e] text-white font-medium text-base disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin inline-block" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}
