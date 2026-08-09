"use client";

import {
  ChevronDown,
  FileText,
  Package,
  ShoppingCart,
  Tag,
  TrendingUp,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  useGetSubscriptionPlansQuery,
  useCheckoutSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  CancelSubscription,
} from "@/features/garage";
import { PAGINATION_CONFIG } from "@/config/pagination.config";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { isTestSubscriptionPlanName } from "../../../../config/test-subscription-plan.config";

interface PlanItem {
  id: string;
  name: string;
  description: string;
  price_pence: number;
  currency: string;
  price_formatted: string;
  [key: string]: unknown;
}

interface ApiError {
  data?: {
    message?: string | { message?: string };
  };
  error?: string;
}

// Date formatter helper
const formatDate = (value: string | null | undefined) => {
  if (!value || value === "N/A") return "N/A";
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    return format(date, "dd/MM/yyyy");
  } catch {
    return "N/A";
  }
};

const isPromotionCurrentlyActive = (
  promotion:
    | {
        code?: string | null;
        stripe_promotion_code_id?: string | null;
        active_until?: string | null;
      }
    | null
    | undefined,
) => {
  if (!promotion?.code && !promotion?.stripe_promotion_code_id) return false;
  if (!promotion?.active_until) return true;

  const activeUntil = new Date(promotion.active_until);
  if (isNaN(activeUntil.getTime())) return false;

  return activeUntil.getTime() >= Date.now();
};

