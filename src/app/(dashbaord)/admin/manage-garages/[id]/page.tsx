"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  Wrench,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Search,
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
  useGetAGarageByIdQuery,
  useToggleGarageVisibilityMutation,
} from "@/features/admin";
import { useGetAllBookingsQuery } from "@/features/admin/api/admin-booking.api";

function getInitials(name?: string | null): string {
  if (!name) return "G";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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

export default function GarageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const garageId = params?.id as string;

  const [activeTab, setActiveTab] = useState("garage-info");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");

  const {
    data: garageRes,
    isLoading,
    isError,
    refetch,
  } = useGetAGarageByIdQuery(garageId, {
    skip: !garageId,
  });

  const [toggleVisibility, { isLoading: isToggling }] =
    useToggleGarageVisibilityMutation();

  const garage = garageRes?.data;
  const isVisible = garage?.is_visible !== false;

  // Bookings query filtered by garageId
  const { data: bookingsData, isLoading: isBookingsLoading } =
    useGetAllBookingsQuery(
      {
        id: garageId,
        search: bookingSearch.trim() || undefined,
        status: bookingStatusFilter || undefined,
        limit: 50,
      },
      { skip: !garageId || activeTab !== "bookings" },
    );

  const bookingsList = bookingsData?.data || [];

  const handleToggleVisibility = async () => {
    if (!garage) return;
    const target = !isVisible;
    try {
      await toggleVisibility({
        id: garage.id,
        is_visible: target,
      }).unwrap();
      toast.success(
        `Garage is now ${target ? "visible to drivers" : "hidden from search"}`,
      );
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update garage visibility");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-125">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-3" />
        <p className="text-gray-500 text-sm font-medium">
          Loading garage details...
        </p>
      </div>
    );
  }

  if (isError || !garage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-125 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Garage not found
        </h2>
        <p className="text-sm text-gray-500 mb-4 max-w-sm">
          The requested garage could not be found or you do not have permission
          to view it.
        </p>
        <Button
          onClick={() => router.push("/admin/manage-garages")}
          variant="outline"
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Garages
        </Button>
      </div>
    );
  }

  const owner = garage.owner;
  const services = garage.services || [];
  const schedule = garage.schedule;
  const latestSubscription = owner?.subscriptions?.[0];
  const activityLogs = garage.activity_logs || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/admin/manage-garages")}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to all garages
        </button>

        {/* Header Profile Card */}
        <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left: Garage Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 rounded-xl border border-gray-200 shrink-0">
                <AvatarImage
                  src={garage.garage_image || undefined}
                  alt={garage.garage_name || "Garage"}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-xl bg-gray-100 text-gray-700 font-bold text-xl">
                  {getInitials(garage.garage_name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {garage.garage_name || "Untitled Garage"}
                  </h1>
                  {isVisible ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1.5 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Visible
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1.5 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      Hidden
                    </Badge>
                  )}
                  {garage.vts_number && (
                    <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      VTS: {garage.vts_number}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      {garage.contact_email || garage.email || "No email"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>{garage.phone_number || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>Registered {formatDate(garage.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant={isVisible ? "outline" : "default"}
                onClick={handleToggleVisibility}
                disabled={isToggling}
                className="cursor-pointer gap-2"
              >
                {isVisible ? (
                  <>
                    <EyeOff className="h-4 w-4 text-amber-600" />
                    <span>Hide Garage</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Make Visible</span>
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
        className="space-y-6"
      >
        <TabsList className="bg-gray-100 p-1 rounded-xl h-auto flex flex-wrap gap-1">
          <TabsTrigger
            value="garage-info"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 cursor-pointer text-sm font-medium py-2 px-4 rounded-lg gap-2"
          >
            <Building2 className="h-4 w-4" />
            <span>Garage Info</span>
          </TabsTrigger>

          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 cursor-pointer text-sm font-medium py-2 px-4 rounded-lg gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>Bookings</span>
          </TabsTrigger>

          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 cursor-pointer text-sm font-medium py-2 px-4 rounded-lg gap-2"
          >
            <Clock className="h-4 w-4" />
            <span>Schedule</span>
          </TabsTrigger>

          <TabsTrigger
            value="subscription"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 cursor-pointer text-sm font-medium py-2 px-4 rounded-lg gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>

          <TabsTrigger
            value="activity-logs"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 cursor-pointer text-sm font-medium py-2 px-4 rounded-lg gap-2"
          >
            <Activity className="h-4 w-4" />
            <span>Activity Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: GARAGE INFO (Garage Info + Owner Info + Pricing) ─── */}
        <TabsContent value="garage-info" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Garage Details Card */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Building2 className="h-5 w-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Garage Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Garage Name
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5">
                    {garage.garage_name || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    VTS Number
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5 font-mono">
                    {garage.vts_number || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Contact Email
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5 truncate">
                    {garage.contact_email || garage.email || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Phone Number
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5">
                    {garage.phone_number || "-"}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-xs text-gray-500 font-medium">
                    Full Address
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5">
                    {[
                      garage.address,
                      garage.city,
                      garage.state,
                      garage.country,
                      garage.post_code,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Visibility Status
                  </div>
                  <div className="mt-1">
                    {isVisible ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Visible to Drivers
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                        Hidden from Search
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Created Date
                  </div>
                  <div className="font-semibold text-gray-900 mt-0.5">
                    {formatDate(garage.created_at, true)}
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Details Card */}
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <UserIcon className="h-5 w-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Owner Basic Information
                </h2>
              </div>

              {owner ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <Avatar className="h-12 w-12 rounded-full border border-white shrink-0">
                      <AvatarImage
                        src={owner.avatar || undefined}
                        alt={owner.name || "Owner"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-sm">
                        {getInitials(owner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 truncate">
                        {owner.name || "Owner"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {owner.email}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        owner.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }
                    >
                      {owner.status || "PENDING"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 font-medium">
                        Phone
                      </div>
                      <div className="font-semibold text-gray-900 mt-0.5">
                        {owner.phone_number || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 font-medium">
                        Verification Status
                      </div>
                      <div className="mt-1">
                        {owner.email_verified_at ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <ShieldAlert className="h-3.5 w-3.5" /> Unverified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500 font-medium">
                        Owner Address
                      </div>
                      <div className="font-medium text-gray-800 mt-0.5">
                        {[
                          owner.address,
                          owner.city,
                          owner.state,
                          owner.country,
                          owner.post_code,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 font-medium">
                        Member Since
                      </div>
                      <div className="font-semibold text-gray-900 mt-0.5">
                        {formatDate(owner.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">
                  No owner profile assigned to this garage.
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Services Section */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Services & Pricing
                </h2>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {services.length}{" "}
                {services.length === 1 ? "Service" : "Services"}
              </span>
            </div>

            {services.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                <Wrench className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-700">
                  No services configured
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  The garage has not published any service pricing yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Service Title
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Type
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Vehicle Class
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 text-right">
                        Price
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 text-right">
                        Added On
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {services.map((svc) => (
                      <TableRow key={svc.id}>
                        <TableCell className="font-semibold text-gray-900 text-sm">
                          {svc.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {svc.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {svc.vehicle_class || "All Classes"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-gray-900 text-sm">
                          {formatPrice(svc.price)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-500">
                          {formatDate(svc.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── TAB 2: BOOKINGS TAB ─── */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Garage Bookings
                </h2>
                <p className="text-xs text-gray-500">
                  All customer bookings placed with this garage
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-52"
                  />
                </div>
              </div>
            </div>

            {isBookingsLoading ? (
              <div className="py-12 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading bookings...
              </div>
            ) : bookingsList.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-700">No bookings found</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Bookings made for this garage will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Booking #
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Customer
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Vehicle Reg
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Order Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Total Amount
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 text-right">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {bookingsList.map((b: any) => (
                      <TableRow key={b.id} className="hover:bg-gray-50/50">
                        <TableCell className="font-mono text-xs font-semibold text-gray-900">
                          {b.id?.slice(-8).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-medium text-gray-900">
                            {b.customer?.name || "-"}
                          </div>
                          <div className="text-gray-500 text-[11px]">
                            {b.customer?.email ||
                              b.customer?.phone_number ||
                              ""}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold text-gray-800">
                          {b.vehicle?.registration_number || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {formatDate(b.order_date)}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-gray-900">
                          {formatPrice(b.total_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              b.status === "COMPLETED"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : b.status === "CANCELLED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                            }
                          >
                            {b.status}
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

        {/* ─── TAB 3: SCHEDULE TAB ─── */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Weekly Operating Schedule
                </h2>
                <p className="text-xs text-gray-500">
                  Opening hours, slot intervals, and break times
                </p>
              </div>
            </div>

            {!schedule || !schedule.schedule_intervals?.length ? (
              <div className="py-12 text-center text-sm text-gray-500">
                <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-700">
                  No schedule configured
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  The garage has not configured its weekly opening hours yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Day of Week
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Operating Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Working Hours
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Slot Duration
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Break Times
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {schedule.schedule_intervals.map((interval) => (
                      <TableRow key={interval.id}>
                        <TableCell className="font-bold text-gray-900 text-sm capitalize">
                          {interval.day_of_week.toLowerCase()}
                        </TableCell>
                        <TableCell>
                          {interval.is_closed ? (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 text-xs"
                            >
                              Closed
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 text-xs"
                            >
                              Open
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-gray-700">
                          {interval.is_closed
                            ? "-"
                            : `${interval.open_time ? format(new Date(interval.open_time), "HH:mm") : "08:00"} - ${interval.close_time ? format(new Date(interval.close_time), "HH:mm") : "18:00"}`}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {interval.slot_duration
                            ? `${interval.slot_duration} mins`
                            : "60 mins"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {interval.break_times &&
                          interval.break_times.length > 0
                            ? interval.break_times
                                .map(
                                  (b) =>
                                    `${format(new Date(b.start_time), "HH:mm")} - ${format(new Date(b.end_time), "HH:mm")}`,
                                )
                                .join(", ")
                            : "None"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Holidays / Closure Dates */}
          {schedule?.holidays && schedule.holidays.length > 0 && (
            <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                Upcoming Holidays & Special Closures
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {schedule.holidays.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50 text-xs"
                  >
                    <div className="font-semibold text-gray-900">
                      {formatDate(h.date)}
                    </div>
                    <div className="text-gray-500 mt-0.5">
                      {h.description || "Holiday"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 4: SUBSCRIPTION TAB ─── */}
        <TabsContent value="subscription" className="space-y-6">
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-700" />
                <h2 className="text-base font-bold text-gray-900">
                  Subscription & Billing
                </h2>
              </div>
            </div>

            {!latestSubscription ? (
              <div className="py-12 text-center text-sm text-gray-500">
                <CreditCard className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-700">
                  No active subscription
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  This garage owner currently does not have an active
                  subscription plan.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-5 rounded-xl bg-linear-to-br from-gray-900 to-gray-800 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                      Current Plan
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {latestSubscription.plan?.name || "Standard Garage Plan"}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {latestSubscription.price_pence !== undefined
                        ? `£${(latestSubscription.price_pence / 100).toFixed(2)} / month`
                        : "Monthly Billing"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 mr-1.5" />
                      {latestSubscription.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="text-xs text-gray-500 font-medium">
                      Billing Period Start
                    </div>
                    <div className="font-semibold text-gray-900 mt-1">
                      {formatDate(latestSubscription.current_period_start)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="text-xs text-gray-500 font-medium">
                      Billing Period End
                    </div>
                    <div className="font-semibold text-gray-900 mt-1">
                      {formatDate(latestSubscription.current_period_end)}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="text-xs text-gray-500 font-medium">
                      Next Billing Date
                    </div>
                    <div className="font-semibold text-gray-900 mt-1">
                      {formatDate(latestSubscription.next_billing_date)}
                    </div>
                  </div>

                  {latestSubscription.stripe_subscription_id && (
                    <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 sm:col-span-2">
                      <div className="text-xs text-gray-500 font-medium">
                        Stripe Subscription ID
                      </div>
                      <div className="font-mono text-xs font-semibold text-gray-900 mt-1 break-all">
                        {latestSubscription.stripe_subscription_id}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── TAB 5: ACTIVITY LOGS TAB ─── */}
        <TabsContent value="activity-logs" className="space-y-4">
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Activity & Audit Logs
                </h2>
                <p className="text-xs text-gray-500">
                  Recent actions, changes, and event history for this garage
                </p>
              </div>
            </div>

            {activityLogs.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="font-medium text-gray-700">
                  No activity logs recorded
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Future updates and events will be recorded here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Timestamp
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Action
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Target Entity
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Actor
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {activityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                          {formatDate(log.created_at, true)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              log.action === "CREATE"
                                ? "bg-green-50 text-green-700 border-green-200 font-mono text-xs"
                                : log.action === "UPDATE"
                                  ? "bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs"
                                  : "bg-gray-50 text-gray-700 border-gray-200 font-mono text-xs"
                            }
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-gray-900">
                          {log.table_name}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 capitalize">
                          {log.actor_type || "System"}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700 max-w-75 truncate">
                          {log.changes
                            ? typeof log.changes === "object"
                              ? JSON.stringify(log.changes)
                              : String(log.changes)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
