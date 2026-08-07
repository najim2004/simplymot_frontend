"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useGetCurrentSubscriptionQuery } from "@/features/garage";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";

interface SubscriptionProtectionProps {
  children: React.ReactNode;
}

export const SubscriptionProtection: React.FC<SubscriptionProtectionProps> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  const protectedRoutes = [
    "/garage/pricing",
    "/garage/availability",
    "/garage/bookings",
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isGarageUser = user?.type?.toLowerCase() === "garage";

  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
  } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !isGarageUser || !isProtectedRoute || isAuthLoading,
  });

  useEffect(() => {
    if (isAuthLoading || !isGarageUser || !isProtectedRoute || isLoadingSubscription) {
      return;
    }

    const subscriptionStatus = subscriptionData?.data?.status;
    const hasActiveSubscription = subscriptionStatus === "ACTIVE";

    if (!hasActiveSubscription) {
      router.push("/garage/subscription");
    }
  }, [isAuthLoading, isGarageUser, isProtectedRoute, isLoadingSubscription, subscriptionData, router]);

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (isGarageUser && isProtectedRoute) {
    if (isLoadingSubscription) {
      return <LoadingSpinner />;
    }

    const subscriptionStatus = subscriptionData?.data?.status;
    const hasActiveSubscription = subscriptionStatus === "ACTIVE";

    if (!hasActiveSubscription) {
      return <LoadingSpinner />;
    }
  }

  return <>{children}</>;
};
