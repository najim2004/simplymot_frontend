import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ApiVehicle } from "../types";

export interface VehicleState {
  selectedVehicle: ApiVehicle | null;
  filters: {
    search: string;
    motStatus: string; // 'all' | 'valid' | 'expired'
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
}

const initialState: VehicleState = {
  selectedVehicle: null,
  filters: {
    search: "",
    motStatus: "all",
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    setSelectedVehicle: (state, action: PayloadAction<ApiVehicle | null>) => {
      state.selectedVehicle = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1;
    },
    setMotStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.motStatus = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    resetVehicleFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
  },
});

export const {
  setSelectedVehicle,
  setSearchTerm,
  setMotStatusFilter,
  setCurrentPage,
  setItemsPerPage,
  resetVehicleFilters,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
