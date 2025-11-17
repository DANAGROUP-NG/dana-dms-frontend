import { apiSlice } from "./apiSlice"

export interface RoleDto {
  id: string
  name: string
  description?: string
  capabilities: string[]
  orgUnitId: string
}

export const rolesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listRoles: builder.query<RoleDto[], { orgUnitId?: string } | void>({
      query: (args) => ({ url: "/roles", params: args?.orgUnitId ? { orgUnitId: args.orgUnitId } : undefined }),
      providesTags: ["User"],
    }),
    createRole: builder.mutation<RoleDto, Omit<RoleDto, "id">>({
      query: (body) => ({ url: "/roles", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    updateRole: builder.mutation<RoleDto, { id: string; updates: Partial<RoleDto> }>({
      query: ({ id, updates }) => ({ url: `/roles/${id}`, method: "PUT", body: updates }),
      invalidatesTags: ["User"],
    }),
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({ url: `/roles/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
})

export const { useListRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } = rolesApi


