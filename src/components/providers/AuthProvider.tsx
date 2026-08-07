"use client";

import React, { useEffect, useState } from "react";
import { useGetMeQuery } from "@/features/auth/api/auth.api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("access_token")
      : null;

  // Automatically fetch getMe on initial website load if token exists
  useGetMeQuery(undefined, {
    skip: !mounted || !token,
  });

  return <>{children}</>;
}
