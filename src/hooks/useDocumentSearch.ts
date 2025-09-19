"use client"

import { useMemo } from "react"
import type { Document } from "../data/mockData"
import type { DocumentFilters } from "../store/api/documentsApi"

export function useDocumentSearch(documents: Document[], filters: DocumentFilters) {
  return useMemo(() => {
    let filtered = [...documents]

    // Text search
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.author.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // File type filter
    if (filters.type) {
      const types = filters.type.split(",")
      filtered = filtered.filter((doc) => types.includes(doc.type))
    }

    // Status filter
    if (filters.status) {
      const statuses = filters.status.split(",")
      filtered = filtered.filter((doc) => statuses.includes(doc.status))
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((doc) => filters.tags!.some((tag) => doc.tags.includes(tag)))
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.modified)
        const startDate = new Date(start)
        const endDate = new Date(end)
        return docDate >= startDate && docDate <= endDate
      })
    }

    // Folder filter
    if (filters.folderId) {
      filtered = filtered.filter((doc) => doc.folderId === filters.folderId)
    }

    return filtered
  }, [documents, filters])
}
