import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: {
    type?: string[]
    author?: string[]
    dateRange?: {
      from: string
      to: string
    }
    tags?: string[]
    folder?: string
  }
  createdAt: string
  updatedAt: string
  isDefault?: boolean
}

interface SavedSearchesState {
  searches: SavedSearch[]
  isLoading: boolean
  error: string | null
}

const initialState: SavedSearchesState = {
  searches: [],
  isLoading: false,
  error: null,
}

const savedSearchesSlice = createSlice({
  name: "savedSearches",
  initialState,
  reducers: {
    addSavedSearch: (state, action: PayloadAction<Omit<SavedSearch, "id" | "createdAt" | "updatedAt">>) => {
      const now = new Date().toISOString()
      const newSearch: SavedSearch = {
        ...action.payload,
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      }
      state.searches.push(newSearch)
      state.error = null
    },
    updateSavedSearch: (state, action: PayloadAction<{ id: string; updates: Partial<SavedSearch> }>) => {
      const { id, updates } = action.payload
      const searchIndex = state.searches.findIndex((search) => search.id === id)
      if (searchIndex !== -1) {
        state.searches[searchIndex] = {
          ...state.searches[searchIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        state.error = null
      }
    },
    deleteSavedSearch: (state, action: PayloadAction<string>) => {
      state.searches = state.searches.filter((search) => search.id !== action.payload)
      state.error = null
    },
    setDefaultSearch: (state, action: PayloadAction<string>) => {
      state.searches.forEach((search) => {
        search.isDefault = search.id === action.payload
      })
      state.error = null
    },
    clearDefaultSearch: (state) => {
      state.searches.forEach((search) => {
        search.isDefault = false
      })
      state.error = null
    },
    loadSavedSearches: (state, action: PayloadAction<SavedSearch[]>) => {
      state.searches = action.payload
      state.isLoading = false
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  addSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  setDefaultSearch,
  clearDefaultSearch,
  loadSavedSearches,
  setLoading,
  setError,
  clearError,
} = savedSearchesSlice.actions

export default savedSearchesSlice.reducer
