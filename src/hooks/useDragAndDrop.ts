"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import type { Document, Folder } from "../data/mockData"

export interface DragItem {
  type: "document" | "folder"
  id: string
  data: Document | Folder
}

export interface DropTarget {
  type: "folder" | "root"
  id: string | null
  data?: Folder
}

export interface DragState {
  isDragging: boolean
  dragItem: DragItem | null
  dragPreview: string | null
  dropTarget: DropTarget | null
  isValidDrop: boolean
}

export function useDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragItem: null,
    dragPreview: null,
    dropTarget: null,
    isValidDrop: false,
  })

  const dragImageRef = useRef<HTMLElement | null>(null)

  // Start dragging
  const startDrag = useCallback((item: DragItem, event: React.DragEvent) => {
    setDragState((prev) => ({
      ...prev,
      isDragging: true,
      dragItem: item,
      dragPreview: item.type === "document" ? (item.data as Document).name : (item.data as Folder).name,
    }))

    // Set drag data for native drag/drop
    event.dataTransfer.setData("application/json", JSON.stringify(item))
    event.dataTransfer.effectAllowed = "move"

    // Create custom drag image if available
    if (dragImageRef.current) {
      event.dataTransfer.setDragImage(dragImageRef.current, 10, 10)
    }
  }, [])

  // Handle drag over
  const handleDragOver = useCallback(
    (target: DropTarget, event: React.DragEvent) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = "move"

      if (!dragState.dragItem) return

      // Validate drop target
      const isValid = validateDrop(dragState.dragItem, target)

      setDragState((prev) => ({
        ...prev,
        dropTarget: target,
        isValidDrop: isValid,
      }))
    },
    [dragState.dragItem],
  )

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear if we're leaving the drop zone entirely
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState((prev) => ({
        ...prev,
        dropTarget: null,
        isValidDrop: false,
      }))
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback(
    (target: DropTarget, event: React.DragEvent, onMove: (item: DragItem, target: DropTarget) => void) => {
      event.preventDefault()

      let dragItem: DragItem

      try {
        // Try to get drag item from state first, then from event data
        dragItem = dragState.dragItem || JSON.parse(event.dataTransfer.getData("application/json"))
      } catch (error) {
        console.error("Failed to parse drag data:", error)
        endDrag()
        return
      }

      if (!dragItem || !validateDrop(dragItem, target)) {
        endDrag()
        return
      }

      // Execute the move operation
      onMove(dragItem, target)
      endDrag()
    },
    [dragState.dragItem],
  )

  // End dragging
  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      dragItem: null,
      dragPreview: null,
      dropTarget: null,
      isValidDrop: false,
    })
  }, [])

  // Validate if drop is allowed
  const validateDrop = useCallback((dragItem: DragItem, target: DropTarget): boolean => {
    // Can't drop on itself
    if (dragItem.id === target.id) return false

    // Can't drop folder into its own child
    if (dragItem.type === "folder" && target.type === "folder") {
      const folder = dragItem.data as Folder
      const targetFolder = target.data as Folder

      // Check if target is a descendant of the dragged folder
      if (isDescendant(folder, targetFolder)) return false
    }

    // Documents can be dropped into folders or root
    if (dragItem.type === "document") {
      return target.type === "folder" || target.type === "root"
    }

    // Folders can be dropped into other folders or root
    if (dragItem.type === "folder") {
      return target.type === "folder" || target.type === "root"
    }

    return false
  }, [])

  // Check if targetFolder is a descendant of folder
  const isDescendant = (folder: Folder, targetFolder: Folder): boolean => {
    if (!folder.children) return false

    for (const child of folder.children) {
      if (child.id === targetFolder.id) return true
      if (isDescendant(child, targetFolder)) return true
    }

    return false
  }

  return {
    dragState,
    startDrag,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    endDrag,
    validateDrop,
    dragImageRef,
  }
}
