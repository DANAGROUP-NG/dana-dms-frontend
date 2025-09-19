"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"
import {
  addSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  setDefaultSearch,
  clearDefaultSearch,
  loadSavedSearches,
  setLoading,
  setError,
  type SavedSearch,
} from "../store/slices/savedSearchesSlice"

const SAVED_SEARCHES_KEY = "dms_saved_searches"

export function useSavedSearches() {
  const dispatch = useDispatch<AppDispatch>()
  const { searches, isLoading, error } = useSelector((state: RootState) => state.savedSearches)

  // Load saved searches from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        dispatch(setLoading(true))
        const stored = localStorage.getItem(SAVED_SEARCHES_KEY)
        if (stored) {
          const parsedSearches: SavedSearch[] = JSON.parse(stored)
          dispatch(loadSavedSearches(parsedSearches))
        } else {
          dispatch(loadSavedSearches([]))
        }
      } catch (error) {
        console.error("Failed to load saved searches:", error)
        dispatch(setError("Failed to load saved searches"))
      }
    }

    loadFromStorage()
  }, [dispatch])

  // Save to localStorage whenever searches change
  useEffect(() => {
    if (searches.length > 0 || localStorage.getItem(SAVED_SEARCHES_KEY)) {
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches))
    }
  }, [searches])

  const saveSearch = (searchData: Omit<SavedSearch, "id" | "createdAt" | "updatedAt">) => {
    try {
      dispatch(addSavedSearch(searchData))
    } catch (error) {
      console.error("Failed to save search:", error)
      dispatch(setError("Failed to save search"))
    }
  }

  const updateSearch = (id: string, updates: Partial<SavedSearch>) => {
    try {
      dispatch(updateSavedSearch({ id, updates }))
    } catch (error) {
      console.error("Failed to update search:", error)
      dispatch(setError("Failed to update search"))
    }
  }

  const deleteSearch = (id: string) => {
    try {
      dispatch(deleteSavedSearch(id))
    } catch (error) {
      console.error("Failed to delete search:", error)
      dispatch(setError("Failed to delete search"))
    }
  }

  const setAsDefault = (id: string) => {
    try {
      dispatch(setDefaultSearch(id))
    } catch (error) {
      console.error("Failed to set default search:", error)
      dispatch(setError("Failed to set default search"))
    }
  }

  const clearDefault = () => {
    try {
      dispatch(clearDefaultSearch())
    } catch (error) {
      console.error("Failed to clear default search:", error)
      dispatch(setError("Failed to clear default search"))
    }
  }

  const getDefaultSearch = () => {
    return searches.find((search) => search.isDefault)
  }

  const searchExists = (name: string) => {
    return searches.some((search) => search.name.toLowerCase() === name.toLowerCase())
  }

  return {
    searches,
    isLoading,
    error,
    saveSearch,
    updateSearch,
    deleteSearch,
    setAsDefault,
    clearDefault,
    getDefaultSearch,
    searchExists,
  }
}
