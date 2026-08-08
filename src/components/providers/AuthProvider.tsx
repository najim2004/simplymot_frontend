"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetMeQuery } from "@/features/auth/api/auth.api";
import { useAppDispatch } from "@/store/hooks";
import { setLoading } from "@/features/auth/store/auth.slice";
import { getCookie } from "@/lib/cookies";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const token = getCookie("access_token");

  // Reactive redirect when token is missing/cleared on protected routes
  useEffect(() => {
    if (!mounted) return;

    const isPublicRoute =
      pathname.startsWith("/driver/book-my-mot") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/create-account") ||
      pathname.startsWith("/admin-login") ||
      pathname === "/";

    if (!token && !isPublicRoute) {
      if (pathname.startsWith("/driver")) {
        router.push("/login/driver");
      } else if (pathname.startsWith("/garage")) {
        router.push("/login/garage");
      } else if (pathname.startsWith("/admin")) {
        router.push("/admin-login");
      }
    }
  }, [mounted, token, pathname, router]);

  // Automatically fetch getMe on initial website load if token exists
  const { isLoading, isFetching } = useGetMeQuery(undefined, {
    skip: !mounted || !token,
  });

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      dispatch(setLoading(false));
    } else if (isLoading || isFetching) {
      dispatch(setLoading(true));
    }
  }, [mounted, token, isLoading, isFetching, dispatch]);

  return <>{children}</>;
}
