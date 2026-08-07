import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_ENDPOINT,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token") || localStorage.getItem("token")
        : null;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
