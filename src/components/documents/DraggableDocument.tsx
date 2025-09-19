"use client"

import type React from "react"

import { forwardRef } from "react"
import { FileIcon, ImageIcon, FileText, File } from "lucide-react"
import { cn } from "../../lib/utils"
import { useDragAndDrop, type DragItem } from "../../hooks/useDragAndDrop"
import type { Document } from "../../data/mockData"

interface DraggableDocumentProps {
  document: Document
  isSelected?: boolean
  onSelect?: (documentId: string, selected: boolean) => void
  className?: string
  children?: React.ReactNode
}

export const DraggableDocument = forwardRef<HTMLDivElement, DraggableDocumentProps>(
  ({ document, isSelected, onSelect, className, children }, ref) => {
    const { dragState, startDrag } = useDragAndDrop()

    const handleDragStart = (event: React.DragEvent) => {
      const dragItem: DragItem = {
        type: "document",
        id: document.id,
        data: document,
      }
      startDrag(dragItem, event)
    }

    const getFileIcon = () => {
      switch (document.type) {
        case "pdf":
          return <FileText className="h-4 w-4 text-red-500" />
        case "docx":
          return <FileText className="h-4 w-4 text-blue-500" />
        case "xlsx":
          return <FileIcon className="h-4 w-4 text-green-500" />
        case "pptx":
          return <FileIcon className="h-4 w-4 text-orange-500" />
        case "jpg":
        case "png":
          return <ImageIcon className="h-4 w-4 text-purple-500" />
        default:
          return <File className="h-4 w-4 text-gray-500" />
      }
    }

    const isDragging = dragState.dragItem?.id === document.id

    return (
      <div
        ref={ref}
        draggable
        onDragStart={handleDragStart}
        onClick={() => onSelect?.(document.id, !isSelected)}
        className={cn(
          "group flex items-center p-2 rounded-md cursor-pointer transition-all duration-200",
          "hover:bg-accent/50",
          isSelected && "bg-accent text-accent-foreground",
          isDragging && "opacity-50 scale-95",
          className,
        )}
      >
        {/* File Icon */}
        <div className="mr-2 flex-shrink-0">{getFileIcon()}</div>

        {/* Document Name */}
        <span className="flex-1 text-sm font-medium truncate">{document.name}</span>

        {/* File Size */}
        <span className="text-xs text-muted-foreground mr-2 flex-shrink-0">{document.size}</span>

        {children}
      </div>
    )
  },
)

DraggableDocument.displayName = "DraggableDocument"
