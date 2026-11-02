"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  SubscriptionPlanItem,
  useGetSubscriptionPlansQuery,
  useCheckoutSubscriptionMutation,
  useValidatePromoCodeMutation,
  ValidatedPromoData,
} from "@/features/subscriptions";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { isTestSubscriptionPlanName } from "@/config/test-subscription-plan.config";

interface ApiError {
  data?: { message?: string | { message?: string } };
  error?: string;
}

const PLAN_FEATURES = [
  {
    icon: Package,
    text: "Unlimited opportunity to receive MOT bookings 24/7.",
  },
  { icon: ShoppingCart, text: "Boost your garage's visibility." },
  { icon: FileText, text: "Opportunity to upsell and offer extra services!" },
  { icon: TrendingUp, text: "No contract. No commission." },
  { icon: Package, text: "Simple set up." },
];

const formatPlanPrice = (plan: SubscriptionPlanItem | null) => {
  if (!plan) return { currency: "£", amount: "5", formatted: "£5.00" };

  const currency =
    plan.currency === "GBP" || !plan.currency ? "£" : plan.currency;
  if (typeof plan.price_pence === "number" && plan.price_pence > 0) {
    const numeric = plan.price_pence / 100;
    const amount = numeric % 1 === 0 ? `${numeric}` : numeric.toFixed(2);
    return { currency, amount, formatted: `£${numeric.toFixed(2)}` };
  }

  const raw = plan.price_formatted?.replace(/^[^\d]*/, "") || "5.00";
  const amount = raw.endsWith(".00") ? raw.slice(0, -3) : raw;
  const formatted = raw.includes(".")
    ? `${currency}${raw}`
    : `${currency}${raw}.00`;
  return { currency, amount, formatted: plan.price_formatted || formatted };
};

