"use client";

import React from "react";
import { ShieldCheck, Info } from "lucide-react";

export function BookingInspectionGuideCard() {
  return (
    <div className="bg-linear-to-br from-emerald-50/60 to-white border border-emerald-100 rounded-lg p-5 shadow-xs flex-1">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-[#19CA32]" />
        <h3 className="text-xs font-bold text-gray-900">
          Inspection Day Guide
        </h3>
      </div>
      <ul className="space-y-2 text-xs text-gray-600">
        <li className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Please arrive <strong>10–15 minutes</strong> before your scheduled slot.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Payment is made <strong>in-person</strong> directly at the testing
            station.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Ensure your vehicle boot and bonnet are accessible and fuel/fluids
            are topped up.
          </span>
        </li>
      </ul>
    </div>
  );
}
