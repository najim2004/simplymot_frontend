"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  Loader2,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useGetUserActivityQuery } from "@/features/admin";
import { LineChart } from "@/components/Chart/LineChart";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { PAGINATION_CONFIG } from "@/config/pagination.config";

type ActivityPeriod = "day" | "week" | "month" | "year";

const PERIOD_OPTIONS: { value: ActivityPeriod; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

interface UserPlatformActivityProps {
  userId: string;
}

const formatDateTime = (value: string | null) => {
  if (!value) return "Active now";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (seconds: number) => {
  if (seconds <= 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default function UserPlatformActivity({
  userId,
}: UserPlatformActivityProps) {
  const [period, setPeriod] = useState<ActivityPeriod>("week");
  const [currentPage, setCurrentPage] = useState<number>(
    PAGINATION_CONFIG.DEFAULT_PAGE,
  );
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    PAGINATION_CONFIG.DEFAULT_LIMIT,
  );

  useEffect(() => {
    setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
  }, [period]);

  const { data: response, isLoading, isFetching } = useGetUserActivityQuery({
    userId,
    period,
    page: currentPage,
    limit: itemsPerPage,
  });

  const activity = response?.data;

  const chartLabels = useMemo(
    () =>
      (activity?.daily_breakdown ?? []).map((item) =>
        new Date(`${item.date}T12:00:00.000Z`).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
      ),
    [activity?.daily_breakdown],
  );

  const chartData = useMemo(
    () =>
      (activity?.daily_breakdown ?? []).map((item) =>
        Math.round(item.total_seconds / 60),
      ),
    [activity?.daily_breakdown],
  );

  const maxHourlySeconds = useMemo(() => {
    const values = activity?.hourly_distribution?.map((item) => item.seconds) ?? [];
    return Math.max(...values, 1);
  }, [activity?.hourly_distribution]);

  const sessions = activity?.sessions ?? [];
  const sessionsPagination = activity?.sessions_pagination;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Platform Activity
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Dashboard online time, sessions, and usage patterns
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                period === option.value
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Loading activity...</span>
        </div>
      ) : !activity ? (
        <div className="text-center py-12 text-gray-500">
          No activity data available for this user yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activity.summary.total_time_formatted}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activity.summary.total_sessions}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Avg Session</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activity.summary.avg_session_formatted}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      activity.summary.currently_online
                        ? "text-green-600"
                        : "text-gray-700"
                    }`}
                  >
                    {activity.summary.currently_online ? "Online" : "Offline"}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    activity.summary.currently_online
                      ? "bg-green-100"
                      : "bg-gray-100"
                  }`}
                >
                  {activity.summary.currently_online ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <p className="text-xs text-gray-500">Most Active Hour</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 mt-1">
                {activity.summary.most_active_hour_label ?? "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <p className="text-xs text-gray-500">Most Active Day</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 mt-1">
                {activity.summary.most_active_day ?? "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
              <p className="text-xs text-gray-500">Longest Session</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 mt-1">
                {activity.summary.longest_session_formatted}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">
                Daily Active Time
              </h4>
              {chartLabels.length > 0 ? (
                <LineChart
                  label="Minutes"
                  labels={chartLabels}
                  data={chartData}
                />
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">
                  No daily activity in this period.
                </p>
              )}
            </div>

            <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">
                Hourly Activity
              </h4>
              <div className="grid grid-cols-12 gap-1 items-end h-40">
                {activity.hourly_distribution.map((item) => {
                  const height = `${Math.max(
                    (item.seconds / maxHourlySeconds) * 100,
                    item.seconds > 0 ? 8 : 2,
                  )}%`;

                  return (
                    <div
                      key={item.hour}
                      className="flex flex-col items-center justify-end h-full"
                      title={`${item.label}: ${formatDuration(item.seconds)}`}
                    >
                      <div
                        className="w-full rounded-t bg-green-500/80 min-h-[2px]"
                        style={{ height }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-4 text-[10px] text-gray-400 mt-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                Session History
              </h4>
              {isFetching && !isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No sessions recorded in this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white">
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">Left</th>
                      <th className="px-4 py-3 font-medium">Duration</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-4 py-3 text-gray-900">
                          {formatDateTime(session.joined_at)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {session.is_active
                            ? "Still active"
                            : formatDateTime(session.left_at)}
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {formatDuration(session.duration_seconds)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              session.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {session.is_active ? "Active" : "Closed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sessionsPagination && sessionsPagination.total > 0 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <ReusablePagination
                  currentPage={sessionsPagination.page}
                  totalPages={sessionsPagination.totalPages}
                  itemsPerPage={sessionsPagination.limit}
                  totalItems={sessionsPagination.total}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(PAGINATION_CONFIG.DEFAULT_PAGE);
                  }}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
