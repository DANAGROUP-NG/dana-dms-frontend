"use client"

import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  FolderIcon,
  FolderOpen,
  Loader2,
  Move,
  Search
} from "lucide-react"
import React, { useEffect, useState } from "react"
import type { Document, Folder } from "../../data/mockData"
import { cn } from "../../lib/utils"
import { useGetFolderTreeQuery, useMoveItemsMutation, type MoveOperation } from "../../store/api/foldersApi"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Progress } from "../ui/progress"
import { ScrollArea } from "../ui/scroll-area"

export interface MoveItem {
  type: "document" | "folder"
  id: string
  name: string
  data: Document | Folder
}

interface FolderMoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: MoveItem[]
  operation: "move" | "copy"
  onComplete?: () => void
}

interface FolderTreeItemProps {
  folder: Folder
  level: number
  selectedFolderId: string | null
  onSelectFolder: (folderId: string | null) => void
  expandedFolders: Set<string>
  onToggleExpanded: (folderId: string) => void
  disabledFolders: Set<string>
}

function FolderTreeItem({
  folder,
  level,
  selectedFolderId,
  onSelectFolder,
  expandedFolders,
  onToggleExpanded,
  disabledFolders,
}: FolderTreeItemProps) {
  const isExpanded = expandedFolders.has(folder.id)
  const isSelected = selectedFolderId === folder.id
  const isDisabled = disabledFolders.has(folder.id)
  const hasChildren = folder.children && folder.children.length > 0

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-2 px-3 rounded-md cursor-pointer transition-colors",
          "hover:bg-accent/50",
          isSelected && "bg-accent text-accent-foreground",
          isDisabled && "opacity-50 cursor-not-allowed",
          level > 0 && "ml-4",
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => !isDisabled && onSelectFolder(folder.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded(folder.id)
            }}
            className="mr-1 p-0.5 hover:bg-accent rounded"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}

        {!hasChildren && <div className="w-4 mr-1" />}

        <div className="mr-2">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <FolderIcon className="h-4 w-4 text-blue-500" />
          )}
        </div>

        <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>

        <Badge variant="secondary" className="text-xs">
          {folder.documentCount}
        </Badge>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {folder.children!.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              expandedFolders={expandedFolders}
              onToggleExpanded={onToggleExpanded}
              disabledFolders={disabledFolders}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderMover({ open, onOpenChange, items, operation, onComplete }: FolderMoverProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedItems, setProcessedItems] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<string[]>([])

  const { data: folderTree, isLoading } = useGetFolderTreeQuery()
  const [moveItems] = useMoveItemsMutation()

  // Calculate disabled folders (can't move folder into itself or its children)
  const disabledFolders = React.useMemo(() => {
    const disabled = new Set<string>()

    items.forEach((item) => {
      if (item.type === "folder") {
        disabled.add(item.id)

        // Add all descendant folders
        const addDescendants = (folder: Folder) => {
          if (folder.children) {
            folder.children.forEach((child) => {
              disabled.add(child.id)
              addDescendants(child)
            })
          }
        }

        addDescendants(item.data as Folder)
      }
    })

    return disabled
  }, [items])

  // Filter folders based on search
  const filteredFolders = React.useMemo(() => {
    if (!folderTree || !searchQuery) return folderTree

    const filterFolders = (folders: Folder[]): Folder[] => {
      return folders.reduce((acc: Folder[], folder) => {
        const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase())
        const filteredChildren = folder.children ? filterFolders(folder.children) : []

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...folder,
            children: filteredChildren,
          })
        }

        return acc
      }, [])
    }

    return filterFolders(folderTree)
  }, [folderTree, searchQuery])

  // Auto-expand folders when searching
  useEffect(() => {
    if (searchQuery && filteredFolders) {
      const expandAll = (folders: Folder[]) => {
        folders.forEach((folder) => {
          if (folder.children && folder.children.length > 0) {
            setExpandedFolders((prev) => new Set([...prev, folder.id]))
            expandAll(folder.children)
          }
        })
      }
      expandAll(filteredFolders)
    }
  }, [searchQuery, filteredFolders])

  const handleToggleExpanded = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const handleMove = async () => {
    if (items.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setProcessedItems(new Set())
    setErrors([])

    try {
      const operations: MoveOperation[] = items.map((item) => ({
        itemType: item.type,
        itemId: item.id,
        targetFolderId: selectedFolderId,
      }))

      // Simulate progress for each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        try {
          // Process individual item (in real app, this might be separate API calls)
          await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate processing time

          setProcessedItems((prev) => new Set([...prev, item.id]))
          setProgress(((i + 1) / items.length) * 100)
        } catch (error) {
          setErrors((prev) => [...prev, `Failed to ${operation} ${item.name}`])
        }
      }

      // Execute the actual move operation
      await moveItems(operations).unwrap()

      // Complete
      setTimeout(() => {
        setIsProcessing(false)
        onComplete?.()
        onOpenChange(false)
      }, 500)
    } catch (error) {
      setErrors((prev) => [...prev, `Failed to ${operation} items`])
      setIsProcessing(false)
    }
  }

  const selectedFolder = React.useMemo(() => {
    if (!selectedFolderId || !folderTree) return null

    const findFolder = (folders: Folder[]): Folder | null => {
      for (const folder of folders) {
        if (folder.id === selectedFolderId) return folder
        if (folder.children) {
          const found = findFolder(folder.children)
          if (found) return found
        }
      }
      return null
    }

    return findFolder(folderTree)
  }, [selectedFolderId, folderTree])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="folder-mover-description">
        <DialogHeader>
          <DialogTitle>
            {operation === "move" ? "Move" : "Copy"} {items.length > 1 ? "Items" : items[0]?.type === "folder" ? "Folder" : "Document"}
          </DialogTitle>
          <div id="folder-mover-description" className="sr-only">
            {operation === "move" ? "Move" : "Copy"} {items.length} {items.length > 1 ? "items" : items[0]?.type === "folder" ? "folder" : "document"} to a new location
          </div>
        </DialogHeader>

        {/* Search and folder tree */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="border rounded-md h-64 overflow-hidden">
            <ScrollArea className="h-full p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredFolders && filteredFolders.length > 0 ? (
                <div>
                  {/* Root folder option */}
                  <div
                    className={cn(
                      "flex items-center py-2 px-3 rounded-md cursor-pointer transition-colors",
                      "hover:bg-accent/50",
                      selectedFolderId === null && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setSelectedFolderId(null)}
                  >
                    <FolderIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="flex-1 text-sm font-medium">Root</span>
                  </div>

                  {/* Folder tree */}
                  {filteredFolders.map((folder) => (
                    <FolderTreeItem
                      key={folder.id}
                      folder={folder}
                      level={0}
                      selectedFolderId={selectedFolderId}
                      onSelectFolder={setSelectedFolderId}
                      expandedFolders={expandedFolders}
                      onToggleExpanded={(folderId) => {
                        setExpandedFolders((prev) => {
                          const newSet = new Set(prev)
                          if (newSet.has(folderId)) {
                            newSet.delete(folderId)
                          } else {
                            newSet.add(folderId)
                          }
                          return newSet
                        })
                      }}
                      disabledFolders={disabledFolders}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  No folders found
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Progress indicator for ongoing operations */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {operation === "move" ? "Moving" : "Copying"} {processedItems.size} of {items.length} items...
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />

            {errors.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Errors occurred:</span>
                </div>
                <ul className="text-xs text-red-600 space-y-1 ml-6 list-disc">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {operation === "move" ? <Move className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {operation === "move" ? "Move" : "Copy"} to Selected Folder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
