import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

export interface VehicleData {
  registration_number: string;
  make: string;
  model: string;
  color: string;
  fuel_type: string;
  mot_expiry_date: string;
  exists_in_account: boolean;
  vehicle_id: string;
}

export interface GarageData {
  id: string;
  garage_name: string;
  address: string;
  postcode: string;
  vts_number: string;
  primary_contact: string;
  phone_number: string;
  avatar?: string;
  email?: string;
  distance_miles?: number;
  mot_price?: number;
  has_class7?: boolean;
}

interface BookMyMotState {
  pendingBooking: {
    slot_id?: string;
    garage_id: string;
    vehicle_registration_number: string;
    start_time?: string;
    end_time?: string;
    date?: string;
    service_type: "MOT";
    expires_at: string;
    garage_name?: string;
    garage_address?: string;
  };
}

const initialState: BookMyMotState = {
  pendingBooking: {
    slot_id: "",
    garage_id: "",
    vehicle_registration_number: "",
    start_time: "",
    end_time: "",
    date: "",
    service_type: "MOT",
    expires_at: "",
    garage_name: "",
    garage_address: "",
  },
};

const bookMyMotSlice = createSlice({
  name: "bookMyMot",
  initialState,
  reducers: {
    setPendingBooking(
      state,
      action: PayloadAction<BookMyMotState["pendingBooking"]>
    ) {
      state.pendingBooking = action.payload;
    },
  },
});

export const { setPendingBooking } = bookMyMotSlice.actions;

export const selectPendingBooking = (state: RootState) =>
  state.bookMyMot.pendingBooking;

export default bookMyMotSlice.reducer;
