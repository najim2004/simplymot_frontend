import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GarageItem, RoleItem, SubscriptionItem } from "../types/auth.types";
import { removeCookie } from "@/lib/cookies";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  phone_number?: string | null;
  kind?: string;
  type?: string;
  garages?: GarageItem[];
  created_at?: string;
  email_verified_at?: string | null;
  status?: string;
  roles?: RoleItem[];
  subscription?: SubscriptionItem | null;
  primary_contact?: string | null;
  garage_name?: string | null;
  vts_number?: string | null;
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      removeCookie("access_token");
      removeCookie("user_kind");
    },
  },
});

export const { setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
