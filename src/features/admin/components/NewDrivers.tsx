"use client";
import React from "react";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import Link from "next/link";
import { useGetAllDriversQuery } from "@/features/admin";

const formatDate = (value: string) => {
  if (!value || value === "N/A") return "N/A";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

export default function NewDrivers() {
  // Fetch only 5 drivers from API
  const { data: apiData, isLoading: loading } = useGetAllDriversQuery({
    page: 1,
    limit: 5,
  });

  // Map API data to table format
  const data = React.useMemo(() => {
    const drivers = apiData?.data?.drivers || [];
    return drivers.map((driver: any) => ({
      id: driver.id,
      name: driver.name || "",
      email: driver.email || "",
      phone: driver.phone_number || "N/A",
      status: driver.status,
      createdAt: driver.created_at || "",
      emailVerifiedAt: driver.email_verified_at || "N/A",
    }));
  }, [apiData]);

  const columns = [
    { key: "name", label: "Drivers Name", width: "25%" },
    { key: "phone", label: "Phone", width: "20%" },
    { key: "email", label: "Email", width: "25%" },
    {
      key: "status",
      label: "Status",
      width: "15%",
      render: (value: any, row: any) => {
        let label = value || "Pending";
        let colorClass =
          "bg-yellow-100 text-yellow-800 border border-yellow-300";

        if (value === "Active" || value === "Approved") {
          label = "Active";
          colorClass = "bg-green-100 text-green-800 border border-green-300";
        } else if (value === "Banned") {
          label = "Banned";
          colorClass = "bg-red-100 text-red-800 border border-red-300";
        } else if (row?.email_verified_at) {
          label = "Verified";
          colorClass = "bg-blue-100 text-blue-800 border border-blue-300";
        }

        return (
          <span
            className={`inline-flex capitalize items-center justify-center w-24 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created At",
      width: "15%",
      render: formatDate,
    },
    {
      key: "emailVerifiedAt",
      label: "Verified At",
      width: "15%",
      render: formatDate,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold ">New Drivers</h1>
        <div>
          <Link
            href="/admin/manage-drivers"
            className="underline hover:text-green-600 cursor-pointer transition-all duration-300"
          >
            View All Drivers
          </Link>
        </div>
      </div>

      <div className="mt-4 w-full">
        <ReusableTable
          data={data}
          columns={columns}
          className="w-full"
          isLoading={loading}
          skeletonRows={5}
        />
      </div>
    </div>
  );
}
