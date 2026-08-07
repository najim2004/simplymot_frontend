"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useGetNotificationsQuery } from "@/features/notifications";
import { Loader2 } from "lucide-react";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const ReportField = ({
  label,
  value,
  isExpired,
}: {
  label: string;
  value: string;
  isExpired?: boolean;
}) => (
  <div>
    <Label className="text-[#092C20] font-Inter text-md font-bold mb-2 block">
      {label}
    </Label>
    <Input
      readOnly
      value={value}
      className={`bg-white focus-visible:ring-0 focus-visible:ring-offset-0 border-[#14A228] border h-[42px] cursor-default font-semibold font-Inter text-base ${
        isExpired ? "text-red-500 font-bold" : "text-gray-[#092C20]"
      }`}
    />
  </div>
);

export default function Notifications() {
  const { data: response, isLoading } = useGetNotificationsQuery({ page: 1, limit: 20 });
  const rawNotifications = response?.data?.notifications || response?.data?.notificaitons || [];

  const motExpiryNotifications = (rawNotifications as any[]).filter(
    (notification) => notification?.notification_event?.type === "mot_expiry_reminder"
  );

  const mappedNotifications = motExpiryNotifications.map((notification) => {
    const vehicle = notification.data || {};
    const expiryDate = vehicle.mot_expiry_date || notification.created_at;
    const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

    return {
      id: notification.id,
      make: vehicle.make || "-",
      model: vehicle.model || "",
      registrationNumber: vehicle.registration_number || "-",
      color: vehicle.color || "-",
      fuelType: vehicle.fuel_type || "-",
      dateRegistered: vehicle.date_registered ? formatDate(vehicle.date_registered) : "-",
      motPassDate: vehicle.mot_pass_date ? formatDate(vehicle.mot_pass_date) : "-",
      motExpiredOn: expiryDate ? formatDate(expiryDate) : "-",
      expiryDate: expiryDate ? formatDate(expiryDate) : "-",
      isExpired,
    };
  });

  return (
    <div className="space-y-6 max-w-full font-Inter">
      <div className="bg-[#14A228] p-6 rounded-[24px]">
        <h1 className="text-white text-3xl font-bold font-[#14A228]">Notifications</h1>
        <p className="text-[#14A228] text-sm mt-1 text-white">
          MOT Expiry Reminders and Updates
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#14A228]" />
          <span className="ml-3 text-[#092C20] font-medium">Loading notifications...</span>
        </div>
      ) : mappedNotifications.length === 0 ? (
        <div className="bg-white border-2 border-[#14A228] rounded-[24px] p-8 text-center">
          <p className="text-[#092C20] text-lg font-semibold">No MOT reminders right now.</p>
          <p className="text-gray-500 text-sm mt-1">
            You will receive a notification here when your vehicle&apos;s MOT is near expiry.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {mappedNotifications.map((item) => (
            <div
              key={item.id}
              className="bg-white border-2 border-[#14A228] rounded-[24px] p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                <h2 className="text-[#092C20] text-xl font-bold font-[#14A228]">
                  MOT Expiry Reminder
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.isExpired
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {item.isExpired ? "Expired" : "Expiring Soon"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <ReportField label="Registration Number" value={item.registrationNumber} />
                <ReportField label="Make & Model" value={`${item.make} ${item.model}`.trim()} />
                <ReportField label="Colour" value={item.color} />
                <ReportField label="Fuel Type" value={item.fuelType} />
                <ReportField label="Date Registered" value={item.dateRegistered} />
                <ReportField
                  label={item.isExpired ? "MOT Expired On" : "MOT Expiry Date"}
                  value={item.expiryDate}
                  isExpired={item.isExpired}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
