"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { RbacStat } from "./types";

interface RbacStatsProps {
  stats: RbacStat[];
}

export function RbacStats({ stats }: RbacStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className={`rounded-lg border p-5 shadow-xs transition-all ${
              s.accent
                ? "border-amber-200/60 bg-amber-50/40"
                : "border-gray-200 bg-white hover:border-[#19CA32]/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {s.label}
              </p>
              <div
                className={`grid h-8 w-8 place-items-center rounded-md shadow-xs ${
                  s.accent
                    ? "bg-[#19CA32] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon size={16} />
              </div>
            </div>
            <div className="mt-3 flex items-end gap-2.5">
              <span className="text-2xl font-bold text-gray-900">
                {s.value}
              </span>
              <span
                className={`mb-0.5 flex items-center gap-0.5 text-xs font-semibold ${
                  s.up ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {s.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {s.change}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">{s.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
