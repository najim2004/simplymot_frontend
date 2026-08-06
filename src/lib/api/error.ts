import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getApiErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return "An unknown error occurred.";
  if ("status" in error) {
    if (typeof error.data === "object" && error.data !== null && "message" in error.data) {
      return String((error.data as { message: string }).message);
    }
    return `Error ${error.status}`;
  }
  return error.message || "An error occurred.";
}
