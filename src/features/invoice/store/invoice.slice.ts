import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { InvoiceDetail, Invoice } from "../types";

export interface InvoiceState {
  selectedInvoice: InvoiceDetail | Invoice | null;
  filters: {
    search: string;
    status: string;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
}

const initialState: InvoiceState = {
  selectedInvoice: null,
  filters: {
    search: "",
    status: "all",
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setSelectedInvoice: (
      state,
      action: PayloadAction<InvoiceDetail | Invoice | null>,
    ) => {
      state.selectedInvoice = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    resetInvoiceFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
  },
});

export const {
  setSelectedInvoice,
  setSearchTerm,
  setStatusFilter,
  setCurrentPage,
  setItemsPerPage,
  resetInvoiceFilters,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
