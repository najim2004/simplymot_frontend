"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, setLoading, logout as logoutAction, User } from "../store/auth.slice";
import { useLoginMutation, useLazyGetMeQuery } from "../api/auth.api";
import { resetReduxStore } from "@/lib/resetReduxStore";

interface LoginResult {
  success: boolean;
  message: string;
  userType?: string;
}

const validateApiEndpoint = (): boolean => {
  return !!(process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_ENDPOINT);
};

const createUserFromResponse = (userDetails: any): User => {
  return {
    id: userDetails.data.id,
    email: userDetails.data.email,
    name: userDetails.data.name,
    type: userDetails.data.type,
    avatar_url: userDetails.data.avatar_url || undefined,
    garage_name: userDetails.data.garage_name || undefined,
  };
};

const createFallbackUser = (email: string, type: "DRIVER" | "GARAGE" | "ADMIN"): User => {
  return {
    id: "temp-id",
    email: email,
    name: "User",
    type: type,
  };
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);

  const [login] = useLoginMutation();
  const [triggerAuthMe] = useLazyGetMeQuery();

  const loginWithType = async (
    email: string,
    password: string,
    expectedType: "DRIVER" | "GARAGE" | "ADMIN",
  ): Promise<LoginResult> => {
    try {
      dispatch(setLoading(true));

      if (!validateApiEndpoint()) {
        return {
          success: false,
          message:
            "API endpoint not configured. Please check your environment variables.",
        };
      }

      const loginResponse = await login({
        email,
        password,
        type: expectedType,
      } as any).unwrap();

      if (loginResponse.authorization?.token) {
        localStorage.setItem("token", loginResponse.authorization.token);
      }

      let userDetails = null;
      try {
        userDetails = await triggerAuthMe().unwrap();
      } catch (authMeError) {
        console.warn("AuthMeApi failed, using fallback user data");
      }

      const userObj = userDetails
        ? createUserFromResponse(userDetails)
        : createFallbackUser(email, expectedType);

      dispatch(setUser(userObj));

      return {
        success: true,
        message: "Login successful",
        userType: expectedType,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.data?.message || error.message || "Login failed",
      };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = (): void => {
    resetReduxStore();
    localStorage.removeItem("token");
    dispatch(logoutAction());
  };

  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(setUser(null));
        return;
      }

      const userDetails = await triggerAuthMe().unwrap();
      dispatch(setUser(createUserFromResponse(userDetails)));
    } catch (error) {
      localStorage.removeItem("token");
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const isDriver = () => user?.type === "DRIVER";
  const isGarage = () => user?.type === "GARAGE";
  const isAdmin = () => user?.type === "ADMIN";

  return {
    user,
    isLoading,
    isAuthenticated,
    loginWithType,
    logout,
    checkAuth,
    isDriver,
    isGarage,
    isAdmin,
  };
};
