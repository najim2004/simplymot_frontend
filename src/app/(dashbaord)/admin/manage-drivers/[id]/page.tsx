"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Car,
  FileText,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  Wrench,
  Clock,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetADriverDetailsQuery,
  useToggleBanDriverMutation,
  type DriverVehicle,
  type DriverBooking,
  type MotHistoryItem,
} from "@/features/admin";

function getInitials(name?: string | null, fallback = "D"): string {
  if (!name || name === "N/A" || name === "-") return fallback;
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  if (!clean || clean.toUpperCase() === "NA") return fallback;
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function formatDate(dateStr?: string | Date | null, withTime = false): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return format(d, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
  } catch {
    return "-";
  }
}

function formatPrice(
  amount?: number | string | null,
  currency = "GBP",
): string {
  if (amount === undefined || amount === null || amount === "") return "£0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "£0.00";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(num);
}

export default function DriverDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const driverId = params?.id as string;

  const [activeTab, setActiveTab] = useState("information");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");

  const {
    data: driverRes,
    isLoading,
    isError,
    refetch,
  } = useGetADriverDetailsQuery(driverId, {
    skip: !driverId,
  });

  const [toggleBanDriver, { isLoading: isTogglingBan }] =
    useToggleBanDriverMutation();

  const driver = driverRes?.data;
  const vehicles: DriverVehicle[] = driver?.vehicles || [];
  const bookings: DriverBooking[] = driver?.bookings || [];

  // Currently selected vehicle for MOT reports tab
  const currentVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0] || null;

  const isBanned =
    driver?.status?.toUpperCase() === "BANNED" || Boolean(driver?.banned_at);

  const handleToggleBan = async () => {
    if (!driver) return;
    try {
      const res = await toggleBanDriver(driver.id).unwrap();
      const updatedStatus = res?.data?.status?.toUpperCase();

      if (updatedStatus === "BANNED" || (!updatedStatus && !isBanned)) {
        toast.warning(res.message || `${driver.name} has been banned`);
      } else {
        toast.success(res.message || `${driver.name} has been unbanned`);
      }
      refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update driver status",
      );
    }
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !bookingSearch.trim() ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.garage?.garage_name
        ?.toLowerCase()
        .includes(bookingSearch.toLowerCase()) ||
      b.vehicle?.registration_number
        ?.toLowerCase()
        .includes(bookingSearch.toLowerCase());

    const matchesStatus =
      !bookingStatusFilter ||
      bookingStatusFilter === "all" ||
      b.status.toUpperCase() === bookingStatusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium text-gray-500">
          Loading driver details...
        </p>
      </div>
    );
  }

  if (isError || !driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Driver not found
        </h2>
        <p className="text-sm text-gray-500 mb-4 max-w-sm">
          The requested driver could not be found or you do not have permission
          to view it.
        </p>
        <Button
          onClick={() => router.push("/admin/manage-drivers")}
          variant="outline"
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Drivers
        </Button>
      </div>
    );
  }

  const driverAddress =
    [
      driver.address,
      driver.city,
      driver.state,
      driver.country,
      driver.post_code,
    ]
      .filter(Boolean)
      .join(", ") || "No address provided";

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/admin/manage-drivers")}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to all drivers
        </button>

        {/* Header Profile Card */}
        <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: Driver Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 rounded-full border-2 border-white shadow-sm shrink-0">
                <AvatarImage
                  src={driver.avatar || undefined}
                  alt={driver.name || "Driver"}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-full bg-emerald-100 text-emerald-700 font-bold text-xl">
                  {getInitials(driver.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {driver.name || "Unnamed Driver"}
                  </h1>

                  {/* Status Badge */}
                  {isBanned ? (
                    <Badge className="bg-red-100 text-red-800 border-red-200 gap-1.5 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                      Banned
                    </Badge>
                  ) : driver.status?.toUpperCase() === "ACTIVE" ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1.5 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1.5 font-medium capitalize">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      {driver.status?.toLowerCase() || "Pending"}
                    </Badge>
                  )}

                  {/* Email verification status */}
                  {driver.email_verified_at ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Email Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <XCircle className="h-3 w-3" />
                      Unverified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>{driver.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>{driver.phone_number || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>Joined {formatDate(driver.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions & Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 border-r border-gray-200 pr-4 mr-1">
                <div className="text-center px-2">
                  <p className="text-xs text-gray-500 font-medium">Vehicles</p>
                  <p className="text-lg font-bold text-gray-900">
                    {vehicles.length}
                  </p>
                </div>
                <div className="text-center px-2">
                  <p className="text-xs text-gray-500 font-medium">Bookings</p>
                  <p className="text-lg font-bold text-gray-900">
                    {bookings.length}
                  </p>
                </div>
              </div>

              <Button
                variant={isBanned ? "default" : "destructive"}
                onClick={handleToggleBan}
                disabled={isTogglingBan}
                className="cursor-pointer gap-1.5 text-xs font-semibold"
              >
                {isTogglingBan ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isBanned ? (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Unban Driver
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    Ban Driver
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="bg-gray-100 p-1 rounded-xl h-auto flex flex-wrap gap-1">
          <TabsTrigger
            value="information"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 cursor-pointer text-sm font-medium py-2 px-4 rounded-lg gap-2"
          >
            <UserIcon className="h-4 w-4" />
            <span>Driver Information</span>
          </TabsTrigger>

          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 cursor-pointer text-sm font-medium py-2 px-4 rounded-lg gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>Bookings ({bookings.length})</span>
          </TabsTrigger>

          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 cursor-pointer text-sm font-medium py-2 px-4 rounded-lg gap-2"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Vehicle Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: DRIVER INFORMATION + ADDED VEHICLES ─── */}
        <TabsContent value="information" className="space-y-6">
          {/* Driver Basic Information Card */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <UserIcon className="h-5 w-5 text-gray-700" />
              <h2 className="text-base font-bold text-gray-900">
                Driver Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Full Name</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {driver.name || "N/A"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Email Address</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {driver.email || "N/A"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {driver.phone_number || "N/A"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Full Address</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {driverAddress}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">City / State</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {[driver.city, driver.state].filter(Boolean).join(", ") || "-"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Postcode / Country</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {[driver.post_code, driver.country].filter(Boolean).join(", ") || "-"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Account Status</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">
                  {driver.status?.toLowerCase() || "Pending"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Email Verified At</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDate(driver.email_verified_at, true)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Account Created</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {formatDate(driver.created_at, true)}
                </p>
              </div>
            </div>
          </div>

          {/* Added Vehicles Section & Table */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Added Vehicles ({vehicles.length})
                </h2>
              </div>
              {vehicles.length > 0 && (
                <span className="text-xs text-gray-500">
                  Select a vehicle in the Vehicle Reports tab to inspect its MOT test history
                </span>
              )}
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  No vehicles added yet
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  This driver has not registered any vehicles on the platform.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Registration
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Make & Model
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Color / Fuel
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Year
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        MOT Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        MOT Expiry
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Tax Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Date Added
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {vehicles.map((v) => (
                      <TableRow key={v.id} className="hover:bg-gray-50/70">
                        <TableCell className="font-mono font-bold text-gray-900">
                          <span className="inline-block px-2.5 py-1 bg-amber-400 text-black rounded font-mono font-black text-xs tracking-wider border border-amber-500 shadow-xs">
                            {v.registration_number}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 text-sm">
                          {v.make || "-"} {v.model || ""}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {[v.color, v.fuel_type].filter(Boolean).join(" • ") || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {v.year_of_manufacture || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs capitalize font-medium ${
                              v.mot_status?.toUpperCase() === "VALID"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}
                          >
                            {v.mot_status?.toLowerCase() || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(v.mot_expiry_date)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {v.tax_status ? (
                            <span className="capitalize">{v.tax_status.toLowerCase()}</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(v.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── TAB 2: BOOKINGS TABLE ─── */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Bookings History
                </h2>
                <p className="text-xs text-gray-500">
                  All bookings submitted by {driver.name}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-60">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search garage or reg..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="py-1.5 px-2.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="BOOKED">Booked</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                </select>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  No bookings found
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {bookingSearch || bookingStatusFilter
                    ? "Try adjusting your search or filter"
                    : "This driver has not placed any bookings yet"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Booking ID
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Garage
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Garage Contact
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Vehicle
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Order Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Total Amount
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-600">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {filteredBookings.map((b) => (
                      <TableRow key={b.id} className="hover:bg-gray-50/70">
                        <TableCell className="font-mono text-xs font-semibold text-gray-900">
                          #{b.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 rounded-full border border-gray-200 shrink-0">
                              <AvatarImage
                                src={b.garage?.garage_image || undefined}
                                alt={b.garage?.garage_name || "Garage"}
                              />
                              <AvatarFallback className="text-xs font-bold bg-gray-100 text-gray-700">
                                {getInitials(b.garage?.garage_name, "G")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {b.garage?.garage_name || "Garage"}
                              </p>
                              {b.garage?.city && (
                                <p className="text-xs text-gray-500">
                                  {b.garage.city}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          <div>{b.garage?.contact_email || "-"}</div>
                          <div className="text-gray-400">
                            {b.garage?.phone_number || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {b.vehicle ? (
                            <div>
                              <span className="inline-block px-1.5 py-0.5 bg-amber-400 text-black rounded font-mono font-bold text-[11px] border border-amber-500">
                                {b.vehicle.registration_number}
                              </span>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {b.vehicle.make} {b.vehicle.model}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(b.order_date, true)}
                        </TableCell>
                        <TableCell className="text-sm font-bold text-gray-900">
                          {formatPrice(b.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs capitalize font-medium ${
                              b.status?.toUpperCase() === "BOOKED"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : b.status?.toUpperCase() === "COMPLETED"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : b.status?.toUpperCase() === "CANCELLED"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-purple-100 text-purple-800 border-purple-200"
                            }`}
                          >
                            {b.status?.toLowerCase() || "Booked"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── TAB 3: VEHICLE REPORTS (MOT HISTORY & DEFECTS) ─── */}
        <TabsContent value="reports" className="space-y-6">
          {vehicles.length === 0 ? (
            <div className="p-12 rounded-xl border border-gray-200 bg-white shadow-sm text-center">
              <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">
                No Vehicles Available
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                This driver does not have any registered vehicles to display MOT
                test history or reports.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vehicle Switcher Bar */}
              <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                  Select Vehicle to View MOT History
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {vehicles.map((v) => {
                    const isSelected =
                      (currentVehicle?.id || vehicles[0].id) === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                        }`}
                      >
                        <span className="px-2 py-0.5 bg-amber-400 text-black rounded font-mono font-black text-[11px] border border-amber-500">
                          {v.registration_number}
                        </span>
                        <span className="font-semibold">
                          {v.make} {v.model}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5"
                        >
                          {v.mot_history?.length || 0} tests
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Vehicle Overview Card */}
              {currentVehicle && (
                <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 bg-amber-400 text-black rounded-lg font-mono font-black text-sm tracking-wider border-2 border-amber-500 shadow-xs">
                        {currentVehicle.registration_number}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {currentVehicle.make} {currentVehicle.model}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {[
                            currentVehicle.color,
                            currentVehicle.fuel_type,
                            currentVehicle.year_of_manufacture
                              ? `Year: ${currentVehicle.year_of_manufacture}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">MOT Status</p>
                        <Badge
                          className={`text-xs capitalize font-medium mt-0.5 ${
                            currentVehicle.mot_status?.toUpperCase() === "VALID"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}
                        >
                          {currentVehicle.mot_status?.toLowerCase() || "Unknown"}
                        </Badge>
                      </div>
                      {currentVehicle.mot_expiry_date && (
                        <div className="text-right border-l border-gray-200 pl-3">
                          <p className="text-xs text-gray-500">Expiry Date</p>
                          <p className="text-xs font-semibold text-gray-900 mt-0.5">
                            {formatDate(currentVehicle.mot_expiry_date)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MOT History List */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-emerald-600" />
                      MOT Test History & Defect Reports
                    </h4>

                    {!currentVehicle.mot_history ||
                    currentVehicle.mot_history.length === 0 ? (
                      <div className="text-center py-8 rounded-lg border border-dashed border-gray-200">
                        <Wrench className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">
                          No MOT test records found
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          No official MOT history records have been synced for this
                          vehicle yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentVehicle.mot_history.map((test, index) => {
                          const isPassed =
                            test.status?.toUpperCase() === "PASSED" ||
                            test.status?.toUpperCase() === "PASS";
                          const defects = test.defects || [];

                          return (
                            <div
                              key={test.id || index}
                              className="rounded-lg border border-gray-200 overflow-hidden"
                            >
                              {/* Test Header */}
                              <div className="p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                  <Badge
                                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 ${
                                      isPassed
                                        ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                        : "bg-red-600 text-white hover:bg-red-600"
                                    }`}
                                  >
                                    {isPassed ? "PASSED" : "FAILED"}
                                  </Badge>

                                  <div>
                                    <p className="text-sm font-bold text-gray-900">
                                      Test Date: {formatDate(test.test_date)}
                                    </p>
                                    {test.test_number && (
                                      <p className="text-xs text-gray-500 font-mono">
                                        Test #{test.test_number}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  {test.odometer_value !== null &&
                                    test.odometer_value !== undefined && (
                                      <div>
                                        <span className="text-gray-400">
                                          Odometer:
                                        </span>{" "}
                                        <span className="font-semibold text-gray-900">
                                          {Number(
                                            test.odometer_value,
                                          ).toLocaleString()}{" "}
                                          {test.odometer_unit || "mi"}
                                        </span>
                                      </div>
                                    )}
                                  {test.expiry_date && (
                                    <div>
                                      <span className="text-gray-400">
                                        Expires:
                                      </span>{" "}
                                      <span className="font-semibold text-gray-900">
                                        {formatDate(test.expiry_date)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Defects and Advisories */}
                              <div className="p-4 bg-white">
                                {defects.length === 0 ? (
                                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/60 p-2.5 rounded border border-emerald-100">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>
                                      No defects or advisories recorded for this test.
                                    </span>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Noted Defects & Advisories ({defects.length})
                                    </p>
                                    <div className="space-y-1.5">
                                      {defects.map((defect, dIdx) => {
                                        const isDangerous =
                                          defect.dangerous ||
                                          defect.type?.toUpperCase() ===
                                            "DANGEROUS";
                                        const isMajor =
                                          defect.type?.toUpperCase() === "MAJOR";

                                        return (
                                          <div
                                            key={defect.id || dIdx}
                                            className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                                              isDangerous
                                                ? "bg-red-50/80 border-red-200 text-red-900"
                                                : isMajor
                                                  ? "bg-amber-50/80 border-amber-200 text-amber-900"
                                                  : "bg-blue-50/60 border-blue-200 text-blue-900"
                                            }`}
                                          >
                                            <span
                                              className={`shrink-0 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                                                isDangerous
                                                  ? "bg-red-600 text-white"
                                                  : isMajor
                                                    ? "bg-amber-600 text-white"
                                                    : "bg-blue-600 text-white"
                                              }`}
                                            >
                                              {defect.type || "Advisory"}
                                            </span>
                                            <p className="flex-1 font-medium leading-relaxed">
                                              {defect.text}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

