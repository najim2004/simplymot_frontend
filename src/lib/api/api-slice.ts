import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base-query";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Auth",
    "Garage",
    "Driver",
    "Admin",
    "Notification",
    "Subscription",
    "Contact",
    "Booking",
    "Vehicle",
    "Invoice",
    "Review",
    "User",
    "Role",
    "Schedule",
    "Pricing",
    "Holidays",
    "Slots",
    "GarageSlot",
  ],
  endpoints: () => ({}),
});
