"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetUserByIdQuery, CreateNewUser } from "@/features/admin";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Lock,
  MapPin,
  CreditCard,
  Crown,
  Warehouse,
  Car,
  Clock,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { UserPlatformActivity } from "@/features/admin";
import { Button } from "@/components/ui/button";

function UserDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.id as string;
  const [editOpen, setEditOpen] = useState(false);

  const { data: response, isLoading, error } = useGetUserByIdQuery(userId);
  const user = response?.data as any;
  const userKind = String(user?.kind || user?.type || "").toUpperCase();

  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setEditOpen(true);
    }
  }, [searchParams]);

  const handleCloseEdit = () => {
    setEditOpen(false);
    if (searchParams.get("edit") === "true") {
      router.replace(`/admin/users-management/${userId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600 font-medium">
          Loading user details...
        </span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 mb-4 font-semibold">
          Error loading user details
        </div>
        <button
          onClick={() => router.back()}
          className="text-green-600 hover:text-green-700 font-semibold px-4 py-2 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Group permissions by subject (with safety check)
  const groupedPermissions = (user.permissions || []).reduce(
    (acc: any, permission) => {
      const subject = permission.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(permission);
      return acc;
    },
    {},
  );

  // Color mapping for roles
  const roleColorMap: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    super_admin: {
      bg: "bg-violet-100",
      text: "text-violet-800",
      border: "border-violet-200",
    },
    support_admin: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
    },
    financial_admin: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    operations_admin: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    },
  };

  // Action color mapping
  const actionColorMap: Record<string, string> = {
    Read: "bg-blue-50 text-blue-700 border-blue-200",
    Create: "bg-green-50 text-green-700 border-green-200",
    Update: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Delete: "bg-red-50 text-red-700 border-red-200",
    Show: "bg-purple-50 text-purple-700 border-purple-200",
    Refund: "bg-orange-50 text-orange-700 border-orange-200",
    Cancel: "bg-gray-50 text-gray-700 border-gray-200",
    Assign: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Generate: "bg-pink-50 text-pink-700 border-pink-200",
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/admin/users-management")}
            className="shrink-0 cursor-pointer rounded-lg bg-gray-50 p-1.5 transition-colors hover:bg-gray-100 sm:p-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
              User Details
            </h1>
            <p className="mt-0.5 hidden text-xs text-gray-600 sm:mt-1 sm:block sm:text-sm">
              Complete information about this user
            </p>
          </div>
        </div>

        <Button
          onClick={() => setEditOpen(true)}
          className="h-10 shrink-0 cursor-pointer bg-[#19CA32] px-3 text-sm font-semibold text-white hover:bg-green-600 sm:px-4"
        >
          <Pencil className="mr-1.5 h-4 w-4" />
          Edit User
        </Button>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl  overflow-hidden">
        <div className="bg-linear-to-r from-green-500 to-emerald-600 h-28 sm:h-32"></div>
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="shrink-0 -mt-12 sm:-mt-16">
              {user.avatar_url || user.avatar ? (
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white rounded-full overflow-hidden bg-white">
                  <Image
                    width={200}
                    height={200}
                    src={user.avatar_url || user.avatar || ""}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Hide image and show fallback on error
                      e.currentTarget.style.display = "none";
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="h-full w-full rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span class="text-2xl sm:text-3xl font-bold text-white">
                                ${user.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                        </div>`;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center ring-4 ring-white">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 sm:mt-4 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate capitalize">
                      {user.name}
                    </h2>

                    {/* Super Admin Crown Badge */}
                    {user.roles?.some(
                      (role) => role.name === "super_admin",
                    ) && (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-linear-to-r from-yellow-500 to-amber-600 text-white text-xs font-semibold rounded-full ">
                        <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        <span className="">KING</span>
                      </span>
                    )}

                    {/* Garage Badge */}
                    {userKind === "GARAGE" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-emerald-500 to-green-600 px-2 py-1 text-xs font-semibold text-white sm:px-3">
                        <Warehouse className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                        <span>GARAGE</span>
                      </span>
                    )}

                    {/* Driver Badge */}
                    {(userKind === "DRIVER" || userKind === "USER") && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 px-2 py-1 text-xs font-semibold text-white sm:px-3">
                        <Car className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                        <span>CUSTOMER/DRIVER</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${
                      userKind === "DRIVER" || userKind === "USER"
                        ? "border-blue-200 bg-blue-100 text-blue-800"
                        : userKind === "GARAGE"
                          ? "border-green-200 bg-green-100 text-green-800"
                          : userKind === "ADMIN"
                            ? "border-purple-200 bg-purple-100 text-purple-800"
                            : "border-gray-200 bg-gray-100 text-gray-800"
                    }`}
                  >
                    {userKind === "DRIVER" || userKind === "USER"
                      ? "Customer/Driver"
                      : userKind
                        ? userKind.charAt(0) + userKind.slice(1).toLowerCase()
                        : "Unknown"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${
                      String(user.status).toUpperCase() === "ACTIVE" ||
                      String(user.status).toUpperCase() === "APPROVED"
                        ? "border-green-200 bg-green-100 text-green-800"
                        : String(user.status).toUpperCase() === "PENDING"
                          ? "border-yellow-200 bg-yellow-100 text-yellow-800"
                          : "border-red-200 bg-red-100 text-red-800"
                    }`}
                  >
                    {String(user.status).toUpperCase() === "ACTIVE" ||
                    String(user.status).toUpperCase() === "APPROVED" ? (
                      <>
                        <CheckCircle className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
                        Active
                      </>
                    ) : String(user.status).toUpperCase() === "PENDING" ? (
                      <>
                        <Clock className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
                        Pending
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-4 sm:w-4" />
                        Banned
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="text-gray-900 font-medium lowercase text-xs sm:text-sm truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="text-gray-900 font-medium text-xs sm:text-sm truncate">
                      {user.phone_number || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs">Created At</p>
                    <p className="text-gray-900 font-medium text-xs sm:text-sm truncate">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-xs">Verified At</p>
                    <p className="text-gray-900 font-medium text-xs sm:text-sm truncate">
                      {user.email_verified_at
                        ? new Date(user.email_verified_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "Not Verified"}
                    </p>
                  </div>
                </div>
                {user.billing_id && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs">Billing ID</p>
                      <p className="text-gray-900 font-medium text-xs truncate">
                        {user.billing_id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Only show for ADMIN users */}
      {userKind === "ADMIN" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl  p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">
                  Total Roles
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {user.role_count || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl  p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">
                  Total Permissions
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {user.permission_count || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl  p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">
                  Permission Subjects
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {Object.keys(groupedPermissions).length}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <UserPlatformActivity userId={userId} />

      {/* Roles Section - read-only; manage from RBAC */}
      {userKind === "ADMIN" && (
        <div className="rounded-xl bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
              <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                Assigned Roles
              </h3>
              <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 sm:ml-2">
                {(user.roles || []).length}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 cursor-pointer text-xs"
              onClick={() => router.push("/admin/rbac?tab=roles")}
            >
              Manage in RBAC
            </Button>
          </div>
          <p className="mb-4 text-xs text-gray-500">
            Roles are managed from the RBAC page. This section is read-only.
          </p>
          {(user.roles || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {(user.roles || []).map((role) => {
                const colors = roleColorMap[role.name] || {
                  bg: "bg-gray-100",
                  text: "text-gray-800",
                  border: "border-gray-200",
                };
                return (
                  <div
                    key={role.id}
                    className={`p-3 sm:p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`font-semibold text-sm sm:text-base ${colors.text} truncate`}
                        >
                          {role.title}
                        </h4>
                        <p
                          className={`text-xs ${colors.text} opacity-75 mt-1 truncate`}
                        >
                          {role.name}
                        </p>
                      </div>
                      <Shield
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text} shrink-0`}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 sm:mt-3">
                      Assigned:{" "}
                      {new Date(role.assigned_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No roles assigned</p>
            </div>
          )}
        </div>
      )}

      {/* Permission Summary - Only show for ADMIN users */}
      {userKind === "ADMIN" && user.permission_summary && (
        <div className="bg-white rounded-xl  p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Permission Summary
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(user.permission_summary).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 gap-2"
              >
                <span className="text-xs sm:text-sm text-gray-700 font-medium truncate flex-1">
                  {key
                    .replace(/_/g, " ")
                    .replace(/can /g, "")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
                {value ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Permissions - Only show for ADMIN users */}
      {userKind === "ADMIN" && (
        <div className="rounded-xl bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
              Detailed Permissions
            </h3>
            <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 sm:ml-2">
              {(user.permissions || []).length}
            </span>
          </div>
          {Object.keys(groupedPermissions).length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(groupedPermissions).map(
                ([subject, permissions]: [string, any]) => (
                  <div
                    key={subject}
                    className="rounded-lg border border-gray-200 p-3 sm:p-4"
                  >
                    <h4 className="mb-3 flex flex-wrap items-center gap-2 font-semibold text-gray-900">
                      <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800 sm:px-3 sm:text-sm">
                        {subject}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({permissions.length} permission
                        {permissions.length > 1 ? "s" : ""})
                      </span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {permissions.map((permission: any) => (
                        <span
                          key={permission.id}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium sm:px-3 sm:py-1.5 ${
                            actionColorMap[permission.action] ||
                            "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          {permission.action}
                        </span>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Lock className="mx-auto mb-2 h-10 w-10 opacity-30 sm:h-12 sm:w-12" />
              <p className="text-sm">No permissions assigned</p>
            </div>
          )}
        </div>
      )}

      <CreateNewUser
        open={editOpen}
        onClose={handleCloseEdit}
        editUserId={userId}
      />
    </div>
  );
}

export default function UserDetails() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
          <span className="ml-3 font-medium text-gray-600">
            Loading user details...
          </span>
        </div>
      }
    >
      <UserDetailsContent />
    </Suspense>
  );
}
