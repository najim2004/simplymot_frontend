import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import type { PricingResponsePayload } from "../../api/garage/pricingApis";

export interface PricingServiceState {
  id?: string | null;
  name: string;
  price: string;
}

export interface AdditionalServiceState {
  id?: string | null;
  name: string;
  price?: string | null;
}

interface PricingState {
  mot: PricingServiceState;
  retest: PricingServiceState;
  class7: {
    enabled: boolean;
    mot: PricingServiceState;
    retest: PricingServiceState;
  };
  additionals: AdditionalServiceState[];
  formVersion: number;
}

const initialServiceState: PricingServiceState = {
  name: "",
  price: "",
};

const initialState: PricingState = {
  mot: { ...initialServiceState, name: "MOT Test" },
  retest: { ...initialServiceState, name: "MOT Retest" },
  class7: {
    enabled: false,
    mot: { ...initialServiceState, name: "Class 7 MOT Test" },
    retest: { ...initialServiceState, name: "Class 7 MOT Retest" },
  },
  additionals: [],
  formVersion: 0,
};

const pricingSlice = createSlice({
  name: "pricing",
  initialState,
  reducers: {
    setMot(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.mot = { ...state.mot, ...action.payload };
    },
    setRetest(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.retest = { ...state.retest, ...action.payload };
    },
    setClass7Enabled(state, action: PayloadAction<boolean>) {
      state.class7.enabled = action.payload;
      if (!action.payload) {
        state.class7.mot.price = "";
        state.class7.retest.price = "";
      }
    },
    setClass7Mot(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.class7.mot = { ...state.class7.mot, ...action.payload };
    },
    setClass7Retest(state, action: PayloadAction<Partial<PricingServiceState>>) {
      state.class7.retest = { ...state.class7.retest, ...action.payload };
    },
    setAdditionals(state, action: PayloadAction<AdditionalServiceState[]>) {
      state.additionals = action.payload;
    },
    resetPricing() {
      return initialState;
    },
    setPricingFromResponse(state, action: PayloadAction<PricingResponsePayload>) {
      const { mot, retest, additionals } = action.payload;
      const class4Mot = action.payload.class4?.mot || mot;
      const class4Retest = action.payload.class4?.retest || retest;
      const class7Mot = action.payload.class7?.mot;
      const class7Retest = action.payload.class7?.retest;
      
      // Handle mot with null/undefined checks
      if (class4Mot) {
        state.mot = {
          id: class4Mot.id ?? null,
          name: class4Mot.name || "MOT Test",
          price: class4Mot.price ? String(class4Mot.price) : "",
        };
      }
      
      // Handle retest with null/undefined checks
      if (class4Retest) {
        state.retest = {
          id: class4Retest.id ?? null,
          name: class4Retest.name || "MOT Retest",
          price: class4Retest.price || class4Retest.price === 0 ? String(class4Retest.price) : "",
        };
      }

      state.class7 = {
        enabled: Boolean(action.payload.class7?.enabled || class7Mot || class7Retest),
        mot: {
          id: class7Mot?.id ?? null,
          name: class7Mot?.name || "Class 7 MOT Test",
          price: class7Mot?.price ? String(class7Mot.price) : "",
        },
        retest: {
          id: class7Retest?.id ?? null,
          name: class7Retest?.name || "Class 7 MOT Retest",
          price: class7Retest?.price || class7Retest?.price === 0 ? String(class7Retest.price) : "",
        },
      };
      
      // Handle additionals with null/undefined checks
      if (additionals && Array.isArray(additionals)) {
        state.additionals = additionals.map((service) => ({
          id: service?.id ?? null,
          name: service?.name || "",
          price: service?.price ? String(service.price) : "",
        }));
      } else {
        state.additionals = [];
      }
      
      state.formVersion += 1;
    },
  },
});

export const {
  setMot,
  setRetest,
  setClass7Enabled,
  setClass7Mot,
  setClass7Retest,
  setAdditionals,
  resetPricing,
  setPricingFromResponse,
} = pricingSlice.actions;

export const selectPricing = (state: RootState) => state.pricing;

export default pricingSlice.reducer;
