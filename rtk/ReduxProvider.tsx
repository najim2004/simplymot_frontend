"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, []);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>{children}</AuthInitializer>
      </QueryClientProvider>
    </Provider>
  );
}
