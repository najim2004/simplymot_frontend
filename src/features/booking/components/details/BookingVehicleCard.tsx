"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Car,
  Hash,
  Palette,
  Fuel,
  Gauge,
  CalendarClock,
  CalendarX,
  CheckCircle,
} from "lucide-react";
import type { BookingVehicle } from "@/features/booking/types";
import { getBrandLogo } from "@/features/vehicle";

export interface BookingVehicleCardProps {
  vehicle?: BookingVehicle | null;
}

export function BookingVehicleCard({ vehicle }: BookingVehicleCardProps) {
  const [logoError, setLogoError] = useState(false);
  const vehicleLogo = getBrandLogo(vehicle?.make);

  const vehicleFields = [
    {
      icon: <Hash className="w-3.5 h-3.5" />,
      label: "Registration",
      value: vehicle?.registration_number,
      mono: true,
    },
    {
      icon: <Car className="w-3.5 h-3.5" />,
      label: "Make",
      value: vehicle?.make,
    },
    {
      icon: <Car className="w-3.5 h-3.5" />,
      label: "Model",
      value: vehicle?.model,
    },
    {
      icon: <Palette className="w-3.5 h-3.5" />,
      label: "Color",
      value: vehicle?.color,
    },
    {
      icon: <Fuel className="w-3.5 h-3.5" />,
      label: "Fuel",
      value: vehicle?.fuel_type,
    },
    {
      icon: <Gauge className="w-3.5 h-3.5" />,
      label: "Engine",
      value: vehicle?.engine_capacity ? `${vehicle.engine_capacity} cc` : null,
    },
    vehicle?.year_of_manufacture
      ? {
          icon: <CalendarClock className="w-3.5 h-3.5" />,
          label: "Year",
          value: String(vehicle.year_of_manufacture),
        }
      : null,
    {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      label: "MOT Status",
      value: vehicle?.mot_status || "Valid",
      highlight: true,
    },
    vehicle?.mot_expiry_date
      ? {
          icon: <CalendarX className="w-3.5 h-3.5" />,
          label: "MOT Expiry",
          value: format(new Date(vehicle.mot_expiry_date), "dd MMM yyyy"),
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
      {/* Header: logo + make/model */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center shrink-0 p-1.5">
          {vehicleLogo && !logoError ? (
            <Image
              src={vehicleLogo}
              alt={vehicle?.make || "Vehicle"}
              width={40}
              height={40}
              className="object-contain w-full h-full"
              onError={() => setLogoError(true)}
              unoptimized
            />
          ) : (
            <Car className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Vehicle</h2>
          {vehicle?.make && vehicle?.model && (
            <p className="text-[11px] text-gray-400">
              {vehicle.make} {vehicle.model}
            </p>
          )}
        </div>
      </div>

      {/* Grid of attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {vehicleFields.map((f) => (
          <div
            key={f!.label}
            className="bg-gray-50 rounded-lg border border-gray-100 px-3.5 py-3"
          >
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              {f!.icon}
              <span className="text-[10px] uppercase tracking-wider">
                {f!.label}
              </span>
            </div>
            <p
              className={`text-sm font-semibold ${
                (f as { highlight?: boolean })?.highlight
                  ? "text-emerald-600"
                  : "text-gray-900"
              } ${(f as { mono?: boolean })?.mono ? "font-mono tracking-wider" : ""}`}
            >
              {f!.value || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
