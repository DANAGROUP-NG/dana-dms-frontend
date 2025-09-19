"use client"

import { useCallback, useMemo, useState } from "react"
import type { Folder } from "../data/mockData"

interface FolderNavigationState {
  currentFolderId: string | null
  navigationHistory: string[]
  historyIndex: number
}

export function useFolderNavigation(folders: Folder[]) {
  const [state, setState] = useState<FolderNavigationState>({
    currentFolderId: null,
    navigationHistory: ["/"], // Start with root
    historyIndex: 0,
  })

  // Build folder lookup map for efficient access
  const folderMap = useMemo(() => {
    const map = new Map<string, Folder>()

    const addToMap = (folders: Folder[]) => {
      folders.forEach((folder) => {
        map.set(folder.id, folder)
        if (folder.children) {
          addToMap(folder.children)
        }
      })
    }

    addToMap(folders)
    return map
  }, [folders])

  // Get current folder object
  const currentFolder = useMemo(() => {
    return state.currentFolderId ? folderMap.get(state.currentFolderId) : null
  }, [state.currentFolderId, folderMap])

  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!state.currentFolderId) return []

    const path: Array<{ id: string; name: string; path: string }> = []
    let currentId: string | null = state.currentFolderId

    while (currentId !== null) {
      const folder = folderMap.get(currentId)
      if (!folder) break

      path.unshift({
        id: folder.id,
        name: folder.name,
        path: `/folder/${folder.id}`,
      })

      currentId = folder.parentId ?? null
    }

    return path
  }, [state.currentFolderId, folderMap])

  // Navigate to folder
  const navigateToFolder = useCallback((folderId: string | null) => {
    setState((prev) => {
      const newPath = folderId ? `/folder/${folderId}` : "/"
      const newHistory = prev.navigationHistory.slice(0, prev.historyIndex + 1)
      newHistory.push(newPath)

      return {
        currentFolderId: folderId,
        navigationHistory: newHistory,
        historyIndex: newHistory.length - 1,
      }
    })
  }, [])

  // Navigate back
  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1
        const path = prev.navigationHistory[newIndex]
        const folderId = path === "/" ? null : path.split("/").pop() || null

        return {
          ...prev,
          currentFolderId: folderId,
          historyIndex: newIndex,
        }
      }
      return prev
    })
  }, [])

  // Navigate forward
  const goForward = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex < prev.navigationHistory.length - 1) {
        const newIndex = prev.historyIndex + 1
        const path = prev.navigationHistory[newIndex]
        const folderId = path === "/" ? null : path.split("/").pop() || null

        return {
          ...prev,
          currentFolderId: folderId,
          historyIndex: newIndex,
        }
      }
      return prev
    })
  }, [])

  // Check if can navigate
  const canGoBack = state.historyIndex > 0
  const canGoForward = state.historyIndex < state.navigationHistory.length - 1

  return {
    currentFolderId: state.currentFolderId,
    currentFolder,
    breadcrumbPath,
    navigationHistory: state.navigationHistory,
    canGoBack,
    canGoForward,
    navigateToFolder,
    goBack,
    goForward,
  }
}
