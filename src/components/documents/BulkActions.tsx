"use client"

import { Archive, ChevronDown, Download, FolderOpen, Share, Tag, Trash2, X } from "lucide-react"
import { useState } from "react"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
// Removed BulkOperationsDialog to simplify bulk actions UX
import type { Document, Folder } from "../../data/mockData"

interface BulkActionsProps {
  selectedDocuments: Document[]
  folders: Folder[]
  onClearSelection: () => void
  onBulkOperation: (operation: string, data?: any) => void
}

export function BulkActions({ selectedDocuments, folders, onClearSelection, onBulkOperation }: BulkActionsProps) {
  const [currentOperation, setCurrentOperation] = useState<string | null>(null)

  if (selectedDocuments.length === 0) return null

  const handleOperation = (operation: string) => {
    setCurrentOperation(operation)
    // Lightweight handling without a dialog. For operations requiring details,
    // call onBulkOperation immediately and let parent handle any follow-up UI.
    if (operation === "delete") {
      const confirmed = window.confirm(`Delete ${selectedDocuments.length} selected document(s)?`)
      if (!confirmed) return
      onBulkOperation("delete")
      setCurrentOperation(null)
      return
    }
    if (operation === "archive") {
      const confirmed = window.confirm(`Archive ${selectedDocuments.length} selected document(s)?`)
      if (!confirmed) return
      onBulkOperation("archive")
      setCurrentOperation(null)
      return
    }
    if (operation === "download") {
      onBulkOperation("download")
      setCurrentOperation(null)
      return
    }
    // For move, tag, share: delegate to parent to present UI if needed
    onBulkOperation(operation)
    setCurrentOperation(null)
  }

  const handleConfirm = (operation: string, data?: any) => {
    onBulkOperation(operation, data)
    setCurrentOperation(null)
  }

  // Check permissions for bulk operations
  const canDelete = selectedDocuments.every((doc) => doc.permissions.canDelete)
  const canShare = selectedDocuments.every((doc) => doc.permissions.canShare)
  const canEdit = selectedDocuments.some((doc) => doc.permissions.canWrite)

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <Badge variant="secondary" className="font-medium">
          {selectedDocuments.length} selected
        </Badge>

        <div className="flex items-center gap-1 ml-2">
          <Button size="sm" variant="outline" onClick={() => handleOperation("download")}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Actions
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleOperation("move")}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Move to folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOperation("tag")}>
                <Tag className="mr-2 h-4 w-4" />
                Add tags
              </DropdownMenuItem>
              {canShare && (
                <DropdownMenuItem onClick={() => handleOperation("share")}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleOperation("archive")}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem onClick={() => handleOperation("delete")} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button size="sm" variant="ghost" onClick={onClearSelection} className="ml-auto">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Dialog removed; parent component can render context-specific UIs when needed */}
    </>
  )
}
