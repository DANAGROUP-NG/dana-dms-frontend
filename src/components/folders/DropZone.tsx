"use client"

import type React from "react"

import { useState } from "react"
import { FolderPlus, Upload } from "lucide-react"
import { cn } from "../../lib/utils"
import { useDragAndDrop, type DragItem, type DropTarget } from "../../hooks/useDragAndDrop"
import type { Folder } from "../../data/mockData"

interface DropZoneProps {
  folder?: Folder | null
  onMove: (item: DragItem, target: DropTarget) => void
  onUpload?: (files: File[], folderId?: string) => void
  className?: string
  children?: React.ReactNode
}

export function DropZone({ folder, onMove, onUpload, className, children }: DropZoneProps) {
  const { dragState, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop()
  const [isDragOverFiles, setIsDragOverFiles] = useState(false)

  const target: DropTarget = {
    type: folder ? "folder" : "root",
    id: folder?.id || null,
    data: folder || undefined,
  }

  const handleDragOverZone = (event: React.DragEvent) => {
    event.preventDefault()

    // Check if dragging files from outside
    const hasFiles = Array.from(event.dataTransfer.types).includes("Files")

    if (hasFiles) {
      setIsDragOverFiles(true)
      event.dataTransfer.dropEffect = "copy"
    } else {
      handleDragOver(target, event)
    }
  }

  const handleDragLeaveZone = (event: React.DragEvent) => {
    setIsDragOverFiles(false)
    handleDragLeave(event)
  }

  const handleDropOnZone = (event: React.DragEvent) => {
    event.preventDefault()

    // Handle file uploads
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0 && onUpload) {
      onUpload(files, folder?.id)
      setIsDragOverFiles(false)
      return
    }

    // Handle internal drag/drop
    handleDrop(target, event, onMove)
    setIsDragOverFiles(false)
  }

  const isDraggedOver = dragState.dropTarget?.id === target.id && dragState.isValidDrop
  const showDropIndicator = isDraggedOver || isDragOverFiles

  return (
    <div
      onDragOver={handleDragOverZone}
      onDragLeave={handleDragLeaveZone}
      onDrop={handleDropOnZone}
      className={cn(
        "relative transition-all duration-200",
        showDropIndicator && "bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg",
        className,
      )}
    >
      {children}

      {/* Drop Indicator Overlay */}
      {showDropIndicator && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 border-2 border-blue-300 border-dashed rounded-lg pointer-events-none z-10">
          <div className="text-center">
            {isDragOverFiles ? (
              <>
                <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Drop files to upload</p>
                <p className="text-xs text-blue-600">{folder ? `to ${folder.name}` : "to root folder"}</p>
              </>
            ) : (
              <>
                <FolderPlus className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Drop to move here</p>
                <p className="text-xs text-blue-600">{folder ? `to ${folder.name}` : "to root folder"}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