function OrderSummarySkeleton() {
  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-6 sm:py-10 px-2 sm:px-4">
      <div className="w-full max-w-285 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
        {/* Left Card Skeleton */}
        <div className="w-full max-w-115 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Skeleton className="h-7 w-44 rounded-md" />
            <Skeleton className="h-14 w-24 rounded-md" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-5 w-20 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card Skeleton */}
        <div className="w-full max-w-155 flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 space-y-6">
          <Skeleton className="h-8 w-52 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 w-24 rounded-xl" />
            </div>
          </div>
          <div className="space-y-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-gray-200 flex justify-between">
            <Skeleton className="h-6 w-32 rounded" />
            <Skeleton className="h-9 w-24 rounded" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function OrderSummaryContent() {
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get("plan_id");

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<ValidatedPromoData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: plansData, isLoading: isLoadingPlans } =
    useGetSubscriptionPlansQuery();
  const [validatePromo, { isLoading: isValidatingPromo }] =
    useValidatePromoCodeMutation();
  const [checkoutSubscription] = useCheckoutSubscriptionMutation();

  const plans = useMemo(() => {
    const fetched: SubscriptionPlanItem[] = Array.isArray(plansData?.data)
      ? plansData.data
      : [];
    return fetched.filter((p) => !isTestSubscriptionPlanName(p.name));
  }, [plansData?.data]);

  const plan = useMemo(() => {
    if (!plans.length) return null;
    return (
      (selectedPlanId && plans.find((p) => p.id === selectedPlanId)) || plans[0]
    );
  }, [plans, selectedPlanId]);

  const priceInfo = useMemo(() => formatPlanPrice(plan), [plan]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) {
      toast.warning("Please enter a valid coupon code.");
      return;
    }
    if (!plan) return;

    try {
      const res = await validatePromo({
        plan_id: plan.id,
        code: clean,
      }).unwrap();

      if (res.success && res.data?.valid) {
        setAppliedPromo(res.data);
        toast.success(
          `Coupon "${res.data.code}" applied! (${res.data.percent_off}% off)`
        );
      } else {
        toast.error("Invalid coupon code.");
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message =
        typeof apiErr?.data?.message === "string"
          ? apiErr.data.message
          : apiErr?.data?.message?.message ||
            apiErr?.error ||
            "Invalid or inactive promo code.";
      toast.error(message);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    toast.info("Coupon code removed.");
  };

  const handleProceedToStripe = async () => {
    if (!plan) {
      toast.error("No plan selected. Please select a plan first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await checkoutSubscription({
        plan_id: plan.id,
        ...(appliedPromo?.code ? { promo_code: appliedPromo.code } : {}),
      }).unwrap();

      if (result.success && result.data?.checkout_url) {
        toast.info("Redirecting to secure Stripe checkout...");
        window.location.href = result.data.checkout_url;
      } else {
        toast.error("Unable to start checkout. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const message =
        typeof apiErr?.data?.message === "string"
          ? apiErr.data.message
          : apiErr?.data?.message?.message ||
            apiErr?.error ||
            "Checkout failed. Please try again.";
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  if (isLoadingPlans) return <OrderSummarySkeleton />;

  if (!plan) {
    return (
      <div className="w-full max-w-md mx-auto my-16 text-center bg-white p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          No Plan Selected
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Please select a subscription plan from the pricing page to proceed
          with your order.
        </p>
        <Link
          href="/garage/subscription"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-sm transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subscription Plans
        </Link>
      </div>
    );
  }

  const lineItems = [
    { label: "Subtotal", value: priceInfo.formatted, bold: true },
    {
      label: "Discount",
      value: appliedPromo
        ? `-${appliedPromo.discount_formatted} (${appliedPromo.percent_off}% off)`
        : "£0.00",
      highlight: Boolean(appliedPromo),
    },
    { label: "Tax (Estimated)", value: "£0.00" },
  ];

  const totalDueToday = appliedPromo
    ? appliedPromo.final_price_formatted
    : priceInfo.formatted;

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-6 sm:py-10 px-2 sm:px-4">
      <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
        {/* Left Column: Plan Card */}
        <div className="relative w-full max-w-115 shrink-0 border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 pb-6 flex flex-col items-center text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {plan.name || "One Simple Plan"}
            </h3>

            <div className="my-4 flex items-baseline justify-center">
              {priceInfo.currency && (
                <span className="text-3xl sm:text-4xl font-bold text-gray-900 mr-0.5">
                  {priceInfo.currency}
                </span>
              )}
              <span className="text-6xl sm:text-7xl font-extrabold text-gray-900 tracking-tight">
                {priceInfo.amount}
              </span>
            </div>

            <p className="text-gray-500 font-medium text-base">/month</p>
          </div>

          <div className="w-full border-t border-gray-200" />

          <div className="p-8 pt-6 space-y-6">
            <p className="text-gray-600 text-sm leading-relaxed text-center sm:text-left">
              {plan.description ||
                "We believe in fairness & transparency - no hidden fees, no contracts, no commission, and no confusing tiers. Just full access for one simple price."}
            </p>

            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 text-left">
                Features
              </h4>
              <div className="space-y-3.5">
                {PLAN_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <feature.icon className="w-4 h-4 shrink-0 mt-0.5 text-[#19CA32]" />
                    <span className="text-sm text-gray-700 leading-snug">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Summary Card */}
        <div className="w-full max-w-3xl flex-1 border border-gray-200 rounded-2xl bg-white shadow-sm p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-6 sm:mb-8">
              Payment Summary
            </h2>

            {/* Promo Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have a promo code?
              </label>

              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-900 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                      {appliedPromo.code}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      {appliedPromo.percent_off}% Off Applied
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-emerald-700 hover:text-red-600 font-semibold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2.5">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) =>
                      setPromoCodeInput(e.target.value.toUpperCase())
                    }
                    placeholder="Enter promo code"
                    className="flex-1 h-11 px-4 rounded-xl border border-gray-200 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#19CA32]/20 focus:border-[#19CA32] transition-all bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!promoCodeInput.trim() || isValidatingPromo}
                    className="h-11 px-6 rounded-xl bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    {isValidatingPromo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      "Apply"
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Line Items Breakdown */}
            <div className="space-y-4 text-sm sm:text-base pt-2">
              {lineItems.map(({ label, value, bold, highlight }) => (
                <div
                  key={label}
                  className="flex justify-between items-center text-gray-500"
                >
                  <span>{label}</span>
                  <span
                    className={
                      highlight
                        ? "font-semibold text-emerald-600"
                        : bold
                          ? "font-semibold text-gray-900"
                          : "font-medium text-gray-900"
                    }
                  >
                    {value}
                  </span>
                </div>
              ))}

              <div className="border-t border-gray-200 pt-6 mt-6" />

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-base sm:text-lg font-semibold text-gray-800">
                  Total due today
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {totalDueToday}
                </span>
              </div>
            </div>

            {/* Secured by Stripe Badge */}
            <div className="my-6 flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Secured by Stripe</span>
              <span className="font-bold text-gray-800 tracking-tight ml-1 text-sm font-sans">
                stripe
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleProceedToStripe}
              className="w-full h-12 sm:h-13 rounded-xl bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Stripe...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Payment</span>
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSummaryPage() {
  return (
    <Suspense fallback={<OrderSummarySkeleton />}>
      <OrderSummaryContent />
    </Suspense>
  );
}
