"use client"

import { useState, useCallback } from "react"
import type { MoveItem } from "../components/folders/FolderMover"
import type { Folder, Document } from "../data/mockData"

export function useFolderMover() {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<MoveItem[]>([])
  const [operation, setOperation] = useState<"move" | "copy">("move")

  const openMover = useCallback((itemsToMove: MoveItem[], operationType: "move" | "copy" = "move") => {
    setItems(itemsToMove)
    setOperation(operationType)
    setIsOpen(true)
  }, [])

  const closeMover = useCallback(() => {
    setIsOpen(false)
    setItems([])
  }, [])

  // Helper functions to create MoveItem from different data types
  const moveFolder = useCallback(
    (folder: Folder, operationType: "move" | "copy" = "move") => {
      const moveItem: MoveItem = {
        type: "folder",
        id: folder.id,
        name: folder.name,
        data: folder,
      }
      openMover([moveItem], operationType)
    },
    [openMover],
  )

  const copyFolder = useCallback(
    (folder: Folder) => {
      moveFolder(folder, "copy")
    },
    [moveFolder],
  )

  const moveDocument = useCallback(
    (document: Document, operationType: "move" | "copy" = "move") => {
      const moveItem: MoveItem = {
        type: "document",
        id: document.id,
        name: document.name,
        data: document,
      }
      openMover([moveItem], operationType)
    },
    [openMover],
  )

  const copyDocument = useCallback(
    (document: Document) => {
      moveDocument(document, "copy")
    },
    [moveDocument],
  )

  const moveMultiple = useCallback(
    (folders: Folder[] = [], documents: Document[] = [], operationType: "move" | "copy" = "move") => {
      const folderItems: MoveItem[] = folders.map((folder) => ({
        type: "folder",
        id: folder.id,
        name: folder.name,
        data: folder,
      }))

      const documentItems: MoveItem[] = documents.map((document) => ({
        type: "document",
        id: document.id,
        name: document.name,
        data: document,
      }))

      const allItems = [...folderItems, ...documentItems]
      if (allItems.length > 0) {
        openMover(allItems, operationType)
      }
    },
    [openMover],
  )

  return {
    // State
    isOpen,
    items,
    operation,

    // Actions
    openMover,
    closeMover,
    moveFolder,
    copyFolder,
    moveDocument,
    copyDocument,
    moveMultiple,
  }
}
