"use client";
import React from "react";
import { GarageProfileAdd } from "@/features/garage";
import { useGetProfileQuery } from "@/features/garage";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function GarageProfile() {
  const { data, isLoading, isError, refetch } = useGetProfileQuery();
  const profile = data?.data;

  if (isLoading) {
    return (
      <div className="w-full py-6 space-y-6">
        <div className="w-full bg-white rounded-xl border border-[#19CA32] p-8 space-y-6 animate-pulse">
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <Skeleton className="h-28 w-28 rounded-lg" />
            <div className="flex flex-col items-end gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">
          Unable to Load Profile
        </h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Failed to fetch garage profile information. Please check your network
          and try again.
        </p>
        <Button
          onClick={() => refetch()}
          className="bg-[#19CA32] hover:bg-[#16b82e] text-white px-6 py-2 rounded-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GarageProfileAdd profile={profile} />
    </div>
  );
}
