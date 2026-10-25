"use client";

import React from "react";
import Image from "next/image";
import { Building2, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import type { BookingGarage } from "@/features/booking/types";
import { getBookingInitials } from "@/features/booking/utils";

export interface BookingGarageCardProps {
  garage?: BookingGarage | null;
}

export function BookingGarageCard({ garage }: BookingGarageCardProps) {
  const garageName =
    garage?.garage_name || garage?.name || "Auto Service Garage";
  const garageEmail =
    garage?.contact_email || garage?.email || "N/A";
  const garagePhone = garage?.phone_number || "N/A";
  const garageImage = garage?.garage_image || garage?.image || null;
  const garageAddress = [garage?.address, garage?.city, garage?.post_code]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3.5">
        <Building2 className="w-4 h-4 text-[#19CA32]" />
        <h2 className="text-sm font-bold text-gray-900">Testing Station</h2>
      </div>

      {/* Garage Large Image Banner */}
      <div className="w-full h-44 sm:h-48 relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mb-3.5 shadow-2xs">
        {garageImage ? (
          <Image
            src={garageImage}
            alt={garageName}
            fill
            sizes="(max-width: 1024px) 100vw, 400px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-emerald-50 to-emerald-100/60 text-[#19CA32] flex flex-col items-center justify-center gap-2">
            <Building2 className="w-10 h-10 text-[#19CA32]/60" />
            <span className="font-bold text-xl tracking-tight">
              {getBookingInitials(garageName, "G")}
            </span>
          </div>
        )}
      </div>

      {/* Garage Name & VTS */}
      <div className="mb-3.5 pb-3 border-b border-gray-100">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
          {garageName}
        </h3>
        {garage?.vts_number && (
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            VTS #{garage.vts_number}
          </p>
        )}
      </div>

      {/* Contact Details */}
      <div className="space-y-0">
        {/* Address */}
        {garageAddress && (
          <div className="flex items-start gap-3 py-2 border-b border-gray-50">
            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                Address
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {garageAddress}
              </p>
            </div>
          </div>
        )}

        {/* Phone */}
        <div className="flex items-start gap-3 py-2 border-b border-gray-50">
          <Phone className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Phone
            </p>
            {garagePhone !== "N/A" ? (
              <a
                href={`tel:${garagePhone}`}
                className="text-xs font-semibold text-gray-800 hover:text-[#19CA32] transition-colors"
              >
                {garagePhone}
              </a>
            ) : (
              <p className="text-xs text-gray-400">N/A</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3 py-2">
          <Mail className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              Email
            </p>
            {garageEmail !== "N/A" ? (
              <a
                href={`mailto:${garageEmail}`}
                className="text-xs font-medium text-gray-800 hover:text-[#19CA32] transition-colors break-all"
              >
                {garageEmail}
              </a>
            ) : (
              <p className="text-xs text-gray-400">N/A</p>
            )}
          </div>
        </div>
      </div>

      {/* Map Preview directly inside the garage info section */}
      {garageAddress && (
        <div className="mt-4 pt-3.5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-[#19CA32]" />
              <span>Location Map</span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                garageAddress,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#19CA32] hover:underline cursor-pointer"
            >
              <span>Open in Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-gray-200 relative bg-gray-100 shadow-2xs">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                garageAddress,
              )}&output=embed&z=15`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Garage Location"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
