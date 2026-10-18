import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Booking } from "../types";

export interface BookingState {
  selectedBooking: Booking | null;
  filters: {
    search: string;
    status: string;
    fromDate: string | null;
    toDate: string | null;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
}

const initialState: BookingState = {
  selectedBooking: null,
  filters: {
    search: "",
    status: "all",
    fromDate: null,
    toDate: null,
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.pagination.currentPage = 1;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ fromDate: string | null; toDate: string | null }>,
    ) => {
      state.filters.fromDate = action.payload.fromDate;
      state.filters.toDate = action.payload.toDate;
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    resetBookingFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
  },
});

export const {
  setSelectedBooking,
  setSearchTerm,
  setStatusFilter,
  setDateRange,
  setCurrentPage,
  setItemsPerPage,
  resetBookingFilters,
} = bookingSlice.actions;

export default bookingSlice.reducer;
