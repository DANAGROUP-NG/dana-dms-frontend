"use client"

import { useState } from "react"
import { Download, Trash2, FolderOpen, Tag, X, ChevronDown, Archive, Share } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { BulkOperationsDialog } from "./BulkOperationsDialog"
import type { Document, Folder } from "../../data/mockData"

interface BulkActionsProps {
  selectedDocuments: Document[]
  folders: Folder[]
  onClearSelection: () => void
  onBulkOperation: (operation: string, data?: any) => void
}

export function BulkActions({ selectedDocuments, folders, onClearSelection, onBulkOperation }: BulkActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<string | null>(null)

  if (selectedDocuments.length === 0) return null

  const handleOperation = (operation: string) => {
    setCurrentOperation(operation)
    setDialogOpen(true)
  }

  const handleConfirm = (operation: string, data?: any) => {
    onBulkOperation(operation, data)
    setDialogOpen(false)
    setCurrentOperation(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
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

      <BulkOperationsDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        operation={currentOperation as any}
        selectedDocuments={selectedDocuments}
        folders={folders}
        onConfirm={handleConfirm}
      />
    </>
  )
}
