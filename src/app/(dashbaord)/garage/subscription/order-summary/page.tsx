"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Lock,
  Loader2,
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

const DEFAULT_PLAN_FEATURES = [
  "Unlimited opportunity to receive MOT bookings 24/7",
  "Boost your garage’s local visibility",
  "Opportunity to upsell and offer extra services",
  "No contract. No commission",
  "Simple & instant automated setup",
];

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

  // Loading Skeleton State
  if (isLoadingPlans) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            <Skeleton className="h-8 w-44 rounded" />
            <Skeleton className="h-4 w-56 rounded" />
            <div className="border-l-4 border-gray-200 pl-6 space-y-4 pt-2">
              <Skeleton className="h-7 w-36 rounded" />
              <Skeleton className="h-9 w-48 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <div className="space-y-3 pt-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-4 w-full rounded" />
                ))}
              </div>
            </div>
            <Skeleton className="h-5 w-32 rounded pt-4" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
            <Skeleton className="h-8 w-48 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-11 w-full rounded-lg" />
            </div>
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <div className="pt-4 border-t border-gray-200 flex justify-between">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-8 w-28 rounded" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Plan Not Found State
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
          Please select a subscription plan from the pricing page to proceed with your order.
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

  return (
    <div className="w-full">
      {/* Side-by-side Cards Grid taking Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
        {/* Left Column: Order Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Order Summary
            </h1>
            <p className="text-sm text-gray-500 mt-1 mb-8">
              Review your order before payment
            </p>

            {/* Plan Details with Vertical Brand Line */}
            <div className="border-l-4 border-[#19CA32] pl-5 sm:pl-6 py-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {plan.name || "One Simple Plan"}
                </h2>
                <span className="bg-[#19CA32] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                  Most Popular
                </span>
              </div>

              <div className="mt-3 flex items-baseline">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  {plan.price_formatted}
                </span>
                <span className="text-gray-500 font-medium text-base ml-1.5">
                  / month
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1 mb-6">
                Billed Monthly
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3.5">
                {DEFAULT_PLAN_FEATURES.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-sm text-gray-700"
                  >
                    <Check
                      className="w-4 h-4 text-[#19CA32] shrink-0"
                      strokeWidth={2.5}
                    />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Go Back Link at bottom */}
          <div className="pt-8">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/garage/subscription");
                }
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#19CA32] hover:text-[#16b82e] transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>

        {/* Right Column: Payment Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-6">
              Payment Summary
            </h2>

            {/* Promo Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have a promo code?
              </label>

              {appliedPromoCode ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {appliedPromoCode}
                    </span>
                    <span className="text-xs font-semibold text-emerald-800">
                      Promo Applied
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
                    className="flex-1 h-11 px-4 rounded-lg border border-gray-300 text-sm font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#19CA32]/20 focus:border-[#19CA32] transition-all bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!promoCodeInput.trim()}
                    className="h-11 px-6 rounded-lg bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-2xs"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Line Items Breakdown */}
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {plan.price_formatted}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Discount</span>
                <span className="font-medium text-gray-900">
                  {appliedPromoCode ? "Calculated at checkout" : "£0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Tax (Estimated)</span>
                <span className="font-medium text-gray-900">£0.00</span>
              </div>

              {/* Horizontal Line Divider */}
              <div className="border-t border-gray-200 pt-5 mt-5" />

              {/* Total Due Today */}
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-medium text-gray-700">
                  Total due today
                </span>
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {plan.price_formatted}
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
            {/* Primary Action Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleProceedToStripe}
              className="w-full h-12 rounded-xl bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
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

            {/* Terms microcopy */}
            <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
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
        <div className="w-full space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      }
    >
      <OrderSummaryContent />
    </Suspense>
  );
}
