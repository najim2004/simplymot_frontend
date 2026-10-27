"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  Clock,
  Eye,
  AlertTriangle,
  Receipt,
  ExternalLink,
  Tag,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  useGetSubscriptionPlanDetailsQuery,
  CancelSubscription,
} from "@/features/subscriptions";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Date formatting helper
const formatDateSafe = (value: string | null | undefined): string => {
  if (!value || value === "N/A") return "N/A";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "N/A";
    return format(d, "dd MMM yyyy");
  } catch {
    return "N/A";
  }
};

function SubscriptionDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Skeleton className="h-6 w-36 rounded" />
      <Skeleton className="h-8 w-64 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function SubscriptionDetailsContent() {
  const searchParams = useSearchParams();
  const planId = searchParams?.get("plan_id") || "current";

  const {
    data: detailsData,
    isLoading,
    refetch,
  } = useGetSubscriptionPlanDetailsQuery(planId);

  const activePlan = detailsData?.data?.plan;
  const currentSubscription = detailsData?.data?.subscription;

  if (isLoading) {
    return <SubscriptionDetailsSkeleton />;
  }

  // If no subscription at all
  if (!currentSubscription) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/90 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Active Subscription
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Your garage currently does not have an active subscription. Subscribe to a plan to start receiving 24/7 MOT bookings.
        </p>
        <Link
          href="/garage/subscription"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#19CA32] hover:bg-[#16b82e] text-white font-semibold text-sm transition-colors shadow-xs"
        >
          View Available Plans
        </Link>
      </div>
    );
  }

  // Computed subscription details
  const statusUpper = (currentSubscription.status || "ACTIVE").toUpperCase();
  const isActive = statusUpper === "ACTIVE" || statusUpper === "TRIALING";
  const isSuspended =
    statusUpper === "SUSPENDED" || statusUpper === "PAST_DUE";
  const isCancelled = statusUpper === "CANCELLED";

  const periodEnd =
    currentSubscription.billing?.current_period_end ||
    currentSubscription.current_period_end;
  const periodStart =
    currentSubscription.billing?.current_period_start ||
    currentSubscription.current_period_start;
  const nextBilling =
    currentSubscription.billing?.next_billing_date ||
    currentSubscription.next_billing_date ||
    periodEnd;

  const trialInfo =
    currentSubscription.trial || currentSubscription.trial_information;
  const cancellationInfo =
    currentSubscription.cancellation ||
    currentSubscription.cancellation_information;
  const promoInfo = currentSubscription.promotion;

  // Days left in current period
  const daysLeftInPeriod = periodEnd
    ? Math.max(
        0,
        Math.ceil(
          (new Date(periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header with Breadcrumb, Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <Link
            href="/garage/subscription"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subscription
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Subscription Details
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Overview of your active membership, billing schedule, and features.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="h-10 px-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/garage/invoices"
            className="h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Receipt className="w-4 h-4 text-[#19CA32]" />
            <span>View Invoices</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Plan Name & Price */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Membership Plan
            </span>
            <CreditCard className="w-4 h-4 text-[#19CA32]" />
          </div>
          <p className="text-lg font-bold text-gray-900 truncate">
            {activePlan?.name || currentSubscription.plan_name || "One simple plan"}
          </p>
          <p className="text-xs font-semibold text-gray-500 mt-1">
            {activePlan?.price_formatted ||
              currentSubscription.price_formatted ||
              "£49.99"}{" "}
            <span className="font-normal text-gray-400">/ month</span>
          </p>
        </div>

        {/* Card 2: Status */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Status
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#19CA32]" />
          </div>
          <div>
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Subscription
              </span>
            ) : isSuspended ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Suspended / Due
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Cancelled
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 truncate">
            {isCancelled
              ? `Access until ${formatDateSafe(periodEnd)}`
              : `Renews automatically`}
          </p>
        </div>

        {/* Card 3: Billing Cycle */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Current Cycle Ends
            </span>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {formatDateSafe(periodEnd)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {daysLeftInPeriod !== null
              ? `${daysLeftInPeriod} days remaining`
              : "Ongoing monthly"}
          </p>
        </div>

        {/* Card 4: Network Visibility */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Driver Visibility
            </span>
            <Eye className="w-4 h-4 text-[#19CA32]" />
          </div>
          <p className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            Live & Visible
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Accepting bookings 24/7
          </p>
        </div>
      </div>

      {/* 3. Main Content: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Plan Benefits & Billing Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* A. Plan Benefits Included */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4">
              Membership Benefits Included
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    24/7 MOT Booking Reception
                  </p>
                  <p className="text-xs text-gray-500">
                    Drivers can book appointments round the clock.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Zero Commission
                  </p>
                  <p className="text-xs text-gray-500">
                    Keep 100% of your earnings on every booking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Profile Visibility Boost
                  </p>
                  <p className="text-xs text-gray-500">
                    Highlighted in local driver search results.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Extra Service Upsells
                  </p>
                  <p className="text-xs text-gray-500">
                    Offer servicing, repairs, and tyres effortlessly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Instant Schedule Management
                  </p>
                  <p className="text-xs text-gray-500">
                    Reschedule, cancel, and manage slots anytime.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#19CA32] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Dedicated Support
                  </p>
                  <p className="text-xs text-gray-500">
                    Direct access to the SimplyMOT partner team.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* B. Billing & Period Information */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 pb-3 border-b border-gray-100 mb-4">
              Billing & Schedule Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Membership Plan
                </span>
                <span className="font-semibold text-gray-900">
                  {activePlan?.name || "One simple plan"}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Amount & Frequency
                </span>
                <span className="font-semibold text-gray-900">
                  {activePlan?.price_formatted || "£49.99"} per month
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Payment Processing
                </span>
                <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#19CA32]" />
                  Stripe Secure Checkout
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Current Period Start
                </span>
                <span className="font-semibold text-gray-900">
                  {formatDateSafe(periodStart)}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Current Period End
                </span>
                <span className="font-semibold text-gray-900">
                  {formatDateSafe(periodEnd)}
                </span>
              </div>

              <div>
                <span className="text-xs text-gray-400 font-medium block">
                  Next Renewal Date
                </span>
                <span className="font-semibold text-gray-900">
                  {formatDateSafe(nextBilling)}
                </span>
              </div>
            </div>

            {/* Active Promo Code if any */}
            {promoInfo && (
              <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#19CA32]" />
                  <div>
                    <span className="text-xs font-semibold text-emerald-900 block">
                      Promotion Applied: {promoInfo.code || "Active Discount"}
                    </span>
                    {promoInfo.active_until && (
                      <span className="text-xs text-emerald-700">
                        Active until {formatDateSafe(promoInfo.active_until)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* C. Trial Information Card (if in trial) */}
          {trialInfo?.is_trial && (
            <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold mb-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3>Trial Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-amber-700 block">
                    Days Remaining in Trial
                  </span>
                  <span className="text-base font-bold text-amber-900">
                    {trialInfo.days_remaining ?? "N/A"} days
                  </span>
                </div>
                <div>
                  <span className="text-xs text-amber-700 block">
                    Trial Ends On
                  </span>
                  <span className="text-base font-bold text-amber-900">
                    {formatDateSafe(trialInfo.trial_end)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* D. Cancellation Information Card (if cancelled but active) */}
          {cancellationInfo?.is_scheduled_for_cancellation && (
            <div className="bg-orange-50/70 rounded-2xl border border-orange-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 text-orange-800 font-bold mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3>Cancellation Scheduled</h3>
              </div>
              <p className="text-xs sm:text-sm text-orange-800 leading-relaxed">
                Your subscription is scheduled to cancel at the end of the current billing period on{" "}
                <strong>{formatDateSafe(periodEnd)}</strong>. Your garage will remain live and visible to drivers until then.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Actions & Quick Management (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
              Manage Subscription
            </h3>

            {/* Action 1: Invoices Link */}
            <Link
              href="/garage/invoices"
              className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#19CA32] flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700">
                    Invoices & Receipts
                  </p>
                  <p className="text-[11px] text-gray-500">
                    View & download PDF receipts
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
            </Link>

            {/* Action 2: Change Plan Link */}
            <Link
              href="/garage/subscription"
              className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-gray-900">
                    Subscription Plans
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Explore available membership plans
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
            </Link>

            {/* Action 3: Cancel Subscription (if active) */}
            {isActive && (
              <div className="pt-2">
                <CancelSubscription currentSubscription={currentSubscription} />
              </div>
            )}
          </div>

          {/* Partner Support Info */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200/80 p-5 text-xs text-gray-600 space-y-2">
            <h4 className="font-bold text-gray-900">Need Assistance?</h4>
            <p>
              If you have any questions regarding your billing or membership, our partner support team is here to help.
            </p>
            <p className="text-gray-500 font-mono text-[11px] pt-1">
              support@simplymot.co.uk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionDetailsPage() {
  return (
    <Suspense fallback={<SubscriptionDetailsSkeleton />}>
      <SubscriptionDetailsContent />
    </Suspense>
  );
}
