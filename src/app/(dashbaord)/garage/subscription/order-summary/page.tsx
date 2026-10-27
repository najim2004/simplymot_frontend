"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Tag,
  ShieldCheck,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  SubscriptionPlanItem,
  useGetSubscriptionPlansQuery,
  useCheckoutSubscriptionMutation,
} from "@/features/subscriptions";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { isTestSubscriptionPlanName } from "@/config/test-subscription-plan.config";

interface ApiError {
  data?: {
    message?: string | { message?: string };
  };
  error?: string;
}

function OrderSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlanId = searchParams.get("plan_id");

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch plans
  const { data: plansData, isLoading: isLoadingPlans } =
    useGetSubscriptionPlansQuery();

  const [checkoutSubscription] = useCheckoutSubscriptionMutation();

  const plans = useMemo(() => {
    const fetchedPlans: SubscriptionPlanItem[] = Array.isArray(plansData?.data)
      ? plansData.data
      : [];
    return fetchedPlans.filter(
      (plan) => !isTestSubscriptionPlanName(plan.name),
    );
  }, [plansData?.data]);

  // Determine which plan to display: match selectedPlanId or default to the first available plan
  const plan = useMemo(() => {
    if (!plans || plans.length === 0) return null;
    if (selectedPlanId) {
      const match = plans.find((p) => p.id === selectedPlanId);
      if (match) return match;
    }
    return plans[0];
  }, [plans, selectedPlanId]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) {
      toast.warning("Please enter a valid coupon code.");
      return;
    }
    setAppliedPromoCode(clean);
    toast.success(`Coupon code "${clean}" applied!`);
  };

  const handleRemovePromo = () => {
    setAppliedPromoCode(null);
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
      const cleanPromo = appliedPromoCode?.trim() || undefined;
      const result = await checkoutSubscription({
        plan_id: plan.id,
        ...(cleanPromo ? { promo_code: cleanPromo } : {}),
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
      const apiMessage =
        typeof apiErr?.data?.message === "string"
          ? apiErr.data.message
          : apiErr?.data?.message?.message ||
            apiErr?.error ||
            "Checkout failed. Please try again.";
      toast.error(apiMessage);
      setIsSubmitting(false);
    }
  };

  if (isLoadingPlans) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-5">
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          No Plan Selected
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Please select a subscription plan from the subscription page to
          continue with your order.
        </p>
        <Link
          href="/garage/subscription"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subscription Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 1. Header with Back button */}
      <div className="mb-6">
        <Link
          href="/garage/subscription"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Order Summary
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Review your subscription plan, apply any coupon, and proceed to secure checkout.
        </p>
      </div>

      {/* 2. Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plan Information & Coupon Entry (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. Plan Details Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#19CA32] border border-emerald-100 mb-2">
                  Monthly Membership
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {plan.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {plan.description ||
                    "Full access to the SimplyMOT network with 24/7 booking opportunities."}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {plan.price_formatted}
                </span>
                <span className="text-xs text-gray-500 block">/ month</span>
              </div>
            </div>

            {/* Included Benefits */}
            <div className="pt-4 space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                What&apos;s Included In This Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0" />
                  <span>Receive MOT bookings 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0" />
                  <span>Boost garage local visibility</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0" />
                  <span>Upsell servicing & repairs</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0" />
                  <span>Zero commission on bookings</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0" />
                  <span>No contracts, cancel anytime</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0" />
                  <span>Instant automated activation</span>
                </div>
              </div>
            </div>
          </div>

          {/* B. Coupon / Promo Code Card */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#19CA32]" />
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Add Subscription Coupon / Promo Code
              </h3>
            </div>

            {appliedPromoCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs sm:text-sm text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                    {appliedPromoCode}
                  </span>
                  <span className="text-xs font-medium text-emerald-700">
                    Coupon applied! Discount will be activated at checkout.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="p-1 rounded-md text-emerald-700 hover:text-red-600 hover:bg-emerald-100/50 transition-colors cursor-pointer"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) =>
                        setPromoCodeInput(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. WELCOME10, SUMMER50"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-300 font-mono text-sm uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#19CA32] focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!promoCodeInput.trim()}
                    className="h-11 px-5 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    Apply Code
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  If you have an official SimplyMOT promotional code, enter it above before proceeding.
                </p>
              </form>
            )}
          </div>

          {/* C. Trust & Security Badge */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200/80 text-xs text-gray-600">
            <ShieldCheck className="w-5 h-5 text-[#19CA32] shrink-0" />
            <div>
              <span className="font-semibold text-gray-800">
                Bank-Grade Security Guaranteed
              </span>
              <p className="mt-0.5">
                Payments are securely processed via Stripe with 256-bit SSL encryption. We never store your full payment card details.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary & Checkout Action (5 Cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">
              Payment Summary
            </h3>

            {/* Line items */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>{plan.name}</span>
                <span className="font-semibold text-gray-900">
                  {plan.price_formatted}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>Billing Frequency</span>
                <span className="font-medium text-gray-900">Every month</span>
              </div>

              <div className="flex justify-between items-center text-gray-600">
                <span>VAT / Tax</span>
                <span className="font-medium text-gray-900">£0.00</span>
              </div>

              {appliedPromoCode && (
                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Promo ({appliedPromoCode})
                  </span>
                  <span>Applied</span>
                </div>
              )}
            </div>

            {/* Total Divider */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-base font-bold text-gray-900">
                  Total Due Today
                </span>
                <span className="text-2xl font-extrabold text-[#19CA32]">
                  {plan.price_formatted}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Automatically renews each month. Cancel anytime from your account.
              </p>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleProceedToStripe}
              className="w-full h-12 rounded-xl bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Stripe...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Continue to Stripe Checkout</span>
                </>
              )}
            </button>

            {/* Bottom microcopy */}
            <div className="text-center text-xs text-gray-400 space-y-1">
              <p>By continuing, you agree to SimplyMOT Terms of Service.</p>
              <p>Zero contract lock-in. Cancel with 1 click anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto p-8 text-center text-gray-500">
          Loading order summary...
        </div>
      }
    >
      <OrderSummaryContent />
    </Suspense>
  );
}
