// This slice previously held a pendingBooking state for the guest booking flow.
// That flow now uses URL query parameters (bk_* params) instead of Redux state,
// so this slice is kept minimal to avoid breaking existing imports.

import { createSlice } from "@reduxjs/toolkit";

const bookMyMotSlice = createSlice({
  name: "bookMyMot",
  initialState: {},
  reducers: {},
});

export default bookMyMotSlice.reducer;
