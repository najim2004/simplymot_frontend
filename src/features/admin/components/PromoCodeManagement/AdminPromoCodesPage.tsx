"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  MoreVertical,
  X,
  Ticket,
  CheckCircle,
  PoundSterling,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReusablePagination from "@/components/reusable/Dashboard/Table/ReusablePagination";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import { CouponDialog } from "./CouponDialog";
import { INITIAL_COUPONS } from "./data";
import type {
  DiscountCoupon,
  CouponStatus,
  CouponDiscountType,
} from "./types";

const STATUS_BADGES: Record<CouponStatus, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  Expired: "bg-gray-100 text-gray-600 border-gray-200",
  Disabled: "bg-red-100 text-red-800 border-red-200",
};

export function AdminPromoCodesPage() {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(INITIAL_COUPONS);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<DiscountCoupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<DiscountCoupon | null>(
    null,
  );

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.status === "Active").length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.timesUsed, 0);
  const estimatedSavings = coupons.reduce(
    (sum, c) =>
      sum +
      (c.discountType === "fixed"
        ? c.discountValue * c.timesUsed
        : 18 * c.timesUsed),
    0,
  );

  const couponStats = [
    {
      label: "Total Coupons",
      value: totalCoupons,
      icon: Ticket,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Active",
      value: activeCoupons,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Redemptions",
      value: totalRedemptions,
      icon: Percent,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Discount Given",
      value: `£${estimatedSavings.toLocaleString()}`,
      icon: PoundSterling,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const filteredCoupons = coupons.filter((c) => {
    const matchesStatus =
      statusFilter === "all" ||
      c.status.toLowerCase() === statusFilter.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredCoupons.length / pageSize) || 1;
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const hasPagination = filteredCoupons.length > 0;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
  };

  const handleToggleStatus = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id !== couponId) return c;
        const newStatus: CouponStatus =
          c.status === "Active" ? "Disabled" : "Active";
        toast.info(`Coupon ${c.code} status changed to ${newStatus}`);
        return { ...c, status: newStatus };
      }),
    );
  };

  const handleOpenAdd = () => {
    setCouponToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (coupon: DiscountCoupon) => {
    setCouponToEdit(coupon);
    setIsDialogOpen(true);
  };

  const handleSaveCoupon = (couponData: {
    id?: string;
    code: string;
    description: string;
    discountType: CouponDiscountType;
    discountValue: number;
    minSpend: number;
    maxDiscount?: number;
    startDate: string;
    expiryDate: string;
    usageLimit: number;
    status: CouponStatus;
  }) => {
    if (couponData.id) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === couponData.id ? { ...c, ...couponData } : c)),
      );
      toast.success(`Coupon "${couponData.code}" updated successfully!`);
    } else {
      const newCoupon: DiscountCoupon = {
        id: `CPN-${Math.floor(100 + Math.random() * 900)}`,
        ...couponData,
        timesUsed: 0,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
      toast.success(`New coupon code "${couponData.code}" created!`);
    }
  };

  const confirmDeleteCoupon = () => {
    if (!couponToDelete) return;
    setCoupons((prev) => prev.filter((c) => c.id !== couponToDelete.id));
    toast.success(`Coupon "${couponToDelete.code}" deleted.`);
    setCouponToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header — matches garage/booking management */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight text-gray-900">
          Coupons & Discounts
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-11 w-full cursor-pointer border-gray-300 bg-white text-xs sm:text-sm">
                <SelectValue placeholder="All Coupons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coupons</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="block h-11 w-full rounded-lg border border-gray-300 bg-white py-0 pr-9 pl-9 text-xs leading-5 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary focus:outline-none sm:w-64 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-1 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            onClick={handleOpenAdd}
            className="h-11 cursor-pointer bg-[#19CA32] px-4 text-sm font-semibold text-white hover:bg-green-600"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Coupon
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {couponStats.map((stat) => (
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

      {/* Table */}
      {filteredCoupons.length === 0 ? (
        <div className="flex min-h-100 items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">No coupons found</p>
            <p className="mt-2 text-sm text-gray-500">
              Create a coupon or adjust your filters
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div
            className={`overflow-x-auto border border-gray-300 bg-white ${
              hasPagination ? "rounded-t-lg" : "rounded-lg"
            }`}
          >
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Coupon Code
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Discount
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Min. Spend
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Validity
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Redemptions
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {paginatedCoupons.map((coupon) => {
                  const percentUsed = Math.min(
                    100,
                    Math.round((coupon.timesUsed / coupon.usageLimit) * 100),
                  );

                  return (
                    <TableRow key={coupon.id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-sm font-medium text-gray-900">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy Code"
                            className="cursor-pointer rounded p-1 text-gray-400 transition hover:text-gray-900"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                        <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                          {coupon.description}
                        </p>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="rounded-md border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-800"
                        >
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `£${coupon.discountValue} OFF`}
                        </Badge>
                        {coupon.maxDiscount && (
                          <span className="mt-0.5 block text-xs text-gray-500">
                            Up to £{coupon.maxDiscount}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">
                        £{coupon.minSpend}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        <div className="font-medium text-gray-900">
                          Until {coupon.expiryDate}
                        </div>
                        <div className="text-xs text-gray-500">
                          From {coupon.startDate}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="w-32">
                          <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-900">
                            <span>{coupon.timesUsed} used</span>
                            <span className="text-gray-500">
                              /{coupon.usageLimit}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${
                                percentUsed >= 90
                                  ? "bg-red-500"
                                  : "bg-[#19CA32]"
                              }`}
                              style={{ width: `${percentUsed}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[coupon.status]}`}
                          >
                            {coupon.status}
                          </Badge>
                          <Switch
                            checked={coupon.status === "Active"}
                            onCheckedChange={() =>
                              handleToggleStatus(coupon.id)
                            }
                            title="Toggle Active/Disabled"
                            className="scale-75 data-[state=checked]:bg-[#19CA32]"
                          />
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer text-gray-500 hover:text-gray-900"
                            >
                              <MoreVertical size={16} />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-36 bg-white"
                          >
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(coupon)}
                              className="cursor-pointer text-xs font-medium"
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit Coupon
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyCode(coupon.code)}
                              className="cursor-pointer text-xs font-medium"
                            >
                              <Copy size={14} className="mr-2" />
                              Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setCouponToDelete(coupon)}
                              className="cursor-pointer text-xs font-medium text-red-600 focus:text-red-600"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete Coupon
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ReusablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={pageSize}
            totalItems={filteredCoupons.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setPageSize(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        couponToEdit={couponToEdit}
        onSaveCoupon={handleSaveCoupon}
      />

      <ConfirmationModal
        open={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={confirmDeleteCoupon}
        title={`Delete Coupon "${couponToDelete?.code || ""}"?`}
        description="Customers will no longer be able to apply this discount code during checkout."
        confirmText="Delete Coupon"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
