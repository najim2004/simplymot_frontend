"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  TCreateSubscription,
  useCreateASubscriptionMutation,
  useGetAllSubscriptionsQuery,
} from "@/features/admin";
import CustomReusableModal from "@/components/reusable/Dashboard/Modal/CustomReusableModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Skeleton } from "@/components/ui/skeleton";

const PLAN_FEATURES = [
  {
    icon: Package,
    text: "Unlimited opportunity to receive MOT bookings 24/7.",
  },
  { icon: ShoppingCart, text: "Boost your garage's visibility." },
  {
    icon: FileText,
    text: "Opportunity to upsell and offer extra services!",
  },
  { icon: TrendingUp, text: "No contract. No commission." },
  { icon: Package, text: "Simple set up." },
];

const formatPlanPrice = (subscription: {
  price_pence?: number;
  price_formatted?: string;
  currency?: string;
}) => {
  const currency =
    subscription.currency === "GBP" || !subscription.currency
      ? "£"
      : subscription.currency;

  if (
    typeof subscription.price_pence === "number" &&
    subscription.price_pence > 0
  ) {
    const numeric = subscription.price_pence / 100;
    const amount = numeric % 1 === 0 ? `${numeric}` : numeric.toFixed(2);
    return { currency, amount };
  }

  const raw =
    subscription.price_formatted?.replace(/^[^\d]*/, "") || "50";
  const amount = raw.endsWith(".00") ? raw.slice(0, -3) : raw;
  return { currency, amount };
};

function PlanCardSkeleton() {
  return (
    <div className="relative flex w-full max-w-115 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col items-center space-y-3 p-8 pb-6 text-center">
        <Skeleton className="h-7 w-48 rounded-md" />
        <div className="my-2 flex items-baseline justify-center gap-1">
          <Skeleton className="h-14 w-28 rounded-md" />
        </div>
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-12 w-full max-w-70 rounded-xl" />
      </div>

      <div className="w-full border-t border-gray-200" />

      <div className="space-y-6 p-8 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full rounded" />
          <Skeleton className="h-3.5 w-5/6 rounded" />
          <Skeleton className="h-3.5 w-4/6 rounded" />
        </div>
        <div>
          <Skeleton className="mb-4 h-5 w-24 rounded" />
          <div className="space-y-3.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPlanCard({
  subscription,
  onViewDetails,
}: {
  subscription: any;
  onViewDetails: (id: string) => void;
}) {
  const { currency, amount } = formatPlanPrice(subscription);
  const isActive = Boolean(subscription.is_active);

  return (
    <div
      className={`relative flex w-full max-w-115 flex-col rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        isActive
          ? "border-green-500 ring-2 ring-green-100"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
        <span
          className={`rounded-full px-4 py-1 text-xs font-semibold whitespace-nowrap shadow-xs ${
            isActive
              ? "bg-[#19CA32] text-white"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex flex-col items-center p-8 pb-6 text-center">
        <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          {subscription.name || "One Simple Plan"}
        </h3>

        <div className="my-4 flex items-baseline justify-center">
          <span className="mr-0.5 text-3xl font-bold text-gray-900 sm:text-4xl">
            {currency}
          </span>
          <span className="text-6xl font-extrabold tracking-tight text-gray-900 sm:text-7xl">
            {amount}
          </span>
        </div>

        <p className="mb-6 text-base font-medium text-gray-500">/month</p>

        <button
          type="button"
          onClick={() => onViewDetails(subscription.id)}
          className="flex w-full max-w-70 cursor-pointer items-center justify-center rounded-xl bg-[#19CA32] px-6 py-3.5 text-center text-base font-semibold text-white shadow-xs transition-all duration-200 hover:bg-green-600 hover:shadow-md active:scale-[0.98]"
        >
          View Details
        </button>
      </div>

      <div className="w-full border-t border-gray-200" />

      <div className="space-y-6 p-8 pt-6">
        <p className="text-center text-sm leading-relaxed text-gray-600 sm:text-left">
          {subscription.description ||
            "We believe in fairness & transparency - no hidden fees, no contracts, no commission, and no confusing tiers. Just full access for one simple price."}
        </p>

        <div>
          <h4 className="mb-4 text-left text-base font-semibold text-gray-900">
            Features
          </h4>
          <div className="space-y-3.5">
            {PLAN_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <feature.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#19CA32]" />
                <span className="text-sm leading-snug text-gray-700">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionsManagement() {
  const router = useRouter();

  const allSubscriptions = useGetAllSubscriptionsQuery({
    page: 1,
    limit: 1000,
  });

  const handleViewDetails = (id: string) => {
    router.push(`/admin/subscriptions-management/${id}`);
  };

  const [createSubscription, { isLoading }] = useCreateASubscriptionMutation();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<TCreateSubscription>();

  const onSubmit = async (data: TCreateSubscription) => {
    try {
      const payload = {
        name: "One Simple Plan",
        description: "One Simple Plan",
        price_pence: Number(data.price_pence),
        max_bookings_per_month: 1000,
        max_vehicles: 1000,
      };

      await createSubscription(payload).unwrap();
      toast.success("Subscription created successfully!");

      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create subscription.");
    }
  };

  const subscriptions = allSubscriptions?.data?.data || [];

  return (
    <>
      {subscriptions.length === 0 && !allSubscriptions.isLoading && (
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Subscription Management
          </h1>
          <Button
            onClick={() => setOpen(true)}
            className="h-11 cursor-pointer bg-[#19CA32] px-4 text-sm font-semibold text-white hover:bg-green-600"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Subscription
          </Button>
        </div>
      )}

      <CustomReusableModal
        isOpen={open}
        onClose={() => {
          if (isLoading) return;
          setOpen(false);
          reset();
        }}
        title="Add Subscription"
        showHeader={false}
        hideClose={true}
        className="flex max-w-md flex-col"
        contentClassName="flex min-h-0 flex-col overflow-hidden p-0"
      >
        <div className="flex flex-col overflow-hidden rounded-lg bg-white">
          <div className="flex shrink-0 items-center justify-between bg-linear-to-r from-[#19CA32] to-[#16b82e] px-5 py-4 text-white shadow-md">
            <div>
              <h2 className="text-lg font-semibold">Add Subscription</h2>
              <p className="mt-0.5 text-xs text-white/90">
                Create a new garage subscription plan
              </p>
            </div>
            <Package className="h-5 w-5 opacity-90" />
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 p-5"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="price_pence"
                className="text-sm font-medium text-gray-700"
              >
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price_pence"
                type="number"
                {...register("price_pence", { required: true, min: 0 })}
                placeholder="Subscription price (£)"
                className="h-11 text-sm focus-visible:border-[#19CA32] focus-visible:ring-[#19CA32]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 cursor-pointer rounded-lg bg-linear-to-r from-[#19CA32] to-[#16b82e] font-semibold text-white shadow-md hover:opacity-95"
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                disabled={isLoading}
                className="h-11 cursor-pointer rounded-lg font-semibold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </CustomReusableModal>

      <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center px-4 py-6 sm:py-10">
        {allSubscriptions.isLoading ? (
          <div className="flex w-full flex-wrap items-stretch justify-center gap-6">
            <PlanCardSkeleton />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
            <Inbox className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              No Plans Available
            </h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Create your first subscription plan to get started.
            </p>
          </div>
        ) : (
          <div className="flex w-full flex-wrap items-stretch justify-center gap-6">
            {subscriptions.map((subscription: any) => (
              <AdminPlanCard
                key={subscription.id}
                subscription={subscription}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
