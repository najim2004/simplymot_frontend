"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetUsersQuery } from "@/features/admin";
import {
  setCurrentPage as setUsersCurrentPage,
  setItemsPerPage as setUsersItemsPerPage,
  setPagination as setUsersPagination,
  setStatistics as setUsersStatistics,
} from "@/features/admin";
import ReusableTable from "@/components/reusable/Dashboard/Table/ReuseableTable";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import { Plus, Search, X } from "lucide-react";
import {
  UserStatsCards as StatsCards,
  CreateNewUser,
  UserTableAction as TableAction,
  setSearchFilter,
  setTypeFilter,
  setStatusFilter,
} from "@/features/admin";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getKind(row: any): string {
  return String(row?.kind || row?.type || "").toUpperCase();
}

function getStatus(row: any): string {
  return String(row?.status || "").toUpperCase();
}

function kindLabel(kind: string) {
  if (kind === "DRIVER" || kind === "USER") return "Customer/Driver";
  if (kind === "GARAGE") return "Garage";
  if (kind === "ADMIN") return "Admin";
  return kind || "Unknown";
}

function kindBadgeClass(kind: string) {
  if (kind === "DRIVER" || kind === "USER")
    return "bg-blue-100 text-blue-800 border-blue-200";
  if (kind === "GARAGE") return "bg-green-100 text-green-800 border-green-200";
  if (kind === "ADMIN")
    return "bg-purple-100 text-purple-800 border-purple-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

function statusBadgeClass(status: string) {
  if (status === "ACTIVE" || status === "APPROVED")
    return "bg-green-100 text-green-800 border-green-200";
  if (status === "PENDING")
    return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "BANNED") return "bg-red-100 text-red-800 border-red-200";
  if (status === "INACTIVE")
    return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
}

function statusLabel(status: string) {
  if (status === "ACTIVE" || status === "APPROVED") return "Active";
  if (status === "PENDING") return "Pending";
  if (status === "BANNED") return "Banned";
  if (status === "INACTIVE") return "Inactive";
  return status || "Unknown";
}

export default function UserManagement() {
  const dispatch = useAppDispatch();
  const { filters, pagination } = useAppSelector(
    (state) => state.usersManagement,
  );

  const [createOpen, setCreateOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState(filters.search || "");
  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    dispatch(setSearchFilter(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetUsersQuery(
    {
      status: filters.status,
      q: filters.search,
      type: filters.type,
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (usersData) {
      dispatch(
        setUsersPagination({
          totalItems: usersData.pagination.total,
          totalPages: usersData.pagination.totalPages,
        }),
      );

      if (usersData.statistics) {
        dispatch(setUsersStatistics(usersData.statistics));
      }
    }
  }, [usersData, dispatch]);

  const handlePageChange = (page: number) => {
    dispatch(setUsersCurrentPage(page));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    dispatch(setUsersItemsPerPage(itemsPerPage));
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (value: string, row: any) => (
        <div className="flex items-center">
          {row.avatar_url ? (
            <div className="relative mr-3 h-10 w-10">
              <Image
                width={40}
                height={40}
                src={row.avatar_url}
                alt={value || "User"}
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallbackDiv =
                    e.currentTarget.parentElement?.querySelector(
                      ".avatar-fallback",
                    ) as HTMLElement;
                  if (fallbackDiv) fallbackDiv.style.display = "flex";
                }}
              />
              <div className="avatar-fallback absolute top-0 left-0 hidden h-10 w-10 items-center justify-center rounded-full bg-[#DDF7E0]">
                <span className="text-sm font-bold text-[#19CA32]">
                  {value?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
          ) : (
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#DDF7E0]">
              <span className="text-sm font-bold text-[#19CA32]">
                {value?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div className="text-sm font-medium text-gray-900">
            {value || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value: string) => (
        <div className="text-sm lowercase text-gray-900">{value || "—"}</div>
      ),
    },
    {
      key: "phone_number",
      label: "Phone Number",
      render: (value: string) => (
        <div className="text-sm whitespace-nowrap text-gray-900">
          {value || "—"}
        </div>
      ),
    },
    {
      key: "kind",
      label: "Kind / Type",
      render: (_: string, row: any) => {
        const kind = getKind(row);
        return (
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${kindBadgeClass(kind)}`}
          >
            {kindLabel(kind)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (_: string, row: any) => {
        const status = getStatus(row);
        return (
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(status)}`}
          >
            {statusLabel(status)}
          </span>
        );
      },
    },
    {
      key: "last_active_at",
      label: "Last Active At",
      render: (_: string, row: any) => (
        <div className="text-sm whitespace-nowrap text-gray-900">
          {formatDate(
            row.last_active_at || row.last_login_at || row.updated_at,
          )}
        </div>
      ),
    },
    {
      key: "email_verified_at",
      label: "Verified At",
      render: (value: string) => (
        <div className="text-sm whitespace-nowrap text-gray-900">
          {value ? formatDate(value) : "Not verified"}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Created At",
      render: (value: string) => (
        <div className="text-sm whitespace-nowrap text-gray-900">
          {formatDate(value)}
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "Actions",
      variant: "primary" as const,
      render: (row: any) => <TableAction row={row} />,
    },
  ];

  return (
    <div>
      {/* Header — matches garage / booking / RBAC */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="whitespace-nowrap text-2xl font-bold text-gray-900">
          User Management
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-44">
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => {
                dispatch(setTypeFilter(value === "all" ? "" : value));
                dispatch(setUsersCurrentPage(1));
              }}
            >
              <SelectTrigger className="h-11 w-full cursor-pointer border-gray-300 bg-white text-xs sm:text-sm">
                <SelectValue placeholder="All Kinds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Kinds</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="GARAGE">Garage</SelectItem>
                <SelectItem value="DRIVER">Customer/Driver</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => {
                dispatch(setStatusFilter(value));
                dispatch(setUsersCurrentPage(1));
              }}
            >
              <SelectTrigger className="h-11 w-full cursor-pointer border-gray-300 bg-white text-xs sm:text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                dispatch(setUsersCurrentPage(1));
              }}
              className="block h-11 w-full rounded-lg border border-gray-300 bg-white py-0 pr-9 pl-9 text-xs leading-5 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none sm:w-64 sm:text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  dispatch(setUsersCurrentPage(1));
                }}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="h-11 cursor-pointer bg-[#19CA32] px-4 text-sm font-semibold text-white hover:bg-green-600"
          >
            <Plus className="mr-1 h-4 w-4" /> Create User
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <StatsCards statistics={usersData?.statistics} isLoading={isLoading} />
      </div>

      <div>
        {error ? (
          <div className="flex min-h-100 items-center justify-center">
            <div className="text-center">
              <p className="font-medium text-red-600">Error loading users</p>
              <Button
                onClick={() => refetch()}
                className="mt-4 cursor-pointer"
              >
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ReusableTable
              data={usersData?.data || []}
              columns={columns}
              actions={actions}
              className="rounded-t-lg border border-gray-300"
              isLoading={isLoading}
              skeletonRows={pagination.itemsPerPage}
            />

            {!isLoading && usersData?.pagination && (
              <ReusablePagination
                key={`pagination-${usersData.pagination.totalPages}`}
                currentPage={usersData.pagination.page}
                totalPages={usersData.pagination.totalPages}
                itemsPerPage={pagination.itemsPerPage}
                totalItems={usersData.pagination.total}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        )}
      </div>

      <CreateNewUser
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
