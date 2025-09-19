"use client"

import type React from "react"

import { forwardRef } from "react"
import { FolderIcon, FolderOpen } from "lucide-react"
import { cn } from "../../lib/utils"
import { useDragAndDrop, type DragItem, type DropTarget } from "../../hooks/useDragAndDrop"
import type { Folder } from "../../data/mockData"

interface DraggableFolderProps {
  folder: Folder
  isExpanded?: boolean
  isSelected?: boolean
  onMove: (item: DragItem, target: DropTarget) => void
  onSelect?: (folderId: string) => void
  className?: string
  children?: React.ReactNode
}

export const DraggableFolder = forwardRef<HTMLDivElement, DraggableFolderProps>(
  ({ folder, isExpanded, isSelected, onMove, onSelect, className, children }, ref) => {
    const { dragState, startDrag, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop()

    const handleDragStart = (event: React.DragEvent) => {
      const dragItem: DragItem = {
        type: "folder",
        id: folder.id,
        data: folder,
      }
      startDrag(dragItem, event)
    }

    const handleDragOverFolder = (event: React.DragEvent) => {
      const target: DropTarget = {
        type: "folder",
        id: folder.id,
        data: folder,
      }
      handleDragOver(target, event)
    }

    const handleDropOnFolder = (event: React.DragEvent) => {
      const target: DropTarget = {
        type: "folder",
        id: folder.id,
        data: folder,
      }
      handleDrop(target, event, onMove)
    }

    const isDraggedOver = dragState.dropTarget?.id === folder.id && dragState.isValidDrop
    const isDragging = dragState.dragItem?.id === folder.id

    return (
      <div
        ref={ref}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOverFolder}
        onDragLeave={handleDragLeave}
        onDrop={handleDropOnFolder}
        onClick={() => onSelect?.(folder.id)}
        className={cn(
          "group flex items-center p-2 rounded-md cursor-pointer transition-all duration-200",
          "hover:bg-accent/50",
          isSelected && "bg-accent text-accent-foreground",
          isDraggedOver && "bg-blue-100 border-2 border-blue-400 border-dashed",
          isDragging && "opacity-50 scale-95",
          className,
        )}
      >
        {/* Folder Icon */}
        <div className="mr-2 flex-shrink-0">
          {isExpanded ? <FolderOpen className="h-4 w-4" /> : <FolderIcon className="h-4 w-4" />}
        </div>

        {/* Folder Name */}
        <span className="flex-1 text-sm font-medium truncate">{folder.name}</span>

        {/* Document Count */}
        <span className="text-xs text-muted-foreground mr-2 flex-shrink-0">{folder.documentCount}</span>

        {/* Drop Indicator */}
        {isDraggedOver && (
          <div className="absolute inset-0 bg-blue-100/50 border-2 border-blue-400 border-dashed rounded-md pointer-events-none" />
        )}

        {children}
      </div>
    )
  },
)

DraggableFolder.displayName = "DraggableFolder"
