"use client";

import { useState } from "react";
import { Sparkles, Ticket } from "lucide-react";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DiscountCoupon, CouponDiscountType, CouponStatus } from "./types";
import { toast } from "sonner";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponToEdit?: DiscountCoupon | null;
  onSaveCoupon: (coupon: {
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
  }) => void;
}

function CouponForm({
  couponToEdit,
  onSaveCoupon,
  onCancel,
}: {
  couponToEdit?: DiscountCoupon | null;
  onSaveCoupon: CouponDialogProps["onSaveCoupon"];
  onCancel: () => void;
}) {
  const [code, setCode] = useState(couponToEdit?.code || "");
  const [description, setDescription] = useState(
    couponToEdit?.description || "",
  );
  const [discountType, setDiscountType] = useState<CouponDiscountType>(
    couponToEdit?.discountType || "percentage",
  );
  const [discountValue, setDiscountValue] = useState<string>(
    couponToEdit?.discountValue?.toString() || "15",
  );
  const [minSpend, setMinSpend] = useState<string>(
    couponToEdit?.minSpend?.toString() || "50",
  );
  const [maxDiscount, setMaxDiscount] = useState<string>(
    couponToEdit?.maxDiscount?.toString() || "",
  );
  const [startDate, setStartDate] = useState<string>(
    couponToEdit?.startDate || new Date().toISOString().split("T")[0],
  );
  const [expiryDate, setExpiryDate] = useState<string>(
    couponToEdit?.expiryDate || "2026-12-31",
  );
  const [usageLimit, setUsageLimit] = useState<string>(
    couponToEdit?.usageLimit?.toString() || "500",
  );
  const [status, setStatus] = useState<CouponStatus>(
    couponToEdit?.status || "Active",
  );

  const handleGenerateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomCode = "SAVE-";
    for (let i = 0; i < 5; i++) {
      randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(randomCode);
    toast.info(`Generated code: ${randomCode}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      toast.error("Please provide a valid positive discount value");
      return;
    }

    onSaveCoupon({
      id: couponToEdit?.id,
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: val,
      minSpend: parseFloat(minSpend) || 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      startDate,
      expiryDate,
      usageLimit: parseInt(usageLimit, 10) || 100,
      status,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Coupon Code <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder="e.g. FLASH20, SUMMER50"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-11 font-mono text-sm uppercase focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateCode}
              className="h-11 shrink-0 cursor-pointer text-sm font-semibold"
            >
              <Sparkles size={14} className="mr-1 text-[#19CA32]" /> Auto Code
            </Button>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="min-w-0 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Discount Type
            </Label>
            <Select
              value={discountType}
              onValueChange={(val) =>
                setDiscountType(val as CouponDiscountType)
              }
            >
              <SelectTrigger className="h-11 w-full border-gray-300 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Discount Value {discountType === "percentage" ? "(%)" : "(£)"}
            </Label>
            <Input
              type="number"
              min="1"
              max={discountType === "percentage" ? "100" : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="h-11 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="min-w-0 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Minimum Spend (£)
            </Label>
            <Input
              type="number"
              min="0"
              value={minSpend}
              onChange={(e) => setMinSpend(e.target.value)}
              placeholder="0"
              className="h-11 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Max Discount (£){" "}
              <span className="font-normal text-gray-400">(Optional)</span>
            </Label>
            <Input
              type="number"
              min="0"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder="No cap"
              className="h-11 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="min-w-0 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Start Date
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Expiry Date
            </Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="h-11 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Total Usage Limit
          </Label>
          <Input
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            className="h-11 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Campaign Description
          </Label>
          <Textarea
            rows={2}
            placeholder="e.g. 15% promotional discount on MOT bookings"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-20 resize-none text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Coupon Status
          </Label>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as CouponStatus)}
          >
            <SelectTrigger className="h-11 w-full border-gray-300 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-gray-200 bg-white px-5 py-4">
        <Button
          type="submit"
          className="h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#19CA32] to-[#16b82e] font-semibold text-white shadow-md hover:opacity-95"
        >
          {couponToEdit ? "Update Coupon" : "Create Coupon"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 cursor-pointer rounded-lg font-semibold"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CouponDialog({
  open,
  onOpenChange,
  couponToEdit,
  onSaveCoupon,
}: CouponDialogProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <CustomReusableModal
      isOpen={open}
      onClose={handleClose}
      title={couponToEdit ? "Edit Coupon" : "Create New Coupon"}
      showHeader={false}
      hideClose={true}
      className="flex max-h-[min(90dvh,calc(100vh-2rem))] max-w-2xl flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white">
        <div className="flex shrink-0 items-center justify-between bg-linear-to-r from-[#19CA32] to-[#16b82e] px-5 py-4 text-white shadow-md">
          <div>
            <h2 className="text-lg font-semibold">
              {couponToEdit ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            <p className="mt-0.5 text-xs text-white/90">
              Set discount value, restrictions, and validity dates
            </p>
          </div>
          <Ticket className="h-5 w-5 opacity-90" />
        </div>

        {open && (
          <CouponForm
            key={couponToEdit?.id || "new"}
            couponToEdit={couponToEdit}
            onSaveCoupon={(data) => {
              onSaveCoupon(data);
              handleClose();
            }}
            onCancel={handleClose}
          />
        )}
      </div>
    </CustomReusableModal>
  );
}
