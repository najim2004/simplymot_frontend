import { apiSlice } from "@/lib/api/api-slice";
import { PAGINATION_CONFIG } from "@/config/pagination.config";
import type {
  User,
  UsersResponse,
  CreateUserResponse,
  AssignRoleResponse,
  UserDetailsResponse,
} from "@/types";

export const usersManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation<
      CreateUserResponse,
      {
        email: string;
        password: string;
        name: string;
        type: string;
        role_ids: string[];
      }
    >({
      query: ({ type, ...body }) => ({
        url: `/api/admin/users`,
        method: "POST",
        body: {
          ...body,
          kind: type.toUpperCase(),
        },
      }),
      invalidatesTags: ["User"],
    }),

    getUsers: builder.query<
      UsersResponse,
      {
        status?: string;
        q?: string;
        type?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.status && params.status !== "all") {
          queryParams.append("status", params.status.toUpperCase());
        }

        if (params.q && params.q.trim()) {
          queryParams.append("search", params.q);
        }

        if (params.type && params.type.trim()) {
          queryParams.append("kind", params.type.toUpperCase());
        }

        queryParams.append(
          "page",
          (params.page || PAGINATION_CONFIG.DEFAULT_PAGE).toString(),
        );

        queryParams.append(
          "limit",
          (params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT).toString(),
        );

        return {
          url: `/api/admin/users?${queryParams.toString()}`,
        };
      },
      transformResponse: (response: any) => {
        const usersList = response?.data || [];
        const total = response?.meta_data?.total || 0;
        const page = response?.meta_data?.page || 1;
        const limit = response?.meta_data?.limit || 10;
        const totalPages = Math.ceil(total / limit) || 1;

        return {
          success: true,
          data: usersList,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
          statistics: {
            total_users: total,
            active_users: usersList.filter((u: any) => u.status === "ACTIVE").length,
            pending_users: usersList.filter((u: any) => u.status === "PENDING").length,
            banned_users: usersList.filter((u: any) => u.status === "BANNED").length,
          }
        } as any;
      },
      providesTags: ["User"],
    }),

    getUserActivity: builder.query<
      any,
      {
        userId: string;
        period?: "day" | "week" | "month" | "year";
        page?: number;
        limit?: number;
      }
    >({
      queryFn: async () => {
        return {
          data: {
            success: true,
            data: {
              period: "week",
              range: { from: new Date().toISOString(), to: new Date().toISOString() },
              summary: {
                total_time_seconds: 0,
                total_time_formatted: "0m",
                total_sessions: 0,
                avg_session_seconds: 0,
                avg_session_formatted: "0m",
                longest_session_seconds: 0,
                longest_session_formatted: "0m",
                most_active_hour: null,
                most_active_hour_label: null,
                most_active_day: null,
                currently_online: false,
              },
              daily_breakdown: [],
              hourly_distribution: [],
              sessions: [],
              sessions_pagination: {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 1,
              },
            },
          },
        };
      },
    }),

    getUserById: builder.query<UserDetailsResponse, string>({
      query: (id) => `/api/admin/users/${id}`,
      providesTags: ["User"],
    }),

    updateUser: builder.mutation<
      { success?: boolean; message?: string } | void,
      | {
          id: string;
          name?: string;
          email?: string;
          phone_number?: string;
          type?: string;
        }
      | FormData
    >({
      query: (arg) => {
        if (arg instanceof FormData) {
          const id = arg.get("id") as string;
          arg.delete("id");
          return {
            url: `/api/admin/users/${id}`,
            method: "PATCH",
            body: arg,
          };
        }
        const { id, ...body } = arg;
        return {
          url: `/api/admin/users/${id}`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["User"],
    }),

    banUser: builder.mutation<
      { success?: boolean; message?: string } | void,
      { id: string; reason?: string }
    >({
      query: ({ id, reason = "" }) => ({
        url: `/api/admin/users/${id}/ban`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["User"],
    }),

    unbanUser: builder.mutation<
      { success?: boolean; message?: string } | void,
      string
    >({
      query: (id) => ({
        url: `/api/admin/users/${id}/unban`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    assignRoleToUser: builder.mutation<
      AssignRoleResponse,
      { id: string; role_ids: string[] }
    >({
      queryFn: async () => {
        return { data: { success: true, message: "Roles assigned successfully (simulation)" } as any };
      },
      invalidatesTags: ["User"],
    }),

    removeRoleFromUser: builder.mutation<
      { success?: boolean; message?: string } | void,
      { id: string; role_id: string }
    >({
      queryFn: async () => {
        return { data: { success: true, message: "Role removed successfully (simulation)" } };
      },
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateUserMutation,
  useUpdateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserActivityQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useAssignRoleToUserMutation,
  useRemoveRoleFromUserMutation,
} = usersManagementApi;
