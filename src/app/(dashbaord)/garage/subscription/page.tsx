"use client";

import { FileText, Package, ShoppingCart, TrendingUp } from "lucide-react";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SubscriptionPlanItem,
  useGetSubscriptionPlansQuery,
} from "@/features/subscriptions";
import { PAGINATION_CONFIG } from "@/config/pagination.config";
import { Skeleton } from "@/components/ui/skeleton";
import { isTestSubscriptionPlanName } from "../../../../config/test-subscription-plan.config";

// Helper to get formatted price and currency for plan display
const getPlanPriceDisplay = (plan: SubscriptionPlanItem) => {
  if (typeof plan.price_pence === "number" && plan.price_pence > 0) {
    const amount = plan.price_pence / 100;
    const formattedAmount = amount % 1 === 0 ? `${amount}` : amount.toFixed(2);
    const currency =
      plan.currency === "GBP" || !plan.currency
        ? "£"
        : plan.currency === "USD"
          ? "$"
          : plan.currency === "EUR"
            ? "€"
            : plan.currency;
    return { currency, amount: formattedAmount };
  }

  if (plan.price_formatted) {
    const match = plan.price_formatted.match(
      /^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/,
    );
    if (match) {
      let amount = match[2];
      if (amount.endsWith(".00")) {
        amount = amount.slice(0, -3);
      }
      return { currency: match[1] || "£", amount };
    }
  }

  return { currency: "£", amount: "50" };
};

export default function SubscriptionPage() {
  const router = useRouter();

  // Fetch subscription plans
  const {
    data: plansData,
    isLoading,
    error,
  } = useGetSubscriptionPlansQuery({
    page: PAGINATION_CONFIG.DEFAULT_PAGE,
    limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
  });

  const plans = useMemo(() => {
    const fetchedPlans: SubscriptionPlanItem[] = Array.isArray(plansData?.data)
      ? plansData.data
      : [];
    return fetchedPlans.filter(
      (plan) => !isTestSubscriptionPlanName(plan.name),
    );
  }, [plansData?.data]);

  if (isLoading) {
    return (
      <div className="flex-1 lg:flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full flex justify-center items-center">
          <div className="w-full max-w-115">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
              <div className="p-8 pb-6 flex flex-col items-center">
                <Skeleton className="h-7 w-48 mb-4 rounded-md" />
                <div className="flex items-baseline gap-2 my-3">
                  <Skeleton className="h-14 w-28 rounded-md" />
                </div>
                <Skeleton className="h-4 w-16 mb-6 rounded-md" />
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
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 rounded mt-0.5" />
                        <Skeleton className="h-4 flex-1 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 lg:flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 font-medium">
            Error loading subscription plans. Please try again.
          </p>
        </div>
      </div>
    );
  }

  // If no plans available, show empty state
  if (plans.length === 0) {
    return (
      <div className="flex-1 lg:flex-1 flex items-center justify-center h-full">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h1 className="xs:text-2xl text-3xl font-bold text-gray-900 mb-4">
              No Subscription Plans Available
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              We&apos;re currently working on setting up subscription plans for
              your garage business.
            </p>
            <p className="text-gray-500 text-sm">
              Please check back later or contact our support team for more
              information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get features list for a subscription
  const getFeatures = () => {
    return [
      {
        icon: Package,
        text: "Unlimited opportunity to receive MOT bookings 24/7.",
      },
      {
        icon: ShoppingCart,
        text: "Boost your garage’s visibility.",
      },
      {
        icon: FileText,
        text: "Opportunity to upsell and offer extra services!",
      },
      {
        icon: TrendingUp,
        text: "No contract. No commission.",
      },
      {
        icon: Package,
        text: "Simple set up.",
      },
    ];
  };

  return (
    <div className="flex-1 h-full lg:flex-1 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full">
        <div className="flex flex-wrap justify-center items-stretch gap-6">
          {plans.map((plan) => {
            const hasSubscription = Boolean(
              plan.has_subscription || plan.is_current_plan,
            );
            const priceInfo = getPlanPriceDisplay(plan);

            return (
              <div
                key={plan.id}
                className={`relative w-full max-w-115 border rounded-2xl bg-white transition-all duration-200 shadow-sm hover:shadow-md ${
                  hasSubscription
                    ? "border-green-500 ring-2 ring-green-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Current Plan Badge */}
                {hasSubscription && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-[#19CA32] text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap shadow-xs">
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
                    {priceInfo.currency && (
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900 mr-0.5">
                        {priceInfo.currency}
                      </span>
                    )}
                    <span className="text-6xl sm:text-7xl font-extrabold text-gray-900 tracking-tight">
                      {priceInfo.amount}
                    </span>
                  </div>

                  <p className="text-gray-500 font-medium text-base mb-6">
                    /month
                  </p>

                  {/* Single Action Button (No icon) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (hasSubscription) {
                        router.push(
                          `/garage/subscription/details?plan_id=${plan.id}`,
                        );
                      } else {
                        router.push(
                          `/garage/subscription/order-summary?plan_id=${plan.id}`,
                        );
                      }
                    }}
                    className="w-full max-w-70 cursor-pointer py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 text-base bg-[#19CA32] hover:bg-green-600 text-white shadow-xs hover:shadow-md active:scale-[0.98] flex items-center justify-center text-center"
                  >
                    {hasSubscription ? "View Details" : "Get Started"}
                  </button>
                </div>

                {/* Horizontal Divider */}
                <div className="w-full border-t border-gray-200" />

                {/* Bottom Section: Description & Features */}
                <div className="p-8 pt-6 space-y-6">
                  {/* Description Paragraph */}
                  <p className="text-gray-600 text-sm leading-relaxed text-center sm:text-left">
                    {plan.description ||
                      "We believe in fairness & transparency - no hidden fees, no contracts, no commission, and no confusing tiers. Just full access for one simple price."}
                  </p>

                  {/* Features List */}
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-4">
                      Features
                    </h4>
                    <div className="space-y-3.5">
                      {getFeatures().map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="shrink-0 mt-0.5 text-[#19CA32]">
                            <feature.icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-gray-700 leading-snug">
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
