"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Inbox,
} from "lucide-react";
import {
  SubscriptionPlanItem,
  useGetSubscriptionPlansQuery,
} from "@/features/subscriptions";
import { PAGINATION_CONFIG } from "@/config/pagination.config";
import { Skeleton } from "@/components/ui/skeleton";
import { isTestSubscriptionPlanName } from "@/config/test-subscription-plan.config";

const PLAN_FEATURES = [
  { icon: Package, text: "Unlimited opportunity to receive MOT bookings 24/7." },
  { icon: ShoppingCart, text: "Boost your garage’s visibility." },
  { icon: FileText, text: "Opportunity to upsell and offer extra services!" },
  { icon: TrendingUp, text: "No contract. No commission." },
  { icon: Package, text: "Simple set up." },
];

const formatPlanPrice = (plan: SubscriptionPlanItem) => {
  const currency = plan.currency === "GBP" || !plan.currency ? "£" : plan.currency;
  if (typeof plan.price_pence === "number" && plan.price_pence > 0) {
    const numeric = plan.price_pence / 100;
    const amount = numeric % 1 === 0 ? `${numeric}` : numeric.toFixed(2);
    return { currency, amount };
  }

  const raw = plan.price_formatted?.replace(/^[^\d]*/, "") || "50";
  const amount = raw.endsWith(".00") ? raw.slice(0, -3) : raw;
  return { currency, amount };
};

function PlanCardSkeleton() {
  return (
    <div className="relative w-full max-w-115 border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="p-8 pb-6 flex flex-col items-center text-center space-y-3">
        <Skeleton className="h-7 w-48 rounded-md" />
        <div className="my-2 flex items-baseline justify-center gap-1">
          <Skeleton className="h-14 w-28 rounded-md" />
        </div>
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-12 w-full max-w-70 rounded-xl" />
      </div>

      <div className="w-full border-t border-gray-200" />

      <div className="p-8 pt-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-5/6 rounded" />
          <Skeleton className="h-3.5 w-4/6 rounded" />
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-4 rounded" />
          <div className="space-y-3.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  onSelect,
}: {
  plan: SubscriptionPlanItem;
  onSelect: (plan: SubscriptionPlanItem, hasSubscription: boolean) => void;
}) {
  const hasSubscription = Boolean(plan.has_subscription || plan.is_current_plan);
  const { currency, amount } = formatPlanPrice(plan);

  return (
    <div
      className={`relative w-full max-w-115 border rounded-2xl bg-white transition-all duration-200 shadow-sm hover:shadow-md flex flex-col ${
        hasSubscription
          ? "border-green-500 ring-2 ring-green-100"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {hasSubscription && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[#19CA32] text-white px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-xs">
            Current Plan
          </span>
        </div>
      )}

      {/* Top Section: Title, Price, Frequency, Button */}
      <div className="p-8 pb-6 flex flex-col items-center text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {plan.name || "One Simple Plan"}
        </h3>

        <div className="my-4 flex items-baseline justify-center">
          <span className="text-3xl sm:text-4xl font-bold text-gray-900 mr-0.5">
            {currency}
          </span>
          <span className="text-6xl sm:text-7xl font-extrabold text-gray-900 tracking-tight">
            {amount}
          </span>
        </div>

        <p className="text-gray-500 font-medium text-base mb-6">/month</p>

        <button
          type="button"
          onClick={() => onSelect(plan, hasSubscription)}
          className="w-full max-w-70 cursor-pointer py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 text-base bg-[#19CA32] hover:bg-green-600 text-white shadow-xs hover:shadow-md active:scale-[0.98] flex items-center justify-center text-center"
        >
          {hasSubscription ? "View Details" : "Get Started"}
        </button>
      </div>

      <div className="w-full border-t border-gray-200" />

      {/* Bottom Section: Description & Features */}
      <div className="p-8 pt-6 space-y-6">
        <p className="text-gray-600 text-sm leading-relaxed text-center sm:text-left">
          {plan.description ||
            "We believe in fairness & transparency - no hidden fees, no contracts, no commission, and no confusing tiers. Just full access for one simple price."}
        </p>

        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-4 text-left">Features</h4>
          <div className="space-y-3.5">
            {PLAN_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <feature.icon className="w-4 h-4 shrink-0 mt-0.5 text-[#19CA32]" />
                <span className="text-sm text-gray-700 leading-snug">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const router = useRouter();

  const { data: plansData, isLoading, error } = useGetSubscriptionPlansQuery({
    page: PAGINATION_CONFIG.DEFAULT_PAGE,
    limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
  });

  const plans = useMemo(() => {
    const fetched: SubscriptionPlanItem[] = Array.isArray(plansData?.data) ? plansData.data : [];
    return fetched.filter((plan) => !isTestSubscriptionPlanName(plan.name));
  }, [plansData?.data]);

  const handleSelectPlan = (plan: SubscriptionPlanItem, hasSubscription: boolean) => {
    if (hasSubscription) {
      router.push(`/garage/subscription/details?plan_id=${plan.id}`);
    } else {
      router.push(`/garage/subscription/order-summary?plan_id=${plan.id}`);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-6 sm:py-10 px-4">
      {isLoading ? (
        <div className="w-full flex flex-wrap justify-center items-stretch gap-6">
          <PlanCardSkeleton />
        </div>
      ) : error ? (
        <div className="text-center bg-white p-8 rounded-2xl border border-red-100 shadow-sm max-w-md">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Failed to load plans</h2>
          <p className="text-sm text-gray-500">
            Error loading subscription plans. Please refresh or try again later.
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center bg-white p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-sm max-w-md">
          <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Plans Available</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            We&apos;re currently working on setting up subscription plans for your garage business.
            Please check back later.
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-wrap justify-center items-stretch gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
          ))}
        </div>
      )}
    </div>
  );
}
