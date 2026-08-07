"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/reusable/LoadingSpinner";

interface RouteProtectionProps {
  children: React.ReactNode;
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (pathname.startsWith("/driver/book-my-mot")) {
          return;
        }

        if (pathname.startsWith("/driver")) {
          router.push("/login/driver");
        } else if (pathname.startsWith("/garage")) {
          router.push("/login/garage");
        } else if (pathname.startsWith("/admin")) {
          router.push("/admin-login");
        } else {
          router.push("/login");
        }
        return;
      }

      if (user) {
        const isDriverRoute = pathname.startsWith("/driver");
        const isGarageRoute = pathname.startsWith("/garage");
        const isAdminRoute = pathname.startsWith("/admin");

        if (isDriverRoute && user.type !== "DRIVER") {
          router.push("/unauthorized");
          return;
        }

        if (isGarageRoute && user.type !== "GARAGE") {
          router.push("/unauthorized");
          return;
        }

        if (isAdminRoute && user.type !== "ADMIN") {
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && !pathname.startsWith("/driver/book-my-mot")) {
    return <LoadingSpinner />;
  }

  if (user) {
    const isDriverRoute = pathname.startsWith("/driver");
    const isGarageRoute = pathname.startsWith("/garage");
    const isAdminRoute = pathname.startsWith("/admin");

    if (isDriverRoute && user.type !== "DRIVER") {
      return <LoadingSpinner />;
    }
    if (isGarageRoute && user.type !== "GARAGE") {
      return <LoadingSpinner />;
    }
    if (isAdminRoute && user.type !== "ADMIN") {
      return <LoadingSpinner />;
    }
  }

  return <>{children}</>;
};
