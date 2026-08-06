import { apiSlice } from '@/lib/api/api-slice';
import { PAGINATION_CONFIG } from '@/config/pagination.config';

export interface Permission {
  id: string;
  title: string;
  action: string;
  subject: string;
}

export interface Role {
  id: string;
  name: string;
  title?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  permission_count?: number;
  permissions?: Permission[];
}

export interface RoleStatistics {
  id: string;
  title: string;
  name: string;
  user_count: number;
  permission_count: number;
}

export interface StatisticsData {
  summary: {
    total_roles: number;
    system_roles: number;
    custom_roles: number;
    total_users: number;
    total_permissions: number;
  };
  system_roles: RoleStatistics[];
  custom_roles: RoleStatistics[];
}

export const roleManagementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRole: builder.mutation<{ success: boolean; data: Role }, { name: string; title: string }>({
      query: (body) => ({
        url: '/api/admin/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Role'],
    }),

    getRoles: builder.query<{ success: boolean; data: { roles: Role[]; pagination?: any } }, { page?: number; limit?: number } | void>({
      query: (arg) => {
        const params = arg || {};
        const page = params.page || PAGINATION_CONFIG.DEFAULT_PAGE;
        const limit = params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT;
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        return {
          url: `/api/admin/roles?${queryParams.toString()}`,
        };
      },
      providesTags: ['Role'],
    }),

    getRoleById: builder.query<{ success: boolean; data: Role }, string>({
      query: (id) => `/api/admin/roles/${id}`,
      providesTags: ['Role'],
    }),

    assignPermissionsToRole: builder.mutation<
      { success: boolean; data: Role }, 
      { id: string; mode: 'assign' | 'remove' | 'replace'; permission_ids: string[] }>({
      query: ({ id, mode, permission_ids }) => ({
        url: `/api/admin/roles/${id}/permissions`,
        method: 'POST',
        body: { mode, permission_ids },
      }),
      invalidatesTags: ['Role'],
    }),

    updateRole: builder.mutation<{ success: boolean; data: Role }, { id: string; name: string; title: string }>({
      query: (body) => ({
        url: `/api/admin/roles/${body.id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Role'],
    }),

    deleteRole: builder.mutation<{ success: boolean; data: Role }, string>({
      query: (id) => ({
        url: `/api/admin/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    getStatisticsData: builder.query<{ success: boolean; data: StatisticsData }, void>({
      query: () => '/api/admin/roles/statistics',
      providesTags: ['Role'],
    }),

    getPermissions: builder.query<{ success: boolean; data: { permissions: Permission[] } }, void>({
      query: () => '/api/admin/roles/permissions',
      providesTags: ['Role'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionsToRoleMutation,
  useGetStatisticsDataQuery,
  useGetPermissionsQuery
} = roleManagementApi;
