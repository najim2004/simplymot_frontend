"use client";

import React, { useEffect, useState } from "react";
import { useGetMeQuery } from "@/features/auth/api/auth.api";
import { useAppDispatch } from "@/store/hooks";
import { setLoading } from "@/features/auth/store/auth.slice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token") || localStorage.getItem("token")
      : null;

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
