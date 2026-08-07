"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useAppDispatch } from "@/store/hooks";
import { useLazyGetMeQuery } from "@/features/auth/api/auth.api";
import { setUser, setLoading } from "@/features/auth/store/auth.slice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [triggerGetMe] = useLazyGetMeQuery();

  useEffect(() => {
    const initAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        dispatch(setUser(null));
        return;
      }

      try {
        const userDetails = await triggerGetMe().unwrap();
        if (userDetails?.data) {
          const data: any = userDetails.data;
          dispatch(
            setUser({
              id: data.id,
              email: data.email,
              name: data.name,
              type: data.type as any,
              avatar_url: data.avatar_url || data.avatar || undefined,
              garage_name: data.garage_name || undefined,
            })
          );
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch, triggerGetMe]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}

export { Providers as ReduxProvider };
