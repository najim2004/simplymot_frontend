"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {/* Code with Generator */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-900">
          Coupon Code <span className="text-rose-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            autoFocus
            placeholder="e.g. FLASH20, SUMMER50"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono text-sm uppercase focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateCode}
            className="h-10 shrink-0 text-xs font-semibold"
          >
            <Sparkles size={13} className="mr-1 text-[#19CA32]" /> Auto Code
          </Button>
        </div>
      </div>

      {/* Type & Value */}
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="min-w-0 space-y-1.5">
          <Label className="text-xs font-semibold text-gray-900">Discount Type</Label>
          <Select
            value={discountType}
            onValueChange={(val) => setDiscountType(val as CouponDiscountType)}
          >
            <SelectTrigger className="h-10 w-full bg-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="percentage" className="text-xs">
                Percentage (%)
              </SelectItem>
              <SelectItem value="fixed" className="text-xs">
                Fixed Amount (£)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label className="text-xs font-semibold text-gray-900">
            Discount Value {discountType === "percentage" ? "(%)" : "(£)"}
          </Label>
          <Input
            type="number"
            min="1"
            max={discountType === "percentage" ? "100" : undefined}
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="h-10 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>
      </div>

      {/* Min Spend & Max Discount */}
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="min-w-0 space-y-1.5">
          <Label className="text-xs font-semibold text-gray-900">
            Minimum Spend (£)
          </Label>
          <Input
            type="number"
            min="0"
            value={minSpend}
            onChange={(e) => setMinSpend(e.target.value)}
            placeholder="0"
            className="h-10 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label className="text-xs font-semibold text-gray-900">
            Max Discount (£){" "}
            <span className="font-normal text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            type="number"
            min="0"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="No cap"
            className="h-10 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>
      </div>

      {/* Dates: Start Date & Expiry Date */}
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="min-w-0 space-y-1.5">
          <Label className="text-xs font-semibold text-gray-900">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label className="text-xs font-semibold text-gray-900">Expiry Date</Label>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="h-10 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
          />
        </div>
      </div>

      {/* Usage Limit */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-900">
          Total Usage Limit
        </Label>
        <Input
          type="number"
          min="1"
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
          className="h-10 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-900">
          Campaign Description
        </Label>
        <Textarea
          rows={2}
          placeholder="e.g. 15% promotional discount on MOT bookings"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-xs focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
        />
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-900">Coupon Status</Label>
        <Select
          value={status}
          onValueChange={(val) => setStatus(val as CouponStatus)}
        >
          <SelectTrigger className="h-10 w-full bg-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="Active" className="text-xs">
              Active
            </SelectItem>
            <SelectItem value="Scheduled" className="text-xs">
              Scheduled
            </SelectItem>
            <SelectItem value="Expired" className="text-xs">
              Expired
            </SelectItem>
            <SelectItem value="Disabled" className="text-xs">
              Disabled
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="flex flex-row items-center justify-end gap-3 pt-3 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-9 px-4 text-xs font-medium"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-9 cursor-pointer bg-[#19CA32] px-4 text-xs font-semibold text-white shadow-xs hover:bg-green-600"
        >
          {couponToEdit ? "Update Coupon" : "Create Coupon"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CouponDialog({
  open,
  onOpenChange,
  couponToEdit,
  onSaveCoupon,
}: CouponDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white p-6 sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {couponToEdit ? "Edit Coupon" : "Create New Coupon"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Set discount value, campaign restrictions, and active validity dates.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CouponForm
            key={couponToEdit?.id || "new"}
            couponToEdit={couponToEdit}
            onSaveCoupon={(data) => {
              onSaveCoupon(data);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
