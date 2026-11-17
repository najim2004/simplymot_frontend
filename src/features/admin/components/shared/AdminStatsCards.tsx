"use client";

import type { LucideIcon } from "lucide-react";

export interface AdminStatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
}

interface AdminStatsCardsProps {
  stats: AdminStatItem[];
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-100 bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className={`rounded-lg p-3 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