export default function SubscriptionPage() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoPlanId, setPromoPlanId] = useState<string | null>(null);

  // Fetch subscription plans
  const {
    data: plansData,
    isLoading,
    error,
  } = useGetSubscriptionPlansQuery({
    page: PAGINATION_CONFIG.DEFAULT_PAGE,
    limit: PAGINATION_CONFIG.DEFAULT_LIMIT,
  });

  // Fetch current subscription
  const { data: currentSubscriptionData, isLoading: isLoadingCurrent } =
    useGetCurrentSubscriptionQuery();

  const [checkoutSubscription] = useCheckoutSubscriptionMutation();

  const handleSelectPlan = async (plan: PlanItem) => {
    setLoadingPlanId(plan.id);

    try {
      const cleanPromoCode = promoPlanId === plan.id ? promoCode.trim() : "";
      const result = await checkoutSubscription({
        plan_id: plan.id,
        ...(cleanPromoCode ? { promo_code: cleanPromoCode } : {}),
      }).unwrap();

      if (result.success && result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
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
    } finally {
      setLoadingPlanId(null);
    }
  };

  const plans = useMemo(() => {
    const fetchedPlans: PlanItem[] = plansData?.data?.plans || [];
    return fetchedPlans.filter(
      (plan) => !isTestSubscriptionPlanName(plan.name),
    );
  }, [plansData?.data?.plans]);

  if (isLoading || isLoadingCurrent) {
    return (
      <div className="flex-1 lg:flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full">
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6 shadow-sm animate-pulse">
                <div className="flex justify-center mb-4">
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mb-6 mx-auto" />
                <div className="mb-6">
                  <div className="flex justify-center items-baseline gap-2 mb-1">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-12 w-full mb-6 rounded-md" />
                <div>
                  <Skeleton className="h-6 w-24 mb-3" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 rounded mt-0.5" />
                        <Skeleton className="h-4 flex-1" />
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

  const currentSubscription = currentSubscriptionData?.data;

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
        <div className="flex justify-center items-center gap-4">
          {plans.map((plan) => {
            const planSub = (plan.current_subscription as Record<string, unknown> | null) || null;
            const sub = (planSub || currentSubscription) as Record<string, any> | null;
            const isCurrentPlan =
              Boolean(planSub) ||
              Boolean(
                currentSubscription &&
                  (currentSubscription.plan?.id === plan.id ||
                    currentSubscription.plan_id === plan.id),
              );

            const isActiveSubscription = sub?.status === "ACTIVE";
            const isSuspended = sub?.status === "SUSPENDED" || sub?.status === "PAST_DUE";

            const periodEnd = sub?.billing?.current_period_end || sub?.current_period_end;
            const daysRemaining = sub?.trial?.days_remaining ?? sub?.trial_information?.days_remaining ?? 0;

            const isCancelledButActive =
              sub?.status === "CANCELLED" &&
              (new Date(periodEnd).getTime() > Date.now() || daysRemaining > 0);

            const hasActivePromotion = isPromotionCurrentlyActive(
              sub?.promotion,
            );

            return (
              <div
                key={plan.id}
                className={`relative w-fit min-w-[400px] max-w-[500px] border rounded-xl p-8 bg-white transition-all duration-200 hover:shadow-lg ${
                  isCurrentPlan && isActiveSubscription
                    ? "border-green-500 ring-2 ring-blue-100 bg-blue-50"
                    : isCurrentPlan && isSuspended
                      ? "border-yellow-500 ring-2 ring-yellow-100 bg-yellow-50"
                      : isCurrentPlan && isCancelledButActive
                        ? "border-orange-500 ring-2 ring-orange-100 bg-orange-50"
                        : isCurrentPlan &&
                            !isActiveSubscription &&
                            !isCancelledButActive &&
                            !isSuspended
                          ? "border-red-500 ring-2 ring-red-100 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {isCurrentPlan && isSuspended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Suspended - Payment Required
                    </span>
                  </div>
                )}

                {isCurrentPlan && isCancelledButActive && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {(currentSubscription?.trial_information?.days_remaining ??
                        0) > 0
                        ? `Cancelled (${currentSubscription.trial_information?.days_remaining} days trial left)`
                        : `Cancelled (Active Until ${formatDate(
                            currentSubscription.current_period_end,
                          )})`}
                    </span>
                  </div>
                )}

                {isCurrentPlan &&
                  !isActiveSubscription &&
                  !isCancelledButActive &&
                  !isSuspended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancelled
                      </span>
                    </div>
                  )}

                <div className="mb-6">
                  <h3 className="sm:text-2xl text-xl pb-2 font-bold text-gray-900">
                    One simple plan
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We believe in fairness & transparency - no hidden fees, no
                    contracts, no commission, and no confusing tiers. Just full
                    access for one simple price.
                  </p>

                  <div className="my-4">
                    <p className="mb-2.5">Membership</p>
                    <span className="sm:text-4xl text-2xl font-bold text-gray-900">
                      {plan.price_formatted}
                    </span>
                    <span className="text-gray-600 ml-1">/month</span>
                  </div>

                  <p className="text-sm">
                    {plan.price_formatted} billed automatically every month on
                    the sign-up date (unless cancelled)
                  </p>
                </div>

                {!(isCurrentPlan && isActiveSubscription) && (
                  <div className="mb-5">
                    <button
                      type="button"
                      aria-expanded={promoPlanId === plan.id}
                      aria-controls={`promo-code-panel-${plan.id}`}
                      onClick={() => {
                        const shouldOpen = promoPlanId !== plan.id;
                        setPromoPlanId(shouldOpen ? plan.id : null);
                        if (!shouldOpen) setPromoCode("");
                      }}
                      className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:border-[#19CA32] hover:bg-green-50/40"
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        I have a promo code
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          promoPlanId === plan.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      id={`promo-code-panel-${plan.id}`}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        promoPlanId === plan.id
                          ? "max-h-20 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <input
                        id={`promo-code-${plan.id}`}
                        value={promoCode}
                        onChange={(event) =>
                          setPromoCode(event.target.value.toUpperCase())
                        }
                        placeholder="Enter code"
                        className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase outline-none transition-colors focus:border-[#19CA32] focus:ring-2 focus:ring-[#19CA32]/10"
                      />
                    </div>
                  </div>
                )}

                {/* choose plan button */}
                {isCurrentPlan ? (
                  <div className="space-y-3 mb-6 ">
                    {/* Cancel Subscription Component - Only show for active subscriptions */}
                    {isActiveSubscription && (
                      <CancelSubscription
                        currentSubscription={currentSubscription}
                      />
                    )}

                    {isActiveSubscription && hasActivePromotion && (
                      <div className="rounded-lg border border-green-200 bg-white p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <Tag className="h-4 w-4 text-[#19CA32]" />
                          Promo code applied
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          {currentSubscription?.promotion?.active_until
                            ? `Current promotion active until ${formatDate(
                                currentSubscription.promotion.active_until,
                              )}.`
                            : "Current promotion is active on this subscription."}
                        </p>
                      </div>
                    )}

                    {/* Suspended Status - Show payment required message */}
                    {isSuspended && (
                      <div className="w-full py-3 px-4 rounded-lg bg-yellow-50 border border-yellow-200">
                        <p className="text-sm text-yellow-800 text-center mb-2">
                          <strong>Payment Required:</strong> Please update your
                          payment method to reactivate your subscription.
                        </p>
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          disabled={loadingPlanId === plan.id}
                          className="w-full cursor-pointer py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 text-sm disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-700 text-white"
                        >
                          {loadingPlanId === plan.id
                            ? "Processing..."
                            : "Reactivate Subscription"}
                        </button>
                      </div>
                    )}

                    {/* Resubscribe Button for cancelled subscriptions only (not suspended) */}
                    {!isActiveSubscription && !isSuspended && (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={loadingPlanId === plan.id}
                        className="w-full cursor-pointer py-3 px-6 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 text-sm disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-700 text-white"
                      >
                        {loadingPlanId === plan.id
                          ? "Processing..."
                          : "Resubscribe"}
                      </button>
                    )}

                    {/* Subscription Type Badge */}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isActiveSubscription
                            ? "bg-blue-100 text-blue-800"
                            : isSuspended
                              ? "bg-yellow-100 text-yellow-800"
                              : isCancelledButActive
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {(() => {
                          const type = currentSubscription.subscription_type;
                          if (type === "active_trial") return "Active";
                          if (type === "trial_with_cancellation")
                            return "Cancellation";
                          return type?.replace(/_/g, " ");
                        })()}
                      </span>

                      {/* Days Remaining Badge */}
                      {currentSubscription.trial_information
                        ?.days_remaining && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {currentSubscription.trial_information.days_remaining}{" "}
                          days left
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  // choose plan button
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loadingPlanId === plan.id}
                    className="w-full cursor-pointer py-3 px-6 rounded-lg font-semibold transition-colors duration-200 mb-6 disabled:opacity-50 text-sm disabled:cursor-not-allowed bg-[#19CA32] hover:bg-green-600 text-white"
                  >
                    {loadingPlanId === plan.id
                      ? "Processing..."
                      : `Choose ${plan.name}`}
                  </button>
                )}

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Features
                  </h4>
                  <div className="space-y-3">
                    {getFeatures().map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <feature.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {feature.text}
                        </span>
                      </div>
                    ))}
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
