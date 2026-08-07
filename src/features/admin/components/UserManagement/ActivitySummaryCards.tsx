"use client";

import React from "react";
import { Clock, BarChart3, TrendingUp, Wifi, WifiOff } from "lucide-react";

interface ActivitySummaryCardsProps {
  summary: {
    total_time_formatted: string;
    total_sessions: number;
    avg_session_formatted: string;
    currently_online: boolean;
    most_active_hour_label?: string | null;
    most_active_day?: string | null;
    longest_session_formatted: string;
  };
}

export const ActivitySummaryCards: React.FC<ActivitySummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      label: "Total Time",
      value: summary.total_time_formatted,
      icon: Clock,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Sessions",
      value: summary.total_sessions,
      icon: BarChart3,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Avg Session",
      value: summary.avg_session_formatted,
      icon: TrendingUp,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Status",
      value: summary.currently_online ? "Online" : "Offline",
      valueColor: summary.currently_online ? "text-green-600" : "text-gray-700",
      icon: summary.currently_online ? Wifi : WifiOff,
      iconBg: summary.currently_online ? "bg-green-100" : "bg-gray-100",
      iconColor: summary.currently_online ? "text-green-600" : "text-gray-500",
    },
  ];

  const highlights = [
    { label: "Most Active Hour", value: summary.most_active_hour_label ?? "N/A" },
    { label: "Most Active Day", value: summary.most_active_day ?? "N/A" },
    { label: "Longest Session", value: summary.longest_session_formatted },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.valueColor || "text-gray-900"}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 ${card.iconBg} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {highlights.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-sm sm:text-base font-semibold text-gray-900 mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitySummaryCards;
