export type CouponDiscountType = "percentage" | "fixed";
export type CouponStatus = "Active" | "Expired" | "Scheduled" | "Disabled";

export interface DiscountCoupon {
  id: string;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  timesUsed: number;
  status: CouponStatus;
}
