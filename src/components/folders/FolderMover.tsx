"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import {
  FolderIcon,
  FolderOpen,
  FileIcon,
  Search,
  ChevronRight,
  ChevronDown,
  Move,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useGetFolderTreeQuery, useMoveItemsMutation, type MoveOperation } from "../../store/api/foldersApi"
import type { Folder, Document } from "../../data/mockData"

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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {operation === "move" ? <Move className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            {operation === "move" ? "Move" : "Copy"} {items.length} item{items.length !== 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Items to move */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Items to {operation}:</h4>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Badge key={item.id} variant="outline" className="flex items-center gap-1">
                  {item.type === "folder" ? <FolderIcon className="h-3 w-3" /> : <FileIcon className="h-3 w-3" />}
                  {item.name}
                  {isProcessing && processedItems.has(item.id) && <CheckCircle className="h-3 w-3 text-green-500" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              disabled={isProcessing}
            />
          </div>

          {/* Destination selection */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Select destination:</h4>

            {/* Root folder option */}
            <div
              className={cn(
                "flex items-center py-2 px-3 rounded-md cursor-pointer transition-colors",
                "hover:bg-accent/50",
                selectedFolderId === null && "bg-accent text-accent-foreground",
              )}
              onClick={() => setSelectedFolderId(null)}
            >
              <FolderIcon className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Root Folder</span>
            </div>

            {/* Folder tree */}
            <ScrollArea className="h-64 border rounded-md p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredFolders && filteredFolders.length > 0 ? (
                <div className="space-y-1">
                  {filteredFolders.map((folder) => (
                    <FolderTreeItem
                      key={folder.id}
                      folder={folder}
                      level={0}
                      selectedFolderId={selectedFolderId}
                      onSelectFolder={setSelectedFolderId}
                      expandedFolders={expandedFolders}
                      onToggleExpanded={handleToggleExpanded}
                      disabledFolders={disabledFolders}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No folders found</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Selected destination info */}
          {selectedFolder && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">
                <span className="font-medium">Destination:</span> {selectedFolder.name}
              </p>
              <p className="text-xs text-muted-foreground">{selectedFolder.documentCount} documents</p>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{operation === "move" ? "Moving" : "Copying"} items...</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Errors occurred:</span>
              </div>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={items.length === 0 || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {operation === "move" ? "Moving..." : "Copying..."}
              </>
            ) : (
              <>
                {operation === "move" ? "Move" : "Copy"} {items.length} item{items.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
