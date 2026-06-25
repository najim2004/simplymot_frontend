import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseApi";
import { PAGINATION_CONFIG } from "../../../../config/pagination.config";

export interface ReviewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startdate?: string;
  enddate?: string;
}

export const reviewsManagementApi = createApi({
  reducerPath: "reviewsManagementApi",
  baseQuery,
  tagTypes: ["Reviews"],
  endpoints: (builder) => ({
    getEligibleReviews: builder.query<any, ReviewsQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString(),
        );
        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString(),
        );
        if (params.search) queryParams.append("search", params.search);
        if (params.startdate) queryParams.append("startdate", params.startdate);
        if (params.enddate) queryParams.append("enddate", params.enddate);
        return {
          url: `/api/admin/reviews?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Reviews"],
    }),
    sendReviewRequest: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/admin/reviews/${id}/send`,
        method: "POST",
      }),
      invalidatesTags: ["Reviews"],
    }),
    dismissReviewRequest: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/admin/reviews/${id}/dismiss`,
        method: "POST",
      }),
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const {
  useGetEligibleReviewsQuery,
  useSendReviewRequestMutation,
  useDismissReviewRequestMutation,
} = reviewsManagementApi;
