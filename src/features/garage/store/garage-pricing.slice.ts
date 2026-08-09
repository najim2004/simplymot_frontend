import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { RawMotGroup, RawService, PricingService } from "../api/garage-pricing.api";

// ─── State Shape ──────────────────────────────────────────────────────────────
export interface PricingServiceState {
  id?: string | null;
  name: string;
  price: string; // always string for form inputs
  vehicle_class?: string | null;
}

export interface AdditionalServiceState {
  id?: string | null;
  name: string;
  price: string;
}

interface PricingState {
  class4: {
    mot: PricingServiceState;
    mot_retest: PricingServiceState;
  };
  class7: {
    enabled: boolean;
    mot: PricingServiceState;
    mot_retest: PricingServiceState;
  };
  other_services: AdditionalServiceState[];
  formVersion: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyService = (name: string, vehicle_class?: string | null): PricingServiceState => ({
  id: null,
  name,
  price: "",
  vehicle_class: vehicle_class ?? null,
});

const rawToState = (svc: RawService | null | undefined, fallbackName: string): PricingServiceState => {
  if (!svc) return emptyService(fallbackName);
  return {
    id: svc.id ?? null,
    name: svc.title || fallbackName,
    price: svc.price !== null && svc.price !== undefined ? String(svc.price) : "",
    vehicle_class: svc.vehicle_class ?? null,
  };
};

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState: PricingState = {
  class4: {
    mot: emptyService("MOT Test", "Class 4"),
    mot_retest: emptyService("MOT Retest", "Class 4"),
  },
  class7: {
    enabled: false,
    mot: emptyService("Class 7 MOT Test", "Class 7"),
    mot_retest: emptyService("Class 7 MOT Retest", "Class 7"),
  },
  other_services: [],
  formVersion: 0,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    setClass4Mot(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.class4.mot = { ...state.class4.mot, ...action.payload };
    },
    setClass4Retest(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.class4.mot_retest = { ...state.class4.mot_retest, ...action.payload };
    },
    setClass7Enabled(state, action: PayloadAction<boolean>) {
      state.class7.enabled = action.payload;
      if (!action.payload) {
        state.class7.mot.price = "";
        state.class7.mot_retest.price = "";
      }
    },
    setClass7Mot(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.class7.mot = { ...state.class7.mot, ...action.payload };
    },
    setClass7Retest(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.class7.mot_retest = { ...state.class7.mot_retest, ...action.payload };
    },
    setOtherServices(state, action: PayloadAction<AdditionalServiceState[]>) {
      state.other_services = action.payload;
    },
    resetPricing() {
      return initialState;
    },

    /**
     * Load raw backend response into Redux state.
     * Backend shape: { mot_services: RawMotGroup[], other_services: RawService[] }
     * No /100 division — prices are stored as-is from backend.
     */
    loadFromBackend(
      state,
      action: PayloadAction<{
        mot_services: RawMotGroup[];
        other_services: RawService[];
      }>
    ) {
      const { mot_services, other_services } = action.payload;

      // Find Class 4 group (vehicle_class is "Class 4" or null = default)
      const class4Group =
        mot_services.find(
          (g) =>
            g.vehicle_class === "Class 4" ||
            g.vehicle_class === null ||
            g.vehicle_class === undefined
        ) ?? null;

      // Find Class 7 group
      const class7Group =
        mot_services.find((g) => g.vehicle_class === "Class 7") ?? null;

      state.class4 = {
        mot: rawToState(class4Group?.mot, "MOT Test"),
        mot_retest: rawToState(class4Group?.mot_retest, "MOT Retest"),
      };

      if (class7Group) {
        state.class7 = {
          enabled: true,
          mot: rawToState(class7Group.mot, "Class 7 MOT Test"),
          mot_retest: rawToState(class7Group.mot_retest, "Class 7 MOT Retest"),
        };
      } else {
        state.class7 = {
          enabled: false,
          mot: emptyService("Class 7 MOT Test", "Class 7"),
          mot_retest: emptyService("Class 7 MOT Retest", "Class 7"),
        };
      }

      state.other_services = (other_services || []).map((svc) => ({
        id: svc.id ?? null,
        name: svc.title || "",
        price: svc.price !== null && svc.price !== undefined ? String(svc.price) : "",
      }));

      state.formVersion += 1;
    },
  },
});

export const {
  setClass4Mot,
  setClass4Retest,
  setClass7Enabled,
  setClass7Mot,
  setClass7Retest,
  setOtherServices,
  resetPricing,
  loadFromBackend,
} = pricingSlice.actions;

export const selectPricing = (state: RootState) => state.pricing;

export default pricingSlice.reducer;
