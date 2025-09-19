import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  tenantMemberships: TenantMembership[]
}

export interface TenantMembership {
  tenantId: string
  role: "admin" | "manager" | "user"
  permissions: string[]
}

export interface Tenant {
  id: string
  name: string
  type: "group" | "subsidiary" | "location" | "department"
  parentId?: string
  children?: Tenant[]
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  currentTenant: Tenant | null
  tenantHierarchy: Tenant[]
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  currentTenant: null,
  tenantHierarchy: [],
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.currentTenant = null
    },
    setCurrentTenant: (state, action: PayloadAction<Tenant>) => {
      state.currentTenant = action.payload
    },
    setTenantHierarchy: (state, action: PayloadAction<Tenant[]>) => {
      state.tenantHierarchy = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, logout, setCurrentTenant, setTenantHierarchy, setLoading } = authSlice.actions

export default authSlice.reducer
