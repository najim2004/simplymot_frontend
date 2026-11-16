"use client";

import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  Phone,
  User as UserIcon,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetAVehicleDetailsQuery,
  useGetVehicleMotHistoryQuery,
  type VehicleMotHistoryItem,
} from "@/features/admin";

function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return format(d, "dd MMM yyyy");
  } catch {
    return "—";
  }
}

function getInitials(name?: string | null, fallback = "O"): string {
  if (!name || name === "N/A" || name === "-") return fallback;
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  if (!clean) return fallback;
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </p>
      <div className="text-sm font-semibold text-gray-900 wrap-break-word">
        {value || "—"}
      </div>
    </div>
  );
}

function MotStatusBadge({
  status,
  isExpired,
}: {
  status?: string | null;
  isExpired?: boolean;
}) {
  const raw = (status || "").toUpperCase();
  const expired = isExpired || raw === "EXPIRED";
  const label = expired ? "EXPIRED" : raw || "VALID";
  const className = expired
    ? "bg-red-100 text-red-800 border-red-200"
    : label === "FAILED"
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";

  return (
    <Badge className={`text-xs font-medium border ${className}`}>{label}</Badge>
  );
}

export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params?.id as string;

  const {
    data: vehicleRes,
    isLoading,
    isError,
    refetch,
  } = useGetAVehicleDetailsQuery(vehicleId, { skip: !vehicleId });

  const {
    data: historyRes,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useGetVehicleMotHistoryQuery(
    { id: vehicleId, page: 1, limit: 50 },
    { skip: !vehicleId },
  );

  const vehicle = vehicleRes?.data;
  const history: VehicleMotHistoryItem[] = historyRes?.data || [];
  const owner = vehicle?.user;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading vehicle details...</span>
        </div>
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            Failed to load vehicle details.
          </p>
          <Button onClick={() => refetch()} className="mt-4 cursor-pointer">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const makeModel = [vehicle.make, vehicle.model].filter(Boolean).join(" ");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/vehicles-management")}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Vehicle Details
        </h1>
      </div>

      {/* Header card */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="px-3 py-2 bg-amber-400 text-black rounded-lg font-mono font-black text-sm tracking-wider border-2 border-amber-500 shadow-xs">
              {vehicle.registration_number}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {makeModel || "Vehicle"}
              </h2>
              <p className="text-sm text-gray-500">
                {[
                  vehicle.color,
                  vehicle.fuel_type,
                  vehicle.year_of_manufacture
                    ? `Year ${vehicle.year_of_manufacture}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" • ") || "No extra vehicle info"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">MOT Status</p>
              <div className="mt-1">
                <MotStatusBadge
                  status={vehicle.mot_status}
                  isExpired={vehicle.is_expired}
                />
              </div>
            </div>
            <div className="text-right border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-500">MOT Expiry</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {formatDate(vehicle.mot_expiry_date)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle details */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Car className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Vehicle Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <DetailItem
            label="Registration Number"
            value={
              <span className="font-mono tracking-wide">
                {vehicle.registration_number}
              </span>
            }
          />
          <DetailItem label="Make & Model" value={makeModel || "—"} />
          <DetailItem
            label="MOT Expiry Status"
            value={
              <div className="flex items-center gap-2">
                <MotStatusBadge
                  status={vehicle.mot_status}
                  isExpired={vehicle.is_expired}
                />
                <span className="text-xs text-gray-500 font-medium">
                  {formatDate(vehicle.mot_expiry_date)}
                </span>
              </div>
            }
          />
          <DetailItem
            label="Tax Status"
            value={
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-xs border ${
                    (vehicle.tax_status || "").toUpperCase() === "TAXED"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }`}
                >
                  {(vehicle.tax_status || "—").toUpperCase()}
                </Badge>
                <span className="text-xs text-gray-500 font-medium">
                  {formatDate(vehicle.tax_due_date)}
                </span>
              </div>
            }
          />
          <DetailItem
            label="Fuel Type"
            value={(vehicle.fuel_type || "—").toString().toUpperCase()}
          />
          <DetailItem
            label="Colour"
            value={
              <span className="capitalize">{vehicle.color || "—"}</span>
            }
          />
          <DetailItem
            label="CO₂ Emissions"
            value={
              vehicle.co2_emissions != null
                ? `${vehicle.co2_emissions} g/km`
                : "—"
            }
          />
          <DetailItem
            label="Year of Manufacture"
            value={vehicle.year_of_manufacture ?? "—"}
          />
          <DetailItem
            label="First Registered"
            value={vehicle.month_of_first_reg || "—"}
          />
          <DetailItem label="Wheelplan" value={vehicle.wheelplan || "—"} />
          <DetailItem
            label="Last V5C Issued"
            value={formatDate(vehicle.date_of_last_v5c_issued)}
          />
          <DetailItem
            label="Last Synced At"
            value={formatDate(vehicle.mot_last_checked_at)}
          />
          <DetailItem
            label="Added At"
            value={formatDate(vehicle.created_at)}
          />
        </div>
      </div>

      {/* Owner summary */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Owner
            </h3>
          </div>
          {owner?.id && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => router.push(`/admin/manage-drivers/${owner.id}`)}
            >
              View Owner
            </Button>
          )}
        </div>

        <div className="flex items-start gap-4">
          {owner?.avatar ? (
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200">
              <Image
                src={owner.avatar}
                alt={owner.name || "Owner"}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-12 w-12 shrink-0 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center border border-gray-200">
              {getInitials(owner?.name, "O")}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-base font-bold text-gray-900">
              {owner?.name || "—"}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              {owner?.email || "—"}
            </p>
            {owner?.phone_number && (
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {owner.phone_number}
              </p>
            )}
            {owner?.status && (
              <div className="pt-1">
                <Badge
                  className={`text-xs border ${
                    owner.status.toUpperCase() === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }`}
                >
                  {owner.status}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOT Reports */}
      <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <ClipboardList className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            MOT Test History & Defect Reports
          </h3>
        </div>

        {isHistoryLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading MOT reports...</span>
          </div>
        ) : isHistoryError ? (
          <div className="text-center py-8 text-sm text-red-600">
            Failed to load MOT reports.
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 rounded-lg border border-dashed border-gray-200">
            <Wrench className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">
              No MOT test records found
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              No official MOT history records have been synced for this vehicle
              yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((test, index) => {
              const isPassed =
                test.status?.toUpperCase() === "PASSED" ||
                test.status?.toUpperCase() === "PASS";
              const defects = test.defects || [];

              return (
                <div
                  key={test.id || index}
                  className="rounded-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 ${
                          isPassed
                            ? "bg-emerald-600 text-white hover:bg-emerald-600"
                            : "bg-red-600 text-white hover:bg-red-600"
                        }`}
                      >
                        {isPassed ? "PASSED" : "FAILED"}
                      </Badge>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Test Date: {formatDate(test.test_date)}
                        </p>
                        {test.test_number && (
                          <p className="text-xs text-gray-500 font-mono">
                            Test #{test.test_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      {test.odometer_value != null && (
                        <div>
                          <span className="text-gray-400">Odometer:</span>{" "}
                          <span className="font-semibold text-gray-900">
                            {Number(test.odometer_value).toLocaleString()}{" "}
                            {test.odometer_unit || "mi"}
                          </span>
                        </div>
                      )}
                      {test.expiry_date && (
                        <div>
                          <span className="text-gray-400">Expires:</span>{" "}
                          <span className="font-semibold text-gray-900">
                            {formatDate(test.expiry_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-white">
                    {defects.length === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/60 p-2.5 rounded border border-emerald-100">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          No defects or advisories recorded for this test.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Noted Defects & Advisories ({defects.length})
                        </p>
                        <div className="space-y-1.5">
                          {defects.map((defect, dIdx) => {
                            const isDangerous =
                              defect.dangerous ||
                              defect.type?.toUpperCase() === "DANGEROUS";
                            const isMajor =
                              defect.type?.toUpperCase() === "MAJOR";

                            return (
                              <div
                                key={defect.id || dIdx}
                                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                                  isDangerous
                                    ? "bg-red-50/80 border-red-200 text-red-900"
                                    : isMajor
                                      ? "bg-amber-50/80 border-amber-200 text-amber-900"
                                      : "bg-blue-50/60 border-blue-200 text-blue-900"
                                }`}
                              >
                                <span
                                  className={`shrink-0 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                                    isDangerous
                                      ? "bg-red-600 text-white"
                                      : isMajor
                                        ? "bg-amber-600 text-white"
                                        : "bg-blue-600 text-white"
                                  }`}
                                >
                                  {defect.type || "Advisory"}
                                </span>
                                <p className="flex-1 font-medium leading-relaxed">
                                  {defect.text}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
