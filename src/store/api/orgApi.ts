import { apiSlice } from "./apiSlice"

export interface OrgUnitDto {
  id: string
  name: string
  type: 'GROUP' | 'SUBSIDIARY' | 'LOCATION' | 'DEPARTMENT'
  parentId?: string
  tenantPath: string[]
}

export const orgApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listOrgUnits: builder.query<OrgUnitDto[], void>({
      query: () => ({ url: "/org/units" }),
      providesTags: ["User"],
    }),
  }),
})

export const { useListOrgUnitsQuery } = orgApi


