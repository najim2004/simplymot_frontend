import { store } from "@/store";
import { apiSlice } from "@/lib/api/api-slice";
import { logout } from "@/features/auth";

/**
 * Resets all Redux state including RTK Query cache
 * Call this function on logout to prevent data leakage between users
 */
export const resetReduxStore = (): void => {
  // Reset central RTK Query API cache
  store.dispatch(apiSlice.util.resetApiState());

  // Dispatch logout action to reset all slices (via rootReducer)
  store.dispatch(logout());
};
