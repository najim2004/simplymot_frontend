"use client";

import { useState } from "react";
import {
  Ticket,
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Percent,
  PoundSterling,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TablePagination } from "./TablePagination";
import { CouponDialog } from "./CouponDialog";
import { INITIAL_COUPONS } from "./data";
import type {
  DiscountCoupon,
  CouponStatus,
  CouponDiscountType,
} from "./types";

const STATUS_BADGES: Record<CouponStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  Expired: "bg-zinc-100 text-zinc-600 border-zinc-200",
  Disabled: "bg-rose-50 text-rose-700 border-rose-200",
};

export function AdminPromoCodesPage() {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(INITIAL_COUPONS);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<DiscountCoupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<DiscountCoupon | null>(
    null,
  );

  // Stats calculation
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

  // Filter coupons
  const filteredCoupons = coupons.filter((c) => {
    const matchesTab =
      activeTab === "All" || c.status.toLowerCase() === activeTab.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredCoupons.length / pageSize) || 1;
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

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
    <div className="flex-1 space-y-6 p-4 lg:p-8">
      {/* 0. Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
        <p className="text-sm text-gray-500">
          Create discount campaigns, set usage limits, and track redemptions.
        </p>
      </div>

      {/* 1. Header Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition hover:border-[#19CA32]/40">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Coupons
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-md bg-[#DDF7E0] text-[#19CA32] shadow-xs">
              <Ticket size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-end gap-2.5">
            <span className="text-2xl font-bold text-gray-900">
              {totalCoupons}
            </span>
            <span className="mb-0.5 flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
              <TrendingUp size={13} /> {activeCoupons} Active
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Promotional discount codes
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition hover:border-[#19CA32]/40">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Redemptions
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-600 shadow-xs">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-end gap-2.5">
            <span className="text-2xl font-bold text-gray-900">
              {totalRedemptions}
            </span>
            <span className="mb-0.5 text-xs font-semibold text-gray-500">
              Bookings
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">Total customer uses</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition hover:border-[#19CA32]/40">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Discount Given
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-md bg-gray-100 text-gray-600 shadow-xs">
              <PoundSterling size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-end gap-2.5">
            <span className="text-2xl font-bold text-gray-900">
              £{estimatedSavings.toLocaleString()}
            </span>
            <span className="mb-0.5 text-xs font-semibold text-emerald-600">
              Saved
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Total savings delivered
          </p>
        </div>

        <div className="rounded-lg border border-amber-200/60 bg-amber-50/40 p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Avg. Conversion Boost
            </p>
            <div className="grid h-8 w-8 place-items-center rounded-md bg-[#DDF7E0] text-[#19CA32] shadow-xs">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-end gap-2.5">
            <span className="text-2xl font-bold text-gray-900">+28.4%</span>
            <span className="mb-0.5 text-xs font-semibold text-amber-800">
              Checkout rate
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Campaign uplift estimate
          </p>
        </div>
      </div>

      {/* 2. Coupons Table Container */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
          <div className="relative min-w-64 flex-1">
            <Search
              size={16}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Search coupon code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md pl-9 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Active", "Scheduled", "Expired", "Disabled"].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab
                      ? "bg-[#19CA32] text-white shadow-xs"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}

            <Button
              onClick={handleOpenAdd}
              className="ml-2 h-9 cursor-pointer rounded-md bg-[#19CA32] text-xs font-semibold text-white shadow-xs hover:bg-green-600"
            >
              <Plus size={14} className="mr-1 stroke-[2.5]" /> Add Coupon
            </Button>
          </div>
        </div>

        {/* Coupons Table */}
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Coupon Code & Campaign
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Discount
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Min. Spend
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Validity
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Redemptions
              </TableHead>
              <TableHead className="px-4 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Status
              </TableHead>
              <TableHead className="px-4 py-3.5 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {filteredCoupons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm text-gray-500"
                >
                  No coupons found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCoupons.map((coupon) => {
                const percentUsed = Math.min(
                  100,
                  Math.round((coupon.timesUsed / coupon.usageLimit) * 100),
                );

                return (
                  <TableRow
                    key={coupon.id}
                    className="border-gray-100 transition-colors hover:bg-green-50/40"
                  >
                    {/* Code & Description */}
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-sm font-medium text-gray-900">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(coupon.code)}
                          title="Copy Code"
                          className="rounded p-1 text-gray-400 transition hover:text-gray-900"
                        >
                          <Copy size={13} />
                        </button>
                      </div>
                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                        {coupon.description}
                      </p>
                    </TableCell>

                    {/* Discount Value */}
                    <TableCell className="px-4 py-3.5">
                      <Badge
                        variant="outline"
                        className="rounded-md border border-[#19CA32]/40 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-gray-900"
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

                    {/* Min Spend */}
                    <TableCell className="px-4 py-3.5 text-sm font-medium text-gray-900">
                      £{coupon.minSpend}
                    </TableCell>

                    {/* Validity */}
                    <TableCell className="px-4 py-3.5 text-sm whitespace-nowrap text-gray-500">
                      <div className="font-medium text-gray-900">
                        Until {coupon.expiryDate}
                      </div>
                      <div className="text-xs text-gray-500">
                        From {coupon.startDate}
                      </div>
                    </TableCell>

                    {/* Redemptions Progress */}
                    <TableCell className="px-4 py-3.5">
                      <div className="w-32">
                        <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-900">
                          <span>
                            <span className="font-medium text-gray-900">
                              {coupon.timesUsed}
                            </span>{" "}
                            used
                          </span>
                          <span className="text-gray-500">
                            /{coupon.usageLimit}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                          <div
                            className={`h-full rounded-full ${
                              percentUsed >= 90 ? "bg-rose-500" : "bg-[#19CA32]"
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGES[coupon.status]}`}
                        >
                          {coupon.status}
                        </Badge>
                        <Switch
                          checked={coupon.status === "Active"}
                          onCheckedChange={() => handleToggleStatus(coupon.id)}
                          title="Toggle Active/Disabled"
                          className="scale-75 data-[state=checked]:bg-[#19CA32]"
                        />
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md text-gray-500 hover:text-gray-900"
                          >
                            <MoreHorizontal size={16} />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-white">
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
                            className="cursor-pointer text-xs font-medium text-rose-600 focus:text-rose-600"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete Coupon
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredCoupons.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="coupons"
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* 3. Add/Edit Coupon Dialog */}
      <CouponDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        couponToEdit={couponToEdit}
        onSaveCoupon={handleSaveCoupon}
      />

      {/* 4. Delete Confirmation Dialog */}
      <Dialog
        open={!!couponToDelete}
        onOpenChange={(open) => !open && setCouponToDelete(null)}
      >
        <DialogContent className="max-w-md bg-white p-6 sm:rounded-lg">
          <DialogHeader>
            <div className="mb-2 mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle size={20} />
            </div>
            <DialogTitle className="text-center text-base font-bold text-gray-900">
              Delete Coupon &ldquo;{couponToDelete?.code}&rdquo;?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-gray-500">
              Customers will no longer be able to apply this discount code
              during checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row items-center justify-center gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCouponToDelete(null)}
              className="h-9 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteCoupon}
              className="h-9 px-4 text-xs font-semibold"
            >
              Delete Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
