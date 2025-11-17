import { apiSlice } from "./apiSlice"

export interface Membership {
  id?: string
  orgUnitId: string
  roleIds: string[]
  primary?: boolean
}

export interface UserDto {
  id: string
  email: string
  fullName: string
  phone?: string
  isActive: boolean
  memberships?: Membership[]
}

export interface CreateUserInput {
  email: string
  fullName: string
  phone?: string
  initialPassword?: string
  orgUnitId: string
  roleIds: string[]
  primary?: boolean
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<UserDto[], { orgUnitId?: string } | void>({
      query: (args) => ({ url: "/users", params: args?.orgUnitId ? { orgUnitId: args.orgUnitId } : undefined }),
      providesTags: ["User"],
    }),

    getUser: builder.query<UserDto, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<{ user: UserDto; initialPassword?: string }, CreateUserInput>({
      query: (body) => ({ url: "/users", method: "POST", body }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation<UserDto, { id: string; updates: Partial<UserDto> }>({
      query: ({ id, updates }) => ({ url: `/users/${id}`, method: "PATCH", body: updates }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "User", id }],
    }),

    setUserPassword: builder.mutation<{ success: boolean }, { id: string; password: string }>({
      query: ({ id, password }) => ({ url: `/users/${id}/password`, method: "POST", body: { password } }),
    }),

    addMembership: builder.mutation<Membership, { id: string; membership: Membership }>({
      query: ({ id, membership }) => ({ url: `/users/${id}/memberships`, method: "POST", body: membership }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "User", id }],
    }),
  }),
})

export const {
  useListUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useSetUserPasswordMutation,
  useAddMembershipMutation,
} = usersApi


