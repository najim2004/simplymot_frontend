import { combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "@/lib/api/api-slice";
import authReducer from "@/features/auth/store/auth.slice";
import subscriptionReducer from "@/features/subscriptions/store/subscription.slice";
import usersManagementReducer from "@/features/admin/store/users-management.slice";
import roleManagementReducer from "@/features/admin/store/role-management.slice";
import bookingManagementReducer from "@/features/admin/store/booking-management.slice";
import pricingReducer from "@/features/garage/store/garage-pricing.slice";
import bookMyMotReducer from "@/features/driver/store/driver-book-mot.slice";

const appReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  subscription: subscriptionReducer,
  usersManagement: usersManagementReducer,
  roleManagement: roleManagementReducer,
  bookingManagement: bookingManagementReducer,
  pricing: pricingReducer,
  bookMyMot: bookMyMotReducer,
});

export const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: any,
) => {
  if (action.type === "auth/logout") {
    state = undefined;
  }
  return appReducer(state, action);
};

export type RootState = ReturnType<typeof appReducer>;
